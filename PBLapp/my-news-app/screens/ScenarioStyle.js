import { StyleSheet } from "react-native";

const ScenarioStyle = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#00796b", // Dark greenish-blue text
    marginBottom: 20,
  },
  picker: {
    width: 250,
    height: 50,
    backgroundColor: "#ffffff",
    borderRadius: 8,
    borderColor: "#00796b",
    borderWidth: 1,
    marginBottom: 30
  },
  input: {
    width: "90%",
    height: 50,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    fontSize: 16,
    color: "#000",
    marginBottom: 10,
  },
  resultText: {
    marginTop:10,
    fontSize: 16,
  },
  selectedText: {
    marginTop: 20,
    fontSize: 16,
    fontWeight: "bold",
    color: "#004d40", // Darker shade of greenish-blue
  },
});

export default ScenarioStyle;
