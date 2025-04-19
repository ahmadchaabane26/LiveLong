import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, Button, ScrollView, TouchableOpacity, TextInput } from "react-native";
import { getFirestore, collection, getDocs, doc, getDoc, setDoc } from "firebase/firestore";
import { useAuth } from "@/constants/firebaseAuth";
import app from "@/constants/firebaseConfig";
import { format } from "date-fns";


const db = getFirestore(app);

// Define the Mood type to restrict possible values
type Mood = "Energetic" | "Tired" | "Sick";

const index = () => {
  const { currentUser } = useAuth();  // Ensure this correctly gets the user
  const [friendsList, setFriendsList] = useState<any[]>([]); // Correctly initializing friendsList state
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [mood, setMood] = useState<Mood>("Energetic"); // Default mood
  const [loading, setLoading] = useState(true);

  // States for goals
  const [dailyGoals, setDailyGoals] = useState<any[]>([]); // Daily goals state
  const [weeklyGoals, setWeeklyGoals] = useState<any[]>([]); // Weekly goals state

  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser) {
        console.log('User is not logged in');
        return;
      }

      const friendsRef = collection(db, "All Users", currentUser.uid, "friends");
      const querySnapshot = await getDocs(friendsRef);
      const friendsListData = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const friendId = docSnapshot.id;
          const friendDoc = await getDoc(doc(db, "All Users", friendId));
          return {
            id: friendId,
            email: friendDoc.data()?.email || "Unknown",
            mood: friendDoc.data()?.mood || "Unknown", // Ensure mood is in Firestore document
          };
        })
      );
      setFriendsList(friendsListData);

      // Fetch journal data to get daily and weekly goals
      const todayKey = format(new Date(), "yyyy-MM-dd");
      const weekkey = format(new Date(), "yyyy-MM");
      const journalRef = doc(db, "All Users", currentUser.uid, "journal", todayKey);
      const weeklyRef = doc(db, "All Users", currentUser.uid, "journal", weekkey);
  
      const [journalSnap, weeklySnap] = await Promise.all([
        getDoc(journalRef),
        getDoc(weeklyRef),
      ]);
  
      if (journalSnap.exists()) {
        setDailyGoals(journalSnap.data().checklist || []);
      }
  
      if (weeklySnap.exists()) {
        setWeeklyGoals(weeklySnap.data().goals || []);
      }
      
      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const updateMood = async (newMood: Mood) => {
    if (!currentUser) {
      console.log('User is not logged in');
      return;
    }
    setMood(newMood);  // Update mood in state
    await setDoc(doc(db, "All Users", currentUser.uid), { mood: newMood }, { merge: true });
  };

  // UI to update daily goal state
  const toggleDailyGoal = (index: number) => {
    const updatedGoals = [...dailyGoals];
    updatedGoals[index].done = !updatedGoals[index].done;
    setDailyGoals(updatedGoals);
  };
  // Find the user's rank in the leaderboard
  const getUserRank = () => {
    const userRank = leaderboard.findIndex(user => user.userId === currentUser?.uid) + 1;  // Find index of user and add 1 to get rank
    if (userRank > 0) {
      return `You are in ${userRank} place`;  // Rank found
    } else {
      return "You are not on the leaderboard yet";  // Rank not found
    }
  };
  return (
    <View style={{ flex: 1, paddingTop: 40 }}>
      <Text style={styles.header}>How are you feeling today?</Text>
      <View style={styles.moodSelector}>
        <TouchableOpacity onPress={() => updateMood("Energetic")}>
          <Text>Energetic</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => updateMood("Tired")}>
          <Text>Tired</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => updateMood("Sick")}>
          <Text>Sick</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.subHeader}>Your Friends' Moods</Text>
      <ScrollView>
        {friendsList.map((friend) => (
          <View key={friend.id} style={styles.friendCard}>
            <Text>{friend.email}</Text>
            <Text>{friend.mood}</Text>
          </View>
        ))}
      </ScrollView>

      <Text style={styles.subHeader}>Your Goals</Text>

      {/* Display Weekly Goals */}
      <Text style={styles.subHeader}>🌟 Weekly Goals</Text>
      <ScrollView>
        {weeklyGoals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <Text>{goal}</Text>
          </View>
        ))}
      </ScrollView>

      {/* Display Daily Goals */}
      <Text style={styles.subHeader}>✅ Today's Checklist</Text>
      <ScrollView>
        {dailyGoals.map((goal, index) => (
          <View key={index} style={styles.goalItem}>
            <TouchableOpacity onPress={() => toggleDailyGoal(index)}>
            </TouchableOpacity>
            <Text>{goal.task}</Text>
          </View>
        ))}
      </ScrollView>

              {/* Display User's Rank in Leaderboard */}
      <Text style={styles.subHeader}>{getUserRank()}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
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
    marginLeft: 10,
  },
  moodSelector: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  friendCard: {
    padding: 10,
    backgroundColor: "#f9f9f9",
    marginBottom: 10,
    borderRadius: 10,
  },
  goalItem: {
    padding: 10,
    backgroundColor: "#f8f8f8",
    marginBottom: 10,
    borderRadius: 10,
  },
  checkText: {
    fontSize: 20,
    marginRight: 10,
  },
  checked: {
    textDecorationLine: "line-through",
    color: "gray",
  },
});

export default index;
