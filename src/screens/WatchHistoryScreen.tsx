import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
  TextInput,
  ActivityIndicator,
  Dimensions,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import axios from "axios";
import NavBar from "../components/NavBar";
import { Movie, Genre, TMDB_API_KEY } from "../types/movie";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

type WatchHistoryScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "WatchHistory"
>;

export default function WatchHistoryScreen({
  navigation,
  route,
}: WatchHistoryScreenProps) {
  const { genres } = route.params;
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [numColumns, setNumColumns] = useState(5);

  useEffect(() => {
    const fetchWatchHistoryMovies = async () => {
      if (!auth.currentUser) return;

      setLoading(true);
      try {
        const userRef = doc(db, "users", auth.currentUser.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const { watchhistory } = userDoc.data();
          if (Array.isArray(watchhistory) && watchhistory.length > 0) {
            const moviePromises = watchhistory.map((id: number) =>
              axios.get(`https://api.themoviedb.org/3/movie/${id}`, {
                params: { api_key: TMDB_API_KEY },
              })
            );

            const responses = await Promise.all(moviePromises);
            const moviesData = responses.map((res) => res.data);
            setMovies(moviesData);
          } else {
            setMovies([]);
          }
        }
      } catch (err) {
        console.error("Failed to fetch watch history", err);
      } finally {
        setLoading(false);
      }
    };

    fetchWatchHistoryMovies();
  }, []);

  // Dynamic number of columns
  useEffect(() => {
    const updateNumColumns = () => {
      const screenWidth = Dimensions.get("window").width;
      const itemWidth = 300; // adjust based on your item size
      const columns = Math.floor(screenWidth / itemWidth);
      setNumColumns(columns > 0 ? columns : 1);
    };

    updateNumColumns(); // initial

    const subscription = Dimensions.addEventListener(
      "change",
      updateNumColumns
    );

    return () => {
      subscription.remove();
    };
  }, []);

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={styles.posterContainer}
      onPress={() =>
        navigation.navigate("MovieDetails", { movie: item, genres })
      }
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={styles.poster}
        resizeMode="cover"
      />
      {/*<Text style={styles.popularityText}>Popularity: {item.popularity}</Text>*/}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <NavBar />
      <Text style={styles.title}>Watch History</Text>

      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : movies.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No watch history yet.</Text>
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          renderItem={renderItem}
          contentContainerStyle={styles.grid}
          style={styles.flatList}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#151518",
    /*padding: 16,
    paddingTop: 32,*/
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    marginBottom: 16,
    textAlign: "center",
  },
  posterContainer: {
    /*flex: 1,*/
    /*margin: 20,*/
    marginHorizontal: 20,
    marginBottom: 20,
    alignItems: "center",
  },
  poster: {
    width: 240,
    height: 360,
    /*borderRadius: 4,*/
    backgroundColor: "#ccc",
  },
  flatList: {
    alignSelf: "center",
  },
  grid: {
    paddingBottom: 32,
  },
  searchContainer: {
    marginTop: 24,
    marginBottom: 1,
    marginHorizontal: 144,
  },
  searchInput: {
    backgroundColor: "#333",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  searchHint: {
    color: "#888",
    fontSize: 12,
    textAlign: "center",
    marginBottom: 8,
  },
  resultsContainer: {
    marginBottom: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyContainer: { flex: 1, justifyContent: "center", alignItems: "center" },
  emptyText: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  popularityText: {
    // For debugging
    fontSize: 14, // Adjust the size as needed
    color: "#ffffff", // Choose a color that contrasts well with your background
    position: "absolute", // Position it over or under the poster
    bottom: 10, // Adjust this based on where you want it
    left: 10, // Adjust this based on where you want it
  },
});
