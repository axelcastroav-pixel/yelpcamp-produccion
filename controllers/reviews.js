const Campground = require('../models/campground.js');
const Review = require('../models/review.js');



module.exports.createReview = async(req,res) => {
    //1-Encontramos el campamento al que le vamos a colgar la resena
    const campground = await Campground.findById(req.params.id);

    //2 Creamos la resena usando los datos del formulario(gracias a review[rating] y review[body])
    const review = new Review(req.body.review)

    //INYECTAMOS EL AUTOR A LA RESEÑA
    review.author = req.user._id;

    //3 Conectamos la resena al campamento (con push)
    campground.reviews.push(review);

    //4 Guardamos ambos en la BD
    await review.save();
    await campground.save();

    //5 Redirigimos de vuelta a la pagina del campamento para ver el resultado
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.deleteReview = async (req, res) => {
    const { id, reviewId } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId} });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/campgrounds/${id}`);
}