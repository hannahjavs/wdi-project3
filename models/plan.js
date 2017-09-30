const mongoose = require('mongoose');

const itemSchema = new mongoose.Schema({
  place: { type: mongoose.Schema.ObjectId, ref: 'Place', required: true },
  time: Date
});

const planSchema =  new mongoose.Schema({
  name: { type: String, required: true },
  items: [ itemSchema ]
});

module.exports = mongoose.model('Plan', planSchema);