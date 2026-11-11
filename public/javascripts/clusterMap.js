maptilersdk.config.apiKey = maptilerApiKey;

const map = new maptilersdk.Map({
    container: 'cluster-map',
    style: maptilersdk.MapStyle.WINTER, // Un estilo de mapa diferente para variar
    center: [-103.5917, 40.6699], // Centrado en Norteamérica
    zoom: 3
});

// Cuando el mapa termine de cargar, le agregamos los datos
map.on('load', function () {
    
    // 1. Cargamos nuestra base de datos completa de campamentos
    map.addSource('campgrounds', {
        type: 'geojson',
        data: campgrounds,
        cluster: true,
        clusterMaxZoom: 14, // Hasta qué nivel de zoom seguir agrupando
        clusterRadius: 50 // El radio de absorción de cada burbuja
    });

    // 2. Capa de los Círculos Agrupados (Clusters)
    map.addLayer({
        id: 'clusters',
        type: 'circle',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        paint: {
            // Cambia el color dependiendo de cuántos campamentos haya agrupados
            'circle-color': [
                'step',
                ['get', 'point_count'],
                '#00BCD4', // Color si hay menos de 10
                10,
                '#2196F3', // Color si hay entre 10 y 30
                30,
                '#3F51B5'  // Color si hay más de 30
            ],
            'circle-radius': [
                'step',
                ['get', 'point_count'],
                15, // Tamaño en pixeles (menos de 10)
                10,
                20, // Tamaño (entre 10 y 30)
                30,
                25  // Tamaño (más de 30)
            ]
        }
    });

    // 3. Capa del Número de texto dentro del círculo
    map.addLayer({
        id: 'cluster-count',
        type: 'symbol',
        source: 'campgrounds',
        filter: ['has', 'point_count'],
        layout: {
            'text-field': '{point_count_abbreviated}',
            'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
            'text-size': 12
        }
    });

    // 4. Capa de los Campamentos Individuales (Cuando ya no están agrupados)
    map.addLayer({
        id: 'unclustered-point',
        type: 'circle',
        source: 'campgrounds',
        filter: ['!', ['has', 'point_count']],
        paint: {
            'circle-color': '#11b4da',
            'circle-radius': 6,
            'circle-stroke-width': 1,
            'circle-stroke-color': '#fff'
        }
    });
});