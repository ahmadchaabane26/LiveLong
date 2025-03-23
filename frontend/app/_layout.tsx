import { Slot, useRouter, useSegments } from "expo-router";
import { useAuth } from "@/constants/firebaseAuth";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import AuthProvider from "@/constants/firebaseAuth";
import * as Location from "expo-location";

function ProtectedLayout() {
  const { currentUser, loading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  const [locationPermissionChecked, setLocationPermissionChecked] = useState(false);

  useEffect(() => {
    const requestLocationPermission = async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        console.log("📍 Location permission denied");
      } else {
        console.log("📍 Location permission granted");
      }
      setLocationPermissionChecked(true);
    };

    if (Platform.OS !== "web") {
      requestLocationPermission();
    } else {
      setLocationPermissionChecked(true);
    }
  }, []);

  useEffect(() => {
    if (!loading && locationPermissionChecked) {
      const inAuthGroup = segments[0] === "auth";

      if (!currentUser && !inAuthGroup) {
        router.replace("/auth/login");
      }

      if (currentUser && inAuthGroup) {
        router.replace("/");
      }
    }
  }, [currentUser, loading, locationPermissionChecked]);

  if (loading || !locationPermissionChecked) {
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
