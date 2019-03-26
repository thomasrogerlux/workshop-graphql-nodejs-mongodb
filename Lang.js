const mongoose = require("mongoose");

const LangSchema = new mongoose.Schema(
  {
    name: { type: String },
    ext: { type: String }
  },
  {
    collection: "lang"
  }
);

module.exports = mongoose.model("Lang", LangSchema);
