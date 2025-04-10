import React, { useState } from "react";
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
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/constants/firebaseAuth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import app from "@/constants/firebaseConfig"; 

export default function AddFriends() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const [friendEmail, setFriendEmail] = useState("");
  const [userToAdd, setUserToAdd] = useState<any>(null); // To store the user found by email

  const firestore = getFirestore(app); // Initialize Firestore

  // Handle Search Friend by Email
  const handleSearchFriend = async () => {
    if (!friendEmail) {
      Alert.alert("Error", "Please enter a valid email.");
      return;
    }
  
    try {
      // Normalize the email for case-insensitive search
      const normalizedEmail = friendEmail.trim().toLowerCase();
  
      // Reference to 'All Users' collection
      const userRef = collection(firestore, "All Users");
  
      // Query to find user by email
      const q = query(userRef, where("email", "==", normalizedEmail));
      const querySnapshot = await getDocs(q);
  
      // If no user is found, show alert
      if (querySnapshot.empty) {
        Alert.alert("User not found", `No user found with email: ${friendEmail}`);
        return;
      }
  
      // Assuming the first user found is the one to be added
      const userDoc = querySnapshot.docs[0]; // Access the first user found
      setUserToAdd(userDoc.data()); // Store the user data
      Alert.alert("User Found", `User: ${userDoc.data().email} found. You can now add them as a friend.`);
    } catch (error) {
      console.error("Error querying user:", error);  // Log the error for debugging
      Alert.alert("Error", "Something went wrong while searching for the user.");
    }
  };
  

  // Handle Adding Friend Logic
  const handleAddFriend = async (friendId: string) => {
    if (!currentUser) {
      Alert.alert("Error", "You need to be logged in to add friends.");
      return;
    }
  
    try {
      const userRef = doc(firestore, "users", currentUser.uid); // Reference to the current user's document
      const friendRef = doc(firestore, "users", friendId); // Reference to the friend's document
  
      // Get the current user's and friend's data
      const userSnapshot = await getDoc(userRef);
      const friendSnapshot = await getDoc(friendRef);
  
      const userData = userSnapshot.data();
      const friendData = friendSnapshot.data();
  
      // Ensure friends arrays are always initialized as empty arrays if undefined
      const userFriends = Array.isArray(userData?.friends) ? userData?.friends : [];
      const friendFriends = Array.isArray(friendData?.friends) ? friendData?.friends : [];
  
      // Check if the friend is already added
      if (userFriends.includes(friendId)) {
        Alert.alert("Error", "You are already friends with this user.");
        return;
      }
  
      // Add the friend to the user's friends array and vice versa
      await updateDoc(userRef, {
        friends: [...userFriends, friendId], // Add friendId to current user's friends array
      });
  
      await updateDoc(friendRef, {
        friends: [...friendFriends, currentUser.uid], // Add currentUser's UID to friend's friends array
      });
  
      Alert.alert("Friend Added", "You are now friends with this user.");
    } catch (err: any) {
      Alert.alert("Error", err.message);
    }
  };
  

  return (
    <View style={styles.container}>
        <View style={styles.modal}>
      <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
        <Ionicons name="close" size={28} color="#333" />
      </TouchableOpacity>

      <Text style={styles.title}>Add a Friend</Text>

      {/* Email Input */}
      <TextInput
        value={friendEmail}
        onChangeText={setFriendEmail}
        placeholder="Enter friend's email"
        keyboardType="email-address"
        style={styles.input}
      />
      <Button title="Search" onPress={handleSearchFriend} color="#4CAF50" />

      {userToAdd && (
        <View style={styles.userInfo}>
          <Text style={styles.userText}>User Found</Text>
          <Text style={styles.userDetail}>Email: {userToAdd.email}</Text>
          <Button
                title="Add Friend"
                onPress={() => handleAddFriend(userToAdd?.uid)}  // Pass the friendId using an arrow function
                color="#2196F3"
                />
        </View>
      )}
      </View>
    </View>
  );
}

// Styles for the page
const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f8f8",
  },
  closeButton: {
    position: "absolute",
    top: 20,
    right: 20,
  },
  modal: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  userInfo: {
    marginTop: 30,
    width: "100%",
    alignItems: "center",
    padding: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    backgroundColor: "#fff",
  },
  userText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4CAF50",
    marginBottom: 10,
  },
  userDetail: {
    fontSize: 16,
    marginBottom: 20,
    color: "#333",
  },
});
