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
  Platform,
} from "react-native";
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import axios from "axios";
import NavBar from "../components/NavBar";
import { Movie, Genre, TMDB_API_KEY } from "../types/movie";
import nsfwKeywords from "../nsfwKeywords";
import { auth } from "../firebaseConfig";
import { DrawerActions } from "@react-navigation/native";

type HomeScreenProps = NativeStackScreenProps<RootStackParamList, "Home">;

export default function HomeScreen({ navigation, route }: HomeScreenProps) {
  const { genres } = route.params;
  const [searchQuery, setSearchQuery] = useState("");
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [numColumns, setNumColumns] = useState(
    Platform.OS === "android" ? 2 : 5
  );

  useEffect(() => {
    const searchMovies = async () => {
      const query = searchQuery.toLowerCase().trim();
      const isYear = /^\d{4}$/.test(query);
      const matchedGenre = genres.find(
        (genre) => genre.name.toLowerCase() === query
      );

      setLoading(true);

      try {
        if (!query) {
          const totalPages = 12;
          let allMovies: Movie[] = [];

          for (let page = 1; page <= totalPages; page++) {
            const res = await axios.get(
              `https://api.themoviedb.org/3/movie/popular?api_key=${TMDB_API_KEY}&language=en-US&page=${page}`
            );
            allMovies = [...allMovies, ...res.data.results];
          }

          const uniqueMovies = allMovies.filter(
            (movie, index, self) =>
              index === self.findIndex((m) => m.id === movie.id)
          );
          setMovies(uniqueMovies);
        } else if (isYear || matchedGenre) {
          const pageCount = 6;
          let filteredMovies: Movie[] = [];
          let titleSearchMovies: Movie[] = [];

          // Fetch discover by year or genre
          for (let page = 1; page <= pageCount; page++) {
            const url = isYear
              ? `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&primary_release_year=${query}&page=${page}&include_adult=false`
              : `https://api.themoviedb.org/3/discover/movie?api_key=${TMDB_API_KEY}&language=en-US&with_genres=${matchedGenre?.id}&page=${page}&include_adult=false`;

            const res = await axios.get(url);
            filteredMovies = [...filteredMovies, ...res.data.results];
          }

          // Fetch title search results
          for (let page = 1; page <= pageCount; page++) {
            const res = await axios.get(
              `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
                query
              )}&page=${page}&include_adult=false`
            );
            titleSearchMovies = [...titleSearchMovies, ...res.data.results];
          }

          // Combine both results and dedupe by id
          const combined = [...filteredMovies, ...titleSearchMovies];
          const uniqueCombined = combined.filter(
            (movie, index, self) =>
              index === self.findIndex((m) => m.id === movie.id)
          );

          // Filter out movies with no poster/overview and NSFW content
          const finalResults = uniqueCombined.filter((movie) => {
            const title = movie.title.toLowerCase();
            const overview = movie.overview?.toLowerCase() || "";
            const isNSFW = nsfwKeywords.some(
              (word) => title.includes(word) || overview.includes(word)
            );
            return !isNSFW && movie.poster_path && movie.overview?.trim();
          });

          setMovies(finalResults.sort((a, b) => b.popularity - a.popularity));
        } else {
          // Normal text search on titles
          const pageCount = query.length <= 3 ? 8 : 6;
          let allResults: Movie[] = [];

          for (let page = 1; page <= pageCount; page++) {
            const res = await axios.get(
              `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&language=en-US&query=${encodeURIComponent(
                query
              )}&page=${page}&include_adult=false`
            );
            allResults = [...allResults, ...res.data.results];
          }

          const uniqueResults = allResults.filter(
            (movie, index, self) =>
              index === self.findIndex((m) => m.id === movie.id)
          );

          // Filter out NSFW and missing poster/overview
          const filteredResults = uniqueResults.filter((movie) => {
            const title = movie.title.toLowerCase();
            const overview = movie.overview?.toLowerCase() || "";
            const isNSFW = nsfwKeywords.some(
              (word) => title.includes(word) || overview.includes(word)
            );
            return !isNSFW && movie.poster_path && movie.overview?.trim();
          });

          setMovies(
            filteredResults.sort((a, b) => b.popularity - a.popularity)
          );
        }
      } catch (err) {
        console.error("Error searching movies:", err);
        setMovies([]);
      }
      setLoading(false);
    };

    const debounceTimer = setTimeout(searchMovies, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, genres]);

  // Dynamic number of columns
  useEffect(() => {
    if (Platform.OS === "android") {
      setNumColumns(2);
      return;
    }
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

  // Responsive poster size for Android
  const posterMargin = 28;
  const posterWidth =
    Platform.OS === "android"
      ? (Dimensions.get("window").width - posterMargin * 3) / 2
      : 240;
  const posterHeight = Platform.OS === "android" ? posterWidth * 1.5 : 360;

  const renderItem = ({ item }: { item: Movie }) => (
    <TouchableOpacity
      style={
        Platform.OS === "android"
          ? [
              styles.posterContainerAndroid,
              {
                marginHorizontal: posterMargin / 2,
                marginBottom: posterMargin,
              },
            ]
          : styles.posterContainer
      }
      onPress={() =>
        navigation.navigate("MovieDetails", { movie: item, genres })
      }
    >
      <Image
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={
          Platform.OS === "android"
            ? [
                {
                  width: posterWidth,
                  height: posterHeight,
                  borderRadius: 0,
                  backgroundColor: "#ccc",
                },
              ]
            : styles.poster
        }
        resizeMode="cover"
      />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {Platform.OS === "web" && <NavBar />}
      {Platform.OS === "android" && (
        <NavBar
          showMenu
          onMenuPress={() => navigation.dispatch(DrawerActions.openDrawer())}
        />
      )}
      <View
        style={
          Platform.OS === "android"
            ? styles.searchContainerAndroid
            : styles.searchContainer
        }
      >
        <TextInput
          style={
            Platform.OS === "android"
              ? styles.searchInputAndroid
              : styles.searchInput
          }
          placeholder="Search Here"
          placeholderTextColor="#888"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {Platform.OS !== "android" && (
          <Text style={styles.searchHint}>Search by title, genre, or year</Text>
        )}
      </View>
      {searchQuery.trim() ? (
        <View style={styles.resultsContainer}>
          <Text style={styles.title}>
            {movies.length} search {movies.length === 1 ? "result" : "results"}{" "}
            for "{searchQuery}"
          </Text>
        </View>
      ) : (
        <Text style={styles.title}>Featured Movies</Text>
      )}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
      ) : (
        <FlatList
          key={numColumns}
          data={movies}
          keyExtractor={(item) => item.id.toString()}
          numColumns={numColumns}
          renderItem={renderItem}
          contentContainerStyle={
            Platform.OS === "android"
              ? { paddingHorizontal: posterMargin / 2, paddingBottom: 32 }
              : styles.grid
          }
          style={Platform.OS === "android" ? { flex: 1 } : styles.flatList}
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
  popularityText: {
    // For debugging
    fontSize: 14, // Adjust the size as needed
    color: "#ffffff", // Choose a color that contrasts well with your background
    position: "absolute", // Position it over or under the poster
    bottom: 10, // Adjust this based on where you want it
    left: 10, // Adjust this
  },
  posterContainerAndroid: {
    flex: 1,
    alignItems: "center",
  },
  searchContainerAndroid: {
    marginTop: 24,
    marginBottom: 16,
    marginHorizontal: 0,
    alignItems: "center",
    justifyContent: "center",
  },
  searchInputAndroid: {
    backgroundColor: "#444",
    color: "#fff",
    padding: 12,
    borderRadius: 16,
    marginBottom: 0,
    width: Dimensions.get("window").width - 48,
    fontSize: 16,
    textAlign: "center",
  },
});
