# 🔄 Guia de Migração para BluetoothService

## 📋 Visão Geral

O novo `BluetoothService` é uma classe melhorada baseada em boas práticas de gerenciamento de conexões BLE. Ele oferece:

✅ **Gerenciamento robusto de conexões**  
✅ **Sistema de callbacks para eventos**  
✅ **Auto-reconexão configurável**  
✅ **Limpeza automática de recursos**  
✅ **Tipagem TypeScript completa**  
✅ **Monitoramento de estado Bluetooth**

---

## 🆚 Comparação: Antes vs Depois

### ❌ Código Antigo (Hook `useBLE`)

```typescript
const {
  allDevices,
  connectedDevice,
  connectToDevice,
  scanForDevices,
  disconnectFromDevice,
} = useBLE();

// Usar em componente
<Button onPress={scanForDevices} title="Scan" />
```

**Problemas:**
- Estado espalhado em múltiplos hooks
- Difícil rastrear assinaturas e limpar recursos
- Sem callbacks centralizados
- Auto-conexão não implementada

---

### ✅ Código Novo (Classe `BluetoothService`)

```typescript
const bleService = new BluetoothService(
  // Configurações
  {
    devMode: true,
    autoConnect: true,
    savedDeviceIds: ['DEVICE_ID_1', 'DEVICE_ID_2'],
    scanTimeout: 10000,
  },
  // Callbacks
  {
    onDeviceFound: (device) => console.log('Encontrado:', device.name),
    onConnectionStateChange: (connected, device) => {
      if (connected) console.log('Conectado:', device?.name);
    },
    onDataReceived: (data) => console.log('Dados:', data),
    onError: (error) => console.error('Erro:', error),
  }
);

// Usar
await bleService.startScan();
```

**Benefícios:**
- Estado encapsulado na classe
- Callbacks centralizados
- Auto-limpeza de recursos
- Auto-conexão integrada

---

## 🚀 Como Migrar

### 1️⃣ **Instalar Dependências**

Certifique-se de ter as dependências necessárias:

```bash
npm install react-native-ble-plx buffer
```

---

### 2️⃣ **Criar Instância do Serviço**

Em um componente React:

```typescript
import { BluetoothService } from '../services/BluetoothService';
import { Device } from 'react-native-ble-plx';

const MyComponent = () => {
  const [bleService] = useState(() => new BluetoothService(
    {
      devMode: __DEV__, // true em desenvolvimento
      autoConnect: false,
      scanTimeout: 10000,
    },
    {
      onDeviceFound: (device) => {
        // Atualizar lista de dispositivos
        setDevices(bleService.getDeviceList());
      },
      onConnectionStateChange: (connected, device) => {
        setConnected(connected);
        if (connected) {
          Alert.alert('Conectado', device?.name || 'Dispositivo');
        }
      },
      onDataReceived: (data) => {
        console.log('📨', data);
      },
      onError: (error) => {
        Alert.alert('Erro BLE', error.message);
      },
    }
  ));

  // Cleanup ao desmontar
  useEffect(() => {
    return () => {
      bleService.destroy();
    };
  }, []);
  
  // ...
};
```

---

### 3️⃣ **Substituir Funções**

#### **Scan de Dispositivos**

**Antes:**
```typescript
const { scanForDevices } = useBLE();
await scanForDevices();
```

**Depois:**
```typescript
await bleService.startScan();
// Para manualmente:
bleService.stopScan();
```

---

#### **Conexão**

**Antes:**
```typescript
const { connectToDevice } = useBLE();
await connectToDevice(device);
```

**Depois:**
```typescript
await bleService.connectToDevice(device);
```

---

#### **Leitura de Característica**

**Antes:**
```typescript
const { readCharacteristic } = useBLE();
const value = await readCharacteristic(serviceUUID, charUUID);
```

**Depois:**
```typescript
const value = await bleService.readCharacteristic(serviceUUID, charUUID);
```

---

#### **Escrita**

**Antes:**
```typescript
const { writeCharacteristic } = useBLE();
await writeCharacteristic(serviceUUID, charUUID, 'Hello');
```

**Depois:**
```typescript
// Escrever string
await bleService.writeString('Hello');

// Escrever byte
await bleService.writeByte(115);
```

**⚠️ IMPORTANTE:** Antes de escrever, você precisa configurar a comunicação:

```typescript
await bleService.setupCommunication(
  SERVICE_UUID,
  CHARACTERISTIC_UUID,
  false, // writeInitialValue
  0      // initialValue (se writeInitialValue = true)
);
```

---

#### **Monitoramento de Notificações**

**Antes:**
```typescript
const { subscribeToCharacteristic } = useBLE();
const subscription = await subscribeToCharacteristic(
  serviceUUID,
  charUUID,
  (value) => console.log(value)
);
```

