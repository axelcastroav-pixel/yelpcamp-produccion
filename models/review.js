const mongoose = require('mongoose');
const Schema = mongoose.Schema; /*Guardamos mongoose.Schema en una
//variable para escribir menos*/

const reviewSchema = new Schema({
     body: String,
     rating: Number,
     author: {
          type: Schema.Types.ObjectId,
          ref: 'User'
     }
});


module.exports = mongoose.model('Review' , reviewSchema)