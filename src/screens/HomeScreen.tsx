import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, FlatList, Image, TextInput, ActivityIndicator } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import axios from 'axios';
import NavBar from '../components/NavBar';
import { Movie, Genre, TMDB_API_KEY } from '../types/movie';
import { auth } from '../firebaseConfig';

type RootStackParamList = {
  Home: { genres: Genre[] };
  MovieDetails: { movie: Movie };
  Watchlist: undefined;
  WatchHistory: undefined;
};

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>;

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const { genres } = route.params;
  const [searchQuery, setSearchQuery] = useState('');
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const searchMovies = async () => {
      if (!searchQuery.trim()) {
        // If search is empty, fetch popular movies
        setLoading(true);
        try {
          const res = await axios.get(
            `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=1`
          );
          setMovies(res.data.results);
        } catch (err) {
          console.error('Error fetching popular movies:', err);
          setMovies([]);
        }
        setLoading(false);
        return;
      }

      const query = searchQuery.toLowerCase().trim();
      
      setLoading(true);
      try {
        // For very short queries (2-3 characters), fetch more results
        const pageCount = query.length <= 3 ? 3 : 1;
        let allResults: Movie[] = [];

        // Fetch multiple pages for short queries
        for (let page = 1; page <= pageCount; page++) {
          const res = await axios.get(
            `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(query)}&page=${page}`
          );
          allResults = [...allResults, ...res.data.results];
        }

        // Remove duplicates
        const uniqueResults = allResults.filter((movie, index, self) =>
          index === self.findIndex((m) => m.id === movie.id)
        );
        
        // Score and rank the results
        let searchResults = uniqueResults.map(movie => {
          let score = 0;
          const title = movie.title.toLowerCase();
          
          // Title match score with improved partial matching
          if (title.includes(query)) {
            // Higher score for matches at the start of the title
            if (title.startsWith(query)) {
              score += 5;
            } else {
              score += 3;
            }
            
            // Bonus for exact match
            if (title === query) {
              score += 2;
            }
            
            // Bonus for word boundary matches
            if (title.includes(` ${query}`) || title.includes(`${query} `)) {
              score += 1;
            }
          }
          
          // Genre match score
          const movieGenres = genres.filter(genre => 
            movie.genre_ids.includes(genre.id)
          );
          const genreMatches = movieGenres.filter(genre => 
            genre.name.toLowerCase().includes(query)
          );
          score += genreMatches.length;
          
          // Year match score
          if (movie.release_date.includes(query)) {
            score += 2;
          }
          
          return { ...movie, score };
        })
        .filter(movie => movie.score > 0) // Only keep movies with at least one match
        .sort((a, b) => b.score - a.score); // Sort by relevance score

        setMovies(searchResults);
      } catch (err) {
        console.error('Error searching movies:', err);
        setMovies([]);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, genres]);

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.posterContainer}
      onPress={() => navigation.navigate('MovieDetails', { movie: item })}
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NavBar />
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search movies..."
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Text style={styles.searchHint}>
          Search by title, genre, or year
        </Text>
      </View>
      {searchQuery.trim() ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>
            Search Results for "{searchQuery}"
          </Text>
          <Text style={styles.subtitle}>
            {movies.length} {movies.length === 1 ? 'movie' : 'movies'} found
          </Text>
        </View>
      ) : (
        <Text style={styles.title}>Popular Movies</Text>
      )}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={4}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#222',
    padding: 16,
    paddingTop: 32,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
  posterContainer: {
    flex: 1,
    margin: 8,
    alignItems: 'center',
  },
  poster: {
    width: 120,
    height: 180,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  grid: {
    paddingBottom: 32,
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: '#333',
    color: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchHint: {
    color: '#888',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 8,
  },
  resultsContainer: {
    marginBottom: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
}); 