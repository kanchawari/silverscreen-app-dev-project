import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Dimensions,
} from "react-native";
import { useFocusEffect, DrawerActions } from "@react-navigation/native";
import { useCallback } from "react";
import StarRating from "react-native-star-rating-widget";
import Toast from "react-native-toast-message";
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
  deleteDoc,
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

  const [deletingReviewId, setDeletingReviewId] = useState<string | null>(null);

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

      const sortedReviews = fetchedReviews.sort((a, b) => {
        const currentUser = auth.currentUser?.uid;

        const aIsUser = a.userId === currentUser ? 0 : 1;
        const bIsUser = b.userId === currentUser ? 0 : 1;

        if (aIsUser !== bIsUser) {
          return aIsUser - bIsUser;
        }

        const aTime = a.timestamp?.toDate?.() || new Date(0);
        const bTime = b.timestamp?.toDate?.() || new Date(0);
        return bTime.getTime() - aTime.getTime();
      });

      setReviews(sortedReviews);
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

  const deleteReview = async (
    reviewId: string,
    movieId: number,
    reviewText: string
  ) => {
    const userId = auth.currentUser?.uid;
    if (!userId) return;

    try {
      setDeletingReviewId(reviewId);

      const reviewRef = doc(db, "movies", String(movieId), "reviews", reviewId);
      await deleteDoc(reviewRef);

      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const reviews = userSnap.data().reviews || [];

        const updatedReviews = reviews.filter(
          (rev: any) =>
            !(
              String(rev.movieId) === String(movieId) &&
              rev.reviewText === reviewText
            )
        );

        await updateDoc(userRef, { reviews: updatedReviews });
      }

      fetchReviews();

      Toast.show({
        type: "success",
        text1: "Review deleted",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.error("Error deleting review:", error);
      Toast.show({
        type: "error",
        text1: "Error deleting review",
      });
    } finally {
      setDeletingReviewId(null);
    }
  };

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
    return formatDistanceToNow(date, { addSuffix: true });
  };

  if (Platform.OS === "android") {
    const screenWidth = Dimensions.get("window").width;
    const posterWidth = screenWidth - 100;
    const posterHeight = posterWidth * 1.5;
    return (
      <View style={{ flex: 1, backgroundColor: "#151518" }}>
        <NavBar showMenu onMenuPress={() => navigation.goBack()} />
        <Toast />
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            marginLeft: 8,
          }}
        >
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={{ paddingHorizontal: 8, paddingVertical: 8, marginLeft: 12 }}
          >
            <Image
              source={require("../../assets/back-button.png")}
              style={{ width: 32, height: 32 }}
              resizeMode="contain"
            />
          </TouchableOpacity>
        </View>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={{ alignItems: "center", marginTop: 16 }}>
            <Image
              source={{
                uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
              }}
              style={{
                width: posterWidth,
                height: posterHeight,
                borderRadius: 0,
                marginBottom: 16,
              }}
              resizeMode="cover"
            />
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 24,
                textAlign: "center",
                marginBottom: 4,
              }}
            >
              {movie.title}
              <Text style={{ fontWeight: "normal" }}>
                {" "}
                ({movie.release_date?.slice(0, 4)})
              </Text>
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 16,
                textAlign: "center",
                marginBottom: 16,
              }}
            >
              {getGenreNames(movie).join(" | ")}
            </Text>
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  alignSelf: "flex-start",

                  marginBottom: 2,
                }}
              >
                Duration:{" "}
                {movieDetails?.runtime
                  ? `${movieDetails.runtime} minutes`
                  : "Loading..."}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  alignSelf: "flex-start",

                  marginBottom: 2,
                }}
              >
                Release Date: {formatDate(movie.release_date)}
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 15,
                  alignSelf: "flex-start",

                  marginBottom: 2,
                }}
              >
                Director: {director || "Loading..."}
              </Text>
            </View>
            <Text
              style={{
                color: "#fff",
                fontWeight: "bold",
                fontSize: 18,
                marginTop: 10,
                marginBottom: 2,
                alignSelf: "flex-start",
                marginLeft: 20,
              }}
            >
              Overview
            </Text>
            <Text
              style={{
                color: "#fff",
                fontSize: 15,
                marginBottom: 16,
                alignSelf: "flex-start",
                marginLeft: 24,
                marginRight: 24,
              }}
            >
              {movie.overview}
            </Text>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "center",
                gap: 12,
                marginBottom: 16,
              }}
            >
              <TouchableOpacity
                style={{
                  backgroundColor: isInWatchlist ? "#3F3F3F" : "#a11a1a",
                  borderRadius: 0,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  width: 130,
                  alignItems: "center",
                  marginRight: 8,
                }}
                onPress={updateWatchlist}
                disabled={watchlistLoading}
              >
                {watchlistLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                  >
                    {isInWatchlist ? "- Watchlist" : "+ Watchlist"}
                  </Text>
                )}
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: isWatched ? "#3F3F3F" : "#a11a1a",
                  borderRadius: 0,
                  paddingHorizontal: 12,
                  paddingVertical: 12,
                  width: 200,
                  alignItems: "center",
                }}
                onPress={updateWatchHistory}
                disabled={watchedLoading}
              >
                {watchedLoading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                  >
                    {isWatched ? "- Unmark as Watched" : "+ Mark as Watched"}
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={{
                backgroundColor: "#5F5F5F",
                borderRadius: 24,
                paddingHorizontal: 40,
                paddingVertical: 12,
                alignSelf: "center",
                marginTop: 0,
                marginBottom: 8,
              }}
              onPress={() => navigation.navigate("MovieReview", { movie })}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 18 }}>
                Write Review
              </Text>
            </TouchableOpacity>
          </View>
          <Text
            style={{
              color: "#ccc",
              fontWeight: "400",
              fontSize: 17,
              textAlign: "center",
              marginTop: 12,
              marginBottom: 8,
            }}
          >
            User Reviews
          </Text>
          {loadingReviews ? (
            <ActivityIndicator color="#fff" />
          ) : reviews.length === 0 ? (
            <Text
              style={{
                textAlign: "center",
                color: "white",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 28,
                marginBottom: 40,
              }}
            >
              No reviews yet. Be the first to write one!
            </Text>
          ) : (
            reviews.map((review) => (
              <View
                key={review.id}
                style={{
                  backgroundColor:
                    review.userId === auth.currentUser?.uid
                      ? "#5F5F5F"
                      : "#3F3F3F",
                  borderRadius: 24,
                  padding: 16,
                  marginBottom: 12,
                  marginHorizontal: 16,
                  alignSelf: "center",
                  width: screenWidth - 32,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                  >
                    {review.username}
                  </Text>
                  {auth.currentUser?.uid === review.userId && (
                    <TouchableOpacity
                      onPress={() =>
                        deleteReview(review.id, movie.id, review.reviewText)
                      }
                      disabled={deletingReviewId === review.id}
                    >
                      {deletingReviewId === review.id ? (
                        <ActivityIndicator size="small" color="white" />
                      ) : (
                        <Image
                          source={require("../../assets/x-icon.png")}
                          style={{ width: 20, height: 20 }}
                        />
                      )}
                    </TouchableOpacity>
                  )}
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 4,
                  }}
                >
                  <StarRating
                    rating={review.rating}
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
                  <Text style={{ color: "#aaa", fontSize: 14, marginLeft: 8 }}>
                    {formatReviewDate(review.timestamp.toDate())}
                  </Text>
                </View>
                <Text style={{ color: "#fff", fontSize: 15 }}>
                  {review.reviewText}
                </Text>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.detailsRoot}>
      <NavBar />
      <Toast />
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
          reviews.map((item) => {
            const isUserReview = auth.currentUser?.uid === item.userId;

            return (
              <View
                key={item.id}
                style={[
                  styles.reviewBubble,
                  item.userId === auth.currentUser?.uid &&
                    styles.myReviewBubble,
                ]}
              >
                <View style={styles.reviewHeaderRow1}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                    }}
                  >
                    <Image
                      source={require("../../assets/user-icon-white.png")}
                      style={styles.userIcon}
                    />
                    <Text style={styles.reviewUser}>{item.username}</Text>
                  </View>

                  {isUserReview && (
                    <TouchableOpacity
                      onPress={() =>
                        deleteReview(item.id, movie.id, item.reviewText)
                      }
                      disabled={deletingReviewId === item.id}
                    >
                      <View style={styles.iconWrapper}>
                        {deletingReviewId === item.id ? (
                          <ActivityIndicator size="small" color="white" />
                        ) : (
                          <Image
                            source={require("../../assets/x-icon.png")}
                            style={styles.deleteIcon}
                          />
                        )}
                      </View>
                    </TouchableOpacity>
                  )}
                </View>

                <View style={styles.reviewHeaderRow2}>
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      marginBottom: 4,
                    }}
                  >
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
                    <Text
                      style={{ color: "#aaa", fontSize: 14, marginLeft: 8 }}
                    >
                      {formatReviewDate(item.timestamp.toDate())}
                    </Text>
                  </View>
                </View>

                <Text style={styles.reviewText}>{item.reviewText}</Text>
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}
