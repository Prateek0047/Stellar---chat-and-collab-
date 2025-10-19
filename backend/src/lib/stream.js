import "dotenv/config";
import { StreamChat } from "stream-chat";

// ✅ Use correct env variable names (STREAM, not STEAM)
const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

// ✅ Match the variable names correctly
if (!apiKey || !apiSecret) {
  console.error("Stream API key or Secret is missing");
}

const streamClient = StreamChat.getInstance(apiKey, apiSecret);

export const upsertStreamUser = async (userData) => {
  try {
    await streamClient.upsertUsers([userData]);
    return userData;
  } catch (error) {
    console.log("Error upserting Stream User:", error);
  }
};

// ✅ Generate token
export const generateStreamToken = (userID) => {
  try {
    const userIdStr = userID.toString();
    return streamClient.createToken(userIdStr);
  } catch (error) {
    console.log("Error generating Stream token:", error);
  }
};
