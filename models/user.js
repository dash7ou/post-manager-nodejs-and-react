const mongoose = require("mongoose");
const hashit = require("bcryptjs");
const jwt = require("jsonwebtoken");

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

userSchema.statics.findUserToSignin = async (email, password) => {
  const user = await User.findOne({ email: email });
  if (!user) {
    throw new Error("Check you email and password");
  }
  isMatch = await hashit.compare(password, user.password);
  if (!isMatch) {
    throw new Error("Check you email and password");
  }

  return user;
};

userSchema.methods.generateJsonToken = function() {
  const user = this;
  const token = jwt.sign(
    { _id: user._id.toString() },
    "thisisnononenowhhahahhahahhaha",
    {
      expiresIn: "2h"
    }
  );
  return token;
};

const User = mongoose.model("User", userSchema);

exports.User = User;
