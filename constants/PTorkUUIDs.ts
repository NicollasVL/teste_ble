/**
 * Configuração de UUIDs BLE para P TORK ONE BT
 * 
 * Este arquivo centraliza todos os UUIDs das características BLE
 * do dispositivo P TORK ONE BT (Pedal/Controlador)
 */

// ============================================
// SERVIÇOS PRINCIPAIS
// ============================================

/**
 * Serviço Principal de Dados
 * Usado para comunicação principal (leitura/escrita/notificações)
 */
export const MAIN_SERVICE_UUID = '0000ffe0-0000-1000-8000-00805f9b34fb';

/**
 * Serviço de Informações Genéricas
 * Contém informações do dispositivo (nome, aparência, etc)
 */
export const GENERIC_ACCESS_SERVICE = '00001800-0000-1000-8000-00805f9b34fb';

/**
 * Serviço de Informações do Dispositivo
 * Contém modelo, fabricante, firmware, etc
 */
export const DEVICE_INFO_SERVICE = '0000180a-0000-1000-8000-00805f9b34fb';

// ============================================
// CARACTERÍSTICAS PRINCIPAIS
// ============================================

/**
 * Característica Principal de Dados
 * UUID: 0000ffe1
 * Propriedades: Read, Write, Notify
 * Uso: Comunicação principal com o pedal
 * Dados típicos: [01, 02, 03, 04, 05, 00, 00, ...]
 */
export const MAIN_DATA_CHAR = '0000ffe1-0000-1000-8000-00805f9b34fb';

// ============================================
// CARACTERÍSTICAS DE INFORMAÇÃO DO DISPOSITIVO
// ============================================

/**
 * Nome do Dispositivo
 * UUID: 00002a00
 * Valor: "P TORK ONE BT"
 * Propriedades: Read
 */
export const DEVICE_NAME_CHAR = '00002a00-0000-1000-8000-00805f9b34fb';

/**
 * Aparência (Appearance)
 * UUID: 00002a01
 * Valor: [00, 00]
 * Propriedades: Read
 */
export const APPEARANCE_CHAR = '00002a01-0000-1000-8000-00805f9b34fb';

/**
 * Flags de Privacidade
 * UUID: 00002a02
 * Valor: [00]
 * Propriedades: Read
 */
export const PRIVACY_FLAG_CHAR = '00002a02-0000-1000-8000-00805f9b34fb';

/**
 * Parâmetros de Conexão Periférica
 * UUID: 00002a04
 * Valor: Binário (parâmetros de conexão)
 * Propriedades: Read
 */
export const PERIPHERAL_PARAMS_CHAR = '00002a04-0000-1000-8000-00805f9b34fb';

/**
 * ID do Sistema (System ID)
 * UUID: 00002a23
 * Valor: "Yz�>1\" (dados binários)
 * Propriedades: Read
 */
export const SYSTEM_ID_CHAR = '00002a23-0000-1000-8000-00805f9b34fb';

/**
 * Número do Modelo
 * UUID: 00002a24
 * Valor: "Model Number"
 * Propriedades: Read
 */
export const MODEL_NUMBER_CHAR = '00002a24-0000-1000-8000-00805f9b34fb';

/**
 * Número de Série
 * UUID: 00002a25
 * Valor: "Serial Number"
 * Propriedades: Read
 */
export const SERIAL_NUMBER_CHAR = '00002a25-0000-1000-8000-00805f9b34fb';

/**
 * Versão do Firmware
 * UUID: 00002a26
 * Valor: "Firmware Revision"
 * Propriedades: Read
 */
export const FIRMWARE_CHAR = '00002a26-0000-1000-8000-00805f9b34fb';

/**
 * Versão do Hardware
 * UUID: 00002a27
 * Valor: "Hardware Revision"
 * Propriedades: Read
 */
export const HARDWARE_CHAR = '00002a27-0000-1000-8000-00805f9b34fb';

/**
 * Versão do Software
 * UUID: 00002a28
 * Valor: "Software Revision"
 * Propriedades: Read
 */
export const SOFTWARE_CHAR = '00002a28-0000-1000-8000-00805f9b34fb';

/**
 * Nome do Fabricante
 * UUID: 00002a29
 * Valor: "Manufacturer Name"
 * Propriedades: Read
 */
export const MANUFACTURER_CHAR = '00002a29-0000-1000-8000-00805f9b34fb';

/**
 * Certificação Regulatória
 * UUID: 00002a2a
 * Valor: "�experimental" (dados experimentais)
 * Propriedades: Read
 */
export const REGULATORY_CERT_CHAR = '00002a2a-0000-1000-8000-00805f9b34fb';

/**
 * Informação PnP (Plug and Play)
 * UUID: 00002a50
 * Valor: [01, 0D, 00, 00, 00, 10, 01]
 * Propriedades: Read
 */
export const PNP_ID_CHAR = '00002a50-0000-1000-8000-00805f9b34fb';

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Mapa de UUIDs para nomes legíveis
 */
export const UUID_NAME_MAP: Record<string, string> = {
  [MAIN_DATA_CHAR]: 'Dados Principais (FFE1)',
  [DEVICE_NAME_CHAR]: 'Nome do Dispositivo',
  [APPEARANCE_CHAR]: 'Aparência',
  [PRIVACY_FLAG_CHAR]: 'Flags de Privacidade',
  [PERIPHERAL_PARAMS_CHAR]: 'Parâmetros de Conexão',
  [SYSTEM_ID_CHAR]: 'ID do Sistema',
  [MODEL_NUMBER_CHAR]: 'Número do Modelo',
  [SERIAL_NUMBER_CHAR]: 'Número de Série',
  [FIRMWARE_CHAR]: 'Versão do Firmware',
  [HARDWARE_CHAR]: 'Versão do Hardware',
  [SOFTWARE_CHAR]: 'Versão do Software',
  [MANUFACTURER_CHAR]: 'Nome do Fabricante',
  [REGULATORY_CERT_CHAR]: 'Certificação Regulatória',
  [PNP_ID_CHAR]: 'PnP ID',
};

/**
 * Obtém nome legível de um UUID
 */
export function getCharacteristicName(uuid: string): string {
  return UUID_NAME_MAP[uuid.toLowerCase()] || uuid;
}

/**
 * Configuração completa do dispositivo P TORK ONE BT
 */
export const P_TORK_CONFIG = {
  // Serviços
  services: {
    main: MAIN_SERVICE_UUID,
    genericAccess: GENERIC_ACCESS_SERVICE,
    deviceInfo: DEVICE_INFO_SERVICE,
  },
  
  // Características principais
  characteristics: {
    mainData: MAIN_DATA_CHAR,
    deviceName: DEVICE_NAME_CHAR,
    modelNumber: MODEL_NUMBER_CHAR,
    serialNumber: SERIAL_NUMBER_CHAR,
    firmware: FIRMWARE_CHAR,
    hardware: HARDWARE_CHAR,
    software: SOFTWARE_CHAR,
    manufacturer: MANUFACTURER_CHAR,
  },
  
  // Filtros para scan
  scanFilter: {
    name: 'P TORK ONE BT',
    namePrefix: 'P TORK',
  },
  
  // Valores padrão
  defaults: {
    scanTimeout: 10000,
    connectionTimeout: 10000,
    mtu: 517,
  },
};

// Exportação default
export default P_TORK_CONFIG;
