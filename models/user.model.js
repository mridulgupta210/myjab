const mongoose = require('mongoose');

const Filters = require('./filters.model');

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
  districts: [{
    type: Number,
    trim: true
  }],
  filters: Filters
}, {
  timestamps: true,
});

const User = mongoose.model(process.env.MODEL_NAME || 'User', userSchema);

module.exports = User;