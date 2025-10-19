# BLE (Bluetooth Low Energy) Setup Guide

## 📱 Overview
This project is set up to work with Bluetooth Low Energy (BLE) devices using React Native and Expo.

## 🚀 Quick Start

### 1. Prerequisites
- Node.js installed
- Expo CLI
- Android device/emulator (Android 6.0+) or iOS device/simulator (iOS 10.0+)
- Physical device with Bluetooth capability (recommended for testing)

### 2. Installation
Dependencies are already installed:
- `react-native-ble-plx` - BLE library for React Native
- `expo-device` - Device information for platform-specific logic
- `buffer` - For encoding/decoding BLE data

### 3. Running the App

```bash
# Start the development server
npm start

# Run on Android
npm run android

# Run on iOS  
npm run ios
```

**Important**: BLE functionality works best on **physical devices**. Emulators/simulators have limited Bluetooth support.

## 🎯 How to Use

### Basic Usage

The `BLEScreen` component in `components/BLEScreen.tsx` demonstrates all basic BLE functionality:

1. **Scan for Devices** - Press "Start Scanning" to discover nearby BLE devices
2. **Connect to Device** - Tap on any discovered device to connect
3. **View Services** - Once connected, see all available services and characteristics
4. **Disconnect** - Press disconnect button when done

### Using the useBLE Hook

```typescript
import useBLE from '@/hooks/useBLE';

function MyComponent() {
  const {
    allDevices,           // Array of discovered devices
    connectedDevice,      // Currently connected device
    isScanning,          // Scanning state
    bluetoothState,      // Bluetooth radio state
    scanForDevices,      // Start scanning
    stopScanning,        // Stop scanning
    connectToDevice,     // Connect to a device
    disconnectFromDevice, // Disconnect
    readCharacteristic,  // Read from characteristic
    writeCharacteristic, // Write to characteristic
    subscribeToCharacteristic, // Listen to notifications
    getServicesAndCharacteristics // Get device info
  } = useBLE();

  // Your code here...
}
```

## 📖 API Reference

### Scanning for Devices

```typescript
// Start scanning (automatically stops after 10 seconds)
await scanForDevices();

// Stop scanning manually
stopScanning();

// Access discovered devices
allDevices.forEach(device => {
  console.log(device.name, device.id, device.rssi);
});
```

### Connecting to Devices

```typescript
// Connect to a device
const device = await connectToDevice({
  id: 'device-id',
  name: 'Device Name',
  rssi: -50
});

// Disconnect from current device
await disconnectFromDevice();
```

### Reading/Writing Data

```typescript
// Read from a characteristic
const value = await readCharacteristic(
  'service-uuid',
  'characteristic-uuid'
);

// Write to a characteristic
await writeCharacteristic(
  'service-uuid',
  'characteristic-uuid',
  'Hello BLE!'
);

// Subscribe to notifications
subscribeToCharacteristic(
  'service-uuid',
  'characteristic-uuid',
  (value) => {
    console.log('Received:', value);
  }
);
```

### Getting Device Information

```typescript
// Get all services and characteristics
const services = await getServicesAndCharacteristics();

services.forEach(service => {
  console.log('Service:', service.uuid);
  service.characteristics.forEach(char => {
    console.log('  Characteristic:', char.uuid);
    console.log('  Readable:', char.isReadable);
    console.log('  Writable:', char.isWritableWithResponse);
    console.log('  Notifiable:', char.isNotifiable);
  });
});
```

## 🔐 Permissions

### Android
The app automatically requests:
- `BLUETOOTH_SCAN` - For scanning devices
- `BLUETOOTH_CONNECT` - For connecting to devices
- `ACCESS_FINE_LOCATION` - Required for BLE on Android

### iOS
Permissions are declared in `app.json`:
- `NSBluetoothAlwaysUsageDescription` - Bluetooth usage description

## 🎨 Example: Heart Rate Monitor

```typescript
import useBLE from '@/hooks/useBLE';

function HeartRateMonitor() {
  const { connectToDevice, subscribeToCharacteristic } = useBLE();
  const [heartRate, setHeartRate] = useState(0);

  const connectToHRM = async () => {
    const device = await connectToDevice({
      id: 'heart-rate-monitor-id',
      name: 'Heart Rate Monitor',
      rssi: -60
    });

    // Heart Rate Service UUID
    const HR_SERVICE = '0000180d-0000-1000-8000-00805f9b34fb';
    // Heart Rate Measurement Characteristic
    const HR_MEASUREMENT = '00002a37-0000-1000-8000-00805f9b34fb';

    subscribeToCharacteristic(
      HR_SERVICE,
      HR_MEASUREMENT,
      (value) => {
        // Parse heart rate value (first byte after flags)
        const buffer = Buffer.from(value, 'base64');
        const hr = buffer[1];
        setHeartRate(hr);
      }
    );
  };

  return (
    <View>
      <Text>Heart Rate: {heartRate} BPM</Text>
      <Button title="Connect" onPress={connectToHRM} />
    </View>
  );
}
```

## 🐛 Troubleshooting

### "Bluetooth is not powered on"
- Make sure Bluetooth is enabled on your device
- Check device settings

### "Permissions not granted"
- Manually enable permissions in device settings
- Reinstall the app after permissions changes

### "Cannot find devices"
- Make sure the BLE device is turned on and in range
- Check if the device is in pairing/advertising mode
- Some devices require specific scan settings (not covered in basic scan)

### Build Errors
If you encounter build errors after installation:
```bash
# Clean and rebuild
cd android && ./gradlew clean && cd ..
# Or for iOS
cd ios && pod install && cd ..
```

## 📚 Common BLE Service UUIDs

- **Heart Rate**: `0000180d-0000-1000-8000-00805f9b34fb`
- **Battery**: `0000180f-0000-1000-8000-00805f9b34fb`
- **Device Information**: `0000180a-0000-1000-8000-00805f9b34fb`
- **Generic Access**: `00001800-0000-1000-8000-00805f9b34fb`

## 🔗 Resources

- [BLE Specification](https://www.bluetooth.com/specifications/specs/)
- [react-native-ble-plx Documentation](https://github.com/dotintent/react-native-ble-plx)
- [UUID Generator](https://www.uuidgenerator.net/)

## ⚠️ Important Notes

1. **Always test on physical devices** - Emulators have limited BLE support
2. **Battery Usage** - BLE scanning can drain battery; stop when not needed
3. **Permissions** - Users must grant Bluetooth and Location permissions
4. **iOS Background** - Additional configuration needed for background BLE
5. **UUIDs** - Service and characteristic UUIDs are device-specific

## 🎉 Next Steps

1. Connect to your specific BLE device
2. Find device's service and characteristic UUIDs
3. Implement custom read/write logic based on your device protocol
4. Add error handling for production use
5. Consider adding device connection state persistence

Happy coding! 🚀
