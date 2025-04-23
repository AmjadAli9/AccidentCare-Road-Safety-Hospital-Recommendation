
let hospitalCache = {
    timestamp: 0,
    data: null,
    location: null,
};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

// Find nearby hospitals
async function findHospital() {
    const hospitalList = document.getElementById('hospitalList');
    hospitalList.innerHTML = '<div class="loading-spinner"></div><p style="color: #ffd700;">Finding nearby hospitals...</p>';

    if (!navigator.geolocation) {
        showError('Geolocation not supported by your browser');
        return;
    }

    try {
        // Get user's current location
        const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            });
        });

        const { latitude: lat, longitude: lon } = position.coords;
        initMap(lat, lon);

        // Check cache for recent data
        const now = Date.now();
        if (
            hospitalCache.data &&
            hospitalCache.timestamp + CACHE_DURATION > now &&
            getDistance(lat, lon, hospitalCache.location.lat, hospitalCache.location.lon) < 2
        ) {
            displayHospitals(hospitalCache.data, lat, lon);
            return;
        }

        // Fetch hospital data from multiple sources
        const [overpassData, googleData] = await Promise.all([
            fetchOverpassHospitals(lat, lon),
            fetchGooglePlaces(lat, lon),
        ]);

        const combinedData = combineHospitalData(overpassData, googleData);
        hospitalCache = {
            timestamp: now,
            data: combinedData,
            location: { lat, lon },
        };

        displayHospitals(combinedData, lat, lon);
    } catch (err) {
        console.error(err);
        showError('Unable to retrieve location. Please ensure location services are enabled.');
    }
}

// Fetch hospitals from Overpass API
async function fetchOverpassHospitals(lat, lon) {
    const overpassURL = `https://overpass-api.de/api/interpreter?data=[out:json];
        (
            node["amenity"="hospital"](around:5000,${lat},${lon});
            way["amenity"="hospital"](around:5000,${lat},${lon});
            relation["amenity"="hospital"](around:5000,${lat},${lon});
        );
        out center;`;

    const response = await fetch(overpassURL);
    return await response.json();
}

// Fetch hospitals from Google Places API
async function fetchGooglePlaces(lat, lon) {
    const apiKey = 'YOUR_GOOGLE_API_KEY'; // Replace with your Google API key
    const radius = 5000; // meters
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lon}&radius=${radius}&type=hospital&key=${apiKey}`;

    const response = await fetch(url);
    return await response.json();
}

// Combine hospital data from multiple sources
function combineHospitalData(overpassData, googleData) {
    const hospitals = [];

    // Process Overpass data
    if (overpassData.elements) {
        overpassData.elements.forEach((el) => {
            hospitals.push({
                name: el.tags?.name || 'Unnamed Hospital',
                lat: el.lat || el.center?.lat,
                lon: el.lon || el.center?.lon,
                source: 'openstreetmap',
            });
        });
    }

    // Process Google Places data
    if (googleData.results) {
        googleData.results.forEach((place) => {
            hospitals.push({
                name: place.name,
                lat: place.geometry.location.lat,
                lon: place.geometry.location.lng,
                address: place.vicinity,
                rating: place.rating,
                source: 'google',
            });
        });
    }

    return hospitals;
}

// Display hospitals in the UI
function displayHospitals(hospitals, userLat, userLon) {
    const hospitalList = document.getElementById('hospitalList');

    if (!hospitals.length) {
        hospitalList.innerHTML = '<p style="color: #ff4f4f;">No hospitals found nearby.</p>';
        return;
    }

    // Sort hospitals by distance
    hospitals.sort((a, b) => {
        const distA = getDistance(userLat, userLon, a.lat, a.lon);
        const distB = getDistance(userLat, userLon, b.lat, b.lon);
        return distA - distB;
    });

    let content = '<h3>Nearby Hospitals (sorted by distance):</h3>';
    hospitals.slice(0, 10).forEach((hospital, index) => {
        const dist = getDistance(userLat, userLon, hospital.lat, hospital.lon).toFixed(2);

        content += `
            <div class="hospital-card">
                <div class="hospital-header">
                    <h4>${index + 1}. 🏥 ${hospital.name}</h4>
                    ${hospital.rating ? `<span class="rating">⭐ ${hospital.rating}</span>` : ''}
                </div>
                <p class="distance">${dist} km away</p>
                ${hospital.address ? `<p class="address">${hospital.address}</p>` : ''}
                <div class="hospital-actions">
                    <button onclick="updateRoute(${hospital.lat}, ${hospital.lon})" class="btn route-btn">
                        Get Directions
                    </button>
                </div>
            </div>
        `;

        // Add marker on map
        L.marker([hospital.lat, hospital.lon])
            .addTo(map)
            .bindPopup(`
                <b>${hospital.name}</b><br>
                ${dist} km away<br>
                ${hospital.address || ''}
            `);
    });

    hospitalList.innerHTML = content;
}

// Show error messages
function showError(message) {
    const hospitalList = document.getElementById('hospitalList');
    hospitalList.innerHTML = `<p style="color: #ff4f4f;">${message}</p>`;
}

// Initialize map
function initMap(lat, lon) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 14);

        // Add tile layer
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors',
        }).addTo(map);

        // Add scale control
        L.control.scale().addTo(map);
    } else {
        map.setView([lat, lon], 14);
    }

    // Add user marker
    if (userMarker) {
        userMarker.setLatLng([lat, lon]);
    } else {
        userMarker = L.marker([lat, lon], {
            icon: L.divIcon({
                className: 'user-marker',
                html: '📍',
                iconSize: [30, 30],
            }),
        })
            .addTo(map)
            .bindPopup('Your location')
            .openPopup();
    }
}

// Calculate distance between two coordinates
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radius of the Earth in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
            Math.cos((lat2 * Math.PI) / 180) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
}
