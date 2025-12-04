import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { addDoc, collection, deleteDoc, doc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Alert, FlatList, Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

const COLORS = {
  primary: '#9333EA',
  primaryLight: '#C084FC',
  primaryBg: '#FAF5FF',
  white: '#FFFFFF',
  text: '#1F2937',
  textLight: '#6B7280',
  border: '#E5E7EB',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
};

interface Booking {
  id?: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
  status: string;
  userId: string;
}

const STYLISTS = ['Sarah Johnson', 'Mike Chen', 'Emma Davis', 'Alex Rodriguez'];
const TIME_SLOTS = ['09:00 AM', '10:00 AM', '11:00 AM', '12:00 PM', '01:00 PM', '02:00 PM', '03:00 PM', '04:00 PM', '05:00 PM'];

const generateAvailableDates = () => {
  const dates: string[] = [];
  const today = new Date();
  for (let i = 0; i < 60; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() + i);
    if (date.getDay() !== 0) dates.push(date.toISOString().split('T')[0]);
  }
  return dates;
};

const AVAILABLE_DATES = generateAvailableDates();

export default function BookingScreen({ isAdmin = false }: { isAdmin?: boolean }) {
  const { openModal, step: stepParam, serviceName, servicePrice } = useLocalSearchParams<{ 
    openModal?: string; 
    step?: string; 
    serviceName?: string;
    servicePrice?: string;
  }>();
  
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [services, setServices] = useState<any[]>([]);
  const [loadingServices, setLoadingServices] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [step, setStep] = useState(1);
  const [selectedService, setSelectedService] = useState('');
  const [selectedServicePrice, setSelectedServicePrice] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [selectedStylist, setSelectedStylist] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const servicesSnapshot = await getDocs(collection(database, "services"));
        const servicesArray = servicesSnapshot.docs.map((doc: { id: any; data: () => { (): any; new(): any; name: any; price: any; }; }) => ({
          id: doc.id,
          name: doc.data().name || "Service",
          price: doc.data().price || "",
        }));
        setServices(servicesArray);
      } catch (error) {
        console.error("Error fetching services:", error);
      } finally {
        setLoadingServices(false);
      }
    };
    fetchServices();
  }, []);

  useEffect(() => {
    const user = Authentication.currentUser;
    if (!user && !isAdmin) return;
    const q = isAdmin ? collection(database, "bookings") : query(collection(database, "bookings"), where("userId", "==", user!.uid));
    const unsubscribe = onSnapshot(q, (snapshot: any) => {
      setBookings(snapshot.docs.map((docSnap: any) => ({ id: docSnap.id, ...docSnap.data() })));
    });
    return () => unsubscribe();
  }, [isAdmin]);

  useEffect(() => {
    if (openModal === '1') {
      // If coming from services screen with pre-selected service
      if (serviceName) {
        setSelectedService(serviceName);
        setSelectedServicePrice(servicePrice || '');
        setStep(2); // Start at date selection step
      } else {
        const initialStep = parseInt(stepParam || '1', 10);
        setStep(initialStep);
      }
      
      setModalVisible(true);
    }
  }, [openModal, stepParam, serviceName, servicePrice]);

  const getCalendarDates = () => {
    const dates: Date[] = [];
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const firstDate = new Date(startOfMonth);
    firstDate.setDate(firstDate.getDate() - startOfMonth.getDay());
    for (let i = 0; i < 42; i++) {
      const date = new Date(firstDate);
      date.setDate(firstDate.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const formatDate = (date: Date) => date.toISOString().split('T')[0];

  const isDateAvailable = (date: Date) => {
    const dateStr = formatDate(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const checkDate = new Date(date);
    checkDate.setHours(0, 0, 0, 0);
    if (checkDate < today) return false;
    if (date.getMonth() !== currentMonth.getMonth()) return false;
    return AVAILABLE_DATES.includes(dateStr);
  };

  const openNewBooking = () => {
    setEditingBooking(null);
    setSelectedService('');
    setSelectedServicePrice('');
    setSelectedDate('');
    setSelectedTime('');
    setSelectedStylist('');
    setStep(1);
    setModalVisible(true);
  };

  const openEditBooking = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedService(booking.service);
    setSelectedDate(booking.date);
    setSelectedTime(booking.time);
    setSelectedStylist(booking.stylist);
    setStep(1);
    setModalVisible(true);
  };

  const saveBooking = () => {
    const user = Authentication.currentUser;
    if (!user && !isAdmin) return Alert.alert("Error", "You must be logged in.");
    if (!selectedService || !selectedDate || !selectedTime || !selectedStylist) {
      return Alert.alert("Missing info", "Please complete all steps.");
    }

    const data = {
      service: selectedService,
      date: selectedDate,
      time: selectedTime,
      stylist: selectedStylist,
      status: editingBooking ? editingBooking.status : "pending",
      userId: isAdmin && editingBooking ? editingBooking.userId : user?.uid,
    };

    const action = editingBooking?.id 
      ? updateDoc(doc(database, "bookings", editingBooking.id), data)
      : addDoc(collection(database, "bookings"), data);

    action
      .then(() => {
        Alert.alert("Success", editingBooking ? "Booking updated!" : "Booking created!");
        setModalVisible(false);
        setEditingBooking(null);
      })
      .catch((err: any) => {
        console.error(err);
        Alert.alert("Error", "Failed to save booking.");
      });
  };

  const deleteBooking = (id?: string) => {
    if (!id) return;
    Alert.alert("Delete Booking", "Are you sure?", [
      { text: "No", style: "cancel" },
      {
        text: "Yes",
        style: "destructive",
        onPress: () => {
          deleteDoc(doc(database, "bookings", id))
            .then(() => Alert.alert("Deleted", "Booking deleted."))
            .catch(() => Alert.alert("Error", "Failed to delete."));
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
            <View style={styles.cardDetail}>
              <Ionicons name="calendar-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.cardText}>{item.date}</Text>
            </View>
            <View style={styles.cardDetail}>
              <Ionicons name="time-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.cardText}>{item.time}</Text>
            </View>
            <View style={styles.cardDetail}>
              <Ionicons name="person-outline" size={16} color={COLORS.textLight} />
              <Text style={styles.cardText}>{item.stylist}</Text>
            </View>
            <View style={[styles.statusBadge, item.status === 'confirmed' ? styles.statusConfirmed : styles.statusPending]}>
              <Text style={styles.statusText}>{item.status}</Text>
            </View>

            {(isAdmin || item.status === "pending") && (
              <View style={styles.actions}>
                <TouchableOpacity style={styles.buttonEdit} onPress={() => openEditBooking(item)}>
                  <Ionicons name="create-outline" size={18} color={COLORS.white} />
                  <Text style={styles.buttonText}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.buttonDelete} onPress={() => deleteBooking(item.id)}>
                  <Ionicons name="trash-outline" size={18} color={COLORS.white} />
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyTitle}>No Bookings Yet</Text>
            <Text style={styles.emptyText}>Tap the button below to create your first booking</Text>
          </View>
        }
      />

      <TouchableOpacity style={styles.addButton} onPress={openNewBooking}>
        <Ionicons name="add-circle" size={60} color={COLORS.primary} />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{editingBooking ? "Edit Appointment" : "Book Appointment"}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={28} color={COLORS.textLight} />
              </TouchableOpacity>
            </View>

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
              {['Service', 'Date', 'Time', 'Stylist'].map((label, i) => (
                <Text key={i} style={styles.progressLabel}>{label}</Text>
              ))}
            </View>

            <ScrollView style={styles.modalContent}>
              {step === 1 && (
                <View>
                  <Text style={styles.stepTitle}>Select a Service</Text>
                  {loadingServices ? (
                    <View style={styles.loadingContainer}>
                      <ActivityIndicator size="large" color={COLORS.primary} />
                    </View>
                  ) : services.length > 0 ? (
                    services.map((service) => (
                      <TouchableOpacity
                        key={service.id}
                        style={[styles.optionButton, selectedService === service.name && styles.optionButtonSelected]}
                        onPress={() => { 
                          setSelectedService(service.name); 
                          setSelectedServicePrice(service.price);
                          setStep(2); 
                        }}
                      >
                        <Ionicons name="cut-outline" size={20} color={selectedService === service.name ? COLORS.white : COLORS.primary} />
                        <View style={styles.optionInfo}>
                          <Text style={[styles.optionText, selectedService === service.name && styles.optionTextSelected]}>{service.name}</Text>
                          {service.price && <Text style={[styles.optionPrice, selectedService === service.name && styles.optionPriceSelected]}>₱{service.price}</Text>}
                        </View>
                        <Ionicons name="chevron-forward" size={20} color={selectedService === service.name ? COLORS.white : COLORS.textLight} />
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyServices}>
                      <Text style={styles.emptyText}>No services available</Text>
                    </View>
                  )}
                </View>
              )}

              {step === 2 && (
                <View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setStep(1)}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
                  <View style={styles.summary}>
                    <Text style={styles.summaryText}>
                      Service: <Text style={styles.summaryBold}>{selectedService}</Text>
                      {selectedServicePrice && <Text style={styles.summaryPrice}> (₱{selectedServicePrice})</Text>}
                    </Text>
                  </View>
                  <Text style={styles.stepTitle}>Select a Date</Text>
                  <View style={styles.monthNav}>
                    <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}>
                      <Ionicons name="chevron-back" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                    <Text style={styles.monthText}>{currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</Text>
                    <TouchableOpacity onPress={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}>
                      <Ionicons name="chevron-forward" size={24} color={COLORS.text} />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.weekDays}>
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <Text key={i} style={styles.weekDay}>{day}</Text>)}
                  </View>
                  <View style={styles.calendarGrid}>
                    {getCalendarDates().map((date, i) => {
                      const isAvailable = isDateAvailable(date);
                      const dateStr = formatDate(date);
                      const isSelected = selectedDate === dateStr;
                      return (
                        <TouchableOpacity
                          key={i}
                          onPress={() => { if (isAvailable) { setSelectedDate(dateStr); setStep(3); } }}
                          disabled={!isAvailable}
                          style={[styles.calendarDay, isSelected && styles.calendarDaySelected, isAvailable && styles.calendarDayAvailable]}
                        >
                          <Text style={[styles.calendarDayText, isSelected && styles.calendarDayTextSelected, isAvailable && styles.calendarDayTextAvailable]}>
                            {date.getDate()}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                </View>
              )}

              {step === 3 && (
                <View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setStep(2)}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
                  <View style={styles.summary}>
                    <Text style={styles.summaryText}>
                      Service: <Text style={styles.summaryBold}>{selectedService}</Text>
                      {selectedServicePrice && <Text style={styles.summaryPrice}> (₱{selectedServicePrice})</Text>}
                    </Text>
                    <Text style={styles.summaryText}>Date: <Text style={styles.summaryBold}>{selectedDate}</Text></Text>
                  </View>
                  <Text style={styles.stepTitle}>Select Time</Text>
                  <View style={styles.timeGrid}>
                    {TIME_SLOTS.map((time) => (
                      <TouchableOpacity
                        key={time}
                        style={[styles.timeSlot, selectedTime === time && styles.timeSlotSelected]}
                        onPress={() => { setSelectedTime(time); setStep(4); }}
                      >
                        <Ionicons name="time-outline" size={18} color={selectedTime === time ? COLORS.white : COLORS.primary} />
                        <Text style={[styles.timeText, selectedTime === time && styles.timeTextSelected]}>{time}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              )}

              {step === 4 && (
                <View>
                  <TouchableOpacity style={styles.backButton} onPress={() => setStep(3)}>
                    <Ionicons name="arrow-back" size={20} color={COLORS.primary} />
                    <Text style={styles.backText}>Back</Text>
                  </TouchableOpacity>
                  <View style={styles.summary}>
                    <Text style={styles.summaryText}>
                      Service: <Text style={styles.summaryBold}>{selectedService}</Text>
                      {selectedServicePrice && <Text style={styles.summaryPrice}> (₱{selectedServicePrice})</Text>}
                    </Text>
                    <Text style={styles.summaryText}>Date: <Text style={styles.summaryBold}>{selectedDate}</Text></Text>
                    <Text style={styles.summaryText}>Time: <Text style={styles.summaryBold}>{selectedTime}</Text></Text>
                  </View>
                  <Text style={styles.stepTitle}>Select Stylist</Text>
                  {STYLISTS.map((stylist) => (
                    <TouchableOpacity
                      key={stylist}
                      style={[styles.optionButton, selectedStylist === stylist && styles.optionButtonSelected]}
                      onPress={() => setSelectedStylist(stylist)}
                    >
                      <Ionicons name="person-circle-outline" size={24} color={selectedStylist === stylist ? COLORS.white : COLORS.primary} />
                      <Text style={[styles.optionText, selectedStylist === stylist && styles.optionTextSelected, { flex: 1, marginLeft: 12 }]}>{stylist}</Text>
                      {selectedStylist === stylist && <Ionicons name="checkmark-circle" size={24} color={COLORS.white} />}
                    </TouchableOpacity>
                  ))}
                  {selectedStylist && (
                    <TouchableOpacity style={styles.confirmButton} onPress={saveBooking}>
                      <Ionicons name="checkmark-circle-outline" size={24} color={COLORS.white} />
                      <Text style={styles.confirmButtonText}>{editingBooking ? "Update Booking" : "Confirm Booking"}</Text>
                    </TouchableOpacity>
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
  container: { flex: 1, padding: 16, backgroundColor: COLORS.primaryBg },
  header: { fontSize: 24, fontWeight: "700", marginBottom: 16, color: COLORS.text, textAlign: "center" },
  card: { backgroundColor: COLORS.white, padding: 16, borderRadius: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border },
  cardTitle: { fontSize: 18, fontWeight: "700", marginBottom: 12, color: COLORS.text },
  cardDetail: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 6 },
  cardText: { fontSize: 14, color: COLORS.textLight },
  statusBadge: { alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12, marginTop: 12 },
  statusConfirmed: { backgroundColor: COLORS.success },
  statusPending: { backgroundColor: COLORS.warning },
  statusText: { color: COLORS.white, fontSize: 12, fontWeight: "700", textTransform: 'uppercase' },
  actions: { flexDirection: "row", marginTop: 12, gap: 8 },
  buttonEdit: { flex: 1, backgroundColor: COLORS.primary, padding: 12, borderRadius: 10, alignItems: "center", flexDirection: 'row', justifyContent: 'center', gap: 6 },
  buttonDelete: { flex: 1, backgroundColor: COLORS.danger, padding: 12, borderRadius: 10, alignItems: "center", flexDirection: 'row', justifyContent: 'center', gap: 6 },
  buttonText: { color: COLORS.white, fontWeight: "600", fontSize: 14 },
  addButton: { position: "absolute", bottom: 20, right: 20 },
  emptyState: { alignItems: 'center', paddingVertical: 60 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: COLORS.text, marginTop: 16, marginBottom: 8 },
  emptyText: { fontSize: 14, color: COLORS.textLight, textAlign: 'center' },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 16 },
  modalContainer: { backgroundColor: COLORS.white, borderRadius: 20, maxHeight: "90%", overflow: "hidden" },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 20, borderBottomWidth: 1, borderBottomColor: COLORS.border },
  modalTitle: { fontSize: 20, fontWeight: "700", color: COLORS.text },
  modalContent: { padding: 20 },
  progressContainer: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 20, paddingTop: 20 },
  progressStep: { flexDirection: "row", alignItems: "center", flex: 1 },
  progressCircle: { width: 32, height: 32, borderRadius: 16, backgroundColor: COLORS.border, justifyContent: "center", alignItems: "center" },
  progressCircleActive: { backgroundColor: COLORS.primary },
  progressNumber: { fontSize: 14, fontWeight: "700", color: COLORS.textLight },
  progressNumberActive: { color: COLORS.white },
  progressLine: { flex: 1, height: 2, backgroundColor: COLORS.border, marginHorizontal: 4 },
  progressLineActive: { backgroundColor: COLORS.primary },
  progressLabels: { flexDirection: "row", justifyContent: "space-between", paddingHorizontal: 8, paddingTop: 8, paddingBottom: 16 },
  progressLabel: { fontSize: 10, color: COLORS.textLight, flex: 1, textAlign: "center", fontWeight: '600' },
  stepTitle: { fontSize: 18, fontWeight: "700", marginBottom: 16, color: COLORS.text },
  backButton: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  backText: { marginLeft: 8, color: COLORS.primary, fontSize: 14, fontWeight: "600" },
  summary: { backgroundColor: COLORS.primaryBg, padding: 16, borderRadius: 12, marginBottom: 20, borderWidth: 1, borderColor: COLORS.primaryLight },
  summaryText: { fontSize: 13, color: COLORS.textLight, marginBottom: 4 },
  summaryBold: { fontWeight: "700", color: COLORS.text },
  summaryPrice: { fontWeight: "700", color: COLORS.primary },
  loadingContainer: { alignItems: 'center', paddingVertical: 40 },
  optionButton: { flexDirection: "row", alignItems: "center", padding: 16, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, marginBottom: 12 },
  optionButtonSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  optionInfo: { flex: 1, marginLeft: 12 },
  optionText: { fontSize: 15, fontWeight: "600", color: COLORS.text },
  optionTextSelected: { color: COLORS.white, fontWeight: "700" },
  optionPrice: { fontSize: 13, fontWeight: "600", color: COLORS.primary, marginTop: 2 },
  optionPriceSelected: { color: COLORS.white, opacity: 0.9 },
  emptyServices: { alignItems: 'center', paddingVertical: 40 },
  monthNav: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: COLORS.primaryBg, padding: 12, borderRadius: 12, marginBottom: 12 },
  monthText: { fontSize: 16, fontWeight: "700", color: COLORS.text },
  weekDays: { flexDirection: "row", justifyContent: "space-around", marginBottom: 8 },
  weekDay: { fontSize: 12, fontWeight: "700", color: COLORS.textLight, width: 40, textAlign: "center" },
  calendarGrid: { flexDirection: "row", flexWrap: "wrap" },
  calendarDay: { width: "14.28%", aspectRatio: 1, justifyContent: "center", alignItems: "center", padding: 4 },
  calendarDayAvailable: { backgroundColor: COLORS.primaryBg, borderWidth: 2, borderColor: COLORS.primary, borderRadius: 8 },
  calendarDaySelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  calendarDayText: { fontSize: 14, color: COLORS.textLight },
  calendarDayTextAvailable: { color: COLORS.primary, fontWeight: "600" },
  calendarDayTextSelected: { color: COLORS.white, fontWeight: "700" },
  timeGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  timeSlot: { width: "48%", padding: 16, backgroundColor: COLORS.white, borderWidth: 2, borderColor: COLORS.border, borderRadius: 12, marginBottom: 12, alignItems: "center", flexDirection: 'row', justifyContent: 'center', gap: 8 },
  timeSlotSelected: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  timeText: { fontSize: 14, fontWeight: "600", color: COLORS.text },
  timeTextSelected: { color: COLORS.white, fontWeight: "700" },
  confirmButton: { backgroundColor: COLORS.success, padding: 16, borderRadius: 12, alignItems: "center", flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 20 },
  confirmButtonText: { color: COLORS.white, fontSize: 16, fontWeight: "700" },
});