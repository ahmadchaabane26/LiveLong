// app/modal.tsx
import { View, Text, Button, Alert } from "react-native";
import { useAuth } from "@/constants/firebaseAuth";
import { useRouter } from "expo-router";

export default function ProfileModal() {
  const { currentUser, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    if (!currentUser) {
      return (
        <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
          <Text>Loading user...</Text>
        </View>
      );
    }
    try {
      await logout();
      Alert.alert("Logged out", "See you soon!");
      router.replace("/auth/login");
    } catch (error: any) {
      Alert.alert("Logout failed", error.message);
    }
    
  };

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center", padding: 20 }}>
      <Text style={{ fontSize: 22, marginBottom: 20 }}>👤 Profile</Text>
      <Text style={{ marginBottom: 10 }}>Email: {currentUser?.email}</Text>
      <Button title="Log Out" onPress={handleLogout} />
    </View>
  );
}
