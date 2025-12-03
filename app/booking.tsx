// BookingScreen.tsx - React Native Version with Full CRUD
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";

import { addDoc, collection, deleteDoc, doc, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

// Booking interface
interface Booking {
  id?: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
  status: string;
  userId: string;
}

// Services/Promos data
const SERVICES = [
  'Premium Haircut',
  'Color Treatment',
  'Hair Styling',
  'Keratin Treatment',
  'Hair Spa',
  'Balayage',
  'Highlights'
];

// Stylists data
const STYLISTS = ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Alex Rodriguez'];

// Time slots
const TIME_SLOTS = [
  '09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM',
  '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'
];

// Generate available dates (excluding Sundays)
const generateAvailableDates = () => {
  const dates: string[] = [];
  const today = new Date();
  
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    
    // Skip Sundays (day 0)
    if (date.getDay() !== 0) {
      dates.push(date.toISOString().split('T')[0]);
    }
  }
  
  return dates;
};

const AVAILABLE_DATES = generateAvailableDates();

export default function BookingScreen({ isAdmin = false }: { isAdmin?: boolean }) {
  const { openModal, step: stepParam } = useLocalSearchParams<{ openModal?: string; step?: string }>();

  const [bookings, setBookings] = useState<Booking[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  
  // Booking steps
  const [step, setStep] = useState(1); // 1: service, 2: date, 3: time, 4: stylist
  const [selectedService, setSelectedService] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStylist, setSelectedStylist] = useState('');
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Fetch bookings
  useEffect(() => {
    let q;
    if (isAdmin) {
      q = collection(database, "bookings");
    } else {
      const user = Authentication.currentUser;
      if (!user) return;
      q = query(collection(database, "bookings"), where("userId", "==", user.uid));
    }

    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      const data: Booking[] = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...(docSnap.data() as any),
      }));
      setBookings(data);
    });

    return () => unsubscribe();
  }, [isAdmin]);

  // Open modal via route params (e.g., from Promo Deals) without touching Firebase
  useEffect(() => {
    if (openModal === '1') {
      const parsedStep = parseInt(stepParam || '2', 10);
      setStep(isNaN(parsedStep) ? 2 : Math.max(1, Math.min(4, parsedStep)));
      setModalVisible(true);
    }
    // run once on mount when params present
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Calendar functions
  const getCalendarDates = () => {
    const dates: Date[] = [];
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const startDay = startOfMonth.getDay();
    
    const firstDate = new Date(startOfMonth);
    firstDate.setDate(firstDate.getDate() - startDay);
    
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const isDateAvailable = (date: Date) => {
    const dateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < today) return false;
    
    if (date.getMonth() !== currentMonth.getMonth() || date.getFullYear() !== currentMonth.getFullYear()) {
      return false;
    }
    
    return AVAILABLE_DATES.includes(dateStr);
  };

  const previousMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() - 1);
    setCurrentMonth(newMonth);
  };

  const nextMonth = () => {
    const newMonth = new Date(currentMonth);
    newMonth.setMonth(currentMonth.getMonth() + 1);
    setCurrentMonth(newMonth);
  };

  const getMonthYear = () => {
    return currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  };

  // Open new booking modal
  const openNewBooking = () => {
    setEditingBooking(null);
    setSelectedService('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedStylist('');
    setStep(1);
    setModalVisible(true);
  };

  // Open edit booking modal - NEW FUNCTION
  const openEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedService(booking.service);
    setSelectedDate(booking.date);
    setSelectedTime(booking.time);
    setSelectedStylist(booking.stylist);
    setStep(1);
    setModalVisible(true);
  };

  // Step handlers
  const handleServiceSelect = (service: string) => {
    setSelectedService(service);
    setStep(2);
  };

  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setStep(3);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setStep(4);
  };

  const handleStylistSelect = (stylist: string) => {
    setSelectedStylist(stylist);
  };

  // Save booking
  const saveBooking = () => {
    const user = Authentication.currentUser;
    if (!user && !isAdmin) {
      Alert.alert("Error", "You must be logged in.");
      return;
    }

    if (!selectedService || !selectedDate || !selectedTime || !selectedStylist) {
      Alert.alert("Missing info", "Please complete all steps.");
      return;
    }

    const data = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      stylist: selectedStylist,
      status: editingBooking ? editingBooking.status : "pending",
      userId: isAdmin && editingBooking ? editingBooking.userId : user?.uid,
    };

    if (editingBooking?.id) {
      updateDoc(doc(database, "bookings", editingBooking.id), data)
        .then(() => {
          Alert.alert("Updated", "Booking updated successfully!");
          setModalVisible(false);
          setEditingBooking(null);
        })
        .catch((err: any) => {
          console.error(err);
          Alert.alert("Error", "Failed to update booking.");
        });
    } else {
      addDoc(collection(database, "bookings"), data)
        .then(() => {
          Alert.alert("Success", "Booking created successfully!");
          setModalVisible(false);
        })
        .catch((err: any) => {
          console.error(err);
          Alert.alert("Error", "Failed to create booking.");
        });
    }
  };

  // Delete booking
  const deleteBooking = (id?: string) => {
    if (!id) return;
    Alert.alert("Delete Booking", "Are you sure you want to delete this booking?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          deleteDoc(doc(database, "bookings", id))
            .then(() => Alert.alert("Deleted", "Booking deleted successfully."))
            .catch((err: any) => {
              console.error(err);
              Alert.alert("Error", "Failed to delete booking.");
            });
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>{isAdmin ? "All Bookings (Admin)" : "My Bookings"}</Text>

      <FlatList
        data={bookings}
        keyExtractor={(item) => item.id || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>{item.service}</Text>
            <Text style={styles.cardText}>📅 {item.date}</Text>
            <Text style={styles.cardText}>🕐 {item.time}</Text>
            <Text style={styles.cardText}>✂️ {item.stylist}</Text>
            <View style={[styles.statusBadge, item.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>

            <View style={styles.actions}>
              {/* EDIT BUTTON - NEW */}
              {(isAdmin || item.status === "pending") && (
                <TouchableOpacity style={styles.buttonEdit} onPress={() => openEditBooking(item)}>
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
              )}
              
              {/* DELETE BUTTON */}
              {(isAdmin || item.status === "pending") && (
                <TouchableOpacity style={styles.buttonDelete} onPress={() => deleteBooking(item.id)}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />

      <TouchableOpacity style={styles.addButton} onPress={openNewBooking}>
        <Ionicons name="add-circle" size={60} color="#E0A100" />
      </TouchableOpacity>

      {/* Booking Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            {/* Header with close button */}
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingBooking ? "Edit Appointment" : "Book Appointment"}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color="#666" />
              </TouchableOpacity>
            </View>

            {/* Progress Steps */}
            <View style={styles.progressContainer}>
              {[1, 2, 3, 4].map((s) => (
                <View key={s} style={styles.progressStep}>
                  <View style={[styles.progressCircle, step >= s && styles.progressCircleActive]}>
                    <Text style={[styles.progressNumber, step >= s && styles.progressNumberActive]}>{s}</Text>
                  </View>
                  {s < 4 && <View style={[styles.progressLine, step > s && styles.progressLineActive]} />}
                </View>
              ))}
            </View>
            <View style={styles.progressLabels}>
              <Text style={styles.progressLabel}>Service</Text>
              <Text style={styles.progressLabel}>Date</Text>
              <Text style={styles.progressLabel}>Time</Text>
              <Text style={styles.progressLabel}>Stylist</Text>
            </View>

            <ScrollView style={styles.modalContent}>
              {/* Step 1: Select Service */}
              {step === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Select a Service</Text>
                  {SERVICES.map((service) => (
                    <TouchableOpacity
                      key={service}
                      style={[
                        styles.serviceButton,
                        selectedService === service && styles.serviceButtonSelected
                      ]}
                      onPress={() => handleServiceSelect(service)}
                    >
                      <Ionicons 
                        name="cut" 
                        size={20} 
                        color={selectedService === service ? "#fff" : "#E0A100"} 
                      />
                      <Text style={[
                        styles.serviceText,
                        selectedService === service && styles.serviceTextSelected
                      ]}>
                        {service}
                      </Text>
                      <Ionicons name="chevron-forward" size={20} color={selectedService === service ? "#fff" : "#999"} />
                    </TouchableOpacity>
                  ))}
                </View>
              )}

              {/* Step 2: Select Date */}
              {step === 2 && (
                <View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                    <Ionicons name="arrow-back" size={20} color="#E0A100" />
                    <Text style={styles.backText}>Back to services</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.selectionSummary}>
                    <Text style={styles.summaryText}>Service: <Text style={styles.summaryBold}>{selectedService}</Text></Text>
                  </View>

                  <Text style={styles.stepTitle}>Select a Date</Text>
                  
                  {/* Month Navigation */}
                  <View style={styles.monthNavigation}>
                    <TouchableOpacity onPress={previousMonth} style={styles.monthButton}>
                      <Ionicons name="chevron-back" size={24} color="#333" />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{getMonthYear()}</Text>
                    <TouchableOpacity onPress={nextMonth} style={styles.monthButton}>
                      <Ionicons name="chevron-forward" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <Text style={styles.calendarHint}>Green dates are available</Text>

                  {/* Calendar */}
                  <View style={styles.calendar}>
                    <View style={styles.weekDays}>
                      {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, idx) => (
                        <Text key={idx} style={styles.weekDay}>{day}</Text>
                      ))}
                    </View>
                    <View style={styles.calendarGrid}>
                      {getCalendarDates().map((date, idx) => {
                        const isAvailable = isDateAvailable(date);
                        const dateStr = formatDate(date);
                        const isSelected = selectedDate === dateStr;
                        const isCurrentMonth = date.getMonth() === currentMonth.getMonth();

                        return (
                          <TouchableOpacity
                            key={idx}
                            onPress={() => isAvailable && handleDateSelect(dateStr)}
                            disabled={!isAvailable}
                            style={[
                              styles.calendarDay,
                              isSelected && styles.calendarDaySelected,
                              isAvailable && styles.calendarDayAvailable,
                              !isCurrentMonth && styles.calendarDayOtherMonth
                            ]}
                          >
                            <Text style={[
                              styles.calendarDayText,
                              isSelected && styles.calendarDayTextSelected,
                              isAvailable && !isSelected && styles.calendarDayTextAvailable,
                              !isAvailable && styles.calendarDayTextDisabled
                            ]}>
                              {date.getDate()}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                </View>
              )}

              {/* Step 3: Select Time */}
              {step === 3 && (
                <View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                    <Ionicons name="arrow-back" size={20} color="#E0A100" />
                    <Text style={styles.backText}>Back to calendar</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.selectionSummary}>
                    <Text style={styles.summaryText}>Service: <Text style={styles.summaryBold}>{selectedService}</Text></Text>
                    <Text style={styles.summaryText}>Date: <Text style={styles.summaryBold}>{selectedDate}</Text></Text>
                  </View>

                  <Text style={styles.stepTitle}>Select Time</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeSlot, selectedTime === time && styles.timeSlotSelected]}
                        onPress={() => handleTimeSelect(time)}
                      >
                        <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {/* Step 4: Select Stylist */}
              {step === 4 && (
                <View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
                    <Ionicons name="arrow-back" size={20} color="#E0A100" />
                    <Text style={styles.backText}>Back to time</Text>
                  </TouchableOpacity>
                  
                  <View style={styles.selectionSummary}>
                    <Text style={styles.summaryText}>Service: <Text style={styles.summaryBold}>{selectedService}</Text></Text>
                    <Text style={styles.summaryText}>Date: <Text style={styles.summaryBold}>{selectedDate}</Text></Text>
                    <Text style={styles.summaryText}>Time: <Text style={styles.summaryBold}>{selectedTime}</Text></Text>
                  </View>

                  <Text style={styles.stepTitle}>Select Stylist</Text>
                  {STYLISTS.map((stylist) => (
                    <TouchableOpacity
                      key={stylist}
                      style={[styles.stylistButton, selectedStylist === stylist && styles.stylistButtonSelected]}
                      onPress={() => handleStylistSelect(stylist)}
                    >
                      <Ionicons name="person" size={20} color={selectedStylist === stylist ? "#fff" : "#E0A100"} />
                      <Text style={[styles.stylistText, selectedStylist === stylist && styles.stylistTextSelected]}>{stylist}</Text>
                      {selectedStylist === stylist && <Ionicons name="checkmark-circle" size={20} color="#fff" />}
                    </TouchableOpacity>
                  ))}

                  {selectedStylist && (
                    <View style={styles.finalActions}>
                      <TouchableOpacity style={styles.confirmButton} onPress={saveBooking}>
                        <Text style={styles.confirmButtonText}>
                          {editingBooking ? "Update Booking" : "Confirm Booking"}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#FFF7E6" },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 12, textAlign: "center" },
  card: { backgroundColor: "#fff", padding: 16, borderRadius: 12, marginBottom: 12, elevation: 2, shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8, color: "#333" },
  cardText: { marginBottom: 4, fontSize: 14, color: "#666" },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  statusConfirmed: { backgroundColor: "#10B981" },
  statusPending: { backgroundColor: "#F59E0B" },
  statusText: { color: "#fff", fontSize: 12, fontWeight: "600" },
  actions: { flexDirection: "row", marginTop: 12, gap: 8 },
  buttonEdit: { flex: 1, backgroundColor: "#3B82F6", padding: 10, borderRadius: 8, alignItems: "center" },
  buttonDelete: { flex: 1, backgroundColor: "#E53E3E", padding: 10, borderRadius: 8, alignItems: "center" },
  buttonText: { color: "#fff", fontWeight: "600" },
  addButton: { position: "absolute", bottom: 20, right: 20 },
  
  // Modal styles
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContainer: { backgroundColor: "#fff", borderRadius: 16, maxHeight: "90%", overflow: "hidden" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
  modalTitle: { fontSize: 20, fontWeight: "700" },
  modalContent: { padding: 16 },
  
  // Progress styles
  progressContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 16, paddingTop: 16 },
  progressStep: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#E5E7EB", justifyContent: "center", alignItems: "center" },
  progressCircleActive: { backgroundColor: "#E0A100" },
  progressNumber: { fontSize: 14, fontWeight: "600", color: "#666" },
  progressNumberActive: { color: "#fff" },
  progressLine: { flex: 1, height: 2, backgroundColor: "#E5E7EB", marginHorizontal: 4 },
  progressLineActive: { backgroundColor: "#E0A100" },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingTop: 8, paddingBottom: 16 },
  progressLabel: { fontSize: 10, color: "#666", flex: 1, textAlign: "center" },
  
  // Step styles
  stepTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: "#333" },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  backText: { marginLeft: 8, color: "#E0A100", fontSize: 14, fontWeight: "600" },
  selectionSummary: { backgroundColor: "#FFF7E6", padding: 12, borderRadius: 8, marginBottom: 16 },
  summaryText: { fontSize: 13, color: "#666", marginBottom: 4 },
  summaryBold: { fontWeight: "700", color: "#333" },
  
  // Service selection
  serviceButton: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 10, marginBottom: 10 },
  serviceButtonSelected: { backgroundColor: "#E0A100", borderColor: "#E0A100" },
  serviceText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: "500", color: "#333" },
  serviceTextSelected: { color: "#fff", fontWeight: "700" },
  
  // Calendar styles
  monthNavigation: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "#FFF7E6", padding: 12, borderRadius: 8, marginBottom: 8 },
  monthButton: { padding: 8 },
  monthText: { fontSize: 16, fontWeight: "700", color: "#333" },
  calendarHint: { fontSize: 12, color: "#666", marginBottom: 12, textAlign: "center" },
  calendar: { marginBottom: 16 },
  weekDays: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  weekDay: { fontSize: 12, fontWeight: "600", color: "#666", width: 40, textAlign: "center" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDay: { width: "14.28%", aspectRatio: 1, justifyContent: "center", alignItems: "center", padding: 4 },
  calendarDayAvailable: { backgroundColor: "#D1FAE5", borderWidth: 2, borderColor: "#10B981", borderRadius: 8 },
  calendarDaySelected: { backgroundColor: "#E0A100", borderColor: "#E0A100" },
  calendarDayOtherMonth: { opacity: 0.3 },
  calendarDayText: { fontSize: 14, color: "#999" },
  calendarDayTextAvailable: { color: "#059669", fontWeight: "600" },
  calendarDayTextSelected: { color: "#fff", fontWeight: "700" },
  calendarDayTextDisabled: { color: "#D1D5DB" },
  
  // Time selection
  timeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  timeSlot: { width: "48%", padding: 16, backgroundColor: "#fff", borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 8, marginBottom: 10, alignItems: "center" },
  timeSlotSelected: { backgroundColor: "#E0A100", borderColor: "#E0A100" },
  timeText: { fontSize: 14, fontWeight: "500", color: "#333" },
  timeTextSelected: { color: "#fff", fontWeight: "700" },
  
  // Stylist selection
  stylistButton: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: "#fff", borderWidth: 2, borderColor: "#E5E7EB", borderRadius: 10, marginBottom: 10 },
  stylistButtonSelected: { backgroundColor: "#E0A100", borderColor: "#E0A100" },
  stylistText: { flex: 1, marginLeft: 12, fontSize: 15, fontWeight: "500", color: "#333" },
  stylistTextSelected: { color: "#fff", fontWeight: "700" },
  
  // Final actions
  finalActions: { marginTop: 16 },
  confirmButton: { backgroundColor: "#10B981", padding: 16, borderRadius: 10, alignItems: "center" },
  confirmButtonText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});