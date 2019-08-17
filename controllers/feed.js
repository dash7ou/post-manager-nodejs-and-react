const { validationResult } = require("express-validator");
const { Post } = require("../models/post");
const fs = require("fs");
const path = require("path");

exports.getPosts = async (req, res, next) => {
  const posts = await Post.find();
  try {
    if (!posts) {
      const error = new Error("There are no post");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({
      message: "successful in fetching data",
      posts: posts
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
      creator: {
        _id: "1",
        name: "dash"
      },
      imageUrl: imageUrl,
      createAt: Date.now()
    });
    await post.save();

    res.status(201).json({
      message: "Post created successfully!",
      post: post
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

    const updatePost = await Post.findById(postId);
    if (!updatePost) {
      const error = new Error("No product with that id.");
      error.statusCode = 404;
      throw error;
    }
    console.log(req.file.path);

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

    await updatePost.save();

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
