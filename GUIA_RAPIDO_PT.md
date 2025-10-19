# 🚀 Guia Rápido - App BLE

## ✅ O que foi feito

Seu app agora está **simplificado** e focado apenas em Bluetooth:

### Mudanças:
- ❌ Removida aba "Explore"
- ❌ Removida tela modal
- ✅ Mantida apenas a tela de BLE Scanner
- ✅ Ícone atualizado para antena Bluetooth
- ✅ Título atualizado para "BLE Scanner"

## 📱 Estrutura Atual

```
App tem apenas 1 tela:
└── BLE Scanner (index)
    ├── Escanear dispositivos
    ├── Conectar/desconectar
    ├── Ver serviços
    └── Gerenciar permissões
```

## ⚡ Como Usar AGORA

### Passo 1: Preparar o Build

Como o app usa módulos nativos (Bluetooth), você tem 2 opções:

#### Opção A: Build Local (precisa de Android Studio)
```bash
# 1. Gerar arquivos nativos
npm run prebuild

# 2. Compilar e instalar
npm run android
```

#### Opção B: EAS Build (mais fácil, sem Android Studio)
```bash
# 1. Instalar EAS
npm install -g eas-cli

# 2. Fazer login
eas login

# 3. Configurar
eas build:configure

# 4. Criar build de desenvolvimento
eas build --profile development --platform android

# 5. Baixar e instalar o APK no dispositivo

# 6. Executar
npx expo start --dev-client
```

### Passo 2: Testar

1. **Abrir o app** no dispositivo físico (não emulador)
2. **Conceder permissões** quando solicitado
3. **Pressionar "Start Scanning"**
4. **Aguardar** dispositivos aparecerem
5. **Tocar em um dispositivo** para conectar
6. **Ver serviços e características**

## 🎯 Funcionalidades Disponíveis

### No useBLE.ts:
```typescript
const {
  allDevices,              // Lista de dispositivos encontrados
  connectedDevice,         // Dispositivo conectado atualmente
  isScanning,             // Status de escaneamento
  bluetoothState,         // Estado do Bluetooth
  scanForDevices,         // Iniciar escaneamento
  stopScanning,           // Parar escaneamento
  connectToDevice,        // Conectar a dispositivo
  disconnectFromDevice,   // Desconectar
  readCharacteristic,     // Ler característica
  writeCharacteristic,    // Escrever em característica
  subscribeToCharacteristic, // Inscrever em notificações
} = useBLE();
```

## 🔧 Comandos Úteis

```bash
# Iniciar servidor de desenvolvimento
npm start

# Build e executar no Android
npm run android

# Limpar e refazer prebuild
npm run prebuild:clean
npm run prebuild

# Ver dispositivos conectados
adb devices

# Ver logs do app
adb logcat | grep -i bluetooth
```

## 📊 Status do Projeto

### ✅ Completo
- [x] Hook useBLE com todas funções
- [x] Componente BLEScreen
- [x] Permissões configuradas
- [x] Layout simplificado (1 aba)
- [x] Documentação completa

### ⏳ Próximos Passos Sugeridos
- [ ] Fazer Development Build
- [ ] Testar em dispositivo real
- [ ] Conectar a dispositivo BLE específico
- [ ] Implementar funcionalidade customizada

## 💡 Dicas Importantes

1. **Use dispositivo físico** - Emuladores não têm Bluetooth real
2. **Ative Localização** - Android precisa para BLE scan
3. **Aproxime dispositivos** - BLE tem alcance limitado (~10m)
4. **Development Build é necessário** - Expo Go não funciona

## 🆘 Problemas Comuns

### "Cannot read property 'createClient' of null"
→ Você está usando Expo Go. Precisa fazer Development Build!

### "No devices found"
→ Verifique:
- Bluetooth está ON?
- Permissões concedidas?
- Dispositivo BLE está próximo?
- Dispositivo está em modo de emparelhamento?

### App não instala
→ Verifique:
- USB debugging ativado?
- Dispositivo aparece em `adb devices`?
- Android Studio configurado corretamente?

## 📖 Documentação Completa

- **README.md** - Informações principais e setup
- **BLE_GUIDE.md** - Guia completo da API
- **QUICK_START.md** - Este arquivo!

---

## 🎉 Pronto para Começar!

O app está limpo, focado e pronto. Agora é só fazer o build e testar!

```bash
# Se tiver Android Studio:
npm run prebuild
npm run android

# Se não tiver:
npm install -g eas-cli
eas login
eas build --profile development --platform android
```

Boa sorte! 🚀📱
