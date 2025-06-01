import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import styles from "./PStyle"; 

const PredictionScreen = ({ navigation }) => (
  <View style={styles.container}>
    <Text style={styles.title}>Select a scenario</Text>
    <View>
      <TouchableOpacity onPress={() => navigation.navigate("Increase or Decrease Government spending")} style={styles.button}>
        <Text style={styles.buttonText}>Increase or Decrease Government spending</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Reduce Fiscal deficit")} style={styles.button}>
        <Text style={styles.buttonText}>Reduce Fiscal deficit</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Promote Exports with incentives")} style={styles.button}>
        <Text style={styles.buttonText}>Promote Exports with incentives</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Increase Import duty on certain goods")} style={styles.button}>
        <Text style={styles.buttonText}>Increase Import duty on certain goods</Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => navigation.navigate("Encourage Domestic Manufacturing")} style={styles.button}>
        <Text style={styles.buttonText}>Encourage Domestic Manufacturing</Text>
      </TouchableOpacity>
    </View>
  </View>
);

export default PredictionScreen;