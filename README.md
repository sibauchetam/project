# Funscript Vibration Player

A web application that synchronizes phone vibrations with video playback using .funscript files.

## Features

- 📱 **Mobile-First Design**: Optimized for mobile devices with vibration support
- 🎥 **Video Upload**: Support for various video formats (MP4, WebM, etc.)
- 📜 **Funscript Support**: Parse and play .funscript files with timing/position data
- 📳 **Vibration Sync**: Real-time vibration synchronized with video playback
- 🎮 **Intuitive Controls**: Play, pause, stop, and test vibration functionality
- 📊 **Status Indicators**: Real-time feedback on file loading and vibration support

## How to Use

1. **Access the App**: Open the web application in a mobile browser
2. **Upload Files**: 
   - Upload a video file (drag & drop or click to select)
   - Upload a corresponding .funscript file
3. **Play**: Once both files are loaded, use the play controls to start synchronized playback
4. **Test**: Use the "Test Vibration" button to verify your device supports vibration

## Funscript Format

The app expects .funscript files in JSON format with the following structure:

```json
{
  "version": "1.0",
  "inverted": false,
  "range": 90,
  "actions": [
    {"at": 1000, "pos": 50},
    {"at": 2000, "pos": 80},
    ...
  ]
}
```

- `at`: Timestamp in milliseconds
- `pos`: Position value (0-100) that determines vibration intensity

## Technical Details

- **Vibration API**: Uses `navigator.vibrate()` for haptic feedback
- **Video Sync**: Real-time synchronization with video playback time
- **Smart Algorithm**: 
  - Interpolates between funscript actions for smooth transitions
  - Calculates movement speed to determine vibration patterns
  - Fast movements = short bursts, slow movements = sustained vibrations
  - Prevents excessive vibrations with intelligent throttling
- **Customizable Settings**:
  - **Intensity**: Adjusts overall vibration strength (0.1x - 2.0x)
  - **Sensitivity**: Controls how responsive vibrations are to movement (0.1x - 3.0x)
  - **Smoothing**: Optional smoothing for more natural feel
- **Position Mapping**: Dynamic mapping based on position and movement speed
- **Frequency Control**: Adaptive minimum intervals to prevent jarring vibrations

## Browser Compatibility

- **Vibration Support**: Chrome/Edge on Android, Safari on iOS (limited)
- **Video Support**: All modern browsers with HTML5 video support
- **File API**: Modern browsers with File API support

## Sample Files

- `sample.funscript`: Example funscript file for testing
- Test with any video file to see the synchronization in action

## Development

To run locally:

```bash
python3 server.py
```

Then access at `http://localhost:12000`

## Notes

- Vibration works best on mobile devices
- Some browsers require user interaction before allowing vibration
- Position values are mapped to vibration intensity (higher = longer vibration)
- The app includes visual feedback when vibration is triggered