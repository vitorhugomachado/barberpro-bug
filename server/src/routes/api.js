const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');

const authRoutes = require('./authRoutes');
const barberRoutes = require('./barberRoutes');
const { getServices, createService, updateService, deleteService } = require('../controllers/serviceController');
const { getAppointments, createAppointment, updateAppointment } = require('../controllers/appointmentController');
const { getProducts, createProduct, deleteProduct, updateProduct, getSales, createSale } = require('../controllers/productController');
const { getBusinessInfo, updateBusinessInfo } = require('../controllers/businessController');

const router = express.Router();

// Public Routes
router.use('/auth', authRoutes);
router.get('/services', getServices);
router.get('/business', getBusinessInfo);
router.post('/appointments', createAppointment); // Public booking

// Protected Routes (Require Login)
router.use('/barbers', barberRoutes);
router.get('/appointments', authMiddleware, getAppointments);
router.patch('/appointments/:id', authMiddleware, updateAppointment);

router.post('/services', authMiddleware, createService);
router.put('/services/:id', authMiddleware, updateService);
router.delete('/services/:id', authMiddleware, deleteService);

router.get('/products', authMiddleware, getProducts);
router.post('/products', authMiddleware, createProduct);
router.put('/products/:id', authMiddleware, updateProduct);
router.delete('/products/:id', authMiddleware, deleteProduct);
router.get('/sales', authMiddleware, getSales);
router.post('/sales', authMiddleware, createSale);

router.put('/business', authMiddleware, updateBusinessInfo);

module.exports = router;

