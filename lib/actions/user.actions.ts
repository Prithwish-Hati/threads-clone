"use server";

import { revalidatePath } from "next/cache";
import User from "../models/user.model";
import { connectToDB } from "../mongoose";
import Thread from "../models/thread.model";
import { FilterQuery, SortOrder, _FilterQuery } from "mongoose";

interface Params {
  userId: string;
  username: string;
  name: string;
  bio: string;
  image: string;
  path: string;
}

export async function UpdateUser({
  userId,
  username,
  name,
  bio,
  image,
  path,
}: Params): Promise<void> {
  connectToDB();

  try {
    //finds the first document that matches the filter and applies update
    await User.findOneAndUpdate(
      { id: userId },
      {
        username: username.toLowerCase(),
        name,
        bio,
        image,
        onboarded: true,
      },
      { upsert: true } //upsert -> update and insert
    );

    if (path === "/profile/edit") {
      revalidatePath(path); //Updates cached data without waiting for a revalidation period to expire
    }
  } catch (error: any) {
    throw new Error(`Failed to create/update user: ${error.message}`);
  }
}

export async function fetchUser(userId: string) {
  try {
    connectToDB();

    return await User.findOne({ id: userId }); //Finds the user in db
    // .populate({
    //   path: "communities",
    //   model: Community
    // })
  } catch (error: any) {
    throw new Error(`Failed to fetch user: ${error.message}`);
  }
}

export async function fetchUserPosts(userId: string) {
  try {
    connectToDB();

    //Find all threads authored by the user with the given userId
    const threads = await User.findOne({ id: userId }).populate({
      path: "threads",
      model: Thread,
      populate: {
        //Thread Comments
        path: "children",
        model: Thread,
        populate: {
          // To know the author of child threads
          path: "author",
          model: User,
          select: "name image id",
        },
      },
    });

    return threads;
  } catch (error: any) {
    throw new Error(`Failed to fetch user posts: ${error.message}`);
  }
}

export async function fetchAllUsers({
  userId,
  searchString = "",
  pageNumber = 1,
  pageSize = 20,
  sortBy = "desc",
}: {
  userId: string;
  searchString?: string;
  pageNumber?: number;
  pageSize?: number;
  sortBy?: SortOrder;
}) {
  try {
    connectToDB();

    const skipAmount = (pageNumber - 1) * pageSize;

    const regex = new RegExp(searchString, "i"); //case insensitive search

    const query: FilterQuery<typeof User> = {
      id: { $ne: userId }, //$ne -> Not Equals to... To filter out the current user
    };

    if (searchString.trim() !== "") {
      query.$or = [
        { username: { $regex: regex } }, //Searching username
        { name: { $regex: regex } }, //Searching name
      ];
    }

    const sortOptions = { createdAt: sortBy };

    const usersQuery = User.find(query)
      .sort(sortOptions)
      .skip(skipAmount)
      .limit(pageSize);

    const totalUsersCount = await User.countDocuments(query);

    const users = await usersQuery.exec();

    const isNext = totalUsersCount > skipAmount + users.length;

    return { users, isNext };
  } catch (error: any) {
    throw new Error(`Failed to fetch users: ${error.message}`);
  }
}

//ChatGPT Explanation: This function helps someone find all the comments they received on their posts from others. It gathers all the comments from different places, puts them together with concat(), and shows them to the person. 👇🏽
export async function getActivity(userId: string) {
  try {
    connectToDB();

    //Find all threads created by the currentUser
    const userThreads = await Thread.find({ author: userId });

    //Collect all the child thread ids from the children field
    const childThreadIds = userThreads.reduce((acc, userThread) => {
      return acc.concat(userThread.children);
    }, []);

    //Collect all the replies excluding those which are made by the currentUser
    const replies = await Thread.find({
      _id: { $in: childThreadIds },
      author: { $ne: userId },
    }).populate({
      path: "author",
      model: User,
      select: "name image _id",
    });

    return replies;
  } catch (error: any) {
    throw new Error(`Failed to fetch activity: ${error.message}`);
  }
}
