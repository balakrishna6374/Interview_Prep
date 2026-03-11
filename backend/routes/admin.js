const express = require('express');
const router = express.Router();

const { protect, authorize } = require('../middleware/auth');

const {
  getAllUsers,
  getUserById,
  deleteUser,
  getAllQuestions,
  getSystemAnalytics,
  updateUser
} = require('../controllers/adminController');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.delete('/users/:id', deleteUser);

router.get('/questions', getAllQuestions);

router.get('/analytics', getSystemAnalytics);

module.exports = router;