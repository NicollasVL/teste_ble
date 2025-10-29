# 🔍 Checklist - Por que a tela não aparece?

## ✅ Arquivos Verificados

- [x] `app/_layout.tsx` - Correto (removida referência ao modal)
- [x] `app/(tabs)/_layout.tsx` - Correto (1 aba: index)
- [x] `app/(tabs)/index.tsx` - Correto (renderiza BLEScreen)
- [x] `components/BLEScreen.tsx` - Existe e correto
- [x] Arquivo `explore.tsx` - Removido ✓
- [x] Arquivo `modal.tsx` - Removido ✓

## ⚠️ PRINCIPAL CAUSA: Expo Go vs Development Build

### O que você está usando?

#### ❌ Se está usando **Expo Go**:
```
PROBLEMA: Expo Go NÃO suporta react-native-ble-plx
ERRO: Cannot read property 'createClient' of null
```

**Expo Go não mostra a tela porque:**
- O app tenta inicializar o BleManager
- BleManager precisa de código nativo
- Expo Go não tem esse código nativo compilado
- App quebra antes de renderizar

#### ✅ Solução: Use **Development Build**

```bash
# Opção 1: Build local (precisa Android Studio)
npm run prebuild
npm run android

# Opção 2: EAS Build (mais fácil)
npm install -g eas-cli
eas login
eas build:configure
eas build --profile development --platform android
```

## 🔍 Como Identificar o Problema

### No Terminal, você vê?

```
ERROR  [TypeError: Cannot read property 'createClient' of null]
```

**Isso significa:** Está usando Expo Go - precisa de Development Build

### Servidor Metro está rodando?

```bash
npm start
```

Deve mostrar:
```
› Metro waiting on exp://192.168.x.x:8081
```

## 📋 Passos de Verificação

### 1. Limpar Cache
```bash
npx expo start -c
```

### 2. Verificar se Development Build está instalado
```bash
# Ver apps instalados no dispositivo
adb shell pm list packages | grep teste_ble
```

### 3. Reinstalar (se necessário)
```bash
# Desinstalar
adb uninstall com.nicollasv.teste_ble

# Limpar e recompilar
npm run prebuild:clean
npm run android
```

## 🎯 Teste Rápido

Execute este comando para ver o status:

```powershell
cd "c:\Users\viell\OneDrive\Documentos\CCE\ble\teste_ble"

Write-Host "`n=== DIAGNÓSTICO DO APP ===" -ForegroundColor Cyan

# 1. Verificar arquivos
Write-Host "`n1. Arquivos:" -ForegroundColor Yellow
if (Test-Path "app\(tabs)\index.tsx") { Write-Host "   ✓ index.tsx existe" -ForegroundColor Green } else { Write-Host "   ✗ index.tsx faltando" -ForegroundColor Red }
if (Test-Path "components\BLEScreen.tsx") { Write-Host "   ✓ BLEScreen.tsx existe" -ForegroundColor Green } else { Write-Host "   ✗ BLEScreen.tsx faltando" -ForegroundColor Red }
if (Test-Path "app\(tabs)\explore.tsx") { Write-Host "   ✗ explore.tsx ainda existe (DEVE SER REMOVIDO)" -ForegroundColor Red } else { Write-Host "   ✓ explore.tsx removido" -ForegroundColor Green }
if (Test-Path "app\modal.tsx") { Write-Host "   ✗ modal.tsx ainda existe (DEVE SER REMOVIDO)" -ForegroundColor Red } else { Write-Host "   ✓ modal.tsx removido" -ForegroundColor Green }

# 2. Verificar pastas Android
Write-Host "`n2. Configuração Nativa:" -ForegroundColor Yellow
if (Test-Path "android") { Write-Host "   ✓ Pasta android existe" -ForegroundColor Green } else { Write-Host "   ✗ Pasta android não existe - Execute: npm run prebuild" -ForegroundColor Red }
if (Test-Path "android\local.properties") { Write-Host "   ✓ local.properties existe" -ForegroundColor Green } else { Write-Host "   ✗ local.properties faltando" -ForegroundColor Red }

# 3. Verificar dispositivo
Write-Host "`n3. Dispositivo Conectado:" -ForegroundColor Yellow
$devices = adb devices
if ($devices -match "device$") { Write-Host "   ✓ Dispositivo conectado" -ForegroundColor Green } else { Write-Host "   ✗ Nenhum dispositivo conectado" -ForegroundColor Red }

# 4. Verificar ANDROID_HOME
Write-Host "`n4. Variável ANDROID_HOME:" -ForegroundColor Yellow
if ($env:ANDROID_HOME) { Write-Host "   ✓ ANDROID_HOME definido: $env:ANDROID_HOME" -ForegroundColor Green } else { Write-Host "   ✗ ANDROID_HOME não definido" -ForegroundColor Yellow }

Write-Host "`n=========================`n" -ForegroundColor Cyan
```

## 💡 Soluções Comuns

### Problema: Tela preta ou erro de módulo nativo
**Causa:** Usando Expo Go  
**Solução:** 
```bash
npm run prebuild
npm run android
```

### Problema: App não abre
**Causa:** Dispositivo desconectado  
**Solução:**
```bash
adb devices
# Se vazio, reconectar USB ou reiniciar adb
adb kill-server
adb start-server
```

### Problema: Mudanças não aparecem
**Causa:** Cache  
**Solução:**
```bash
npx expo start -c
npm run android
```

## 🚀 Comando Final para Testar

```bash
# Limpar tudo e começar do zero
cd "c:\Users\viell\OneDrive\Documentos\CCE\ble\teste_ble"

# Limpar cache
npx expo start -c

# Em outro terminal, compilar e instalar
npm run android
```

## 📱 O que DEVE aparecer

Quando funcionar corretamente, você verá:

1. **Splash screen** do Expo
2. **Tela do BLE Scanner** com:
   - Título "BLE Scanner"
   - Status do Bluetooth (ON/OFF)
   - Botão "Start Scanning"
   - Lista vazia (ou com dispositivos se houver)

## 🆘 Se AINDA não funcionar

Envie o erro EXATO que aparece no terminal. Procure por:
- `ERROR`
- `WARN`
- Stack trace completo

---

**Lembre-se:** Este app **PRECISA** de Development Build. Expo Go **NÃO** funciona! 🚨
