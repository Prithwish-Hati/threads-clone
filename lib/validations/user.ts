import * as z from 'zod';

export const UserValidation = z.object({
    profile_photo: z.string().url().nonempty(), //Ensures profile_photo to be a string of type 'url' which shouldn't be empty
    name: z.string().min(3).max(30),
    username: z.string().min(3).max(30),
    bio: z.string().min(3).max(1000),
})