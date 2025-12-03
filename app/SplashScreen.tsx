// SplashScreen.tsx
import React, { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";

export default function SplashScreen() {
  const bounceAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -15,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.logoContainer, { transform: [{ translateY: bounceAnim }] }]}>
        <Image
          source={require("../assets/logo.png")} // change to your image
          style={styles.logo}
        />
      </Animated.View>

      <Text style={styles.appName}>My Cute App</Text>
      <Text style={styles.subtitle}>Loading magic… ✨</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#A066FF",
    justifyContent: "center",
    alignItems: "center",
  },
  logoContainer: {
    padding: 20,
    backgroundColor: "#CBA8FF",
    borderRadius: 150,
    shadowColor: "#4B0082",
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 10,
  },
  logo: {
    width: 130,
    height: 130,
    borderRadius: 65,
  },
  appName: {
    marginTop: 25,
    fontSize: 32,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 16,
    color: "#F8E6FF",
  },
});
