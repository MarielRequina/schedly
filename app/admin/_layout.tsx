import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useRef, useState } from "react";
import { Animated, Dimensions, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const DRAWER_WIDTH = 280;

const COLORS = {
  primary: '#6B46C1',
  primaryLight: '#8B5CF6',
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

export default function AdminLayout() {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const drawerAnim = useRef(new Animated.Value(-DRAWER_WIDTH)).current;
  const overlayAnim = useRef(new Animated.Value(0)).current;

  // Hide header and drawer on login page
  const isLoginPage = pathname === "/admin/adminLogin";

  const navItems = [
    { name: "Dashboard", route: "/admin/AdminDashboard", icon: "grid-outline" },
    { name: "Services", route: "/admin/ManageServices", icon: "cut-outline" },
    { name: "Logout", route: "/admin/adminLogin", icon: "log-out-outline" },
  ];

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
    toggleDrawer();
    setTimeout(() => {
      router.push(route as any);
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      {!isLoginPage && (
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
              <Image source={require("../../assets/logo.png")} style={styles.logo} />
              <Text style={styles.appName}>Schedly Admin</Text>
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
      {!isLoginPage && (
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
      {!isLoginPage && (
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
              <Image source={require("../../assets/logo.png")} style={styles.drawerLogo} />
              <View>
                <Text style={styles.drawerAppName}>Schedly</Text>
                <Text style={styles.drawerTagline}>Admin Panel</Text>
              </View>
            </View>
            <TouchableOpacity onPress={toggleDrawer} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={COLORS.white} />
            </TouchableOpacity>
          </View>

          {/* Drawer Navigation Items */}
          <View style={styles.drawerNav}>
            {navItems.map((item) => {
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
            <Text style={styles.drawerFooterText}>Admin Version 1.0.0</Text>
          </View>
        </Animated.View>
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
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.8,
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
  },
  drawerLogo: {
    width: 56,
    height: 56,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  drawerAppName: {
    fontSize: 24,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  drawerTagline: {
    fontSize: 13,
    fontWeight: "500",
    color: 'rgba(255,255,255,0.8)',
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
});