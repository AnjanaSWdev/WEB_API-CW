const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },

    role: {
      type: String,
      enum: ['national', 'provincial', 'district'],
      required: true
    },

    // Null for 'national' (unrestricted). Points to a Province._id for
    // 'provincial', or a District._id for 'district'. Which collection it
    // references is implied by `role` — validated in application logic,
    // not enforceable as a single Mongoose ref.
    jurisdictionId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);