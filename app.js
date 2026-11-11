// ==========================================
// 1. IMPORTACIONES NATIVAS Y DE TERCEROS
// ==========================================

if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}



const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const ejsMate = require('ejs-mate');
const methodOverride = require('method-override');
const session = require('express-session');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const helmet = require('helmet')
const { MongoStore } = require('connect-mongo');


// ==========================================
// 2. IMPORTACIONES PROPIAS (UTILS, MODELS)
// ==========================================
const User = require('./models/user')
const ExpressError = require('./utils/ExpressError');
const sanitizeV5 = require('./utils/mongoSanitizeV5.js');

// ==========================================
// 3. IMPORTACIONES DE RUTAS
// ==========================================
const campgroundsRoutes = require('./routes/campgrounds');
const reviewsRoutes = require('./routes/reviews');
const userRoutes = require('./routes/user')

// ==========================================
// 4. CONEXIÓN A BASE DE DATOS
// ==========================================
const dbUrl = process.env.DB_URL || 'mongodb://127.0.0.1:27017/yelp-camp';

async function conectarBD() {
    try {
        await mongoose.connect(dbUrl);
        console.log("Conexion a MongoDB exitosa");
    } catch (err) {
        console.error("Error al conectar a MongoDB ", err);
    }
}
conectarBD();

// ==========================================
// INICIALIZAR LA APLICACIÓN DE EXPRESS
// ==========================================
const app = express();
app.set('query parser', 'extended');

// ==========================================
// 5. CONFIGURACIONES Y MIDDLEWARES GLOBALES
// ==========================================

// --- Configuraciones de la app (Settings) ---
app.engine('ejs', ejsMate);
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// --- Middlewares globales ---
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static(path.join(__dirname, 'public')));

app.use(sanitizeV5({ replaceWith: '_' }));

//-- Configuración de express-session y connect-flash ---

const secret = process.env.SECRET || 'thisshouldbeabettersecret!';

 const store = MongoStore.create({ 
    mongoUrl: dbUrl,
    touchAfter: 24*60*60,
    crypto: {
        secret: secret
    }
 })

 store.on("error" , function(e) {
    console.log("Error en el Sesion Store de Mongo" , e);
 });

 const sessionConfig = {
    store,
    name: 'session',
    secret: secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true, // Candado de seguridad para que no roben la cookie con F12
        // Date.now() es el tiempo actual. Le sumamos los milisegundos de 1 semana
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, 
        maxAge: 1000 * 60 * 60 * 24 * 7 // Tiempo máximo de vida: 1 semana
    }
 }

app.use(session(sessionConfig));
app.use(flash());




// -- Configuracion de passport -- //

// 1. Inicializa Passport y conectalo con las sesiones de express
app.use(passport.initialize());
app.use(passport.session());

// 2. Le decimos a Passport que use la estrategia Local y el metodo de autenticacion de nuestro Modelo
passport.use(new LocalStrategy(User.authenticate()))

// 3. Le ensenamos a Passport como "empaquetar" (serialize) al usuario en la sesion y como desempaquetarlo (deserialize)
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.use((req,res,next) => {
    //Estas variables estaran disponibles en TODOS los .ejs
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})


// ==========================================
// Configuracion de Helmet:
// ==========================================

// 1. LAS LISTAS VIP DE PERMISOS (CSP)
const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com/",
    "https://kit.fontawesome.com/",
    "https://cdnjs.cloudflare.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com/",
    "https://stackpath.bootstrapcdn.com/",
    "https://fonts.googleapis.com/",
    "https://use.fontawesome.com/",
    "https://cdn.jsdelivr.net/",
    "https://cdn.maptiler.com/",
];
const connectSrcUrls = [
    "https://api.maptiler.com/",
];
const fontSrcUrls = [];


// 2. ACTIVACIÓN DEL ESCUDO CSP EN HELMET
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/gokgtyni/", // Tu nube personal de Cloudinary
                "https://images.unsplash.com/",
                "https://api.maptiler.com/",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);





















// ==========================================
// 6. RUTAS DE NAVEGACIÓN
// ==========================================

//Tolo lo que empiece con / va a router/userRoutes
app.use('/', userRoutes);

// Todo lo que empiece con /campgrounds irá al router/campgroundsRoutes.js
app.use('/campgrounds', campgroundsRoutes);

// Todo lo que empiece con /campgrounds/:id/reviews va a routes/reviewsRoutes.js
app.use('/campgrounds/:id/reviews', reviewsRoutes);

//Ruta principal de la pagina de inicio (Home)
app.get('/' , (req,res) => {
    res.render('home')
})



// ==========================================
// 7. MANEJO DE ERRORES
// ==========================================

// Ruta que atrapa cualquier request no coincidente y genera un error 404
app.use((req, res, next) => {
    next(new ExpressError('Page Not Found', 404));
});

// Middleware final de manejo de errores
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = '¡Oh no, algo salió muy mal!';
    
    // Regresamos a la normalidad: solo pasamos { err }
    res.status(statusCode).render('campgrounds/error', { err });
});

// ==========================================
// 8. ARRANCAR EL SERVIDOR
// ==========================================
app.listen(3000, () => {
    console.log('Sirviendo YelpCamp en el puerto 3000');
});