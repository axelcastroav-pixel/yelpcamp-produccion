const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({ 
    email: {
        type: String,
        required: true,
        unique: true
    }
    // No definimos username ni password aqui
//El plugin los va a agregar magicamente por nosotros
})
 
//Le inyectamos el plugin al esquema
UserSchema.plugin(passportLocalMongoose.default);

module.exports = mongoose.model('User' , UserSchema);