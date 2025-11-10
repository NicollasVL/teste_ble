/**
 * Serviço BLE Melhorado
 * Baseado em boas práticas de gerenciamento de conexões BLE
 * Adaptado do código original para react-native-ble-plx
 */

import { BleManager, Device, Characteristic, Subscription, State } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

// Configurações do serviço
interface BLEServiceConfig {
  devMode?: boolean;
  autoConnect?: boolean;
  savedDeviceIds?: string[];
  scanTimeout?: number;
}

// Callbacks para eventos
interface BLEServiceCallbacks {
  onDeviceFound?: (device: Device) => void;
  onConnectionStateChange?: (connected: boolean, device?: Device) => void;
  onDataReceived?: (data: string) => void;
  onError?: (error: Error) => void;
}

export class BluetoothService {
  // Instância principal do BLE Manager
  private manager: BleManager;

  // Configurações
  private config: BLEServiceConfig;
  private callbacks: BLEServiceCallbacks;

  // Estado interno
  public deviceList: Device[] = [];
  public connectedDevice: Device | null = null;
  public valorString: string = "";
  
  private currentCharacteristic: Characteristic | null = null;

  // Assinaturas para limpar depois
  private scanActive: boolean = false;
  private monitorSubscription: Subscription | null = null;
  private disconnectSubscription: Subscription | null = null;
  private stateSubscription: Subscription | null = null;

  // Estado do Bluetooth
  private bluetoothState: State = State.Unknown;

  constructor(config: BLEServiceConfig = {}, callbacks: BLEServiceCallbacks = {}) {
    this.manager = new BleManager();
    this.config = {
      devMode: false,
      autoConnect: false,
      savedDeviceIds: [],
      scanTimeout: 10000,
      ...config,
    };
    this.callbacks = callbacks;

    // Monitor estado do Bluetooth
    this.stateSubscription = this.manager.onStateChange((state) => {
      console.log('📶 Bluetooth state:', state);
      this.bluetoothState = state;
      
      if (state === State.PoweredOn) {
        console.log('✅ Bluetooth ligado e pronto');
      } else if (state === State.PoweredOff) {
        console.warn('⚠️ Bluetooth desligado');
      }
    }, true);
  }

  /**
   * Verifica se o Bluetooth está ligado
   */
  private async checkBluetoothState(): Promise<boolean> {
    const state = await this.manager.state();
    if (state !== State.PoweredOn) {
      console.warn('⚠️ Bluetooth não está ligado. Estado:', state);
      this.callbacks.onError?.(new Error('Bluetooth não está ligado'));
      return false;
    }
    return true;
  }

