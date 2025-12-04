import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { collection, onSnapshot, query, where } from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { FlatList, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

interface Booking {
  id?: string;
  service: string;
  date: string;
  time: string;
  stylist: string;
  status: string;
  userId: string;
  updatedAt?: any;
}

interface Service {
  id: string;
  name: string;
  price?: string;
  createdAt?: any;
  description?: string;
}

interface Notification {
  id: string;
  type: 'confirmed' | 'rejected' | 'completed' | 'new_service';
  title: string;
  message: string;
  timestamp: any;
  data?: any;
  icon: string;
  iconColor: string;
  bgColor: string;
}

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
  info: '#3B82F6',
};

export default function NotificationsScreen() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userBookings, setUserBookings] = useState<Booking[]>([]);
  const [recentServices, setRecentServices] = useState<Service[]>([]);

  useEffect(() => {
    const user = Authentication.currentUser;
    if (!user) return;

    // Listen to user's bookings for status changes
    const bookingsQuery = query(
      collection(database, "bookings"),
      where("userId", "==", user.uid)
    );

    const unsubBookings = onSnapshot(bookingsQuery, (snapshot: any) => {
      const bookings: Booking[] = snapshot.docs.map((docSnap: any) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
      setUserBookings(bookings);
    });

    // Listen to new services (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const servicesQuery = collection(database, "services");
    const unsubServices = onSnapshot(servicesQuery, (snapshot: any) => {
      const services: Service[] = snapshot.docs
        .map((docSnap: any) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        .filter((service: Service) => {
          // Show services created in the last 7 days
          if (service.createdAt) {
            const createdDate = service.createdAt.toDate?.() || new Date(service.createdAt);
            return createdDate >= sevenDaysAgo;
          }
          return false;
        })
        .sort((a: Service, b: Service) => {
          const dateA = a.createdAt?.toDate?.() || new Date(a.createdAt);
          const dateB = b.createdAt?.toDate?.() || new Date(b.createdAt);
          return dateB.getTime() - dateA.getTime();
        });
      
      setRecentServices(services);
    });

    return () => {
      unsubBookings();
      unsubServices();
    };
  }, []);

  // Generate notifications from bookings and services
  useEffect(() => {
    const notifs: Notification[] = [];

    // Booking notifications
    userBookings.forEach((booking) => {
      if (booking.status === 'confirmed') {
        notifs.push({
          id: `booking-${booking.id}-confirmed`,
          type: 'confirmed',
          title: 'Booking Confirmed! 🎉',
          message: `Your ${booking.service} appointment on ${booking.date} at ${booking.time} with ${booking.stylist} has been confirmed.`,
          timestamp: booking.updatedAt || new Date(),
          data: booking,
          icon: 'checkmark-circle',
          iconColor: COLORS.success,
          bgColor: '#ECFDF5',
        });
      } else if (booking.status === 'rejected') {
        notifs.push({
          id: `booking-${booking.id}-rejected`,
          type: 'rejected',
          title: 'Booking Declined',
          message: `Unfortunately, your ${booking.service} appointment on ${booking.date} at ${booking.time} could not be confirmed. Please book a different time slot.`,
          timestamp: booking.updatedAt || new Date(),
          data: booking,
          icon: 'close-circle',
          iconColor: COLORS.danger,
          bgColor: '#FEF2F2',
        });
      } else if (booking.status === 'completed') {
        notifs.push({
          id: `booking-${booking.id}-completed`,
          type: 'completed',
          title: 'Service Completed ✨',
          message: `Your ${booking.service} appointment with ${booking.stylist} has been completed. Thank you for choosing us!`,
          timestamp: booking.updatedAt || new Date(),
          data: booking,
          icon: 'checkmark-done-circle',
          iconColor: COLORS.primary,
          bgColor: COLORS.primaryBg,
        });
      }
    });

    // New service notifications
    recentServices.forEach((service) => {
      notifs.push({
        id: `service-${service.id}`,
        type: 'new_service',
        title: 'New Service Available! 💇',
        message: `Check out our new service: ${service.name}${service.price ? ` - ₱${service.price}` : ''}. ${service.description || 'Book now!'}`,
        timestamp: service.createdAt || new Date(),
        data: service,
        icon: 'sparkles',
        iconColor: COLORS.info,
        bgColor: '#EFF6FF',
      });
    });

    // Sort by timestamp (most recent first)
    notifs.sort((a, b) => {
      const timeA = a.timestamp?.toDate?.() || new Date(a.timestamp);
      const timeB = b.timestamp?.toDate?.() || new Date(b.timestamp);
      return timeB.getTime() - timeA.getTime();
    });

    setNotifications(notifs);
  }, [userBookings, recentServices]);

  const formatTimeAgo = (timestamp: any) => {
    const date = timestamp?.toDate?.() || new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const handleNotificationPress = (notification: Notification) => {
    if (notification.type === 'new_service') {
      // Redirect to services screen
      router.push('./services');
    } else {
      // Redirect to bookings screen for booking-related notifications
      router.push('./booking');
    }
  };

  const renderNotification = ({ item }: { item: Notification }) => (
    <TouchableOpacity 
      style={[styles.card, { backgroundColor: item.bgColor }]}
      onPress={() => handleNotificationPress(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name={item.icon as any} size={24} color={item.iconColor} />
        </View>
        <View style={styles.cardHeaderText}>
          <Text style={styles.cardTitle}>{item.title}</Text>
          <Text style={styles.timestamp}>{formatTimeAgo(item.timestamp)}</Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={COLORS.textLight} />
      </View>

      <Text style={styles.cardMessage}>{item.message}</Text>

      {item.type === 'confirmed' && (
        <View style={styles.reminderBox}>
          <Ionicons name="information-circle" size={16} color={COLORS.info} />
          <Text style={styles.reminderText}>
            Please arrive 10 minutes early for your appointment.
          </Text>
        </View>
      )}

      {item.type === 'rejected' && (
        <View style={[styles.reminderBox, { backgroundColor: '#FEE2E2', borderColor: '#FECACA' }]}>
          <Ionicons name="alert-circle" size={16} color={COLORS.danger} />
          <Text style={styles.reminderText}>
            We apologize for the inconvenience. Please try booking another time.
          </Text>
        </View>
      )}

      <View style={styles.tapHint}>
        <Text style={styles.tapHintText}>Tap to view details</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <View style={styles.headerContent}>
          <Text style={styles.header}>Notifications</Text>
          <Ionicons name="notifications" size={28} color={COLORS.primary} />
        </View>
        {notifications.length > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{notifications.length}</Text>
          </View>
        )}
      </View>

      {notifications.length === 0 ? (
        <ScrollView contentContainerStyle={styles.emptyStateContainer}>
          <View style={styles.emptyState}>
            <View style={styles.emptyIconCircle}>
              <Ionicons name="notifications-outline" size={48} color={COLORS.textLight} />
            </View>
            <Text style={styles.emptyTitle}>No notifications yet</Text>
            <Text style={styles.emptySub}>
              You'll see booking updates and new service announcements here
            </Text>
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContainer}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.primaryBg,
  },
  headerContainer: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    position: 'relative',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  header: {
    fontSize: 28,
    fontWeight: "700",
    color: COLORS.text,
    letterSpacing: -0.5,
  },
  badge: {
    position: 'absolute',
    top: 20,
    right: 20,
    backgroundColor: COLORS.danger,
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: '700',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    alignItems: "center",
    paddingHorizontal: 40,
    paddingVertical: 60,
  },
  emptyIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 8,
  },
  emptySub: {
    fontSize: 14,
    color: COLORS.textLight,
    textAlign: "center",
    lineHeight: 20,
  },
  card: {
    backgroundColor: COLORS.white,
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  cardHeaderText: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: COLORS.text,
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
  cardMessage: {
    fontSize: 14,
    color: COLORS.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  reminderBox: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
    padding: 12,
    borderRadius: 10,
    marginTop: 4,
  },
  reminderText: {
    flex: 1,
    color: COLORS.text,
    fontSize: 13,
    lineHeight: 18,
  },
  tapHint: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.05)',
    alignItems: 'center',
  },
  tapHintText: {
    fontSize: 12,
    color: COLORS.textLight,
    fontWeight: '500',
  },
});