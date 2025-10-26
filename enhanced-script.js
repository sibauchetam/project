console.log('Enhanced script loading...');

// Global variables
let funscriptData = null;
let isPlaying = false;
let vibrationInterval = null;
let videoPlayer = null;

// Configuration
let config = {
    intensity: 1.0,
    sensitivity: 1.0,
    minDuration: 50,
    maxDuration: 1000,
    smoothing: true,
    enabled: true
};

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded - enhanced script');
    
    // Initialize elements
    videoPlayer = document.getElementById('videoPlayer');
    
    // Check vibration support
    const vibrationStatus = document.getElementById('vibrationStatus');
    if (vibrationStatus) {
        if (navigator.vibrate) {
            vibrationStatus.textContent = 'Supported';
            vibrationStatus.className = 'status-success';
        } else {
            vibrationStatus.textContent = 'Not supported';
            vibrationStatus.className = 'status-error';
        }
    }
    
    // Setup file upload handlers
    setupFileUploads();
    
    // Setup control handlers
    setupControls();
    
    // Setup video event listeners
    setupVideoEvents();
    
    // Setup configuration controls
    setupConfigControls();
});

function setupFileUploads() {
    const videoInput = document.getElementById('videoInput');
    const funscriptInput = document.getElementById('funscriptInput');
    const videoUpload = document.getElementById('videoUpload');
    const funscriptUpload = document.getElementById('funscriptUpload');
    
    if (videoUpload && videoInput) {
        videoUpload.addEventListener('click', () => {
            videoInput.click();
        });
        
        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const url = URL.createObjectURL(file);
                videoPlayer.src = url;
                
                const videoStatus = document.getElementById('videoStatus');
                if (videoStatus) {
                    videoStatus.textContent = file.name;
                    videoStatus.className = 'status-success';
                }
                console.log('Video loaded:', file.name);
            }
        });
    }
    
    if (funscriptUpload && funscriptInput) {
        funscriptUpload.addEventListener('click', () => {
            funscriptInput.click();
        });
        
        funscriptInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    try {
                        funscriptData = JSON.parse(e.target.result);
                        const funscriptStatus = document.getElementById('funscriptStatus');
                        if (funscriptStatus) {
                            funscriptStatus.textContent = file.name;
                            funscriptStatus.className = 'status-success';
                        }
                        console.log('Funscript loaded:', file.name, 'Actions:', funscriptData.actions?.length || 0);
                    } catch (error) {
                        console.error('Error parsing funscript:', error);
                        alert('Error parsing funscript file. Please check the file format.');
                    }
                };
                reader.readAsText(file);
            }
        });
    }
}

function setupControls() {
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const testVibrationBtn = document.getElementById('testVibrationBtn');
    
    if (playPauseBtn) {
        playPauseBtn.addEventListener('click', () => {
            if (videoPlayer.paused) {
                videoPlayer.play();
            } else {
                videoPlayer.pause();
            }
        });
    }
    
    if (stopBtn) {
        stopBtn.addEventListener('click', () => {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            stopVibration();
        });
    }
    
    if (testVibrationBtn) {
        testVibrationBtn.addEventListener('click', () => {
            if (navigator.vibrate) {
                navigator.vibrate([200, 100, 200, 100, 300]);
                console.log('Test vibration triggered');
            } else {
                console.log('Vibration not supported');
                alert('Vibration not supported on this device');
            }
        });
    }
}

function setupVideoEvents() {
    if (!videoPlayer) return;
    
    videoPlayer.addEventListener('play', () => {
        isPlaying = true;
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = '⏸️ Pause';
        }
        startVibrationSync();
        console.log('Video started playing');
    });
    
    videoPlayer.addEventListener('pause', () => {
        isPlaying = false;
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = '▶️ Play';
        }
        stopVibration();
        console.log('Video paused');
    });
    
    videoPlayer.addEventListener('ended', () => {
        isPlaying = false;
        const playPauseBtn = document.getElementById('playPauseBtn');
        if (playPauseBtn) {
            playPauseBtn.textContent = '▶️ Play';
        }
        stopVibration();
        console.log('Video ended');
    });
}

