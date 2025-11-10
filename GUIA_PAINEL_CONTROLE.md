# 🎮 Guia Rápido - Painel de Controle P TORK ONE BT

## 📍 Onde Encontrar o Painel

O painel de controle aparece **automaticamente** quando você conecta a um dispositivo **P TORK** ou **TORK**.

---

## 🚀 Como Usar

### **Passo 1: Conectar ao Dispositivo**

1. Abra o app
2. Clique em **"Start Scan"**
3. Encontre **"P TORK ONE BT"** na lista
4. Clique em **"Connect"**

✅ **O painel de controle aparecerá automaticamente!**

---

### **Passo 2: Trocar o Mapa**

O painel mostra 7 botões coloridos (Mapas 0-6):

| Botão | Cor | Descrição |
|-------|-----|-----------|
| MAP 0 (Z) | ⚪ Branco | Mínimo |
| MAP 1 (A) | 🔵 Turquesa | Baixo |
| MAP 2 (B) | 🟢 Verde | Moderado |
| MAP 3 (C) | 🟢 Lima | Médio |
| MAP 4 (D) | 🟡 Amarelo | Alto |
| MAP 5 (E) | 🟠 Laranja | Muito Alto |
| MAP 6 (F) | 🔴 Vermelho | Máximo |

**Para trocar:**
1. Clique no botão do mapa desejado
2. Aguarde confirmação "Mapa X ativado!"
3. O mapa selecionado terá uma borda preta grossa e um ✓

---

### **Passo 3: Monitorar Pressão**

O painel mostra a pressão em tempo real em dois formatos:

```
┌─────────────────┐
│      1,5        │  ← Pressão em Kgf/cm²
│     Kgf/cm²     │
│                 │
│    1.471005     │  ← Pressão em Bar
│      Bar        │
└─────────────────┘
```

A pressão é **atualizada automaticamente** quando o pedal envia dados.

---

### **Passo 4: Ver Dados em Tempo Real**

A seção **"Dados em Tempo Real"** mostra:

- **🔔 Monitorando**: Status da conexão
- **Bytes**: Dados recebidos em decimal `[1, 2, 3, 4, 5, ...]`
- **Hex**: Dados recebidos em hexadecimal `01 02 03 04 05 ...`

**Botão "🔄 Ler"**: Força leitura manual dos dados

---

### **Passo 5: Ações Rápidas**

Três botões de atalho:

| Botão | Ação |
|-------|------|
| 🏁 Resetar (Mapa 0) | Volta para o mapa inicial |
| 🔥 Máximo (Mapa 6) | Ativa potência máxima |
| ℹ️ Atualizar Info | Recarrega informações do dispositivo |

---

## 🔍 Estrutura do Painel

```
┌─────────────────────────────────────┐
│  📱 Dispositivo                     │
│  ├─ P TORK ONE BT                   │
│  ├─ Modelo: Model Number            │
│  ├─ Firmware: Firmware Revision     │
│  └─ ● Conectado                     │
├─────────────────────────────────────┤
│  🗺️ Selecionar Mapa                 │
│  ┌───┐ ┌───┐ ┌───┐ ┌───┐          │
│  │ 0 │ │ 1 │ │ 2 │ │ 3 │          │
│  └───┘ └───┘ └───┘ └───┘          │
│  ┌───┐ ┌───┐ ┌───┐                │
│  │ 4 │ │ 5 │ │ 6 │                │
│  └───┘ └───┘ └───┘                │
├─────────────────────────────────────┤
│  🎚️ Pressão Atual                   │
│        1,5 Kgf/cm²                  │
│      1.471005 Bar                   │
├─────────────────────────────────────┤
│  📊 Dados em Tempo Real             │
│  Bytes: [1, 2, 3, 4, 5, ...]        │
│  Hex: 01 02 03 04 05 ...            │
├─────────────────────────────────────┤
│  ⚡ Ações Rápidas                   │
│  [ 🏁 Resetar (Mapa 0)       ]      │
│  [ 🔥 Máximo (Mapa 6)        ]      │
│  [ ℹ️ Atualizar Info         ]      │
└─────────────────────────────────────┘
```

