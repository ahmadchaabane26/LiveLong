import React, { useState, useEffect } from "react";
import 'react-native-get-random-values';
import {
  View,
  Text,
  Button,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useAuth } from "@/constants/firebaseAuth";
import { getFirestore, collection, query, where, getDocs, doc, getDoc, setDoc, updateDoc, deleteDoc } from "firebase/firestore";
import app from "@/constants/firebaseConfig";

export default function FriendsPage() {
  const { currentUser } = useAuth();
  const router = useRouter();
  const firestore = getFirestore(app); // Initialize Firestore

  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [friends, setFriends] = useState<any[]>([]);
  const [addFriendEmail, setAddFriendEmail] = useState("");
  const [showAddFriendModal, setShowAddFriendModal] = useState(false);

  // Fetch Pending Friend Requests
  // Fetch pending friend requests
  const fetchPendingRequests = async () => {
    if (!currentUser) return;

    try {
      const pendingRef = collection(firestore, "users", currentUser.uid, "pendingRequests");
      const querySnapshot = await getDocs(pendingRef);
      
      const requests = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const senderId = docSnapshot.id;
          const senderDoc = await getDoc(doc(firestore, "All Users", senderId));
          return {
            id: senderId,
            email: senderDoc.data()?.email || "Unknown",
          };
        })
      );

      setPendingRequests(requests);
    } catch (error) {
      console.error("Error fetching pending requests:", error);
    }
  };

  // Fetch friends list
  const fetchFriends = async () => {
    if (!currentUser) return;

    try {
      const friendsRef = collection(firestore, "users", currentUser.uid, "friends");
      const querySnapshot = await getDocs(friendsRef);

      const friendsList = await Promise.all(
        querySnapshot.docs.map(async (docSnapshot) => {
          const friendId = docSnapshot.id;
          const friendDoc = await getDoc(doc(firestore, "All Users", friendId));
          return {
            id: friendId,
            email: friendDoc.data()?.email || "Unknown",
          };
        })
      );

      setFriends(friendsList);
    } catch (error) {
      console.error("Error fetching friends:", error);
    }
  };

  // Send friend request
  const handleSendFriendRequest = async () => {
    if (!currentUser || !addFriendEmail) return;

    try {
      const normalizedEmail = addFriendEmail.trim().toLowerCase();

      // Query Firestore for the user by email
      const userRef = collection(firestore, "All Users");
      const q = query(userRef, where("email", "==", normalizedEmail));
      const querySnapshot = await getDocs(q);


      if (querySnapshot.empty) {
        Alert.alert("Error", "User not found");
        return;
      }

      const receiverDoc = querySnapshot.docs[0];
      const receiverId = receiverDoc.id;

      // Check if request already exists
      const existingRequest = await getDoc(
        doc(firestore, "users", receiverId, "pendingRequests", currentUser.uid)
      );

      if (existingRequest.exists()) {
        Alert.alert("Error", "Request already sent");
        return;
      }

      // Create request
      await setDoc(
        doc(firestore, "users", receiverId, "pendingRequests", currentUser.uid),
        { createdAt: new Date() }
      );

      Alert.alert("Success", "Friend request sent");
      setShowAddFriendModal(false);
    } catch (error) {
      console.error("Error sending request:", error);
      Alert.alert("Error", "Failed to send request");
    }
  };

  // Accept friend request
  const handleAcceptRequest = async (senderId: string) => {
    if (!currentUser) return;

    try {
      // Remove from pending requests
      await deleteDoc(
        doc(firestore, "users", currentUser.uid, "pendingRequests", senderId)
      );

      // Add to friends list for both users
      await setDoc(
        doc(firestore, "users", currentUser.uid, "friends", senderId),
        { since: new Date() }
      );
      await setDoc(
        doc(firestore, "users", senderId, "friends", currentUser.uid),
        { since: new Date() }
      );

      fetchPendingRequests();
      fetchFriends();
    } catch (error) {
      console.error("Error accepting request:", error);
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (senderId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(
        doc(firestore, "users", currentUser.uid, "pendingRequests", senderId)
      );
      fetchPendingRequests();
    } catch (error) {
      console.error("Error declining request:", error);
    }
  };

  // Remove friend
  const handleRemoveFriend = async (friendId: string) => {
    if (!currentUser) return;

    try {
      await deleteDoc(
        doc(firestore, "users", currentUser.uid, "friends", friendId)
      );
      await deleteDoc(
        doc(firestore, "users", friendId, "friends", currentUser.uid)
      );
      fetchFriends();
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };


  useEffect(() => {
    if (currentUser) {
      fetchPendingRequests();
      fetchFriends();
    }
  }, [currentUser]);

  return (
    <View style={styles.container}>
      <View style={styles.modal}>
        <TouchableOpacity onPress={() => router.back()} style={styles.closeButton}>
          <Ionicons name="close" size={28} color="#333" />
        </TouchableOpacity>

        <Text style={styles.title}>Friends</Text>

        {/* Add Friend Button in the Top Right */}
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddFriendModal(true)}
        >
          <Ionicons name="person-add" size={28} color="#333" />
        </TouchableOpacity>

        {/* Pending Friend Requests Section */}
        <Text style={styles.subtitle}>Pending Friend Requests:</Text>
        {pendingRequests.length > 0 ? (
          pendingRequests.map((request) => (
            <View key={request.id} style={styles.friendRequest}>
              <Text style={styles.userDetail}>Email: {request.email}</Text>
              <View style={styles.buttonRow}>
                <Button title="Accept" onPress={() => handleAcceptRequest(request.id)} color="#4CAF50" />
                <Button title="Decline" onPress={() => handleDeclineRequest(request.id)} color="#FF5722" />
              </View>
            </View>
          ))
        ) : (
          <Text>No pending friend requests.</Text>
        )}

        {/* Friends List Section */}
        <Text style={styles.subtitle}>Friends:</Text>
        {friends.length > 0 ? (
          friends.map((friend) => (
            <View key={friend.id} style={styles.friend}>
              <Text style={styles.userDetail}>Email: {friend.email}</Text>
              <Button title="Remove Friend" onPress={() => handleRemoveFriend(friend.id)} color="#2196F3" />
            </View>
          ))
        ) : (
          <Text>No friends added yet.</Text>
        )}
      </View>

      {/* Add Friend Modal */}
      <Modal
        visible={showAddFriendModal}
        onRequestClose={() => setShowAddFriendModal(false)}
        animationType="slide"
        transparent={true}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add a Friend</Text>
            <TextInput
              value={addFriendEmail}
              onChangeText={setAddFriendEmail}
              placeholder="Enter friend's email"
              keyboardType="email-address"
              style={styles.input}
            />
            <Button title="Send Friend Request" onPress={handleSendFriendRequest} color="#4CAF50" />
            <Button title="Cancel" onPress={() => setShowAddFriendModal(false)} color="#FF5722" />
          </View>
        </View>
      </Modal>
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
  addButton: {
    position: "absolute",
    top: 20,
    right: 60,
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
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 20,
  },
  friendRequest: {
    marginBottom: 15,
  },
  userDetail: {
    fontSize: 16,
    marginBottom: 10,
    color: "#333",
  },
  friend: {
    marginBottom: 15,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalContent: {
    width: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 24,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    padding: 12,
    borderWidth: 1,
    borderColor: "#ccc",
    marginBottom: 15,
    borderRadius: 8,
    fontSize: 16,
  },
});
