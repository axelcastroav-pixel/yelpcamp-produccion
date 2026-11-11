const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Review = require('./review');

// 1. Extraemos la estructura de la imagen a su propio mini-esquema
const ImageSchema = new Schema({
    url: String,
    filename: String
});

// 2. Le inyectamos el "poder fantasma" para pedirla en miniatura
ImageSchema.virtual('thumbnail').get(function() {
    return this.url.replace('/upload', '/upload/w_200');
});

// 3. Tu esquema principal queda casi igual, pero ahora ensambla el ImageSchema
const CampgroundSchema = new Schema({
    title: String,
    images: [ImageSchema],
    
    // --- ESTE ES EL BLOQUE QUE DEBE ESTAR ---
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    // ---------------------------------------

    price: Number,
    description: String,
    location: String,
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    reviews: [
        {
            type: Schema.Types.ObjectId,
            ref: 'Review' 
        }
    ]
});


// Middleware 'post' que se detona tras findOneAndDelete
CampgroundSchema.post('findOneAndDelete', async function (doc) {
    if (doc) {
        await Review.deleteMany({
            _id: {
                $in: doc.reviews
            }
        });
    }
});

module.exports = mongoose.model('Campground' , CampgroundSchema);