---

## 💡 Dicas

### **1. Mapa não mudou?**
- Verifique se o dispositivo está conectado
- Aguarde 1-2 segundos após clicar
- Tente clicar novamente

### **2. Pressão mostra 0,0?**
- Normal se o pedal não estiver sendo pressionado
- A pressão atualiza quando você pressiona o pedal
- Se não atualizar, clique em "🔄 Ler"

### **3. Dados não aparecem?**
- Verifique se está "🔔 Monitorando"
- Se mostrar "🔕 Não monitorando", desconecte e reconecte
- Clique em "🔄 Ler" para forçar leitura

### **4. Como saber qual mapa está ativo?**
- O mapa ativo tem borda preta grossa
- Também tem um ✓ no canto superior direito
- O texto mostra: "Selecionado: Mapa X (Byte: XX)"

---

## 📱 Localização no Código

- **Componente**: `components/PTorkControlPanel.tsx`
- **Integração**: `components/BLEScreen.tsx` (linha ~234)
- **Condição**: Aparece se `device.name` contém "P TORK" ou "TORK"

---

## 🔧 Personalização

### **Mudar Cores dos Mapas**
Edite `utils/MapConverter.ts`:
```typescript
export function ReturnColorPiggyInputByte(map: number): string {
  const colors: Record<number, string> = {
    20: '#FFFFFF', // Branco - MUDE AQUI
    21: '#40E0D0', // Turquesa
    // ...
  };
}
```

### **Adicionar Mais Mapas**
Edite `utils/MapConverter.ts`:
```typescript
export function getAllMaps(): GasMap[] {
  return [0, 1, 2, 3, 4, 5, 6, 7, 8]; // Adicione mais
}
```

### **Mudar Layout**
Edite `components/PTorkControlPanel.tsx` seção `styles`

---

## 🎯 Fluxo Completo de Uso

```
1. Abrir App
   ↓
2. "Start Scan"
   ↓
3. Encontrar "P TORK ONE BT"
   ↓
4. "Connect"
   ↓
5. ✅ PAINEL APARECE AUTOMATICAMENTE
   ↓
6. Selecionar Mapa (clicar no botão)
   ↓
7. ✅ Mapa ativado no pedal
   ↓
8. Pressionar pedal → Pressão atualiza
   ↓
9. "Disconnect" quando terminar
```

---

## 🐛 Troubleshooting

| Problema | Solução |
|----------|---------|
| Painel não aparece | Verifique se o nome do dispositivo contém "TORK" |
| Mapas não mudam | Verifique conexão e tente "Disconnect" + "Connect" |
| Pressão não atualiza | Pressione o pedal fisicamente |
| Erro ao trocar mapa | Aguarde device estar totalmente conectado (3s) |
| Dados em branco | Clique em "🔄 Ler" |

---

## 📚 Recursos Relacionados

- **Mapas**: `GUIA_MAP_CONVERTER.md`
- **UUIDs**: `GUIA_CONFIG_PTORK.md`
- **Serviço BLE**: `BLUETOOTH_SERVICE_README.md`
- **Código**: `components/PTorkControlPanel.tsx`

---

## ✨ Exemplo de Uso Real

```
Cenário: Pilotar em pista molhada
├─ Situação: Precisa de controle suave
├─ Ação: Selecionar Mapa 2 (Verde - Moderado)
└─ Resultado: Pedal mais suave, melhor controle

Cenário: Ultrapassagem em reta
├─ Situação: Precisa de potência máxima
├─ Ação: Selecionar Mapa 6 (Vermelho - Máximo)
└─ Resultado: Aceleração total

Cenário: Economia de combustível
├─ Situação: Trajeto longo, economizar
├─ Ação: Selecionar Mapa 0 (Branco - Mínimo)
└─ Resultado: Menor consumo
```

---

🎉 **Pronto! Agora você sabe usar o Painel de Controle do P TORK ONE BT!**
