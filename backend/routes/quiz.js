const express = require('express');
const QuizController = require('../controllers/QuizController');

const router = express.Router();

router.get('/question', QuizController.getQuestion);
router.post('/answer', QuizController.submitAnswer);
router.get('/stats', QuizController.getStats);

module.exports = router;