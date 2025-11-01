import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Image } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function NavBar() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "Home", icon: "home-outline", route: "/dashboard" },
    { name: "Services", icon: "cut-outline", route: "/services" },
    { name: "Hot Deals", icon: "flame-outline", route: "/hotdeals" },
    { name: "Bookings", icon: "calendar-outline", route: "/booking" },
    { name: "Profile", icon: "person-outline", route: "/profile" },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image
          source={require("../assets/logo.png")} // change path if needed
          style={styles.logo}
        />
        <Text style={styles.title}>Schedly</Text>
      </View>

      <View style={styles.navbar}>
        {tabs.map((tab) => {
          const active = pathname === tab.route;
          return (
            <TouchableOpacity
              key={tab.name}
              style={styles.tab}
              onPress={() => router.push(tab.route)}
            >
              <Ionicons
                name={tab.icon as any}
                size={22}
                color={active ? "#fff" : "#c5b3f9"}
              />
              <Text style={[styles.label, active && styles.activeLabel]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#6C63FF",
    paddingTop: 45,
    paddingBottom: 10,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  logo: {
    width: 35,
    height: 35,
    marginRight: 10,
  },
  title: {
    fontSize: 22,
    color: "#fff",
    fontWeight: "bold",
  },
  navbar: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  tab: {
    alignItems: "center",
  },
  label: {
    fontSize: 11,
    color: "#c5b3f9",
  },
  activeLabel: {
    color: "#fff",
    fontWeight: "600",
  },
});
