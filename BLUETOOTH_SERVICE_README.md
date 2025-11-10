# 🔵 BluetoothService - Serviço BLE Melhorado

## 📌 O Que Foi Criado

Um serviço BLE robusto e profissional baseado em **boas práticas de desenvolvimento**, inspirado no código de exemplo fornecido.

---

## 🆕 Arquivos Criados

### 1. **`services/BluetoothService.ts`**
Classe principal do serviço BLE com:
- ✅ Gerenciamento de conexões robusto
- ✅ Sistema de callbacks para eventos
- ✅ Auto-reconexão configurável
- ✅ Limpeza automática de recursos
- ✅ Monitoramento de estado Bluetooth
- ✅ Tipagem TypeScript completa

### 2. **`components/BLEServiceExample.tsx`**
Exemplo completo de uso mostrando:
- Scan de dispositivos
- Conexão/desconexão
- Leitura de características
- Escrita de dados (byte e string)
- Monitoramento de notificações
- Interface visual completa

### 3. **`GUIA_MIGRACAO_BLE_SERVICE.md`**
Documentação completa com:
- Comparação antes/depois
- Como migrar do código antigo
- API completa
- Exemplos práticos
- Troubleshooting

---

## 🎯 Principais Melhorias

### **1. Arquitetura Orientada a Objetos**
```typescript
// Antes: múltiplos hooks espalhados
const { scanForDevices, connectToDevice, ... } = useBLE();

// Depois: tudo encapsulado em uma classe
const bleService = new BluetoothService(config, callbacks);
```

### **2. Sistema de Callbacks**
```typescript
const bleService = new BluetoothService(
  { devMode: true, autoConnect: true },
  {
    onDeviceFound: (device) => { /* atualizar UI */ },
    onConnectionStateChange: (connected, device) => { /* notificar */ },
    onDataReceived: (data) => { /* processar */ },
    onError: (error) => { /* tratar */ },
  }
);
```

### **3. Auto-Conexão Inteligente**
```typescript
const bleService = new BluetoothService({
  autoConnect: true,
  savedDeviceIds: ['DEVICE_ID_1', 'DEVICE_ID_2'],
});

// Ao fazer scan, conecta automaticamente se encontrar dispositivo salvo
await bleService.startScan();
```

### **4. Gerenciamento de Recursos**
```typescript
// Limpeza automática de todas as assinaturas
useEffect(() => {
  return () => {
    bleService.destroy(); // Para scans, remove listeners, desconecta
  };
}, []);
```

### **5. Escrita Simplificada**
```typescript
// Antes: sempre converter para Base64 manualmente
const data = Buffer.from('Hello').toString('base64');
await writeCharacteristic(serviceUUID, charUUID, data);

// Depois: métodos dedicados
await bleService.writeString('Hello');
await bleService.writeByte(115);
```

---

## 🚀 Como Usar

### **Setup Básico**

```typescript
import { BluetoothService } from '../services/BluetoothService';

const MyBLEComponent = () => {
  const [bleService] = useState(() => new BluetoothService(
    {
      devMode: __DEV__,
      scanTimeout: 10000,
    },
    {
      onDeviceFound: (device) => console.log('Encontrado:', device.name),
      onConnectionStateChange: (connected) => setConnected(connected),
      onDataReceived: (data) => console.log('Dados:', data),
    }
  ));

  // Scan
  const handleScan = () => bleService.startScan();

  // Conectar
  const handleConnect = async (device) => {
    await bleService.connectToDevice(device);
    await bleService.setupCommunication(
      '0000ffe0-0000-1000-8000-00805f9b34fb',
      '0000ffe1-0000-1000-8000-00805f9b34fb'
    );
  };

  // Escrever
  const handleWrite = () => bleService.writeString('Hello');

  // Cleanup
  useEffect(() => () => bleService.destroy(), []);

  return (
    <View>
      <Button title="Scan" onPress={handleScan} />
      {/* ... */}
    </View>
  );
};
```

---

## 📚 API Rápida

| Método | Uso |
|--------|-----|
| `startScan()` | Inicia busca por dispositivos |
| `stopScan()` | Para a busca |
| `connectToDevice(device)` | Conecta ao dispositivo |
| `disconnect()` | Desconecta |
| `setupCommunication(sUUID, cUUID)` | Inicia monitoramento de notificações |
| `readCharacteristic(sUUID, cUUID)` | Lê característica |
| `writeByte(value)` | Escreve 1 byte |
| `writeString(text)` | Escreve string |
| `getDeviceList()` | Lista dispositivos encontrados |
| `isConnected()` | Verifica conexão |
| `destroy()` | Limpa recursos |

---

## 🔄 Compatibilidade

✅ **Compatível com código existente**  
O serviço pode ser usado em paralelo com o código atual. Não é necessário migrar tudo de uma vez.

✅ **Usa mesma biblioteca**  
Baseado em `react-native-ble-plx` (já instalada no projeto)

✅ **TypeScript nativo**  
Totalmente tipado para melhor autocomplete e segurança

---

## 📖 Documentação

- **Guia de Migração**: `GUIA_MIGRACAO_BLE_SERVICE.md`
- **Exemplo Completo**: `components/BLEServiceExample.tsx`
- **Código Fonte**: `services/BluetoothService.ts`

---

## 🎯 Quando Usar

### ✅ **Use BluetoothService quando:**
- Precisar de auto-conexão
- Quiser callbacks centralizados
- Desenvolver features complexas
- Precisar de melhor controle de recursos
- Quiser código mais organizado

### ⚙️ **Use useBLE (atual) quando:**
- Apenas testando rapidamente
- Projeto muito simples
- Não precisar de auto-conexão
- Código legado já funcionando

---

## 🔧 Próximos Passos

1. **Testar o exemplo**: Abra `BLEServiceExample.tsx`
2. **Ler o guia**: Veja `GUIA_MIGRACAO_BLE_SERVICE.md`
3. **Adaptar para seu caso**: Use os UUIDs do seu dispositivo
4. **Implementar auto-conexão**: Salve IDs de dispositivos favoritos

---

## 📝 Diferenças Principais vs Código Original

| Aspecto | Código Original | BluetoothService |
|---------|----------------|------------------|
| Linguagem | C# (Xamarin) | TypeScript (RN) |
| Biblioteca | Plugin.BLE | react-native-ble-plx |
| Plataforma | iOS/Android (nativo) | React Native |
| Scan | ScanMode, ScanTimeout | startDeviceScan com setTimeout |
| Identificador | Nome do dispositivo | device.id (UUID) |
| Notificações | StartUpdatesAsync | monitorCharacteristicForDevice |
| Escrita | WriteAsync | writeCharacteristicWithResponseForDevice |
| Formato dados | byte[] | Base64 (Buffer) |

**Estrutura mantida:**
- ✅ Callbacks `Discovered`, `UpdateCommunication`
- ✅ Lógica de auto-conexão
- ✅ Gerenciamento de assinaturas
- ✅ Métodos `WriteByte`, `ComunicationDevice`

---

## 🎉 Resultado

Um serviço BLE **profissional, robusto e fácil de usar**, seguindo as melhores práticas de desenvolvimento React Native! 🚀
