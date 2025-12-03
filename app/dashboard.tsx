import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from "react-native";

import { Authentication, database } from "../constants/firebaseConfig";
import { getPromos, getServices } from "../constants/servicesData";

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
const PROMO_ITEM_WIDTH = SCREEN_WIDTH - 100;
const PROMO_ITEM_GAP = 16;

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
  const [ctaAnim] = useState(new Animated.Value(0));
  const scrollY = useRef(new Animated.Value(0)).current;
  const [searchQuery, setSearchQuery] = useState("");
  const [seeAllSvcAnim] = useState(new Animated.Value(0));
  const [seeAllDealsAnim] = useState(new Animated.Value(0));

  const promoListRef = useRef<FlatList<any>>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const displayName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : "User";

  const startAutoScroll = () => {
    if (autoTimerRef.current || !promoDeals.length) return;
    autoTimerRef.current = setInterval(() => {
      setPromoIndex((prev) => {
        const next = (prev + 1) % promoDeals.length;
        try {
          promoListRef.current?.scrollToIndex({ index: next, animated: true });
        } catch {}
        return next;
      });
    }, 3000);
  };

  const stopAutoScroll = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
  };

  type Service = {
    id: string;
    name: string;
    image: string;
  };

  const services: Service[] = getServices().map((s) => ({
    id: s.id,
    name: s.name,
    image: s.image.uri,
  }));

  const promoDeals = getPromos().map((p) => ({
    id: p.id,
    title: p.title,
    description: p.description,
    price: p.discount,
    oldPrice: undefined as string | undefined,
    badge: p.badge || undefined,
    image: p.image.uri,
  }));

  const filteredServices = services.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()));
  const filteredPromos = promoDeals.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()));

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

  // Auto-scroll Hot Deals horizontally in a loop, pausing during user interaction
  useEffect(() => {
    startAutoScroll();
    return () => stopAutoScroll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleHeroCta = () => {
    Animated.timing(ctaAnim, { toValue: 24, duration: 180, useNativeDriver: true }).start(() => {
      ctaAnim.setValue(0);
      router.push("/booking");
    });
  };

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor={COLORS.white} />

      <Animated.ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
          <View style={styles.headerLeft}>
            <Text style={styles.greeting}>Hello, {displayName}! 👋</Text>
            <Text style={styles.subGreeting}>Book your perfect style today</Text>
          </View>

          <TouchableOpacity onPress={() => router.push('/notifications')} style={styles.profileButton}>
            <Ionicons name="notifications-outline" size={20} color={COLORS.gray900} />
          </TouchableOpacity>
        </Animated.View>

        {/* Search Bar */}
        <View style={[styles.searchContainer, SHADOWS.small]}>
          <Ionicons name="search-outline" size={20} color={COLORS.gray400} />
          <TextInput
            placeholder="Search services, deals..."
            placeholderTextColor={COLORS.gray400}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            returnKeyType="search"
            onSubmitEditing={() => {
              if (filteredServices.length) router.push("/services");
              else if (filteredPromos.length) router.push("/promodeals");
            }}
          />
          {!!searchQuery && (
            <TouchableOpacity onPress={() => setSearchQuery("")}> 
              <Ionicons name="close-circle" size={18} color={COLORS.gray400} />
            </TouchableOpacity>
          )}
        </View>

        {searchQuery.length > 0 && (
          <View style={[styles.searchResults, SHADOWS.small]}>
            {filteredServices.length > 0 && (
              <Text style={styles.resultSection}>Services</Text>
            )}
            {filteredServices.slice(0, 5).map(s => (
              <TouchableOpacity key={`svc-${s.id}`} style={styles.resultRow} onPress={() => router.push("/services")}>
                <Text style={styles.resultText}>{s.name}</Text>
              </TouchableOpacity>
            ))}
            {filteredPromos.length > 0 && (
              <Text style={[styles.resultSection, { marginTop: filteredServices.length ? 6 : 0 }]}>Deals</Text>
            )}
            {filteredPromos.slice(0, 5).map(p => (
              <TouchableOpacity key={`pro-${p.id}`} style={styles.resultRow} onPress={() => router.push("/promodeals")}>
                <Text style={styles.resultText}>{p.title}</Text>
              </TouchableOpacity>
            ))}
            {filteredServices.length === 0 && filteredPromos.length === 0 && (
              <Text style={styles.noResults}>No matches</Text>
            )}
          </View>
        )}

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
            <TouchableOpacity onPress={handleHeroCta} activeOpacity={0.8}>
              <Animated.View style={[
                styles.heroButton,
                {
                  transform: [{ translateX: ctaAnim }],
                  opacity: scrollY.interpolate({ inputRange: [0, 60], outputRange: [1, 0], extrapolate: 'clamp' }),
                },
              ]}>
                <Text style={styles.heroButtonText}>Book Now</Text>
                <Ionicons name="arrow-forward" size={16} color={COLORS.primary} />
              </Animated.View>
            </TouchableOpacity>
          </View>
        </AnimatedButton>

        {/* Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <TouchableOpacity
            onPress={() => {
              Animated.timing(seeAllSvcAnim, { toValue: 16, duration: 160, useNativeDriver: true }).start(() => {
                seeAllSvcAnim.setValue(0);
                router.push("/services");
              });
            }}
            activeOpacity={0.8}
          >
            <Animated.Text style={[styles.seeAll, { transform: [{ translateX: seeAllSvcAnim }] }]}>See All →</Animated.Text>
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
                <Image source={{ uri: item.image }} style={styles.serviceImage} />
                <View style={styles.serviceOverlay} />
                <Text style={styles.serviceLabel}>{item.name}</Text>
              </View>
            </AnimatedButton>
          )}
        />

        {/* Hot Deals Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Hot Deals 🔥</Text>
          <TouchableOpacity
            onPress={() => {
              Animated.timing(seeAllDealsAnim, { toValue: 16, duration: 160, useNativeDriver: true }).start(() => {
                seeAllDealsAnim.setValue(0);
                router.push("/promodeals");
              });
            }}
            activeOpacity={0.8}
          >
            <Animated.Text style={[styles.seeAll, { transform: [{ translateX: seeAllDealsAnim }] }]}>See All →</Animated.Text>
          </TouchableOpacity>
        </View>

        <FlatList
          ref={promoListRef}
          data={promoDeals}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.promoList}
          keyExtractor={(item) => item.id}
          snapToInterval={PROMO_ITEM_WIDTH + PROMO_ITEM_GAP}
          decelerationRate="fast"
          disableIntervalMomentum
          onScrollBeginDrag={stopAutoScroll}
          onMomentumScrollEnd={(e) => {
            const x = e.nativeEvent.contentOffset.x || 0;
            const idx = Math.round(x / (PROMO_ITEM_WIDTH + PROMO_ITEM_GAP));
            setPromoIndex(idx % promoDeals.length);
            startAutoScroll();
          }}
          getItemLayout={(_, index) => ({
            length: PROMO_ITEM_WIDTH + PROMO_ITEM_GAP,
            offset: (PROMO_ITEM_WIDTH + PROMO_ITEM_GAP) * index,
            index,
          })}
          onScrollToIndexFailed={({ index }) => {
            setTimeout(() => promoListRef.current?.scrollToIndex({ index, animated: true }), 250);
          }}
          renderItem={({ item }) => (
            <AnimatedButton onPress={() => router.push("/promodeals")}>
              <View style={[styles.promoCard, SHADOWS.medium]}>
                <Image source={{ uri: item.image }} style={styles.promoImage} />
                <View style={styles.promoImageOverlay} />
                {item.badge && (
                  <View style={styles.promoBadge}>
                    <Text style={styles.promoBadgeText}>{item.badge}</Text>
                  </View>
                )}
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

      </Animated.ScrollView>

      {/* Floating Book FAB */}
      <Animated.View
        style={[
          styles.fab,
          {
            opacity: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0, 1], extrapolate: 'clamp' }),
            transform: [
              { scale: scrollY.interpolate({ inputRange: [0, 80], outputRange: [0.8, 1], extrapolate: 'clamp' }) },
              { translateY: scrollY.interpolate({ inputRange: [0, 80], outputRange: [20, 0], extrapolate: 'clamp' }) },
            ],
          },
        ]}
      >
        <TouchableOpacity onPress={() => router.push('/booking')} activeOpacity={0.9}>
          <View style={styles.fabInner}>
            <Ionicons name="add" size={24} color={COLORS.white} />
          </View>
        </TouchableOpacity>
      </Animated.View>
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
    paddingTop: 36,
    paddingBottom: 10,
    backgroundColor: COLORS.white,
  },
  headerLeft: {
    flexDirection: 'column',
  },
  greeting: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.gray900,
    letterSpacing: -0.5,
  },
  subGreeting: {
    fontSize: 12,
    color: COLORS.gray600,
    marginTop: 2,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
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
  searchResults: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 6,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  resultText: {
    color: COLORS.gray900,
    fontSize: 14,
    fontWeight: '600',
  },
  noResults: {
    color: COLORS.gray600,
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  resultSection: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.gray600,
    paddingHorizontal: 12,
    paddingVertical: 4,
    textTransform: 'uppercase',
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
    width: 140,
    height: 160,
    borderRadius: 16,
    overflow: 'hidden',
  },
<<<<<<< HEAD
  serviceIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
<<<<<<< HEAD
    backgroundColor: `${COLORS.primary}15`,
=======
    backgroundColor: 'rgba(124, 58, 237, 0.08)',
>>>>>>> 72622e1c0974b8c8c73989a080f8e5e20c6382fd
    alignItems: 'center',
    justifyContent: 'center',
=======
  serviceImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
>>>>>>> 815b0a391676dfc87d1adc467faf0e8da5160cea
  },
  serviceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  serviceLabel: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    color: COLORS.white,
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: -0.3,
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
    overflow: 'hidden',
  },
  promoImage: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  promoImageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.35)',
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
  
  // Floating Action Button
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 28,
    // no shadow on container to avoid square artifact behind circle
    backgroundColor: 'transparent',
  },
  fabInner: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#F59E0B',
    alignItems: 'center',
    justifyContent: 'center',
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