const Campground = require('../models/campground');
const { cloudinary } = require('../cloudinary');
const maptilerClient = require("@maptiler/client");
maptilerClient.config.apiKey = process.env.MAPTILER_API_KEY;

module.exports.index = async (req,res) => {
    const campgrounds = await Campground.find({});
    res.render('campgrounds/index', {campgrounds})
}

module.exports.renderNewForm = (req,res) => {
    res.render('campgrounds/new');
}

module.exports.createCampground = async (req,res) => {

    // --- NUEVO: 1. Llamamos a MapTiler antes que nada ---
    // Le mandamos el texto que escribió el usuario (ej. "Ensenada") y pedimos 1 solo resultado
    const geoData = await maptilerClient.geocoding.forward(req.body.campground.location, { limit: 1 });

    // TRAMPA DE DEBUGGIN
    console.log('LO QUE MAPTILER RESPONDE' , geoData.features[0]?.geometry)

    // 2. Creas la instancia del campamento con los datos del formulario
    const campground = new Campground(req.body.campground);
    
    // --- NUEVO: 3. Pegamos las coordenadas en el campamento ---
    campground.geometry = geoData.features[0].geometry;
    
    // 4. Mapeamos las imágenes de req.files y las asignamos al campamento
    campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
    
    // 5. Magia de Passport: Asigno el Id del usuario logueado al autor
    campground.author = req.user._id;
    
    // 6. Guardo con Mongoose
    await campground.save();
    
    // TEMPORAL: Esto nos va a servir muchísimo para ver el GeoJSON en tu terminal
    console.log("GUARDADO EN MONGOOSE:", campground);
    
    // 7. DISPARO EL FLASH
    req.flash('success' , '!Campamento creado exitosamente!')
    
    // 8. LLevo al usuario a la pagina de detalles del nuevo campamento
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.showCampground = async (req,res) => {
    const campground = await Campground.findById(req.params.id).populate({
        path: 'reviews',
        populate: {
            path: 'author' // <-- Esto trae al autor de cada reseña
        }
    }).populate('author'); // <-- Esto trae al autor del campamento
    
    // ... lo demás se queda igual
    res.render('campgrounds/show', {campground})
}

module.exports.renderEditForm = async (req,res) => {
    const campground = await Campground.findById(req.params.id)
    res.render('campgrounds/edit', {campground})
}

module.exports.updateCampgrounds = async(req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground})
    
    // 1. Inyectas las fotos nuevas (si es que subió alguna)
    const imgs = req.files.map(f => ({ url: f.path, filename: f.filename }));
    campground.images.push(...imgs);
    await campground.save();

    // 2. LA NUEVA LÓGICA DE DESTRUCCIÓN
    if (req.body.deleteImages) {
        // Borramos de Cloudinary
        for (let filename of req.body.deleteImages) {
            await cloudinary.uploader.destroy(filename);
        }
        // Borramos de Mongo
        await campground.updateOne({ 
            $pull: { images: { filename: { $in: req.body.deleteImages } } } 
        });
    }

    req.flash('success' , '!Campamento actualizado exitosamente!');
    res.redirect(`/campgrounds/${campground._id}`);
}


module.exports.deleteCampgrounds = async (req,res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id)
    req.flash('success' , '!Campamento borrado exitosamente!')
    res.redirect(`/campgrounds`)
}