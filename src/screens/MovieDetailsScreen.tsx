import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
import StarRating from "react-native-star-rating-widget";
import { formatDistanceToNow } from "date-fns";
import { NativeStackScreenProps } from "@react-navigation/native-stack";
import { RootStackParamList } from "../navigation/AppNavigator";
import axios from "axios";
import { theme } from "../theme/theme";
import NavBar from "../components/NavBar";
import { Movie, Genre, TMDB_API_KEY } from "../types/movie";
import {
  doc,
  getDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  collection,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import styles from "../styles/MovieDetailsStyles";

type MovieDetailsScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "MovieDetails"
>;

export default function MovieDetailsScreen({
  navigation,
  route,
}: MovieDetailsScreenProps) {
  const { movie, genres } = route.params;

  const [movieDetails, setMovieDetails] = useState<any>(null);
  const [cast, setCast] = useState<string[]>([]);
  const [director, setDirector] = useState<string | null>(null);

  const [isInWatchlist, setIsInWatchlist] = useState(false);
  const [isWatched, setIsWatched] = useState(false);

  const [watchlistLoading, setWatchlistLoading] = useState(true);
  const [watchedLoading, setWatchedLoading] = useState(true);

  const [reviews, setReviews] = useState<any[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);

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
      setWatchlistLoading(false);
      setWatchedLoading(false);
    };

    fetchUserData();
  }, []);

  const fetchReviews = async () => {
    try {
      const reviewsRef = collection(
        db,
        "movies",
        movie.id.toString(),
        "reviews"
      );

      const querySnapshot = await getDocs(reviewsRef);

      const fetchedReviews: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedReviews.push({ id: doc.id, ...doc.data() });
      });

      console.log("Movie ID: ", movie.id);
      console.log("Number of reviews found: ", querySnapshot.size);
      console.log("Fetched reviews:", fetchedReviews);
      setReviews(fetchedReviews);
      console.log("Number of reviews:", reviews.length);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoadingReviews(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchReviews();
    }, [movie.id])
  );

  const updateWatchlist = async () => {
    try {
      setWatchlistLoading(true);

      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const data = userDoc.data();
      const watchlist: string[] = data.watchlist || [];

      let newWatchlist;
      let newState: boolean;
      if (watchlist.includes(movie.id.toString())) {
        // Remove
        newWatchlist = watchlist.filter((id) => id !== movie.id.toString());
        newState = false;
      } else {
        // Add
        newWatchlist = [...watchlist, movie.id.toString()];
        newState = true;
      }

      await updateDoc(userRef, { watchlist: newWatchlist });
      setIsInWatchlist(newState);
    } catch (error) {
      console.error("Error updating watchlist:", error);
    } finally {
      setWatchlistLoading(false);
    }
  };

  const updateWatchHistory = async () => {
    try {
      setWatchedLoading(true);
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userDoc = await getDoc(userRef);

      if (!userDoc.exists()) return;

      const data = userDoc.data();
      const watchhistory: string[] = data.watchhistory || [];

      let newWatchHistory;
      let newState: boolean;
      if (watchhistory.includes(movie.id.toString())) {
        // Remove
        newWatchHistory = watchhistory.filter(
          (id) => id !== movie.id.toString()
        );
        newState = false;
      } else {
        // Add
        newWatchHistory = [...watchhistory, movie.id.toString()];
        newState = true;
      }

      await updateDoc(userRef, { watchhistory: newWatchHistory });
      setIsWatched(newState);
    } catch (error) {
      console.error("Error updating watch history:", error);
    } finally {
      setWatchedLoading(false);
    }
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

  const formatReviewDate = (date: Date) => {
    return formatDistanceToNow(date, { addSuffix: true }); // Adds "ago"
  };

  return (
    <View style={styles.detailsRoot}>
      <NavBar />
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Image
          source={require("../../assets/back-button.png")}
          style={{ width: 32, height: 32 }}
          resizeMode="contain"
        />
      </TouchableOpacity>
      <ScrollView
        style={styles.detailsRoot}
        showsVerticalScrollIndicator={false}
      >
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
                disabled={watchlistLoading}
              >
                {watchlistLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.detailsActionBtnText}>
                    {isInWatchlist
                      ? "- Remove from Watchlist"
                      : "+ Add to Watchlist"}
                  </Text>
                )}
              </TouchableOpacity>

              <TouchableOpacity
                style={
                  isWatched
                    ? styles.detailsActionBtnBlack
                    : styles.detailsActionBtn
                }
                onPress={updateWatchHistory}
                disabled={watchedLoading}
              >
                {watchedLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text style={styles.detailsActionBtnText}>
                    {isWatched ? "- Unmark as Watched" : "+ Mark as Watched"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.writeReviewBtn}
              onPress={() => navigation.navigate("MovieReview", { movie })}
            >
              <Text style={styles.writeReviewText}>Write Review</Text>
            </TouchableOpacity>
          </View>
        </View>
        {/* Reviews */}
        <Text style={styles.userReviewText}>User Reviews</Text>
        {loadingReviews ? (
          <ActivityIndicator
            size="large"
            color="#999"
            style={{ marginTop: 24 }}
          />
        ) : reviews.length === 0 ? (
          <Text
            style={{
              textAlign: "center",
              color: "white",
              fontSize: 20,
              fontWeight: "bold",
              marginTop: 28,
            }}
          >
            No reviews yet. Be the first to write one!
          </Text>
        ) : (
          reviews.map((item) => (
            <View key={item.id} style={styles.reviewBubble}>
              <View style={styles.reviewHeaderRow1}>
                <Image
                  source={require("../../assets/user-icon-white.png")}
                  style={styles.userIcon}
                />
                <Text style={styles.reviewUser}>{item.username}</Text>
              </View>

              <View style={styles.reviewHeaderRow2}>
                <StarRating
                  rating={item.rating}
                  starSize={18}
                  starStyle={{ marginHorizontal: 1 }}
                  onChange={() => {}}
                  enableSwiping={false}
                  animationConfig={{
                    scale: 1,
                    easing: () => 0,
                    duration: 0,
                  }}
                />
                <Text style={styles.reviewDate}>
                  {formatReviewDate(item.timestamp.toDate())}
                </Text>
              </View>

              <Text style={styles.reviewText}>{item.reviewText}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}
