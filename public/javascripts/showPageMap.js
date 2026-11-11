// Usamos las variables que definiremos previamente en el EJS
maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'map', 
    style: maptilersdk.MapStyle.STREETS, 
    center: campground.geometry.coordinates, 
    zoom: 10 
});

// 1. Creamos el popup con HTML inyectando el título y la ubicación
const popup = new maptilersdk.Popup({ offset: 25 })
    .setHTML(
        `<h3>${campground.title}</h3><p>${campground.location}</p>`
    );

// 2. Al marcador original le encadenamos el método .setPopup()
new maptilersdk.Marker()
    .setLngLat(campground.geometry.coordinates)
    .setPopup(popup) // <-- ¡Esta es la línea clave!
    .addTo(map);