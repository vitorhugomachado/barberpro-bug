const express = require('express');
const { getBarbers, createBarber, updateBarber, deleteBarber } = require('../controllers/barberController');
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

router.get('/', getBarbers);
router.post('/', authMiddleware, createBarber);
router.put('/:id', authMiddleware, updateBarber);
router.delete('/:id', authMiddleware, deleteBarber);

module.exports = router;
