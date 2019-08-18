const { User } = require("../models/user");
const { validationResult } = require("express-validator");

exports.singup = async (req, res, next) => {
  try {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      const error = new Error("validation failed");
      error.statusCode = 422;
      error.data = errors.array;
      throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;

    const user = new User({
      name: name,
      email: email,
      password: password,
      posts: []
    });

    await user.save();
    res.status(201).send({
      message: "User created!",
      userId: user._id
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};

exports.login = async (req, res, next) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    const user = await User.findUserToSignin(email, password);

    const token = user.generateJsonToken();

    res.status(200).send({
      token: token,
      userId: user._id.toString()
    });
  } catch (err) {
    if (!err.statusCode) {
      err.statusCode = 500;
    }
    next(err);
  }
};
