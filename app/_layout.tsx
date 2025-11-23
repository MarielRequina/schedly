import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

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
    { name: "Home", route: "/dashboard", icon: "home-outline" },
    { name: "Services", route: "/services", icon: "cut-outline" },
    { name: "Hot Deals", route: "/promodeals", icon: "flame-outline" },
    { name: "Bookings", route: "/booking", icon: "calendar-outline" },
    { name: "Profile", route: "/profile", icon: "person-circle-outline" },
  ];

  return (
    <View style={styles.container}>
      {/* 🌸 Header (hidden on Dashboard) */}
      {!hideLayout && pathname !== "/dashboard" && (
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <Image source={require("../assets/logo.png")} style={styles.logo} />
            <Text style={styles.appName}>Schedly</Text>
          </View>
        </View>
      )}

      {/* 🧩 Main Content */}
      <View style={styles.content}>
        <Stack
          screenOptions={{
            headerShown: false,
            animation: "slide_from_right",
          }}
        />
      </View>

      {/* 🌙 Bottom Navigation (hidden on Dashboard) */}
      {!hideLayout && pathname !== "/dashboard" && (
        <View style={styles.navbar}>
          {navItems.map((item) => {
            const isActive = pathname === item.route ||
              (pathname === '/' && item.route === '/dashboard');
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.navItem}
                onPress={() => router.push(item.route)}
              >
                <Ionicons
                  name={item.icon}
                  size={22}
                  color={isActive ? "#6C63FF" : "#B0A8FF"}
                />
                <Text
                  style={[
                    styles.navText,
                    { color: isActive ? "#6C63FF" : "#B0A8FF" },
                  ]}
                >
                  {item.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}

      <StatusBar style="light" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9F7FF",
  },
  header: {
    backgroundColor: "#6C63FF",
    paddingTop: 50,
    paddingBottom: 18,

    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 6,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  logo: {
    width: 38,
    height: 38,
    borderRadius: 10,
  },
  appName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#fff",
    letterSpacing: 0.8,
  },
  content: {
    flex: 1,
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    backgroundColor: "#fff",
    borderTopColor: "#E0D4FF",
    borderTopWidth: 1,
    paddingVertical: 10,
    height: 65,
    elevation: 8,
    shadowColor: "#6C63FF",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: -2 },
  },
  navItem: {
    alignItems: "center",
  },
  navText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },
});
