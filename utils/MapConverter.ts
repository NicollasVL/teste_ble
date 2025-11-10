/**
 * MapConverter - Conversão de Mapas do P TORK ONE BT
 * 
 * Convertido de C# (Xamarin) para TypeScript (React Native)
 * 
 * Gerencia conversões entre:
 * - Mapas do Gas (0-6) <-> Pedal (20-26)
 * - Letras (z, a-f) <-> Números (0-6)
 * - Valores de pressão <-> Posições visuais
 * - Cores associadas a cada mapa
 */

// Comentado temporariamente - será implementado depois
// import AsyncStorage from '@react-native-async-storage/async-storage';

// ============================================
// TIPOS E INTERFACES
// ============================================

export type GasMap = 0 | 1 | 2 | 3 | 4 | 5 | 6;
export type PedalMap = 20 | 21 | 22 | 23 | 24 | 25 | 26;
export type MapLetter = 'z' | 'a' | 'b' | 'c' | 'd' | 'e' | 'f';

export interface MapColor {
  hex: string;
  name: string;
}

// ============================================
// CONVERSÃO GAS <-> PEDAL
// ============================================

/**
 * Converte mapa Gas (0-6) para mapa Pedal (20-26)
 * 
 * @param x Valor do mapa Gas (0-6)
 * @returns Valor do mapa Pedal (20-26)
 * 
 * @example
 * GtoP(0) // retorna 20
 * GtoP(3) // retorna 23
 */
export function GtoP(x: number): number {
  const map: Record<number, number> = {
    0: 20,
    1: 21,
    2: 22,
    3: 23,
    4: 24,
    5: 25,
    6: 26,
  };
  
  return map[x] || 0;
}

/**
 * Converte mapa Pedal (20-26) para mapa Gas (0-6)
 * 
 * @param x Valor do mapa Pedal (20-26)
 * @returns Valor do mapa Gas (0-6)
 * 
 * @example
 * PtoG(20) // retorna 0
 * PtoG(23) // retorna 3
 */
export function PtoG(x: number): number {
  const map: Record<number, number> = {
    20: 0,
    21: 1,
    22: 2,
    23: 3,
    24: 4,
    25: 5,
    26: 6,
  };
  
  return map[x] || 0;
}

/**
 * Converte letra do mapa para número Gas (0-6)
 * 
 * @param x Letra do mapa (z, a-f)
 * @returns Valor do mapa Gas (0-6)
 * 
 * @example
 * PtoGInputLetter('z') // retorna 0
 * PtoGInputLetter('a') // retorna 1
 * PtoGInputLetter('f') // retorna 6
 */
export function PtoGInputLetter(x: string): number {
  const map: Record<string, number> = {
    'z': 0,
    'a': 1,
    'b': 2,
    'c': 3,
    'd': 4,
    'e': 5,
    'f': 6,
  };
  
  return map[x.toLowerCase()] || 0;
}

// ============================================
// SINCRONIZAÇÃO COM CHIP (AsyncStorage)
// ============================================

/**
 * Converte mapa Gas para Pedal usando valores salvos no AsyncStorage
 * 
 * @param x Índice do mapa (0-6 ou 8 para eco)
 * @returns Promise com valor do mapa Pedal
 * 
 * TODO: Implementar quando AsyncStorage estiver configurado
 */
export async function SyncChip_GtoP(x: number): Promise<number> {
  // Temporariamente retorna valor padrão sem AsyncStorage
  return GtoP(x);
  
  /* IMPLEMENTAÇÃO COMPLETA (descomentar depois):
  const keys: Record<number, string> = {
    0: 'sc_gtop_m0',
    1: 'sc_gtop_m1',
    2: 'sc_gtop_m2',
    3: 'sc_gtop_m3',
    4: 'sc_gtop_m4',
    5: 'sc_gtop_m5',
    6: 'sc_gtop_m6',
    8: 'sc_gtop_meco',
  };
  
  const defaults: Record<number, number> = {
    0: 0, 1: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 8: 0,
  };
  
  try {
    const key = keys[x];
    if (!key) return 0;
    
    const stored = await AsyncStorage.getItem(key);
    const value = stored ? parseInt(stored, 10) : defaults[x];
    
    return GtoP(value);
  } catch (error) {
    console.error('Erro ao ler SyncChip_GtoP:', error);
    return 0;
  }
  */
}

/**
 * Converte mapa Pedal para Gas usando valores salvos no AsyncStorage
 * 
 * @param x Valor do mapa Pedal (20-26)
 * @returns Promise com valor do mapa Gas
 * 
 * TODO: Implementar quando AsyncStorage estiver configurado
 */
