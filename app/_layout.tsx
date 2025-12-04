import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { doc, getDoc, setDoc } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, Image, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Authentication, database } from "../constants/firebaseConfig";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

const COLORS = {
  primary: '#7C3AED',
  primaryLight: '#9F7AEA',
  white: '#FFFFFF',
  background: '#F9F7FF',
  gray400: '#9CA3AF',
  gray600: '#6B7280',
  navInactive: '#B0A8FF',
  overlay: 'rgba(0, 0, 0, 0.5)',
  border: '#E0D4FF',
};

// Animated Nav Button Component for Drawer
const DrawerNavButton = ({ item, isActive, onPress }: any) => {
  const [scale] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scale, { toValue: 0.96, useNativeDriver: true }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scale, { toValue: 1, friction: 3, useNativeDriver: true }).start();
  };

  return (
    <TouchableOpacity
      style={[styles.drawerItem, isActive && styles.drawerItemActive]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      activeOpacity={0.8}
    >
      <Animated.View style={[
        styles.drawerIconWrapper,
        isActive && styles.drawerIconActive,
        { transform: [{ scale }] }
      ]}>
        <Ionicons
          name={item.icon}
          size={24}
          color={isActive ? COLORS.white : COLORS.gray600}
        />
      </Animated.View>
      <Text style={[styles.drawerText, isActive && styles.drawerTextActive]}>
        {item.name}
      </Text>
    </TouchableOpacity>
  );
};

