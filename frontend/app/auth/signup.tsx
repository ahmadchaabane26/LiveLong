import React, { useRef, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "@/constants/firebaseAuth";
import { useRouter } from "expo-router";
import { getFirestore, doc, setDoc } from "firebase/firestore";
import app from "@/constants/firebaseConfig"; //  firebase app instance

export default function SignupScreen() {
  const db = getFirestore(app); // ✅ Make sure Firestore is initialized with the app
  const emailRef = useRef<string | null>(null);
  const passwordRef = useRef<string | null>(null);
  const { signup } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSignup() {
    if (!emailRef.current || !passwordRef.current) {
      return setError("Email and password are required.");
    }

    try {
      setError("");
      setLoading(true);

      const userCredential = await signup(emailRef.current, passwordRef.current);
      const user = userCredential.user;

      console.log("✅ Firebase signup success:", user.uid);

      // ✅ Save user info in Firestore under "All Users"
      await setDoc(doc(db, "All Users", user.uid), {
        email: user.email,
        createdAt: new Date().toISOString(),
        friends: [],  // Initialize friends as an empty array
      })
        .then(() => console.log("✅ Firestore: User added to 'All Users'"))
        .catch((err) => console.log("Firestore error:", err));
    } catch (err: any) {
      setError("Failed to create account: " + err.message);
      console.log("Signup error:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}
    >
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
        Create Account
      </Text>

      {error.length > 0 && (
        <Text style={{ color: "red", marginBottom: 10, textAlign: "center" }}>{error}</Text>
      )}

      <Text>Email</Text>
      <TextInput
        placeholder="Enter your email"
        keyboardType="email-address"
        autoCapitalize="none"
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        onChangeText={(text) => (emailRef.current = text)}
      />

      <Text>Password</Text>
      <TextInput
        placeholder="Enter your password"
        secureTextEntry
        style={{ borderWidth: 1, padding: 10, marginBottom: 10 }}
        onChangeText={(text) => (passwordRef.current = text)}
      />

      <Button
        title={loading ? "Signing Up..." : "Sign Up"}
        onPress={handleSignup}
        disabled={loading}
      />

      <TouchableOpacity onPress={() => router.push("/auth/login")} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center", color: "#facc15" }}>
          Already have an account? Log In
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
