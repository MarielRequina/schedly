import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#9F7AEA',
  primaryDark: '#6D28D9',
  white: '#FFFFFF',
  gray100: '#F3F4F6',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
};

// Animated Nav Button Component
const NavButton = ({ item, isActive, onPress }: any) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.92, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      style={styles.navItem}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.navIconWrapper,
        isActive && styles.navIconActive,
        { transform: [{ scale }] }
      ]}>
        <Ionicons
          name={item.icon}
          size={24}
          color={isActive ? COLORS.white : COLORS.gray600}
        />
      </Animated.View>
      <Text style={[styles.navText, isActive && styles.navTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

export default function Layout() {
  const pathname = usePathname();
  const router = useRouter();

  const hideLayout =
    pathname === "/login" || 
    pathname === "/signup" || 
    pathname === "/" || 
    pathname.startsWith("/admin");

  type NavItem = {
    name: string;
    route: "/dashboard" | "/services" | "/promodeals" | "/booking" | "/profile" | "/notifications";
    icon: keyof typeof Ionicons.glyphMap;
  };

  const navItems: NavItem[] = [
    { name: "Home", route: "/dashboard", icon: "home" },
    { name: "Bookings", route: "/booking", icon: "calendar" },
    // New notification button placed to the right of Bookings
    { name: "Notifications", route: "/notifications", icon: "notifications" },
  ];

  // Drawer state and animation
  const [showDrawer, setShowDrawer] = useState(false);
  const drawerAnim = useRef(new Animated.Value(0)).current; // 0 hidden, 1 shown

  // User info for drawer header
  const [userName, setUserName] = useState<string>("Your Profile");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

  // 4 cartoon avatar options (2 girls, 2 boys)
  const AVATAR_OPTIONS: string[] = [
    // girls
    "https://api.dicebear.com/7.x/adventurer/png?seed=Alice&backgroundColor=b6e3f4&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=Emily&backgroundColor=d1d4f9&size=256",
    // boys
    "https://api.dicebear.com/7.x/adventurer/png?seed=James&backgroundColor=c0aede&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=Leo&backgroundColor=ffdfbf&size=256",
  ];

  useEffect(() => {
    (async () => {
      try {
        // 1) Try local cache first
        const [savedName, savedPhoto] = await Promise.all([
          AsyncStorage.getItem('schedly_user_name'),
          AsyncStorage.getItem('schedly_user_photo'),
        ]);

        if (savedName) setUserName(savedName);
        if (savedPhoto) setPhotoUrl(savedPhoto);

        if (savedName || savedPhoto) return; // already initialized from cache

        // 2) Initialize once from Auth/Firestore (read-only), then cache locally
        const user = Authentication.currentUser;
        let initialName = user?.displayName || '';
        let initialPhoto = user?.photoURL || '';

        if (user && (!initialName || !initialPhoto)) {
          try {
            const ref = doc(database, 'users', user.uid);
            const snap = await getDoc(ref);
            if (snap.exists()) {
              const data: any = snap.data();
              if (!initialName && data?.name) initialName = data.name;
              if (!initialPhoto && data?.photoURL) initialPhoto = data.photoURL;
            }
          } catch {}
        }

        if (initialName) {
          setUserName(initialName);
          await AsyncStorage.setItem('schedly_user_name', initialName);
        }
        if (initialPhoto) {
          setPhotoUrl(initialPhoto);
          await AsyncStorage.setItem('schedly_user_photo', initialPhoto);
        }
      } catch {}
    })();
  }, []);

  const displayName = userName ? userName.charAt(0).toUpperCase() + userName.slice(1) : 'User';

  // Persist selected avatar
  const applyAvatar = async (url: string) => {
    try {
      setPhotoUrl(url);
      await AsyncStorage.setItem('schedly_user_photo', url);
    } catch {}
    setPickerOpen(false);
  };

  const openDrawer = () => {
    setShowDrawer(true);
    Animated.timing(drawerAnim, { toValue: 1, duration: 220, useNativeDriver: true }).start();
  };

  const closeDrawer = () => {
    Animated.timing(drawerAnim, { toValue: 0, duration: 220, useNativeDriver: true }).start(({ finished }) => {
      if (finished) setShowDrawer(false);
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {!hideLayout && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity style={styles.menuButton} activeOpacity={0.8} onPress={openDrawer}>
              <Ionicons name="menu" size={26} color={COLORS.primary} />
            </TouchableOpacity>
            <View style={styles.logoContainer}>
              <Image source={require("../assets/logo.png")} style={styles.logo} />
              <View>
                <Text style={styles.appName}>Schedly</Text>
                <Text style={styles.tagline}>Your Beauty Partner</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* Left Drawer */}
      {showDrawer && (
        <>
          <Animated.View
            style={[
              styles.drawerOverlay,
              { opacity: drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [0, 0.5] }) },
            ]}
          >
            <TouchableOpacity style={{ flex: 1 }} activeOpacity={1} onPress={closeDrawer} />
          </Animated.View>
          <Animated.View
            style={[
              styles.drawerPanel,
              { transform: [{ translateX: drawerAnim.interpolate({ inputRange: [0, 1], outputRange: [-232, 0] }) }] },
            ]}
          >
            <View style={styles.drawerHeaderRow}>
              <View style={styles.drawerAvatarWrap}>
                <View style={styles.drawerAvatar}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.drawerAvatarImage} />
                  ) : (
                    <Ionicons name="person" size={34} color={COLORS.white} />
                  )}
                </View>
                <TouchableOpacity style={styles.drawerAvatarAdd} activeOpacity={0.8} onPress={() => setPickerOpen(true)}>
                  <Ionicons name="add" size={18} color={COLORS.white} />
                </TouchableOpacity>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.drawerProfileName}>{displayName}</Text>
              </View>
            </View>

            <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push('/booking'); }}>
              <Ionicons name="calendar" size={20} color={COLORS.gray600} style={styles.drawerItemIcon} />
              <Text style={styles.drawerItemText}>Booking</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push('/services'); }}>
              <Ionicons name="cut" size={20} color={COLORS.gray600} style={styles.drawerItemIcon} />
              <Text style={styles.drawerItemText}>Services</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push('/promodeals'); }}>
              <Ionicons name="flame" size={20} color={COLORS.gray600} style={styles.drawerItemIcon} />
              <Text style={styles.drawerItemText}>Hot Deals</Text>
            </TouchableOpacity>

            <Text style={styles.drawerSectionTitle}>More</Text>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push('/settings' as any); }}>
              <Ionicons name="settings" size={20} color={COLORS.gray600} style={styles.drawerItemIcon} />
              <Text style={styles.drawerItemText}>Settings</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.drawerItem} onPress={() => { closeDrawer(); router.push('/'); }}>
              <Ionicons name="log-out" size={20} color={COLORS.gray600} style={styles.drawerItemIcon} />
              <Text style={styles.drawerItemText}>Logout</Text>
            </TouchableOpacity>
          </Animated.View>
        </>
      )}

      {/* Main Content */}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </View>

      {/* Avatar Picker Modal */}
      <Modal visible={pickerOpen} transparent animationType="fade">
        <View style={styles.pickerOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerTitle}>Select Profile Image</Text>
            <View style={styles.pickerGrid}>
              {AVATAR_OPTIONS.map((url) => (
                <TouchableOpacity key={url} style={styles.pickerItem} onPress={() => applyAvatar(url)}>
                  <Image source={{ uri: url }} style={styles.pickerImage} />
                </TouchableOpacity>
              ))}
            </View>
            <TouchableOpacity style={styles.pickerClose} onPress={() => setPickerOpen(false)}>
              <Text style={styles.pickerCloseText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      {!hideLayout && pathname !== "/dashboard" && (
        <View style={styles.navbar}>
          <View style={styles.navbarInner}>
            {navItems.map((item) => {
              const isActive = pathname === item.route ||
                (pathname === '/' && item.route === '/dashboard');
              return (
                <NavButton
                  key={item.route}
                  item={item}
                  isActive={isActive}
                  onPress={() => router.push(item.route as any)}
                />
              );
            })}
          </View>
        </View>
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.gray100,
  },
  
  // Header Styles
  header: {
    backgroundColor: COLORS.white,
    paddingTop: 36,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerContent: {
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.gray100,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.primary,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 11,
    fontWeight: "500",
    color: COLORS.primary,
    marginTop: 2,
  },

  // Drawer styles
  drawerOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  drawerPanel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 232,
    backgroundColor: COLORS.white,
    paddingTop: 48,
    paddingHorizontal: 12,
    zIndex: 1000,
  },
  drawerHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  drawerAvatarWrap: {
    width: 56,
    height: 56,
    position: 'relative',
  },
  drawerAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: 'rgba(255,255,255,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  drawerAvatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 28,
  },
  drawerAvatarAdd: {
    position: 'absolute',
    right: -10,
    bottom: -10,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#2B2B36',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  drawerProfileName: {
    color: '#111827',
    fontSize: 20,
    fontWeight: '800',
    textTransform: 'capitalize',
  },
  drawerSectionTitle: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 2,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 10,
  },
  drawerItemEmphasis: {
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 10,
    paddingHorizontal: 8,
  },
  drawerItemIcon: {
    width: 24,
    textAlign: 'center',
  },
  drawerItemText: {
    color: '#111827',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Bottom Navigation
  navbar: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 8,
    paddingBottom: 6,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -4 },
    elevation: 12,
  },
  navbarInner: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
    paddingVertical: 8,
  },
  navIconWrapper: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  navIconActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  navText: {
    fontSize: 10,
    fontWeight: "600",
    marginTop: 4,
    color: COLORS.gray600,
  },
  navTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  
  // Avatar Picker styles
  pickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  pickerCard: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
  },
  pickerTitle: { fontSize: 18, fontWeight: '800', color: '#111827', marginBottom: 12 },
  pickerGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  pickerItem: { width: '48%', aspectRatio: 1, borderRadius: 12, overflow: 'hidden', backgroundColor: '#F3F4F6' },
  pickerImage: { width: '100%', height: '100%' },
  pickerClose: { marginTop: 12, paddingVertical: 10, alignItems: 'center', borderRadius: 8, backgroundColor: '#F3F4F6' },
  pickerCloseText: { fontWeight: '700', color: '#374151' },
});