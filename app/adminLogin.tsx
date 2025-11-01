import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleLogin = () => {
    if (email === "admin@schedly.com" && password === "admin123") {
      router.push("/adminDashboard");
    } else {
      Alert.alert("Access Denied", "Invalid admin credentials");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Admin Login 🔐</Text>

      <TextInput
        style={styles.input}
        placeholder="Admin Email"
        placeholderTextColor="#B794F4"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#B794F4"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.switchButton}
        onPress={() => router.push("/index")}
      >
        <Text style={styles.switchText}>Login as Customer</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#6B46C1",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  title: {
    color: "#fff",
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 14,
    color: "#6B46C1",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 60,
    borderRadius: 999,
    marginTop: 10,
  },
  buttonText: {
    color: "#6B46C1",
    fontWeight: "700",
  },
  switchButton: {
    marginTop: 20,
  },
  switchText: {
    color: "#E9D8FD",
    textDecorationLine: "underline",
  },
});
