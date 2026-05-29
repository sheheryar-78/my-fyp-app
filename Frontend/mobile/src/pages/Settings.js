import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Settings() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings</Text>
      <Text style={styles.subtext}>(Settings page is currently empty in the web version as well)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' },
  text: { fontSize: 24, fontWeight: 'bold', color: '#111827' },
  subtext: { fontSize: 14, color: '#6B7280', marginTop: 8 }
});
