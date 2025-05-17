import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Platform,
} from "react-native";
import { signOut } from "firebase/auth";
import { auth, db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

interface UserProfileModalProps {
  visible: boolean;
  onClose: () => void;
  onSignOut: () => void;
}

export default function UserProfileModal({
  visible,
  onClose,
  onSignOut,
}: UserProfileModalProps) {
  const [username, setUsername] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUsername = async () => {
      if (!auth.currentUser) return;
      setLoading(true);
      try {
        const q = query(
          collection(db, "users"),
          where("uid", "==", auth.currentUser.uid)
        );
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
          setUsername(querySnapshot.docs[0].data().username);
        } else {
          setUsername(auth.currentUser.email || "");
        }
      } catch (e) {
        setUsername(auth.currentUser?.email || "");
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
            <Image
              source={require("../../assets/user-icon-white.png")}
              style={{ width: 90, height: 90 }}
              resizeMode="contain"
            />
          </View>
          <View style={styles.contentWrapper}>
            {loading ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Text style={styles.username}>{username}</Text>
            )}
          </View>
          <TouchableOpacity style={styles.signOutBtn} onPress={onSignOut}>
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "flex-start",
    alignItems: "flex-end",
    paddingTop: Platform.OS === "android" ? 0 : 17,
    paddingRight: 17,
  },
  modal: {
    width: 240,
    backgroundColor: "#ddd",
    borderRadius: 24,
    alignItems: "center",
    padding: 32,
    position: "relative",
  },
  closeBtn: {
    position: "absolute",
    top: 12,
    right: 16,
    zIndex: 10,
  },
  closeText: {
    fontSize: 28,
    color: "#888",
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 90,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  username: {
    fontSize: 26,
    color: "#222",
    fontWeight: "500",
  },
  contentWrapper: {
    height: 40, // fixed height, tweak as needed
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  signOutBtn: {
    backgroundColor: "#222",
    borderRadius: 20,
    paddingVertical: 12,
    paddingHorizontal: 40,
    marginTop: 8,
  },
  signOutText: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "bold",
  },
});
