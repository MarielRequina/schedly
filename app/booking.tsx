import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  Modal,
  TextInput,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { db, auth } from "../constants/firebaseConfig";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
} from "firebase/firestore";

interface Booking {
  id?: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
  status: string;
  userId: string;
}

export default function BookingScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    stylist: "",
  });

  // ✅ Fetch only the bookings of the logged-in user
  const fetchBookings = async () => {
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(collection(db, "bookings"), where("userId", "==", user.uid));
      const snapshot = await getDocs(q);

      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Booking[];

      setBookings(data);
    } catch (error) {
      console.error("Error fetching bookings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // ➕ CREATE or ✏️ UPDATE
  const handleSaveBooking = async () => {
    const { service, date, time, stylist } = form;
    const user = auth.currentUser;

    if (!user) {
      Alert.alert("Error", "You must be logged in to book.");
      return;
    }

    if (!service || !date || !time || !stylist) {
      Alert.alert("Missing Info", "Please fill in all fields.");
      return;
    }

    const bookingData = {
      userId: user.uid,
      service,
      date,
      time,
      stylist,
      status: "pending",
    };

    try {
      if (editingId) {
        await updateDoc(doc(db, "bookings", editingId), bookingData);
        Alert.alert("Updated", "Appointment updated successfully!");
        setEditingId(null);
      } else {
        await addDoc(collection(db, "bookings"), bookingData);
        Alert.alert("Booked!", "Your appointment has been created.");
      }

      setForm({ service: "", date: "", time: "", stylist: "" });
      setModalVisible(false);
      fetchBookings();
    } catch (error) {
      console.error("Error saving booking:", error);
      Alert.alert("Error", "Failed to save booking. Check Firestore rules.");
    }
  };

  // 🗑️ DELETE
  const handleDeleteBooking = async (id: string) => {
    Alert.alert("Cancel Appointment", "Are you sure?", [
      { text: "No" },
      {
        text: "Yes",
        onPress: async () => {
          try {
            await deleteDoc(doc(db, "bookings", id));
            fetchBookings();
            Alert.alert("Deleted", "Booking cancelled successfully.");
          } catch (error) {
            console.error("Error deleting booking:", error);
          }
        },
      },
    ]);
  };

  // ✏️ EDIT
  const handleEditBooking = (booking: Booking) => {
    setForm({
      service: booking.service,
      date: booking.date,
      time: booking.time,
      stylist: booking.stylist,
    });
    setEditingId(booking.id || null);
    setModalVisible(true);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Appointments 💇‍♀️</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6B46C1" />
      ) : bookings.length === 0 ? (
        <Text style={styles.noBookings}>No bookings yet.</Text>
      ) : (
        <FlatList
          data={bookings}
          keyExtractor={(item) => item.id!}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View style={styles.cardTop}>
                <Text style={styles.cardService}>{item.service}</Text>
                <Text
                  style={[
                    styles.cardStatus,
                    item.status === "approved" && { color: "#38A169" },
                    item.status === "rejected" && { color: "#E53E3E" },
                    item.status === "pending" && { color: "#D69E2E" },
                  ]}
                >
                  {item.status.toUpperCase()}
                </Text>
              </View>

              <Text style={styles.cardDetail}>
                <Ionicons name="calendar-outline" size={14} /> {item.date}
              </Text>
              <Text style={styles.cardDetail}>
                <Ionicons name="time-outline" size={14} /> {item.time}
              </Text>
              <Text style={styles.cardDetail}>
                <Ionicons name="person-outline" size={14} /> {item.stylist}
              </Text>

              <View style={styles.cardActions}>
                {item.status === "pending" && (
                  <>
                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: "#6B46C1" }]}
                      onPress={() => handleEditBooking(item)}
                    >
                      <Ionicons name="create-outline" size={16} color="#fff" />
                      <Text style={styles.actionText}>Edit</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, { backgroundColor: "#E53E3E" }]}
                      onPress={() => handleDeleteBooking(item.id!)}
                    >
                      <Ionicons name="trash-outline" size={16} color="#fff" />
                      <Text style={styles.actionText}>Cancel</Text>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            </View>
          )}
        />
      )}

      {/* ➕ Floating Add Button */}
      <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
        <Ionicons name="add-circle" size={60} color="#E0A100" />
      </TouchableOpacity>

      {/* 📋 Modal Form */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>
              {editingId ? "Edit Appointment" : "Add Appointment"}
            </Text>

            <TextInput
              placeholder="Service (e.g. Haircut)"
              style={styles.input}
              value={form.service}
              onChangeText={(text) => setForm({ ...form, service: text })}
            />
            <TextInput
              placeholder="Date (e.g. Nov 5, 2025)"
              style={styles.input}
              value={form.date}
              onChangeText={(text) => setForm({ ...form, date: text })}
            />
            <TextInput
              placeholder="Time (e.g. 2:00 PM)"
              style={styles.input}
              value={form.time}
              onChangeText={(text) => setForm({ ...form, time: text })}
            />
            <TextInput
              placeholder="Stylist (e.g. Ella)"
              style={styles.input}
              value={form.stylist}
              onChangeText={(text) => setForm({ ...form, stylist: text })}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#6B46C1" }]}
                onPress={handleSaveBooking}
              >
                <Text style={styles.modalButtonText}>
                  {editingId ? "Update" : "Save"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, { backgroundColor: "#E53E3E" }]}
                onPress={() => {
                  setModalVisible(false);
                  setEditingId(null);
                  setForm({ service: "", date: "", time: "", stylist: "" });
                }}
              >
                <Text style={styles.modalButtonText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#F9F7FF", padding: 16 },
  header: { fontSize: 24, fontWeight: "700", color: "#4B2E83", textAlign: "center", marginBottom: 10 },
  noBookings: { textAlign: "center", marginTop: 40, color: "#666" },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: "#E9D8FD" },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardService: { fontSize: 18, fontWeight: "700", color: "#4B2E83" },
  cardStatus: { fontSize: 14, fontWeight: "600" },
  cardDetail: { color: "#555", marginTop: 4, fontSize: 14 },
  cardActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  actionButton: { flexDirection: "row", alignItems: "center", borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6, marginLeft: 8 },
  actionText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
  addButton: { position: "absolute", bottom: 20, right: 20 },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", alignItems: "center" },
  modalContainer: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20 },
  modalHeader: { fontSize: 20, fontWeight: "700", color: "#4B2E83", textAlign: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#D6BCFA", borderRadius: 10, padding: 10, marginVertical: 6, fontSize: 14 },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 10, marginHorizontal: 4, alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "700" },
});
