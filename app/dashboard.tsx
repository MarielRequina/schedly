import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
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

// Theme Constants
const COLORS = {
  primary: '#9333EA',
  primaryLight: '#C084FC',
  primaryBg: '#FAF5FF',
  accent: '#E9D5FF',
  white: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
};

const SHADOW = {
  shadowColor: "#9333EA",
  shadowOpacity: 0.08,
  shadowOffset: { width: 0, height: 2 },
  shadowRadius: 8,
  elevation: 3,
};

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const PROMO_WIDTH = SCREEN_WIDTH - 80;

// Animated Button
const AnimatedButton = ({ children, onPress, style }: any) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, useNativeDriver: true }).start();
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
  const [searchQuery, setSearchQuery] = useState("");
  const [services, setServices] = useState<any[]>([]);
  const [promoDeals, setPromoDeals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
  const promoListRef = useRef<FlatList<any>>(null);
  const [promoIndex, setPromoIndex] = useState(0);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch user name
        const user = Authentication.currentUser;
        if (user) {
          const docRef = doc(database, "users", user.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserName(docSnap.data().name || "User");
          }
        }

        // Fetch services from Firestore
        const servicesSnapshot = await getDocs(collection(database, "services"));
        const servicesData = servicesSnapshot.docs.map((doc: { data: () => any; id: any; }) => {
          const data = doc.data();
          return {
            id: doc.id,
            name: data.name || "Service",
            image: data.image?.uri || data.image || data.imageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=400",
            price: data.price || "",
            description: data.description || "",
            duration: data.duration || "",
          };
        });
        setServices(servicesData);

        // Fetch promos from Firestore (if you have a promos collection)
        try {
          const promosSnapshot = await getDocs(collection(database, "promos"));
          const promosData = promosSnapshot.docs.map((doc: { data: () => any; id: any; }) => {
            const data = doc.data();
            return {
              id: doc.id,
              title: data.title || "Special Deal",
              description: data.description || "",
              price: data.price || data.discount || "",
              badge: data.badge || "",
              image: data.image?.uri || data.image || data.imageUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800",
            };
          });
          setPromoDeals(promosData);
        } catch (promoError) {
          console.log("Promos collection not found or empty");
          setPromoDeals([]);
        }

      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    Animated.timing(fadeAnim, { toValue: 1, duration: 600, useNativeDriver: true }).start();
  }, []);

  useEffect(() => {
    if (!promoDeals.length) return;
    autoTimerRef.current = setInterval(() => {
      setPromoIndex((prev) => {
        const next = (prev + 1) % promoDeals.length;
        try {
          promoListRef.current?.scrollToIndex({ index: next, animated: true });
        } catch (e) {
          // Ignore scroll errors
        }
        return next;
      });
    }, 4000);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [promoDeals.length]);

  const displayName = userName.charAt(0).toUpperCase() + userName.slice(1);

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
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
            <Text style={styles.loadingText}>Loading services...</Text>
          </View>
        ) : (
          <>
            {/* Search Bar */}
            <View style={[styles.searchContainer, SHADOW]}>
              <Ionicons name="search-outline" size={20} color={COLORS.textLight} />
              <TextInput
                placeholder="Search services..."
                placeholderTextColor={COLORS.textLight}
                style={styles.searchInput}
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
              {!!searchQuery && (
                <TouchableOpacity onPress={() => setSearchQuery("")}>
                  <Ionicons name="close-circle" size={20} color={COLORS.textLight} />
                </TouchableOpacity>
              )}
            </View>

            {/* Search Results */}
            {searchQuery.length > 0 && filteredServices.length > 0 && (
              <View style={[styles.searchResults, SHADOW]}>
                <Text style={styles.resultSection}>Services</Text>
                {filteredServices.map(s => (
                  <TouchableOpacity key={s.id} style={styles.resultRow} onPress={() => {
                    setSearchQuery("");
                    router.push("/services");
                  }}>
                    <Image source={{ uri: s.image }} style={styles.resultImage} />
                    <View style={styles.resultContent}>
                      <Text style={styles.resultText}>{s.name}</Text>
                      {s.price && <Text style={styles.resultPrice}>₱{s.price}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
              </View>
            )}
            
            {searchQuery.length > 0 && filteredServices.length === 0 && (
              <View style={[styles.searchResults, SHADOW]}>
                <Text style={styles.noResults}>No services found</Text>
              </View>
            )}

            {/* Hero Banner */}
            <AnimatedButton style={[styles.heroBanner, SHADOW]} onPress={() => router.push("/booking")}>
              <Image
                source={{ uri: "https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800" }}
                style={styles.heroImage}
              />
              <View style={styles.heroOverlay} />
              <View style={styles.heroContent}>
                <View style={styles.heroBadge}>
                  <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                  <Text style={styles.heroBadgeText}>FEATURED</Text>
                </View>
                <Text style={styles.heroTitle}>Transform Your Look</Text>
                <Text style={styles.heroSubtitle}>Expert stylists ready to serve you</Text>
                <View style={styles.heroButton}>
                  <Text style={styles.heroButtonText}>Book Now</Text>
                  <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
                </View>
              </View>
            </AnimatedButton>

            {/* Services Section */}
            {services.length > 0 && (
              <>
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
                      <View style={styles.serviceCard}>
                        <Image source={{ uri: item.image }} style={styles.serviceImage} />
                        <View style={styles.serviceTextContainer}>
                          <Text style={styles.serviceLabel} numberOfLines={1}>{item.name}</Text>
                          {item.price && <Text style={styles.servicePrice}>₱{item.price}</Text>}
                        </View>
                      </View>
                    </AnimatedButton>
                  )}
                />
              </>
            )}

            {/* Hot Deals Section */}
            {promoDeals.length > 0 && (
              <>
                <View style={styles.sectionHeader}>
                  <Text style={styles.sectionTitle}>Hot Deals 🔥</Text>
                  <TouchableOpacity onPress={() => router.push("/promodeals")}>
                    <Text style={styles.seeAll}>See All →</Text>
                  </TouchableOpacity>
                </View>

                <FlatList
                  ref={promoListRef}
                  data={promoDeals}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.promoList}
                  keyExtractor={(item) => item.id}
                  snapToInterval={PROMO_WIDTH + 16}
                  decelerationRate="fast"
                  onMomentumScrollEnd={(e) => {
                    const x = e.nativeEvent.contentOffset.x;
                    const idx = Math.round(x / (PROMO_WIDTH + 16));
                    setPromoIndex(idx % promoDeals.length);
                  }}
                  renderItem={({ item }) => (
                    <AnimatedButton onPress={() => router.push("/promodeals")}>
                      <View style={[styles.promoCard, SHADOW]}>
                        <Image source={{ uri: item.image }} style={styles.promoImage} />
                        <View style={styles.promoOverlay} />
                        {item.badge && (
                          <View style={styles.promoBadge}>
                            <Text style={styles.promoBadgeText}>{item.badge}</Text>
                          </View>
                        )}
                        <View style={styles.promoContent}>
                          <Text style={styles.promoTitle}>{item.title}</Text>
                          <Text style={styles.promoDescription}>{item.description}</Text>
                          {item.price && <Text style={styles.promoPrice}>₱{item.price}</Text>}
                        </View>
                      </View>
                    </AnimatedButton>
                  )}
                />
              </>
            )}

            {/* Empty State */}
            {services.length === 0 && promoDeals.length === 0 && (
              <View style={styles.emptyState}>
                <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
                <Text style={styles.emptyTitle}>No Services Available</Text>
                <Text style={styles.emptyText}>Check back later for available services</Text>
              </View>
            )}
          </>
        )}
      </Animated.ScrollView>

      {/* Floating Action Button */}
      {!loading && (
        <Animated.View
          style={[
            ,
            {
              opacity: scrollY.interpolate({ inputRange: [0, 100], outputRange: [0, 1] }),
              transform: [{ scale: scrollY.interpolate({ inputRange: [0, 100], outputRange: [0.8, 1] }) }],
            },
          ]}
        >
        
        </Animated.View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.primaryBg,
  },
  
  // Loading
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 15,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
    paddingBottom: 16,
    backgroundColor: COLORS.white,
    display: 'none',
  },
  menuButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  menuLine: {
    width: 20,
    height: 2.5,
    backgroundColor: COLORS.primary,
    borderRadius: 2,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
  },
  notifButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: COLORS.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  
  // Search
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 50,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.text,
  },
  searchResults: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 8,
    borderRadius: 16,
    paddingVertical: 8,
  },
  resultSection: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textLight,
    paddingHorizontal: 16,
    paddingVertical: 6,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  resultImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: COLORS.border,
  },
  resultContent: {
    flex: 1,
  },
  resultText: {
    color: COLORS.text,
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 2,
  },
  resultPrice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  noResults: {
    color: COLORS.textLight,
    fontSize: 14,
    paddingHorizontal: 16,
    paddingVertical: 12,
    textAlign: 'center',
  },
  
  // Hero Banner
  heroBanner: {
    marginHorizontal: 20,
    marginTop: 24,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
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
    backgroundColor: 'rgba(147, 51, 234, 0.75)',
  },
  heroContent: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    alignSelf: 'flex-start',
    gap: 6,
    marginBottom: 12,
  },
  heroBadgeText: {
    color: COLORS.primary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 1,
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: COLORS.white,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 15,
    color: COLORS.white,
    marginBottom: 20,
    opacity: 0.95,
  },
  heroButton: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignSelf: 'flex-start',
    gap: 8,
  },
  heroButtonText: {
    color: COLORS.white,
    fontSize: 15,
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
    color: COLORS.text,
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
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  serviceImage: {
    width: 140,
    height: 140,
    borderRadius: 16,
  },
  serviceTextContainer: {
    padding: 8,
    backgroundColor: COLORS.white,
  },
  serviceLabel: {
    color: COLORS.text,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  servicePrice: {
    color: COLORS.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  
  // Promo Deals
  promoList: {
    paddingHorizontal: 20,
    gap: 16,
  },
  promoCard: {
    width: PROMO_WIDTH,
    height: 200,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: COLORS.white,
  },
  promoImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  promoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(147, 51, 234, 0.65)',
  },
  promoBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  promoBadgeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  promoContent: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
  },
  promoTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.white,
    marginBottom: 4,
  },
  promoDescription: {
    fontSize: 13,
    color: COLORS.white,
    marginBottom: 8,
    opacity: 0.95,
  },
  promoPrice: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.white,
  },
  
  // Empty State
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: 'center',
  },
   
});