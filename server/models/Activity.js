import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: [true, "Action description is required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["Project", "Task"],
      required: true,
    },
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
  },
  { timestamps: true }
);

const Activity = mongoose.models.Activity || mongoose.model("Activity", activitySchema);
export default Activity;