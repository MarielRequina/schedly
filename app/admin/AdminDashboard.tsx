import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { database } from "../../constants/firebaseConfig";

interface Booking {
  id: string;
  userId: string;
  userName: string;
  service: string;
  date: string;
  time: string;
  stylist?: string;
  status: "pending" | "approved" | "rejected" | "completed";
  createdAt?: string;
}

export default function AdminDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<
    "all" | "pending" | "approved" | "rejected" | "completed"
  >("all");

  // 🔥 FETCH ALL BOOKINGS
  const fetchBookings = async () => {
    try {
      setLoading(true);
      const q = query(collection(database, "bookings"), orderBy("date", "desc"));
      
      const unsubscribe = onSnapshot(q, async (snapshot) => {
        const bookingList: Booking[] = [];
        
        // Process all documents in parallel
        const promises = snapshot.docs.map(async (docSnap) => {
          const data = docSnap.data();
          let userName = data.userName || "Unknown User";

          // Only fetch user if userName is not already available
          if (data.userId && !data.userName) {
            try {
              const userRef = doc(database, "users", data.userId);
              const userSnap = await getDoc(userRef);
              if (userSnap.exists()) {
                const u = userSnap.data();
                userName = u.name || u.username || "Unnamed User";
              }
            } catch (e) {
              console.log("Error fetching user:", e);
            }
          }

          return {
            id: docSnap.id,
            userId: data.userId || "",
            userName,
            service: data.service || data.serviceName || "",
            date: data.date || data.dateString || "",
            time: data.time || data.timeString || "",
            stylist: data.stylist || data.stylistName || "",
            status: data.status || "pending",
            createdAt: data.createdAt || data.updatedAt || new Date().toISOString(),
          };
        });

        const bookingsData = await Promise.all(promises);
        setBookings(bookingsData);
        setLoading(false);
      }, (error) => {
        console.error("Error in onSnapshot:", error);
        setLoading(false);
        Alert.alert("Error", "Failed to load bookings. Please check your connection.");
      });

      return () => unsubscribe();
    } catch (error) {
      console.error("Error in fetchBookings:", error);
      setLoading(false);
      Alert.alert("Error", "Failed to load bookings. Please try again.");
    }
  };

  // Use useFocusEffect to refetch when screen comes into focus
  useFocusEffect(
    React.useCallback(() => {
      fetchBookings();
      return () => {}; // Cleanup function
    }, [])
  );

  // UPDATE BOOKING STATUS
  const updateBookingStatus = async (id: string, status: string) => {
    try {
      await updateDoc(doc(database, "bookings", id), {
        status,
        updatedAt: new Date().toISOString(),
      });
      Alert.alert("Success", `Booking marked as ${status}`);
    } catch (e) {
      console.log("Error updating booking:", e);
      Alert.alert("Error", "Failed to update booking status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "#10B981";
      case "rejected":
        return "#F43F5E";
      case "completed":
        return "#8B5CF6";
      default:
        return "#F59E0B";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return "checkmark-circle";
      case "rejected":
        return "close-circle";
      case "completed":
        return "checkmark-done-circle";
      default:
        return "time";
    }
  };

  // APPLY FILTER
  const filteredBookings = filter === "all" 
    ? bookings 
    : bookings.filter(booking => booking.status === filter);

  // Calculate stats
  const stats = {
    total: bookings.length,
    pending: bookings.filter(b => b.status === "pending").length,
    approved: bookings.filter(b => b.status === "approved").length,
    rejected: bookings.filter(b => b.status === "rejected").length,
    completed: bookings.filter(b => b.status === "completed").length,
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#8B5CF6" />
          <Text style={styles.loadingText}>Loading bookings...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Fixed Header with Gradient Effect */}
      <View style={styles.headerSection}>
        <View style={styles.headerContainer}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.header}>Admin Dashboard</Text>
            <Text style={styles.subHeader}>Manage all your bookings</Text>
          </View>
          <TouchableOpacity 
            onPress={fetchBookings}
            style={styles.refreshButton}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh" size={22} color="#8B5CF6" />
          </TouchableOpacity>
        </View>

        {/* Stats Summary */}
        <View style={styles.statsRow}>
          <View style={styles.statsCard}>
            <Text style={styles.statsNumber}>{stats.total}</Text>
            <Text style={styles.statsLabel}>Total</Text>
          </View>
          <View style={[styles.statsCard, styles.statsDivider]}>
            <Text style={[styles.statsNumber, { color: "#F59E0B" }]}>{stats.pending}</Text>
            <Text style={styles.statsLabel}>Pending</Text>
          </View>
          <View style={styles.statsCard}>
            <Text style={[styles.statsNumber, { color: "#8B5CF6" }]}>{stats.completed}</Text>
            <Text style={styles.statsLabel}>Done</Text>
          </View>
        </View>

        {/* Filter Tabs - Now inside header */}
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          <TouchableOpacity 
            style={[styles.filterTab, filter === "all" && styles.filterTabActive]}
            onPress={() => setFilter("all")}
            activeOpacity={0.7}
          >
            <View style={[styles.filterIconContainer, filter === "all" && styles.filterIconActive]}>
              <Ionicons name="grid" size={18} color={filter === "all" ? "#fff" : "#8B5CF6"} />
            </View>
            <Text style={[styles.filterTabText, filter === "all" && styles.filterTabTextActive]}>
              All ({stats.total})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === "pending" && styles.filterTabActive]}
            onPress={() => setFilter("pending")}
            activeOpacity={0.7}
          >
            <View style={[styles.filterIconContainer, filter === "pending" && styles.filterIconActive]}>
              <Ionicons name="time" size={18} color={filter === "pending" ? "#fff" : "#F59E0B"} />
            </View>
            <Text style={[styles.filterTabText, filter === "pending" && styles.filterTabTextActive]}>
              Pending ({stats.pending})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === "approved" && styles.filterTabActive]}
            onPress={() => setFilter("approved")}
            activeOpacity={0.7}
          >
            <View style={[styles.filterIconContainer, filter === "approved" && styles.filterIconActive]}>
              <Ionicons name="checkmark-circle" size={18} color={filter === "approved" ? "#fff" : "#10B981"} />
            </View>
            <Text style={[styles.filterTabText, filter === "approved" && styles.filterTabTextActive]}>
              Approved ({stats.approved})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === "completed" && styles.filterTabActive]}
            onPress={() => setFilter("completed")}
            activeOpacity={0.7}
          >
            <View style={[styles.filterIconContainer, filter === "completed" && styles.filterIconActive]}>
              <Ionicons name="checkmark-done-circle" size={18} color={filter === "completed" ? "#fff" : "#8B5CF6"} />
            </View>
            <Text style={[styles.filterTabText, filter === "completed" && styles.filterTabTextActive]}>
              Completed ({stats.completed})
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.filterTab, filter === "rejected" && styles.filterTabActive]}
            onPress={() => setFilter("rejected")}
            activeOpacity={0.7}
          >
            <View style={[styles.filterIconContainer, filter === "rejected" && styles.filterIconActive]}>
              <Ionicons name="close-circle" size={18} color={filter === "rejected" ? "#fff" : "#F43F5E"} />
            </View>
            <Text style={[styles.filterTabText, filter === "rejected" && styles.filterTabTextActive]}>
              Rejected ({stats.rejected})
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={64} color="#C4B5FD" />
          </View>
          <Text style={styles.emptyTitle}>No Bookings Found</Text>
          <Text style={styles.emptySubtitle}>
            {filter === 'all' 
              ? 'There are no bookings yet' 
              : `No ${filter} bookings at the moment`}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filteredBookings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.bookingCard}>
              {/* Card Header with Status */}
              <View style={styles.bookingHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={22} color="#8B5CF6" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.bookingUserName}>{item.userName}</Text>
                    <Text style={styles.bookingId}>#{item.id.slice(0, 8).toUpperCase()}</Text>
                  </View>
                </View>

                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(item.status) },
                  ]}
                >
                  <Ionicons 
                    name={getStatusIcon(item.status) as any} 
                    size={14} 
                    color="#fff" 
                  />
                  <Text style={styles.statusText}>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                  </Text>
                </View>
              </View>

              {/* Service Info Card */}
              <View style={styles.serviceContainer}>
                <View style={styles.serviceIconBox}>
                  <Ionicons name="cut" size={24} color="#8B5CF6" />
                </View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTitle}>{item.service}</Text>
                  {item.stylist && (
                    <View style={styles.stylistRow}>
                      <Ionicons name="person-outline" size={14} color="#9CA3AF" />
                      <Text style={styles.stylistName}>{item.stylist}</Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Date & Time Info */}
              <View style={styles.infoRow}>
                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="calendar-outline" size={18} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Date</Text>
                    <Text style={styles.infoValue}>
                      {new Date(item.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "2-digit",
                        year: "numeric",
                      })}
                    </Text>
                  </View>
                </View>

                <View style={styles.infoCard}>
                  <View style={styles.infoIconContainer}>
                    <Ionicons name="time-outline" size={18} color="#8B5CF6" />
                  </View>
                  <View>
                    <Text style={styles.infoLabel}>Time</Text>
                    <Text style={styles.infoValue}>{item.time}</Text>
                  </View>
                </View>
              </View>

              {/* ACTION BUTTONS - Improved with better spacing and visibility */}
              <View style={styles.actionSection}>
                {item.status === "pending" && (
                  <View style={styles.actionButtonsRow}>
                    <TouchableOpacity
                      onPress={() => updateBookingStatus(item.id, "approved")}
                      style={[styles.actionButton, styles.approveButton]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle" size={20} color="#fff" />
                      <Text style={styles.actionText}>Approve</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => updateBookingStatus(item.id, "rejected")}
                      style={[styles.actionButton, styles.rejectButton]}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="close-circle" size={20} color="#fff" />
                      <Text style={styles.actionText}>Reject</Text>
                    </TouchableOpacity>
                  </View>
                )}

                {item.status === "approved" && (
                  <TouchableOpacity
                    onPress={() => updateBookingStatus(item.id, "completed")}
                    style={[styles.actionButton, styles.completeButton, styles.fullWidthButton]}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="checkmark-done-circle" size={20} color="#fff" />
                    <Text style={styles.actionText}>Mark as Complete</Text>
                  </TouchableOpacity>
                )}

                {(item.status === "completed" || item.status === "rejected") && (
                  <View style={styles.finalStatusContainer}>
                    <Ionicons 
                      name={item.status === "completed" ? "checkmark-circle" : "close-circle"} 
                      size={22} 
                      color={getStatusColor(item.status)} 
                    />
                    <Text style={[styles.finalStatusText, { color: getStatusColor(item.status) }]}>
                      This booking has been {item.status}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: "#FAF5FF",
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
  },
  
  // Loading
  loadingContainer: {
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 40,
    borderRadius: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingText: { 
    marginTop: 16, 
    fontSize: 16, 
    color: "#6B7280",
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Header Section - Now compact
  headerSection: {
    backgroundColor: "#fff",
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  header: { 
    fontSize: 24, 
    fontWeight: "800", 
    color: "#1F2937",
    letterSpacing: -0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  subHeader: { 
    fontSize: 13, 
    color: "#9CA3AF", 
    marginTop: 2,
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 2,
  },

  // Stats Row - More compact
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    gap: 10,
    marginBottom: 12,
  },
  statsCard: {
    flex: 1,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 10,
    alignItems: "center",
  },
  statsDivider: {
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: "#E5E7EB",
  },
  statsNumber: {
    fontSize: 22,
    fontWeight: "800",
    color: "#8B5CF6",
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  statsLabel: {
    fontSize: 10,
    color: "#6B7280",
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Filter Tabs - Compact
  filterContainer: {
    maxHeight: 60,
  },
  filterContent: {
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  filterTab: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginRight: 8,
    borderWidth: 2,
    borderColor: "transparent",
  },
  filterTabActive: {
    backgroundColor: "#8B5CF6",
    borderColor: "#8B5CF6",
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  filterIconContainer: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 6,
  },
  filterIconActive: {
    backgroundColor: "rgba(255,255,255,0.25)",
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#4B5563",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  filterTabTextActive: {
    color: "#fff",
  },

  // Empty State
  emptyIconContainer: {
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  emptyTitle: { 
    fontSize: 24, 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: 8,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  emptySubtitle: { 
    fontSize: 15, 
    color: "#9CA3AF", 
    textAlign: "center",
    paddingHorizontal: 40,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // List - More space for bookings
  listContent: { 
    paddingHorizontal: 20, 
    paddingTop: 12,
    paddingBottom: 20,
  },

  // Booking Card - More compact
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#8B5CF6",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#F3E8FF",
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    borderWidth: 2,
    borderColor: "#E9D5FF",
  },
  userDetails: {
    flex: 1,
  },
  bookingUserName: { 
    fontSize: 17, 
    fontWeight: "700", 
    color: "#1F2937",
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  bookingId: { 
    fontSize: 12, 
    color: "#9CA3AF", 
    fontWeight: "600",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  statusBadge: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12, 
    paddingVertical: 7, 
    borderRadius: 12,
  },
  statusText: { 
    color: "#fff", 
    fontSize: 11, 
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Service Info
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 14,
    borderRadius: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  serviceIconBox: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: { 
    fontSize: 16, 
    fontWeight: "700", 
    color: "#1F2937", 
    marginBottom: 4,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  stylistRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stylistName: { 
    fontSize: 13, 
    color: "#6B7280",
    fontWeight: "500",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Info Row
  infoRow: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 16,
  },
  infoCard: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 12,
    borderRadius: 12,
    gap: 10,
  },
  infoIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: "#F3E8FF",
    justifyContent: "center",
    alignItems: "center",
  },
  infoLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    fontWeight: "600",
    textTransform: "uppercase",
    marginBottom: 2,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  infoValue: {
    fontSize: 13,
    color: "#1F2937",
    fontWeight: "700",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },

  // Action Section - Improved
  actionSection: {
    marginTop: 4,
  },
  actionButtonsRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 14,
    flex: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  fullWidthButton: {
    flex: 1,
    width: '100%',
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#F43F5E",
  },
  completeButton: {
    backgroundColor: "#8B5CF6",
  },
  actionText: { 
    color: "#fff", 
    fontWeight: "700", 
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
  finalStatusContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#F9FAFB",
    borderRadius: 14,
    borderWidth: 2,
    borderColor: "#F3F4F6",
  },
  finalStatusText: {
    fontSize: 14,
    fontWeight: "600",
    fontFamily: Platform.OS === 'ios' ? 'System' : 'Roboto',
  },
});