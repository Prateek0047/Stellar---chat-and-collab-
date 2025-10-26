// backend/src/models/User.js
import bcrypt from "bcryptjs";
import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      // Do NOT set `required: true` here
      // Validation handled conditionally below
    },
    bio: {
      type: String,
      default: "",
    },
    profilePic: {
      type: String,
      default: "",
    },
    nativeLanguage: {
      type: String,
      default: "",
    },
    learningLanguage: {
      type: String,
      default: "",
    },
    location: {
      type: String,
      default: "",
    },
    isOnboarded: {
      type: Boolean,
      default: false,
    },
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    friends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
  },
  { timestamps: true }
);

// 🔐 Custom validation: only require password if NOT email-verified (i.e., not OAuth)
userSchema.path("password").validate(function (value) {
  // If user is new AND has no password AND email is NOT verified → require password
  if (
    this.isNew &&
    (value === undefined || value === null || value === "") &&
    !this.isEmailVerified
  ) {
    return false;
  }
  // If password is provided, must be at least 6 chars
  if (value && value.length < 6) {
    return false;
  }
  return true;
}, "Password is required for email/password signup and must be at least 6 characters.");

// Hash password only if it exists and is modified
userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false; // OAuth users have no password
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model("User", userSchema);
export default User;
