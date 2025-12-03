import { Ionicons } from "@expo/vector-icons";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, StyleSheet, Text, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

interface Booking {
  id?: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
  status: string;
  userId: string;
}

export default function NotificationsScreen() {
  const [confirmed, setConfirmed] = useState<Booking[]>([]);

  useEffect(() => {
    const user = Authentication.currentUser;
    if (!user) return;

    const q = query(
      collection(database, "bookings"),
      where("userId", "==", user.uid),
      where("status", "==", "confirmed")
    );

    const unsub = onSnapshot(q, (snapshot: any) => {
      const data: Booking[] = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));
      setConfirmed(data);
    });

    return () => unsub();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {confirmed.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="notifications-outline" size={48} color="#9CA3AF" />
          <Text style={styles.emptyTitle}>No notifications yet</Text>
          <Text style={styles.emptySub}>You'll see booking confirmations here.</Text>
        </View>
      ) : (
        <FlatList
          data={confirmed}
          keyExtractor={(item) => item.id || Math.random().toString()}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardHeaderRow}>
                <View style={styles.badgeConfirmed}>
                  <Ionicons name="checkmark-circle" size={16} color="#fff" />
                  <Text style={styles.badgeText}>Confirmed</Text>
                </View>
                <Ionicons name="notifications" size={18} color="#10B981" />
              </View>

              <Text style={styles.cardTitle}>{item.service}</Text>
              <Text style={styles.cardText}>📅 {item.date}</Text>
              <Text style={styles.cardText}>🕐 {item.time}</Text>
              <Text style={styles.cardText}>✂️ {item.stylist}</Text>

              <View style={styles.noticeBox}>
                <Ionicons name="information-circle" size={16} color="#2563EB" />
                <Text style={styles.noticeText}>
                  Your appointment has been confirmed. Please arrive 10 minutes early.
                </Text>
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  // Match booking screen visual language
  container: { flex: 1, padding: 16, backgroundColor: "#FFF7E6" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 12, textAlign: "center" },

  // Empty state
  emptyState: { alignItems: "center", marginTop: 48 },
  emptyTitle: { marginTop: 12, fontSize: 16, fontWeight: "700", color: "#374151" },
  emptySub: { marginTop: 4, fontSize: 13, color: "#6B7280" },

  // Cards similar to bookings
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 6 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#333" },
  cardText: { marginBottom: 4, fontSize: 14, color: "#666" },

  // Confirmed badge
  badgeConfirmed: { flexDirection: "row", alignItems: "center", gap: 6, alignSelf: "flex-start", backgroundColor: "#10B981", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: "#fff", fontSize: 12, fontWeight: "700" },

  // Info notice
  noticeBox: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: "#EFF6FF", borderWidth: 1, borderColor: "#DBEAFE", padding: 10, borderRadius: 8, marginTop: 10 },
  noticeText: { flex: 1, color: "#1F2937", fontSize: 13 },
});
