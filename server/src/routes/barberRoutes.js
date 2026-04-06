const express = require('express');
const { getBarbers, createBarber, updateBarber, deleteBarber } = require('../controllers/barberController');

const router = express.Router();

router.get('/', getBarbers);
router.post('/', createBarber);
router.put('/:id', updateBarber);
router.delete('/:id', deleteBarber);

module.exports = router;
