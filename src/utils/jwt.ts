import jwt from "jsonwebtoken";
import env from "../config/env.ts";

export const generateAccessToken = (user : any) => {
  const payload = {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(
    payload,
    env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: env.ACCESS_TOKEN_EXPIRES_IN,
    }
  );
};

export const generateRefreshToken = (user : any) => {
  const payload = {
    id: String(user._id),
    email: user.email,
    role: user.role,
  };

  return jwt.sign(
    payload,
    env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: env.REFRESH_TOKEN_EXPIRES_IN,
    }
  );
};

export const verifyAccessToken = (token : string) => {
  return jwt.verify(
    token,
    env.ACCESS_TOKEN_SECRET
  );
};

export const verifyRefreshToken = (token : string) => {
  return jwt.verify(
    token,
    env.REFRESH_TOKEN_SECRET
  );
};