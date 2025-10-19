import { useState, useEffect } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import { BleManager, Device, State } from "react-native-ble-plx";
import * as ExpoDevice from "expo-device";
import { Buffer } from "buffer";

// BLE Device interface
interface BLEDevice {
  id: string;
  name: string | null;
  rssi: number | null;
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
      const deviceConnection = await bleManager.connectToDevice(device.id);
      setConnectedDevice(deviceConnection);
      await deviceConnection.discoverAllServicesAndCharacteristics();
      
      // Monitor disconnection
      bleManager.onDeviceDisconnected(device.id, (error, disconnectedDevice) => {
        if (error) {
          console.error("Disconnection error:", error);
        }
        console.log("Device disconnected:", disconnectedDevice?.name);
        setConnectedDevice(null);
      });

      return deviceConnection;
    } catch (error) {
      console.error("Connection error:", error);
      throw error;
    }
  };

  // Disconnect from device
  const disconnectFromDevice = async () => {
    if (connectedDevice) {
      try {
        await bleManager.cancelDeviceConnection(connectedDevice.id);
        setConnectedDevice(null);
      } catch (error) {
        console.error("Disconnect error:", error);
      }
    }
  };

  // Read from a characteristic
  const readCharacteristic = async (
    serviceUUID: string,
    characteristicUUID: string
  ) => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      const characteristic = await connectedDevice.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );

      if (characteristic.value) {
        const decodedValue = Buffer.from(characteristic.value, "base64").toString(
          "utf-8"
        );
        return decodedValue;
      }
    } catch (error) {
      console.error("Read characteristic error:", error);
      throw error;
    }
  };

  // Write to a characteristic
  const writeCharacteristic = async (
    serviceUUID: string,
    characteristicUUID: string,
    value: string
  ) => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      const encodedValue = Buffer.from(value, "utf-8").toString("base64");
      await connectedDevice.writeCharacteristicWithResponseForService(
        serviceUUID,
        characteristicUUID,
        encodedValue
      );
      return true;
    } catch (error) {
      console.error("Write characteristic error:", error);
      throw error;
    }
  };

  // Subscribe to characteristic notifications
  const subscribeToCharacteristic = (
    serviceUUID: string,
    characteristicUUID: string,
    callback: (value: string) => void
  ) => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    connectedDevice.monitorCharacteristicForService(
      serviceUUID,
      characteristicUUID,
      (error, characteristic) => {
        if (error) {
          console.error("Monitor error:", error);
          return;
        }

        if (characteristic?.value) {
          const decodedValue = Buffer.from(characteristic.value, "base64").toString(
            "utf-8"
          );
          callback(decodedValue);
        }
      }
    );
  };

  // Get services and characteristics of connected device
  const getServicesAndCharacteristics = async () => {
    if (!connectedDevice) {
      throw new Error("No device connected");
    }

    try {
      const services = await connectedDevice.services();
      const servicesWithCharacteristics = await Promise.all(
        services.map(async (service) => {
          const characteristics = await service.characteristics();
          return {
            uuid: service.uuid,
            characteristics: characteristics.map((char) => ({
              uuid: char.uuid,
              isReadable: char.isReadable,
              isWritableWithResponse: char.isWritableWithResponse,
              isWritableWithoutResponse: char.isWritableWithoutResponse,
              isNotifiable: char.isNotifiable,
            })),
          };
        })
      );
      return servicesWithCharacteristics;
    } catch (error) {
      console.error("Get services error:", error);
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
  };
}

export default useBLE;
