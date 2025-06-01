import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from "react-native";

const AIChatBotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer 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`,
          "X-Title": "PBL Chatbot"

        },
        body: JSON.stringify({
          model: "openai/gpt-3.5-turbo",
          messages: [...messages, userMessage],
          
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error?.message || "API request failed");
      }

      const data = await response.json();
      const botContent = data?.choices?.[0]?.message?.content;
      if (!botContent) {
        throw new Error("Invalid API response");
      }
  
      const botMessage = { role: "assistant", content: data.choices[0].message.content };

      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error("Error:", error);
      alert("Failed to fetch response. Please check API key or network.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={{ flex: 1, padding: 20, backgroundColor: "#fff" }}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View
            style={{
              alignSelf: item.role === "user" ? "flex-end" : "flex-start",
              backgroundColor: item.role === "user" ? "#007AFF" : "#ddd",
              padding: 10,
              marginVertical: 5,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: item.role === "user" ? "#fff" : "#000" }}>{item.content}</Text>
          </View>
        )}
      />

      {loading && <ActivityIndicator size="small" color="#007AFF" />}

      <View style={{ flexDirection: "row", marginTop: 10 }}>
        <TextInput
          style={{
            flex: 1,
            borderWidth: 1,
            borderColor: "#ccc",
            borderRadius: 5,
            padding: 10,
            marginRight: 10,
          }}
          placeholder="Type a message..."
          value={input}
          onChangeText={setInput}
        />
        <TouchableOpacity
          onPress={sendMessage}
          style={{
            backgroundColor: "#007AFF",
            padding: 10,
            borderRadius: 5,
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default AIChatBotScreen;
