// app/modal.tsx
import { View, Text, Button, Alert, TouchableOpacity, StyleSheet } from "react-native";
import { useAuth } from "@/constants/firebaseAuth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

export default function ProfileModal() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Logged out", "See you soon!");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message);
    }
  };

  return (
    <View style={styles.overlay}>
      <View style={styles.modal}>
        {/* Close Button */}
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        {/* Modal Content */}
        <Text style={styles.title}>👤 Profile</Text>
        <Text style={styles.emailText}>Email: {currentUser?.email}</Text>
        <Button title="Log Out" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
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
    top: 12,
    right: 12,
    zIndex: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  emailText: {
    marginBottom: 20,
    fontSize: 16,
  },
});
