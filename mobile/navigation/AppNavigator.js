import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";

import { HomeScreen } from "../screens/HomeScreen";
import { ShelfScreen } from "../screens/ShelfScreen";
import { CameraScreen } from "../screens/CameraScreen";
import { AlertsScreen } from "../screens/AlertsScreen";
import { ProfileScreen } from "../screens/ProfileScreen";

const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home: "home-outline",
  Shelf: "cube-outline",
  Camera: "camera-outline",
  Alerts: "notifications-outline",
  Profile: "person-outline",
};

export default function AppNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,

        // Built-in tab animation.
        // "fade" gives a soft cross-fade.
        // "shift" gives a small horizontal movement.
animation: "shift",
        tabBarActiveTintColor: "#5C4033",
        tabBarInactiveTintColor: "#7A6A60",
        tabBarStyle: {
          height: 68,
          paddingBottom: 8,
          paddingTop: 8,
          backgroundColor: "#FFF9F0",
          borderTopColor: "#E6D8C8",
        },

        tabBarIcon: ({ color, size }) => (
          <Ionicons
            name={TAB_ICONS[route.name]}
            size={size}
            color={color}
          />
        ),
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Shelf" component={ShelfScreen} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Alerts" component={AlertsScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}