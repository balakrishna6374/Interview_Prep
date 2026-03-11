const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const groqService = require('../services/groqService');
const { body, validationResult } = require('express-validator');

router.post('/generate-questions', protect, [
  body('topic').notEmpty().withMessage('Topic is required'),
  body('category').isIn(['Technical', 'Behavioral', 'System Design']).withMessage('Invalid category'),
  body('difficulty').isIn(['Easy', 'Medium', 'Hard']).withMessage('Invalid difficulty'),
  body('count').optional().isInt({ min: 1, max: 10 }).withMessage('Count must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { topic, category, difficulty } = req.body;
    const count = Number(req.body.count) || 5;

    const questions = await groqService.generateQuestions(topic, category, difficulty, count);

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Generate questions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate questions'
    });
  }
});

router.post('/mock-interview', protect, [
  body('role').notEmpty().withMessage('Role is required'),
  body('focusAreas').isArray().withMessage('Focus areas must be an array'),
  body('count').optional().isInt({ min: 1, max: 10 }).withMessage('Count must be between 1 and 10')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { role, focusAreas } = req.body;
    const count = Number(req.body.count) || 5;

    const questions = await groqService.generateMockInterviewQuestions(role, focusAreas, count);

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Mock interview generation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to generate mock interview questions'
    });
  }
});

router.post('/evaluate-answer', protect, [
  body('question').isObject().withMessage('Question object is required'),
  body('answer').notEmpty().withMessage('Answer is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { question, answer } = req.body;

    const evaluation = await groqService.evaluateAnswer(question, answer);

    res.status(200).json({
      success: true,
      data: evaluation
    });
  } catch (error) {
    console.error('Evaluate answer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to evaluate answer'
    });
  }
});

router.post('/explain-question', protect, [
  body('question').isObject().withMessage('Question object is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { question } = req.body;

    const explanation = await groqService.explainQuestion(question);

    res.status(200).json({
      success: true,
      data: explanation
    });
  } catch (error) {
    console.error('Explain question error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to explain question'
    });
  }
});

router.post('/chat', protect, [
  body('message').notEmpty().withMessage('Message is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const message = req.body.message;
    const history = Array.isArray(req.body.history) ? req.body.history : [];

    const response = await groqService.chatbot(message, history);

    res.status(200).json({
      success: true,
      data: {
        message: response
      }
    });
  } catch (error) {
    console.error('Chatbot error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get response'
    });
  }
});

router.get('/behavioral-questions', protect, async (req, res) => {
  try {
    const questions = await groqService.getBehavioralQuestions();

    res.status(200).json({
      success: true,
      data: questions
    });
  } catch (error) {
    console.error('Behavioral questions error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to get behavioral questions'
    });
  }
});

router.post('/compare-answer', protect, [
  body('userAnswer').notEmpty().withMessage('User answer is required'),
  body('correctAnswer').notEmpty().withMessage('Correct answer is required'),
  body('question').notEmpty().withMessage('Question is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { userAnswer, correctAnswer, question } = req.body;

    const comparison = await groqService.compareAnswers(userAnswer, correctAnswer, question);

    res.status(200).json({
      success: true,
      data: comparison
    });
  } catch (error) {
    console.error('Compare answer error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to compare answers'
    });
  }
});

module.exports = router;