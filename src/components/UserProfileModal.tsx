import React, { useEffect, useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export default function UserProfileModal({ visible, onClose, onSignOut }: UserProfileModalProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const q = query(collection(db, 'users'), where('uid', '==', auth.currentUser.uid));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUsername(querySnapshot.docs[0].data().username);
        } else {
          setUsername(auth.currentUser.email || '');
        }
      } catch (e) {
        setUsername(auth.currentUser?.email || '');
      } finally {
        setLoading(false);
      }
    };
    if (visible) fetchUsername();
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Text style={styles.closeText}>×</Text>
          </TouchableOpacity>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>👤</Text>
          </View>
          {loading ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={styles.username}>{username}</Text>
          )}
          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Text style={styles.signOutText}>sign out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    width: 320,
    backgroundColor: '#ddd',
    borderRadius: 24,
    alignItems: 'center',
    padding: 32,
    position: 'relative',
  },
  closeBtn: {
    position: 'absolute',
    top: 12,
    right: 16,
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    color: '#888',
  },
  iconCircle: {
    width: 180,
    height: 180,
    borderRadius: 90,
    backgroundColor: '#000',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  icon: {
    fontSize: 100,
    color: '#fff',
  },
  username: {
    fontSize: 32,
    color: '#222',
    marginBottom: 32,
    fontWeight: '500',
  },
  signOutBtn: {
    backgroundColor: '#222',
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 48,
    marginTop: 8,
  },
  signOutText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: '400',
  },
}); 