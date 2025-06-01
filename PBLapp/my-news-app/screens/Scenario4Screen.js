import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LineChart } from "react-native-chart-kit";
import styles from "./ScenarioStyle";

const screenWidth = Dimensions.get("window").width;

const Scenario4Screen = () => {
  const scrollViewRef = useRef();

  const [open1, setOpen1] = useState(false);
  const [value1, setValue1] = useState(null);
  const [items1, setItems1] = useState([
    { label: "Electronics", value: "electronics" },
    { label: "Agriculture", value: "agriculture" },
    { label: "Automobiles", value: "automobiles" },
    { label: "General", value: "general"},
  ]);

  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: "Short term", value: "shortterm" },
    { label: "Long term", value: "longterm" },
  ]);

  const [text, setText] = useState("");
  const [jsonArray, setJsonArray] = useState([]);
  const [predictionResult, setPredictionResult] = useState(null);

  const sendToServer = async (dataToSend) => {
    console.log("Sending data to server:", dataToSend);
    try {
      const response = await fetch("http://192.168.29.207:5000/predictt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const result = await response.json();
      console.log("Received result from server:", result);
      setPredictionResult(result);
      setJsonArray((prev) => [...prev, dataToSend]);
    } catch (error) {
      console.error("Error sending data to server:", error);
    }
  };

  const saveData = () => {
    if (!value1 || !value2 || !text) {
      console.warn("Please fill all fields before saving.");
      return;
    }

    const newEntry = {
      policy_id: 4,
      goods_category: value1,
      amount: parseFloat(text),
      timeframe: value2,
    };

    console.log("New entry:", newEntry);
    sendToServer(newEntry);
  };

  useEffect(() => {
    if (predictionResult) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [predictionResult]);

  const getImpactSummary = (predicted, historical) => {
    if (!predicted || !historical) return [];
    const summary = [];

    if (predicted["GDP_Growth_rf"] > historical["GDP_Growth_rf"]) {
      summary.push("- GDP is expected to grow.");
    } else {
      summary.push("- GDP growth may decline.");
    }

    if (
      predicted["Unemployment Rate (%)_rf"] <
      historical["Unemployment Rate (%)_rf"]
    ) {
      summary.push("- Unemployment may decrease.");
    } else {
      summary.push("- Unemployment might rise.");
    }

    if (
      predicted["General index_CPI_rf"] > historical["General index_CPI_rf"]
    ) {
      summary.push("- Inflation may increase.");
    } else {
      summary.push("- Inflation remains under control.");
    }

    if (predicted["Exports_rf"] > historical["Exports_rf"]) {
      summary.push("- Exports are expected to rise.");
    } else {
      summary.push("- Exports may decline.");
    }

    if (predicted["Imports_rf"] > historical["Imports_rf"]) {
      summary.push("- Imports are expected to rise.");
    } else {
      summary.push("- Imports may decline.");
    }

    return summary;
  };

  // Avoid using scrollView with flatList as it causes performance issues
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <FlatList
        ref={scrollViewRef}
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            <Text style={styles.title}>Goods Category</Text>
            <DropDownPicker
              open={open1}
              value={value1}
              items={items1}
              setOpen={setOpen1}
              setValue={setValue1}
              setItems={setItems1}
              placeholder="Select Goods Category"
              containerStyle={{ marginBottom: 16 }}
              style={{ backgroundColor: "#fafafa" }}
            />
            <Text style={styles.resultText}>Selected Category: {value1}</Text>

            <Text style={[styles.title, { marginTop: 16 }]}>Tariff % Increase</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter percentage..."
              value={text}
              onChangeText={setText}
              keyboardType="numeric"
              placeholderTextColor="#999"
            />
            <Text style={styles.resultText}>You entered: {text}</Text>

            <Text style={[styles.title, { marginTop: 16 }]}>Timeframe</Text>
            <DropDownPicker
              open={open2}
              value={value2}
              items={items2}
              setOpen={setOpen2}
              setValue={setValue2}
              setItems={setItems2}
              placeholder="Select Timeframe"
              containerStyle={{ marginBottom: 16 }}
              style={{ backgroundColor: "#fafafa" }}
            />
            <Text style={styles.resultText}>Selected Timeframe: {value2}</Text>

            <TouchableOpacity
              onPress={saveData}
              style={{
                backgroundColor: "#007AFF",
                padding: 12,
                borderRadius: 8,
                alignItems: "center",
                marginTop: 24,
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Save & Predict</Text>
            </TouchableOpacity>
          </>
        }
        ListFooterComponent={
          predictionResult?.predictions && predictionResult?.historical ? (
            <View style={{ marginTop: 32 }}>
              <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
                Prediction Result
              </Text>
              <LineChart
                data={{
                  labels: ["GDP", "Unemp.", "CPI", "Exports", "Imports" ],
                  datasets: [
                    {
                      data: [
                        predictionResult.historical["GDP_Growth_rf"],
                        predictionResult.historical["Unemployment Rate (%)_rf"],
                        predictionResult.historical["General index_CPI_rf"],
                        predictionResult.historical["Exports of goods and services (% of GDP)_rf"],
                        predictionResult.historical["Imports of goods and services (% of GDP)_rf.pkl"],
                      ],
                      color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`, // 🔵 Historical
                      strokeWidth: 2,
                    },
                    {
                      data: [
                        predictionResult.predictions["GDP_Growth_rf"],
                        predictionResult.predictions["Unemployment Rate (%)_rf"],
                        predictionResult.predictions["General index_CPI_rf"],
                        predictionResult.predictions["Exports of goods and services (% of GDP)_rf"],
                        predictionResult.predictions["Imports of goods and services (% of GDP)_rf"],

                      ],
                      color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`, // 🟢 Predicted
                      strokeWidth: 2,
                    },
                  ],
                  legend: ["Historical", "Predicted"],
                }}
                width={screenWidth - 32}
                height={220}
                chartConfig={{
                  backgroundColor: "#fff",
                  backgroundGradientFrom: "#fff",
                  backgroundGradientTo: "#fff",
                  decimalPlaces: 2,
                  color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
                  labelColor: () => "#000",
                  propsForDots: {
                    r: "5",
                    strokeWidth: "2",
                    stroke: "#fff",
                  },
                }}
                bezier
                style={{
                  borderRadius: 10,
                  marginVertical: 10,
                }}
              />

              <Text style={{ fontWeight: "bold", fontSize: 16, marginTop: 16 }}>
                Policy Impact Summary
              </Text>
              {getImpactSummary(
                predictionResult.predictions,
                predictionResult.historical
              ).map((line, idx) => (
                <Text key={idx} style={{ marginTop: 5 }}>
                  {line}
                </Text>
              ))}
            </View>
          ) : null
        }
      />
    </KeyboardAvoidingView>
  );
};

export default Scenario4Screen;
