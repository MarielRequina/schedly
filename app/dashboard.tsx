
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Animated,
  Dimensions,
  FlatList,
  Image,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { Authentication, database } from "../constants/firebaseConfig";

// Animated Button Component with Touch Effects
const AnimatedButton = ({ children, onPress, style, activeOpacity = 0.85 }: any) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={activeOpacity}
    >
      <Animated.View style={[style, { transform: [{ scale: scaleValue }] }]}>
        {children}
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function Dashboard() {
  const router = useRouter();

  const [userName, setUserName] = useState("Guest");
  const [modalVisible, setModalVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(0.9));
  const [heartScale] = useState(new Animated.Value(1));
  const [currentPromoIndex, setCurrentPromoIndex] = useState(0);

  const { height: screenHeight } = Dimensions.get("window");

  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Appointment Approved ",
      message: "Your booking at Schedly Salon was approved by the admin.",
      time: "2 hours ago",
    },
  ]);

  const services = [
    {
      id: "1",
      name: "Haircut",
      image: "https://media.istockphoto.com/id/992998698/photo/close-up-of-hairdressers-hands-cutting-hair.jpg?s=612x612&w=0&k=20&c=QC3D0p6JE1dX4KMbHLbRmjt-diSL0z6_USnNKzOHLSI=",
      color: "#FFE5F0",
    },
    {
      id: "2",
      name: "Styling",
      image: "https://media.istockphoto.com/id/1469265810/photo/girl-at-a-hair-salon.jpg?s=612x612&w=0&k=20&c=8tYkPfyaa0_PGzFQqSXbOFEJVbPPub1VDEnznVY5-6Y=",
      color: "#F3E5FF",
    },
    {
      id: "3",
      name: "Coloring",
      image: "https://media.istockphoto.com/id/1305824214/photo/woman-dyeing-her-hair-at-the-salon.jpg?s=612x612&w=0&k=20&c=Jk2XQqn-5Tf1IeUPhmLYMP1Lq2nSlW_0udRXzc_KAJI=",
      color: "#E0F2FE",
    },
    {
      id: "4",
      name: "Rebond",
      image: "https://i0.wp.com/post.healthline.com/wp-content/uploads/2020/07/hair-salon-straight-1296x728-header.jpg?w=1155&h=1528",
      color: "#FFF4E5",
    },
    {
      id: "5",
      name: "Treatment",
      image: "https://media.istockphoto.com/id/500135894/photo/clients-hair-is-being-reconditioned.jpg?s=612x612&w=0&k=20&c=Vy_EE5oGrMn_YWiJ8V27sOB0HdwAie_QqdnEJtWV1F0=",
      color: "#E5FFF5",
    },
  ];

  const salon = {
    name: "Schedly Salon",
    location: "Matina, Davao City",
    rating: 4.9,
    reviews: 324,
    image:
      "https://www.mydigisalon.com/blog/wp-content/uploads/2020/09/salonmarketingtrends-mydigisalon.jpg",
    about:
      "We bring out your best look with expert stylists and premium treatments. Book your beauty session today!",
  };

  const promoDeals = [
    {
      id: "1",
      title: "30% Off Hair Rebond",
      description: "Get silky, straight hair with our best-selling treatment!",
      discount: "₱1,750 → ₱1,225",
      badge: "HOT DEAL",
    },
    {
      id: "2",
      title: "Free Manicure with Haircut",
      description: "Book any haircut and get a free manicure session.",
      discount: "Save ₱250",
      badge: "BUNDLE",
    },
    {
      id: "3",
      title: "Holiday Glow Makeup",
      description: "Perfect your festive look with a 25% off on all makeup sessions.",
      discount: "₱2,000 → ₱1,500",
      badge: "LIMITED",
    },
    {
      id: "4",
      title: "Hair Color Treatment",
      description: "Full color treatment with free hair mask and styling!",
      discount: "₱1,200 → ₱850",
      badge: "NEW",
    },
    {
      id: "5",
      title: "Student Special Cut",
      description: "Show your student ID and get 40% off any haircut service!",
      discount: "From ₱250 → ₱150",
      badge: "STUDENT",
    },
  ];

  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = Authentication.currentUser;
        if (!user) return;
        const docRef = doc(database, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "User");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserName();

    // Initial fade-in animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleScroll = (event: any) => {
    const offsetY = event.nativeEvent.contentOffset.y;
    setScrollY(offsetY);
  };

  const handleHeartPress = () => {
    Animated.sequence([
      Animated.timing(heartScale, {
        toValue: 1.3,
        duration: 150,
        useNativeDriver: true,
      }),
      Animated.timing(heartScale, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const headerOpacity = scrollY > 50 ? 0.98 : 1;
  const headerElevation = scrollY > 50 ? 8 : 0;

  return (
    <>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 30 }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Full-screen Hero Image */}
        <View style={[styles.heroSection, { height: screenHeight }]}>
          <Image
            source={{ uri: "https://5.imimg.com/data5/SELLER/Default/2022/9/XX/HK/TH/35954604/salon-interior-designing-500x500.jpg" }}
            style={styles.heroImage}
          />
          {/* Top nav overlay (local to dashboard) */}
          <View style={styles.topNavRow}>
            <TouchableOpacity onPress={() => router.push('/profile')} activeOpacity={0.8} style={styles.topNavProfileLeft}>
              <Ionicons name="person" size={20} color="#111827" />
            </TouchableOpacity>
            <View style={styles.topNavLinks}>
              <TouchableOpacity onPress={() => router.push('/dashboard')} activeOpacity={0.7}>
                <Text style={styles.topNavText}>Home</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/services')} activeOpacity={0.7}>
                <Text style={styles.topNavText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/promodeals')} activeOpacity={0.7}>
                <Text style={styles.topNavText}>Hot Deals</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push('/booking')} activeOpacity={0.7}>
                <Text style={styles.topNavText}>Bookings</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() => setModalVisible(true)}
              activeOpacity={0.8}
              style={styles.topNavNotifRight}
            >
              <Ionicons name="notifications-outline" size={20} color="#7C3AED" />
              {notifications.length > 0 && <View style={styles.topNavNotifBadge} />}
            </TouchableOpacity>
          </View>

          {/* Search bar below top nav */}
          <View style={styles.heroSearch}>
            <Ionicons name="search-outline" size={18} color="#9CA3AF" />
            <TextInput
              placeholder="Search services..."
              placeholderTextColor="#9CA3AF"
              style={styles.heroSearchInput}
            />
          </View>

          <AnimatedButton style={styles.heroCta} onPress={() => router.push("/booking")}>
            <Text style={styles.heroCtaText}>Book Appointment</Text>
            <Ionicons name="arrow-forward" size={18} color="#fff" />
          </AnimatedButton>
        </View>

        {/* Animated Salon Banner (appears after scrolling) */}
        {scrollY > screenHeight * 0.2 && (
          <Animated.View
            style={[
              styles.salonBanner,
              {
                opacity: fadeAnim,
                transform: [
                  { translateY: slideAnim },
                  { scale: scaleAnim },
                ],
              },
            ]}
          >
            <AnimatedButton activeOpacity={0.95} onPress={() => router.push("/booking")}>
              <Image source={{ uri: salon.image }} style={styles.salonImage} />
              <View style={styles.imageOverlay} />
              <View style={styles.salonBadge}>
                <Ionicons name="star" size={14} color="#FFC857" />
                <Text style={styles.salonRating}>{salon.rating}</Text>
                <Text style={styles.salonReviews}>({salon.reviews})</Text>
              </View>

              <View style={styles.salonInfo}>
                <View style={styles.salonHeader}>
                  <View>
                    <Text style={styles.salonName}>{salon.name}</Text>
                    <View style={styles.locationRow}>
                      <Ionicons name="location" size={14} color="#7C3AED" />
                      <Text style={styles.salonLocation}>{salon.location}</Text>
                    </View>
                  </View>
                  <TouchableOpacity onPress={handleHeartPress} activeOpacity={0.6}>
                    <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                      <Ionicons name="heart-outline" size={22} color="#7C3AED" />
                    </Animated.View>
                  </TouchableOpacity>
                </View>
                <Text style={styles.salonAbout}>{salon.about}</Text>
                <AnimatedButton
                  style={styles.bookButton}
                  onPress={() => router.push("/booking")}
                >
                  <Text style={styles.bookButtonText}>Book Appointment</Text>
                  <Ionicons name="arrow-forward" size={18} color="#fff" />
                </AnimatedButton>
              </View>
            </AnimatedButton>
          </Animated.View>
        )}

        {/* Services Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Our Services</Text>
          <AnimatedButton onPress={() => router.push("/services")}>
            <Text style={styles.seeAllText}>See All</Text>
          </AnimatedButton>
        </View>

        <FlatList
          data={services}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <ServiceCard item={item} onPress={() => router.push("/services")} />
          )}
        />

        {/* Dynamic Promo Section */}
        <View style={styles.promoSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hot Deals</Text>
            <AnimatedButton onPress={() => router.push("/promodeals")}>
              <Text style={styles.seeAllText}>See All</Text>
            </AnimatedButton>
          </View>

          <AnimatedButton
            style={styles.offerCard}
            onPress={() => router.push("/promodeals")}
          >
            <View style={styles.offerGradient}>
              <View style={styles.offerContent}>
                <View style={styles.offerBadge}>
                  <Ionicons name="flame" size={12} color="#FFFFFF" />
                  <Text style={styles.offerBadgeText}>{promoDeals[currentPromoIndex].badge}</Text>
                </View>
                <Text style={styles.offerTitle}>{promoDeals[currentPromoIndex].title}</Text>
                <Text style={styles.offerSubtitle}>{promoDeals[currentPromoIndex].description}</Text>
                <View style={styles.offerPriceRow}>
                  <View style={styles.offerPriceBox}>
                    <Text style={styles.offerPrice}>{promoDeals[currentPromoIndex].discount}</Text>
                  </View>
                </View>
                <View style={styles.offerButton}>
                  <Text style={styles.offerButtonText}>View Deals</Text>
                  <Ionicons name="arrow-forward" size={16} color="#7C3AED" />
                </View>
              </View>
              <View style={styles.offerDecoration}>
                <Ionicons name="pricetag" size={80} color="rgba(255,255,255,0.15)" />
              </View>
            </View>
          </AnimatedButton>

          {/* Promo Indicators */}
          <View style={styles.promoIndicators}>
            {promoDeals.map((_, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => setCurrentPromoIndex(index)}
                style={[
                  styles.indicator,
                  currentPromoIndex === index && styles.indicatorActive,
                ]}
              />
            ))}
          </View>
        </View>

        {/* Notification Modal */}
        <Modal
          visible={modalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Notifications</Text>
                <AnimatedButton
                  onPress={() => setModalVisible(false)}
                >
                  <Ionicons name="close" size={24} color="#7C3AED" />
                </AnimatedButton>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                {notifications.length > 0 ? (
                  notifications.map((notif) => (
                    <AnimatedButton 
                      key={notif.id} 
                      style={styles.notificationCard}
                    >
                      <View style={styles.notifIconWrapper}>
                        <Ionicons name="checkmark-circle" size={24} color="#10B981" />
                      </View>
                      <View style={styles.notifContent}>
                        <Text style={styles.notifTitle}>{notif.title}</Text>
                        <Text style={styles.notifMessage}>{notif.message}</Text>
                        <Text style={styles.notifTime}>{notif.time}</Text>
                      </View>
                    </AnimatedButton>
                  ))
                ) : (
                  <View style={styles.emptyState}>
                    <Ionicons name="notifications-off-outline" size={64} color="#D1D5DB" />
                    <Text style={styles.noNotifText}>No new notifications</Text>
                  </View>
                )}
              </ScrollView>

              <AnimatedButton
                style={styles.modalCloseButtonBottom}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalCloseButtonText}>Close</Text>
              </AnimatedButton>
            </View>
          </View>
        </Modal>
      </ScrollView>
    </>
  );
}

