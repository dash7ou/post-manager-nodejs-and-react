const express = require("express");
const { body } = require("express-validator");
const feedController = require("../controllers/feed");
const Auth = require("../middleware/auth");

const router = express.Router();

// GET /feed/posts
router.get("/posts", Auth, feedController.getPosts);

// POST /feed/post
router.post(
  "/post",
  Auth,
  [
    body("title")
      .trim()
      .isLength({ min: 5, max: 50 }),
    body("content")
      .trim()
      .isLength({ min: 5, max: 200 })
  ],
  feedController.createPost
);

router.get("/post/:postId", Auth, feedController.getAny);

router.put(
  "/post/:postId",
  Auth,
  [
    body("title")
      .trim()
      .isLength({ min: 5, max: 50 }),
    body("content")
      .trim()
      .isLength({ min: 5, max: 200 })
  ],
  feedController.updatePost
);

router.delete("/post/:postId", Auth, feedController.deletePost);

module.exports = router;
