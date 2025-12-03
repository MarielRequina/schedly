import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

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
import { Promo, getPromos } from "../constants/servicesData";

// Animated Promo Card Component
const AnimatedPromoCard = ({ item, index }: { item: Promo; index: number }) => {
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(1));

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
        </View>

        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
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
  const router = useRouter();
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

  const handlePress = () => {
    router.push({ pathname: "/booking", params: { openModal: "1", step: "2" } });
  };

  return (
    <TouchableOpacity
      onPress={handlePress}
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
  const router = useRouter();
  const [headerFade] = useState(new Animated.Value(0));
  const [headerSlide] = useState(new Animated.Value(-30));
  const [pulseAnim] = useState(new Animated.Value(1));
  const [promoDeals, setPromoDeals] = useState<Promo[]>(getPromos());

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
        {/* Page Switcher */}
        <View style={styles.switcherRow}>
          <TouchableOpacity onPress={() => router.push('/services')}>
            <Text style={styles.switcherLink}>Services</Text>
          </TouchableOpacity>
          <Text style={styles.switcherSep}> | </Text>
          <TouchableOpacity>
            <Text style={[styles.switcherLink, styles.switcherActive]}>Promo Deals</Text>
          </TouchableOpacity>
        </View>

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
    paddingTop: 24,
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
  switcherRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  switcherLink: {
    fontSize: 15,
    fontWeight: '700',
    color: '#6B7280',
  },
  switcherActive: {
    color: '#7C3AED',
    fontWeight: '800',
  },
  switcherSep: {
    color: '#D1D5DB',
    marginHorizontal: 10,
    fontWeight: '800',
    fontSize: 16,
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
  info: {
    padding: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
    marginBottom: 8,
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