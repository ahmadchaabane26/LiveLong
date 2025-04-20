import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, Alert } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc } from "firebase/firestore";
import { useAuth } from "@/constants/firebaseAuth";
import app from "@/constants/firebaseConfig";
import { format, addDays } from "date-fns";  // Import addDays from date-fns
import { useRouter } from "expo-router";

const db = getFirestore(app);

const Journal = () => {
  const { currentUser } = useAuth();
  const [journalEntries, setJournalEntries] = useState<any[]>([]);
  const [selectedEntry, setSelectedEntry] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Fetch all journal entries
  useEffect(() => {
    if (!currentUser) return;

    const fetchJournalEntries = async () => {
      try {
        const journalRef = collection(db, "All Users", currentUser.uid, "journal");
        const snapshot = await getDocs(journalRef);
        const entries = snapshot.docs.map((doc) => ({
          id: doc.id,
          date: doc.id, // Using document ID as the date
          entryData: doc.data(),
        }));
        setJournalEntries(entries);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching journal entries:", error);
        setLoading(false);
        Alert.alert("Error", "There was an issue loading your journal entries.");
      }
    };

    fetchJournalEntries();
  }, [currentUser]);

  const viewEntryDetails = (date: string) => {
    // Find the selected entry
    const entry = journalEntries.find((entry) => entry.date === date);
    setSelectedEntry(entry);
  };

  const handleBack = () => {
    router.back(); // Go back to the previous screen
  };

  // Add a day to the date before displaying it
  const adjustDate = (date: string) => {
    const originalDate = new Date(date);
    const adjustedDate = addDays(originalDate, 1);  // Adding 1 day to fix the date issue
    return format(adjustedDate, "MMMM dd, yyyy");  // Format the adjusted date
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading journal entries...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {selectedEntry ? (
        <View style={styles.entryDetails}>
          <Text style={styles.header}>Journal for {selectedEntry.date}</Text>
          <Text style={styles.subHeader}>Entry:</Text>
          <Text>{selectedEntry.entryData.entry}</Text>
          <Text style={styles.subHeader}>Daily Question Answer:</Text>
          <Text>{selectedEntry.entryData.answer}</Text>

          {/* Daily Goals */}
          <Text style={styles.subHeader}>Daily Goals:</Text>
          {selectedEntry.entryData.checklist?.map((goal: any, index: number) => (
            <Text key={index}>- {goal.task} {goal.done ? "✔️" : "❌"}</Text>
          ))}

          {/* Daily Exercise */}
          <Text style={styles.subHeader}>Daily Exercise:</Text>
          <Text>{selectedEntry.entryData.dailyExercise?.name}</Text>

          {/* Wins */}
          <Text style={styles.subHeader}>🌈 Wins of the Day</Text>
          <Text>🧘‍♀️ Spiritual Win: {selectedEntry.entryData.spiritualWin}</Text>
          <Text>🧠 Mental Win: {selectedEntry.entryData.mentalWin}</Text>
          <Text>💪 Physical Win: {selectedEntry.entryData.physicalWin}</Text>

          <Button title="Back" onPress={handleBack} />
        </View>
      ) : (
        <ScrollView style={styles.entriesList}>
          <Text style={styles.header}>Your Journal Entries</Text>

          {/* Add back button */}
          <TouchableOpacity onPress={handleBack} style={styles.backButton}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>

          {journalEntries.map((entry) => (
            <TouchableOpacity
              key={entry.date}
              style={styles.entryItem}
              onPress={() => viewEntryDetails(entry.date)}
            >
              {/* Use the adjusted date */}
              <Text style={styles.entryDate}>
                {adjustDate(entry.date)} {/* Adjusted date */}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 40,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
  },
  entriesList: {
    marginTop: 20,
  },
  entryItem: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
    borderRadius: 10,
  },
  entryDate: {
    fontSize: 16,
    color: "#007BFF",
  },
  entryDetails: {
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 10,
    marginTop: 20,
  },
  backButton: {
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
    marginBottom: 20,
  },
  backText: {
    fontSize: 18,
    color: "#333",
  },
});

export default Journal;
