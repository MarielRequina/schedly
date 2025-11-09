import { Ionicons } from "@expo/vector-icons";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { auth, db } from "../constants/firebaseConfig";
import { getServices } from "../constants/servicesData";

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
  const [editingId, setEditingId] = useState<string | null>(null);
  const [step, setStep] = useState(1); // 1: Service, 2: Date/Time, 3: Stylist
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const services = getServices();

  const [form, setForm] = useState({
    service: "",
    date: "",
    time: "",
    stylist: "",
  });

  // ✅ Fetch only the bookings of the logged-in user
  const fetchBookings = async () => {
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
    }
  };

  useEffect(() => {
    fetchBookings();
  }, []);

  // 🧹 Remove duplicate bookings
  const removeDuplicates = async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      // Group bookings by unique key (service + date + time + stylist)
      const uniqueBookings = new Map();
      const duplicatesToDelete: string[] = [];

      bookings.forEach((booking) => {
        const key = `${booking.service}-${booking.date}-${booking.time}-${booking.stylist}`;
        if (uniqueBookings.has(key)) {
          // This is a duplicate, mark for deletion
          if (booking.id) {
            duplicatesToDelete.push(booking.id);
          }
        } else {
          // First occurrence, keep it
          uniqueBookings.set(key, booking);
        }
      });

      if (duplicatesToDelete.length === 0) {
        Alert.alert("No Duplicates", "No duplicate appointments found.");
        return;
      }

      Alert.alert(
        "Remove Duplicates",
        `Found ${duplicatesToDelete.length} duplicate(s). Remove them?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: async () => {
              try {
                // Delete duplicates from Firebase
                for (const id of duplicatesToDelete) {
                  await deleteDoc(doc(db, "bookings", id));
                }
                // Update local state
                setBookings(Array.from(uniqueBookings.values()));
                Alert.alert("Success", `Removed ${duplicatesToDelete.length} duplicate(s)!`);
              } catch (error) {
                console.error("Error removing duplicates:", error);
                Alert.alert("Error", "Failed to remove duplicates.");
              }
            },
          },
        ]
      );
    } catch (error) {
      console.error("Error checking duplicates:", error);
    }
  };

  // ➕ CREATE or ✏️ UPDATE
  const handleSaveBooking = async () => {
    // Prevent duplicate saves
    if (isSaving) return;
    
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

    setIsSaving(true);

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
        // Update existing booking
        await updateDoc(doc(db, "bookings", editingId), bookingData);
        // Update local state immediately
        setBookings(bookings.map(b => 
          b.id === editingId ? { ...b, ...bookingData } : b
        ));
        resetModal();
        Alert.alert("Updated", "Appointment updated successfully!");
      } else {
        // Add new booking
        const docRef = await addDoc(collection(db, "bookings"), bookingData);
        // Add to local state immediately
        setBookings([...bookings, { id: docRef.id, ...bookingData }]);
        resetModal();
        Alert.alert("Booked!", "Your appointment has been created.");
      }
    } catch (error) {
      console.error("Error saving booking:", error);
      Alert.alert("Error", "Failed to save booking. Check Firestore rules.");
      setIsSaving(false);
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
            // Remove from local state immediately
            setBookings(bookings.filter(b => b.id !== id));
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
    setStep(1);
    setModalVisible(true);
  };

  const handleSelectService = (serviceName: string) => {
    setForm({ ...form, service: serviceName });
    setStep(2);
  };

  const handleSelectDate = (day: number, month: number, year: number) => {
    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateStr = `${monthNames[month]} ${day}, ${year}`;
    setForm({ ...form, date: dateStr });
    setShowCalendar(false);
  };

  const handleNextToStylist = () => {
    if (!form.date || !form.time) {
      Alert.alert("Missing Info", "Please select date and enter time.");
      return;
    }
    setStep(3);
  };

  const resetModal = () => {
    setModalVisible(false);
    setStep(1);
    setForm({ service: "", date: "", time: "", stylist: "" });
    setEditingId(null);
    setShowCalendar(false);
    setSelectedDate(null);
    setIsSaving(false);
  };

  // Simple calendar component
  const renderCalendar = () => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDay = new Date(currentYear, currentMonth, 1).getDay();

    const monthNames = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    const days = [];
    for (let i = 0; i < firstDay; i++) {
      days.push(<View key={`empty-${i}`} style={styles.calendarDay} />);
    }
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(
        <TouchableOpacity
          key={day}
          style={styles.calendarDay}
          onPress={() => handleSelectDate(day, currentMonth, currentYear)}
        >
          <Text style={styles.calendarDayText}>{day}</Text>
        </TouchableOpacity>
      );
    }

    return (
      <View style={styles.calendarContainer}>
        <Text style={styles.calendarMonth}>{monthNames[currentMonth]} {currentYear}</Text>
        <View style={styles.calendarHeader}>
          {dayNames.map((day) => (
            <Text key={day} style={styles.calendarHeaderText}>{day}</Text>
          ))}
        </View>
        <View style={styles.calendarGrid}>{days}</View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>My Appointments 💇‍♀️</Text>

      {bookings.length === 0 ? (
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
      <TouchableOpacity 
        style={styles.addButton} 
        onPress={() => {
          setStep(1);
          setForm({ service: "", date: "", time: "", stylist: "" });
          setEditingId(null);
          setShowCalendar(false);
          setSelectedDate(null);
          setModalVisible(true);
        }}
      >
        <Ionicons name="add-circle" size={60} color="#E0A100" />
      </TouchableOpacity>

      {/* 📋 Modal Form */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={resetModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalHeader}>
              {editingId ? "Edit Appointment" : "Add Appointment"}
            </Text>

            <ScrollView showsVerticalScrollIndicator={false}>
              {/* Step 1: Select Service */}
              {step === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Select Service</Text>
                  {services.map((service) => (
                    <TouchableOpacity
                      key={service.id}
                      style={[
                        styles.serviceOption,
                        form.service === service.name && styles.serviceOptionSelected,
                      ]}
                      onPress={() => handleSelectService(service.name)}
                    >
                      <Text style={styles.serviceOptionText}>{service.name}</Text>
                      <Text style={styles.serviceOptionPrice}>{service.price}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Step 2: Select Date & Time */}
              {step === 2 && (
                <View>
                  <Text style={styles.stepTitle}>Select Date & Time</Text>
                  <Text style={styles.selectedService}>Service: {form.service}</Text>

                  {showCalendar ? (
                    renderCalendar()
                  ) : (
                    <TouchableOpacity
                      style={styles.dateButton}
                      onPress={() => setShowCalendar(true)}
                    >
                      <Text style={styles.dateButtonText}>
                        {form.date || "Select Date"}
                      </Text>
                    </TouchableOpacity>
                  )}

                  <TextInput
                    placeholder="Time (e.g. 2:00 PM)"
                    style={styles.input}
                    value={form.time}
                    onChangeText={(text) => setForm({ ...form, time: text })}
                  />

                  <View style={styles.stepActions}>
                    <TouchableOpacity
                      style={[styles.stepButton, { backgroundColor: "#999" }]}
                      onPress={() => setStep(1)}
                    >
                      <Text style={styles.stepButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.stepButton, { backgroundColor: "#6B46C1" }]}
                      onPress={handleNextToStylist}
                    >
                      <Text style={styles.stepButtonText}>Next</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Step 3: Add Stylist */}
              {step === 3 && (
                <View>
                  <Text style={styles.stepTitle}>Add Stylist</Text>
                  <Text style={styles.selectedService}>Service: {form.service}</Text>
                  <Text style={styles.selectedService}>Date: {form.date}</Text>
                  <Text style={styles.selectedService}>Time: {form.time}</Text>

                  <TextInput
                    placeholder="Stylist (e.g. Ella)"
                    style={styles.input}
                    value={form.stylist}
                    onChangeText={(text) => setForm({ ...form, stylist: text })}
                  />

                  <View style={styles.stepActions}>
                    <TouchableOpacity
                      style={[styles.stepButton, { backgroundColor: "#999" }]}
                      onPress={() => setStep(2)}
                      disabled={isSaving}
                    >
                      <Text style={styles.stepButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[styles.stepButton, { backgroundColor: isSaving ? "#999" : "#6B46C1" }]}
                      onPress={handleSaveBooking}
                      disabled={isSaving}
                    >
                      <Text style={styles.stepButtonText}>{isSaving ? "Saving..." : "Save"}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={resetModal}
            >
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
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
  modalContainer: { backgroundColor: "#fff", borderRadius: 16, width: "90%", padding: 20, maxHeight: "80%" },
  modalHeader: { fontSize: 20, fontWeight: "700", color: "#4B2E83", textAlign: "center", marginBottom: 12 },
  input: { borderWidth: 1, borderColor: "#D6BCFA", borderRadius: 10, padding: 10, marginVertical: 6, fontSize: 14 },
  stepTitle: { fontSize: 16, fontWeight: "600", color: "#4B2E83", marginBottom: 12 },
  serviceOption: { borderWidth: 1, borderColor: "#D6BCFA", borderRadius: 10, padding: 12, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  serviceOptionSelected: { backgroundColor: "#E9D8FD", borderColor: "#6B46C1" },
  serviceOptionText: { fontSize: 14, fontWeight: "600", color: "#4B2E83" },
  serviceOptionPrice: { fontSize: 12, color: "#666" },
  selectedService: { fontSize: 13, color: "#666", marginBottom: 6 },
  dateButton: { borderWidth: 1, borderColor: "#D6BCFA", borderRadius: 10, padding: 12, marginVertical: 6, alignItems: "center" },
  dateButtonText: { fontSize: 14, color: "#4B2E83" },
  stepActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 16 },
  stepButton: { flex: 1, paddingVertical: 10, borderRadius: 10, marginHorizontal: 4, alignItems: "center" },
  stepButtonText: { color: "#fff", fontWeight: "600" },
  closeButton: { marginTop: 12, paddingVertical: 8, alignItems: "center" },
  closeButtonText: { color: "#E53E3E", fontWeight: "600" },
  calendarContainer: { backgroundColor: "#fff", borderRadius: 12, padding: 12, marginVertical: 8 },
  calendarMonth: { fontSize: 14, fontWeight: "700", color: "#4B2E83", textAlign: "center", marginBottom: 8 },
  calendarHeader: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  calendarHeaderText: { fontSize: 12, fontWeight: "600", color: "#38A169", width: "14%" , textAlign: "center" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDay: { width: "14%", aspectRatio: 1, justifyContent: "center", alignItems: "center", marginBottom: 4 },
  calendarDayText: { fontSize: 13, color: "#4B2E83" },
  modalActions: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  modalButton: { flex: 1, paddingVertical: 10, borderRadius: 10, marginHorizontal: 4, alignItems: "center" },
  modalButtonText: { color: "#fff", fontWeight: "700" },
});