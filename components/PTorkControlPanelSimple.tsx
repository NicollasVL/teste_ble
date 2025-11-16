/**
 * Versão simplificada do Painel P TORK para testes
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { Device } from 'react-native-ble-plx';
import MapConverter from '../utils/MapConverter';
import { getDeviceConfig } from '../constants/PTorkUUIDs';

// Contador global para debug
let globalCallCount = 0;
let lastGlobalCallTime = 0;
let callsInLastSecond = 0;
let GLOBAL_LOCK = false; // TRAVA GLOBAL - se detectar loop, bloqueia TUDO

interface PTorkControlPanelSimpleProps {
  device: Device;
  onRead: (serviceUUID: string, charUUID: string) => Promise<string>;
  onWrite: (serviceUUID: string, charUUID: string, value: string, withResponse?: boolean) => Promise<void>;
  onSubscribe: (
    serviceUUID: string,
    charUUID: string,
    callback: (value: string) => void
  ) => Promise<any>;
}

// ============================================
// FUNÇÕES AUXILIARES PARA BLE
// ============================================

/**
 * Protocolo específico para G PEDAL B
 * USA APENAS 1 BYTE ASCII (sem o zero extra)
 * Mapa 0 = '0' (48), Mapa 1 = '1' (49), etc.
 */
const createGpedalBCommand = (mapNumber: number): number[] => {
  // G PEDAL B aceita APENAS 1 byte ASCII (descoberto no teste)
  const asciiNumber = 48 + mapNumber; // '0' = 48, '1' = 49, etc.
  console.log(`🎯 G PEDAL B: Mapa ${mapNumber} → ASCII '${String.fromCharCode(asciiNumber)}' (byte ${asciiNumber})`);
  return [asciiNumber]; // APENAS 1 BYTE!
};

/**
 * Protocolo para P TORK (original)
 * byte[] bt = new byte[2]; bt[0] = value1;
 */
const createPtorkCommand = (mapNumber: number): number[] => {
  const pedalByte = MapConverter.GtoP(mapNumber);
  return [pedalByte, 0]; // Exatamente como no C#: byte[2] com segundo elemento 0
};

/**
 * Função universal de criação de comando
 * Detecta o dispositivo e usa o protocolo correto
 */
const createCommandForDevice = (mapNumber: number, deviceName: string | null): number[] => {
  if (deviceName?.includes('G PEDAL')) {
    console.log(`🎯 Criando comando G PEDAL B para mapa ${mapNumber}`);
    return createGpedalBCommand(mapNumber);
  } else {
    console.log(`🎯 Criando comando P TORK para mapa ${mapNumber}`);
    return createPtorkCommand(mapNumber);
  }
};

/**
 * Converte array de bytes para base64 (compatível com React Native)
 */
const bytesToBase64 = (bytes: number[]): string => {
  // Criar Uint8Array a partir dos bytes
  const uint8Array = new Uint8Array(bytes);
  
  // Converter para string binária
  let binaryString = '';
  uint8Array.forEach(byte => {
    binaryString += String.fromCharCode(byte);
  });
  
  // Converter para base64 usando btoa (nativo do JavaScript)
  const base64 = btoa(binaryString);
  console.log(`🔤 Conversão base64: [${bytes.join(', ')}] → "${base64}"`);
  
  return base64;
};

