import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation, StackActions } from '@react-navigation/native';
import type { NavigationProp } from '@react-navigation/native';
import UserProfileModal from './UserProfileModal';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';

export type RootStackParamList = {
  Home: undefined;
  MovieDetails: { movieId: string };
  Watchlist: undefined;
  WatchHistory: undefined;
};

type NavBarProps = {}; // Add actual prop types if needed
export default function NavBar(props: NavBarProps) {
  const navigation = useNavigation<NavigationProp<any>>();
  const [modalVisible, setModalVisible] = useState(false);

  const handleSignOut = async () => {
    await signOut(auth);
    setModalVisible(false);
    // Optionally, trigger navigation to Login if needed
    navigation.dispatch(StackActions.replace('Login'));
  };

  return (
    <LinearGradient
      colors={['#8e054a', '#1a1a6e']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <TouchableOpacity onPress={() => navigation.navigate('Home')}>
          <Image
            source={require('../../assets/silverscreen-logo.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </TouchableOpacity>
        <View style={styles.spacer} />
        <View style={styles.linksWrapper}>
          <TouchableOpacity onPress={() => navigation.navigate('WatchHistory')}>
            <Text style={styles.link}>Watch History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Watchlist')}>
            <Text style={styles.link}>Watchlist</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Recommendation')}>
            <Text style={styles.link}>Recommendation</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.spacer} />
        <TouchableOpacity style={styles.userIconBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.userIcon}>👤</Text>
        </TouchableOpacity>
      </View>
      <UserProfileModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSignOut={handleSignOut}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: {
    paddingTop: 24,
    paddingBottom: 12,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: 48,
    height: 48,
  },
  spacer: {
    flex: 1,
  },
  linksWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 2,
  },
  link: {
    color: '#fff',
    fontSize: 18,
    marginHorizontal: 16,
    fontWeight: 'bold',
  },
  userIconBtn: {
    position: 'absolute',
    top: 10,
    right: 16,
    zIndex: 20,
  },
  userIcon: {
    fontSize: 32,
    color: '#fff',
  },
}); 