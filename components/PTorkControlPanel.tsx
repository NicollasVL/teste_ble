/**
 * Painel de Controle do P TORK ONE BT
 * 
 * Interface completa para controlar o pedal:
 * - Trocar mapas (0-6)
 * - Ler pressão em tempo real
 * - Visualizar dados recebidos
 * - Configurações personalizadas
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Device } from 'react-native-ble-plx';
import MapConverter from '../utils/MapConverter';
import P_TORK_CONFIG from '../constants/PTorkUUIDs';

interface PTorkControlPanelProps {
  device: Device;
  onRead: (serviceUUID: string, charUUID: string) => Promise<string>;
  onWrite: (serviceUUID: string, charUUID: string, value: string) => Promise<void>;
  onSubscribe: (
    serviceUUID: string,
    charUUID: string,
    callback: (value: string) => void
  ) => Promise<any>;
}

export const PTorkControlPanel: React.FC<PTorkControlPanelProps> = ({
  device,
  onRead,
  onWrite,
  onSubscribe,
}) => {
  console.log('🎮 PTorkControlPanel: Iniciando componente para device:', device.name);
  
  const [selectedMap, setSelectedMap] = useState<number>(0);
  const [currentPressure, setCurrentPressure] = useState<string>('0,0');
  const [currentPressureBar, setCurrentPressureBar] = useState<number>(0);
  const [receivedData, setReceivedData] = useState<number[]>([]);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deviceInfo, setDeviceInfo] = useState<{
    name: string;
    model: string;
    firmware: string;
  } | null>(null);

  // Configurar monitoramento de dados ao montar
  useEffect(() => {
    console.log('🎮 PTorkControlPanel: useEffect executado');
    setupDataMonitoring();
    loadDeviceInfo();
  }, []);

  /**
   * Configura monitoramento da característica principal
   */
  const setupDataMonitoring = async () => {
    try {
      console.log('📡 Configurando monitoramento de dados...');
      await onSubscribe(
        P_TORK_CONFIG.services.main,
        P_TORK_CONFIG.characteristics.mainData,
        (value) => {
          handleDataReceived(value);
        }
      );
      setIsSubscribed(true);
      console.log('✅ Monitoramento de dados ativado');
    } catch (error: any) {
      console.error('❌ Erro ao configurar monitoramento:', error?.message || error);
      setIsSubscribed(false);
      // Não impedir o painel de carregar por causa disso
      Alert.alert(
        'Aviso',
        'Não foi possível ativar monitoramento automático. Use o botão Refresh para atualizar dados.',
        [{ text: 'OK' }]
      );
    }
  };

  /**
   * Processa dados recebidos do pedal
   */
  const handleDataReceived = (value: string) => {
    try {
      // Converter string para array de bytes
      const bytes: number[] = [];
      for (let i = 0; i < value.length; i++) {
        bytes.push(value.charCodeAt(i));
      }
      
      setReceivedData(bytes);
      
      // Interpretar dados
      console.log('📨 Dados recebidos:', bytes);
      
      // Se tiver dados de pressão (bytes 200-250)
      if (bytes.length > 0 && bytes[0] >= 200 && bytes[0] <= 250) {
        const position = MapConverter.ConvertByteToPosition(bytes[0]);
        const kgf = MapConverter.ConvertPositionToKgf(position);
        const bar = MapConverter.ConvertPositionToBar(position);
        
        setCurrentPressure(kgf);
        setCurrentPressureBar(bar);
      }
      
      // Se tiver dados de mapa (bytes 20-26)
      if (bytes.length > 0 && bytes[0] >= 20 && bytes[0] <= 26) {
        const gasMap = MapConverter.PtoG(bytes[0]);
        setSelectedMap(gasMap);
        console.log('🗺️ Mapa atual:', gasMap);
      }
    } catch (error) {
      console.error('❌ Erro ao processar dados:', error);
    }
  };

  /**
   * Carrega informações do dispositivo
   */
  const loadDeviceInfo = async () => {
    try {
      let name = device.name || 'P TORK';
      let model = 'P TORK ONE BT';
      let firmware = 'N/A';
      
      // Tentar ler nome do dispositivo (opcional)
      try {
        name = await onRead(
          P_TORK_CONFIG.services.genericAccess,
          P_TORK_CONFIG.characteristics.deviceName
        );
      } catch (e) {
        console.log('Info: Device name not readable, using default');
      }
      
      // Tentar ler modelo (opcional)
      try {
        model = await onRead(
          P_TORK_CONFIG.services.deviceInfo,
          P_TORK_CONFIG.characteristics.modelNumber
        );
      } catch (e) {
        console.log('Info: Model number not readable, using default');
      }
      
      // Tentar ler firmware (opcional)
      try {
        firmware = await onRead(
          P_TORK_CONFIG.services.deviceInfo,
          P_TORK_CONFIG.characteristics.firmware
        );
      } catch (e) {
        console.log('Info: Firmware not readable, using default');
      }
      
      setDeviceInfo({ name, model, firmware });
      console.log('✅ Device info loaded:', { name, model, firmware });
    } catch (error) {
      console.error('Erro ao ler info do dispositivo:', error);
      // Definir info padrão mesmo com erro
      setDeviceInfo({ 
        name: device.name || 'P TORK', 
        model: 'P TORK ONE BT', 
        firmware: 'N/A' 
      });
    }
  };

  /**
   * Envia comando para trocar o mapa
   */
  const handleChangeMap = async (gasMap: number) => {
    setLoading(true);
    try {
      // Converter mapa Gas para byte Pedal
      const pedalByte = MapConverter.GtoP(gasMap);
      
      console.log(`🗺️ Trocando para Mapa ${gasMap} (byte ${pedalByte})`);
      
      // Converter byte para string
      const data = String.fromCharCode(pedalByte);
      
      // Enviar para o pedal
      await onWrite(
        P_TORK_CONFIG.services.main,
        P_TORK_CONFIG.characteristics.mainData,
        data
      );
      
      setSelectedMap(gasMap);
      Alert.alert('Sucesso', `Mapa ${gasMap} ativado!`);
      
    } catch (error) {
      console.error('❌ Erro ao trocar mapa:', error);
      Alert.alert('Erro', 'Não foi possível trocar o mapa');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Lê dados da característica principal
   */
  const handleReadData = async () => {
    setLoading(true);
    try {
      const value = await onRead(
        P_TORK_CONFIG.services.main,
        P_TORK_CONFIG.characteristics.mainData
      );
      
      handleDataReceived(value);
      Alert.alert('Dados Lidos', `Recebido: ${receivedData.join(', ')}`);
      
    } catch (error) {
      console.error('❌ Erro ao ler dados:', error);
      Alert.alert('Erro', 'Não foi possível ler os dados');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Renderiza botão de mapa
   */
  const renderMapButton = (mapNumber: number) => {
    const mapInfo = MapConverter.getMapInfo(mapNumber);
    const isSelected = selectedMap === mapNumber;
    
    return (
      <TouchableOpacity
        key={mapNumber}
        style={[
          styles.mapButton,
          {
            backgroundColor: mapInfo.color,
            borderWidth: isSelected ? 4 : 2,
            borderColor: isSelected ? '#000' : '#666',
            opacity: loading ? 0.5 : 1,
          }
        ]}
        onPress={() => handleChangeMap(mapNumber)}
        disabled={loading}
      >
        <Text style={styles.mapNumber}>MAP {mapNumber}</Text>
        <Text style={styles.mapLetter}>({mapInfo.letter.toUpperCase()})</Text>
        {isSelected && (
          <View style={styles.selectedBadge}>
            <Text style={styles.selectedText}>✓</Text>
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <ScrollView style={styles.container}>
      {/* Informações do Dispositivo */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📱 Dispositivo</Text>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {deviceInfo?.name || device.name || 'P TORK ONE BT'}
          </Text>
          {deviceInfo && (
            <>
              <Text style={styles.infoSubtext}>Modelo: {deviceInfo.model}</Text>
              <Text style={styles.infoSubtext}>Firmware: {deviceInfo.firmware}</Text>
            </>
          )}
          <View style={styles.statusBadge}>
            <View style={[styles.statusDot, { backgroundColor: '#00FF00' }]} />
            <Text style={styles.statusText}>Conectado</Text>
          </View>
        </View>
      </View>

      {/* Seletor de Mapas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🗺️ Selecionar Mapa</Text>
        <Text style={styles.subtitle}>
          Escolha o mapa de potência do pedal
        </Text>
        
        <View style={styles.mapGrid}>
          {MapConverter.getAllMaps().map(renderMapButton)}
        </View>
        
        {loading && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        )}
      </View>

      {/* Indicador de Pressão */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🎚️ Pressão Atual</Text>
        
        <View style={styles.pressureCard}>
          <View style={styles.pressureMain}>
            <Text style={styles.pressureValue}>{currentPressure}</Text>
            <Text style={styles.pressureUnit}>Kgf/cm²</Text>
          </View>
          
          <View style={styles.pressureSecondary}>
            <Text style={styles.pressureValueBar}>
              {currentPressureBar.toFixed(3)}
            </Text>
            <Text style={styles.pressureUnitBar}>Bar</Text>
          </View>
        </View>
      </View>

      {/* Dados Recebidos em Tempo Real */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>📊 Dados em Tempo Real</Text>
        
        <View style={styles.dataCard}>
          <View style={styles.dataHeader}>
            <Text style={styles.dataLabel}>
              {isSubscribed ? '🔔 Monitorando' : '🔕 Não monitorando'}
            </Text>
            <TouchableOpacity
              style={styles.refreshButton}
              onPress={handleReadData}
              disabled={loading}
            >
              <Text style={styles.refreshText}>🔄 Ler</Text>
            </TouchableOpacity>
          </View>
          
          <View style={styles.dataBytes}>
            <Text style={styles.dataBytesLabel}>Bytes:</Text>
            <Text style={styles.dataBytesValue}>
              {receivedData.length > 0
                ? `[${receivedData.slice(0, 10).join(', ')}${receivedData.length > 10 ? '...' : ''}]`
                : '[Aguardando dados...]'}
            </Text>
          </View>
          
          {receivedData.length > 0 && (
            <View style={styles.dataHex}>
              <Text style={styles.dataHexLabel}>Hex:</Text>
              <Text style={styles.dataHexValue}>
                {receivedData
                  .slice(0, 10)
                  .map(b => b.toString(16).padStart(2, '0').toUpperCase())
                  .join(' ')}
              </Text>
            </View>
          )}
        </View>
      </View>

      {/* Ações Rápidas */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ Ações Rápidas</Text>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#007AFF' }]}
          onPress={() => handleChangeMap(0)}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>🏁 Resetar (Mapa 0)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#FF3B30' }]}
          onPress={() => handleChangeMap(6)}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>🔥 Máximo (Mapa 6)</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.actionButton, { backgroundColor: '#34C759' }]}
          onPress={loadDeviceInfo}
          disabled={loading}
        >
          <Text style={styles.actionButtonText}>ℹ️ Atualizar Info</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  section: {
    padding: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  
  // Info do Dispositivo
  infoCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8,
  },
  statusText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00FF00',
  },
  
  // Mapas
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    justifyContent: 'center',
  },
  mapButton: {
    width: 100,
    height: 90,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  mapNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000',
  },
  mapLetter: {
    fontSize: 12,
    color: '#333',
    marginTop: 5,
  },
  selectedBadge: {
    position: 'absolute',
    top: 5,
    right: 5,
    backgroundColor: '#000',
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loader: {
    marginTop: 15,
  },
  
  // Pressão
  pressureCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  pressureMain: {
    alignItems: 'center',
    marginBottom: 15,
  },
  pressureValue: {
    fontSize: 64,
    fontWeight: 'bold',
    color: '#FF3B30',
  },
  pressureUnit: {
    fontSize: 18,
    color: '#666',
    marginTop: -10,
  },
  pressureSecondary: {
    alignItems: 'center',
  },
  pressureValueBar: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  pressureUnitBar: {
    fontSize: 14,
    color: '#666',
  },
  
  // Dados
  dataCard: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dataHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dataLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  refreshButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 6,
  },
  refreshText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  dataBytes: {
    marginBottom: 10,
  },
  dataBytesLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dataBytesValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#333',
  },
  dataHex: {
    marginTop: 10,
  },
  dataHexLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 5,
  },
  dataHexValue: {
    fontSize: 14,
    fontFamily: 'monospace',
    color: '#007AFF',
  },
  
  // Ações
  actionButton: {
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
