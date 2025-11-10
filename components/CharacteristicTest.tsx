import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Alert } from 'react-native';
import { Subscription } from 'react-native-ble-plx';
import { Buffer } from 'buffer';

interface CharacteristicTestProps {
  serviceUUID: string;
  characteristicUUID: string;
  isReadable: boolean;
  isWritable: boolean;
  isNotifiable: boolean;
  onRead: (serviceUUID: string, charUUID: string) => Promise<string>;
  onWrite: (serviceUUID: string, charUUID: string, value: string) => Promise<void>;
  onSubscribe: (serviceUUID: string, charUUID: string, callback: (value: string) => void) => Promise<Subscription>;
}

// Helper function to format binary data
const formatValue = (value: string): string => {
  if (!value) return '(empty)';
  
  // Remove null terminators and trim
  const cleanValue = value.replace(/\x00+$/g, '').trim();
  
  // Check if it's readable text (allow spaces, letters, numbers, common punctuation)
  // At least 60% of characters should be printable ASCII
  const printableCount = (cleanValue.match(/[\x20-\x7E]/g) || []).length;
  const printableRatio = printableCount / cleanValue.length;
  
  if (printableRatio > 0.6 && cleanValue.length > 0) {
    return cleanValue; // Return as readable text
  }
  
  // Convert to hex for binary data
  const buffer = Buffer.from(value, 'utf-8');
  const hexArray: string[] = [];
  const byteArray: number[] = [];
  
  for (let i = 0; i < buffer.length && i < 20; i++) {
    const byte = buffer[i];
    hexArray.push(byte.toString(16).padStart(2, '0').toUpperCase());
    byteArray.push(byte);
  }
  
  if (buffer.length > 20) {
    hexArray.push('...');
  }
  
  return `Hex: ${hexArray.join(' ')}\nBytes: [${byteArray.slice(0, 10).join(', ')}${buffer.length > 10 ? '...' : ''}]`;
};

