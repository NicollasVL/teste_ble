/**
 * Exemplo de Uso do BluetoothService
 * 
 * Este arquivo demonstra como usar o serviço BLE melhorado
 * em um componente React Native
 */

import React, { useEffect, useState } from 'react';
import { View, Text, Button, FlatList, StyleSheet, Alert } from 'react-native';
import { BluetoothService } from '../services/BluetoothService';
import { Device } from 'react-native-ble-plx';
import P_TORK_CONFIG from '../constants/PTorkUUIDs';

// UUIDs do dispositivo P TORK ONE BT (importados da configuração)
const SERVICE_UUID = P_TORK_CONFIG.services.main;
const CHARACTERISTIC_UUID = P_TORK_CONFIG.characteristics.mainData;
const DEVICE_INFO_SERVICE = P_TORK_CONFIG.services.deviceInfo;
const GENERIC_ACCESS_SERVICE = P_TORK_CONFIG.services.genericAccess;

export const BLEServiceExample: React.FC = () => {
  const [bleService] = useState(() => new BluetoothService(
    // Configurações
    {
      devMode: true, // Modo desenvolvedor: mostra todos os dispositivos
      autoConnect: false, // Auto-conecta a dispositivos salvos
      savedDeviceIds: [], // IDs dos dispositivos para auto-conexão
      scanTimeout: 10000, // 10 segundos de scan
    },
    // Callbacks
    {
      onDeviceFound: (device) => {
        console.log('📱 Dispositivo encontrado:', device.name);
        setDevices(bleService.getDeviceList());
      },
      onConnectionStateChange: (connected, device) => {
        if (connected) {
          console.log('✅ Conectado a:', device?.name);
          Alert.alert('Conectado', `Conectado a ${device?.name}`);
          setConnected(true);
        } else {
          console.log('❌ Desconectado');
          Alert.alert('Desconectado', 'Dispositivo desconectado');
          setConnected(false);
        }
      },
      onDataReceived: (data) => {
        console.log('📨 Dados recebidos:', data);
        setReceivedData(prev => [...prev, data]);
      },
      onError: (error) => {
        console.error('❌ Erro BLE:', error);
        Alert.alert('Erro', error.message);
      },
    }
  ));

  const [devices, setDevices] = useState<Device[]>([]);
  const [connected, setConnected] = useState(false);
  const [receivedData, setReceivedData] = useState<string[]>([]);
  const [scanning, setScanning] = useState(false);

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      bleService.destroy();
    };
  }, []);

  const handleStartScan = async () => {
    setScanning(true);
    setDevices([]);
    await bleService.startScan();
    setTimeout(() => setScanning(false), 10000);
  };

  const handleStopScan = () => {
    bleService.stopScan();
    setScanning(false);
  };

  const handleConnect = async (device: Device) => {
    try {
      await bleService.connectToDevice(device);
      
      // Configura comunicação com a característica
      await bleService.setupCommunication(
        SERVICE_UUID,
        CHARACTERISTIC_UUID,
        true, // Escreve valor inicial
        0     // Valor inicial: 0
      );
      
    } catch (error) {
      console.error('Erro ao conectar:', error);
    }
  };

  const handleDisconnect = async () => {
    await bleService.disconnect();
  };

  const handleWriteByte = async (value: number) => {
    try {
      await bleService.writeByte(value);
      Alert.alert('Sucesso', `Escrito: ${value}`);
    } catch (error) {
      console.error('Erro ao escrever:', error);
    }
  };

  const handleWriteString = async (text: string) => {
    try {
      await bleService.writeString(text);
      Alert.alert('Sucesso', `Escrito: ${text}`);
    } catch (error) {
      console.error('Erro ao escrever:', error);
    }
  };

  const handleReadCharacteristic = async () => {
    try {
      const value = await bleService.readCharacteristic(
        SERVICE_UUID,
        CHARACTERISTIC_UUID
      );
      Alert.alert('Valor Lido', value || '(vazio)');
    } catch (error) {
      console.error('Erro ao ler:', error);
    }
  };

  const handleReadDeviceInfo = async () => {
    try {
      const deviceName = await bleService.readCharacteristic(
        GENERIC_ACCESS_SERVICE,
        P_TORK_CONFIG.characteristics.deviceName
      );
      const model = await bleService.readCharacteristic(
        DEVICE_INFO_SERVICE,
        P_TORK_CONFIG.characteristics.modelNumber
      );
      const firmware = await bleService.readCharacteristic(
        DEVICE_INFO_SERVICE,
        P_TORK_CONFIG.characteristics.firmware
      );
      
      Alert.alert(
        'Informações do Dispositivo',
        `Nome: ${deviceName}\nModelo: ${model}\nFirmware: ${firmware}`
      );
    } catch (error) {
      console.error('Erro ao ler informações:', error);
      Alert.alert('Erro', 'Não foi possível ler informações do dispositivo');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>BLE Service Example</Text>

      {/* Controles de Scan */}
      <View style={styles.section}>
        <Button
          title={scanning ? "Parando..." : "Iniciar Scan"}
          onPress={scanning ? handleStopScan : handleStartScan}
          disabled={connected}
        />
      </View>

      {/* Lista de Dispositivos */}
      <View style={styles.section}>
        <Text style={styles.subtitle}>
          Dispositivos Encontrados ({devices.length})
        </Text>
        <FlatList
          data={devices}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.deviceItem}>
              <Text style={styles.deviceName}>
                {item.name || 'Sem nome'}
              </Text>
              <Text style={styles.deviceId}>{item.id}</Text>
              <Button
                title="Conectar"
                onPress={() => handleConnect(item)}
                disabled={connected}
              />
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.emptyText}>
              Nenhum dispositivo encontrado
            </Text>
          }
        />
      </View>

      {/* Controles de Conexão */}
      {connected && (
        <View style={styles.section}>
          <Text style={styles.subtitle}>Dispositivo Conectado</Text>
          <Text style={styles.deviceName}>
            {bleService.getConnectedDevice()?.name}
          </Text>
          
          <Button
            title="Desconectar"
            onPress={handleDisconnect}
            color="#ff3b30"
          />

          {/* Controles de Escrita */}
          <View style={styles.writeControls}>
            <Button
              title="📖 Ler Info do Dispositivo"
              onPress={handleReadDeviceInfo}
              color="#5856d6"
            />
            <Button
              title="📖 Ler Característica Principal"
              onPress={handleReadCharacteristic}
              color="#007aff"
            />
            <Button
              title="✍️ Escrever 0"
              onPress={() => handleWriteByte(0)}
            />
            <Button
              title="✍️ Escrever 115"
              onPress={() => handleWriteByte(115)}
            />
            <Button
              title="✍️ Escrever 'Hello'"
              onPress={() => handleWriteString('Hello')}
            />
          </View>

          {/* Dados Recebidos */}
          <View style={styles.dataSection}>
            <Text style={styles.subtitle}>
              Dados Recebidos ({receivedData.length})
            </Text>
            <FlatList
              data={receivedData}
              keyExtractor={(_, index) => index.toString()}
              renderItem={({ item }) => (
                <Text style={styles.dataItem}>{item}</Text>
              )}
              style={styles.dataList}
            />
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    marginVertical: 10,
  },
  section: {
    marginVertical: 10,
  },
  deviceItem: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 5,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
  },
  deviceId: {
    fontSize: 12,
    color: '#666',
    marginVertical: 5,
  },
  emptyText: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  writeControls: {
    marginVertical: 10,
    gap: 10,
  },
  dataSection: {
    marginTop: 20,
  },
  dataList: {
    maxHeight: 200,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 10,
  },
  dataItem: {
    fontSize: 12,
    fontFamily: 'monospace',
    marginVertical: 2,
  },
});
