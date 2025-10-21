import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    password: {
      type: String,
      required: true
      // Guardaremos hash, no contraseña en texto plano
    },
    role: {
      type: String,
      enum: ['admin', 'editor'],
      default: 'editor'
    }
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", userSchema);