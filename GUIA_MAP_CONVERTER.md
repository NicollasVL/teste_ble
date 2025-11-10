# 🗺️ Guia de Uso do MapConverter - P TORK ONE BT

## 📋 Visão Geral

O **MapConverter** gerencia todos os mapas e conversões do pedal P TORK ONE BT, incluindo:
- Conversão entre mapas Gas (0-6) e Pedal (20-26)
- Cores associadas a cada mapa
- Conversão de valores de pressão
- Armazenamento de configurações personalizadas

---

## 🎯 Mapas Disponíveis

| Mapa Gas | Mapa Pedal | Letra | Cor | Nome |
|----------|------------|-------|-----|------|
| 0 | 20 | z | ⚪ Branco | Mapa 0 |
| 1 | 21 | a | 🔵 Turquesa | Mapa 1 |
| 2 | 22 | b | 🟢 Verde | Mapa 2 |
| 3 | 23 | c | 🟢 Lima | Mapa 3 |
| 4 | 24 | d | 🟡 Amarelo | Mapa 4 |
| 5 | 25 | e | 🟠 Laranja | Mapa 5 |
| 6 | 26 | f | 🔴 Vermelho | Mapa 6 |

---

## 🚀 Como Usar

### **1. Importar o Módulo**

```typescript
import MapConverter from '../utils/MapConverter';
// ou importações específicas:
import { GtoP, PtoG, ReturnColorGas } from '../utils/MapConverter';
```

---

### **2. Conversão Gas ↔ Pedal**

#### **Gas para Pedal (GtoP)**
```typescript
const gasMap = 3;
const pedalMap = MapConverter.GtoP(gasMap);
console.log(pedalMap); // 23

// Enviar para o pedal via BLE
await bleService.writeByte(pedalMap);
```

#### **Pedal para Gas (PtoG)**
```typescript
const pedalByte = 25; // recebido do pedal via BLE
const gasMap = MapConverter.PtoG(pedalByte);
console.log(gasMap); // 5 (mapa laranja)
```

#### **Letra para Gas (PtoGInputLetter)**
```typescript
const userInput = 'f'; // usuário digitou 'f'
const gasMap = MapConverter.PtoGInputLetter(userInput);
console.log(gasMap); // 6 (mapa vermelho)
```

---

### **3. Cores dos Mapas**

#### **Cor do Mapa Gas (0-9)**
```typescript
const mapColor = MapConverter.ReturnColorGas('4');
console.log(mapColor); // '#FFFF00' (amarelo)

// Usar em componente
<View style={{ backgroundColor: MapConverter.ReturnColorGas('4') }}>
  <Text>Mapa Amarelo</Text>
</View>
```

#### **Cor do Mapa Pedal (20-26)**
```typescript
const pedalByte = 26; // vermelho
const color = MapConverter.ReturnColorPiggyInputByte(pedalByte);
console.log(color); // '#FF0000'
```

#### **Cor por Letra**
```typescript
const letter = 'e'; // laranja
const color = MapConverter.ReturnColorPiggyInputString(letter);
console.log(color); // '#FFA500'
```

---

### **4. Sincronização com Chip (AsyncStorage)**

#### **Salvar Configuração Personalizada**
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';

// Salvar mapeamento personalizado: Mapa 0 = Pedal 23 (ao invés de 20)
await AsyncStorage.setItem('sc_gtop_m0', '3'); // 3 -> GtoP(3) = 23

// Salvar mapeamento reverso
await AsyncStorage.setItem('sc_ptog_m0', '0');
```

#### **Ler Configuração Sincronizada**
```typescript
// Obter valor do Mapa 0 personalizado
const pedalValue = await MapConverter.SyncChip_GtoP(0);
console.log(pedalValue); // 23 (se foi salvo '3')

// Converter volta
const gasValue = await MapConverter.SyncChip_PtoG(20);
console.log(gasValue); // Valor salvo em 'sc_ptog_m0'
```

---

### **5. Conversão de Pressão (Manômetro)**

#### **Posição → Bar**
```typescript
const position = 174;
const barValue = MapConverter.ConvertPositionToBar(position);
console.log(barValue); // 0.980665 (≈1.0 Bar)
```

#### **Posição → Kgf/cm²**
```typescript
const position = 240;
const kgf = MapConverter.ConvertPositionToKgf(position);
console.log(kgf); // "1,5"

// Exibir no UI
<Text>Pressão: {MapConverter.ConvertPositionToKgf(position)} Kgf/cm²</Text>
```

#### **Byte → Posição Visual**
```typescript
const bytePressure = 224; // recebido do pedal
const visualPosition = MapConverter.ConvertByteToPosition(bytePressure);
console.log(visualPosition); // 176

// Calcular pressão
const kgf = MapConverter.ConvertPositionToKgf(visualPosition);
console.log(kgf); // "1,0"
```

---

### **6. Funções Auxiliares**

#### **Obter Todos os Mapas**
```typescript
const allMaps = MapConverter.getAllMaps();
console.log(allMaps); // [0, 1, 2, 3, 4, 5, 6]

