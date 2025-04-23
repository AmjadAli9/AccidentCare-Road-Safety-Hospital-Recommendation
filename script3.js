const fileInput = document.getElementById('fileInput');
const previewContainer = document.getElementById('previewContainer');
const resultDiv = document.getElementById('result');
const severityText = document.getElementById('severity');
const injuryTypeText = document.getElementById('injuryType');
const treatmentStepsText = document.getElementById('treatmentSteps');

// Handle file input change event
fileInput.addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        previewContainer.innerHTML = "";  // Clear previous preview
        const fileType = file.type.split('/')[0];  // Check if it's an image or video

        if (fileType === 'image') {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            img.classList.add('imagePreview');
            previewContainer.appendChild(img);
            analyzeImage(img);  // Call analyzeImage function
        } else if (fileType === 'video') {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(file);
            video.controls = true;
            video.classList.add('videoPreview');
            previewContainer.appendChild(video);
            analyzeVideo(video);  // Call analyzeVideo function
        }
    }
});

// Analyze uploaded image
async function analyzeImage(imageElement) {
    resultDiv.style.display = 'none';  // Hide result initially

    // Simulate injury classification based on image analysis
    setTimeout(() => {
        // Simulating an injury prediction (in reality, you'd use a model here)
        const prediction = classifyInjury(imageElement);
        displayResult(prediction);
    }, 1000);  // Simulate a delay for the "prediction"
}

// Analyze uploaded video
async function analyzeVideo(videoElement) {
    resultDiv.style.display = 'none';  // Hide result initially
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    // Wait for the video to be loaded and ready to capture frames
    videoElement.onloadeddata = async function() {
        canvas.width = videoElement.videoWidth;
        canvas.height = videoElement.videoHeight;
        ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);

        // Simulate injury classification for video
        setTimeout(() => {
            const prediction = classifyInjury(canvas);
            displayResult(prediction);
        }, 1000);  // Simulate a delay for the "prediction"
    };
}

// Simulate injury classification based on image/video analysis
function classifyInjury(imageElement) {
    // Here we simulate analyzing the image and determining the injury
    // In a real-world scenario, you'd use a trained deep learning model for classification
    const injuryType = Math.random();  // Randomly simulate injury severity
    let severity, injuryTypeDescription, treatmentSteps;

    if (injuryType < 0.25) {
        severity = 'Minor';
        injuryTypeDescription = 'Small Cut or Bruise';
        treatmentSteps = 'Clean the wound and apply a bandage.';
    } else if (injuryType < 0.5) {
        severity = 'Moderate';
        injuryTypeDescription = 'Fracture or Larger Wound';
        treatmentSteps = 'Seek medical attention immediately, immobilize the area.';
    } else if (injuryType < 0.75) {
        severity = 'Severe';
        injuryTypeDescription = 'Heavy Bleeding or Deep Wound';
        treatmentSteps = 'Apply pressure to stop bleeding, call for emergency services.';
    } else {
        severity = 'Critical';
        injuryTypeDescription = 'Severe Trauma with Blood Loss';
        treatmentSteps = 'Call emergency services immediately!';
    }

    return {
        severity: severity,
        injuryType: injuryTypeDescription,
        treatmentSteps: treatmentSteps
    };
}

// Display the result of injury classification
function displayResult(prediction) {
    const { severity, injuryType, treatmentSteps } = prediction;

    severityText.textContent = `Severity: ${severity}`;
    injuryTypeText.textContent = `Injury Type: ${injuryType}`;
    treatmentStepsText.textContent = `Recommended Treatment: ${treatmentSteps}`;

    resultDiv.style.display = 'block';  // Show result
}

// Open Hospital Recommendation Page
function openHospitalPage() {
    window.location.href = "hospital.html";  // Open the custom hospital page
}

// Call Emergency (Dial 108 for Ambulance)
function callEmergency() {
    window.location.href = "tel:108";  // Dial 108 for emergency services in India
}
// Enhanced analysis function
async function analyzeMedia(file) {
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      // Show loading progress
      const progress = document.createElement('div');
      progress.className = 'progress-bar';
      previewContainer.appendChild(progress);
      
      // Use Fetch API with progress tracking
      const response = await fetch('https://your-ai-api.com/analyze', {
        method: 'POST',
        body: formData,
        signal: AbortSignal.timeout(30000)
      });
      
      const data = await response.json();
      
      // Multiple injury detection display
      data.injuries.forEach(injury => {
        displayInjuryResult(injury);
      });
      
      // Confidence indicator
      const confidence = document.createElement('div');
      confidence.innerHTML = `AI Confidence: ${data.confidence}%`;
      resultDiv.appendChild(confidence);
      
    } catch (error) {
      console.error('Analysis error:', error);
    }
  }
  
  // Add to your file input handler
  fileInput.addEventListener('change', async (event) => {
    const files = Array.from(event.target.files);
    const analysisPromises = files.map(file => analyzeMedia(file));
    await Promise.all(analysisPromises);
  });
