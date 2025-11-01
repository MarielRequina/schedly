import React from "react";
import { View, Text, Image, StyleSheet, FlatList, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Promo {
  id: string;
  title: string;
  description: string;
  discount: string;
  image: { uri: string };
}

const promoDeals: Promo[] = [
  {
    id: "1",
    title: "30% Off Hair Rebond",
    description: "Get silky, straight hair with our best-selling treatment!",
    discount: "₱1,750 → ₱1,225",
    image: { uri: "https://images.unsplash.com/photo-1600850056064-00d8f62f77db?auto=format&fit=crop&w=800&q=80" },
  },
  {
    id: "2",
    title: "Free Manicure with Haircut",
    description: "Book any haircut and get a free manicure session.",
    discount: "Save ₱250",
    image: { uri: "https://images.unsplash.com/photo-1596464716121-9b7e7b1e1b53?auto=format&fit=crop&w=800&q=80" },
  },
  {
    id: "3",
    title: "Holiday Glow Makeup",
    description: "Perfect your festive look with a 25% off on all makeup sessions.",
    discount: "₱2,000 → ₱1,500",
    image: { uri: "https://images.unsplash.com/photo-1600773119331-446c7b30eeb8?auto=format&fit=crop&w=800&q=80" },
  },
  {
    id: "4",
    title: "Couple Spa Deal",
    description: "Pamper yourself and your partner — get 2 for the price of 1!",
    discount: "₱2,500 → ₱1,250/person",
    image: { uri: "https://images.unsplash.com/photo-1599058917212-d750089bc07b?auto=format&fit=crop&w=800&q=80" },
  },
];

export default function PromoDealsScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.header}>🔥 Promo Deals</Text>

      <FlatList
        data={promoDeals}
        keyExtractor={(item) => item.id}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />

            <View style={styles.info}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <Text style={styles.discount}>{item.discount}</Text>

              <TouchableOpacity style={styles.button}>
                <Ionicons name="cart-outline" size={16} color="#fff" />
                <Text style={styles.buttonText}>Book Now</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F7F4FF",
    padding: 16,
  },
  header: {
    fontSize: 24,
    fontWeight: "700",
    color: "#6B46C1",
    textAlign: "center",
    marginBottom: 10,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginVertical: 10,
    overflow: "hidden",
    elevation: 3,
  },
  image: {
    width: "100%",
    height: 160,
  },
  info: {
    padding: 14,
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B2E83",
  },
  description: {
    color: "#666",
    fontSize: 14,
    marginVertical: 6,
  },
  discount: {
    fontSize: 15,
    fontWeight: "700",
    color: "#E0A100",
    marginBottom: 8,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#6B46C1",
    paddingVertical: 8,
    borderRadius: 8,
    marginTop: 4,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    marginLeft: 6,
  },
});
