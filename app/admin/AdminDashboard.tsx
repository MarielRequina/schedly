import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from '@react-navigation/native';
import { collection, doc, getDoc, onSnapshot, orderBy, query, updateDoc } from "firebase/firestore";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
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
        return "#EF4444";
      case "completed":
        return "#3B82F6";
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
        return "trophy";
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
        <ActivityIndicator size="large" color="#E0A100" />
        <Text style={styles.loadingText}>Loading bookings...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerContainer}>
        <View>
          <Text style={styles.header}>Admin Dashboard</Text>
          <Text style={styles.subHeader}>Manage all bookings</Text>
        </View>
        <TouchableOpacity 
          onPress={fetchBookings}
          style={styles.refreshButton}
        >
          <Ionicons name="refresh" size={24} color="#E0A100" />
        </TouchableOpacity>
      </View>

      {/* Stats Cards */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.statsContainer}
        contentContainerStyle={styles.statsContent}
      >
        <TouchableOpacity 
          style={[styles.statCard, filter === "all" && styles.statCardActive]}
          onPress={() => setFilter("all")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#E0A100" }]}>
            <Ionicons name="grid" size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.total}</Text>
          <Text style={styles.statLabel}>Total</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, filter === "pending" && styles.statCardActive]}
          onPress={() => setFilter("pending")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#F59E0B" }]}>
            <Ionicons name="time" size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.pending}</Text>
          <Text style={styles.statLabel}>Pending</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, filter === "approved" && styles.statCardActive]}
          onPress={() => setFilter("approved")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#10B981" }]}>
            <Ionicons name="checkmark-circle" size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.approved}</Text>
          <Text style={styles.statLabel}>Approved</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, filter === "rejected" && styles.statCardActive]}
          onPress={() => setFilter("rejected")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#EF4444" }]}>
            <Ionicons name="close-circle" size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.rejected}</Text>
          <Text style={styles.statLabel}>Rejected</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.statCard, filter === "completed" && styles.statCardActive]}
          onPress={() => setFilter("completed")}
        >
          <View style={[styles.statIconContainer, { backgroundColor: "#3B82F6" }]}>
            <Ionicons name="trophy" size={20} color="#fff" />
          </View>
          <Text style={styles.statNumber}>{stats.completed}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Active Filter Indicator */}
      {filter !== "all" && (
        <View style={styles.filterBanner}>
          <Text style={styles.filterBannerText}>
            Showing {filter} bookings ({filteredBookings.length})
          </Text>
          <TouchableOpacity onPress={() => setFilter("all")}>
            <Text style={styles.clearFilterText}>Clear filter</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Bookings List */}
      {filteredBookings.length === 0 ? (
        <View style={[styles.centered, { flex: 1 }]}>
          <View style={styles.emptyIconContainer}>
            <Ionicons name="calendar-outline" size={60} color="#E0A100" />
          </View>
          <Text style={styles.emptyTitle}>No bookings found</Text>
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
              {/* Card Header */}
              <View style={styles.bookingHeader}>
                <View style={styles.userInfo}>
                  <View style={styles.avatarContainer}>
                    <Ionicons name="person" size={20} color="#E0A100" />
                  </View>
                  <View style={styles.userDetails}>
                    <Text style={styles.bookingUserName}>{item.userName}</Text>
                    <Text style={styles.bookingId}>ID: {item.id.slice(0, 8)}</Text>
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
                    size={12} 
                    color="#fff" 
                  />
                  <Text style={styles.statusText}>
                    {item.status.toUpperCase()}
                  </Text>
                </View>
              </View>

              {/* Service Info */}
              <View style={styles.serviceContainer}>
                <View style={styles.serviceIconBox}>
                  <Ionicons name="cut" size={24} color="#E0A100" />
                </View>
                <View style={styles.serviceDetails}>
                  <Text style={styles.serviceTitle}>{item.service}</Text>
                  {item.stylist && (
                    <Text style={styles.stylistName}>with {item.stylist}</Text>
                  )}
                </View>
              </View>

              {/* Date & Time */}
              <View style={styles.dateTimeContainer}>
                <View style={styles.infoItem}>
                  <Ionicons name="calendar" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>
                    {new Date(item.date).toLocaleDateString("en-US", {
                      weekday: "short",
                      month: "short",
                      day: "2-digit",
                      year: "numeric",
                    })}
                  </Text>
                </View>

                <View style={styles.infoItem}>
                  <Ionicons name="time" size={16} color="#6B7280" />
                  <Text style={styles.infoText}>{item.time}</Text>
                </View>
              </View>

              {/* ACTION BUTTONS */}
              <View style={styles.actionButtons}>
                {item.status !== "approved" && (
                  <TouchableOpacity
                    onPress={() => updateBookingStatus(item.id, "approved")}
                    style={[
                      styles.actionButton,
                      styles.approveButton
                    ]}
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                    <Text style={styles.actionText}>Approve</Text>
                  </TouchableOpacity>
                )}

                {item.status !== "rejected" && (
                  <TouchableOpacity
                    onPress={() => updateBookingStatus(item.id, "rejected")}
                    style={[
                      styles.actionButton,
                      styles.rejectButton
                    ]}
                  >
                    <Ionicons name="close" size={16} color="#fff" />
                    <Text style={styles.actionText}>Reject</Text>
                  </TouchableOpacity>
                )}

                {item.status !== "completed" && item.status === "approved" && (
                  <TouchableOpacity
                    onPress={() => updateBookingStatus(item.id, "completed")}
                    style={[
                      styles.actionButton,
                      styles.completeButton
                    ]}
                  >
                    <Ionicons name="checkmark-done" size={16} color="#fff" />
                    <Text style={styles.actionText}>Complete</Text>
                  </TouchableOpacity>
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
  container: { flex: 1, backgroundColor: "#FFF7E6" },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  
  // Header
  headerContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  header: { fontSize: 28, fontWeight: "700", color: "#1F2937" },
  subHeader: { fontSize: 14, color: "#6B7280", marginTop: 2 },
  refreshButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loadingText: { marginTop: 12, fontSize: 16, color: "#6B7280" },

  // Stats Cards
  statsContainer: {
    marginTop: 16,
    marginBottom: 8,
  },
  statsContent: {
    paddingHorizontal: 16,
    gap: 12,
  },
  statCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    minWidth: 100,
    alignItems: "center",
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 2,
    borderColor: "transparent",
  },
  statCardActive: {
    borderColor: "#E0A100",
    backgroundColor: "#FFF7E6",
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  statNumber: { fontSize: 24, fontWeight: "700", color: "#1F2937" },
  statLabel: { fontSize: 12, color: "#6B7280", marginTop: 4 },

  // Filter Banner
  filterBanner: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#E0A100",
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginHorizontal: 16,
    marginTop: 8,
    borderRadius: 12,
  },
  filterBannerText: { color: "#fff", fontWeight: "600", fontSize: 14 },
  clearFilterText: { color: "#fff", fontWeight: "700", fontSize: 14, textDecorationLine: "underline" },

  // Empty State
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFF7E6",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: "700", color: "#1F2937", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#6B7280", textAlign: "center" },

  // List
  listContent: { 
    paddingHorizontal: 16, 
    paddingTop: 16,
    paddingBottom: 40 
  },

  // Booking Card
  bookingCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  bookingHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  avatarContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#FFF7E6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  userDetails: {
    flex: 1,
  },
  bookingUserName: { fontSize: 16, fontWeight: "700", color: "#1F2937" },
  bookingId: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },

  statusBadge: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10, 
    paddingVertical: 6, 
    borderRadius: 20 
  },
  statusText: { color: "#fff", fontSize: 10, fontWeight: "700" },

  // Service Info
  serviceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF7E6",
    padding: 12,
    borderRadius: 12,
    marginBottom: 12,
  },
  serviceIconBox: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  serviceDetails: {
    flex: 1,
  },
  serviceTitle: { fontSize: 16, fontWeight: "600", color: "#1F2937", marginBottom: 2 },
  stylistName: { fontSize: 13, color: "#6B7280" },

  // Date & Time
  dateTimeContainer: {
    flexDirection: "row",
    gap: 16,
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    flex: 1,
  },
  infoText: { fontSize: 13, color: "#4B5563", fontWeight: "500" },

  // Action Buttons
  actionButtons: { 
    flexDirection: "row", 
    gap: 8,
    flexWrap: 'wrap',
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    flex: 1,
    minWidth: 100,
    justifyContent: "center",
  },
  approveButton: {
    backgroundColor: "#10B981",
  },
  rejectButton: {
    backgroundColor: "#EF4444",
  },
  completeButton: {
    backgroundColor: "#3B82F6",
  },
  actionText: { color: "#fff", fontWeight: "700", fontSize: 13 },
});