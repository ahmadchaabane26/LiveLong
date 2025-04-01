import React, { useEffect, useState } from "react";
import 'react-native-get-random-values';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  getFirestore,
  doc,
  getDoc,
} from "firebase/firestore";
import { GooglePlacesAutocomplete } from "react-native-google-places-autocomplete";
import app from "@/constants/firebaseConfig";
import { useAuth } from "@/constants/firebaseAuth";
import VirtualizedScrollView from "../VirtualizedScrollView";

const db = getFirestore(app);

const EventsScreen = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<"create" | "nearby">("create");

  const [title, setTitle] = useState("");
  const [destination, setDestination] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [location, setLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  const [nearbyEvents, setNearbyEvents] = useState<any[]>([]);
  const [loadingEvents, setLoadingEvents] = useState(false);
  const [userEvents, setUserEvents] = useState<any[]>([]);

  useEffect(() => {
    if (activeTab === "create") fetchUserEvents();
    if (activeTab === "nearby") fetchNearbyEvents();
  }, [activeTab]);

  const handleCreateEvent = async () => {
    if (!title || !description || !date || !time || !currentUser || !destination) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }
  
    try {
      // Add the event to the database
      await addDoc(collection(db, "Events"), {
        title,
        description,
        destination,
        date,
        time,
        location, // Store the location with latitude and longitude
        createdBy: currentUser.uid,
        createdByEmail: currentUser.email,
        isPublic: true,
        createdAt: new Date().toISOString(),
      });
  
      Alert.alert("Event Created", "Your event was successfully created.");
      setTitle("");
      setDestination("");
      setDescription("");
      setDate("");
      setTime("");
      fetchUserEvents(); // Re-fetch the user's events after creating the event
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };
  

  const fetchUserEvents = async () => {
    if (!currentUser) return;
    const snapshot = await getDocs(
      query(collection(db, "Events"), where("createdBy", "==", currentUser.uid))
    );
    const events = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUserEvents(events);
  };

  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const toRad = (value: number) => (value * Math.PI) / 180;
    const R = 3958.8; // Radius of Earth in miles
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const fetchNearbyEvents = async () => {
    if (!currentUser) return;
    setLoadingEvents(true);

    try {
      const userDocRef = doc(db, "All Users", currentUser.uid);
      const userSnapshot = await getDoc(userDocRef);
      const userData = userSnapshot.data();

      if (!userData?.lastKnownLocation) {
        console.warn("No location stored for user");
        setLoadingEvents(false);
        return;
      }

      const { latitude, longitude } = userData.lastKnownLocation;

      const snapshot = await getDocs(collection(db, "Events"));
      const allEvents = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      const nearby = allEvents.filter((event: any) => {
        if (!event.location) return false;
        const distance = getDistance(
          latitude,
          longitude,
          event.location.latitude,
          event.location.longitude
        );
        return distance <= 5;
      });

      setNearbyEvents(nearby);
    } catch (error) {
      console.error("Error fetching nearby events:", error);
    }

    setLoadingEvents(false);
  };

  const renderCreateForm = () => (
    <VirtualizedScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      <Text style={styles.header}>🗕️ Create an Event</Text>
      <TextInput
        style={styles.input}
        placeholder="Event Title"
        placeholderTextColor="#888"
        value={title}
        onChangeText={setTitle}
      />

      <GooglePlacesAutocomplete
        placeholder="Search Destination"
        fetchDetails={true}
        onPress={(data, details = null) => {
          // Get latitude and longitude of the selected place
          const { lat, lng } = details?.geometry?.location || {};
          if (lat && lng) {
            setDestination(data.description);  // Set the destination name
            setLocation({ latitude: lat, longitude: lng }); // Set the location's coordinates
          }
        }}
        query={{
          key: "AIzaSyAZQHA9MXanW469_eE7BCGWs02gSqh2e-Y", // Your API Key
          language: "en",
        }}
        styles={{
          textInput: styles.input,
          listView: { backgroundColor: "#fff" },
        }}
      />

      <TextInput
        style={styles.input}
        placeholder="Description"
        placeholderTextColor="#888"
        value={description}
        onChangeText={setDescription}
      />
      <TextInput
        style={styles.input}
        placeholder="Date (e.g., 2025-04-15)"
        placeholderTextColor="#888"
        value={date}
        onChangeText={setDate}
      />
      <TextInput
        style={styles.input}
        placeholder="Time (e.g., 3:00 PM)"
        placeholderTextColor="#888"
        value={time}
        onChangeText={setTime}
      />
      <Button title="Create Event" onPress={handleCreateEvent} />

      <Text style={[styles.header, { marginTop: 30 }]}>📌 Your Events</Text>
      {userEvents.length === 0 ? (
        <Text style={{ color: "#666" }}>You haven't created any events yet.</Text>
      ) : (
        userEvents.map((item) => (
          <View key={item.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.destination}</Text>
            <Text>{item.date} at {item.time}</Text>
          </View>
        ))
      )}
    </VirtualizedScrollView>
  );

  const renderNearbyEvents = () => (
    <VirtualizedScrollView contentContainerStyle={styles.scrollContainer}>
      <Text style={styles.header}>📍 Nearby Events</Text>
      <Button title="Refresh Events" onPress={fetchNearbyEvents} />
      {loadingEvents ? (
        <Text>Loading nearby events...</Text>
      ) : nearbyEvents.length === 0 ? (
        <Text style={{ color: "#666" }}>No events found within 5 miles.</Text>
      ) : (
        nearbyEvents.map((item) => (
          <View key={item.id} style={styles.eventCard}>
            <Text style={styles.eventTitle}>{item.title}</Text>
            <Text>{item.description}</Text>
            <Text>{item.destination}</Text>
            <Text>{item.date} at {item.time}</Text>
            <Text style={{ fontStyle: "italic", color: "#555" }}>
              Created by: {item.createdByEmail || "Anonymous"}
            </Text>
          </View>
        ))
      )}
    </VirtualizedScrollView>
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

const styles = StyleSheet.create({
  scrollContainer: {
    padding: 20,
    paddingBottom: 60,
  },
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
    color: "#000",
    backgroundColor: "#fff",
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

export default EventsScreen;