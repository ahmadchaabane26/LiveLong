import { Slot, useRouter, useSegments } from "expo-router";
import { useAuth } from "@/constants/firebaseAuth";
import { useEffect, useState } from "react";
import { View, ActivityIndicator, Platform } from "react-native";
import AuthProvider from "@/constants/firebaseAuth";
import * as Location from "expo-location";
import React from "react";
import { setDoc, doc, getFirestore } from "firebase/firestore";
import app from "@/constants/firebaseConfig";

function ProtectedLayout() {
  const { currentUser, loading } = useAuth();
  const db = getFirestore(app)
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
      const currentLocation = await Location.getCurrentPositionAsync({});
      const { latitude, longitude } = currentLocation.coords;
      
      if (currentUser?.uid) {
        await setDoc(
          doc(db, "All Users", currentUser.uid),
          {
            lastKnownLocation: {
              latitude,
              longitude,
              updatedAt: new Date().toISOString(),
            },
          },
          { merge: true } // Use merge so it doesn’t overwrite the full document
        );
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
