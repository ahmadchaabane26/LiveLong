import React, { useRef, useState } from "react";
import { View, Text, TextInput, Button, Alert, ScrollView, TouchableOpacity } from "react-native";
import { useAuth } from "@/constants/firebaseAuth";
import { useRouter } from "expo-router";

export default function LoginScreen() {
  const emailRef = useRef<string | null>(null);
  const passwordRef = useRef<string | null>(null);
  const { login } = useAuth();
  const router = useRouter();

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!emailRef.current || !passwordRef.current) {
      return setError("Email and password are required.");
    }

    try {
      setError("");
      setLoading(true);

      await login(emailRef.current, passwordRef.current);

    } catch (err: any) {
      setError("Login failed: " + err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: "center", padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: "bold", textAlign: "center", marginBottom: 20 }}>
        Log In
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

      <Button title={loading ? "Logging in..." : "Log In"} onPress={handleLogin} disabled={loading} />

      <TouchableOpacity onPress={() => router.push("/auth/signup")} style={{ marginTop: 20 }}>
        <Text style={{ textAlign: "center", color: "#facc15" }}>
          Don’t have an account? Sign Up
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}
