const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const FiltersSchema = new Schema({
  age: {
    type: Number,
    trim: true
  },
  vaccinetype: {
    type: String,
    trim: true
  },
  feetype: {
    type: String,
    trim: true
  }
});

module.exports = FiltersSchema;