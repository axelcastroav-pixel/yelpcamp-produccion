const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../utils/catchAsync');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage }) //Le decimos a Multer que use tu caja de Cloudinary

// Middlewares personalizados para validacion
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');

// Agrupamos la ruta raíz '/'
router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'),validateCampground, catchAsync(campgrounds.createCampground));

// 'new' debe ir antes de '/:id' para que Express no piense que la palabra "new" es un ID
router.get('/new', isLoggedIn, campgrounds.renderNewForm);

// Agrupamos las rutas de un campamento específico '/:id'
router.route('/:id')
    .get(catchAsync(campgrounds.showCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'),validateCampground, catchAsync(campgrounds.updateCampgrounds))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampgrounds));

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;