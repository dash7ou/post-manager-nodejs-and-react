const { validationResult } = require("express-validator");
const { Post } = require("../models/post");
const fs = require("fs");
const path = require("path");
const { User } = require("../models/user");
const io = require("../sockerio");

exports.getPosts = async (req, res, next) => {
  try {
    const currentPage = req.query.page || 1;
    const perPage = 2;

    const totalItems = await Post.find().countDocuments();

    const posts = await Post.find()
      .populate("creator")
      .sort({ createAt: -1 })
      .skip((currentPage - 1) * perPage)
      .limit(perPage);

    if (!posts) {
      const error = new Error("There are no post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).send({
      message: "successful in fetching data",
      posts: posts,
      totalItems: totalItems
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.createPost = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("You are enter wrong data.");
      error.statusCode = 422;
      throw error;
    }
    if (!req.file) {
      const error = new Error("No image provided");
      error.statusCode = 422;
      throw error;
    }
    const imageUrl = req.file.path;
    const title = req.body.title;
    const content = req.body.content;

    if (!title || !content || !imageUrl) {
      const error = new Error("There are problem in enter data");
      error.statusCode = 422;
      throw error;
    }

    const post = await new Post({
      title: title,
      content: content,
      creator: req.userId,
      imageUrl: imageUrl,
      createAt: Date.now()
    });
    await post.save();
    const user = await User.findById(req.userId);

    user.posts.push(post);
    await user.save();
    io.getIo().emit("posts", {
      action: "created",
      post: { ...post._doc, creator: { _id: req.userId, name: user.name } }
    });
    res.status(201).json({
      message: "Post created successfully!",
      post: post,
      creator: { _id: user._id, name: user.name }
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.getAny = async (req, res, next) => {
  try {
    const id = req.params.postId;

    if (!id) {
      const error = new Error("Id you enter it not valid.");
      error.statusCode = 400;
      throw error;
    }
    const post = await Post.findById(id);
    if (!post) {
      const error = new Error("No post with this id.");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).send({
      message: "post fetch",
      post: post
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.updatePost = async (req, res, next) => {
  try {
    const allowUpdate = ["title", "image", "content"];
    const updates = Object.keys(req.body);

    const isValidate = updates.every(update => allowUpdate.includes(update));

    if (isValidate === false) {
      const error = new Error("invalidate operation!");
      error.statusCode = 404;
      throw error;
    }
    const title = req.body.title;

    const content = req.body.content;

    const postId = req.params.postId;
    if (!postId) {
      const error = new Error("No product with that id.");
      error.statusCode = 404;
      throw error;
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const error = new Error("There are problem in valid input");
      error.statusCode = 404;
      throw error;
    }

    let imageUrl = req.body.image;

    const updatePost = await Post.findById(postId).populate("creator");
    if (!updatePost) {
      const error = new Error("No product with that id.");
      error.statusCode = 404;
      throw error;
    }
    if (updatePost.creator._id.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    if (req.file) {
      deleteImage(updatePost.imageUrl);
      imageUrl = req.file.path;
    }
    if (!imageUrl) {
      const error = new Error("No attach file (image)");
      error.statusCode = 404;
      throw error;
    }
    updatePost.title = title;
    updatePost.content = content;
    updatePost.imageUrl = imageUrl;

    const result = await updatePost.save();
    io.getIo().emit("posts", { action: "updated", post: result });

    res.status(200).send({
      message: "update done.",
      post: updatePost
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

const deleteImage = filePath => {
  filePath = path.join(__dirname, "..", filePath);
  fs.unlink(filePath, err => console.log(err));
};

exports.deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;

    if (!postId) {
      const error = new Error("No product with that id.");
      error.statusCode = 404;
      throw error;
    }
    const post = await Post.findById(postId);
    if (!post) {
      const error = new Error("No product with that id.");
      error.statusCode = 404;
      throw error;
    }

    if (post.creator.toString() !== req.userId.toString()) {
      const error = new Error("Not authorized!");
      error.statusCode = 403;
      throw error;
    }

    await Post.deleteOne({ _id: postId });
    deleteImage(post.imageUrl);
    const user = await User.findById(req.userId);

    const indexDeleted = user.posts.indexOf(postId);
    user.posts.splice(indexDeleted, 1);
    await user.save();
    io.getIo().emit("posts", { action: "deleted", post: postId });
    res.status(200).send({
      message: "Delete post done"
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
