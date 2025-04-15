import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { useAuth } from "@/constants/firebaseAuth";  // Import the useAuth hook to access currentUser
import { useRouter } from "expo-router";


export default function SettingsPage({ navigation }: any) {
  const { currentUser } = useAuth();  // Get the currentUser object from useAuth
    const router = useRouter();
  

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Text style={styles.closeText}>Back</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Settings</Text>

        {/* Display the email of the logged-in user */}
        {currentUser ? (
          <View style={styles.emailContainer}>
            <Text style={styles.emailText}>Email: {currentUser.email}</Text>
          </View>
        ) : (
          <Text style={styles.noUserText}>No user logged in</Text>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  modal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  closeButton: {
    position: "absolute",
    top: 20,
    left: 20,
  },
  closeText: {
    fontSize: 18,
    color: "#2196F3",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  emailContainer: {
    padding: 10,
    marginTop: 30,
    alignItems: "center",
  },
  emailText: {
    fontSize: 18,
    color: "#333",
  },
  noUserText: {
    fontSize: 16,
    color: "#888",
  },
});
