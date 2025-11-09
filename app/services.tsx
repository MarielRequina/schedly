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
import { Service, getServices } from "../constants/servicesData";

// Animated Card Component
const AnimatedServiceCard = ({ item, index, isFavorite, onToggleFavorite }: { item: Service; index: number; isFavorite: boolean; onToggleFavorite: (id: string) => void }) => {
  const router = useRouter();
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const [scaleAnim] = useState(new Animated.Value(1));
  const [heartScale] = useState(new Animated.Value(1));

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay: index * 150,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        delay: index * 150,
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
          <Image source={item.image} style={styles.image} />
          <View style={styles.imageOverlay} />
          <View style={styles.priceBadge}>
            <Text style={styles.priceBadgeText}>{item.price}</Text>
          </View>
        </View>
        <View style={styles.cardContent}>
          <View style={styles.serviceHeader}>
            <Text style={styles.serviceName}>{item.name}</Text>
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

          <AnimatedButton onPress={() => router.push("/booking")} />
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Animated Button Component
const AnimatedButton = ({ onPress }: { onPress: () => void }) => {
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
      onPress={onPress}
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
        <Text style={styles.buttonText}>Book Now</Text>
        <Ionicons name="arrow-forward" size={16} color="#fff" />
      </Animated.View>
    </TouchableOpacity>
  );
};

export default function ServicesScreen() {
  const [headerFade] = useState(new Animated.Value(0));
  const [headerSlide] = useState(new Animated.Value(-30));
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [servicesData, setServicesData] = useState<Service[]>(getServices());

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
  }, []);

  const renderService = ({ item, index }: { item: Service; index: number }) => (
    <AnimatedServiceCard 
      item={item} 
      index={index} 
      isFavorite={favorites.has(item.id)}
      onToggleFavorite={toggleFavorite}
    />
  );

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
          <Text style={styles.header}>Our Services</Text>
          <Ionicons name="cut" size={28} color="#7C3AED" />
        </View>
        <Text style={styles.subheader}>
          Professional beauty services tailored just for you
        </Text>
      </Animated.View>

      <FlatList
        data={servicesData}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
        contentContainerStyle={styles.listContainer}
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
    justifyContent: "space-between",
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
    shadowColor: "#7C3AED",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 200,
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
    backgroundColor: "rgba(0,0,0,0.15)",
  },
  priceBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  priceBadgeText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7C3AED",
  },
  cardContent: {
    padding: 20,
  },
  serviceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  serviceName: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1F2937",
    letterSpacing: -0.3,
    flex: 1,
  },
  heartButton: {
    padding: 4,
    marginLeft: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: "#7C3AED",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
    shadowColor: "#7C3AED",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 15,
    fontWeight: "600",
  },
});