  /**
   * Inicia a varredura por dispositivos BLE
   */
  public async startScan() {
    try {
      // Verifica estado do Bluetooth
      if (!(await this.checkBluetoothState())) {
        return;
      }

      // Limpa a assinatura anterior se existir
      this.stopScan();
      this.deviceList = []; // Limpa a lista a cada nova busca

      console.log('🔍 Iniciando varredura...');

      // Inicia o scan
      this.scanActive = true;
      this.manager.startDeviceScan(
        null, // Pode filtrar por UUIDs de serviço aqui
        { allowDuplicates: false }, // Evita duplicatas
        (error, device) => {
          if (error) {
            console.error('❌ Erro na varredura:', error);
            this.callbacks.onError?.(error);
            return;
          }

          if (device) {
            this.onDeviceDiscovered(device);
          }
        },
      );

      // Para o scan após timeout configurado
      setTimeout(() => {
        console.log('⏱️ Timeout de varredura atingido');
        this.stopScan();
      }, this.config.scanTimeout);

    } catch (error) {
      console.error('❌ Erro ao iniciar varredura:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Para a varredura de dispositivos
   */
  public stopScan() {
    if (this.scanActive) {
      this.manager.stopDeviceScan();
      this.scanActive = false;
      console.log('🛑 Varredura parada');
    }
  }

  /**
   * Callback chamado para cada dispositivo encontrado
   */
  private onDeviceDiscovered(device: Device) {
    try {
      // Verifica se já está na lista (usando device.id)
      if (this.deviceList.find(d => d.id === device.id)) {
        return;
      }

      // Só adiciona dispositivos com nome
      if (!device.name) {
        return;
      }

      let shouldAdd = false;

      if (this.config.devMode) {
        // Modo desenvolvedor: adiciona todos os dispositivos
        shouldAdd = true;
      } else {
        // Modo produção: adiciona apenas dispositivos específicos
        // Você pode customizar este filtro conforme necessário
        shouldAdd = true;
      }

      if (shouldAdd) {
        console.log('📱 Dispositivo encontrado:', device.name, '|', device.id);
        this.deviceList.push(device);
        
        // Notifica callback
        this.callbacks.onDeviceFound?.(device);

        // Lógica de Auto-Conexão
        if (this.config.autoConnect && this.config.savedDeviceIds) {
          const deviceIdentifier = device.id;

          if (this.config.savedDeviceIds.includes(deviceIdentifier)) {
            console.log('🔄 Auto-conectando a:', device.name);
            this.autoConnect(device);
          }
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar dispositivo descoberto:', error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Auto-conecta a um dispositivo específico
   */
  public async autoConnect(device: Device) {
    try {
      if (!(await this.checkBluetoothState())) {
        return;
      }

      // Para a varredura antes de conectar
      this.stopScan();

      console.log('🔌 Auto-conectando a:', device.name);
      await this.connectToDevice(device);
      
    } catch (error) {
      console.error(`❌ Erro ao auto-conectar a ${device.name}:`, error);
      this.callbacks.onError?.(error as Error);
    }
  }

  /**
   * Conecta a um dispositivo BLE
   */
  public async connectToDevice(device: Device, timeout: number = 10000) {
    try {
      console.log('🔌 Conectando a:', device.name);
      
      // Para qualquer scan ativo
      this.stopScan();

      // Desconecta dispositivo anterior se houver
      if (this.connectedDevice && this.connectedDevice.id !== device.id) {
        await this.disconnect();
      }

      // Conecta ao dispositivo
      const connectedDevice = await device.connect({
        requestMTU: 517,
        timeout: timeout,
      });
      
      this.connectedDevice = connectedDevice;
      console.log('✅ Conectado. Descobrindo serviços...');

      // Aguarda um pouco para estabilizar conexão
      await new Promise(resolve => setTimeout(resolve, 500));

      // Descobre todos os serviços e características
      await connectedDevice.discoverAllServicesAndCharacteristics();
      console.log('✅ Serviços descobertos.');

      // Monitora desconexão
      this.setupDisconnectionMonitor(device.id);

      // Notifica callback
      this.callbacks.onConnectionStateChange?.(true, connectedDevice);

      return connectedDevice;

    } catch (error) {
      console.error(`❌ Erro ao conectar a ${device.name}:`, error);
      this.connectedDevice = null;
      this.callbacks.onConnectionStateChange?.(false);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Configura monitoramento de desconexão
   */
  private setupDisconnectionMonitor(deviceId: string) {
    this.disconnectSubscription?.remove();
    
    this.disconnectSubscription = this.manager.onDeviceDisconnected(
      deviceId,
      (error, device) => {
        if (error) {
          console.error('❌ Erro de desconexão:', error);
        }
        console.log('🔌 Dispositivo desconectado:', device?.name);
        this.connectedDevice = null;
        this.currentCharacteristic = null;
        this.callbacks.onConnectionStateChange?.(false);
      }
    );
  }

  /**
   * Configura comunicação com característica específica
   * (monitoramento de notificações)
   */
  public async setupCommunication(
    serviceUUID: string,
    characteristicUUID: string,
    writeInitialValue: boolean = false,
    initialValue: number = 0
  ) {
    if (!this.connectedDevice) {
      console.warn('⚠️ Nenhum dispositivo conectado para configurar comunicação.');
      throw new Error('Nenhum dispositivo conectado');
    }

    try {
      // Obtém a característica diretamente pelo UUID
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );

      this.currentCharacteristic = characteristic;

      // Limpa monitoramento anterior
      this.monitorSubscription?.remove();

      // Configura monitoramento de notificações
      console.log('🔔 Iniciando monitoramento de notificações...');
      this.monitorSubscription = this.manager.monitorCharacteristicForDevice(
        this.connectedDevice.id,
        serviceUUID,
        characteristicUUID,
        (error, characteristic) => {
          if (error) {
            console.error('❌ Erro na notificação:', error);
            this.callbacks.onError?.(error);
            return;
          }
          
          if (characteristic?.value) {
            // O valor vem em Base64
            const dataBytes = Buffer.from(characteristic.value, 'base64');
            this.valorString = dataBytes.toString('utf-8');
            
            // Notifica callback
            this.callbacks.onDataReceived?.(this.valorString);
          }
        },
      );
      
      console.log('✅ Monitoramento iniciado.');

      // Escreve valor inicial se solicitado
      if (writeInitialValue && this.currentCharacteristic) {
        await this.writeByte(initialValue);
      }
      
    } catch (error) {
      console.error('❌ Erro ao configurar comunicação:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Escreve um único byte para a característica atual
   */
  public async writeByte(value: number) {
    if (!this.connectedDevice || !this.currentCharacteristic) {
      console.warn('⚠️ Não é possível escrever: dispositivo ou característica não definidos.');
      throw new Error('Dispositivo ou característica não definidos');
    }

    try {
      // Converte o byte (número) para um array de bytes e depois para Base64
      const data = Buffer.from([value]).toString('base64');
      
      await this.manager.writeCharacteristicWithResponseForDevice(
        this.connectedDevice.id,
        this.currentCharacteristic.serviceUUID,
        this.currentCharacteristic.uuid,
        data,
      );
      console.log(`✍️ Escrito: ${value}`);
    } catch (error) {
      console.error(`❌ Erro ao escrever ${value}:`, error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Escreve string para a característica atual
   */
  public async writeString(value: string) {
    if (!this.connectedDevice || !this.currentCharacteristic) {
      console.warn('⚠️ Não é possível escrever: dispositivo ou característica não definidos.');
      throw new Error('Dispositivo ou característica não definidos');
    }

    try {
      // Converte string para Base64
      const data = Buffer.from(value, 'utf-8').toString('base64');
      
      await this.manager.writeCharacteristicWithResponseForDevice(
        this.connectedDevice.id,
        this.currentCharacteristic.serviceUUID,
        this.currentCharacteristic.uuid,
        data,
      );
      console.log(`✍️ Escrito: ${value}`);
    } catch (error) {
      console.error(`❌ Erro ao escrever "${value}":`, error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Lê valor de uma característica
   */
  public async readCharacteristic(serviceUUID: string, characteristicUUID: string): Promise<string> {
    if (!this.connectedDevice) {
      throw new Error('Nenhum dispositivo conectado');
    }

    try {
      const characteristic = await this.connectedDevice.readCharacteristicForService(
        serviceUUID,
        characteristicUUID
      );

      if (characteristic.value) {
        const dataBytes = Buffer.from(characteristic.value, 'base64');
        const value = dataBytes.toString('utf-8');
        console.log(`📖 Lido: ${value}`);
        return value;
      }

      return '';
    } catch (error) {
      console.error('❌ Erro ao ler característica:', error);
      this.callbacks.onError?.(error as Error);
      throw error;
    }
  }

  /**
   * Desconecta do dispositivo atual
   */
  public async disconnect() {
    try {
      // Para scan e remove assinaturas
      this.stopScan();
      this.monitorSubscription?.remove();
      this.disconnectSubscription?.remove();

      if (this.connectedDevice) {
        console.log('🔌 Desconectando de:', this.connectedDevice.name);
        await this.connectedDevice.cancelConnection();
        this.connectedDevice = null;
        this.currentCharacteristic = null;
        console.log('✅ Desconectado.');
        this.callbacks.onConnectionStateChange?.(false);
      }
    } catch (error) {
      console.error('❌ Erro ao desconectar:', error);
      // Força limpeza do estado mesmo se desconexão falhar
      this.connectedDevice = null;
      this.currentCharacteristic = null;
    }
  }

  /**
   * Limpa todos os recursos
   */
  public async destroy() {
    console.log('🧹 Destruindo serviço BLE...');
    await this.disconnect();
    this.stateSubscription?.remove();
    this.deviceList = [];
    this.valorString = "";
  }

  /**
   * Obtém lista de dispositivos encontrados
   */
  public getDeviceList(): Device[] {
    return this.deviceList;
  }

  /**
   * Verifica se está conectado
   */
  public isConnected(): boolean {
    return this.connectedDevice !== null;
  }

  /**
   * Obtém dispositivo conectado
   */
  public getConnectedDevice(): Device | null {
    return this.connectedDevice;
  }
}

// Exporta instância singleton (opcional)
export const bluetoothService = new BluetoothService();
