import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/constants/firebaseAuth";
import app from "@/constants/firebaseConfig";

const db = getFirestore(app);

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const toRad = (value: number): number => (value * Math.PI) / 180;
  const R = 3958.8; // Radius of Earth in miles
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

const LeaderboardScreen = () => {
  const { currentUser } = useAuth();
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLeaderboard = async () => {
    if (!currentUser) {
      setError("No user is logged in");
      setLoading(false);
      return;
    }

    try {
      // Get current user's data from Firestore
      const currentUserDocRef = doc(db, "All Users", currentUser.uid);
      const currentUserDocSnap = await getDoc(currentUserDocRef);

      if (!currentUserDocSnap.exists()) {
        setError("User data not found");
        setLoading(false);
        return;
      }

      const currentUserData = currentUserDocSnap.data();
      const currentUserLocation = currentUserData.lastKnownLocation;

      if (!currentUserLocation) {
        setError("No location stored for user");
        setLoading(false);
        return;
      }

      // Fetch all users
      const usersRef = collection(db, "All Users");
      const snapshot = await getDocs(usersRef);
      const allUsers = snapshot.docs.map(doc => ({
        userId: doc.id,
        email: doc.data().email, // Get email from the user document
        streak: doc.data().streak || 0, // If streak is undefined, set to 0
        lastKnownLocation: doc.data().lastKnownLocation,
      }));

      // Filter users within 10 miles
      const filteredUsers = allUsers.filter((user: any) => {
        const userLocation = user.lastKnownLocation || {};
        if (!userLocation.latitude || !userLocation.longitude) return false;

        const distance = calculateDistance(
          currentUserLocation.latitude,
          currentUserLocation.longitude,
          userLocation.latitude,
          userLocation.longitude
        );
        return distance <= 10;
      });

      // Sort by streak in descending order
      const sortedLeaderboard = filteredUsers.sort((a: any, b: any) => b.streak - a.streak);
      setLeaderboard(sortedLeaderboard);
      setLoading(false);
    } catch (error) {
      setError("Error fetching leaderboard data");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboard();
  }, [currentUser]);

  if (loading) {
    return (
      <View style={styles.centered}>
        <Text>Loading leaderboard...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <Text style={styles.header}>Leaderboard</Text>

      {/* Refresh Button */}
      <Button title="Refresh Leaderboard" onPress={fetchLeaderboard} />

      {/* ScrollView to replace FlatList */}
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {leaderboard.map((item, index) => (
          <View key={item.userId || index} style={styles.eventCard}>
            {/* Display the rank as the index + 1 */}
            <Text style={styles.rank}>{index + 1}</Text>
            {/* Display the email */}
            <Text style={styles.userName}>{item.email}</Text>
            {/* Display the streak */}
            <Text style={styles.streak}>Streak: {item.streak}</Text>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  scrollContainer: {
    paddingBottom: 20,
  },
  eventCard: {
    padding: 15,
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  rank: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#007BFF", // Add some color to the rank
  },
  userName: {
    fontWeight: "bold",
    fontSize: 18,
  },
  streak: {
    fontSize: 16,
    color: "#555",
  },
});

export default LeaderboardScreen;
