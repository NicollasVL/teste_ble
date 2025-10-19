# Quick Start - BLE Testing

## ✅ Your BLE Setup is Complete!

Everything is configured and ready to go. Here's what has been set up:

## 📁 Files Created

1. **`hooks/useBLE.ts`** - Complete BLE hook with all functionality
2. **`components/BLEScreen.tsx`** - UI component for scanning and connecting
3. **`BLE_GUIDE.md`** - Comprehensive documentation
4. **`app.json`** - Updated with BLE permissions

## 🚀 How to Test

### 1. Start the App

```bash
npm start
```

Then choose:
- Press `a` for Android
- Press `i` for iOS

**Important:** Use a **physical device** with Bluetooth, not an emulator!

### 2. Test BLE Functionality

When the app opens, you'll see the BLE Scanner screen:

1. **Check Bluetooth Status** - Make sure it shows "Bluetooth ON" (green badge)
2. **Click "Start Scanning"** - This will scan for 10 seconds
3. **See Devices Appear** - Nearby BLE devices will show up in the list
4. **Tap a Device** - Connect to it and view its services/characteristics

### 3. What to Look For

**Good Signs:**
- ✅ Bluetooth status shows "ON" in green
- ✅ Devices appear in the list when scanning
- ✅ Can connect to devices
- ✅ Can see services and characteristics

**Common Issues:**
- ❌ "Permissions not granted" - Allow Bluetooth and Location permissions in settings
- ❌ "Bluetooth is not powered on" - Enable Bluetooth in device settings
- ❌ No devices found - Make sure you have BLE devices nearby and they're advertising

## 🔧 Testing with Common BLE Devices

### Test Devices You Might Have:

1. **Fitness Trackers** - Heart rate monitors, smart watches
2. **Smart Home** - Smart bulbs, thermostats  
3. **Headphones** - Many wireless headphones use BLE
4. **Arduino/ESP32** - If you have development boards
5. **iPhone/Android** - Can advertise as BLE peripheral with apps

### Quick Test Apps (to make your phone a BLE device):

**Android:**
- "nRF Connect" - Nordic Semiconductor (best option)
- "BLE Peripheral Simulator"

**iOS:**
- "LightBlue" - Punchthrough
- "nRF Connect" - Nordic Semiconductor

## 📱 First Run Steps

1. **Open the app on your physical device**
2. **Allow all permissions** when prompted:
   - Bluetooth
   - Location (required for BLE on Android)
3. **Turn on Bluetooth** if not already on
4. **Press "Start Scanning"**
5. **Wait a few seconds** for devices to appear
6. **Tap any device** to connect and explore

## 🎓 Next Steps - Learn BLE

### Try These Exercises:

**Beginner:**
- Scan for devices ✅ (Already works!)
- Connect to a device ✅ (Already works!)
- View services and characteristics ✅ (Already works!)

**Intermediate:**
- Read data from a characteristic
- Write data to a characteristic
- Subscribe to notifications

**Advanced:**
- Filter devices by service UUID
- Handle reconnection automatically
- Implement device-specific protocols

### Example: Reading Battery Level

Most BLE devices have a Battery Service. Try this:

```typescript
// Battery Service UUID
const BATTERY_SERVICE = '0000180f-0000-1000-8000-00805f9b34fb';
// Battery Level Characteristic
const BATTERY_LEVEL = '00002a19-0000-1000-8000-00805f9b34fb';

const batteryLevel = await readCharacteristic(
  BATTERY_SERVICE,
  BATTERY_LEVEL
);

console.log('Battery:', batteryLevel, '%');
```

## 📚 Resources

- **Full Documentation**: See `BLE_GUIDE.md`
- **Hook Usage**: Check `hooks/useBLE.ts` for all available methods
- **UI Reference**: See `components/BLEScreen.tsx` for implementation examples

## 🐛 Troubleshooting

### "Cannot find BLE devices"
- Ensure Bluetooth is ON
- Grant Location permission (Android requirement)
- Make sure devices are in pairing/advertising mode
- Move closer to BLE devices

### App crashes on startup
```bash
# Clean and rebuild
cd android
./gradlew clean
cd ..
npm start
```

### Permissions not working
- Go to device Settings → Apps → Your App → Permissions
- Manually enable all permissions
- Restart the app

## 🎉 You're Ready!

Your BLE setup is complete and functional. Start by running the app and scanning for devices!

### Quick Commands:

```bash
# Start development server
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# View logs
npx react-native log-android
npx react-native log-ios
```

Happy BLE development! 🚀📡