**Depois:**
```typescript
// Configure no callback onDataReceived ao criar o serviço
const bleService = new BluetoothService(
  {},
  {
    onDataReceived: (data) => {
      console.log('Notificação:', data);
      // Processar dados
    }
  }
);

// Depois chame setupCommunication para iniciar monitoramento
await bleService.setupCommunication(SERVICE_UUID, CHARACTERISTIC_UUID);
```

---

#### **Desconexão**

**Antes:**
```typescript
const { disconnectFromDevice } = useBLE();
await disconnectFromDevice();
```

**Depois:**
```typescript
await bleService.disconnect();
```

---

### 4️⃣ **Configurar Auto-Conexão**

Uma das melhores features do novo serviço é a **auto-conexão**:

```typescript
// Salvar ID do dispositivo ao conectar
const device = await bleService.connectToDevice(selectedDevice);
const deviceId = device.id;

// Salvar em AsyncStorage ou similar
await AsyncStorage.setItem('savedDeviceId', deviceId);

// Na próxima vez, criar serviço com auto-conexão
const savedId = await AsyncStorage.getItem('savedDeviceId');

const bleService = new BluetoothService(
  {
    autoConnect: true,
    savedDeviceIds: savedId ? [savedId] : [],
  },
  { /* callbacks */ }
);

// Ao fazer scan, se encontrar o dispositivo salvo, conecta automaticamente
await bleService.startScan();
```

---

## 📚 API Completa

### **Métodos Principais**

| Método | Descrição |
|--------|-----------|
| `startScan()` | Inicia varredura de dispositivos |
| `stopScan()` | Para a varredura |
| `connectToDevice(device, timeout?)` | Conecta a um dispositivo |
| `disconnect()` | Desconecta do dispositivo atual |
| `setupCommunication(serviceUUID, charUUID, writeInitial?, value?)` | Configura monitoramento de notificações |
| `readCharacteristic(serviceUUID, charUUID)` | Lê valor de característica |
| `writeByte(value)` | Escreve 1 byte |
| `writeString(text)` | Escreve string |
| `getDeviceList()` | Retorna lista de dispositivos encontrados |
| `getConnectedDevice()` | Retorna dispositivo conectado |
| `isConnected()` | Verifica se está conectado |
| `destroy()` | Limpa todos os recursos |

---

### **Configurações**

```typescript
interface BLEServiceConfig {
  devMode?: boolean;        // true = mostra todos os dispositivos
  autoConnect?: boolean;    // Auto-conecta a dispositivos salvos
  savedDeviceIds?: string[];// IDs dos dispositivos para auto-conexão
  scanTimeout?: number;     // Timeout do scan em ms (padrão: 10000)
}
```

---

### **Callbacks**

```typescript
interface BLEServiceCallbacks {
  onDeviceFound?: (device: Device) => void;
  onConnectionStateChange?: (connected: boolean, device?: Device) => void;
  onDataReceived?: (data: string) => void;
  onError?: (error: Error) => void;
}
```

---

## 🎯 Exemplo Completo

Veja o arquivo **`components/BLEServiceExample.tsx`** para um exemplo completo de uso.

---

## ⚠️ Notas Importantes

1. **Sempre chame `destroy()` ao desmontar o componente** para evitar memory leaks
2. **Configure `setupCommunication()`** antes de usar `writeByte()` ou `writeString()`
3. **Use `onDataReceived` callback** para receber notificações em vez de `subscribeToCharacteristic`
4. **O `device.id` é usado** como identificador único (não MAC address)
5. **Callbacks são opcionais**, mas recomendados para melhor controle

---

## 🔧 Troubleshooting

### "Dispositivo ou característica não definidos"
➡️ Chame `setupCommunication()` antes de escrever

### "Bluetooth não está ligado"
➡️ Verifique se o Bluetooth está ativo no dispositivo

### "Failed to connect"
➡️ Dispositivo pode estar muito longe ou conectado a outro app

### Auto-conexão não funciona
➡️ Verifique se `savedDeviceIds` contém o `device.id` correto

---

## 📝 Checklist de Migração

- [ ] Instalar dependências (`react-native-ble-plx`, `buffer`)
- [ ] Criar arquivo `services/BluetoothService.ts`
- [ ] Atualizar componentes para usar nova classe
- [ ] Substituir `useBLE()` por `new BluetoothService()`
- [ ] Adicionar callbacks necessários
- [ ] Implementar cleanup com `destroy()`
- [ ] Testar scan e conexão
- [ ] Testar leitura/escrita
- [ ] Testar notificações
- [ ] Configurar auto-conexão (opcional)
- [ ] Remover código antigo não utilizado

---

## 🎓 Recursos Adicionais

- [Documentação react-native-ble-plx](https://github.com/dotintent/react-native-ble-plx)
- [Exemplo completo](./BLEServiceExample.tsx)
- [Código original](./BluetoothService.ts)
