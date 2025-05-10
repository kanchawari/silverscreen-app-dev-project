import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import NavBar from '../components/NavBar';

export default function WatchlistScreen() {
  return (
    <View style={styles.container}>
      <NavBar />
      <View style={styles.content}>
        <Text style={styles.text}>Your Watchlist is empty.</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#222' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { color: '#fff', fontSize: 22, fontWeight: 'bold' },
});
