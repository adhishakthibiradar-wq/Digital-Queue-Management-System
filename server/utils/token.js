import jwt from "jsonwebtoken";

export const generateJwtToken = (user) => {
  const userId = user._id?.toString() || user.id?.toString();

  return jwt.sign(
    {
      id: userId,
      _id: userId,
      role: user.role,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};