// Animated Nav Button for Bottom Navigation
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

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  const [userName, setUserName] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);

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
    { name: "Notifications", route: "/notifications", icon: "notifications" },
  ];

  const drawerItems = [
    { name: "Booking", route: "/booking", icon: "calendar" },
    { name: "Services", route: "/services", icon: "cut" },
    { name: "Hot Deals", route: "/promodeals", icon: "flame" },
    { name: "Settings", route: "/settings", icon: "settings-outline" },
    { name: "Logout", route: "/", icon: "log-out-outline" },
  ];

  const AVATAR_OPTIONS: string[] = [
    "https://api.dicebear.com/7.x/adventurer/png?seed=Alice&backgroundColor=b6e3f4&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=Emily&backgroundColor=d1d4f9&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=James&backgroundColor=c0aede&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=Leo&backgroundColor=ffdfbf&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=Maya&backgroundColor=ffd5dc&size=256",
    "https://api.dicebear.com/7.x/adventurer/png?seed=Sam&backgroundColor=c7f9cc&size=256",
  ];

  // Load user data based on current logged-in user
  useEffect(() => {
    const loadUserData = async () => {
      try {
        const user = Authentication.currentUser;
        if (!user) {
          setUserName("");
          setUserEmail("");
          setPhotoUrl(null);
          return;
        }

        // Set email from Firebase Auth
        setUserEmail(user.email || "");

        // Get user document from Firestore
        const userDocRef = doc(database, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Set name from Firestore
          if (userData?.name) {
            setUserName(userData.name);
          } else {
            setUserName("");
          }

          // Set photo from Firestore (only if user has set one)
          if (userData?.photoURL) {
            setPhotoUrl(userData.photoURL);
          } else {
            setPhotoUrl(null);
          }
        } else {
          // New user - leave everything blank except email
          setUserName("");
          setPhotoUrl(null);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
      }
    };

    loadUserData();

    // Listen to auth state changes
    const unsubscribe = Authentication.onAuthStateChanged((user) => {
      if (user) {
        loadUserData();
      } else {
        setUserName("");
        setUserEmail("");
        setPhotoUrl(null);
      }
    });

    return () => unsubscribe();
  }, []);

  const displayName = userName || "User";

  const applyAvatar = async (url: string) => {
    try {
      const user = Authentication.currentUser;
      if (!user) return;

      // Save to Firestore under the user's document
      const userDocRef = doc(database, "users", user.uid);
      await setDoc(userDocRef, { photoURL: url }, { merge: true });

      setPhotoUrl(url);
    } catch (error) {
      console.error("Error saving avatar:", error);
    }
    setPickerOpen(false);
  };

  const toggleDrawer = () => {
    const toValue = isDrawerOpen ? -DRAWER_WIDTH : 0;
    const overlayValue = isDrawerOpen ? 0 : 1;

    setIsDrawerOpen(!isDrawerOpen);

    Animated.parallel([
      Animated.spring(drawerAnim, {
        toValue,
        useNativeDriver: true,
        friction: 8,
      }),
      Animated.timing(overlayAnim, {
        toValue: overlayValue,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start();
  };

  const handleNavigation = (route: string) => {
    if (route === "/") {
      // Logout
      Authentication.signOut();
      toggleDrawer();
      setTimeout(() => {
        router.push("/");
      }, 100);
    } else {
      toggleDrawer();
      setTimeout(() => {
        router.push(route as any);
      }, 100);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {!hideLayout && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
            <TouchableOpacity 
              style={styles.hamburgerButton}
              onPress={toggleDrawer}
              activeOpacity={0.7}
            >
              <Ionicons name="menu" size={28} color={COLORS.white} />
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

      {/* Main Content */}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </View>

      {/* Drawer Overlay */}
      {!hideLayout && (
        <Animated.View
          style={[
            styles.overlayContainer,
            { opacity: overlayAnim }
          ]}
          pointerEvents={isDrawerOpen ? 'auto' : 'none'}
        >
          <TouchableOpacity
            style={styles.overlay}
            activeOpacity={1}
            onPress={toggleDrawer}
          />
        </Animated.View>
      )}

      {/* Side Drawer */}
      {!hideLayout && (
        <Animated.View
          style={[
            styles.drawer,
            { transform: [{ translateX: drawerAnim }] }
          ]}
          pointerEvents={isDrawerOpen ? 'auto' : 'none'}
        >
          {/* Drawer Header */}
          <View style={styles.drawerHeader}>
            <View style={styles.drawerLogoContainer}>
              <TouchableOpacity 
                style={styles.drawerAvatarContainer}
                onPress={() => setPickerOpen(true)}
                activeOpacity={0.8}
              >
                <View style={styles.drawerAvatar}>
                  {photoUrl ? (
                    <Image source={{ uri: photoUrl }} style={styles.drawerAvatarImage} />
                  ) : (
                    <Ionicons name="person" size={32} color={COLORS.white} />
                  )}
                </View>
                <View style={styles.drawerAvatarAdd}>
                  <Ionicons name="camera" size={14} color={COLORS.white} />
                </View>
              </TouchableOpacity>
              <View>
                <Text style={styles.drawerAppName}>
                  {displayName || "Set your name"}
                </Text>
                <Text style={styles.drawerEmail} numberOfLines={1}>
                  {userEmail || "No email"}
                </Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleDrawer} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Drawer Navigation Items */}
          <View style={styles.drawerNav}>
            {drawerItems.map((item) => {
              const isActive = pathname === item.route;
              return (
                <DrawerNavButton
                  key={item.route}
                  item={item}
                  isActive={isActive}
                  onPress={() => handleNavigation(item.route)}
                />
              );
            })}
          </View>

          {/* Drawer Footer */}
          <View style={styles.drawerFooter}>
            <Text style={styles.drawerFooterText}>Schedly v1.0.0</Text>
          </View>
        </Animated.View>
      )}

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
              const isActive = pathname === item.route || (pathname === '/' && item.route === '/dashboard');
              return (
                <NavButton key={item.route} item={item} isActive={isActive} onPress={() => router.push(item.route as any)} />
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
    backgroundColor: COLORS.background,
  },
  
  // Header Styles
  header: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 18,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  headerContent: {
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  hamburgerButton: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 22,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.8,
  },
  tagline: {
    fontSize: 11,
    fontWeight: "500",
    color: 'rgba(255,255,255,0.85)',
    marginTop: 2,
  },
  
  // Content
  content: {
    flex: 1,
  },
  
  // Overlay
  overlayContainer: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 998,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: COLORS.overlay,
  },
  
  // Drawer Styles
  drawer: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: DRAWER_WIDTH,
    backgroundColor: COLORS.white,
    zIndex: 999,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 16,
  },
  drawerHeader: {
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 24,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  drawerLogoContainer: {
    flexDirection: "column",
    gap: 12,
    flex: 1,
  },
  drawerAvatarContainer: {
    position: 'relative',
    width: 64,
    height: 64,
  },
  drawerAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  drawerAvatarImage: {
    width: '100%',
    height: '100%',
  },
  drawerAvatarAdd: {
    position: 'absolute',
    right: -2,
    bottom: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: COLORS.primary,
  },
  drawerAppName: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.3,
  },
  drawerEmail: {
    fontSize: 12,
    fontWeight: "500",
    color: 'rgba(255,255,255,0.75)',
    marginTop: 4,
  },
  closeButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Drawer Navigation
  drawerNav: {
    flex: 1,
    paddingTop: 24,
    paddingHorizontal: 16,
  },
  drawerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 16,
    marginBottom: 8,
    gap: 16,
  },
  drawerItemActive: {
    backgroundColor: COLORS.border,
  },
  drawerIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.border,
  },
  drawerIconActive: {
    backgroundColor: COLORS.primary,
    shadowColor: COLORS.primary,
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  drawerText: {
    fontSize: 16,
    fontWeight: "600",
    color: COLORS.gray600,
    flex: 1,
  },
  drawerTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },
  
  // Drawer Footer
  drawerFooter: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  drawerFooterText: {
    fontSize: 12,
    color: COLORS.gray400,
    textAlign: 'center',
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
    width: 48,
    height: 48,
    borderRadius: 24,
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
    fontSize: 11,
    fontWeight: "600",
    marginTop: 4,
    color: COLORS.gray600,
  },
  navTextActive: {
    color: COLORS.primary,
    fontWeight: "700",
  },

  // Avatar Picker Modal
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
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
  },
  pickerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.primary,
    marginBottom: 16,
  },
  pickerGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 12,
  },
  pickerItem: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: COLORS.background,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  pickerImage: {
    width: '100%',
    height: '100%',
  },
  pickerClose: {
    marginTop: 16,
    paddingVertical: 14,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: COLORS.background,
  },
  pickerCloseText: {
    fontWeight: '700',
    color: COLORS.primary,
    fontSize: 16,
  },
});