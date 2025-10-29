# Solução para Erro de Conexão BLE

## Problema Identificado

Ao tentar conectar ao dispositivo BLE, você estava enfrentando dois erros:

1. **Erro do Metro Bundler**: `ENOENT: no such file or directory, open 'InternalBytecode.js'`
2. **Erro de Conexão**: `No device connected` ao chamar `getServicesAndCharacteristics()`

## Causas

### 1. Erro do InternalBytecode.js
- Cache corrompido do Metro bundler
- Arquivos temporários desatualizados

### 2. Erro "No device connected"
- A função `getServicesAndCharacteristics()` era chamada imediatamente após a conexão
- O dispositivo BLE precisa de um tempo para completar o processo de descoberta de serviços
- A verificação de estado do dispositivo não estava sendo feita antes de buscar serviços

## Soluções Implementadas

### 1. Limpeza do Cache do Metro
```powershell
npx expo start -c
```

### 2. Correções no Código

#### BLEScreen.tsx
- Adicionado um delay de 1 segundo após a conexão para aguardar o dispositivo ficar pronto
- Implementado tratamento de erro separado para a busca de serviços
- Melhorado o feedback ao usuário

```typescript
const handleConnect = async (device: any) => {
  try {
    const connectedDev = await connectToDevice(device);
    
    // Aguarda o dispositivo estar completamente pronto
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Busca serviços após a conexão
    try {
      const deviceServices = await getServicesAndCharacteristics();
      setServices(deviceServices);
      Alert.alert("Success", `Connected to ${device.name || device.id}`);
    } catch (serviceError) {
      console.error("Error getting services:", serviceError);
      Alert.alert("Warning", `Connected to ${device.name || device.id}, but couldn't retrieve services`);
    }
  } catch (error) {
    Alert.alert("Error", "Failed to connect to device");
    console.error(error);
  }
};
```

#### useBLE.ts
- Adicionada verificação se o dispositivo ainda está conectado antes de buscar serviços
- Melhorado o tratamento de erros

```typescript
const getServicesAndCharacteristics = async () => {
  if (!connectedDevice) {
    throw new Error("No device connected");
  }

  try {
    // Verifica se o dispositivo ainda está conectado
    const isConnected = await connectedDevice.isConnected();
    if (!isConnected) {
      throw new Error("Device is not connected anymore");
    }

    const services = await connectedDevice.services();
    // ... resto do código
  } catch (error) {
    console.error("Get services error:", error);
    throw error;
  }
};
```

## Como Testar

1. **Limpe o cache e reinicie o servidor**:
   ```powershell
   npx expo start -c
   ```

2. **Recompile o app no dispositivo/emulador**:
   - Pressione `a` para Android
   - Ou recarregue o app manualmente

3. **Teste a conexão**:
   - Escaneie dispositivos BLE
   - Toque em um dispositivo para conectar
   - Aguarde a mensagem de sucesso
   - Verifique se os serviços são carregados

## Dicas Adicionais

### Se o erro persistir:

1. **Limpe completamente o projeto**:
   ```powershell
   rm -rf node_modules
   npm install
   npx expo start -c
   ```

2. **Verifique permissões BLE**:
   - Certifique-se que o app tem permissões de Bluetooth e Localização
   - No Android, vá em Configurações > Apps > Seu App > Permissões

3. **Reinicie o dispositivo físico**:
   - Às vezes o Bluetooth precisa ser reiniciado

4. **Aumente o delay se necessário**:
   ```typescript
   // Se 1 segundo não for suficiente, tente 2 segundos
   await new Promise(resolve => setTimeout(resolve, 2000));
   ```

5. **Verifique logs do dispositivo**:
   ```powershell
   # Para Android
   adb logcat | findstr "BLE"
   ```

## Debugging

Para debugar conexões BLE, adicione mais logs:

```typescript
console.log("Device ID:", device.id);
console.log("Device Name:", device.name);
console.log("Connected Device:", connectedDevice?.id);
console.log("Is Connected:", await connectedDevice?.isConnected());
```

## Recursos Úteis

- [react-native-ble-plx Documentation](https://github.com/dotintent/react-native-ble-plx)
- [Expo BLE Guide](https://docs.expo.dev/versions/latest/sdk/bluetooth/)
- BLE_GUIDE.md (neste projeto)
