# 🔧 Guia de Configuração de UUIDs - P TORK ONE BT

## 📋 Visão Geral

Este guia mostra como configurar e usar os UUIDs BLE do dispositivo **P TORK ONE BT**.

---

## 🎯 UUIDs Identificados

### **Serviço Principal**
```
0000ffe0-0000-1000-8000-00805f9b34fb
```
Este é o serviço principal para comunicação de dados.

### **Característica Principal de Dados**
```
0000ffe1-0000-1000-8000-00805f9b34fb
```
- **Propriedades**: Read, Write, Notify
- **Uso**: Comunicação principal (comandos, dados, notificações)
- **Dados típicos**: `[01, 02, 03, 04, 05, 00, 00, ...]`

---

## 📱 Informações do Dispositivo

| Característica | UUID | Valor Lido | Descrição |
|----------------|------|------------|-----------|
| Nome | `00002a00` | `P TORK ONE BT` | Nome do dispositivo |
| Modelo | `00002a24` | `Model Number` | Número do modelo |
| Série | `00002a25` | `Serial Number` | Número de série |
| Firmware | `00002a26` | `Firmware Revision` | Versão do firmware |
| Hardware | `00002a27` | `Hardware Revision` | Versão do hardware |
| Software | `00002a28` | `Software Revision` | Versão do software |
| Fabricante | `00002a29` | `Manufacturer Name` | Nome do fabricante |

---

## 🚀 Como Usar

### **1. Importar a Configuração**

```typescript
import P_TORK_CONFIG from '../constants/PTorkUUIDs';
```

### **2. Usar UUIDs na Conexão**

```typescript
const SERVICE_UUID = P_TORK_CONFIG.services.main;
const CHARACTERISTIC_UUID = P_TORK_CONFIG.characteristics.mainData;

// Configurar comunicação
await bleService.setupCommunication(
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  true,  // Escrever valor inicial
  0      // Valor inicial: 0
);
```

### **3. Ler Informações do Dispositivo**

```typescript
// Nome do dispositivo
const deviceName = await bleService.readCharacteristic(
  P_TORK_CONFIG.services.genericAccess,
  P_TORK_CONFIG.characteristics.deviceName
);
console.log('Nome:', deviceName); // "P TORK ONE BT"

// Firmware
const firmware = await bleService.readCharacteristic(
  P_TORK_CONFIG.services.deviceInfo,
  P_TORK_CONFIG.characteristics.firmware
);
console.log('Firmware:', firmware); // "Firmware Revision"
```

### **4. Escrever Dados**

```typescript
// Escrever byte
await bleService.writeByte(115);

// Escrever string
await bleService.writeString('Hello');

// Escrever array de bytes (hex)
const data = Buffer.from([0x01, 0x02, 0x03, 0x04, 0x05]);
await bleService.writeString(data.toString('utf-8'));
```

### **5. Receber Notificações**

```typescript
const bleService = new BluetoothService(
  { /* config */ },
  {
    onDataReceived: (data) => {
      console.log('📨 Notificação recebida:', data);
      // Processar dados do pedal
      const bytes = Buffer.from(data, 'utf-8');
      console.log('Bytes:', Array.from(bytes));
    }
  }
);
```

---

## 🔍 Análise dos Dados

### **Dados da Característica Principal (0000ffe1)**

```
Hex: 01 02 03 04 05 00 00 00 00 00 00 00 00 00 00 00 00 00 00 00
Bytes: [1, 2, 3, 4, 5, 0, 0, 0, 0, 0, ...]
```

**Possível interpretação:**
- `01 02 03 04 05`: Comandos ou estados do pedal
- `00 00 00 ...`: Dados reservados/não utilizados

**Experimente:**
```typescript
// Monitorar mudanças
const bleService = new BluetoothService({}, {
  onDataReceived: (data) => {
    const bytes = Buffer.from(data, 'utf-8');
    console.log('Estado do pedal:', {
      byte1: bytes[0], // Primeiro comando?
      byte2: bytes[1], // Segundo comando?
      byte3: bytes[2], // ...
      byte4: bytes[3],
      byte5: bytes[4],
    });
  }
});

// Escrever comandos diferentes e observar resposta
await bleService.writeByte(0);   // Reset?
await bleService.writeByte(1);   // Comando 1?
await bleService.writeByte(115); // Comando especial?
```

---

## 📝 Exemplo Completo

