# 📚 Guia Completo: Operações BLE (Read, Write, Notify)

## ✅ Implementação Concluída!

Agora você pode **LER**, **ESCREVER** e **RECEBER NOTIFICAÇÕES** das características BLE do seu dispositivo!

---

## 🎯 O Que Mudou

### ❌ Antes
- Você **apenas listava** os UUIDs dos serviços e características
- Não era possível interagir com eles

### ✅ Agora
- Interface **interativa** para cada característica
- Botões para **ler**, **escrever** e **assinar notificações**
- Feedback visual em tempo real

---

## 🔧 Novos Recursos Implementados

### 1. **Hook useBLE Melhorado**

#### Novos Tipos:
```typescript
interface CharacteristicInfo {
  uuid: string;
  isReadable: boolean;
  isWritableWithResponse: boolean;
  isWritableWithoutResponse: boolean;
  isNotifiable: boolean;
  isIndicatable: boolean;
}

interface ServiceInfo {
  uuid: string;
  characteristics: CharacteristicInfo[];
}
```

#### Novas Funções:

**📖 Read (Leitura)**
```typescript
const readCharacteristic = async (
  serviceUUID: string,
  characteristicUUID: string
): Promise<string>
```

**✍️ Write (Escrita)**
```typescript
const writeCharacteristic = async (
  serviceUUID: string,
  characteristicUUID: string,
  value: string,
  withResponse: boolean = true
): Promise<void>
```

**🔔 Subscribe (Notificações)**
```typescript
const subscribeToCharacteristic = async (
  serviceUUID: string,
  characteristicUUID: string,
  callback: (value: string) => void
): Promise<Subscription>
```

### 2. **Componente CharacteristicTest**

Novo componente que cria uma interface interativa para cada característica!

**Recursos:**
- 📖 Botão "Read Value" para características legíveis
- ✍️ Campo de texto + botão "Write Value" para características graváveis
- 🔔 Botão "Subscribe/Unsubscribe" para características notificáveis
- 📝 Lista de notificações recebidas em tempo real
- ⚠️ Validação e tratamento de erros

### 3. **BLEScreen Atualizado**

Agora mostra cada característica com seus controles interativos!

---

## 📱 Como Usar

### 1. **Conectar ao Dispositivo**

```
1. Abra o app
2. Clique em "Start Scanning"
3. Toque no dispositivo para conectar
4. Aguarde a descoberta dos serviços
```

### 2. **Interagir com Características**

Após conectar, você verá algo assim:

```
📡 Services (3)

Service: 0000180f-0000-1000-8000-00805f9b34fb
3 characteristic(s)

  UUID: 00002a19-...
  
  📖 Read
  [Read Value]
  Value: 85
  
  🔔 Notifications
  [Subscribe]
```

#### 📖 **Para Ler uma Característica:**
1. Localize a característica com o botão "Read Value"
2. Clique no botão
3. O valor aparecerá abaixo do botão
4. Um alerta mostrará o valor lido

#### ✍️ **Para Escrever em uma Característica:**
1. Localize a característica com campo de texto
2. Digite o valor que deseja enviar
3. Clique em "Write Value"
4. Um alerta confirmará o sucesso

#### 🔔 **Para Receber Notificações:**
1. Localize a característica com botão "Subscribe"
2. Clique em "Subscribe"
3. As notificações aparecerão em tempo real abaixo
4. Clique em "Unsubscribe" para parar

---

## 🎧 Exemplos Práticos

### Exemplo 1: Ler Nível de Bateria

```
Service: Battery Service (180F)
Characteristic: Battery Level (2A19)

📖 Read
[Read Value] ← Clique aqui

Resultado:
Value: 85  ← 85% de bateria
```

### Exemplo 2: Escrever Nome do Dispositivo

```
Service: Generic Access (1800)
Characteristic: Device Name (2A00)

✍️ Write
[Meu Fone] ← Digite aqui
[Write Value] ← Clique

Resultado:
✅ Value written successfully
```

### Exemplo 3: Monitorar Bateria em Tempo Real

```
Service: Battery Service (180F)
Characteristic: Battery Level (2A19)

🔔 Notifications
[Subscribe] ← Clique

Notificações:
14:30:15: 85
14:31:20: 84
14:32:10: 83

[Unsubscribe] ← Clique para parar
```

---

## 🔍 UUIDs Comuns para Testar

### Serviços Padrão:

| Nome | UUID | Descrição |
|------|------|-----------|
| **Battery Service** | `0000180f-...` | Bateria do dispositivo |
| **Device Information** | `0000180a-...` | Informações do dispositivo |
| **Generic Access** | `00001800-...` | Acesso genérico |

### Características Comuns:

| Nome | UUID | Tipo | O que faz |
|------|------|------|-----------|
| **Battery Level** | `00002a19-...` | R, N | Mostra % de bateria |
| **Device Name** | `00002a00-...` | R, W | Nome do dispositivo |
| **Manufacturer Name** | `00002a29-...` | R | Nome do fabricante |
| **Model Number** | `00002a24-...` | R | Modelo |

