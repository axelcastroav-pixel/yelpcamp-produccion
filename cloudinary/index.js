const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// 1. Configuramos Cloudinary con las llaves de tu bóveda secreta
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// 2. Instanciamos el almacenamiento diciéndole a Multer dónde y cómo guardar
const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'YelpCamp', // Así se llamará la carpeta dentro de tu cuenta de Cloudinary
        allowedFormats: ['jpeg', 'png', 'jpg'] // Restringimos los tipos de archivo
    }
});

// 3. Exportamos ambas cosas para poder usarlas en nuestras rutas
module.exports = {
    cloudinary,
    storage
}