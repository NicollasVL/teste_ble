import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import useBLE from "@/hooks/useBLE";
import { State } from "react-native-ble-plx";

export default function BLEScreen() {
  const {
    allDevices,
    connectedDevice,
    isScanning,
    bluetoothState,
    scanForDevices,
    stopScanning,
    connectToDevice,
    disconnectFromDevice,
    getServicesAndCharacteristics,
  } = useBLE();

  const [services, setServices] = useState<any[]>([]);

  const handleScan = () => {
    if (isScanning) {
      stopScanning();
    } else {
      scanForDevices();
    }
  };

  const handleConnect = async (device: any) => {
    try {
      console.log("🔵 Attempting to connect to:", device.name, device.id);
      const connectedDev = await connectToDevice(device);
      console.log("✅ Connected successfully!");
      
      // Wait longer for the device to be fully ready (especially for audio devices)
      console.log("⏳ Waiting for device to be ready...");
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Try to get services multiple times if needed
      let deviceServices: any[] = [];
      let attempts = 0;
      const maxAttempts = 3;
      
      while (attempts < maxAttempts && deviceServices.length === 0) {
        attempts++;
        try {
          console.log(`🔍 Discovering services (attempt ${attempts}/${maxAttempts})...`);
          deviceServices = await getServicesAndCharacteristics();
          console.log("📋 Services found:", deviceServices.length);
          
          if (deviceServices.length === 0 && attempts < maxAttempts) {
            console.log("⏳ No services found, waiting 2s before retry...");
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        } catch (serviceError: any) {
          console.error(`❌ Attempt ${attempts} failed:`, serviceError.message);
          if (attempts < maxAttempts) {
            await new Promise(resolve => setTimeout(resolve, 2000));
          }
        }
      }
      
      if (deviceServices.length > 0) {
        console.log("Services details:", JSON.stringify(deviceServices, null, 2));
        setServices(deviceServices);
        Alert.alert(
          "Success", 
          `Connected to ${device.name || device.id}\n\nFound ${deviceServices.length} service(s)`
        );
      } else {
        setServices([]);
        Alert.alert(
          "Connected", 
          `Connected to ${device.name || device.id}\n\nNo services discovered yet. Try the Refresh button.`
        );
      }
    } catch (error: any) {
      console.error("❌ Connection failed:", error);
      Alert.alert("Error", `Failed to connect: ${error.message || "Unknown error"}`);
    }
  };

  const handleDisconnect = async () => {
    try {
      await disconnectFromDevice();
      setServices([]);
      Alert.alert("Disconnected", "Device disconnected successfully");
    } catch (error) {
      Alert.alert("Error", "Failed to disconnect");
    }
  };

  const getBluetoothStatusColor = () => {
    switch (bluetoothState) {
      case State.PoweredOn:
        return "#4CAF50";
      case State.PoweredOff:
        return "#F44336";
      default:
        return "#FFC107";
    }
  };

  const getBluetoothStatusText = () => {
    switch (bluetoothState) {
      case State.PoweredOn:
        return "Bluetooth ON";
      case State.PoweredOff:
        return "Bluetooth OFF";
      case State.Unauthorized:
        return "Unauthorized";
      default:
        return "Unknown";
    }
  };

  const renderDevice = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.deviceItem}
      onPress={() => handleConnect(item)}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name || "Unknown Device"}</Text>
        <Text style={styles.deviceId}>{item.id}</Text>
        {item.rssi && <Text style={styles.deviceRssi}>RSSI: {item.rssi}</Text>}
      </View>
    </TouchableOpacity>
  );

  const renderService = (service: any) => (
    <View key={service.uuid} style={styles.serviceContainer}>
      <Text style={styles.serviceTitle}>Service: {service.uuid}</Text>
      {service.characteristics.map((char: any) => (
        <View key={char.uuid} style={styles.characteristicContainer}>
          <Text style={styles.characteristicText}>Char: {char.uuid}</Text>
          <View style={styles.propertiesContainer}>
            {char.isReadable && (
              <Text style={styles.propertyBadge}>Read</Text>
            )}
            {char.isWritableWithResponse && (
              <Text style={styles.propertyBadge}>Write</Text>
            )}
            {char.isNotifiable && (
              <Text style={styles.propertyBadge}>Notify</Text>
            )}
          </View>
        </View>
      ))}
    </View>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>BLE Scanner</Text>
        <View
          style={[
            styles.statusIndicator,
            { backgroundColor: getBluetoothStatusColor() },
          ]}
        >
          <Text style={styles.statusText}>{getBluetoothStatusText()}</Text>
        </View>
      </View>

      {/* Connected Device Info */}
      {connectedDevice && (
        <View style={styles.connectedDeviceContainer}>
          <Text style={styles.connectedDeviceTitle}>Connected Device</Text>
          <Text style={styles.connectedDeviceName}>
            {connectedDevice.name || connectedDevice.id}
          </Text>
          <View style={styles.buttonRow}>
            <TouchableOpacity
              style={styles.disconnectButton}
              onPress={handleDisconnect}
            >
              <Text style={styles.disconnectButtonText}>Disconnect</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={async () => {
                try {
                  console.log("🔄 Refreshing services with force rediscovery...");
                  const deviceServices = await getServicesAndCharacteristics(true);
                  setServices(deviceServices);
                  Alert.alert(
                    "Refreshed", 
                    deviceServices.length > 0 
                      ? `Found ${deviceServices.length} service(s)` 
                      : "No services found"
                  );
                } catch (error: any) {
                  console.error("Refresh error:", error);
                  Alert.alert("Error", `Failed to refresh: ${error.message}`);
                }
              }}
            >
              <Text style={styles.refreshButtonText}>🔄 Refresh</Text>
            </TouchableOpacity>
          </View>

          {/* Services Info */}
          <Text style={styles.servicesCount}>
            Services found: {services.length}
          </Text>

          {/* Services List */}
          {services.length > 0 ? (
            <ScrollView style={styles.servicesScrollView}>
              <Text style={styles.servicesTitle}>Services & Characteristics:</Text>
              {services.map(renderService)}
            </ScrollView>
          ) : (
            <View style={styles.noServicesContainer}>
              <Text style={styles.noServicesText}>
                ⚠️ No BLE services found
              </Text>
              <Text style={styles.noServicesSubtext}>
                This device may be using Bluetooth Classic for audio.
              </Text>
              <Text style={styles.noServicesSubtext}>
                Try the Refresh button or check AUDIO_BLE_INFO.md for more info.
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Scan Button */}
      {!connectedDevice && (
        <>
          <TouchableOpacity
            style={[
              styles.scanButton,
              isScanning && styles.scanButtonActive,
            ]}
            onPress={handleScan}
            disabled={bluetoothState !== State.PoweredOn}
          >
            {isScanning ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.scanButtonText}>
                {isScanning ? "Stop Scanning" : "Start Scanning"}
              </Text>
            )}
          </TouchableOpacity>

          {/* Devices List */}
          <View style={styles.devicesContainer}>
            <Text style={styles.devicesTitle}>
              Devices Found ({allDevices.length})
            </Text>
            <FlatList
              data={allDevices}
              renderItem={renderDevice}
              keyExtractor={(item) => item.id}
              ListEmptyComponent={
                <Text style={styles.emptyText}>
                  {isScanning
                    ? "Scanning for devices..."
                    : "No devices found. Start scanning to discover BLE devices."}
                </Text>
              }
            />
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 16,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 8,
  },
  statusIndicator: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignSelf: "flex-start",
  },
  statusText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 12,
  },
  connectedDeviceContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    maxHeight: "60%",
  },
  connectedDeviceTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#666",
    marginBottom: 4,
  },
  connectedDeviceName: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2196F3",
    marginBottom: 12,
  },
  buttonRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 12,
  },
  disconnectButton: {
    flex: 1,
    backgroundColor: "#F44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  disconnectButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  refreshButton: {
    flex: 1,
    backgroundColor: "#2196F3",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  refreshButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
  servicesCount: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
    fontWeight: "500",
  },
  servicesScrollView: {
    marginTop: 16,
    maxHeight: 300,
  },
  noServicesContainer: {
    alignItems: "center",
    padding: 20,
    marginTop: 16,
  },
  noServicesText: {
    fontSize: 16,
    color: "#FF9800",
    fontWeight: "600",
    marginBottom: 8,
    textAlign: "center",
  },
  noServicesSubtext: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
    marginTop: 4,
  },
  servicesTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  serviceContainer: {
    backgroundColor: "#f9f9f9",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  serviceTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2196F3",
    marginBottom: 8,
  },
  characteristicContainer: {
    marginLeft: 12,
    marginTop: 4,
    paddingLeft: 8,
    borderLeftWidth: 2,
    borderLeftColor: "#ddd",
  },
  characteristicText: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  propertiesContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
  },
  propertyBadge: {
    fontSize: 10,
    backgroundColor: "#4CAF50",
    color: "#fff",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  scanButton: {
    backgroundColor: "#2196F3",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
  },
  scanButtonActive: {
    backgroundColor: "#F44336",
  },
  scanButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  devicesContainer: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  devicesTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 12,
    color: "#333",
  },
  deviceItem: {
    backgroundColor: "#f9f9f9",
    padding: 16,
    borderRadius: 8,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#2196F3",
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: "#666",
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: "#999",
  },
  emptyText: {
    textAlign: "center",
    color: "#999",
    fontSize: 14,
    marginTop: 32,
  },
});
