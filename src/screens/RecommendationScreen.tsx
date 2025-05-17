import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import axios from "axios";
import { Genre, Movie, TMDB_API_KEY } from "../types/movie";
import NavBar from "../components/NavBar";

// Define navigation type
type RootStackParamList = {
  MovieDetails: { movie: Movie; genres: Genre[] };
};

export default function RecommendationScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const [genres, setGenres] = useState<Genre[]>([]);
  const [selectedGenre, setSelectedGenre] = useState<Genre | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Fetch genres from TMDB
    const fetchGenres = async () => {
      try {
        const res = await axios.get(
          `https://api.themoviedb.org/3/genre/movie/list?api_key=${TMDB_API_KEY}&language=en-US`
        );
        setGenres(res.data.genres);
      } catch (err) {
        setError("Failed to load genres");
      }
    };
    fetchGenres();
  }, []);

  const handleRandom = async () => {
    if (!selectedGenre) return;
    setLoading(true);
    setError("");
    try {
      // Fetch movies for the selected genre
      const res = await axios.get(
        `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${selectedGenre.id}&language=en-US&sort_by=popularity.desc&page=1`
      );
      const movies: Movie[] = res.data.results;
      if (movies.length === 0) {
        setError("No movies found for this genre.");
        setLoading(false);
        return;
      }
      // Pick a random movie
      const randomMovie = movies[Math.floor(Math.random() * movies.length)];
      navigation.navigate("MovieDetails", { movie: randomMovie, genres });
    } catch (err) {
      setError("Failed to fetch movie.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#151518" }}>
      <NavBar />
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>What are we feeling today?</Text>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <View style={styles.cloudsContainer}>
          {genres.map((genre) => (
            <TouchableOpacity
              key={genre.id}
              style={[
                styles.cloud,
                selectedGenre?.id === genre.id && styles.cloudSelected,
              ]}
              onPress={() => setSelectedGenre(genre)}
            >
              <Text
                key={genre.id}
                style={
                  selectedGenre?.id === genre.id
                    ? styles.cloudTextSelected
                    : styles.cloudText
                }
              >
                {genre.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={styles.randomBtn}
          onPress={handleRandom}
          disabled={!selectedGenre || loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.randomText}>Recommend a Movie</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    alignItems: "center",
    paddingVertical: 24,
    paddingHorizontal: 8,
  },
  title: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 30,
    marginTop: 48,
  },
  error: {
    color: "#ff6b6b",
    marginBottom: 12,
    fontSize: 16,
  },
  cloudsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 32,
    gap: 18,
  },
  cloud: {
    backgroundColor: "transparent",
    borderColor: "#d3d3d3",
    borderWidth: 3,
    borderRadius: 40,
    paddingHorizontal: 32,
    paddingVertical: 16,
    margin: 8,
    minWidth: 120,
    alignItems: "center",
    justifyContent: "center",
  },
  cloudSelected: {
    backgroundColor: "#d3d3d3",
    borderColor: "#fff",
  },
  cloudText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "500",
  },
  cloudTextSelected: {
    color: "#151518",
    fontSize: 24,
    fontWeight: "500",
  },
  randomBtn: {
    backgroundColor: "#a11a1a",
    borderRadius: 30,
    paddingVertical: 16,
    width: 320,
    height: 70,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 8,
  },
  randomText: {
    color: "#fff",
    fontSize: 24,
    fontWeight: "500",
  },
});
