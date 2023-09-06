import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  id: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  image: String,
  bio: String,
  threads: [
    { //One user can have multiple references to specific threads stored in db
      type: mongoose.Schema.Types.ObjectId,
      ref: "Thread",
    }, 
  ],
  onboarded: {
    type: Boolean,
    default: false,
  },
  communities: [
    { //One user can be in multiple communities that are stored in db
        type: mongoose.Schema.Types.ObjectId,
        ref: "Community"
    }
  ]
});

// For the first time there will be no mongoose.models.user so the User will be created with userSchema. Afterwards, it will refer to mongoose.models.user and update user accordingly
const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;