```typescript
import { BluetoothService } from '../services/BluetoothService';
import P_TORK_CONFIG from '../constants/PTorkUUIDs';

// Criar serviço
const bleService = new BluetoothService(
  {
    devMode: true,
    autoConnect: false,
    scanTimeout: 10000,
  },
  {
    onDeviceFound: (device) => {
      // Filtrar apenas P TORK
      if (device.name?.includes('P TORK')) {
        console.log('✅ P TORK encontrado!');
      }
    },
    onConnectionStateChange: (connected, device) => {
      if (connected) {
        console.log('🔌 Conectado ao P TORK:', device?.name);
      }
    },
    onDataReceived: (data) => {
      const bytes = Buffer.from(data, 'utf-8');
      console.log('📨 Dados do pedal:', Array.from(bytes));
    },
  }
);

// Buscar dispositivos
await bleService.startScan();

// Conectar (assumindo que device foi encontrado)
await bleService.connectToDevice(device);

// Configurar comunicação
await bleService.setupCommunication(
  P_TORK_CONFIG.services.main,
  P_TORK_CONFIG.characteristics.mainData,
  true,
  0
);

// Ler informações
const deviceInfo = {
  name: await bleService.readCharacteristic(
    P_TORK_CONFIG.services.genericAccess,
    P_TORK_CONFIG.characteristics.deviceName
  ),
  model: await bleService.readCharacteristic(
    P_TORK_CONFIG.services.deviceInfo,
    P_TORK_CONFIG.characteristics.modelNumber
  ),
  firmware: await bleService.readCharacteristic(
    P_TORK_CONFIG.services.deviceInfo,
    P_TORK_CONFIG.characteristics.firmware
  ),
};

console.log('ℹ️ Informações:', deviceInfo);

// Escrever comando
await bleService.writeByte(1);

// Limpar ao sair
await bleService.destroy();
```

---

## 🎨 Usar no Component

Veja o arquivo **`components/BLEServiceExample.tsx`** para um exemplo visual completo com interface React Native.

---

## 🔧 Customização

### **Adicionar Novos UUIDs**

Edite `constants/PTorkUUIDs.ts`:

```typescript
export const NOVA_CARACTERISTICA = '0000xxxx-0000-1000-8000-00805f9b34fb';

export const P_TORK_CONFIG = {
  characteristics: {
    // ... existentes
    novaChar: NOVA_CARACTERISTICA,
  },
};
```

### **Criar Filtro de Scan Específico**

```typescript
const bleService = new BluetoothService(
  {
    devMode: false, // Apenas P TORK
  },
  {
    onDeviceFound: (device) => {
      // Só adiciona se for P TORK
      if (device.name === P_TORK_CONFIG.scanFilter.name) {
        console.log('✅ P TORK ONE BT encontrado!');
      }
    },
  }
);
```

---

## ⚠️ Notas Importantes

1. **Serviço vs Característica**: 
   - Sempre use o serviço correto ao ler características
   - `00002a00` está no serviço `00001800` (Generic Access)
   - `00002a24` está no serviço `0000180a` (Device Information)

2. **Dados Binários**:
   - A característica `0000ffe1` retorna dados binários
   - Use `Buffer.from(data, 'utf-8')` para converter

3. **Notificações**:
   - Configure `setupCommunication()` para receber notificações automaticamente
   - Use callback `onDataReceived` para processar dados

---

## 🐛 Troubleshooting

### Erro ao ler características
```
Cannot read characteristic...
```
➡️ **Solução**: Verifique se está usando o serviço correto:
```typescript
// ❌ ERRADO
await bleService.readCharacteristic(MAIN_SERVICE, DEVICE_NAME_CHAR);

// ✅ CORRETO
await bleService.readCharacteristic(GENERIC_ACCESS_SERVICE, DEVICE_NAME_CHAR);
```

### Dados aparecem como "garbled"
```
Raw value: �a�*ܬ�
```
➡️ **Solução**: São dados binários. Veja em hex:
```typescript
const bytes = Buffer.from(data, 'utf-8');
console.log('Hex:', bytes.toString('hex'));
```

---

## 📚 Recursos

- **Arquivo de Config**: `constants/PTorkUUIDs.ts`
- **Exemplo Visual**: `components/BLEServiceExample.tsx`
- **Serviço BLE**: `services/BluetoothService.ts`
- **Guia de Migração**: `GUIA_MIGRACAO_BLE_SERVICE.md`
