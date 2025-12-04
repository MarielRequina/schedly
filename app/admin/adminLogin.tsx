import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 40,
        friction: 8,
        useNativeDriver: true,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 6,
        useNativeDriver: true,
      }),
    ]).start();

    // Floating animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const floatTranslate = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });

  const handleLogin = () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
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

    // Simulate login delay
    setTimeout(() => {
      if (email === "admin" && password === "admin123") {
        router.push("/admin/AdminDashboard");
      } else {
        Alert.alert("Access Denied", "Invalid admin credentials");
      }
      setIsLoading(false);
    }, 500);
  };

  return (
    <LinearGradient
      colors={['#F3E8FF', '#E9D5FF', '#DDD6FE']}
      style={styles.container}
    >
      {/* Decorative elements */}
      <View style={styles.decorativeCircle1} />
      <View style={styles.decorativeCircle2} />
      <View style={styles.decorativeCircle3} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.keyboardView}
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
          {/* Card Container */}
          <Animated.View 
            style={[
              styles.card,
              { transform: [{ translateY: floatTranslate }] }
            ]}
          >
            {/* Header */}
            <View style={styles.header}>
              <Animated.View 
                style={[
                  styles.iconContainer,
                  { transform: [{ scale: logoScale }] }
                ]}
              >
                <LinearGradient
                  colors={['#9333EA', '#7C3AED']}
                  style={styles.iconCircle}
                >
                  <Ionicons name="shield-checkmark" size={42} color="#FFFFFF" />
                </LinearGradient>
                <View style={styles.sparkle1}>
                  <Ionicons name="sparkles" size={18} color="#9333EA" />
                </View>
                <View style={styles.sparkle2}>
                  <Ionicons name="sparkles" size={14} color="#C084FC" />
                </View>
              </Animated.View>
              
              <Text style={styles.title}>Admin Portal</Text>
              <Text style={styles.subtitle}>Secure access for administrators</Text>
            </View>

            {/* Input fields */}
            <View style={styles.form}>
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="mail" size={14} color="#7C3AED" /> Email Address
                </Text>
                <View style={[styles.inputWrapper, emailFocused && styles.inputWrapperFocused]}>
                  <Ionicons name="person-outline" size={20} color="#9333EA" style={styles.inputIcon} />
                  <TextInput
                    placeholder="admin@schedify.com"
                    placeholderTextColor="rgba(139, 92, 246, 0.4)"
                    value={email}
                    onChangeText={setEmail}
                    onFocus={() => setEmailFocused(true)}
                    onBlur={() => setEmailFocused(false)}
                    style={styles.input}
                    autoCapitalize="none"
                    keyboardType="email-address"
                  />
                </View>
              </View>

              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>
                  <Ionicons name="lock-closed" size={14} color="#7C3AED" /> Password
                </Text>
                <View style={[styles.inputWrapper, passwordFocused && styles.inputWrapperFocused]}>
                  <Ionicons name="key-outline" size={20} color="#9333EA" style={styles.inputIcon} />
                  <TextInput
                    placeholder="Enter your password"
                    placeholderTextColor="rgba(139, 92, 246, 0.4)"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                    onFocus={() => setPasswordFocused(true)}
                    onBlur={() => setPasswordFocused(false)}
                    style={styles.input}
                    autoCapitalize="none"
                  />
                </View>
              </View>

              {/* Login button */}
              <Animated.View style={{ transform: [{ scale: buttonScale }] }}>
                <TouchableOpacity 
                  style={[styles.button, isLoading && styles.buttonDisabled]} 
                  onPress={handleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <LinearGradient
                    colors={['#9333EA', '#7C3AED']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.buttonGradient}
                  >
                    {isLoading ? (
                      <Text style={styles.buttonText}>Verifying...</Text>
                    ) : (
                      <>
                        <Text style={styles.buttonText}>Access Portal</Text>
                        <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>

              {/* Info box */}
              <View style={styles.infoBox}>
                <Ionicons name="information-circle" size={16} color="#7C3AED" />
                <Text style={styles.infoText}>
                  For security purposes, please use authorized credentials
                </Text>
              </View>
            </View>
          </Animated.View>

          {/* Back button */}
          <TouchableOpacity 
            onPress={() => router.push("/")} 
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={18} color="#7C3AED" />
            <Text style={styles.backText}>Back to Home</Text>
          </TouchableOpacity>
        </Animated.View>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(147, 51, 234, 0.1)',
    top: -80,
    right: -60,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(192, 132, 252, 0.15)',
    bottom: -50,
    left: -40,
  },
  decorativeCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    top: '40%',
    left: -30,
  },
  keyboardView: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  card: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 24,
    padding: 32,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  iconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 6,
    borderWidth: 4,
    borderColor: '#FFFFFF',
  },
  sparkle1: {
    position: 'absolute',
    top: -5,
    right: -5,
  },
  sparkle2: {
    position: 'absolute',
    bottom: 5,
    left: -5,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#6B21A8",
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  subtitle: {
    fontSize: 14,
    color: "#7C3AED",
    textAlign: "center",
    opacity: 0.8,
  },
  form: {
    width: "100%",
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    color: "#6B21A8",
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: "#F9FAFB",
    borderWidth: 2,
    borderColor: "#E9D5FF",
    borderRadius: 14,
    paddingHorizontal: 14,
    shadowColor: '#9333EA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    // Removed invalid transition property
  },
  inputWrapperFocused: {
    borderColor: "#9333EA",
    backgroundColor: "#FFFFFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 3,
  },
  inputIcon: {
    marginRight: 10,
  },
  input: {
    flex: 1,
    padding: 14,
    color: "#6B21A8",
    fontSize: 15,
  },
  button: {
    borderRadius: 14,
    marginTop: 8,
    marginBottom: 20,
    overflow: 'hidden',
    shadowColor: "#6B21A8",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "bold",
    fontSize: 17,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(147, 51, 234, 0.08)',
    padding: 12,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#9333EA',
  },
  infoText: {
    flex: 1,
    color: "#7C3AED",
    fontSize: 12,
    lineHeight: 16,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 24,
    paddingVertical: 12,
    paddingHorizontal: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(192, 132, 252, 0.3)',
  },
  backText: {
    color: "#7C3AED",
    fontSize: 15,
    fontWeight: "600",
  },
});