export const PTorkControlPanelSimple: React.FC<PTorkControlPanelSimpleProps> = ({
  device,
  onRead,
  onWrite,
  onSubscribe,
}) => {
  const renderCount = React.useRef(0);
  renderCount.current++;
  console.log(`🔄 PTorkControlPanelSimple RENDER #${renderCount.current}`);
  
  // Detectar configuração baseada no nome do dispositivo
  const DEVICE_CONFIG = React.useMemo(() => {
    const config = getDeviceConfig(device.name || '');
    console.log('📱 Configuração detectada:', {
      deviceName: device.name,
      serviceUUID: config.services.main,
      charUUID: config.characteristics.mainData
    });
    return config;
  }, [device.name]);
  
  const [selectedMap, setSelectedMap] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [lastReceivedData, setLastReceivedData] = useState<string>('');
  const [isMonitoring, setIsMonitoring] = useState(false);
  const monitoringRef = React.useRef<boolean>(false);
  const lastMapUpdateRef = React.useRef<number>(0);
  const currentMapRef = React.useRef<number>(0);
  const isExecutingCommandRef = React.useRef<boolean>(false);
  
  // Guardar props em refs para evitar mudanças de referência causarem re-renders
  const onWriteRef = React.useRef(onWrite);
  const onReadRef = React.useRef(onRead);
  const onSubscribeRef = React.useRef(onSubscribe);
  
  React.useEffect(() => {
    onWriteRef.current = onWrite;
    onReadRef.current = onRead;
    onSubscribeRef.current = onSubscribe;
  }, [onWrite, onRead, onSubscribe]);

  // Monitorar dados recebidos ao montar o componente APENAS UMA VEZ
  React.useEffect(() => {
    setupMonitoring();
    
    // Cleanup ao desmontar
    return () => {
      console.log('🧹 Limpando monitoramento...');
      monitoringRef.current = false;
    };
  }, []); // Array vazio = executa só uma vez

  const setupMonitoring = async () => {
    if (monitoringRef.current) {
      console.log('⚠️ Monitoramento já ativo');
      return;
    }
    
    try {
      console.log('📡 Iniciando monitoramento...');
      monitoringRef.current = true;
      
      // Subscrever primeiro
      await onSubscribeRef.current(
        DEVICE_CONFIG.services.main,
        DEVICE_CONFIG.characteristics.mainData,
        (value) => {
          handleDataReceived(value);
        }
      );
      
      // IMPORTANTE: Enviar byte inicial 115 (0x73) como no código C#
      // Isso "acorda" o dispositivo para comunicação
      console.log('📤 Enviando byte inicial 115 (0x73) para ativar comunicação...');
      const initData = bytesToBase64([115, 0]);
      await onWriteRef.current(
        DEVICE_CONFIG.services.main,
        DEVICE_CONFIG.characteristics.mainData,
        initData,
        false // SEM esperar resposta
      );
      console.log('✅ Byte inicial enviado');
      
      setIsMonitoring(true);
      console.log('✅ Monitoramento ativo');
    } catch (error: any) {
      console.error('❌ Erro ao monitorar:', error?.message);
      setIsMonitoring(false);
      monitoringRef.current = false;
    }
  };

  const handleDataReceived = useCallback((value: string) => {
    try {
      console.log('📥 handleDataReceived CHAMADO! Valor recebido:', value);
      
      // Converter string para bytes
      const bytes: number[] = [];
      for (let i = 0; i < value.length; i++) {
        bytes.push(value.charCodeAt(i));
      }
      
      console.log('📥 Bytes extraídos:', bytes);
      
      // Atualizar dados recebidos apenas se mudou
      const newData = bytes.join(', ');
      setLastReceivedData(prev => prev !== newData ? newData : prev);
      
      console.log('🔍 PROCESSANDO DADOS RECEBIDOS:', {
        bytes,
        firstByte: bytes[0],
        firstByteHex: '0x' + bytes[0].toString(16).toUpperCase(),
        firstByteChar: String.fromCharCode(bytes[0]),
        currentMap: currentMapRef.current
      });
      
      // Processar cada byte recebido COM DEBOUNCE
      if (bytes.length > 0) {
        const firstByte = bytes[0];
        let mapNumber: number | null = null;
        
        // Verificar se é um byte de mapa (20-26)
        if (firstByte >= 20 && firstByte <= 26) {
          mapNumber = MapConverter.PtoG(firstByte);
          console.log(`🔢 Recebeu byte ${firstByte} → mapa ${mapNumber}`);
        }
        // Verificar se é uma LETRA de mapa (ASCII 97-102 = 'a'-'f', ou 122 = 'z')
        else if ((firstByte >= 97 && firstByte <= 102) || firstByte === 122) {
          const letter = String.fromCharCode(firstByte);
          mapNumber = MapConverter.PtoGInputLetter(letter);
          console.log(`🔤 Recebeu letra '${letter}' (byte ${firstByte}) → mapa ${mapNumber}`);
        }
        // Verificar se é um NÚMERO ASCII de mapa (ASCII 48-54 = '0'-'6') - G PEDAL B
        else if (firstByte >= 48 && firstByte <= 54) {
          const numberChar = String.fromCharCode(firstByte);
          mapNumber = parseInt(numberChar, 10);
          console.log(`🔢 Recebeu número '${numberChar}' (byte ${firstByte}) → mapa ${mapNumber}`);
        }
        
        // Se identificou um mapa, atualizar com DEBOUNCE
        if (mapNumber !== null) {
          const now = Date.now();
          if (mapNumber !== currentMapRef.current && now - lastMapUpdateRef.current > 300) {
            currentMapRef.current = mapNumber;
            lastMapUpdateRef.current = now;
            setSelectedMap(mapNumber);
            console.log(`🗺️ Mapa atualizado para: ${mapNumber}`);
          }
        }
        // Bytes de pressão (200-250) - SEM LOG para evitar spam
        else if (firstByte >= 200 && firstByte <= 250) {
          // Apenas processa, sem log
        }
      }
    } catch (error: any) {
      console.error('❌ Erro ao processar dados:', error);
    }
  }, []); // SEM dependências - função nunca muda

  const handleChangeMap = useCallback(async (mapNumber: number) => {
    console.log(`\n🚀 handleChangeMap chamado para mapa ${mapNumber}`);
    
    // Para G PEDAL B: APENAS 1 byte ASCII (como no teste que funciona)
    if (device.name?.includes('G PEDAL')) {
      console.log('🎯 G PEDAL B detectado - Protocolo ASCII 1 byte');
      
      try {
        const byteArray = createGpedalBCommand(mapNumber); // Retorna [48-54]
        const base64Data = bytesToBase64(byteArray);
        
        console.log('📤 G PEDAL B:', {
          mapa: mapNumber,
          ascii: String.fromCharCode(byteArray[0]),
          byte: byteArray[0],
          base64: base64Data
        });
        
        await onWriteRef.current(
          DEVICE_CONFIG.services.main,
          DEVICE_CONFIG.characteristics.mainData,
          base64Data,
          false
        );
        
        // Delay pequeno
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('✅ Comando G PEDAL B enviado!');
        
      } catch (error: any) {
        console.error('❌ Erro G PEDAL B:', error);
        Alert.alert('Erro', `Não foi possível trocar o mapa: ${error.message}`);
      }
      
      return; // SAIR - não executar a lógica do P TORK
    }
    
    // ==============================================
    // DAQUI PRA BAIXO: Lógica do P TORK (com bloqueios)
    // ==============================================
    
    // VERIFICAR TRAVA GLOBAL PRIMEIRO
    if (GLOBAL_LOCK) {
      console.error('⛔ SISTEMA BLOQUEADO POR LOOP - Recarregue o app');
      return;
    }
    
    const now = Date.now();
    
    // PROTEÇÃO ANTI-LOOP: Detectar chamadas muito rápidas
    if (now - lastGlobalCallTime < 2000) {
      callsInLastSecond++;
      if (callsInLastSecond > 2) {
        GLOBAL_LOCK = true; // TRAVAR GLOBALMENTE
        console.error('🚨🚨🚨 LOOP DETECTADO! SISTEMA TRAVADO! 🚨🚨🚨');
        console.error('Mais de 2 chamadas em 2 segundos - ALGO ESTÁ ERRADO!');
        Alert.alert(
          '🚨 LOOP DETECTADO!',
          'Detectamos múltiplas chamadas consecutivas. O sistema foi TRAVADO. Recarregue o app (pressione R).',
          [{ text: 'OK' }]
        );
        return;
      }
    } else {
      callsInLastSecond = 0;
    }
    lastGlobalCallTime = now;
    
    globalCallCount++;
    const callId = globalCallCount;
    
    console.log(`\n==================== CHAMADA #${callId} ====================`);
    console.log(`[${callId}] 🚀 handleChangeMap chamado para mapa ${mapNumber}`);
    console.log(`[${callId}] 📊 Estado atual: loading=${loading}, isExecuting=${isExecutingCommandRef.current}`);
    console.log(`[${callId}] 📊 Chamadas recentes: ${callsInLastSecond}/2`);
    
    // BLOQUEIO ABSOLUTO - se já está executando, ignora completamente
    if (isExecutingCommandRef.current) {
      console.log(`[${callId}] 🚫 BLOQUEADO: Comando já em execução - ABORTANDO!`);
      console.log(`====================================================\n`);
      return;
    }
    
    if (loading) {
      console.log(`[${callId}] 🚫 BLOQUEADO: Loading ativo - ABORTANDO!`);
      console.log(`====================================================\n`);
      return;
    }
    
    console.log(`[${callId}] ✅ Passando todos os bloqueios, iniciando execução`);
    
    // BLOQUEAR IMEDIATAMENTE
    isExecutingCommandRef.current = true;
    setLoading(true);
    console.log(`[${callId}] 🔒 BLOQUEIOS ATIVADOS: isExecuting=true, loading=true`);
    
    try {
      // 1. Criar comando ESPECÍFICO para o dispositivo
      const byteArray = createCommandForDevice(mapNumber, device.name);
      console.log(`[${callId}] 📝 Bytes para ${device.name}: [${byteArray.join(', ')}]`);
      console.log(`[${callId}] 🔍 Primeiro byte: ${byteArray[0]} (0x${byteArray[0].toString(16).toUpperCase()})`);
      
      // 2. Converter para base64
      const base64Data = bytesToBase64(byteArray);
      console.log(`[${callId}] 📡 Dados em base64: ${base64Data}`);
      
      // 3. DEBUG: Log completo do comando
      console.log(`[${callId}] 🎯 DETALHES DO COMANDO:`, {
        device: device.name,
        mapNumber,
        bytes: byteArray,
        firstByte: byteArray[0],
        firstByteHex: '0x' + byteArray[0].toString(16).toUpperCase(),
        firstByteChar: String.fromCharCode(byteArray[0]),
        base64: base64Data,
        serviceUUID: DEVICE_CONFIG.services.main,
        charUUID: DEVICE_CONFIG.characteristics.mainData
      });
      
      console.log(`[${callId}] 🔍 Chamando onWriteRef.current...`);
      const startTime = Date.now();
      
      // TIMEOUT ABSOLUTO: Se não responder em 10 segundos, cancela TUDO
      const writePromise = onWriteRef.current(
        DEVICE_CONFIG.services.main,
        DEVICE_CONFIG.characteristics.mainData,
        base64Data,
        false // SEM ESPERAR RESPOSTA - como no C#
      );
      
      const timeoutPromise = new Promise<void>((_, reject) => 
        setTimeout(() => reject(new Error('Timeout: Comando demorou mais de 10s')), 10000)
      );
      
      // Race: o que terminar primeiro ganha
      await Promise.race([writePromise, timeoutPromise]);
      
      console.log(`[${callId}] 🔍 onWriteRef.current retornou`);
      
      const endTime = Date.now();
      console.log(`[${callId}] ✅ COMANDO ENVIADO! (${endTime - startTime}ms)`);
      
      // Delay MAIOR para evitar comandos muito rápidos
      console.log(`[${callId}] ⏳ Aguardando 2000ms...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      
    } catch (error: any) {
      const errorMsg = error?.message || String(error);
      console.error(`[${callId}] ❌ ERRO:`, errorMsg);
      
      if (errorMsg.includes('Timeout')) {
        console.error(`[${callId}] ⏱️ TIMEOUT: Comando demorou mais de 10 segundos`);
        Alert.alert(
          '⏱️ Timeout',
          'O comando demorou mais de 10 segundos. O dispositivo não está respondendo. Verifique a conexão.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert('Erro', `Não foi possível trocar o mapa: ${errorMsg}`);
      }
    } finally {
      console.log(`[${callId}] 🏁 FINALIZANDO - Desbloqueando...`);
      setLoading(false);
      isExecutingCommandRef.current = false;
      console.log(`[${callId}] 🔓 DESBLOQUEADO: isExecuting=false, loading=false`);
      console.log(`====================================================\n`);
    }
  }, [device.name]); // Adicionar device.name como dependência

  const renderMapButton = (mapNumber: number) => {
    const mapInfo = MapConverter.getMapInfo(mapNumber);
    const isSelected = selectedMap === mapNumber;

    return (
      <View key={mapNumber} pointerEvents={loading ? "none" : "auto"}>
        <TouchableOpacity
          style={[
            styles.mapButton,
            { backgroundColor: mapInfo.color },
            isSelected && styles.selectedButton,
            loading && { opacity: 0.3 },
          ]}
          onPress={() => {
            const clickTime = Date.now();
            console.log(`🖱️ CLIQUE FÍSICO no botão ${mapNumber} - Timestamp: ${clickTime}`);
            console.log(`🔒 Estados ANTES da chamada: loading=${loading}, isExecuting=${isExecutingCommandRef.current}, GLOBAL_LOCK=${GLOBAL_LOCK}`);
            handleChangeMap(mapNumber);
          }}
          disabled={loading}
          activeOpacity={loading ? 1 : 0.7}
        >
          <Text style={styles.mapText}>
            {mapNumber}
          </Text>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
          {loading && <Text style={styles.loadingDot}>⏳</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        🎮 {device.name?.includes('G PEDAL') ? 'G PEDAL' : 'P TORK'} Control
      </Text>
      
      {loading && (
        <View style={styles.loadingIndicator}>
          <Text style={styles.loadingText}>🔴 ENVIANDO COMANDO... AGUARDE!</Text>
          <Text style={styles.loadingSubtext}>Não clique em outros botões</Text>
        </View>
      )}
      
      {!loading && (
        <View style={styles.readyIndicator}>
          <Text style={styles.readyText}>🟢 PRONTO - Clique em um mapa</Text>
        </View>
      )}
      
      <Text style={styles.subtitle}>Mapas de Potência:</Text>
      
      <View style={styles.mapGrid}>
        {[0, 1, 2, 3, 4, 5, 6].map(renderMapButton)}
      </View>
      
      {/* Overlay invisível para bloquear TODOS os toques durante loading */}
      {loading && (
        <View style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'transparent',
          zIndex: 9999,
        }} pointerEvents="box-only" />
      )}
      
      <View style={styles.infoBox}>
        <View style={[styles.statusBadge, { backgroundColor: isMonitoring ? '#00FF00' : '#FF0000' }]} />
        <Text style={styles.infoText}>
          🗺️ Mapa Atual: {selectedMap} ({MapConverter.getMapInfo(selectedMap).letter.toUpperCase()})
        </Text>
        <Text style={styles.infoText}>
          🎨 Cor: {['Branco', 'Turquesa', 'Verde', 'Lima', 'Amarelo', 'Laranja', 'Vermelho'][selectedMap]}
        </Text>
        <Text style={styles.infoText}>
          📱 Device: {device.name || device.id.substring(0, 12)}
        </Text>
        <Text style={styles.infoText}>
          {isMonitoring ? '🔔 Monitorando' : '🔕 Não monitorando'}
        </Text>
        {lastReceivedData && (
          <Text style={styles.infoTextSmall}>
            📊 Último dado: [{lastReceivedData}]
          </Text>
        )}
      </View>

      <TouchableOpacity
        style={styles.testButton}
        onPress={async () => {
          try {
            console.log('🧪 TESTE: Enviando byte 115 (0x73)');
            const testData = bytesToBase64([115, 0]);
            await onWriteRef.current(
              DEVICE_CONFIG.services.main,
              DEVICE_CONFIG.characteristics.mainData,
              testData,
              false // SEM esperar resposta
            );
            Alert.alert('✅', 'Teste enviado com sucesso');
          } catch (error: any) {
            Alert.alert('❌', `Teste falhou: ${error.message}`);
          }
        }}
      >
        <Text style={styles.testButtonText}>🧪 Teste Comunicação</Text>
      </TouchableOpacity>

      {device.name?.includes('G PEDAL') && (
        <>
          <TouchableOpacity
            style={styles.gpedalTestButton}
            onPress={async () => {
              try {
                console.log('🧪 TESTE G PEDAL B: Enviando mapa 1 (ASCII \'1\')');
                const testCommand = createGpedalBCommand(1); // Retorna [49] = '1'
                const testData = bytesToBase64(testCommand);
                
                console.log('🔍 Comando de teste:', {
                  mapa: 1,
                  bytes: testCommand,
                  ascii: String.fromCharCode(testCommand[0]),
                  byte: testCommand[0],
                  base64: testData
                });
                
                await onWriteRef.current(
                  DEVICE_CONFIG.services.main,
                  DEVICE_CONFIG.characteristics.mainData,
                  testData,
                  false
                );
                
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // Ler resposta
                const resp = await onReadRef.current(
                  DEVICE_CONFIG.services.main,
                  DEVICE_CONFIG.characteristics.mainData
                );
                
                console.log(`📥 Resposta: '${resp}' (byte ${resp.charCodeAt(0)})`);
                Alert.alert('✅', `Comando enviado!\nResposta: '${resp}'`);
              } catch (error: any) {
                Alert.alert('❌', `Falha: ${error.message}`);
              }
            }}
          >
            <Text style={styles.gpedalTestButtonText}>🎯 Teste G PEDAL B (Mapa 1)</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gpedalTestButton}
            onPress={async () => {
              try {
                console.log('\n🔍 ANÁLISE DETALHADA DO G PEDAL B:');
                console.log('='.repeat(60));
                
                // 1. Estado inicial
                console.log('\n📖 1. LENDO ESTADO INICIAL:');
                const initial = await onReadRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData);
                console.log(`   Estado: '${initial}' = byte ${initial.charCodeAt(0)} (0x${initial.charCodeAt(0).toString(16)})`);
                
                // 2. Testar comandos SEM o byte zero (ASCII puro)
                console.log('\n📤 2. TESTANDO COMANDOS ASCII PUROS (1 byte):');
                
                const singleByteTests = [
                  { name: 'ASCII 0', byte: 48, desc: 'Caractere \'0\'' },
                  { name: 'ASCII 1', byte: 49, desc: 'Caractere \'1\'' },
                  { name: 'ASCII 2', byte: 50, desc: 'Caractere \'2\'' },
                ];
                
                for (const test of singleByteTests) {
                  console.log(`\n   🔹 Enviando ${test.name} (${test.desc}):`);
                  console.log(`      Byte: ${test.byte} (0x${test.byte.toString(16)})`);
                  
                  // ENVIAR APENAS 1 BYTE (sem o zero extra)
                  const data = bytesToBase64([test.byte]);
                  console.log(`      Base64: ${data}`);
                  
                  await onWriteRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData, data, false);
                  await new Promise(resolve => setTimeout(resolve, 800));
                  
                  const resp = await onReadRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData);
                  const respByte = resp.charCodeAt(0);
                  console.log(`      📥 Resposta: '${resp}' = byte ${respByte} (0x${respByte.toString(16)})`);
                  
                  if (respByte !== 48) {
                    console.log(`      ✅ MUDOU! Era '0'(48), agora é '${resp}'(${respByte})`);
                    Alert.alert('🎉 SUCESSO!', `Comando ${test.name} funcionou!\nMudou para: '${resp}'`);
                    return;
                  } else {
                    console.log(`      ❌ Não mudou (ainda '0')`);
                  }
                }
                
                // 3. Testar comandos com DOIS bytes (protocolo P TORK)
                console.log('\n📤 3. TESTANDO COMANDOS DE 2 BYTES (P TORK):');
                
                const doubleByteTests = [
                  { name: 'Mapa 1', bytes: [21, 0], desc: 'Byte 21 + zero' },
                  { name: 'Mapa 2', bytes: [22, 0], desc: 'Byte 22 + zero' },
                ];
                
                for (const test of doubleByteTests) {
                  console.log(`\n   🔹 Enviando ${test.name} (${test.desc}):`);
                  console.log(`      Bytes: [${test.bytes.join(', ')}]`);
                  
                  const data = bytesToBase64(test.bytes);
                  console.log(`      Base64: ${data}`);
                  
                  await onWriteRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData, data, false);
                  await new Promise(resolve => setTimeout(resolve, 800));
                  
                  const resp = await onReadRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData);
                  const respByte = resp.charCodeAt(0);
                  console.log(`      📥 Resposta: '${resp}' = byte ${respByte} (0x${respByte.toString(16)})`);
                  
                  if (respByte !== 48) {
                    console.log(`      ✅ MUDOU! Era '0'(48), agora é '${resp}'(${respByte})`);
                    Alert.alert('🎉 SUCESSO!', `Comando ${test.name} funcionou!\nMudou para: '${resp}'`);
                    return;
                  } else {
                    console.log(`      ❌ Não mudou (ainda '0')`);
                  }
                }
                
                // 4. Resumo
                console.log('\n' + '='.repeat(60));
                console.log('📊 RESUMO:');
                console.log('   ❌ Nenhum comando alterou o estado do dispositivo');
                console.log('   🔒 Dispositivo permanece TRAVADO no mapa 0');
                console.log('   💡 Possíveis causas:');
                console.log('      - Dispositivo em modo somente leitura');
                console.log('      - Precisa de comando de desbloqueio primeiro');
                console.log('      - Protocolo completamente diferente do P TORK');
                console.log('      - Hardware fisicamente bloqueado');
                console.log('='.repeat(60));
                
                Alert.alert('⚠️ Dispositivo Bloqueado', 
                  'Nenhum comando funcionou.\n\n' +
                  'O G PEDAL B está TRAVADO no mapa 0.\n\n' +
                  'Verifique os logs para detalhes.');
                
              } catch (error: any) {
                console.error('❌ Erro:', error);
                Alert.alert('❌', `Erro: ${error.message}`);
              }
            }}
          >
            <Text style={styles.gpedalTestButtonText}>🔍 Análise Completa</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gpedalTestButton}
            onPress={async () => {
              try {
                console.log('\n🔬 TESTE DE TODOS OS PROTOCOLOS COM LEITURA:');
                
                // Protocolo 1: Byte 20-26 (P TORK) - MAPA 0
                console.log('\n📤 Tentativa 1: Byte 20 (0x14) - Protocolo P TORK Mapa 0');
                const test1 = bytesToBase64([20, 0]);
                await onWriteRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData, test1, false);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                // LER RESPOSTA
                const resp1 = await onReadRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData);
                console.log('📥 Resposta 1:', {
                  raw: resp1,
                  bytes: Array.from(resp1).map(c => c.charCodeAt(0)),
                  chars: resp1.split('').map(c => `'${c}'(${c.charCodeAt(0)})`)
                });
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Protocolo 2: Byte 21 (Mapa 1)
                console.log('\n📤 Tentativa 2: Byte 21 (0x15) - Protocolo P TORK Mapa 1');
                const test2 = bytesToBase64([21, 0]);
                await onWriteRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData, test2, false);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const resp2 = await onReadRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData);
                console.log('📥 Resposta 2:', {
                  raw: resp2,
                  bytes: Array.from(resp2).map(c => c.charCodeAt(0)),
                  chars: resp2.split('').map(c => `'${c}'(${c.charCodeAt(0)})`)
                });
                
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Protocolo 3: ASCII '0' e '1'
                console.log('\n📤 Tentativa 3: Byte 48 (0x30) - ASCII \'0\'');
                const test3 = bytesToBase64([48, 0]);
                await onWriteRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData, test3, false);
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const resp3 = await onReadRef.current(DEVICE_CONFIG.services.main, DEVICE_CONFIG.characteristics.mainData);
                console.log('📥 Resposta 3:', {
                  raw: resp3,
                  bytes: Array.from(resp3).map(c => c.charCodeAt(0)),
                  chars: resp3.split('').map(c => `'${c}'(${c.charCodeAt(0)})`)
                });
                
                console.log('\n✅ Todos os testes concluídos! Analise as respostas acima.');
                Alert.alert('✅', 'Testes concluídos!\nVerifique os logs para ver as respostas.');
              } catch (error: any) {
                console.error('❌ Erro nos testes:', error);
                Alert.alert('❌', `Erro: ${error.message}`);
              }
            }}
          >
            <Text style={styles.gpedalTestButtonText}>🔬 Testar Protocolos</Text>
          </TouchableOpacity>
        </>
      )}

      <TouchableOpacity
        style={styles.readButton}
        onPress={async () => {
          try {
            console.log('🔍 Lendo dados...');
            const value = await onReadRef.current(
              DEVICE_CONFIG.services.main,
              DEVICE_CONFIG.characteristics.mainData
            );
            
            const bytes: number[] = [];
            for (let i = 0; i < value.length; i++) {
              bytes.push(value.charCodeAt(i));
            }
            
            const hexString = bytes.map(b => '0x' + b.toString(16).padStart(2, '0').toUpperCase()).join(' ');
            
            console.log('📥 Dados:', {
              bytes: bytes,
              hex: hexString
            });
            
            handleDataReceived(value);
            
            Alert.alert(
              '📊 Dados Lidos', 
              `Bytes: [${bytes.join(', ')}]\n\nHex: ${hexString}`,
              [{ text: 'OK' }]
            );
          } catch (error: any) {
            console.error('❌ Erro ao ler:', error);
            Alert.alert('Erro', 'Não foi possível ler dados');
          }
        }}
        disabled={loading}
      >
        <Text style={styles.readButtonText}>🔍 Ver Dados</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    color: '#333',
  },
  subtitle: {
    fontSize: 13,
    marginBottom: 8,
    color: '#666',
  },
  mapGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginBottom: 12,
  },
  mapButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    margin: 4,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  selectedButton: {
    borderWidth: 3,
    borderColor: '#007AFF',
  },
  mapText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  checkMark: {
    fontSize: 12,
    color: '#007AFF',
    position: 'absolute',
    top: 2,
    right: 6,
  },
  loadingDot: {
    fontSize: 10,
    position: 'absolute',
    bottom: 2,
    right: 6,
  },
  readyIndicator: {
    backgroundColor: '#D4EDDA',
    padding: 8,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#28A745',
  },
  readyText: {
    color: '#155724',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  loadingSubtext: {
    color: '#856404',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
  },
  infoBox: {
    backgroundColor: '#fff',
    padding: 8,
    borderRadius: 8,
    marginBottom: 8,
  },
  infoText: {
    fontSize: 12,
    color: '#444',
    marginBottom: 2,
  },
  infoTextSmall: {
    fontSize: 10,
    color: '#666',
    marginTop: 4,
    fontFamily: 'monospace',
  },
  statusBadge: {
    width: 10,
    height: 10,
    borderRadius: 5,
    position: 'absolute',
    top: 4,
    right: 4,
  },
  readButton: {
    backgroundColor: '#34C759',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  readButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  testButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  gpedalTestButton: {
    backgroundColor: '#FF6B35',
    padding: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  gpedalTestButtonText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  loadingIndicator: {
    backgroundColor: '#F8D7DA',
    padding: 12,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#DC3545',
  },
  loadingText: {
    color: '#721C24',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

// Exportar diretamente sem memo - estava causando problemas
export default PTorkControlPanelSimple;
