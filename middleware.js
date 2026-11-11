const Campground = require('./models/campground')
const Review = require('./models/review');
const ExpressError = require('./utils/ExpressError');
const { campgroundSchema, reviewSchema } = require('./schemas.js')


module.exports.isLoggedIn = (req,res,next) => {
    //Si no esta autenticado
    if (!req.isAuthenticated()) 
    {
        req.session.returnTo = req.originalUrl; // <--- ANOTA LA RUTA AQUÍ
        req.flash('error' , '¡Debes iniciar sesion primero!');
        return res.redirect('/login');
    }
    // Si SI está autenticado, lo dejamos pasar a la ruta que pidió
    next();
}

module.exports.storeReturnTo = (req, res, next) => {
    if (req.session.returnTo) {
        res.locals.returnTo = req.session.returnTo; // Pasa de la sesión a la mochila
    }
    next();
}

module.exports.isAuthor = async (req,res,next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground.author.equals(req.user._id)) {
        req.flash('error' , 'No tienes permiso para hacer eso!');
        return res.redirect (`/campgrounds/${id}`)
    }
    next();
}


module.exports.validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        
        // Ponemos el micrófono aquí:
        console.log("TEXTO DE JOI DETECTADO:", msg); 
        
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.validateReview = (req, res, next) => {
    const { error } = reviewSchema.validate(req.body);
    if (error) {
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
}

module.exports.isReviewAuthor = async (req, res, next) => {
    const { id, reviewId } = req.params; // Sacamos ambos IDs de la URL
    const review = await Review.findById(reviewId); // Buscamos la reseña
    
    if (!review.author.equals(req.user._id)) {
        req.flash('error', '¡No tienes permiso para hacer eso!');
        return res.redirect(`/campgrounds/${id}`);
    }
    next();
};