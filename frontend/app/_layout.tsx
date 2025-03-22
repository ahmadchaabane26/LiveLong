import { Slot, useRouter, useSegments } from "expo-router";
import { useAuth } from "@/constants/firebaseAuth";
import { useEffect } from "react";
import { View, ActivityIndicator } from "react-native";
import AuthProvider from "@/constants/firebaseAuth";

function ProtectedLayout() {
  const { currentUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      const inAuthGroup = segments[0] === "auth";

      if (!currentUser && !inAuthGroup) {
        router.replace("/auth/login");
      }

      if (currentUser && inAuthGroup) {
        router.replace("/");
      }
    }
  }, [currentUser, loading]);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#facc15" />
      </View>
    );
  }

  return <Slot />;
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <ProtectedLayout />
    </AuthProvider>
  );
}
