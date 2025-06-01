import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import HomeScreen from "./screens/HomeScreen";
import DetailsScreen from "./screens/DetailsScreen";
import AIChatBotScreen from "./screens/AIChatBotScreen";
import PredictionScreen from "./screens/PredictionScreen";
import Scenario1Screen from "./screens/Scenario1Screen"; 
import Scenario2Screen from "./screens/Scenario2Screen"; 
import Scenario3Screen from "./screens/Scenario3Screen"; 
import Scenario4Screen from "./screens/Scenario4Screen"; 
import Scenario5Screen from "./screens/Scenario5Screen"; 
import Icon from "react-native-vector-icons/Ionicons";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const PredictionStack = createStackNavigator();

// Home Stack
const HomeStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="HomeScreen" component={HomeScreen} options={{ headerShown: false }} />
    <Stack.Screen name="Details" component={DetailsScreen} />
  </Stack.Navigator>
);

// **New** Prediction Stack (Includes ScenarioScreen)
const PredictionStackScreen = () => (
  <PredictionStack.Navigator>
    <PredictionStack.Screen name="PredictionScreen" component={PredictionScreen} options={{ headerShown: false }} />
    <PredictionStack.Screen name="Increase or Decrease Government spending" component={Scenario1Screen} />
    <PredictionStack.Screen name="Reduce Fiscal deficit" component={Scenario2Screen} />
    <PredictionStack.Screen name="Promote Exports with incentives" component={Scenario3Screen} />
    <PredictionStack.Screen name="Increase Import duty on certain goods" component={Scenario4Screen} />
    <PredictionStack.Screen name="Encourage Domestic Manufacturing" component={Scenario5Screen} />
  </PredictionStack.Navigator>
);

export default function App() {
  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ color, size }) => {
            let iconName;
            if (route.name === "Home") {
              iconName = "home-outline";
            } else if (route.name === "AIChatBot") {
              iconName = "accessibility-outline";
            } else if (route.name === "Prediction") {
              iconName = "analytics-outline";
            } 
            return <Icon name={iconName} size={size} color={color} />;
          },
          tabBarActiveTintColor: "white",
          tabBarInactiveTintColor: "gray",
          tabBarStyle: { backgroundColor: "black", paddingBottom: 5 },
        })}
      >
        <Tab.Screen name="Home" component={HomeStack} />
        <Tab.Screen name="Prediction" component={PredictionStackScreen} />
        <Tab.Screen name="AIChatBot" component={AIChatBotScreen} />
      
      </Tab.Navigator>
    </NavigationContainer>
  );
}