// Renderizar lista de mapas
{allMaps.map(map => (
  <View key={map} style={{ backgroundColor: MapConverter.ReturnColorGas(map.toString()) }}>
    <Text>Mapa {map}</Text>
  </View>
))}
```

#### **Obter Informações Completas do Mapa**
```typescript
const mapInfo = MapConverter.getMapInfo(4);
console.log(mapInfo);
// {
//   gas: 4,
//   pedal: 24,
//   letter: 'd',
//   color: '#FFFF00',
//   image: 'selectbutton_map4'
// }
```

---

## 🎨 Exemplo de Componente: Seletor de Mapas

```typescript
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapConverter from '../utils/MapConverter';
import { BluetoothService } from '../services/BluetoothService';

const MapSelector = ({ bleService }: { bleService: BluetoothService }) => {
  const [selectedMap, setSelectedMap] = useState(0);
  const maps = MapConverter.getAllMaps();

  const handleSelectMap = async (map: number) => {
    setSelectedMap(map);
    
    // Converter para byte do pedal
    const pedalByte = MapConverter.GtoP(map);
    
    // Enviar para o pedal
    try {
      await bleService.writeByte(pedalByte);
      console.log(`Mapa ${map} (byte ${pedalByte}) enviado!`);
    } catch (error) {
      console.error('Erro ao enviar mapa:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selecione o Mapa</Text>
      
      <View style={styles.mapGrid}>
        {maps.map(map => {
          const mapInfo = MapConverter.getMapInfo(map);
          const isSelected = selectedMap === map;
          
          return (
            <TouchableOpacity
              key={map}
              style={[
                styles.mapButton,
                {
                  backgroundColor: mapInfo.color,
                  borderWidth: isSelected ? 3 : 1,
                  borderColor: isSelected ? '#000' : '#ccc',
                }
              ]}
              onPress={() => handleSelectMap(map)}
            >
              <Text style={styles.mapText}>
                Mapa {map}
              </Text>
              <Text style={styles.mapLetter}>
                ({mapInfo.letter.toUpperCase()})
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
      
      <Text style={styles.selectedInfo}>
        Selecionado: Mapa {selectedMap} (Byte: {MapConverter.GtoP(selectedMap)})
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  mapButton: {
    width: 100,
    height: 80,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapText: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  mapLetter: {
    fontSize: 12,
    marginTop: 5,
  },
  selectedInfo: {
    marginTop: 20,
    fontSize: 16,
    textAlign: 'center',
  },
});

export default MapSelector;
```

---

## 🎚️ Exemplo: Indicador de Pressão

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react';
import MapConverter from '../utils/MapConverter';

const PressureGauge = ({ byteValue }: { byteValue: number }) => {
  // Converter byte para posição
  const position = MapConverter.ConvertByteToPosition(byteValue);
  
  // Converter posição para Kgf
  const kgf = MapConverter.ConvertPositionToKgf(position);
  
  // Converter posição para Bar
  const bar = MapConverter.ConvertPositionToBar(position);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pressão Atual</Text>
      
      <View style={styles.gaugeContainer}>
        <Text style={styles.valueKgf}>{kgf}</Text>
        <Text style={styles.unitKgf}>Kgf/cm²</Text>
      </View>
      
      <View style={styles.gaugeContainer}>
        <Text style={styles.valueBar}>{bar.toFixed(6)}</Text>
        <Text style={styles.unitBar}>Bar</Text>
      </View>
      
      <Text style={styles.debug}>
        Byte: {byteValue} | Posição: {position}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  gaugeContainer: {
    alignItems: 'center',
    marginVertical: 10,
  },
  valueKgf: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#FF0000',
  },
  unitKgf: {
    fontSize: 16,
    color: '#666',
  },
  valueBar: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007AFF',
  },
  unitBar: {
    fontSize: 14,
    color: '#666',
  },
  debug: {
    marginTop: 15,
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
  },
});

export default PressureGauge;
```

---

## 📝 Notas Importantes

### **1. Valores de Byte do Pedal**
- Mapas: bytes 20-26
- Pressão: bytes 200-250
- Sempre use `GtoP()` antes de enviar para o pedal

### **2. AsyncStorage**
- Permite personalização de mapas
- Salva preferências do usuário
- Use chaves: `sc_gtop_m0` a `sc_gtop_m6` e `sc_gtop_meco`

### **3. Cores em Hex**
- Use diretamente em `backgroundColor`
- Todas as cores são códigos hex válidos
- Padrão é cinza (`#808080`) para valores inválidos

---

## 🐛 Troubleshooting

### Mapa não muda no pedal
```typescript
// ❌ ERRADO: enviar número Gas diretamente
await bleService.writeByte(4); // Não funciona!

// ✅ CORRETO: converter para byte Pedal primeiro
const pedalByte = MapConverter.GtoP(4); // 24
await bleService.writeByte(pedalByte);
```

### Pressão mostra "-"
```
ConvertPositionToKgf(999) // retorna "-"
```
➡️ **Solução**: Valor fora do intervalo (50-308). Verifique byte recebido.

### AsyncStorage não funciona
```typescript
// Certifique-se de usar await
const value = await MapConverter.SyncChip_GtoP(0);
// Não: const value = MapConverter.SyncChip_GtoP(0); // retorna Promise!
```

---

## 📚 Recursos

- **Código Fonte**: `utils/MapConverter.ts`
- **Exemplo Seletor**: Ver código acima
- **Exemplo Gauge**: Ver código acima
