const express = require("express");
const router = express.Router();
const { User } = require("../models/user");
const { body } = require("express-validator");
const authControllers = require("../controllers/auth");

router.put(
  "/signup",
  [
    body("email")
      .isEmail()
      .withMessage("Please Enter a valid email")
      .custom(async (value, { req }) => {
        const user = await User.findOne({ email: value });
        if (user) {
          return Promise.reject("E-mail address already exists!");
        }
      })
      .normalizeEmail(),
    body("password")
      .trim()
      .isLength({ min: 5 })
      .withMessage("Please Enter a valid password"),
    body("name")
      .isLength({ min: 3 })
      .trim()
      .isString()
      .not()
      .isEmpty()
  ],
  authControllers.singup
);

router.post("/login", [], authControllers.login);

module.exports = router;
