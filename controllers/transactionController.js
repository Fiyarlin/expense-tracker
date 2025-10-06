const Transaction = require('../models/Transaction');

/**
 * GET /api/transactions
 * return all transactions sorted by date descending
 */
exports.getTransactions = async (req, res, next) => {
  try {
    const transactions = await Transaction.find().sort({ createdAt: -1 });
    res.json({ success: true, count: transactions.length, data: transactions });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/transactions
 * body { text, amount }
 */
exports.addTransaction = async (req, res, next) => {
  try {
    const { text, amount } = req.body;

    // Basic validation
    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Text is required' });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({ success: false, error: 'Amount must be a number' });
    }

    const transaction = await Transaction.create({
      text: text.trim(),
      amount: Number(amount)
    });

    res.status(201).json({ success: true, data: transaction });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/transactions/:id
 */
exports.deleteTransaction = async (req, res, next) => {
  try {
    const id = req.params.id;
    const transaction = await Transaction.findById(id);
    if (!transaction) {
      return res.status(404).json({ success: false, error: 'Transaction not found' });
    }
    await transaction.deleteOne();
    res.json({ success: true, data: {} });
  } catch (err) {
    next(err);
  }
};
