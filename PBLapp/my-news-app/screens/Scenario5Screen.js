import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { LineChart } from "react-native-chart-kit";
import styles from "./ScenarioStyle";

const Scenario5Screen = () => {
  const screenWidth = Dimensions.get("window").width;
  const scrollViewRef = useRef();

  const [open1, setOpen1] = useState(false);
  const [value1, setValue1] = useState(null);
  const [items1, setItems1] = useState([
    { label: "Tax Breaks", value: "tax_breaks" },
    { label: "Manufacturing Subsidies", value: "manufacturing_subsidies" },
    {label: "Infrastructure Investment", value: "infrastructure_investment"},
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

  const sendToServer = async (data) => {
    const apiUrl = "http://192.168.29.207:5000/predict";
    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        const result = await response.json();
        setPredictionResult(result);
      } else {
        console.error("Failed:", response.statusText);
        Alert.alert("Error", "Failed to send data.");
      }
    } catch (error) {
      console.error("Error:", error);
      Alert.alert("Error", "Network error occurred.");
    }
  };

  const saveData = () => {
    const amountNum = parseFloat(text);
    if (!value1 || !value2 || isNaN(amountNum)) {
      Alert.alert("Error", "Please fill all fields correctly.");
      return;
    }

    const json = {
      policy_id: 5,
      incentive_type: value1,
      amount: amountNum,
      timeframe: value2,
    };

    setJsonArray([json]);
    sendToServer(json);
  };

  const getText = () => {
    if (value1 === "tax_holiday") {
      return "The value represents the tax break percentage.";
    } else if (value1 === "ease_regulation") {
      return "The value represents impact % from easing regulation.";
    }
    return "";
  };

  const getImpactSummary = (predicted, historical) => {
    if (!predicted || !historical) return [];

    const summary = [];

    if (predicted["GDP_Growth_rf"] > historical["GDP_Growth_rf"]) {
      summary.push("- GDP is expected to grow.");
    } else {
      summary.push("- GDP growth may slow down.");
    }

    if (
      predicted["Unemployment Rate (%)_rf"] <
      historical["Unemployment Rate (%)_rf"]
    ) {
      summary.push("- Unemployment may decrease.");
    } else {
      summary.push("- Unemployment might increase.");
    }

    if (predicted["General index_CPI_rf"] > historical["General index_CPI_rf"]) {
      summary.push("- Inflation may rise.");
    } else {
      summary.push("- Inflation remains stable or drops.");
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

  useEffect(() => {
    if (predictionResult) {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }
  }, [predictionResult]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={{ flex: 1 }}
    >
      <ScrollView
        ref={scrollViewRef}
        contentContainerStyle={{ flexGrow: 1, padding: 16 }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled={!(open1 || open2)}
      >
        <Text style={styles.title}>Type of Incentive</Text>
        <DropDownPicker
          open={open1}
          value={value1}
          items={items1}
          setOpen={setOpen1}
          setValue={setValue1}
          setItems={setItems1}
          placeholder="Select Incentive Type"
          containerStyle={{ marginBottom: 16 }}
          style={{ backgroundColor: "#fafafa" }}
          zIndex={3000}
          zIndexInverse={1000}
          listMode="SCROLLVIEW"
        />

        <Text style={[styles.title, { marginTop: 16 }]}>
          Expected Growth Impact (%)
        </Text>
        <Text style={[styles.resultText, { marginBottom: 8 }]}>{getText()}</Text>

        <TextInput
          style={styles.input}
          placeholder="Enter % amount..."
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={text}
          onChangeText={setText}
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
          zIndex={2000}
          zIndexInverse={2000}
          listMode="SCROLLVIEW"
        />
        <Text style={styles.resultText}>Selected Timeframe: {value2}</Text>

        <TouchableOpacity
          onPress={saveData}
          style={{
            backgroundColor: "#007bff",
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
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default Scenario5Screen;
