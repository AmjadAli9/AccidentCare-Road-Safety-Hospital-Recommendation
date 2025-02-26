function analyzeSeverity() {
    const fileInput = document.getElementById('fileInput');
    const resultDiv = document.getElementById('result');

    if (fileInput.files.length === 0) {
        resultDiv.innerHTML = '<p style="color: #ff4f4f;">Please upload an image or video first.</p>';
        return;
    }

    resultDiv.innerHTML = '<p style="color: #ffd700;">Analyzing... Please wait.</p>';

    setTimeout(() => {
        const severityLevels = ['Low', 'Moderate', 'High', 'Critical'];
        const severity = severityLevels[Math.floor(Math.random() * severityLevels.length)];

        resultDiv.innerHTML = `<p style="color: #4fff4f;">Severity Level: <strong>${severity}</strong></p>`;
    }, 2000);
}

function findHospital() {
    const hospitalList = document.getElementById('hospitalList');

    hospitalList.innerHTML = '<p style="color: #ffd700;">Fetching nearby hospitals... Please wait.</p>';

    setTimeout(() => {
        const hospitals = [
            '🏥 City Care Hospital - 2.5 km away',
            '🏥 Medlife Multi-specialty - 4.8 km away',
            '🏥 Sunrise Emergency Center - 3.2 km away',
            '🏥 Hopewell Hospital - 5.0 km away'
        ];

        const hospitalHTML = hospitals.map(hospital => `<p>${hospital}</p>`).join('');
        hospitalList.innerHTML = hospitalHTML;
    }, 2000);
}
