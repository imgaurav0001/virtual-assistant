import jwt from "jsonwebtoken";

const generateToken = (userId) => {
  try {
    const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "1d", // token valid for 1 day
    });
    return token;
  } catch (error) {
    console.error("Error generating token:", error);
    throw new Error("Internal server error");
  }
};

export default generateToken;
