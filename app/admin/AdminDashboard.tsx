import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { db } from "../../constants/firebaseConfig";

interface Booking {
  id: string;
  userId: string;
  userName?: string;
  service: string;
  date: string;
  status: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);

  // 🧭 Real-time bookings
  useEffect(() => {
    try {
      const q = query(collection(db, "bookings"), orderBy("date", "desc"));

      const unsubscribe = onSnapshot(q, async (snapshot) => {
        if (snapshot.empty) {
          setBookings([]);
          return;
        }

        const list: Booking[] = await Promise.all(
          snapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            let userName = "Unknown User";

            if (data.userId) {
              try {
                const userRef = doc(db, "users", data.userId);
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const userData = userSnap.data();
                  userName = userData.name || userData.username || "Unnamed";
                }
              } catch (err) {
                console.log("Error fetching user:", err);
              }
            }

            return {
              id: docSnap.id,
              userName,
              ...(data as Omit<Booking, "id">),
            };
          })
        );

        setBookings(list);
      });

      return unsubscribe;
    } catch (error) {
      console.error("Error fetching bookings:", error);
    }
  }, []);

  // 🔔 Send notification
  const addNotification = async (userId: string, message: string) => {
    try {
      await addDoc(collection(db, "notifications", userId, "items"), {
        message,
        createdAt: new Date().toISOString(),
        read: false,
      });
    } catch (error) {
      console.error("Error adding notification:", error);
    }
  };

  // ✅ Approve booking
  const handleApprove = async (id: string, userId: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: "approved" });
      await addNotification(userId, "Your booking has been approved ✅");
      Alert.alert("Approved", "Booking has been approved!");
    } catch (error) {
      Alert.alert("Error", "Failed to update booking.");
    }
  };

  // ❌ Reject booking
  const handleReject = async (id: string, userId: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: "rejected" });
      await addNotification(userId, "Your booking has been rejected ❌");
      Alert.alert("Rejected", "Booking has been rejected.");
    } catch (error) {
      Alert.alert("Error", "Failed to reject booking.");
    }
  };

  // 🔄 Pending again
  const handlePending = async (id: string, userId: string) => {
    try {
      await updateDoc(doc(db, "bookings", id), { status: "pending" });
      await addNotification(userId, "Your booking is back to pending 🕓");
      Alert.alert("Pending", "Booking set to pending.");
    } catch (error) {
      Alert.alert("Error", "Failed to update booking.");
    }
  };

  // 🖼️ UI
  return (
    <View style={styles.container}>
      <Text style={styles.header}>Manage Appointments</Text>

      {bookings.length === 0 ? (
        <Text style={{ textAlign: "center", color: "#777", marginTop: 20 }}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={{ flex: 1 }}>
                <Text style={styles.name}>{item.userName}</Text>
                <Text style={styles.detail}>Service: {item.service}</Text>
                <Text style={styles.detail}>Date: {item.date}</Text>
                <Text
                  style={[
                    styles.status,
                    item.status === "approved"
                      ? styles.statusApproved
                      : item.status === "rejected"
                      ? styles.statusRejected
                      : styles.statusPending,
                  ]}
                >
                  Status: {item.status.toUpperCase()}
                </Text>
              </View>

              <View style={styles.buttons}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#48BB78" }]}
                  onPress={() => handleApprove(item.id, item.userId)}
                >
                  <Ionicons name="checkmark-outline" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#E53E3E" }]}
                  onPress={() => handleReject(item.id, item.userId)}
                >
                  <Ionicons name="close-outline" size={22} color="#fff" />
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.button, { backgroundColor: "#D69E2E" }]}
                  onPress={() => handlePending(item.id, item.userId)}
                >
                  <Ionicons name="time-outline" size={22} color="#fff" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "700", color: "#6B46C1", marginBottom: 15 },
  card: {
    backgroundColor: "#F9F5FF",
    padding: 15,
    borderRadius: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 2,
    elevation: 2,
  },
  name: { fontSize: 17, fontWeight: "600", color: "#4A148C" },
  detail: { color: "#555", fontSize: 13 },
  status: { marginTop: 8, fontWeight: "600" },
  statusApproved: { color: "#48BB78" },
  statusRejected: { color: "#E53E3E" },
  statusPending: { color: "#D69E2E" },
  buttons: {
    flexDirection: "row",
    marginTop: 10,
    justifyContent: "flex-end",
    gap: 8,
  },
  button: {
    padding: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
});
