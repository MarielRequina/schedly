import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Image,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { db, auth } from "../constants/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";

export default function Dashboard() {
  const router = useRouter();
  const [userName, setUserName] = useState("Guest");
  const [modalVisible, setModalVisible] = useState(false);
  const [notifications, setNotifications] = useState([
    {
      id: "1",
      title: "Appointment Approved ✅",
      message: "Your booking at Schedly Salon was approved by the admin.",
    },
  ]);

  const services = [
    { id: "1", name: "Haircut", icon: "cut-outline" },
    { id: "2", name: "Styling", icon: "color-palette-outline" },
    { id: "3", name: "Coloring", icon: "brush-outline" },
    { id: "4", name: "Rebond", icon: "sparkles-outline" },
    { id: "5", name: "Treatment", icon: "water-outline" },
  ];

  const salon = {
    name: "Schedly Salon",
    location: "Matina, Davao City",
    image:
      "https://images.unsplash.com/photo-1621605815971-fbc98e9f95b1?auto=format&fit=crop&w=800&q=80",
    about:
      "We bring out your best look with expert stylists and premium treatments. Book your beauty session today!",
  };

  // 🔍 Fetch user name from Firestore
  useEffect(() => {
    const fetchUserName = async () => {
      try {
        const user = auth.currentUser;
        if (!user) return;
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserName(docSnap.data().name || "User");
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      }
    };
    fetchUserName();
  }, []);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 30 }}>
      {/* 🌸 Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeText}>Welcome back, </Text>
          <Text style={styles.userName}>{userName} 💇‍♀️</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => setModalVisible(true)}
        >
          <Ionicons name="notifications-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* 🔎 Search Bar */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={20} color="#6B46C1" />
        <TextInput
          placeholder="Search services..."
          placeholderTextColor="#7E57C2"
          style={styles.searchInput}
        />
      </View>

      {/* 💈 Salon Banner */}
      <View style={styles.salonBanner}>
        <Image source={{ uri: salon.image }} style={styles.salonImage} />
        <View style={styles.salonInfo}>
          <Text style={styles.salonName}>{salon.name}</Text>
          <Text style={styles.salonLocation}>{salon.location}</Text>
          <Text style={styles.salonAbout}>{salon.about}</Text>
          <TouchableOpacity
            style={styles.bookButton}
            onPress={() => router.push("/booking")}
          >
            <Text style={styles.bookButtonText}>Book Appointment</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 💇 Services */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Our Services</Text>
      </View>

      <FlatList
        data={services}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingHorizontal: 20, paddingVertical: 10 }}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.serviceCard}
            onPress={() => router.push("/services")}
          >
            <View style={styles.serviceIconWrapper}>
              <Ionicons name={item.icon as any} size={22} color="#6B46C1" />
            </View>
            <Text style={styles.serviceText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* 🎉 Promo Section */}
      <View style={styles.offerCard}>
        <Text style={styles.offerLabel}>Special Promo 🎉</Text>
        <Text style={styles.offerTitle}>Get up to 40% off this month!</Text>
        <TouchableOpacity
          style={styles.offerButton}
          onPress={() => router.push("/promodeals")}
        >
          <Text style={styles.offerButtonText}>View Deals</Text>
        </TouchableOpacity>
      </View>

      {/* 🔔 Notification Modal */}
      <Modal
        visible={modalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Notifications 🔔</Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {notifications.length > 0 ? (
                notifications.map((notif) => (
                  <View key={notif.id} style={styles.notificationCard}>
                    <Text style={styles.notifTitle}>{notif.title}</Text>
                    <Text style={styles.notifMessage}>{notif.message}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.noNotifText}>No new notifications</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    backgroundColor: "#6B46C1",
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 25,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  welcomeText: { color: "#fff", fontSize: 14, opacity: 0.9 },
  userName: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  notificationButton: {
    backgroundColor: "rgba(255,255,255,0.2)",
    padding: 8,
    borderRadius: 999,
  },

  searchBar: {
    backgroundColor: "#EEE6FF",
    marginHorizontal: 20,
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
  },
  searchInput: { flex: 1, fontSize: 15, marginLeft: 8, color: "#4B2E83" },

  salonBanner: {
    marginTop: 25,
    marginHorizontal: 20,
    backgroundColor: "#F8F5FF",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 3,
  },
  salonImage: { width: "100%", height: 180 },
  salonInfo: { padding: 16 },
  salonName: { fontSize: 20, fontWeight: "700", color: "#4A148C" },
  salonLocation: { color: "#6B46C1", marginTop: 3 },
  salonAbout: { color: "#555", marginTop: 8, lineHeight: 20 },
  bookButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 999,
    marginTop: 14,
    paddingVertical: 10,
  },
  bookButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },

  sectionHeader: {
    marginTop: 24,
    paddingHorizontal: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: "600", color: "#2D3748" },
  serviceCard: {
    alignItems: "center",
    marginRight: 18,
    backgroundColor: "#F3E8FF",
    borderRadius: 16,
    paddingVertical: 14,
    width: 90,
  },
  serviceIconWrapper: {
    backgroundColor: "#E9D8FD",
    padding: 12,
    borderRadius: 999,
  },
  serviceText: { fontSize: 14, fontWeight: "500", color: "#4A148C", marginTop: 6 },

  offerCard: {
    marginHorizontal: 20,
    marginTop: 30,
    backgroundColor: "#6B46C1",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#6B46C1",
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  offerLabel: { color: "#fff", fontSize: 14 },
  offerTitle: { color: "#fff", fontSize: 18, fontWeight: "600", marginTop: 4 },
  offerButton: {
    backgroundColor: "#fff",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 18,
    marginTop: 12,
  },
  offerButtonText: { color: "#6B46C1", fontWeight: "600" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    width: "85%",
    maxHeight: "70%",
    elevation: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#6B46C1",
    textAlign: "center",
  },
  notificationCard: {
    backgroundColor: "#F3E8FF",
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
  },
  notifTitle: { fontWeight: "600", color: "#4A148C" },
  notifMessage: { color: "#2D3748", marginTop: 2 },
  noNotifText: { textAlign: "center", color: "#666", marginVertical: 20 },
  closeButton: {
    backgroundColor: "#6B46C1",
    borderRadius: 999,
    marginTop: 10,
    paddingVertical: 8,
  },
  closeButtonText: { color: "#fff", textAlign: "center", fontWeight: "600" },
});
