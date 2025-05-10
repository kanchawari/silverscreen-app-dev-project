import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import NavBar from './src/components/NavBar';
import WatchlistScreen from './src/screens/WatchlistScreen';
import WatchHistoryScreen from './src/screens/WatchHistoryScreen';
import HomeScreen from './src/screens/HomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import { Movie, Genre, TMDB_API_KEY } from './src/types/movie';
import RecommendationScreen from './src/screens/RecommendationScreen';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';

type RootStackParamList = {
  Login: undefined;
  SignUp: undefined;
  Home: { genres: Genre[] };
  MovieDetails: { movie: Movie; genres: Genre[] };
  Watchlist: undefined;
  WatchHistory: undefined;
  Recommendation: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const genresRes = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
        );
        setGenres(genresRes.data.genres);
      } catch (err) {
        console.error('Error fetching genres:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchGenres();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Login">
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="SignUp" component={SignUpScreen} />
        <Stack.Screen 
          name="Home" 
          component={HomeScreen} 
          initialParams={{ genres }}
        />
        <Stack.Screen 
          name="MovieDetails" 
          component={MovieDetailsScreen}
          initialParams={{ genres }}
        />
        <Stack.Screen name="Watchlist" component={WatchlistScreen} />
        <Stack.Screen name="WatchHistory" component={WatchHistoryScreen} />
        <Stack.Screen name="Recommendation" component={RecommendationScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#222',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Details styles
  detailsRoot: {
    flex: 1,
    backgroundColor: '#222',
    padding: 16,
    paddingTop: 32,
  },
  detailsRow: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  detailsPoster: {
    width: 180,
    height: 260,
    borderRadius: 8,
    marginRight: 24,
  },
  detailsCol: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  detailsTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 28,
    marginBottom: 4,
  },
  detailsGenres: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  detailsInfo: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 8,
  },
  detailsOverviewTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    marginTop: 8,
    marginBottom: 2,
  },
  detailsOverview: {
    color: '#fff',
    fontSize: 15,
    marginBottom: 16,
  },
  detailsButtonRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
  },
  detailsActionBtn: {
    backgroundColor: '#a11a1a',
    borderRadius: 4,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginRight: 16,
  },
  detailsActionBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
  },
  reviewBubble: {
    backgroundColor: '#888',
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  reviewUser: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  reviewText: {
    color: '#fff',
    fontSize: 15,
  },
  writeReviewBtn: {
    backgroundColor: '#888',
    borderRadius: 30,
    alignSelf: 'center',
    paddingHorizontal: 48,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  writeReviewText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 22,
  },
});
