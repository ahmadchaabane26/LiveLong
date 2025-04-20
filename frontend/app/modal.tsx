// app/modal.tsx
import { View, Text, Button, Alert, TouchableOpacity, StyleSheet, TextInput } from "react-native";
import { useAuth } from "@/constants/firebaseAuth";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";

export default function ProfileModal() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();
  const [isSettingsVisible, setIsSettingsVisible] = useState(false);
  const [friendEmail, setFriendEmail] = useState("");

  const handleLogout = async () => {
    try {
      await logout();
      Alert.alert("Logged out", "See you soon!");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message);
    }
  };

  const handleAddFriend = () => {
    // You can implement a function to search for friends by email here
    router.push("/modal/friends")
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

        {/* Settings Button */}
        <TouchableOpacity onPress={() => router.push("/modal/settings")} style={styles.settingsButton}>
          <Text style={styles.settingsText}>Settings</Text>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>
        
        {/* Journal Button */}
        <TouchableOpacity onPress={() => router.push("/modal/Journal")} style={styles.JournalButton}>
          <Text style={styles.addFriendText}>View Journals</Text>
          <Ionicons name="chevron-forward" size={20} color="#333" />
        </TouchableOpacity>

        {/* Add Friend Button */}
        <TouchableOpacity onPress={() => router.push("/modal/friends")} style={styles.addFriendButton}>
          <Text style={styles.addFriendText}>Add Friends</Text>
          <Ionicons name="person-add" size={20} color="#333" />
        </TouchableOpacity>

        {/* Log Out Button */}
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
  settingsButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  settingsText: {
    fontSize: 18,
    color: "#333",
  },
  JournalButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  addFriendButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    marginVertical: 10,
  },
  addFriendText: {
    fontSize: 18,
    color: "#333",
  },
});
