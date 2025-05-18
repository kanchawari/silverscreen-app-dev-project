import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  detailsRoot: {
    flex: 1,
    backgroundColor: "#151518",
  },
  detailsRow: {
    flexDirection: "row",
    marginBottom: 16,
    marginTop: 0,
    marginHorizontal: 160,
  },
  detailsPoster: {
    width: 280,
    height: 420,
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
    marginBottom: 16,
  },
  detailsInfo: {
    color: "#fff",
    fontSize: 15,
    marginBottom: 6,
  },
  detailsOverviewTitle: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
    marginTop: 10,
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
    height: 50,
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
    height: 50,
    alignItems: "center",
    justifyContent: "center",
  },
  detailsActionBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },
  userReviewText: {
    color: "#ccc",
    fontSize: 16,
    marginLeft: 170,
    marginTop: 4,
    marginBottom: 10,
  },
  reviewBubble: {
    backgroundColor: "#3F3F3F",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
    width: "81%",
    alignSelf: "center",
  },
  myReviewBubble: {
    backgroundColor: "#5F5F5F",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
    marginTop: 8,
    width: "81%",
    alignSelf: "center",
  },

  reviewHeaderRow1: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  reviewHeaderRow2: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  userIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },

  reviewHeaderText: {
    flexDirection: "column",
  },

  reviewUser: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 18,
  },

  iconWrapper: {
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  deleteIcon: {
    width: 16,
    height: 16,
    resizeMode: "contain",
  },

  reviewDate: {
    color: "#ccc",
    fontSize: 14,
    marginLeft: 10,
  },

  starRating: {
    marginLeft: "auto",
  },

  reviewText: {
    color: "#fff",
    fontSize: 16,
    marginTop: 4,
    lineHeight: 20,
  },

  writeReviewBtn: {
    backgroundColor: "#5F5F5F",
    borderRadius: 4,
    paddingHorizontal: 60,
    paddingVertical: 10,
    marginTop: 24,
    alignSelf: "flex-start",
  },
  writeReviewText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 20,
  },
  backButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginTop: 16,
    marginLeft: 16,
    alignSelf: "flex-start",
  },
});

export default styles;
