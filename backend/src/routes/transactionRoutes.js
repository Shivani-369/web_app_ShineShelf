const express = require('express');
const router = express.Router();
const transactionController = require('../controllers/transactionController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/borrow', authMiddleware, transactionController.borrowBook);
router.post('/return/:transactionId', authMiddleware, transactionController.returnBook);

module.exports = router;
