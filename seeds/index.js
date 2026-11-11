// 1-Importacion de modulos (nativos y de terceros)
const mongoose = require ('mongoose');

// 2- Importaciones de mis propios modulos
const Campground = require ('../models/campground');
const cities = require('./cities')
const { places, descriptors } = require('./seedHelpers')

// 3- Conexion a base de datos
async function conectarBD()
{
    try
    {
        await mongoose.connect('mongodb://127.0.0.1:27017/yelp-camp');
        console.log ("Conexion a MongoDB exitosa");
    }
    catch (err)
    {
        console.error("Error al conectar a MongoDB ",err)
    }
}
conectarBD();

const sample = array => array[Math.floor(Math.random()*array.length)]

const seedDB = async() => {
    await Campground.deleteMany({});
    
    for (let i=0; i<50;i++)
    {
        const random1000 = Math.floor(Math.random() * 1000)
        const price = Math.floor(Math.random()*20)+10
        
        const camp = new Campground({
            author: '6ae073e6a183342113d5fb87',
            location: `${cities[random1000].city} , ${cities[random1000].state}`,
            title: `${sample(descriptors)}, ${sample(places)}`,
            
            // --- ESTE ES EL BLOQUE NUEVO ---
            geometry: {
                type: "Point",
                coordinates: [
                    cities[random1000].longitude,
                    cities[random1000].latitude
                ]
            },
            // -------------------------------
            
            images: [
                {
                    url: 'https://res.cloudinary.com/gokgtyni/image/upload/v1793366460/YelpCamp/dlywhrcy2lho9xfvrfcy.jpg',
                    filename: 'YelpCamp/dlywhrcy2lho9xfvrfcy'
                },
                {
                    url: 'https://res.cloudinary.com/gokgtyni/image/upload/v1793366459/YelpCamp/czn2cdy9c9nm9moee8mp.jpg',
                    filename: 'YelpCamp/czn2cdy9c9nm9moee8mp'
                }
            ],
            description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Voluptatem voluptates possimus saepe laborum molestias, similique eius incidunt vel eligendi vitae minima iste corrupti odio placeat a ipsum error, at veritatis.',
            price
        })
        await camp.save();
    }
}

seedDB().then(() => {
    mongoose.connection.close();
});
