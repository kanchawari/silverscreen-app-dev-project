import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
} from "react-native";
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
  addDoc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion,
  collection,
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";

type MovieReviewScreenProps = NativeStackScreenProps<
  RootStackParamList,
  "MovieReview"
>;

export default function MovieReviewScreen({
  navigation,
  route,
}: MovieReviewScreenProps) {
  const { movie } = route.params;

  const [stars, setStars] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const [loading, setLoading] = useState(false);

  const submitReview = async () => {
    if (loading) return; // Prevent duplicate submissions
    setLoading(true);
    try {
      const userId = auth.currentUser?.uid;
      if (!userId) {
        alert("You must be logged in to submit a review.");
        setLoading(false);
        return;
      }

      const movieId = movie.id;
      const movieRef = doc(db, "movies", String(movieId));
      const userRef = doc(db, "users", userId);
      const movieSnap = await getDoc(movieRef);
      const userSnap = await getDoc(userRef);

      if (!movieSnap.exists()) {
        await setDoc(movieRef, { title: movie.title });
      }

      if (!userSnap.exists()) {
        alert("User data not found.");
        setLoading(false);
        return;
      }

      const username = userSnap.data().username;

      const review = {
        userId,
        username,
        rating: stars,
        reviewText: reviewText,
        timestamp: new Date(),
      };

      await addDoc(
        collection(db, "movies", String(movieId), "reviews"),
        review
      );

      await updateDoc(userRef, {
        reviews: arrayUnion({
          movieId,
          rating: stars,
          reviewText: reviewText,
          timestamp: new Date(),
        }),
      });

      Toast.show({
        type: "success",
        text1: "Review submitted successfully!",
        position: "top",
        visibilityTime: 2000,
      });

      setStars(0);
      setReviewText("");
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Error submitting review",
        text2: "Please try again.",
      });
      console.error("Error submitting review:", error);
      alert("There was an error submitting your review. Please try again.");
    } finally {
      setLoading(false);
    }
  };

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
            <Text style={styles.giveRating}>Leave a Review!</Text>
            <StarRating
              style={styles.starsRating}
              rating={stars}
              starSize={60}
              onChange={setStars}
              animationConfig={{
                scale: 1,
                easing: () => 0,
                duration: 0,
              }}
            />
            <TextInput
              style={styles.reviewInput}
              placeholder="Write your review..."
              placeholderTextColor="#aaa"
              multiline
              numberOfLines={6}
              value={reviewText}
              onChangeText={setReviewText}
            />
            <TouchableOpacity
              style={[
                styles.submitReviewBtn,
                loading ? { backgroundColor: "#555" } : null,
              ]}
              onPress={submitReview}
              disabled={loading}
            >
              <Text style={styles.submitReviewText}>
                {loading ? "Submitting..." : "Submit Review"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.detailsTitle}>
          {movie.title} ({movie.release_date?.slice(0, 4)})
        </Text>
      </ScrollView>
    </View>
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
    marginTop: 0,
    marginHorizontal: 240,
  },
  detailsPoster: {
    width: 360,
    height: 540,
    /*borderRadius: 8,*/
    marginRight: 24,
  },
  detailsCol: {
    flex: 1,
    justifyContent: "flex-start",
  },
  starsRating: {
    marginLeft: 40,
  },
  detailsTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 4,
    left: "-25%",
    textAlign: "center",
  },
  giveRating: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 28,
    marginBottom: 20,
    marginLeft: 54,
  },
  reviewInput: {
    backgroundColor: "#1e1e1e",
    color: "#fff",
    borderColor: "#444",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginTop: 30,
    marginLeft: 40,
    fontSize: 18,
    textAlignVertical: "top", // Aligns text at the top for multiline
  },

  submitReviewBtn: {
    backgroundColor: "#a11a1a",
    borderRadius: 8,
    alignSelf: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
    marginTop: 30,
    marginBottom: 32,
    marginLeft: 20,
    width: 240,
    alignItems: "center",
  },
  submitReviewText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 22,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    marginLeft: 16,
    alignSelf: "flex-start",
  },
});