**Legenda:**
- R = Readable (Leitura)
- W = Writable (Escrita)
- N = Notifiable (Notificações)

---

## 🐛 Solução de Problemas

### "Failed to read characteristic"

**Possíveis causas:**
- A característica não é legível
- Dispositivo desconectado
- Permissões insuficientes

**Solução:**
- Verifique se `isReadable` é `true`
- Confirme que está conectado
- Use o botão Refresh

### "Failed to write characteristic"

**Possíveis causas:**
- A característica não é gravável
- Formato de valor incorreto
- Dispositivo desconectado

**Solução:**
- Verifique se `isWritableWithResponse` ou `isWritableWithoutResponse` é `true`
- Tente um valor diferente (alguns devices esperam formato específico)
- Confira a documentação do dispositivo

### "Failed to subscribe"

**Possíveis causas:**
- A característica não suporta notificações
- Já está inscrito
- Dispositivo desconectado

**Solução:**
- Verifique se `isNotifiable` é `true`
- Desinscreva primeiro se já estiver inscrito
- Reconecte ao dispositivo

---

## 💡 Dicas Avançadas

### 1. **Valores Hexadecimais**

Alguns dispositivos esperam valores em hexadecimal:

```typescript
// Para enviar 0x01 (liga LED)
await writeCharacteristic(serviceUUID, charUUID, "\x01");

// Para enviar 0x00 (desliga LED)
await writeCharacteristic(serviceUUID, charUUID, "\x00");
```

### 2. **Valores Numéricos**

Para enviar números:

```typescript
// Enviar número 100
await writeCharacteristic(serviceUUID, charUUID, "100");

// Ou converter para bytes
const buffer = Buffer.from([100]);
await writeCharacteristic(serviceUUID, charUUID, buffer.toString('utf-8'));
```

### 3. **Monitorar Múltiplas Características**

```typescript
const subscriptions: Subscription[] = [];

// Subscribe to battery
const batterySub = await subscribeToCharacteristic(
  "180F", "2A19",
  (value) => console.log(`Battery: ${value}%`)
);
subscriptions.push(batterySub);

// Subscribe to heart rate
const heartRateSub = await subscribeToCharacteristic(
  "180D", "2A37",
  (value) => console.log(`Heart Rate: ${value} bpm`)
);
subscriptions.push(heartRateSub);

// Later, unsubscribe all
subscriptions.forEach(sub => sub.remove());
```

### 4. **Interpretar Dados Binários**

Algumas características enviam dados binários:

```typescript
const subscription = await subscribeToCharacteristic(
  serviceUUID,
  charUUID,
  (value) => {
    // Converter de base64 para bytes
    const buffer = Buffer.from(value, 'base64');
    
    // Ler primeiro byte
    const firstByte = buffer.readUInt8(0);
    console.log(`First byte: ${firstByte}`);
    
    // Ler número de 16 bits
    const int16 = buffer.readInt16LE(0);
    console.log(`Int16: ${int16}`);
  }
);
```

---

## 📝 Checklist de Teste

Use este checklist para testar seu dispositivo:

- [ ] Conectar ao dispositivo
- [ ] Verificar se os serviços aparecem
- [ ] Ler uma característica legível
- [ ] Escrever em uma característica gravável
- [ ] Assinar notificações de uma característica
- [ ] Verificar se as notificações chegam em tempo real
- [ ] Desassinar notificações
- [ ] Desconectar e reconectar
- [ ] Testar o botão Refresh

---

## 🎉 Resultado Final

Agora você tem um **app BLE completo** que pode:

✅ Escanear dispositivos BLE  
✅ Conectar a dispositivos  
✅ Descobrir serviços e características  
✅ **LER valores de características**  
✅ **ESCREVER valores em características**  
✅ **RECEBER NOTIFICAÇÕES em tempo real**  
✅ Interface intuitiva e interativa  
✅ Tratamento de erros robusto  
✅ Logs detalhados para debugging  

---

## 📚 Próximos Passos

1. **Documente seu dispositivo**: Anote quais características fazem o quê
2. **Crie perfis customizados**: Botões específicos para seu dispositivo
3. **Implemente comandos complexos**: Sequências de writes para funcionalidades avançadas
4. **Adicione persistência**: Salve configurações e histórico

---

## 🔗 Recursos Úteis

- [react-native-ble-plx Docs](https://github.com/dotintent/react-native-ble-plx)
- [Bluetooth SIG - GATT Services](https://www.bluetooth.com/specifications/gatt/services/)
- [Bluetooth SIG - GATT Characteristics](https://www.bluetooth.com/specifications/gatt/characteristics/)

---

**Implementado em**: 29/10/2025  
**Versão**: 3.0  
**Status**: ✅ Totalmente Funcional
