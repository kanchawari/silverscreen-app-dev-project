import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Movie, Genre } from '../types/movie';

// Import screens (we'll create these next)
import HomeScreen from '../screens/HomeScreen';
import MovieDetailsScreen from '../screens/MovieDetailsScreen';

export type RootStackParamList = {
  Home: undefined;
  MovieDetails: { movie: Movie; genres: Genre[] };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Home" 
          component={HomeScreen}
          options={{ title: 'Movies' }}
        />
        <Stack.Screen 
          name="MovieDetails" 
          component={MovieDetailsScreen}
          options={{ title: 'Movie Details' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}; 