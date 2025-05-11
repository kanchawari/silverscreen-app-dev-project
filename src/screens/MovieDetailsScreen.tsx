import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import axios from "axios";
import { theme } from "../theme/theme";
import NavBar from "../components/NavBar";
import { Movie, Genre, TMDB_API_KEY } from "../types/movie";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

type MovieDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "MovieDetails"
>;

export default function MovieDetailsScreen({
  navigation,
  route,
}: MovieDetailsScreenProps) {
  const { movie, genres } = route.params;

  console.log("Route params:", route.params);
  console.log("MovieDetails received movie:", movie);

  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [cast, setCast] = useState<string[]>([]);
  const [director, setDirector] = useState<string | null>(null);

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  // Mock reviews
  const reviews = [
    {
      id: "1",
      user: "Athena Jang",
      text: "The action scenes were NEXT LEVEL 😎 Marvel's bad kids understood the assignment 💣",
    },
    {
      id: "2",
      user: "John Smith",
      text: "Marvel finally went dark and it WORKED. This was crazy good.",
    },
  ];

  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        const watchlist: string[] = data.watchlist || [];
        const watchhistory: string[] = data.watchhistory || [];

        setIsInWatchlist(watchlist.includes(movie.id.toString()));
        setIsWatched(watchhistory.includes(movie.id.toString()));
      }
    };

    fetchUserData();
  }, []);

  const updateWatchlist = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const watchlist: string[] = data.watchlist || [];

    let newWatchlist;
    if (watchlist.includes(movie.id.toString())) {
      // Remove
      newWatchlist = watchlist.filter((id) => id !== movie.id.toString());
      setIsInWatchlist(false);
    } else {
      // Add
      newWatchlist = [...watchlist, movie.id.toString()];
      setIsInWatchlist(true);
    }

    await updateDoc(userRef, { watchlist: newWatchlist });
  };

  const updateWatchHistory = async () => {
    if (!auth.currentUser) return;
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userDoc = await getDoc(userRef);

    if (!userDoc.exists()) return;

    const data = userDoc.data();
    const watchhistory: string[] = data.watchhistory || [];

    let newWatchHistory;
    if (watchhistory.includes(movie.id.toString())) {
      // Remove
      newWatchHistory = watchhistory.filter((id) => id !== movie.id.toString());
      setIsWatched(false);
    } else {
      // Add
      newWatchHistory = [...watchhistory, movie.id.toString()];
      setIsWatched(true);
    }

    await updateDoc(userRef, { watchhistory: newWatchHistory });
  };

  useEffect(() => {
    const fetchDetailsAndCredits = async () => {
      try {
        const apiKey = TMDB_API_KEY;
        const movieId = movie.id;

        // Fetch movie details and credits in parallel
        const [detailsRes, creditsRes] = await Promise.all([
          axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
          ),
          axios.get(
            `https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=${TMDB_API_KEY}&language=en-US`
          ),
        ]);

        const detailsData = detailsRes.data;
        const creditsData = creditsRes.data;

        setMovieDetails(detailsData);

        // Top 5 cast
        const topCast =
          creditsData.cast?.slice(0, 5).map((member: any) => member.name) || [];
        setCast(topCast);

        // Find the director from the crew
        const director = creditsData.crew?.find(
          (person: any) => person.job === "Director"
        );
        setDirector(director?.name || null);
      } catch (error) {
        console.error("Error fetching movie data:", error);
      }
    };

    fetchDetailsAndCredits();
  }, []);

  const getGenreNames = (movie: any): string[] => {
    if (movie.genre_ids && Array.isArray(movie.genre_ids)) {
      return movie.genre_ids
        .map(
          (id: number) => genres.find((genre: Genre) => genre.id === id)?.name
        )
        .filter(
          (name: string | undefined): name is string => name !== undefined
        );
    }

    if (movie.genres && Array.isArray(movie.genres)) {
      return movie.genres
        .map((genre: { id: number; name: string }) => genre.name)
        .filter(
          (name: string | undefined): name is string => name !== undefined
        );
    }

    return [];
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "";
    const [year, month, day] = dateStr.split("-");
    return `${day}/${month}/${year}`;
  };

  return (
    <ScrollView style={styles.detailsRoot} showsVerticalScrollIndicator={false}>
      <NavBar />
      <View style={styles.detailsRow}>
        <Image
          source={{
            uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
          }}
          style={styles.detailsPoster}
        />
        <View style={styles.detailsCol}>
          <Text style={styles.detailsTitle}>
            {movie.title} ({movie.release_date?.slice(0, 4)})
          </Text>
          <Text style={styles.detailsGenres}>
            {getGenreNames(movie).join(" | ")}
          </Text>
          <Text style={styles.detailsInfo}>
            Release Date: {formatDate(movie.release_date)}
          </Text>
          <Text style={styles.detailsInfo}>
            Duration:{" "}
            {movieDetails?.runtime
              ? `${movieDetails.runtime} minutes`
              : "Loading..."}
          </Text>
          <Text style={styles.detailsInfo}>
            Director: {director || "Loading..."}
          </Text>
          <Text style={styles.detailsInfo}>
            Cast: {cast.length > 0 ? cast.join(", ") : "Loading..."}
          </Text>
          <Text style={styles.detailsOverviewTitle}>Overview</Text>
          <Text style={styles.detailsOverview}>{movie.overview}</Text>
          <View style={styles.detailsButtonRow}>
            <TouchableOpacity
              style={
                isInWatchlist
                  ? styles.detailsActionBtnBlack
                  : styles.detailsActionBtn
              }
              onPress={updateWatchlist}
            >
              <Text style={styles.detailsActionBtnText}>
                {isInWatchlist
                  ? "- Remove from Watchlist"
                  : "+ Add to Watchlist"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={
                isWatched
                  ? styles.detailsActionBtnBlack
                  : styles.detailsActionBtn
              }
              onPress={updateWatchHistory}
            >
              <Text style={styles.detailsActionBtnText}>
                {isWatched ? "- Unmark as Watched" : "+ Mark as Watched"}
              </Text>
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
}

const styles = StyleSheet.create({
  detailsRoot: {
    flex: 1,
    backgroundColor: "#151518",
    /*padding: 16,
    paddingTop: 32,*/
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 16,
    marginTop: 40,
    marginHorizontal: 120,
  },
  detailsPoster: {
    width: 280,
    height: 420,
    /*borderRadius: 8,*/
    marginRight: 24,
  },
  detailsCol: {
    flex: 1,
    justifyContent: "flex-start",
  },
  detailsTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 4,
  },
  detailsGenres: {
    color: "#fff",
    fontSize: 16,
    marginBottom: 8,
  },
  detailsInfo: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 8,
  },
  detailsOverviewTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 8,
    marginBottom: 2,
  },
  detailsOverview: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 16,
  },
  detailsButtonRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 8,
  },
  detailsActionBtn: {
    backgroundColor: "#a11a1a",
    borderRadius: 4,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginRight: 16,
    minWidth: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsActionBtnBlack: {
    backgroundColor: "#3F3F3F",
    borderRadius: 4,
    paddingHorizontal: 32,
    paddingVertical: 12,
    marginRight: 16,
    minWidth: 300,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsActionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  reviewBubble: {
    backgroundColor: "#888",
    borderRadius: 30,
    padding: 16,
    marginBottom: 16,
    marginTop: 8,
  },
  reviewUser: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 2,
  },
  reviewText: {
    color: "#fff",
    fontSize: 15,
  },
  writeReviewBtn: {
    backgroundColor: "#888",
    borderRadius: 30,
    alignSelf: "center",
    paddingHorizontal: 48,
    paddingVertical: 12,
    marginTop: 16,
    marginBottom: 32,
  },
  writeReviewText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },
});
