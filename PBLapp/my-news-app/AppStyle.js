import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  card: {
    padding: 10,
    borderBottomWidth: 1,
    borderColor: "#ccc",
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 10,
  },
  detailsContainer: {
    padding: 10,
  },
  detailsImage: {
    width: "100%",
    height: 300,
    borderRadius: 10,
  },
  detailsTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginVertical: 10,
  },
  detailsContent: {
    fontSize: 16,
  },
});

export default styles;
