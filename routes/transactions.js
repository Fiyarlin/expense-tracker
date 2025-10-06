const express = require('express');
const router = express.Router();
const controller = require('../controllers/transactionController');

// GET all transactions
router.get('/', controller.getTransactions);

// POST add new transaction
router.post('/', controller.addTransaction);

// DELETE transaction by id
router.delete('/:id', controller.deleteTransaction);

module.exports = router;
