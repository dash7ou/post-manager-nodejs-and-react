const mongoose = require("mongoose");
const hashit = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      required: true,
      type: String
    },
    status: {
      default: "Iam new!",
      type: String
    },
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post"
      }
    ]
  },
  {
    timestamps: true
  }
);

userSchema.pre("save", async function(next) {
  const user = this;
  if (user.isModified("password")) {
    user.password = await hashit.hash(user.password, 12);
  }
  next();
});

const User = mongoose.model("User", userSchema);

exports.User = User;
