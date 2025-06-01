import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Dimensions,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LineChart } from "react-native-chart-kit";
import styles from "./ScenarioStyle";

const screenWidth = Dimensions.get("window").width;

const Scenario2Screen = () => {
  DropDownPicker.setListMode("SCROLLVIEW");  // ✅ Ensure consistent list mode

  const scrollViewRef = useRef();

  const [open2, setOpen2] = useState(false);
  const [value2, setValue2] = useState(null);
  const [items2, setItems2] = useState([
    { label: "Short term", value: "shortterm" },
    { label: "Long term", value: "longterm" },
  ]);

  const [text, setText] = useState("");
  const [jsonObject, setJsonObject] = useState(null);
  const [predictionResult, setPredictionResult] = useState(null);

  const sendToServer = async (data) => {
    try {
      const response = await fetch("http://192.168.29.207:5000/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      console.log("Prediction Result:", result);
      setPredictionResult(result);
    } catch (error) {
      console.error("Error sending data to server:", error);
    }
  };

  const saveData = () => {
    if (!text || !value2) {
      console.warn("Please fill all fields before saving.");
      return;
    }

    const data = {
      policy_id: 2,
      amount: parseFloat(text),
      timeframe: value2,
    };

    setJsonObject(data);
    console.log("Generated JSON:", JSON.stringify(data, null, 2));
    sendToServer(data);
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
      predicted["Unemployment Rate (%)_rf"] < historical["Unemployment Rate (%)_rf"]
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

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      >
        <Text style={styles.title}>Deficit Reduction Amount (in billion USD)</Text>
        <TextInput
          style={styles.input}
          placeholder="Enter amount..."
          placeholderTextColor="#999"
          value={text}
          onChangeText={setText}
          keyboardType="numeric"
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
          <Text style={{ color: "#fff", fontWeight: "bold" }}>
            Save & Predict
          </Text>
        </TouchableOpacity>

        {predictionResult?.predictions && predictionResult?.historical && (
          <View style={{ marginTop: 32 }}>
            <Text style={{ fontWeight: "bold", fontSize: 16, marginBottom: 8 }}>
              Prediction Result
            </Text>
            <LineChart
              data={{
                labels: ["GDP", "Unemp.", "CPI", "Exports", "Imports"],
                datasets: [
                  {
                    data: [
                      predictionResult.historical["GDP_Growth_rf"],
                      predictionResult.historical["Unemployment Rate (%)_rf"],
                      predictionResult.historical["General index_CPI_rf"],
                      predictionResult.historical["Exports of goods and services (% of GDP)_rf"],
                      predictionResult.historical["Imports of goods and services (% of GDP)_rf.pkl"],
                    ],
                    color: (opacity = 1) => `rgba(0, 0, 255, ${opacity})`,
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
                    color: (opacity = 1) => `rgba(0, 128, 0, ${opacity})`,
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
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Scenario2Screen;
