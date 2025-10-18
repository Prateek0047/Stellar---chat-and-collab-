import "dotenv/config";
import { StreamChat } from "stream-chat";

const apiKey = process.env.STREAM_API_KEY;
const apiSecret = process.env.STREAM_API_SECRET;

if (!apiKey || !apiSecret) {
  console.error("Stream API key or secret is missing");
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

export const generateStreamToken = (userID) => {
  if (!streamClient) {
    throw new Error("Stream client not initialized");
  }
  return streamClient.createToken(userID);
};
