import React from "react";
import { View, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

const DetailsScreen = ({ route }) => {
  const { article } = route.params;

  return (
    <View style={{ flex: 1 }}>
      <WebView source={{ uri: article.url }} />
    </View>
  );
};

export default DetailsScreen;