import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
} from "react-native";
import { format, startOfWeek } from "date-fns";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
import { useAuth } from "@/constants/firebaseAuth";
import app from "@/constants/firebaseConfig";

const db = getFirestore(app);

const dailyQuestions = [
  "What made you smile today?",
  "What challenge did you overcome today?",
  "Who are you thankful for today?",
];

const dailyExercises = [
  "List 3 things you're grateful for",
  "Do a 2-minute breathing exercise",
  "Write a compliment to yourself",
];

const randomFrom = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];

export default function Questions() {
  const { currentUser } = useAuth();
  const todayKey = format(new Date(), "yyyy-MM-dd");
  const weekkey = format(new Date(), "yyyy-MM")
  const weekKey = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "yyyy-MM-dd");

  const [weeklyGoals, setWeeklyGoals] = useState<string[]>([]);
  const [dailyGoals, setDailyGoals] = useState([
    { task: "Drink water", done: false },
    { task: "Go outside", done: false },
  ]);
  const [spiritualWin, setSpiritualWin] = useState("");
  const [mentalWin, setMentalWin] = useState("");
  const [physicalWin, setPhysicalWin] = useState("");
  const [entry, setEntry] = useState("");
  const [answer, setAnswer] = useState("");
  const [exerciseCompleted, setExerciseCompleted] = useState(false);
  const [dailyQuestion, setDailyQuestion] = useState("");
  const [dailyExercise, setDailyExercise] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) return;

    const fetchData = async () => {
      const journalRef = doc(db, "All Users", currentUser.uid, "journal", todayKey);
      const weeklyRef = doc(db, "All Users", currentUser.uid, "journal", weekkey);

      const [journalSnap, weeklySnap] = await Promise.all([
        getDoc(journalRef),
        getDoc(weeklyRef),
      ]);

      if (journalSnap.exists()) {
        const data = journalSnap.data();
        setEntry(data.entry || "");
        setAnswer(data.answer || "");
        setDailyGoals(data.checklist || []);
        setExerciseCompleted(data.dailyExercise?.completed || false);
        setSpiritualWin(data.spiritualWin || "");
        setMentalWin(data.mentalWin || "");
        setPhysicalWin(data.physicalWin || "");
        setDailyQuestion(data.question || randomFrom(dailyQuestions));
        setDailyExercise(data.dailyExercise?.name || randomFrom(dailyExercises));
      } else {
        setDailyQuestion(randomFrom(dailyQuestions));
        setDailyExercise(randomFrom(dailyExercises));
      }

      if (weeklySnap.exists()) {
        setWeeklyGoals(weeklySnap.data().goals || []);
      }

      setLoading(false);
    };

    fetchData();
  }, [currentUser]);

  const toggleChecklistItem = (index: number) => {
    const updated = [...dailyGoals];
    updated[index].done = !updated[index].done;
    setDailyGoals(updated);
  };

  const handleSave = async () => {
    if (!currentUser) return;

    try {
      await Promise.all([
        // Save journal under todayKey
        setDoc(doc(db, "All Users", currentUser.uid, "journal", todayKey), {
          entry,
          checklist: dailyGoals,
          question: dailyQuestion,
          answer,
          dailyExercise: {
            name: dailyExercise,
            completed: exerciseCompleted,
          },
          spiritualWin,
          mentalWin,
          physicalWin,
          createdAt: new Date().toISOString(),
        }),
        // Save weekly goals in a separate collection
        setDoc(doc(db, "All Users", currentUser.uid, "journal", weekkey), {
          goals: weeklyGoals,
          updatedAt: new Date().toISOString(),
        }),
      ]);

      Alert.alert("Saved", "Journal and weekly goals saved!");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading journal...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.header}>🌟 Weekly Goals</Text>
      
      {weeklyGoals.map((goal, index) => (
        <View key={index} style={styles.goalItem}>
            <TextInput
            value={goal}
            onChangeText={(text) => {
                const updated = [...weeklyGoals];
                updated[index] = text;
                setWeeklyGoals(updated);
            }}
            placeholder={`Goal ${index + 1}`}
            style={styles.goalInput}
            />
            <TouchableOpacity
            onPress={() => {
                const updated = [...weeklyGoals];
                updated.splice(index, 1);
                setWeeklyGoals(updated);
            }}
            >
            <Text style={styles.deleteButton}>❌</Text>
            </TouchableOpacity>
        </View>
        ))}
        <Button
        title="Add Weekly Goal"
        onPress={() => setWeeklyGoals([...weeklyGoals, ""])}
        />
      <Text style={styles.header}>✅ Today's Checklist</Text>
      {dailyGoals.map((item, index) => (
        <View key={index} style={styles.checkItem}>
            <TouchableOpacity onPress={() => toggleChecklistItem(index)}>
            <Text style={[styles.checkText, item.done && styles.checked]}>
                {item.done ? "☑️" : "⬜️"}
            </Text>
            </TouchableOpacity>
            <TextInput
            style={styles.checkInput}
            value={item.task}
            placeholder={`Item ${index + 1}`}
            onChangeText={(text) => {
                const updated = [...dailyGoals];
                updated[index].task = text;
                setDailyGoals(updated);
            }}
            />
            <TouchableOpacity
            onPress={() => {
                const updated = [...dailyGoals];
                updated.splice(index, 1);
                setDailyGoals(updated);
            }}
            >
            <Text style={styles.deleteButton}>❌</Text>
            </TouchableOpacity>
        </View>
        ))}
        <Button
        title="Add Checklist Item"
        onPress={() => setDailyGoals([...dailyGoals, { task: "", done: false }])}
        />

      <View style={styles.winsContainer}>
        <Text style={styles.subHeader}>🌈 Wins of the Day</Text>

        <Text style={styles.label}>🧘‍♀️ Spiritual Win</Text>
        <TextInput
          placeholder="Spiritual win"
          value={spiritualWin}
          onChangeText={setSpiritualWin}
          style={styles.input}
        />

        <Text style={styles.label}>🧠 Mental Win</Text>
        <TextInput
          placeholder="Mental win"
          value={mentalWin}
          onChangeText={setMentalWin}
          style={styles.input}
        />

        <Text style={styles.label}>💪 Physical Win</Text>
        <TextInput
          placeholder="Physical win"
          value={physicalWin}
          onChangeText={setPhysicalWin}
          style={styles.input}
        />
      </View>

      <Text style={styles.header}> Daily Question: {dailyQuestion}</Text>
      <TextInput
        placeholder="Your answer"
        value={answer}
        onChangeText={setAnswer}
        style={styles.input}
      />

      <Text style={styles.header}>💪 Daily Exercise</Text>
      <TouchableOpacity
        onPress={() => setExerciseCompleted(!exerciseCompleted)}
        style={styles.exerciseBox}
      >
        <Text style={styles.exerciseText}>
          {exerciseCompleted ? "✅" : "⬜️"} {dailyExercise}
        </Text>
      </TouchableOpacity>

      <Text style={styles.header}>📔 Journal Entry</Text>
      <TextInput
        placeholder="Write anything you'd like to reflect on..."
        value={entry}
        onChangeText={setEntry}
        style={styles.input}
        multiline
      />

      <Button title="Save Journal" onPress={handleSave} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, paddingTop: 40 },
  header: { fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
    minHeight: 40,
    marginBottom: 10,
  },
  checkItem: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  checkText: { fontSize: 20, marginRight: 10 },
  checked: { textDecorationLine: "line-through", color: "gray" },
  checkInput: {
    flex: 1,
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
    paddingVertical: 4,
  },
  exerciseBox: {
    marginVertical: 10,
    padding: 12,
    borderRadius: 10,
    backgroundColor: "#f8f8f8",
  },
  exerciseText: { fontSize: 16 },
  winsContainer: {
    backgroundColor: "#f0f8ff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 20,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  label: {
    marginTop: 10,
    marginBottom: 4,
    fontWeight: "500",
  },
  goalItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 10,
  },
  deleteButton: {
    fontSize: 18,
    marginLeft: 8,
    color: "#d9534f",
  },
});
