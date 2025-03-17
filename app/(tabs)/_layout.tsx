import React from "react";
import { View, StyleSheet } from "react-native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import HomeScreen from "./index"; // Home screen
import QuizScreen from "./explore";
const Stack = createNativeStackNavigator();

const TabLayout = () => {
  return (
    <View style={styles.container}>
      <Stack.Navigator initialRouteName="Home">
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ headerShown: false }} // Hide default header for this screen
        />
        <Stack.Screen
          name="Quiz"
          component={QuizScreen}
          options={{ headerShown: false }} // Hide default header for this screen
        />
      </Stack.Navigator>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 0, // Remove padding
    margin: 0, // Remove margin
  },
});

export default TabLayout;
