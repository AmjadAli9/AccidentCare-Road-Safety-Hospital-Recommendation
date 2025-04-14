let map, userMarker;

function findHospital() {
    const hospitalList = document.getElementById('hospitalList');
    hospitalList.innerHTML = '<p style="color: #ffd700;">Fetching nearby hospitals... Please wait.</p>';

    if (!navigator.geolocation) {
        hospitalList.innerHTML = '<p style="color: #ff4f4f;">Geolocation not supported by your browser.</p>';
        return;
    }

    navigator.geolocation.getCurrentPosition(
        (position) => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;

            initMap(lat, lon);

            const overpassURL = `https://overpass-api.de/api/interpreter?data=[out:json];
                (
                    node["amenity"="hospital"](around:7000,${lat},${lon});
                    way["amenity"="hospital"](around:7000,${lat},${lon});
                    relation["amenity"="hospital"](around:7000,${lat},${lon});
                );
                out center;`;

            fetch(overpassURL)
                .then(res => res.json())
                .then(data => {
                    if (!data.elements.length) {
                        hospitalList.innerHTML = '<p style="color: #ff4f4f;">No hospitals found nearby.</p>';
                        return;
                    }

                    let content = '<h3>Nearby Hospitals:</h3>';
                    data.elements.slice(0, 5).forEach(el => {
                        const name = el.tags?.name || 'Unnamed Hospital';
                        const lat2 = el.lat || el.center?.lat;
                        const lon2 = el.lon || el.center?.lon;
                        const dist = getDistance(lat, lon, lat2, lon2).toFixed(2);

                        content += `
                            <div style="margin-bottom: 10px;">
                                <strong>🏥 ${name}</strong><br>
                                Approx. ${dist} km away
                            </div>
                        `;

                        // Add marker on map
                        if (lat2 && lon2) {
                            L.marker([lat2, lon2]).addTo(map).bindPopup(name);
                        }
                    });

                    hospitalList.innerHTML = content;
                })
                .catch(err => {
                    console.error(err);
                    hospitalList.innerHTML = '<p style="color: #ff4f4f;">Error fetching hospital data.</p>';
                });
        },
        (err) => {
            console.error(err);
            hospitalList.innerHTML = '<p style="color: #ff4f4f;">Unable to retrieve location.</p>';
        }
    );
}

function callEmergency() {
    window.location.href = "tel:108"; // India's emergency medical number
}

// Map Initialization
function initMap(lat, lon) {
    if (!map) {
        map = L.map('map').setView([lat, lon], 13);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; OpenStreetMap contributors'
        }).addTo(map);
    } else {
        map.setView([lat, lon], 13);
    }

    if (userMarker) {
        userMarker.setLatLng([lat, lon]);
    } else {
        userMarker = L.marker([lat, lon]).addTo(map).bindPopup('You are here').openPopup();
    }
}

// Distance between coordinates (Haversine formula)
function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
        Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}
function deg2rad(deg) {
    return deg * (Math.PI/180);
}
