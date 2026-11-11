const BaseJoi = require('joi');
const sanitizeHtml = require('sanitize-html');

const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: {
        'string.escapeHTML': '¡Oye! El campo {{#label}} no debe incluir etiquetas HTML o scripts.'
    },
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                // sanitizeHtml limpia el texto. Le decimos que NO permita NINGUNA etiqueta ni atributo.
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                // Si el texto limpio es diferente al original, significa que intentaron inyectar código.
                if (clean !== value) return helpers.error('string.escapeHTML', { value })
                return clean;
            }
        }
    }
});

// 1. INYECTAMOS LOS SUPERPODERES PRIMERO (Debe ir antes de armar los esquemas)
const Joi = BaseJoi.extend(extension);

// 2. APLICAMOS EL ESCUDO (.escapeHTML()) A LOS CAMPOS DE TEXTO
module.exports.campgroundSchema = Joi.object({
    campground: Joi.object({
        title: Joi.string().required().escapeHTML(),       // <-- Escudo activado
        price: Joi.number().required().min(0),
        location: Joi.string().required().escapeHTML(),    // <-- Escudo activado
        description: Joi.string().required().escapeHTML()  // <-- Escudo activado
    }).required(),

    deleteImages: Joi.array()
});

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        rating: Joi.number().required().min(1).max(5),
        body: Joi.string().required().escapeHTML()         // <-- Escudo activado
    }).required()
});