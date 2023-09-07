import mongoose from "mongoose";

const communitySchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  threads: [
    { //One user can have multiple references to specific threads stored in db
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    }, 
  ],
  members: [
    {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }
  ]
});

// For the first time there will be no mongoose.models.user so the User will be created with userSchema. Afterwards, it will refer to mongoose.models.user and update user accordingly
const Community = mongoose.models.Community || mongoose.model('Community', communitySchema);

export default Community;
