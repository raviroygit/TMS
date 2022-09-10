const mongoose = require("mongoose");
const { ObjectId } = mongoose.Schema;

const PermissionSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      unique: true,
      required: true,
    },
    features: {
      type: Array,
    },
    route: {
      type: Array
    }
  },
  { timestamps: true }
);

const permission = mongoose.model("permission", PermissionSchema);

module.exports = permission;
