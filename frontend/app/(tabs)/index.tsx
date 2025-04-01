import { View, Text, Button, StyleSheet } from "react-native";
import { Link } from "expo-router";
import React from "react";

export default function Home() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🏡 Welcome to Live Long!</Text>
      <Text style={styles.subtitle}>You're seeing the Home Tab 🎉</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#666",
  },
});