export const CharacteristicTest: React.FC<CharacteristicTestProps> = ({
  serviceUUID,
  characteristicUUID,
  isReadable,
  isWritable,
  isNotifiable,
  onRead,
  onWrite,
  onSubscribe,
}) => {
  const [readValue, setReadValue] = useState<string>('');
  const [writeValue, setWriteValue] = useState<string>('');
  const [notifications, setNotifications] = useState<string[]>([]);
  const [subscription, setSubscription] = useState<Subscription | null>(null);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [writeFormat, setWriteFormat] = useState<'text' | 'hex'>('text');

  // 📖 LEITURA
  const handleRead = async () => {
    try {
      const value = await onRead(serviceUUID, characteristicUUID);
      const formattedValue = formatValue(value);
      setReadValue(formattedValue);
      
      console.log('Raw value:', value);
      console.log('Formatted:', formattedValue);
    } catch (error) {
      Alert.alert('Error', 'Failed to read characteristic');
      console.error(error);
    }
  };

  // ✍️ ESCRITA
  const handleWrite = async () => {
    if (!writeValue.trim()) {
      Alert.alert('Error', 'Please enter a value to write');
      return;
    }

    try {
      let valueToWrite = writeValue;
      
      // If hex format, convert hex string to bytes
      if (writeFormat === 'hex') {
        const hexString = writeValue.replace(/[^0-9A-Fa-f]/g, '');
        if (hexString.length % 2 !== 0) {
          Alert.alert('Error', 'Hex string must have even number of characters');
          return;
        }
        const bytes = Buffer.from(hexString, 'hex');
        valueToWrite = bytes.toString('utf-8');
      }
      
      await onWrite(serviceUUID, characteristicUUID, valueToWrite);
      Alert.alert('Success', 'Value written successfully');
      setWriteValue('');
    } catch (error) {
      Alert.alert('Error', 'Failed to write characteristic');
      console.error(error);
    }
  };

  // 🔔 NOTIFICAÇÕES
  const handleSubscribe = async () => {
    try {
      const sub = await onSubscribe(serviceUUID, characteristicUUID, (value) => {
        const formattedValue = formatValue(value);
        const timestamp = new Date().toLocaleTimeString();
        setNotifications(prev => [...prev, `${timestamp}:\n${formattedValue}`]);
      });
      setSubscription(sub);
      setIsSubscribed(true);
      Alert.alert('Success', 'Subscribed to notifications');
    } catch (error) {
      Alert.alert('Error', 'Failed to subscribe');
      console.error(error);
    }
  };

  const handleUnsubscribe = () => {
    if (subscription) {
      subscription.remove();
      setSubscription(null);
      setIsSubscribed(false);
      Alert.alert('Success', 'Unsubscribed from notifications');
    }
  };

  const clearNotifications = () => {
    setNotifications([]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.uuid}>UUID: {characteristicUUID}</Text>

      {/* 📖 READ */}
      {isReadable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Read</Text>
          <TouchableOpacity style={styles.button} onPress={handleRead}>
            <Text style={styles.buttonText}>Read Value</Text>
          </TouchableOpacity>
          {readValue && (
            <View style={styles.valueContainer}>
              <Text style={styles.valueLabel}>Value:</Text>
              <Text style={styles.value}>{readValue}</Text>
            </View>
          )}
        </View>
      )}

      {/* ✍️ WRITE */}
      {isWritable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>✍️ Write</Text>
          
          {/* Botões para alternar formato */}
          <View style={styles.formatToggle}>
            <TouchableOpacity
              style={[styles.toggleButton, writeFormat === 'text' && styles.toggleButtonActive]}
              onPress={() => setWriteFormat('text')}
            >
              <Text style={styles.toggleButtonText}>Text</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.toggleButton, writeFormat === 'hex' && styles.toggleButtonActive]}
              onPress={() => setWriteFormat('hex')}
            >
              <Text style={styles.toggleButtonText}>Hex</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.input}
            placeholder={writeFormat === 'hex' ? 'Enter hex (e.g., 48656C6C6F)' : 'Enter text'}
            value={writeValue}
            onChangeText={setWriteValue}
          />
          <TouchableOpacity style={styles.button} onPress={handleWrite}>
            <Text style={styles.buttonText}>Write Value</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 🔔 NOTIFY */}
      {isNotifiable && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Notifications</Text>
          <View style={styles.notifyControls}>
            <TouchableOpacity
              style={[styles.button, styles.notifyButton, isSubscribed && styles.buttonActive]}
              onPress={isSubscribed ? handleUnsubscribe : handleSubscribe}
            >
              <Text style={styles.buttonText}>
                {isSubscribed ? 'Unsubscribe' : 'Subscribe'}
              </Text>
            </TouchableOpacity>
            {notifications.length > 0 && (
              <TouchableOpacity
                style={[styles.button, styles.clearButton]}
                onPress={clearNotifications}
              >
                <Text style={styles.buttonText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
          {notifications.length > 0 && (
            <ScrollView style={styles.notificationList}>
              {notifications.map((notif, index) => (
                <Text key={index} style={styles.notification}>{notif}</Text>
              ))}
            </ScrollView>
          )}
        </View>
      )}

      {!isReadable && !isWritable && !isNotifiable && (
        <Text style={styles.noOps}>No operations available</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginVertical: 8,
  },
  uuid: {
    fontSize: 12,
    color: '#666',
    marginBottom: 10,
  },
  section: {
    marginVertical: 10,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
  },
  buttonActive: {
    backgroundColor: '#FF3B30',
  },
  buttonText: {
    color: 'white',
    fontWeight: '600',
  },
  input: {
    backgroundColor: 'white',
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 8,
  },
  valueContainer: {
    marginTop: 8,
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 4,
  },
  valueLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 4,
  },
  value: {
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#333',
  },
  formatToggle: {
    flexDirection: 'row',
    marginBottom: 8,
    gap: 8,
  },
  toggleButton: {
    flex: 1,
    backgroundColor: '#E5E5EA',
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toggleButtonActive: {
    backgroundColor: '#007AFF',
  },
  toggleButtonText: {
    color: '#333',
    fontWeight: '600',
  },
  notifyControls: {
    flexDirection: 'row',
    gap: 8,
  },
  notifyButton: {
    flex: 1,
  },
  clearButton: {
    backgroundColor: '#FF9500',
    flex: 0.4,
  },
  notificationList: {
    maxHeight: 150,
    marginTop: 8,
    backgroundColor: 'white',
    borderRadius: 4,
    padding: 10,
  },
  notification: {
    fontSize: 11,
    marginVertical: 4,
    fontFamily: 'monospace',
    color: '#333',
  },
  noOps: {
    textAlign: 'center',
    color: '#999',
    fontStyle: 'italic',
  },
});
