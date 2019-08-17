const { validationResult } = require("express-validator");
const { Post } = require("../models/post");

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
    const title = req.body.title;
    const content = req.body.content;
    const imageUrl = "images/jsimage.png";

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
      const error = new Error("Id you enter not valid.");
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