export async function SyncChip_PtoG(x: number): Promise<number> {
  // Temporariamente retorna valor padrão sem AsyncStorage
  return PtoG(x);
  
  /* IMPLEMENTAÇÃO COMPLETA (descomentar depois):
  const keys: Record<number, string> = {
    20: 'sc_ptog_m0',
    21: 'sc_ptog_m1',
    22: 'sc_ptog_m2',
    23: 'sc_ptog_m3',
    24: 'sc_ptog_m4',
    25: 'sc_ptog_m5',
    26: 'sc_ptog_m6',
  };
  
  const defaults: Record<number, number> = {
    20: 0, 21: 1, 22: 2, 23: 3, 24: 4, 25: 5, 26: 6,
  };
  
  try {
    const key = keys[x];
    if (!key) return 0;
    
    const stored = await AsyncStorage.getItem(key);
    const value = stored ? parseInt(stored, 10) : defaults[x];
    
    return value;
  } catch (error) {
    console.error('Erro ao ler SyncChip_PtoG:', error);
    return 0;
  }
  */
}

// ============================================
// CORES DOS MAPAS
// ============================================

/**
 * Retorna a cor associada ao mapa Gas (0-9)
 * 
 * @param map Valor do mapa Gas como string
 * @returns Código hexadecimal da cor
 * 
 * @example
 * ReturnColorGas('0') // retorna '#FFFFFF' (branco)
 * ReturnColorGas('6') // retorna '#FF0000' (vermelho)
 */
export function ReturnColorGas(map: string): string {
  const colors: Record<string, string> = {
    '0': '#FFFFFF', // Branco
    '1': '#40E0D0', // Turquoise
    '2': '#008000', // Green
    '3': '#00FF00', // Lime
    '4': '#FFFF00', // Yellow
    '5': '#FFA500', // Orange
    '6': '#FF0000', // Red
    '7': '#305c93', // Azul escuro
    '8': '#357135', // Verde escuro
    '9': '#b50000', // Vermelho escuro
  };
  
  return colors[map] || '#808080'; // Gray como padrão
}

/**
 * Retorna a cor associada ao mapa Pedal (byte 20-26)
 * 
 * @param map Valor do mapa Pedal (20-26)
 * @returns Código hexadecimal da cor
 */
export function ReturnColorPiggyInputByte(map: number): string {
  const colors: Record<number, string> = {
    20: '#FFFFFF', // Branco
    21: '#40E0D0', // Turquoise
    22: '#008000', // Green
    23: '#00FF00', // Lime
    24: '#FFFF00', // Yellow
    25: '#FFA500', // Orange
    26: '#FF0000', // Red
  };
  
  return colors[map] || '#808080'; // Gray como padrão
}

/**
 * Retorna a cor associada à letra do mapa
 * 
 * @param map Letra do mapa (z, a-f)
 * @returns Código hexadecimal da cor
 */
export function ReturnColorPiggyInputString(map: string): string {
  const colors: Record<string, string> = {
    'a': '#40E0D0', // Turquoise
    'b': '#008000', // Green
    'c': '#00FF00', // Lime
    'd': '#FFFF00', // Yellow
    'e': '#FFA500', // Orange
    'f': '#FF0000', // Red
  };
  
  return colors[map.toLowerCase()] || '#FFFFFF'; // Branco como padrão
}

/**
 * Retorna o nome do recurso de imagem para o mapa Gas
 * 
 * @param map Valor do mapa Gas como string
 * @returns Nome do arquivo de imagem (sem extensão)
 */
export function ReturnImageSource_GasPedal(map: string): string {
  const images: Record<string, string> = {
    '0': 'selectbutton_map0',
    '1': 'selectbutton_map1',
    '2': 'selectbutton_map2',
    '3': 'selectbutton_map3',
    '4': 'selectbutton_map4',
    '5': 'selectbutton_map5',
    '6': 'selectbutton_map6',
  };
  
  return images[map] || '';
}

// ============================================
// CONVERSÃO DE PRESSÃO (MANÔMETRO)
// ============================================

/**
 * Converte posição para valor em Bar
 * 
 * @param value Posição (50-308)
 * @returns Valor em Bar (0.0 - 2.0)
 * 
 * @example
 * ConvertPositionToBar(50)  // retorna 0.0
 * ConvertPositionToBar(174) // retorna 0.980665 (1.0 Bar)
 * ConvertPositionToBar(308) // retorna 1.471005 (2.0 Bar)
 */
export function ConvertPositionToBar(value: number): number {
  const barMap: Record<number, number> = {
    50: 0.0,
    55: 0.098067,
    65: 0.196133,
    79: 0.294201,
    93: 0.392266,
    106: 0.490333,
    119: 0.588399,
    133: 0.686466,
    145: 0.784532,
    159: 0.882599,
    174: 0.980665,
    186: 1.078737,
    200: 1.176804,
    214: 1.274871,
    227: 1.372938,
    240: 1.471005,
    255: 1.471005,
    268: 1.471005,
    283: 1.471005,
    297: 1.471005,
    308: 1.471005,
  };
  
  return barMap[value] || 0.0;
}

