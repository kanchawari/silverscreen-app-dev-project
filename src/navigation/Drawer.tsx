import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import HomeScreen from "../screens/HomeScreen";
import WatchHistoryScreen from "../screens/WatchHistoryScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import MovieDetailsScreen from "../screens/MovieDetailsScreen";
import MovieReviewScreen from "../screens/MovieReviewScreen";
import { Genre } from "../types/movie";
import type { RootStackParamList } from "./AppNavigator";

const Drawer = createDrawerNavigator<RootStackParamList>();

interface DrawerProps {
  genres: Genre[];
}

export default function AppDrawer({ genres }: DrawerProps) {
  return (
    <Drawer.Navigator
      screenOptions={{
        headerShown: false,
        drawerStyle: { backgroundColor: "#2d2d2d", width: 280 },
        drawerActiveTintColor: "#fff",
        drawerInactiveTintColor: "#fff",
        drawerLabelStyle: { fontSize: 18 },
      }}
      initialRouteName="Home"
    >
      <Drawer.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ genres }}
        options={{ title: "Home" }}
      />
      <Drawer.Screen
        name="Watchlist"
        component={WatchlistScreen}
        initialParams={{ genres }}
        options={{ title: "Watchlist" }}
      />
      <Drawer.Screen
        name="WatchHistory"
        component={WatchHistoryScreen}
        initialParams={{ genres }}
        options={{ title: "Watch History" }}
      />

      <Drawer.Screen
        name="Recommendation"
        component={RecommendationScreen}
        options={{ title: "Recommendation" }}
      />
    </Drawer.Navigator>
  );
}
