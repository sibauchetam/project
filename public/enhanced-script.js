document.addEventListener('DOMContentLoaded', () => {
    // Global state
    let funscriptData = null;
    let vibrationInterval = null;

    // DOM Elements
    const videoPlayer = document.getElementById('videoPlayer');
    const videoInput = document.getElementById('videoInput');
    const funscriptInput = document.getElementById('funscriptInput');
    const videoUpload = document.getElementById('videoUpload');
    const funscriptUpload = document.getElementById('funscriptUpload');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const stopBtn = document.getElementById('stopBtn');
    const testVibrationBtn = document.getElementById('testVibrationBtn');
    const intensitySlider = document.getElementById('intensitySlider');
    const sensitivitySlider = document.getElementById('sensitivitySlider');
    const intensityValue = document.getElementById('intensityValue');
    const sensitivityValue = document.getElementById('sensitivityValue');
    const enableVibration = document.getElementById('enableVibration');
    const enableFullscreenVibration = document.getElementById('enableFullscreenVibration');
    const resetSettingsBtn = document.getElementById('resetSettings');

    // Default settings
    const DEFAULT_SETTINGS = {
        intensity: 1.0,
        sensitivity: 1.0,
        enableVibration: true,
        enableFullscreenVibration: true,
    };

    // Configuration
    let config = { ...DEFAULT_SETTINGS };

    // --- Initialization ---
    const updateStatus = (elementId, text, type = '') => {
        const el = document.getElementById(elementId);
        if (el) {
            const valueEl = el.querySelector('.status-value');
            valueEl.textContent = text;
            valueEl.className = `status-value ${type}`;
        }
    };

    const checkVibrationSupport = () => {
        if (navigator.vibrate) {
            updateStatus('vibrationStatus', 'Supported', 'success');
        } else {
            updateStatus('vibrationStatus', 'Not Supported', 'error');
        }
    };

    // --- File Handling ---
    const setupFileUploads = () => {
        videoUpload.addEventListener('click', () => videoInput.click());
        funscriptUpload.addEventListener('click', () => funscriptInput.click());

        videoInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                videoPlayer.src = URL.createObjectURL(file);
                updateStatus('videoStatus', file.name, 'success');
            }
        });

        funscriptInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    try {
                        funscriptData = JSON.parse(event.target.result);
                        updateStatus('funscriptStatus', file.name, 'success');
                    } catch (error) {
                        updateStatus('funscriptStatus', 'Invalid File', 'error');
                        console.error('Error parsing funscript:', error);
                    }
                };
                reader.readAsText(file);
            }
        });
    };

    // --- UI & Controls ---
    const setupControls = () => {
        playPauseBtn.addEventListener('click', () => {
            videoPlayer.paused ? videoPlayer.play() : videoPlayer.pause();
        });

        stopBtn.addEventListener('click', () => {
            videoPlayer.pause();
            videoPlayer.currentTime = 0;
            stopVibration();
        });

        testVibrationBtn.addEventListener('click', () => {
            if (navigator.vibrate) navigator.vibrate([150, 75, 150]);
        });
    };

    const setupVideoEvents = () => {
        videoPlayer.addEventListener('play', () => {
            playPauseBtn.textContent = 'Pause';
            startVibrationSync();
        });

        videoPlayer.addEventListener('pause', () => {
            playPauseBtn.textContent = 'Play';
            stopVibration();
        });

        videoPlayer.addEventListener('ended', () => {
            playPauseBtn.textContent = 'Play';
            stopVibration();
        });
    };

    // --- Vibration Logic ---
    const startVibrationSync = () => {
        if (!funscriptData || !config.enableVibration) return;
        if (vibrationInterval) clearInterval(vibrationInterval);

        vibrationInterval = setInterval(() => {
            const isFullscreen = !!document.fullscreenElement;
            if (!videoPlayer.paused && (!isFullscreen || config.enableFullscreenVibration)) {
                const currentTime = videoPlayer.currentTime * 1000;
                processVibration(currentTime);
            }
        }, 50);
    };

    const stopVibration = () => {
        if (vibrationInterval) clearInterval(vibrationInterval);
        if (navigator.vibrate) navigator.vibrate(0);
    };

    const processVibration = (currentTime) => {
        const action = funscriptData.actions.find(a => currentTime >= a.at && currentTime < a.at + 100);
        if (action) {
            const intensity = (action.pos / 100) * config.intensity * config.sensitivity;
            const duration = Math.min(100, Math.max(20, intensity * 10));
            if (navigator.vibrate) navigator.vibrate(duration);
        }
    };

    // --- Settings ---
    const setupSettings = () => {
        intensitySlider.addEventListener('input', e => {
            config.intensity = parseFloat(e.target.value);
            intensityValue.textContent = `${config.intensity.toFixed(1)}x`;
        });

        sensitivitySlider.addEventListener('input', e => {
            config.sensitivity = parseFloat(e.target.value);
            sensitivityValue.textContent = `${config.sensitivity.toFixed(1)}x`;
        });

        enableVibration.addEventListener('change', e => {
            config.enableVibration = e.target.checked;
            if (!config.enableVibration) stopVibration();
        });

        enableFullscreenVibration.addEventListener('change', e => {
            config.enableFullscreenVibration = e.target.checked;
        });

        resetSettingsBtn.addEventListener('click', resetSettings);
    };

    const resetSettings = () => {
        config = { ...DEFAULT_SETTINGS };
        intensitySlider.value = config.intensity;
        sensitivitySlider.value = config.sensitivity;
        enableVibration.checked = config.enableVibration;
        enableFullscreenVibration.checked = config.enableFullscreenVibration;
        intensityValue.textContent = `${config.intensity.toFixed(1)}x`;
        sensitivityValue.textContent = `${config.sensitivity.toFixed(1)}x`;
    };

    // --- Tooltips ---
    const setupTooltips = () => {
        const tooltip = document.getElementById('tooltip');
        document.querySelectorAll('.hint').forEach(hint => {
            hint.addEventListener('mouseenter', e => {
                tooltip.textContent = e.target.getAttribute('data-tooltip');
                tooltip.style.display = 'block';
            });
            hint.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });
            hint.addEventListener('mousemove', e => {
                tooltip.style.left = `${e.pageX + 10}px`;
                tooltip.style.top = `${e.pageY + 10}px`;
            });
        });
    };

    // --- App Entry Point ---
    checkVibrationSupport();
    setupFileUploads();
    setupControls();
    setupVideoEvents();
    setupSettings();
    setupTooltips();
});
