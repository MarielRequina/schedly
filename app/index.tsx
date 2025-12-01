import { LinearGradient } from 'expo-linear-gradient';
import { usePathname, useRouter } from "expo-router";
import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function IndexScreen() {
  const router = useRouter();
  const pathname = usePathname();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const iconRotate = useRef(new Animated.Value(0)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Main entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Icon rotation animation
    Animated.loop(
      Animated.timing(iconRotate, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for button
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const iconRotation = iconRotate.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <LinearGradient
      colors={['#1a0033', '#2d1b4e', '#1a0033']}
      style={styles.container}
    >
      {/* Animated decorative circles */}
      <Animated.View 
        style={[
          styles.decorativeCircle1,
          { opacity: fadeAnim }
        ]} 
      />
      <Animated.View 
        style={[
          styles.decorativeCircle2,
          { opacity: fadeAnim }
        ]} 
      />

      {/* Top-right admin button */}
      <TouchableOpacity
        style={styles.topButton}
        onPress={() => router.push("/admin/adminLogin")}
      >
        <Text style={styles.topButtonText}>Admin</Text>
      </TouchableOpacity>

      {/* Main content */}
      <Animated.View 
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { scale: scaleAnim },
              { translateY: slideAnim }
            ]
          }
        ]}
      >
        <Animated.View 
          style={[
            styles.iconContainer,
            { transform: [{ rotate: iconRotation }] }
          ]}
        >
          <Text style={styles.mainIcon}>✨</Text>
        </Animated.View>
        
        <Text style={styles.title}>Welcome to Schedify</Text>
        <Text style={styles.subtitle}>
          Your beauty, our priority.{'\n'}
          Book appointments with ease.
        </Text>

        {/* Main CTA button with pulse */}
        <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push("/login")}
            activeOpacity={0.9}
          >
            <Text style={styles.ctaButtonText}>Get Started</Text>
            <Text style={styles.ctaButtonIcon}>→</Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Features */}
        <View style={styles.features}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>📅</Text>
            <Text style={styles.featureText}>Easy Booking</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⏰</Text>
            <Text style={styles.featureText}>24/7 Access</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💆‍♀️</Text>
            <Text style={styles.featureText}>Top Salons</Text>
          </View>
        </View>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    position: 'relative',
  },
  decorativeCircle1: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    top: -100,
    right: -100,
  },
  decorativeCircle2: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(139, 92, 246, 0.1)',
    bottom: -50,
    left: -50,
  },
  topButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(255, 255, 153, 0.15)',
    paddingVertical: 8,
    paddingHorizontal: 20,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ffffcc',
    zIndex: 10,
    elevation: 3,
  },
  topButtonText: {
    color: '#ffffcc',
    fontWeight: '600',
    fontSize: 13,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(139, 92, 246, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 2,
    borderColor: '#8b5cf6',
  },
  mainIcon: {
    fontSize: 50,
  },
  title: {
    fontSize: 36,
    color: '#ffffcc',
    fontWeight: 'bold',
    marginBottom: 12,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: 'rgba(255, 255, 204, 0.8)',
    marginBottom: 50,
    textAlign: 'center',
    fontSize: 16,
    lineHeight: 24,
  },
  ctaButton: {
    backgroundColor: '#ffffcc',
    paddingVertical: 16,
    paddingHorizontal: 40,
    borderRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#8b5cf6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 8,
    elevation: 8,
    marginBottom: 50,
  },
  ctaButtonText: {
    color: '#2d1b4e',
    fontWeight: 'bold',
    fontSize: 18,
    marginRight: 8,
  },
  ctaButtonIcon: {
    color: '#2d1b4e',
    fontSize: 20,
    fontWeight: 'bold',
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    maxWidth: 350,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureText: {
    color: 'rgba(255, 255, 204, 0.9)',
    fontSize: 12,
    fontWeight: '600',
  },
});