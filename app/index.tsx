import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";

export default function IndexScreen() {
  const router = useRouter();
  const pathname = usePathname();

  // Detect if currently in admin login route
  const isAdmin = pathname === "/adminLogin";

  return (
    <View style={styles.container}>
      {/* Top-right toggle button */}
      <TouchableOpacity
        style={styles.topButton}
        onPress={() =>
          router.push(isAdmin ? "/login" : "/adminLogin")
        }
      >
        <Text style={styles.topButtonText}>
          {isAdmin ? "Customer" : "Admin"}
        </Text>
      </TouchableOpacity>

      {/* App intro */}
      <Text style={styles.title}>💇‍♀️ Welcome to Schedify!</Text>
      <Text style={styles.subtitle}>Book your favorite salon anytime.</Text>

      {/* Main button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Get Started</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#6B46C1",
  },
  topButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "#fff",
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 999,
    elevation: 3,
  },
  topButtonText: {
    color: "#6B46C1",
    fontWeight: "700",
    fontSize: 14,
  },
  title: {
    fontSize: 26,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  subtitle: {
    color: "#E9D8FD",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 999,
  },
  buttonText: {
    color: "#6B46C1",
    fontWeight: "bold",
  },
});
