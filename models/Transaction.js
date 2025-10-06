const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  text: {
    type: String,
    required: [true, 'Please add a text/description'],
    trim: true,
    maxlength: [100, 'Description too long']
  },
  amount: {
    type: Number,
    required: [true, 'Please add a positive or negative amount'],
    validate: {
      validator: (v) => typeof v === 'number' && !isNaN(v) && isFinite(v),
      message: 'Amount must be a valid number'
    }
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Transaction', TransactionSchema);