// Animated Service Card Component
const ServiceCard = ({ item, onPress }: any) => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.92,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleValue, {
      toValue: 1,
      friction: 3,
      tension: 40,
      useNativeDriver: true,
    }).start();
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.serviceCard,
          {
            transform: [{ scale: scaleValue }],
          }
        ]}
      >
        <Image 
          source={{ uri: item.image }} 
          style={styles.serviceImage}
        />
        <View style={styles.serviceOverlay} />
        <Text style={styles.serviceText}>{item.name}</Text>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },

  heroSection: {
    width: '100%',
    position: 'relative',
    overflow: 'hidden',
    backgroundColor: '#000',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  heroCta: {
    position: 'absolute',
    bottom: 40,
    alignSelf: 'center',
    backgroundColor: '#7C3AED',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 28,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 6,
  },
  heroCtaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },

  topNavRow: {
    position: 'absolute',
    top: 40,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 28,
    paddingHorizontal: 16,
  },
  topNavLinks: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 18,
  },
  topNavText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textShadowColor: 'rgba(0,0,0,0.4)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  topNavProfileLeft: {
    position: 'absolute',
    left: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  topNavNotifRight: {
    position: 'absolute',
    right: 16,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255,255,255,0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },
  topNavNotifBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },

  heroSearch: {
    position: 'absolute',
    top: 80,
    left: 16,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249,250,251,0.72)',
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 10,
  },
  heroSearchInput: {
    flex: 1,
    fontSize: 15,
    color: '#1F2937',
  },

  headerGradient: {
    backgroundColor: '#FFFFFF',
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 50,
    paddingBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: { flex: 1 },
  welcomeText: { 
    color: "#6B7280", 
    fontSize: 14, 
    fontWeight: "400",
    letterSpacing: 0.2 
  },
  userName: { 
    color: "#1F2937", 
    fontSize: 28, 
    fontWeight: "700", 
    marginTop: 4,
    letterSpacing: -0.5
  },
  notificationButton: {
    backgroundColor: "#F9FAFB",
    padding: 10,
    borderRadius: 12,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#7C3AED',
  },

  searchBar: {
    backgroundColor: "#F9FAFB",
    marginHorizontal: 24,
    marginTop: 8,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  searchInput: { 
    flex: 1, 
    fontSize: 15, 
    marginLeft: 10, 
    color: "#1F2937",
    fontWeight: "400"
  },

  salonBanner: {
    marginTop: 24,
    marginHorizontal: 24,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  salonImage: { width: "100%", height: 200 },
  imageOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  salonBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  salonRating: { fontSize: 14, fontWeight: '700', color: '#1F2937', marginLeft: 4 },
  salonReviews: { fontSize: 12, color: '#6B7280', marginLeft: 2 },
  salonInfo: { padding: 20 },
  salonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  salonName: { fontSize: 20, fontWeight: "700", color: "#1F2937", letterSpacing: -0.3 },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 4,
  },
  salonLocation: { color: "#7C3AED", fontSize: 13, fontWeight: '500' },
  favoriteButton: {
    padding: 4,
  },
  salonAbout: { color: "#6B7280", marginTop: 12, lineHeight: 20, fontSize: 14 },
  bookButton: {
    marginTop: 16,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#7C3AED',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 8,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  bookButtonText: { color: "#FFFFFF", fontSize: 15, fontWeight: "600" },

  sectionHeader: {
    marginTop: 32,
    paddingHorizontal: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: { fontSize: 18, fontWeight: "700", color: "#1F2937", letterSpacing: -0.3 },
  seeAllText: { color: '#7C3AED', fontWeight: '500', fontSize: 14 },
  serviceCard: {
    alignItems: "center",
    marginRight: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    overflow: 'hidden',
    width: 110,
    height: 130,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
    position: 'relative',
  },
  serviceImage: {
    width: '100%',
    height: '100%',
    position: 'absolute',
  },
  serviceOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
  },
  serviceText: { 
    fontSize: 14, 
    fontWeight: "700", 
    color: "#FFFFFF", 
    textAlign: 'center',
    position: 'absolute',
    bottom: 12,
    zIndex: 2,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  offerCard: {
    marginHorizontal: 24,
    marginTop: 32,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 8,
  },
  offerGradient: {
    backgroundColor: '#7C3AED',
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 140,
  },
  offerContent: {
    flex: 1,
    zIndex: 1,
  },
  offerBadge: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  offerBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  offerTitle: { color: "#FFFFFF", fontSize: 20, fontWeight: "700", lineHeight: 24, letterSpacing: -0.5, marginBottom: 4 },
  offerSubtitle: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '400', marginBottom: 8, lineHeight: 18 },
  offerPriceRow: {
    marginBottom: 12,
  },
  offerPriceBox: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  offerPrice: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  offerButton: {
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    alignSelf: 'flex-start',
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2,
  },
  offerButtonText: { color: "#7C3AED", fontWeight: "600", fontSize: 13 },
  offerDecoration: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    opacity: 0.3,
  },
  
  promoSection: {
    marginBottom: 20,
  },
  promoIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    gap: 8,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D5DB',
  },
  indicatorActive: {
    backgroundColor: '#7C3AED',
    width: 24,
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
  },
  modalCloseButton: {
    padding: 4,
  },
  notificationCard: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  notifIconWrapper: {
    marginRight: 12,
  },
  notifContent: {
    flex: 1,
  },
  notifTitle: { fontWeight: "600", color: "#1F2937", fontSize: 15, marginBottom: 4 },
  notifMessage: { color: "#6B7280", fontSize: 14, lineHeight: 20 },
  notifTime: { color: '#9CA3AF', fontSize: 12, marginTop: 4 },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  noNotifText: { color: "#9CA3AF", marginTop: 16, fontSize: 15 },
  
  modalCloseButtonBottom: {
    backgroundColor: '#7C3AED',
    borderRadius: 12,
    paddingVertical: 14,
    marginTop: 16,
    alignItems: 'center',
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  modalCloseButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
});