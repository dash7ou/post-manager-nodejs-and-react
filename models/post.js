const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    createAt: {
      type: Date,
      default: Date.now(),
      required: true
    },
    content: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 500
    },
    imageUrl: {
      type: String,
      required: true
    },
    title: {
      type: String,
      required: true,
      minlength: 5,
      maxlength: 50
    },
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: true
  }
);

const Post = mongoose.model("Post", postSchema);
exports.Post = Post;
