import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  Animated,
  FlatList,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface Promo {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: { uri: string };
  badge?: string;
}

const promoDeals: Promo[] = [
  {
    id: "1",
    title: "30% Off Hair Rebond",
    description: "Get silky, straight hair with our best-selling treatment!",
    discount: "₱1,750 → ₱1,225",
    badge: "HOT DEAL",
    image: { uri: "https://cdn.shopify.com/s/files/1/1412/4580/files/Keratin_vs_Rebond_Salon_480x480.jpg?v=1686244964" },
  },
  {
    id: "2",
    title: "Free Manicure with Haircut",
    description: "Book any haircut and get a free manicure session.",
    discount: "Save ₱250",
    badge: "BUNDLE",
    image: { uri: "https://michmylnails.net/wp-content/uploads/2022/08/Nail-Salon-Slider-Banner.jpg" },
  },
  {
    id: "3",
    title: "Holiday Glow Makeup",
    description: "Perfect your festive look with a 25% off on all makeup sessions.",
    discount: "₱2,000 → ₱1,500",
    badge: "LIMITED",
    image: { uri: "https://images.fresha.com/lead-images/placeholders/beauty-salon-66.jpg?class=venue-gallery-large" },
  },
  {
    id: "5",
    title: "Hair Color Treatment",
    description: "Full color treatment with free hair mask and styling!",
    discount: "₱1,200 → ₱850",
    badge: "NEW",
    image: { uri: "https://img1.wsimg.com/isteam/ip/10ce9f98-419e-47a5-bf54-acfaaf041f34/Why%20Do%20Salons%20Wash%20Your%20Hair%20After%20Coloring.jpeg" },
  },
  {
    id: "6",
    title: "Weekend Relax Package",
    description: "Hair spa, scalp massage, and deep conditioning treatment.",
    discount: "₱1,800 → ₱1,200",
    badge: "WEEKENDS",
    image: { uri: "https://media.istockphoto.com/id/500135894/photo/clients-hair-is-being-reconditioned.jpg?s=612x612&w=0&k=20&c=Vy_EE5oGrMn_YWiJ8V27sOB0HdwAie_QqdnEJtWV1F0=" },
  },
  {
    id: "7",
    title: "Student Special Cut",
    description: "Show your student ID and get 40% off any haircut service!",
    discount: "From ₱250 → ₱150",
    badge: "STUDENT",
    image: { uri: "https://images.unsplash.com/photo-1493256338651-d82f7acb2b38?auto=format&fit=crop&w=800&q=80" },
  },
];

// Animated Promo Card Component
const AnimatedPromoCard = ({ item, index, isFavorite, onToggleFavorite }: { item: Promo; index: number; isFavorite: boolean; onToggleFavorite: (id: string) => void }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [heartScale] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 100,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 100,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.97,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 4,
      tension: 50,
      useNativeDriver: true,
    }).start();
  };

  const handleFavoritePress = () => {
    // Animate heart
    Animated.sequence([
      Animated.spring(heartScale, {
        toValue: 1.3,
        friction: 3,
        useNativeDriver: true,
      }),
      Animated.spring(heartScale, {
        toValue: 1,
        friction: 3,
        useNativeDriver: true,
      }),
    ]).start();
    
    onToggleFavorite(item.id);
  };

  return (
    <Animated.View
      style={[
        styles.card,
        {
          opacity: fadeAnim,
          transform: [
            { translateY: slideAnim },
            { scale: scaleAnim },
          ],
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={1}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <View style={styles.imageContainer}>
          <Image source={item.image} style={styles.image} resizeMode="cover" />
          <View style={styles.imageOverlay} />
          
          {item.badge && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.badge}</Text>
            </View>
          )}

          <View style={styles.discountTag}>
            <Ionicons name="pricetag" size={16} color="#FFFFFF" />
          </View>
        </View>

        <View style={styles.info}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>{item.title}</Text>
            <TouchableOpacity 
              style={styles.heartButton}
              onPress={handleFavoritePress}
              activeOpacity={0.7}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons 
                  name={isFavorite ? "heart" : "heart-outline"} 
                  size={22} 
                  color={isFavorite ? "#EF4444" : "#7C3AED"} 
                />
              </Animated.View>
            </TouchableOpacity>
          </View>
          <Text style={styles.description}>{item.description}</Text>
          
          <View style={styles.priceRow}>
            <View style={styles.discountBox}>
              <Text style={styles.discount}>{item.discount}</Text>
            </View>
          </View>

          <AnimatedButton />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Button Component
const AnimatedButton = () => {
  const [scaleValue] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleValue, {
      toValue: 0.95,
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
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={1}
    >
      <Animated.View
        style={[
          styles.button,
          {
            transform: [{ scale: scaleValue }],
          },
        ]}
      >
        <Ionicons name="calendar-outline" size={18} color="#fff" />
        <Text style={styles.buttonText}>Book This Deal</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function PromoDealsScreen() {
  const [headerFade] = useState(new Animated.Value(0));
  const [headerSlide] = useState(new Animated.Value(-30));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const toggleFavorite = (id: string) => {
    setFavorites(prev => {
      const newFavorites = new Set(prev);
      if (newFavorites.has(id)) {
        newFavorites.delete(id);
      } else {
        newFavorites.add(id);
      }
      return newFavorites;
    });
  };

  useEffect(() => {
    // Header animation
    Animated.parallel([
      Animated.timing(headerFade, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(headerSlide, {
        toValue: 0,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for fire icon
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Animated.View
        style={[
          styles.headerContainer,
          {
            opacity: headerFade,
            transform: [{ translateY: headerSlide }],
          },
        ]}
      >
        <View style={styles.headerContent}>
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <Ionicons name="flame" size={32} color="#EF4444" />
          </Animated.View>
          <Text style={styles.header}>Hot Promo Deals</Text>
        </View>
        <Text style={styles.subheader}>
          Limited time offers — grab them before they're gone!
        </Text>
      </Animated.View>

      <FlatList
        data={promoDeals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
        renderItem={({ item, index }) => (
          <AnimatedPromoCard 
            item={item} 
            index={index} 
            isFavorite={favorites.has(item.id)}
            onToggleFavorite={toggleFavorite}
          />
        )}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  listContainer: {
    paddingBottom: 20,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 24,
    backgroundColor: "#FFFFFF",
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 8,
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.5,
  },
  subheader: {
    fontSize: 14,
    color: "#6B7280",
    fontWeight: "400",
    lineHeight: 20,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    marginHorizontal: 24,
    marginTop: 20,
    overflow: "hidden",
    shadowColor: "#7C3AED",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 180,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  badge: {
    position: "absolute",
    top: 16,
    left: 16,
    backgroundColor: "#EF4444",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1,
  },
  discountTag: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#7C3AED",
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 3,
  },
  info: {
    padding: 20,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
    flex: 1,
    paddingRight: 8,
  },
  heartButton: {
    padding: 4,
  },
  description: {
    color: "#6B7280",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  discountBox: {
    backgroundColor: "#FFF4E5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#FFC857",
  },
  discount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#F59E0B",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#7C3AED",
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontWeight: "600",
    fontSize: 15,
  },
});