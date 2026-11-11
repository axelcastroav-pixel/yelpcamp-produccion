const User = require('../models/user');

module.exports.renderRegister = (req, res) => {
    res.render('users/register');
}

module.exports.register = async (req, res, next) => {
    try {
        const { email, username, password } = req.body;
        const user = new User({ email, username });
        const registeredUser = await User.register(user, password);
        
        // Logueamos al usuario automáticamente después de registrarse
        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash('success', '¡Bienvenido a YelpCamp!');
            res.redirect('/campgrounds');
        });
    } catch (e) {
        req.flash('error', e.message);
        res.redirect('register');
    }
}

module.exports.renderLogin = (req, res) => {
    res.render('users/login');
}

module.exports.login = (req, res) => {
    req.flash('success', '¡Qué bueno verte de nuevo!');
    // Si el usuario intentaba ir a una ruta protegida, lo regresamos ahí. Si no, a campgrounds.
    const redirectUrl = res.locals.returnTo || '/campgrounds';
    res.redirect(redirectUrl);
}

module.exports.logout = (req, res, next) => {
    // En las versiones nuevas de Passport, logout requiere un callback
    req.logout(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('success', '¡Adiós, vuelve pronto!');
        res.redirect('/campgrounds');
    });
}