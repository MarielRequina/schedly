import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Authentication, database } from "../constants/firebaseConfig";

// Constants
const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  white: '#FFFFFF',
  black: '#000000',
  gray900: '#1F2937',
  gray800: '#374151',
  gray600: '#6B7280',
  gray400: '#9CA3AF',
  gray100: '#F3F4F6',
  gray50: '#F9FAFB',
};

const SHADOWS = {
  small: {
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  medium: {
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Animated Button Component
const AnimatedButton = ({ children, onPress, style }: any) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.97, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 4, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity onPress={onPress} onPressIn={handlePressIn} onPressOut={handlePressOut} activeOpacity={1}>
      <Animated.View style={[style, { transform: [{ scale }] }]}>{children}</Animated.View>
    </TouchableOpacity>
  );
};

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Guest");
  const [fadeAnim] = useState(new Animated.Value(0));

  const services = [
    { 
      id: "1", 
      name: "Haircut", 
      icon: "cut" as const,
      image: "https://images.unsplash.com/photo-1599351431202-1e0f0137899a?w=400"
    },
    { 
      id: "2", 
      name: "Styling", 
      icon: "brush" as const,
      image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=400"
    },
    { 
      id: "3", 
      name: "Coloring", 
      icon: "color-palette" as const,
      image: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400"
    },
    { 
      id: "4", 
      name: "Treatment", 
      icon: "water" as const,
      image: "https://images.unsplash.com/photo-1519415387722-a1c3bbef716c?w=400"
    },
  ];

  const promoDeals = [
    { 
      id: "1", 
      title: "30% Off Hair Rebond", 
      description: "Get silky, straight hair this season!", 
      price: "₱1,225",
      oldPrice: "₱1,750",
      badge: "HOT",
      color: "#EF4444"
    },
    { 
      id: "2", 
      title: "Free Manicure Bundle", 
      description: "Book haircut and get free manicure.", 
      price: "Save ₱250",
      badge: "BUNDLE",
      color: "#F59E0B"
    },
    { 
      id: "3", 
      title: "Holiday Makeup Glow", 
      description: "25% off all makeup sessions.", 
      price: "₱1,500",
      oldPrice: "₱2,000",
      badge: "LIMITED",
      color: "#8B5CF6"
    },
  ];

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = Authentication.currentUser;
        if (!user) return;
        const docRef = doc(database, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) setUserName(docSnap.data().name || "User");
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserName();

    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View>
            <Text style={styles.greeting}>Hello, {userName}! 👋</Text>
            <Text style={styles.subGreeting}>Book your perfect style today</Text>
          </View>
          <TouchableOpacity onPress={() => router.push('/profile')} style={styles.profileButton}>
            <Ionicons name="person" size={20} color={COLORS.gray900} />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, SHADOWS.small]}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray400} />
          <TextInput
            placeholder="Search services, deals..."
            placeholderTextColor={COLORS.gray400}
            style={styles.searchInput}
          />
        </View>

        {/* Hero Banner */}
        <AnimatedButton 
          style={[styles.heroBanner, SHADOWS.medium]} 
          onPress={() => router.push("/booking")}
        >
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800" }}
            style={styles.heroImage}
          />
          <View style={styles.heroOverlay} />
          <View style={styles.heroContent}>
            <View style={styles.heroBadge}>
              <Ionicons name="sparkles" size={14} color={COLORS.white} />
              <Text style={styles.heroBadgeText}>FEATURED</Text>
            </View>
            <Text style={styles.heroTitle}>Transform Your Look</Text>
            <Text style={styles.heroSubtitle}>Expert stylists ready to serve you</Text>
            <View style={styles.heroButton}>
              <Text style={styles.heroButtonText}>Book Now</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
            </View>
          </View>
        </AnimatedButton>

        {/* Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <TouchableOpacity onPress={() => router.push("/services")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={services}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.servicesList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedButton onPress={() => router.push("/services")}>
              <View style={[styles.serviceCard, SHADOWS.small]}>
                <View style={styles.serviceIconContainer}>
                  <Ionicons name={item.icon} size={28} color={COLORS.primary} />
                </View>
                <Text style={styles.serviceName}>{item.name}</Text>
              </View>
            </AnimatedButton>
          )}
        />

        {/* Hot Deals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hot Deals 🔥</Text>
          <TouchableOpacity onPress={() => router.push("/promodeals")}>
            <Text style={styles.seeAll}>See All →</Text>
          </TouchableOpacity>
        </View>

        <FlatList
          data={promoDeals}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoList}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <AnimatedButton onPress={() => router.push("/promodeals")}>
              <View style={[styles.promoCard, SHADOWS.medium, { backgroundColor: item.color }]}>
                <View style={styles.promoBadge}>
                  <Text style={styles.promoBadgeText}>{item.badge}</Text>
                </View>
                <Text style={styles.promoTitle}>{item.title}</Text>
                <Text style={styles.promoDescription}>{item.description}</Text>
                <View style={styles.priceContainer}>
                  <Text style={styles.promoPrice}>{item.price}</Text>
                  {item.oldPrice && (
                    <Text style={styles.promoOldPrice}>{item.oldPrice}</Text>
                  )}
                </View>
              </View>
            </AnimatedButton>
          )}
        />

        {/* Salon Info Card */}
        <View style={[styles.salonCard, SHADOWS.medium]}>
          <Image
            source={{ uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800" }}
            style={styles.salonImage}
          />
          <View style={styles.salonInfo}>
            <View style={styles.salonHeader}>
              <View>
                <Text style={styles.salonName}>Schedly Salon</Text>
                <View style={styles.locationRow}>
                  <Ionicons name="location" size={14} color={COLORS.gray600} />
                  <Text style={styles.location}>Matina, Davao City</Text>
                </View>
              </View>
              <View style={styles.ratingBox}>
                <Ionicons name="star" size={16} color="#FFC857" />
                <Text style={styles.rating}>4.9</Text>
              </View>
            </View>
            <Text style={styles.salonDescription}>
              Expert stylists and premium treatments. Your beauty destination.
            </Text>
            <AnimatedButton 
              style={[styles.bookButton, SHADOWS.small]} 
              onPress={() => router.push("/booking")}
            >
              <Text style={styles.bookButtonText}>Book Appointment</Text>
              <Ionicons name="arrow-forward" size={18} color={COLORS.white} />
            </AnimatedButton>
          </View>
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.gray50 
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
  },
  greeting: {
    fontSize: 24,
    fontWeight: '700',
    color: COLORS.gray900,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 14,
    color: COLORS.gray600,
    marginTop: 2,
  },
  profileButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.gray100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.gray900,
  },
  
  // Hero Banner
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 180,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.primary,
  },
  heroImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  heroOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(124, 58, 237, 0.7)',
  },
  heroContent: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 4,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: -0.5,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 16,
  },
  heroButton: {
    backgroundColor: COLORS.white,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 18,
    borderRadius: 10,
    alignSelf: 'flex-start',
    gap: 6,
  },
  heroButtonText: {
    color: COLORS.primary,
    fontSize: 14,
    fontWeight: '600',
  },
  
  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 32,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    letterSpacing: -0.3,
  },
  seeAll: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.primary,
  },
  
  // Services
  servicesList: {
    paddingHorizontal: 20,
    gap: 12,
  },
  serviceCard: {
    width: 100,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 12,
  },
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serviceName: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.gray900,
    textAlign: 'center',
  },
  
  // Promo Deals
  promoList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  promoCard: {
    width: SCREEN_WIDTH - 100,
    borderRadius: 16,
    padding: 20,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  promoBadge: {
    backgroundColor: 'rgba(255,255,255,0.3)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  promoBadgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  promoDescription: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 12,
    lineHeight: 18,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  promoPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  promoOldPrice: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    textDecorationLine: 'line-through',
  },
  
  // Salon Card
  salonCard: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    overflow: 'hidden',
  },
  salonImage: {
    width: '100%',
    height: 160,
  },
  salonInfo: {
    padding: 20,
  },
  salonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  salonName: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  location: {
    fontSize: 13,
    color: COLORS.gray600,
  },
  ratingBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.gray50,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.gray900,
  },
  salonDescription: {
    fontSize: 14,
    color: COLORS.gray600,
    lineHeight: 20,
    marginBottom: 16,
  },
  bookButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
  bookButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: '600',
  },
});