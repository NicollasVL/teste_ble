# 🔧 Solução do Erro: SDK location not found

## ❌ Erro Encontrado

```
SDK location not found. Define a valid SDK location with an ANDROID_HOME 
environment variable or by setting the sdk.dir path in your project's 
local properties file
```

## ✅ Solução Aplicada

### 1. Arquivo `local.properties` Criado

Foi criado o arquivo `android/local.properties` com:
```properties
sdk.dir=C:\\Users\\viell\\AppData\\Local\\Android\\Sdk
```

Este arquivo diz ao Gradle onde está o Android SDK no seu computador.

### 2. Configuração da Variável ANDROID_HOME (Opcional mas Recomendado)

Para evitar problemas futuros, configure a variável de ambiente `ANDROID_HOME`:

#### Opção A: Manualmente (Permanente)

1. Pressione `Win + Pause` ou vá em **Configurações do Sistema**
2. Clique em **Configurações avançadas do sistema**
3. Clique em **Variáveis de Ambiente**
4. Em **Variáveis do usuário**, clique em **Novo**
5. Configure:
   - **Nome:** `ANDROID_HOME`
   - **Valor:** `C:\Users\viell\AppData\Local\Android\Sdk`
6. Clique em **OK**
7. **Reinicie** o terminal/VS Code

#### Opção B: Via PowerShell (Permanente - Precisa de Admin)

```powershell
[System.Environment]::SetEnvironmentVariable("ANDROID_HOME", "C:\Users\viell\AppData\Local\Android\Sdk", "User")
```

#### Opção C: Apenas para Sessão Atual (Temporário)

```powershell
$env:ANDROID_HOME = "C:\Users\viell\AppData\Local\Android\Sdk"
```

## 🚀 Agora Pode Compilar

Com o `local.properties` criado, você já pode executar:

```bash
npm run android
```

## 📝 O que Aconteceu?

1. **Problema:** O Gradle (sistema de build do Android) não sabia onde estava o Android SDK
2. **Causa:** Faltava o arquivo `local.properties` E a variável `ANDROID_HOME` não estava configurada
3. **Solução:** Criamos o `local.properties` apontando para o SDK

## 🔍 Verificação

Para confirmar que está tudo certo:

```powershell
# Verificar se ANDROID_HOME está configurado
echo $env:ANDROID_HOME

# Verificar se local.properties existe
Get-Content android\local.properties

# Verificar se ADB funciona
adb version
```

## ⚠️ Importante

- O arquivo `android/local.properties` é **ignorado pelo Git** (já está no .gitignore)
- Cada desenvolvedor precisa ter seu próprio `local.properties`
- A variável `ANDROID_HOME` é global do sistema

## 🎯 Próximos Passos

1. ✅ `local.properties` criado
2. ⏳ Configurar `ANDROID_HOME` (recomendado)
3. 🚀 Executar `npm run android`

---

## 📚 Links Úteis

- [Android Studio Download](https://developer.android.com/studio)
- [Configurar Android SDK](https://developer.android.com/studio/intro/update#sdk-manager)
- [Expo Development Build](https://docs.expo.dev/develop/development-builds/introduction/)

---

**Status:** ✅ Problema Resolvido!  
O build deve funcionar agora. Se encontrar outros erros, eles serão diferentes deste.
