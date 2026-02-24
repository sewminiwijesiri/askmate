import mongoose from "mongoose";

const YearSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Year || mongoose.model("Year", YearSchema);
