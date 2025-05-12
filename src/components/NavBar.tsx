import React, { useState } from "react";
import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation, StackActions } from "@react-navigation/native";
import type { NavigationProp } from "@react-navigation/native";
import UserProfileModal from "./UserProfileModal";
import { signOut } from "firebase/auth";
import { auth } from "../firebaseConfig";

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
    navigation.dispatch(StackActions.replace("Login"));
  };

  return (
    <LinearGradient
      colors={["#8C0101", "#20007B"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={styles.gradient}
    >
      <View style={styles.container}>
        <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.logoContainer} // Add this
        >
          <Image
            source={require("../../assets/silverscreen-logo.png")}
            style={styles.logo}
            resizeMode="contain"
          />
          <Text style={styles.logoText}>SILVERSCREEN</Text>
        </TouchableOpacity>

        <View style={styles.linksWrapper}>
          <TouchableOpacity onPress={() => navigation.navigate("WatchHistory")}>
            <Text style={styles.link}>Watch History</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate("Watchlist")}>
            <Text style={styles.link}>Watchlist</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => navigation.navigate("Recommendation")}
          >
            <Text style={styles.link}>Recommendation</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.userIconBtn}
            onPress={() => setModalVisible(true)}
          >
            <Image
              source={require("../../assets/user-icon-white.png")}
              style={{ width: 40, height: 40 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
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
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 16,
  },
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 54,
    height: 54,
  },
  logoText: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
    marginLeft: 14, // spacing between logo and text
  },
  linksWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    flex: 1,
    gap: 12,
    marginRight: 8,
  },
  link: {
    color: "#fff",
    fontSize: 18,
    marginHorizontal: 16,
    fontWeight: "bold",
  },
  userIconBtn: {
    marginLeft: 16,
  },
  userIcon: {
    fontSize: 32,
    color: "#fff",
  },
});