/**
 * Converte posição para valor em Kgf/cm² (string formatada)
 * 
 * @param value Posição (50-308)
 * @returns Valor em Kgf/cm² formatado (ex: "0,5", "1,2")
 * 
 * @example
 * ConvertPositionToKgf(50)  // retorna "0,0"
 * ConvertPositionToKgf(174) // retorna "1,0"
 * ConvertPositionToKgf(240) // retorna "1,5"
 */
export function ConvertPositionToKgf(value: number): string {
  // Mapa de posições exatas
  const kgfMap: Record<number, string> = {
    50: '0,0',
    55: '0,1',
    65: '0,2',
    79: '0,3',
    93: '0,4',
    106: '0,5',
    119: '0,6',
    133: '0,7',
    145: '0,8',
    159: '0,9',
    174: '1,0',
    186: '1,1',
    200: '1,2',
    214: '1,3',
    227: '1,4',
    240: '1,5',
    255: '1,6',
    268: '1,7',
    283: '1,8',
    297: '1,9',
    308: '2,0',
  };
  
  // Verifica se é uma posição exata
  if (kgfMap[value]) {
    return kgfMap[value];
  }
  
  // Encontra o intervalo correto
  if (value >= 50 && value < 55) return '0,0';
  if (value >= 55 && value < 65) return '0,1';
  if (value >= 65 && value < 79) return '0,2';
  if (value >= 79 && value < 93) return '0,3';
  if (value >= 93 && value < 106) return '0,4';
  if (value >= 106 && value < 119) return '0,5';
  if (value >= 119 && value < 133) return '0,6';
  if (value >= 133 && value < 145) return '0,7';
  if (value >= 145 && value < 159) return '0,8';
  if (value >= 159 && value < 174) return '0,9';
  if (value >= 174 && value < 186) return '1,0';
  if (value >= 186 && value < 200) return '1,1';
  if (value >= 200 && value < 214) return '1,2';
  if (value >= 214 && value < 227) return '1,3';
  if (value >= 227 && value < 240) return '1,4';
  if (value >= 240 && value < 255) return '1,5';
  if (value >= 255 && value < 268) return '1,6';
  if (value >= 268 && value < 283) return '1,7';
  if (value >= 283 && value < 297) return '1,8';
  if (value >= 297 && value <= 308) return '1,9';
  
  return '-'; // Valor fora do intervalo
}

/**
 * Converte byte (200-250) para posição visual (55-308)
 * 
 * @param x Valor do byte (200-250)
 * @returns Posição visual correspondente
 * 
 * @example
 * ConvertByteToPosition(200) // retorna 55
 * ConvertByteToPosition(224) // retorna 176
 * ConvertByteToPosition(250) // retorna 308
 */
export function ConvertByteToPosition(x: number): number {
  const positionMap: Record<number, number> = {
    200: 55,
    201: 60,
    202: 65,
    203: 70,
    204: 75,
    205: 80,
    206: 85,
    207: 90,
    208: 95,
    209: 100,
    210: 105,
    211: 110,
    212: 115,
    213: 120,
    214: 125,
    215: 131,
    216: 136,
    217: 141,
    218: 146,
    219: 151,
    220: 156,
    221: 161,
    222: 166,
    223: 171,
    224: 176,
    225: 181,
    226: 186,
    227: 191,
    228: 196,
    229: 202,
    230: 207,
    231: 212,
    232: 217,
    233: 222,
    234: 227,
    235: 232,
    236: 237,
    237: 242,
    238: 247,
    239: 252,
    240: 257,
    241: 262,
    242: 267,
    243: 273,
    244: 278,
    245: 283,
    246: 288,
    247: 293,
    248: 298,
    249: 303,
    250: 308,
  };
  
  return positionMap[x] || 0;
}

// ============================================
// FUNÇÕES AUXILIARES
// ============================================

/**
 * Obtém todos os mapas disponíveis
 */
export function getAllMaps(): GasMap[] {
  return [0, 1, 2, 3, 4, 5, 6];
}

/**
 * Obtém informações completas de um mapa
 */
export function getMapInfo(map: number): {
  gas: number;
  pedal: number;
  letter: string;
  color: string;
  image: string;
} {
  const letters = ['z', 'a', 'b', 'c', 'd', 'e', 'f'];
  
  return {
    gas: map,
    pedal: GtoP(map),
    letter: letters[map] || 'z',
    color: ReturnColorGas(map.toString()),
    image: ReturnImageSource_GasPedal(map.toString()),
  };
}

/**
 * Exportação default com todas as funções
 */
export default {
  // Conversões básicas
  GtoP,
  PtoG,
  PtoGInputLetter,
  
  // Sincronização
  SyncChip_GtoP,
  SyncChip_PtoG,
  
  // Cores
  ReturnColorGas,
  ReturnColorPiggyInputByte,
  ReturnColorPiggyInputString,
  ReturnImageSource_GasPedal,
  
  // Pressão
  ConvertPositionToBar,
  ConvertPositionToKgf,
  ConvertByteToPosition,
  
  // Auxiliares
  getAllMaps,
  getMapInfo,
};
