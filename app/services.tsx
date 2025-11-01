import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";

interface Service {
  id: string;
  name: string;
  description: string;
  price: string;
  image: any;
}

const servicesData: Service[] = [
  {
    id: "1",
    name: "Haircut & Styling",
    description: "Classic, layered, or modern styles — your look, perfected.",
    price: "₱250 - ₱400",
    image: {
      uri: "https://images.unsplash.com/photo-1600850056064-00d8f62f77db?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "2",
    name: "Hair Color",
    description: "Vibrant shades and subtle tones for all hair types.",
    price: "₱800 - ₱1,500",
    image: {
      uri: "https://images.unsplash.com/photo-1621605815971-fbc98e9f95b1?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "3",
    name: "Rebond & Treatment",
    description: "Smooth, shiny, and frizz-free hair with long-lasting results.",
    price: "₱1,200 - ₱2,500",
    image: {
      uri: "https://images.unsplash.com/photo-1605721911519-3dfeb3be25e4?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "4",
    name: "Nail Care",
    description: "Pamper yourself with manicure, pedicure, and nail art.",
    price: "₱300 - ₱600",
    image: {
      uri: "https://images.unsplash.com/photo-1596464716121-9b7e7b1e1b53?auto=format&fit=crop&w=800&q=80",
    },
  },
  {
    id: "5",
    name: "Makeup & Glam",
    description: "For special occasions — look flawless and confident.",
    price: "₱800 - ₱2,000",
    image: {
      uri: "https://images.unsplash.com/photo-1600773119331-446c7b30eeb8?auto=format&fit=crop&w=800&q=80",
    },
  },
];


export default function ServicesScreen() {
  const router = useRouter();

  const renderService = ({ item }: { item: Service }) => (
    <View style={styles.card}>
      <Image source={item.image} style={styles.image} />
      <View style={styles.cardContent}>
        <Text style={styles.serviceName}>{item.name}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.price}>{item.price}</Text>

        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/booking")}
        >
          <Ionicons name="calendar-outline" size={18} color="#fff" />
          <Text style={styles.buttonText}>Book Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.header}>Our Services 💇‍♀️</Text>
      <FlatList
        data={servicesData}
        renderItem={renderService}
        keyExtractor={(item) => item.id}
        scrollEnabled={false}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7FF",
    padding: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4B2A7B",
    marginBottom: 15,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
    overflow: "hidden",
  },
  image: {
    width: "100%",
    height: 160,
  },
  cardContent: {
    padding: 12,
  },
  serviceName: {
    fontSize: 18,
    fontWeight: "700",
    color: "#4B2A7B",
  },
  description: {
    fontSize: 13,
    color: "#666",
    marginVertical: 4,
  },
  price: {
    fontSize: 14,
    fontWeight: "600",
    color: "#E0A100",
    marginBottom: 10,
  },
  button: {
    backgroundColor: "#6C63FF",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
    paddingVertical: 8,
    gap: 6,
  },
  buttonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
});
