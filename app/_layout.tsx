import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React, { useState } from "react";
import { Animated, Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
          size={22}
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
    route: "/dashboard" | "/services" | "/promodeals" | "/booking" | "/profile";
    icon: keyof typeof Ionicons.glyphMap;
  };

  const navItems: NavItem[] = [
    { name: "Home", route: "/dashboard", icon: "home" },
    { name: "Services", route: "/services", icon: "cut" },
    { name: "Deals", route: "/promodeals", icon: "flame" },
    { name: "Bookings", route: "/booking", icon: "calendar" },
    { name: "Profile", route: "/profile", icon: "person" },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      {!hideLayout && pathname !== "/dashboard" && (
        <View style={styles.header}>
          <View style={styles.headerContent}>
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
                  onPress={() => router.push(item.route)}
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
    backgroundColor: COLORS.primary,
    paddingTop: 50,
    paddingBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  headerContent: {
    paddingHorizontal: 20,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  appName: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.white,
    letterSpacing: 0.5,
  },
  tagline: {
    fontSize: 12,
    fontWeight: "500",
    color: 'rgba(255,255,255,0.8)',
    marginTop: 2,
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
    paddingTop: 12,
    paddingBottom: 8,
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
});