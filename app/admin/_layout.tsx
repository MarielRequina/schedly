import { Ionicons } from "@expo/vector-icons";
import { Stack, usePathname, useRouter } from "expo-router";
import { StatusBar } from "expo-status-bar";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function AdminLayout() {
  const pathname = usePathname();
  const router = useRouter();

  // Hide header and footer on login page
  const isLoginPage = pathname === "/admin/adminLogin";

  const navItems = [
    { name: "Dashboard", route: "/admin/AdminDashboard", icon: "grid-outline" },
    { name: "Services", route: "/admin/ManageServices", icon: "cut-outline" },
    { name: "Logout", route: "/admin/adminLogin", icon: "log-out-outline" },
  ];

  return (
    <View style={styles.container}>
      {/* 🌸 Header */}
      {!isLoginPage && (
        <View style={styles.header}>
          <View style={styles.headerInner}>
            <Image source={require("../../assets/logo.png")} style={styles.logo} />
            <Text style={styles.appName}>Schedly Admin</Text>
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

      {/* 🌙 Bottom Navigation */}
      {!isLoginPage && (
        <View style={styles.navbar}>
          {navItems.map((item) => {
            const isActive = pathname === item.route;
            return (
              <TouchableOpacity
                key={item.route}
                style={styles.navItem}
                onPress={() => router.push(item.route as any)}
              >
                <Ionicons
                  name={item.icon as any}
                  size={22}
                  color={isActive ? "#6B46C1" : "#B0A8FF"}
                />
                <Text
                  style={[
                    styles.navText,
                    { color: isActive ? "#6B46C1" : "#B0A8FF" },
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
    backgroundColor: "#6B46C1",
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
    shadowColor: "#6B46C1",
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
