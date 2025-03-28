import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
  Alert,
  Platform,
} from "react-native";
import * as Location from "expo-location";
import { collection, addDoc, getDocs } from "firebase/firestore";
import { getFirestore, query, where } from "firebase/firestore";
import app from "@/constants/firebaseConfig";
import { useAuth } from "@/constants/firebaseAuth";

const db = getFirestore(app);

const EventsScreen = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "nearby">("create");

  // Create Event State
  const [title, setTitle] = useState("");
  const [destination, setdestination] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  // Nearby Events
  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);

  useEffect(() => {
    // Get current location on mount
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      });
    })();
  }, []);

  const handleCreateEvent = async () => {
    if (!title || !description || !date || !time || !location || !currentUser || !destination) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    try {
      await addDoc(collection(db, "Events"), {
        title,
        description,
        destination,
        date,
        time,
        location,
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email, // ✅ Add this line
        isPublic: true,
        createdAt: new Date().toISOString(),
      });

      Alert.alert("Event Created", "Your event was successfully created.");
      setTitle("");
      setdestination("");
      setDescription("");
      setDate("");
      setTime("");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 3958.8; // miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyEvents = async () => {
    if (!location) return;
    setLoadingEvents(true);
    const snapshot = await getDocs(collection(db, "Events"));
    const allEvents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    const nearby = allEvents.filter((event: any) => {
      if (!event.location) return false;
      const distance = getDistance(
        location.latitude,
        location.longitude,
        event.location.latitude,
        event.location.longitude
      );
      return distance <= 10; // within 10 miles
    });

    setNearbyEvents(nearby);
    setLoadingEvents(false);
  };

  const renderCreateForm = () => (
    <ScrollView contentContainerStyle={styles.formContainer}>
      <Text style={styles.header}>📅 Create an Event</Text>
      <TextInput
        style={styles.input}
        placeholderTextColor="#000"
        placeholder="Event Title"
        value={title}
        onChangeText={setTitle}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#000"
        placeholder="Destination"
        value={destination}
        onChangeText={setdestination}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#000"
        placeholder="Description"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#000"
        placeholder="Date (e.g., 2025-04-15)"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholderTextColor="#000"
        placeholder="Time (e.g., 3:00 PM)"
        value={time}
        onChangeText={setTime}
      />
      <Button title="Create Event" onPress={handleCreateEvent} />
    </ScrollView>
  );

  const renderNearbyEvents = () => (
    <View style={styles.nearbyContainer}>
      <Text style={styles.header}>📍 Events Near You</Text>
      <Button title="Refresh Events" onPress={fetchNearbyEvents} />
      {loadingEvents ? (
        <Text style={{ marginTop: 10 }}>Loading nearby events...</Text>
      ) : (
        <FlatList
          data={nearbyEvents}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View style={styles.eventCard}>
              <Text style={styles.eventTitle}>{item.title}</Text>
              <Text>{item.description}</Text>
              <Text>{item.destination}</Text>
              <Text>{item.date} at {item.time}</Text>
              <Text style={{ fontStyle: "italic", color: "#555" }}>
                Created by: {item.createdByEmail || "Anonymous"}
              </Text>
              {/* Future: Add RSVP button here */}
            </View>
          )}
        />
      )}
    </View>
  );

  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab("create")}
          style={[styles.tabButton, activeTab === "create" && styles.activeTab]}
        >
          <Text>Create Event</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab("nearby")}
          style={[styles.tabButton, activeTab === "nearby" && styles.activeTab]}
        >
          <Text>Nearby Events</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "create" ? renderCreateForm() : renderNearbyEvents()}
    </View>
  );
};

export default EventsScreen;

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    borderBottomWidth: 1,
    paddingVertical: 8,
    backgroundColor: "#f9f9f9",
  },
  tabButton: {
    padding: 10,
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#facc15",
  },
  formContainer: {
    padding: 20,
  },
  header: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  nearbyContainer: {
    padding: 20,
    flex: 1,
  },
  eventCard: {
    padding: 15,
    backgroundColor: "#fff",
    marginVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eee",
  },
  eventTitle: {
    fontWeight: "bold",
    fontSize: 16,
    marginBottom: 4,
  },
});
