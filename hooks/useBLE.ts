import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, State, Subscription } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import { Buffer } from "buffer";

// BLE Device interface
interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number | null;
}

// Characteristic Info interface
interface CharacteristicInfo {
  uuid: string;
  isReadable: boolean;
  isWritableWithResponse: boolean;
  isWritableWithoutResponse: boolean;
  isNotifiable: boolean;
  isIndicatable: boolean;
}

// Service Info interface
interface ServiceInfo {
  uuid: string;
  characteristics: CharacteristicInfo[];
}

const bleManager = new BleManager();

function useBLE() {
  const [allDevices, setAllDevices] = useState<BLEDevice[]>([]);
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [bluetoothState, setBluetoothState] = useState<State>(State.Unknown);

  // Monitor Bluetooth state
  useEffect(() => {
    const subscription = bleManager.onStateChange((state) => {
      setBluetoothState(state);
      if (state === State.PoweredOn) {
        subscription.remove();
      }
    }, true);

    return () => {
      subscription.remove();
    };
  }, []);

  // Request Android 31+ permissions
  const requestAndroid31Permissions = async () => {
    const bluetoothScanPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
      {
        title: "Bluetooth Scan Permission",
        message: "App needs Bluetooth Scan permission",
        buttonPositive: "OK",
      }
    );
    const bluetoothConnectPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      {
        title: "Bluetooth Connect Permission",
        message: "App needs Bluetooth Connect permission",
        buttonPositive: "OK",
      }
    );
    const fineLocationPermission = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: "Location Permission",
        message: "Bluetooth Low Energy requires Location",
        buttonPositive: "OK",
      }
    );

    return (
      bluetoothScanPermission === "granted" &&
      bluetoothConnectPermission === "granted" &&
      fineLocationPermission === "granted"
    );
  };

  // Request permissions based on platform
  const requestPermissions = async () => {
    if (Platform.OS === "android") {
      if ((ExpoDevice.platformApiLevel ?? -1) < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: "Location Permission",
            message: "Bluetooth Low Energy requires Location",
            buttonPositive: "OK",
          }
        );
        return granted === PermissionsAndroid.RESULTS.GRANTED;
      } else {
        const isAndroid31PermissionsGranted =
          await requestAndroid31Permissions();
        return isAndroid31PermissionsGranted;
      }
    } else {
      return true;
    }
  };

  // Check if device already exists in list
  const isDuplicateDevice = (devices: BLEDevice[], nextDevice: Device) => {
    return devices.findIndex((device) => nextDevice.id === device.id) > -1;
  };

  // Scan for BLE devices
  const scanForDevices = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) {
      console.log("Permissions not granted");
      return;
    }

    if (bluetoothState !== State.PoweredOn) {
      console.log("Bluetooth is not powered on");
      return;
    }

    setIsScanning(true);
    setAllDevices([]);

    bleManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Scan error:", error);
        setIsScanning(false);
        return;
      }

      if (device) {
        setAllDevices((prevState) => {
          if (!isDuplicateDevice(prevState, device)) {
            return [
              ...prevState,
              {
                id: device.id,
                name: device.name,
                rssi: device.rssi,
              },
            ];
          }
          return prevState;
        });
      }
    });

    // Stop scanning after 10 seconds
    setTimeout(() => {
      stopScanning();
    }, 10000);
  };

  // Stop scanning
  const stopScanning = () => {
    bleManager.stopDeviceScan();
    setIsScanning(false);
  };

  // Connect to a device
  const connectToDevice = async (device: BLEDevice) => {
    try {
      console.log("🔌 Connecting to device:", device.id);
      
      // Stop any ongoing scan before connecting
      bleManager.stopDeviceScan();
      
      const deviceConnection = await bleManager.connectToDevice(device.id, {
        requestMTU: 517,
        timeout: 10000, // 10 second timeout
      }).catch((error) => {
        console.error("Connection failed:", error);
        // Throw a more descriptive error
        if (error.message?.includes("Device disconnected") || error.message?.includes("Connection")) {
          throw new Error("Failed to connect. Device may be out of range or already connected to another device.");
        }
        throw new Error(`Connection failed: ${error.message || "Unknown error"}`);
      });
      
      console.log("✓ Device connected");
      setConnectedDevice(deviceConnection);
      
      console.log("🔍 Discovering services and characteristics...");
      // Add a small delay before discovery to ensure device is ready
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        await deviceConnection.discoverAllServicesAndCharacteristics();
        console.log("✓ Discovery complete");
      } catch (discoveryError) {
        console.warn("⚠️ Service discovery failed:", discoveryError);
        // Continue anyway, we can try to get services later
      }
      
      // Monitor disconnection
      const disconnectSubscription = bleManager.onDeviceDisconnected(
        device.id, 
        (error, disconnectedDevice) => {
          if (error) {
            console.error("Disconnection error:", error);
          }
          console.log("Device disconnected:", disconnectedDevice?.name);
          setConnectedDevice(null);
        }
      );

      return deviceConnection;
    } catch (error: any) {
      console.error("❌ Connection error:", error);
      setConnectedDevice(null);
      
      // Ensure we throw a proper Error object with message
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error(error?.message || "Failed to connect to device");
      }
    }
  };

  // Disconnect from device
  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        console.log("🔌 Disconnecting from device:", connectedDevice.id);
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
        console.log("✅ Disconnected successfully");
      } catch (error: any) {
        console.error("Disconnect error:", error);
        // Force clear the state even if disconnect fails
        setConnectedDevice(null);
      }
    }
  };

  // Clean up and cancel all connections
  const cleanup = async () => {
    try {
      console.log("🧹 Cleaning up BLE connections...");
      bleManager.stopDeviceScan();
      
      if (connectedDevice) {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
      }
      
      setConnectedDevice(null);
      setIsScanning(false);
      console.log("✅ Cleanup complete");
    } catch (error) {
      console.error("Cleanup error:", error);
    }
  };

  // Read from a characteristic
  const readCharacteristic = async (
    serviceUUID: string,
    characteristicUUID: string
  ): Promise<string> => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      console.log(`📖 Reading characteristic ${characteristicUUID}...`);
      
      const characteristic = await connectedDevice.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );

      if (characteristic.value) {
        const decodedValue = Buffer.from(characteristic.value, "base64").toString("utf-8");
        console.log(`✅ Read value: ${decodedValue}`);
        return decodedValue;
      }
      
      return "";
    } catch (error) {
      console.error("❌ Read characteristic error:", error);
      throw error;
    }
  };

  // Write to a characteristic
  const writeCharacteristic = async (
    serviceUUID: string,
    characteristicUUID: string,
    value: string,
    withResponse: boolean = true
  ): Promise<void> => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      console.log(`✍️ Writing to characteristic ${characteristicUUID}...`);
      console.log(`Value: ${value}`);
      
      const encodedValue = Buffer.from(value, "utf-8").toString("base64");
      
      if (withResponse) {
        await connectedDevice.writeCharacteristicWithResponseForService(
          serviceUUID,
          characteristicUUID,
          encodedValue
        );
      } else {
        await connectedDevice.writeCharacteristicWithoutResponseForService(
          serviceUUID,
          characteristicUUID,
          encodedValue
        );
      }
      
      console.log("✅ Write successful");
    } catch (error) {
      console.error("❌ Write characteristic error:", error);
      throw error;
    }
  };

  // Subscribe to characteristic notifications
  const subscribeToCharacteristic = async (
    serviceUUID: string,
    characteristicUUID: string,
    callback: (value: string) => void
  ): Promise<Subscription> => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      console.log(`🔔 Subscribing to characteristic ${characteristicUUID}...`);
      
      const subscription = connectedDevice.monitorCharacteristicForService(
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
          if (error) {
            console.error("❌ Notification error:", error);
            return;
          }

          if (characteristic?.value) {
            const decodedValue = Buffer.from(characteristic.value, "base64").toString(
              "utf-8"
            );
            console.log(`🔔 Notification received: ${decodedValue}`);
            callback(decodedValue);
          }
        }
      );

      console.log("✅ Subscription active");
      return subscription;
    } catch (error) {
      console.error("❌ Subscribe error:", error);
      throw error;
    }
  };

  // Get services and characteristics of connected device
  const getServicesAndCharacteristics = async (forceRediscover = false): Promise<ServiceInfo[]> => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      console.log("📡 Checking device connection status...");
      // Check if device is still connected
      const isConnected = await connectedDevice.isConnected();
      console.log("Connection status:", isConnected);
      
      if (!isConnected) {
        throw new Error("Device is not connected anymore");
      }

      // If force rediscover, do it again
      if (forceRediscover) {
        console.log("🔄 Forcing service rediscovery...");
        await connectedDevice.discoverAllServicesAndCharacteristics();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log("📋 Fetching services...");
      const services = await connectedDevice.services();
      console.log(`Found ${services.length} service(s)`);
      
      if (services.length === 0) {
        console.warn("⚠️ No BLE services found on this device");
        return [];
      }

      const servicesWithCharacteristics = await Promise.all(
        services.map(async (service) => {
          console.log(`  Service UUID: ${service.uuid}`);
          const characteristics = await service.characteristics();
          console.log(`    - ${characteristics.length} characteristic(s)`);
          
          return {
            uuid: service.uuid,
            characteristics: characteristics.map((char) => {
              console.log(`      Char UUID: ${char.uuid}`);
              console.log(`        Read: ${char.isReadable}, Write: ${char.isWritableWithResponse || char.isWritableWithoutResponse}, Notify: ${char.isNotifiable}`);
              return {
                uuid: char.uuid,
                isReadable: char.isReadable,
                isWritableWithResponse: char.isWritableWithResponse,
                isWritableWithoutResponse: char.isWritableWithoutResponse,
                isNotifiable: char.isNotifiable,
                isIndicatable: char.isIndicatable,
              };
            }),
          };
        })
      );
      
      console.log("✅ Services discovery complete");
      return servicesWithCharacteristics;
    } catch (error) {
      console.error("❌ Get services error:", error);
      throw error;
    }
  };

  return {
    // State
    allDevices,
    connectedDevice,
    isScanning,
    bluetoothState,
    
    // Methods
    scanForDevices,
    stopScanning,
    connectToDevice,
    disconnectFromDevice,
    readCharacteristic,
    writeCharacteristic,
    subscribeToCharacteristic,
    getServicesAndCharacteristics,
    requestPermissions,
    cleanup,
  };
}

export default useBLE;
