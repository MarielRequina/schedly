import React from "react";
import { View, Text, Image, TouchableOpacity, ScrollView, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface Service {
  id: string;
  name: string;
  price: string;
  duration: string;
}

const services: Service[] = [
  { id: "1", name: "Haircut", price: "₱250", duration: "30 mins" },
  { id: "2", name: "Hair Rebond", price: "₱1000", duration: "2 hrs" },
  { id: "3", name: "Hair Color", price: "₱800", duration: "1 hr 30 mins" },
];

export default function SalonDetailsScreen({ route, navigation }: any) {
  const { salon } = route.params;

  return (
    <ScrollView style={styles.container}>
      <Image source={{ uri: salon.image }} style={styles.banner} />

      <View style={styles.content}>
        <Text style={styles.salonName}>{salon.name}</Text>
        <Text style={styles.location}>{salon.location}</Text>

        <View style={styles.meta}>
          <Ionicons name="star" size={18} color="#F6AD55" />
          <Text style={styles.rating}>{salon.rating}</Text>
        </View>

        <Text style={styles.sectionTitle}>Available Services</Text>
        {services.map((service) => (
          <View key={service.id} style={styles.serviceCard}>
            <View>
              <Text style={styles.serviceName}>{service.name}</Text>
              <Text style={styles.serviceDuration}>{service.duration}</Text>
            </View>
            <Text style={styles.servicePrice}>{service.price}</Text>
          </View>
        ))}

        <TouchableOpacity
          style={styles.bookButton}
          onPress={() => navigation.navigate("Booking", { salon })}
        >
          <Text style={styles.bookText}>Book Appointment</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  banner: { width: "100%", height: 220 },
  content: { padding: 20 },
  salonName: { fontSize: 22, fontWeight: "700", color: "#2D3748" },
  location: { color: "#718096", marginVertical: 6 },
  meta: { flexDirection: "row", alignItems: "center" },
  rating: { marginLeft: 4, color: "#F6AD55", fontWeight: "500" },
  sectionTitle: { marginTop: 16, fontSize: 18, fontWeight: "600", color: "#4A148C" },
  serviceCard: {
    marginTop: 10,
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  serviceName: { fontWeight: "600", color: "#2D3748" },
  serviceDuration: { color: "#7E57C2", fontSize: 12 },
  servicePrice: { fontWeight: "700", color: "#6B46C1" },
  bookButton: {
    marginTop: 24,
    backgroundColor: "#6B46C1",
    padding: 14,
    borderRadius: 999,
    alignItems: "center",
  },
  bookText: { color: "#fff", fontWeight: "600", fontSize: 16 },
});
