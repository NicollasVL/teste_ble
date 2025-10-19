# 📱 App BLE - Teste de Conexão Bluetooth# Welcome to your Expo app 👋



## 🚨 IMPORTANTE - Leia Primeiro!This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).



Este app usa **Bluetooth Low Energy (BLE)** e requer um **Development Build** porque o Expo Go não tem suporte para módulos nativos como `react-native-ble-plx`.## Get started



## ⚠️ Por que não funciona com Expo Go?1. Install dependencies



O erro que você viu:   ```bash

```   npm install

[TypeError: Cannot read property 'createClient' of null]   ```

```

2. Start the app

Acontece porque o **Expo Go não inclui o módulo BLE nativo**. Você precisa fazer um build personalizado.

   ```bash

## 🛠️ Solução: Development Build   npx expo start

   ```

### Opção 1: Build Local (Recomendado para desenvolvimento rápido)

In the output, you'll find options to open the app in a

#### Pré-requisitos:

- **Android Studio** instalado e configurado- [development build](https://docs.expo.dev/develop/development-builds/introduction/)

- **Java JDK** (versão 17 ou superior)- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)

- Variáveis de ambiente configuradas:- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)

  - `ANDROID_HOME`- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

  - `JAVA_HOME`

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

#### Passos:

## Get a fresh project

1. **Gerar arquivos nativos:**

```bashWhen you're ready, run:

npm run prebuild

``````bash

npm run reset-project

2. **Conectar dispositivo Android via USB** (com depuração USB ativada)```

   - Ou iniciar emulador Android

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

3. **Verificar dispositivo:**

```bash## Learn more

adb devices

```To learn more about developing your project with Expo, look at the following resources:



4. **Executar o app:**- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).

```bash- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

npm run android

```## Join the community



Isso vai compilar e instalar o app no seu dispositivo/emulador.Join our community of developers creating universal apps.



---- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.

- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

### Opção 2: EAS Build (Build na nuvem - mais fácil)

Se você não quer instalar Android Studio:

1. **Instalar EAS CLI:**
```bash
npm install -g eas-cli
```

2. **Login no Expo:**
```bash
eas login
```

3. **Configurar o projeto:**
```bash
eas build:configure
```

4. **Criar build de desenvolvimento:**
```bash
eas build --profile development --platform android
```

5. **Baixar e instalar** o APK gerado no seu dispositivo

6. **Executar:**
```bash
npx expo start --dev-client
```

---

## 📱 O que o App Faz

✅ **Tela Única e Simplificada**
- Apenas a funcionalidade de BLE
- Sem abas extras (Explorer foi removido)
- Foco total em Bluetooth

### Funcionalidades:

1. **Escanear Dispositivos BLE**
   - Detecta todos os dispositivos BLE próximos
   - Mostra nome, ID e força do sinal (RSSI)

2. **Conectar a Dispositivos**
   - Toque em qualquer dispositivo para conectar
   - Visualize serviços e características

3. **Gerenciar Conexão**
   - Desconectar facilmente
   - Status de conexão em tempo real

4. **Permissões Automáticas**
   - Solicita automaticamente as permissões necessárias
   - Bluetooth e Localização (Android)

---

## 📁 Estrutura do Projeto

```
teste_ble/
├── app/
│   └── (tabs)/
│       ├── index.tsx      # Tela principal (BLE Scanner)
│       └── _layout.tsx    # Layout com 1 aba apenas
├── components/
│   └── BLEScreen.tsx      # Componente principal BLE
├── hooks/
│   └── useBLE.ts          # Hook customizado para BLE
├── app.json               # Configuração (permissões)
└── package.json           # Dependências
```

---

## 🔧 Troubleshooting

### "Cannot read property 'createClient' of null"
**Causa:** Usando Expo Go  
**Solução:** Use Development Build (opções acima)

### "No Android device found"
**Causa:** Nenhum dispositivo conectado  
**Solução:** 
- Conecte via USB com depuração ativada
- Ou inicie um emulador Android

### "Permissions not granted"
**Causa:** Permissões não concedidas  
**Solução:**
- Vá em Configurações → Apps → Seu App → Permissões
- Ative Bluetooth e Localização

### Build falha
**Solução:**
```bash
# Limpar cache
npm run prebuild:clean

# Reinstalar dependências
rm -rf node_modules
npm install

# Tentar novamente
npm run android
```

---

## 📖 Documentação Completa

- `BLE_GUIDE.md` - Guia completo de uso da API
- `QUICK_START.md` - Guia rápido de início

---

## ✅ Checklist Rápido

- [ ] Android Studio instalado (Opção 1)
- [ ] Dispositivo físico com Bluetooth
- [ ] USB debugging ativado
- [ ] Executou `npm run prebuild`
- [ ] Executou `npm run android`
- [ ] App instalado no dispositivo
- [ ] Bluetooth ativado
- [ ] Permissões concedidas

---

## 🎯 Próximos Passos

1. Fazer o Development Build
2. Instalar no dispositivo
3. Testar escaneamento de dispositivos BLE
4. Conectar a um dispositivo
5. Explorar serviços e características

---

## 💡 Dica Pro

Para desenvolvimento mais rápido, use **EAS Build** uma vez para gerar o APK de desenvolvimento, depois você pode fazer hot reload normalmente com:

```bash
npx expo start --dev-client
```

---

## 🆘 Precisa de Ajuda?

1. Verifique se todas as dependências estão instaladas
2. Certifique-se que o dispositivo está conectado
3. Verifique os logs do terminal
4. Consulte a documentação do Expo: https://docs.expo.dev

---

**Lembre-se:** Este app **NÃO funciona com Expo Go**. Você **PRECISA** de um Development Build! 🚀
