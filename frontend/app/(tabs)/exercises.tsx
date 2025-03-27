import React, { useState } from "react";
import { ScrollView, View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from "react-native";

export default function ExercisesScreen() {
  const [workoutFocus, setWorkoutFocus] = useState("");
  const [mentalFocus, setMentalFocus] = useState("");
  const [suggestedWorkout, setSuggestedWorkout] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showMentalSection, setShowMentalSection] = useState(false);

  const workoutOptions = ["Arms", "Legs", "Chest", "Back", "Full Body", "Cardio"];
  const mentalOptions = ["Stress Relief", "Anxiety", "Focus", "Mindfulness", "Mood Boost"];

  const getWorkoutSuggestion = async () => {
    if (!workoutFocus && !mentalFocus) return;
    
    setLoading(true);
    setError("");
    setSuggestedWorkout(`Generating ${showMentalSection ? "mental wellness" : "workout"} suggestion...`);
    
    try {
      let prompt;
      if (showMentalSection) {
        prompt = `As a professional mental health and wellness coach, suggest a 15-20 minute mental wellness routine for someone wanting to focus on ${mentalFocus.toLowerCase()}. 
        Include specific exercises or practices with brief instructions. Format as a bullet list.`;
      } else {
        prompt = `As a professional fitness trainer, suggest a 30-minute gym workout focusing on ${workoutFocus.toLowerCase()}. 
        Include 5-6 specific exercises with brief instructions. Format as a bullet list.`;
      }
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer sk-289b67a74f44419d9a4dd8d2ff5d1dd0',
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [{ role: "user", content: prompt }],
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'API request failed');
      }

      const data = await response.json();
      const suggestion = data.choices[0]?.message?.content;
      setSuggestedWorkout(suggestion || "Couldn't generate suggestion");
    } catch (error: any) {
      console.error("API Error Details:", error);
      setError(error.message || 'An unknown error occurred');
      setSuggestedWorkout("Failed to fetch suggestion");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView 
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled" // Allows tapping buttons when keyboard is open
    >
      <Text style={styles.title}>🏋️ Gym & Mind AI</Text>
      
      <TouchableOpacity 
        onPress={() => setShowMentalSection(!showMentalSection)}
        style={styles.switchButton}
      >
        <Text style={{ color: "white" }}>
          {showMentalSection ? "Switch to Workout Mode" : "Switch to Mental Wellness Mode"}
        </Text>
      </TouchableOpacity>
      
      {!showMentalSection ? (
        <>
          <Text style={styles.sectionTitle}>What do you want to workout?</Text>
          <View style={styles.optionsContainer}>
            {workoutOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setWorkoutFocus(option);
                  setMentalFocus("");
                }}
                style={[
                  styles.optionButton,
                  { backgroundColor: workoutFocus === option ? "#4CAF50" : "#ccc" }
                ]}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Mental Wellness Focus:</Text>
          <View style={styles.optionsContainer}>
            {mentalOptions.map((option) => (
              <TouchableOpacity
                key={option}
                onPress={() => {
                  setMentalFocus(option);
                  setWorkoutFocus("");
                }}
                style={[
                  styles.optionButton,
                  { backgroundColor: mentalFocus === option ? "#4CAF50" : "#ccc" }
                ]}
              >
                <Text>{option}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
      
      <TouchableOpacity 
        onPress={getWorkoutSuggestion} 
        disabled={(!workoutFocus && !mentalFocus) || loading}
        style={[
          styles.actionButton,
          { backgroundColor: ((!workoutFocus && !mentalFocus) || loading) ? "#aaa" : "#007BFF" }
        ]}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={{ color: "white" }}>
            {showMentalSection ? "Get Mental Wellness Tips" : "Get Workout Plan"}
          </Text>
        )}
      </TouchableOpacity>
      
      {error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : null}
      
      {suggestedWorkout ? (
        <View style={styles.suggestionContainer}>
          <Text style={styles.suggestionTitle}>
            {showMentalSection ? "Mental Wellness Suggestions:" : "Suggested Workout:"}
          </Text>
          <Text>{suggestedWorkout}</Text>
        </View>
      ) : null}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center"
  },
  switchButton: {
    backgroundColor: "#6c5ce7",
    padding: 10,
    borderRadius: 10,
    marginBottom: 20,
    alignItems: 'center'
  },
  sectionTitle: {
    marginBottom: 10
  },
  optionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 20
  },
  optionButton: {
    margin: 5,
    padding: 10,
    borderRadius: 10
  },
  actionButton: {
    padding: 10,
    borderRadius: 10,
    minWidth: 150,
    alignItems: 'center',
    alignSelf: 'center'
  },
  errorText: {
    color: 'red',
    marginTop: 10,
    textAlign: 'center'
  },
  suggestionContainer: {
    marginTop: 20,
    padding: 10
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 5
  }
});