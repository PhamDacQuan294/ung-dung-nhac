import mongoose from "mongoose";

const singerSchema = new mongoose.Schema(
  {
    fullName: String,
    avatar: String,
    status: String,
    slug: String,
    createdBy: {
      account_id: String,
      createdAt: {
        type: Date,
        default: Date.now
      }
    },
    deleted: {
      type: Boolean,
      default: false,
    },
    deletedBy: {
      account_id: String,
      deletedAt: Date
    },
    updatedBy: [
      {
        account_id: String, 
        updatedAt: Date
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Singer = mongoose.model("Singer", singerSchema, "singers");

export default Singer;