function startVibrationSync() {
    if (!funscriptData || !funscriptData.actions || !navigator.vibrate || !config.enabled) {
        console.log('Cannot start vibration sync:', {
            hasFunscript: !!funscriptData,
            hasActions: !!(funscriptData && funscriptData.actions),
            hasVibrate: !!navigator.vibrate,
            enabled: config.enabled
        });
        return;
    }
    
    console.log('Starting vibration sync with', funscriptData.actions.length, 'actions');
    
    // Clear any existing interval
    if (vibrationInterval) {
        clearInterval(vibrationInterval);
    }
    
    // Start sync loop
    vibrationInterval = setInterval(() => {
        if (!isPlaying) return;
        
        const currentTime = videoPlayer.currentTime * 1000; // Convert to milliseconds
        processVibrationAtTime(currentTime);
    }, 50); // Check every 50ms for smooth sync
}

function processVibrationAtTime(currentTime) {
    if (!funscriptData || !funscriptData.actions) return;
    
    // Find actions within a small time window
    const timeWindow = 100; // 100ms window
    const relevantActions = funscriptData.actions.filter(action => {
        return Math.abs(action.at - currentTime) <= timeWindow;
    });
    
    if (relevantActions.length > 0) {
        // Calculate vibration intensity based on position changes
        let totalIntensity = 0;
        let maxChange = 0;
        
        relevantActions.forEach((action, index) => {
            if (index > 0) {
                const prevAction = relevantActions[index - 1];
                const positionChange = Math.abs(action.pos - prevAction.pos);
                maxChange = Math.max(maxChange, positionChange);
                totalIntensity += positionChange;
            }
        });
        
        if (maxChange > 0) {
            // Convert position change to vibration duration
            const normalizedIntensity = (maxChange / 100) * config.intensity * config.sensitivity;
            const duration = Math.max(
                config.minDuration,
                Math.min(config.maxDuration, normalizedIntensity * 10)
            );
            
            // Create vibration pattern
            const pattern = [Math.round(duration)];
            
            navigator.vibrate(pattern);
            console.log('Vibration triggered:', { time: currentTime, intensity: normalizedIntensity, duration: Math.round(duration) });
        }
    }
}

function stopVibration() {
    if (vibrationInterval) {
        clearInterval(vibrationInterval);
        vibrationInterval = null;
    }
    
    // Stop any ongoing vibration
    if (navigator.vibrate) {
        navigator.vibrate(0);
    }
    
    console.log('Vibration stopped');
}

function setupConfigControls() {
    const intensitySlider = document.getElementById('intensitySlider');
    const intensityValue = document.getElementById('intensityValue');
    const sensitivitySlider = document.getElementById('sensitivitySlider');
    const sensitivityValue = document.getElementById('sensitivityValue');
    const enableVibration = document.getElementById('enableVibration');
    
    if (intensitySlider && intensityValue) {
        intensitySlider.addEventListener('input', (e) => {
            config.intensity = parseFloat(e.target.value);
            intensityValue.textContent = config.intensity.toFixed(1) + 'x';
            console.log('Intensity set to:', config.intensity);
        });
    }
    
    if (sensitivitySlider && sensitivityValue) {
        sensitivitySlider.addEventListener('input', (e) => {
            config.sensitivity = parseFloat(e.target.value);
            sensitivityValue.textContent = config.sensitivity.toFixed(1) + 'x';
            console.log('Sensitivity set to:', config.sensitivity);
        });
    }
    
    if (enableVibration) {
        enableVibration.addEventListener('change', (e) => {
            config.enabled = e.target.checked;
            console.log('Vibration enabled:', config.enabled);
            if (!config.enabled) {
                stopVibration();
            }
        });
    }
}