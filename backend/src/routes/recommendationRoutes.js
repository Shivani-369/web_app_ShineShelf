const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendationController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/user', authMiddleware, recommendationController.getPersonalizedRecommendations);
router.get('/book/:bookId', recommendationController.getSimilarBooks);

module.exports = router;
