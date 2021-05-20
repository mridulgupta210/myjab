const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
  username: {
    type: String,
    required: true,
    trim: true,
    minlength: 3
  },
  email: {
    type: String,
    unique: true,
    required: true,
    trim: true
  },
  pincode: {
    type: Number,
    trim: true,
    minlength: 6,
    maxlength: 6
  },
  district: {
    type: Number,
    trim: true
  },
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

module.exports = User;