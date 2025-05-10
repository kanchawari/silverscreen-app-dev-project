import React from 'react';
import { View, Text, StyleSheet, ScrollView, Image, TouchableOpacity } from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../navigation/AppNavigator';
import { theme } from '../theme/theme';
import NavBar from '../components/NavBar';
import { Movie, Genre } from '../types/movie';

type Props = NativeStackScreenProps<RootStackParamList, 'MovieDetails'>;

const MovieDetailsScreen: React.FC<Props> = ({ route }) => {
  const { movie, genres } = route.params;

  // Mock reviews
  const reviews = [
    {
      id: '1',
      user: 'Athena Jang',
      text: "The action scenes were NEXT LEVEL 😎 Marvel's bad kids understood the assignment 💣",
    },
    {
      id: '2',
      user: 'John Smith',
      text: 'Marvel finally went dark and it WORKED. This was crazy good.',
    },
  ];

  const getGenreNames = (genreIds: number[]): string[] => {
    return genreIds
      .map(id => genres.find((genre: Genre) => genre.id === id)?.name)
      .filter((name): name is string => name !== undefined);
  };

  return (
    <ScrollView style={styles.detailsRoot}>
      <NavBar />
      <View style={styles.detailsRow}>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.detailsPoster}
        />
        <View style={styles.detailsCol}>
          <Text style={styles.detailsTitle}>
            {movie.title} ({movie.release_date?.slice(0, 4)})
          </Text>
          <Text style={styles.detailsGenres}>
            {getGenreNames(movie.genre_ids).join(' | ')}
          </Text>
          <Text style={styles.detailsInfo}>
            Release Date: {movie.release_date}
          </Text>
          <Text style={styles.detailsOverviewTitle}>Overview</Text>
          <Text style={styles.detailsOverview}>{movie.overview}</Text>
          <View style={styles.detailsButtonRow}>
            <TouchableOpacity style={styles.detailsActionBtn}>
              <Text style={styles.detailsActionBtnText}>+ watchlist</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.detailsActionBtn}>
              <Text style={styles.detailsActionBtnText}>+ mark as watched</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
      {/* Reviews */}
      {reviews.map((item) => (
        <View key={item.id} style={styles.reviewBubble}>
          <Text style={styles.reviewUser}>{item.user}</Text>
          <Text style={styles.reviewText}>{item.text}</Text>
        </View>
      ))}
      {/* Write Review Button */}
      <TouchableOpacity style={styles.writeReviewBtn}>
        <Text style={styles.writeReviewText}>Write Review</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
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

export default MovieDetailsScreen; 