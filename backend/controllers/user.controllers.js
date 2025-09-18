import User from "../model/user.model.js";
import geminiResponse from "../utils/geminiResponse.js";
import uploadOnCloudinary from "../config/cloudinary.js";

// ----------------- GET CURRENT USER -----------------
export const getCurrentUser = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "Current user fetched", user });
  } catch (error) {
    console.error("Error fetching current user:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------- UPDATE ASSISTANT -----------------
export const updateAssistant = async (req, res) => {
  try {
    const { assistant, imageUrl } = req.body;
    let assistantImage = imageUrl;
    if (req.file) {
      assistantImage = await uploadOnCloudinary(req.file.path);
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { assistantName: assistant, assistantImage },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json({ message: "Assistant updated", user });
  } catch (error) {
    console.error("Error updating assistant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// ----------------- ASK TO ASSISTANT (CORRECTED) -----------------
export const askToAssistant = async (req, res) => {
  try {
    const { command } = req.body;
    const user = await User.findById(req.userId);

    if (!user) return res.status(404).json({ message: "User not found" });

    // Call our smart geminiResponse utility function which now returns a clean object
    const geminiResult = await geminiResponse(
      command,
      user.assistantName,
      user.name
    );

    if (!geminiResult) {
      // If Gemini failed, return a structured fallback response
      return res.status(500).json({
        type: "general",
        language: "en",
        response: "Sorry, I couldn't process that right now.",
      });
    }

    // The logic is now clean: just send the perfect object from Gemini to the frontend.
    console.log("✅ Sending clean object to frontend:", geminiResult);
    return res.status(200).json(geminiResult);

  } catch (error) {
    console.error("Error in askToAssistant:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};