import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Alert, Animated, KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

export default function Signup() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSignup = async () => {
    if (!name || !email || !password) {
      Alert.alert("Missing Fields", "Please fill in all fields.");
      return;
    }

    if (password.length < 6) {
      Alert.alert("Weak Password", "Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);
    
    // Button press animation
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const userCredential = await createUserWithEmailAndPassword(Authentication, email, password);
      await setDoc(doc(database, "users", userCredential.user.uid), { 
        name, 
        email,
        createdAt: new Date().toISOString()
      });
      Alert.alert("Success", "Account created successfully!", [
        { text: "OK", onPress: () => router.push("/login") }
      ]);
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use") {
        Alert.alert("Error", "This email is already registered.");
      } else if (error.code === "auth/invalid-email") {
        Alert.alert("Error", "Please enter a valid email address.");
      } else if (error.code === "auth/weak-password") {
        Alert.alert("Error", "Password should be at least 6 characters.");
      } else {
        Alert.alert("Error", error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LinearGradient
      colors={['#1a0033', '#2d1b4e', '#1a0033']}
      style={styles.container}
    >
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.content,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }]
              }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.iconCircle}>
                <Text style={styles.icon}>✨</Text>
              </View>
              <Text style={styles.title}>Join Schedify</Text>
              <Text style={styles.subtitle}>Create your account to get started</Text>
            </View>

            {/* Input fields */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Full Name</Text>
                <TextInput
                  placeholder="Enter your full name"
                  placeholderTextColor="rgba(255, 255, 204, 0.4)"
                  value={name}
                  onChangeText={setName}
                  style={styles.input}
                  autoCapitalize="words"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Email</Text>
                <TextInput
                  placeholder="Enter your email"
                  placeholderTextColor="rgba(255, 255, 204, 0.4)"
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Password</Text>
                <TextInput
                  placeholder="Create a password (min 6 characters)"
                  placeholderTextColor="rgba(255, 255, 204, 0.4)"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>

              {/* Signup button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]} 
                  onPress={handleSignup}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <Text style={styles.buttonText}>
                    {isLoading ? "Creating Account..." : "Sign Up"}
                  </Text>
                </TouchableOpacity>
              </Animated.View>

              {/* Login link */}
              <TouchableOpacity onPress={() => router.push("/login")}>
                <Text style={styles.link}>
                  Already have an account? <Text style={styles.linkBold}>Login</Text>
                </Text>
              </TouchableOpacity>
            </View>

            {/* Back button */}
            <TouchableOpacity 
              onPress={() => router.push("/")} 
              style={styles.backButton}
            >
              <Text style={styles.backText}>← Back to Home</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  icon: {
    fontSize: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#ffffcc",
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 15,
    color: "rgba(255, 255, 204, 0.7)",
    textAlign: "center",
  },
  form: {
    width: "100%",
    maxWidth: 400,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#ffffcc",
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginLeft: 4,
  },
  input: {
    width: "100%",
    backgroundColor: "rgba(139, 92, 246, 0.15)",
    borderWidth: 1,
    borderColor: "#8b5cf6",
    padding: 15,
    borderRadius: 12,
    color: "#ffffcc",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#ffffcc",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
    shadowColor: "#8b5cf6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#2d1b4e",
    fontWeight: "bold",
    fontSize: 18,
  },
  link: {
    textAlign: "center",
    color: "rgba(255, 255, 204, 0.8)",
    fontSize: 15,
  },
  linkBold: {
    fontWeight: "bold",
    color: "#ffffcc",
  },
  backButton: {
    marginTop: 20,
    paddingVertical: 10,
  },
  backText: {
    color: "rgba(255, 255, 204, 0.7)",
    fontSize: 15,
    textAlign: "center",
  },
});