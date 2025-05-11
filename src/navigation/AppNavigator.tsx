import React, { useEffect, useState } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ActivityIndicator, View } from "react-native";
import axios from "axios";

import HomeScreen from "../screens/HomeScreen";
import MovieDetailsScreen from "../screens/MovieDetailsScreen";
import WatchlistScreen from "../screens/WatchlistScreen";
import WatchHistoryScreen from "../screens/WatchHistoryScreen";
import LoginScreen from "../screens/LoginScreen";
import SignUpScreen from "../screens/SignUpScreen";
import RecommendationScreen from "../screens/RecommendationScreen";
import { Genre, Movie, TMDB_API_KEY } from "../types/movie";

export type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: { genres: Genre[] };
  MovieDetails: { movie: Movie; genres: Genre[] };
  Watchlist: { genres: Genre[] };
  WatchHistory: { genres: Genre[] };
  Recommendation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
        );
        setGenres(res.data.genres);
      } catch (err) {
        console.error("Failed to load genres", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          backgroundColor: "#151518",
        }}
      >
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
      initialRouteName="Home"
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUp" component={SignUpScreen} />
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        initialParams={{ genres }}
      />
      <Stack.Screen name="MovieDetails" component={MovieDetailsScreen} />
      <Stack.Screen
        name="Watchlist"
        component={WatchlistScreen}
        initialParams={{ genres }}
      />
      <Stack.Screen
        name="WatchHistory"
        component={WatchHistoryScreen}
        initialParams={{ genres }}
      />
      <Stack.Screen name="Recommendation" component={RecommendationScreen} />
    </Stack.Navigator>
  );
}
