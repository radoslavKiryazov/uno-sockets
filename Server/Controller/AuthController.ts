import User from "../Models/UserModel";
import bcrypt from "bcryptjs";
import { errorHandler } from "../Utilities/error";
import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const signup = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  // Data from the client
  const { username, password } = req.body;

  // Hashing the password
  const hashedPassword = bcrypt.hashSync(password, 10);

  //Creating a new user
  const newUser = new User({
    username,
    // email: 'test@test.com',
    password: hashedPassword,
  });

  try {
    await newUser.save();

    res.status(201).json({
      success: true,
      message: "User Created Successfully !",
    });
  } catch (error) {
    next(error);
  }
};

export const signin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { username, password } = req.body;

  try {
    const validUser = await User.findOne({ username });
    if (!validUser) {
      return next(errorHandler("User Not Found"));
    }

    const validPassword = bcrypt.compareSync(password, validUser.password);
    if (!validPassword) {
      return next(errorHandler("Invalid Password"));
    }

    const token = jwt.sign(
      {
        id: validUser._id,
      },
      process.env.JWT_SECRET as string
    );

    res
      .cookie("access_token", token, {
        httpOnly: true,
      })
      .status(200)
      .json(validUser);
  } catch (error) {
    // console.log(error);
    next(error);
  }
};

export const signout = (req: Request, res: Response, next: NextFunction) => {
  try {
    res.clearCookie("access_token");
    res.status(200).json({
      message: "User has been logged out !",
    });
  } catch (error) {
    next(error);
  }
};
