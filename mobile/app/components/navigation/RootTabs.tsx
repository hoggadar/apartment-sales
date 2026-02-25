import * as React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons } from "@expo/vector-icons";
import ApartmentsScreen from "../screens/ApartmentsScreen";
import HomeScreen from "../screens/HomeScreen";
import HistoryScreen from "../screens/HistoryScreen";

const Tabs = createBottomTabNavigator();

export function RootTabs() {
  return (
    <Tabs.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#2563eb",
        tabBarInactiveTintColor: "#94a3b8",
        tabBarIcon: ({ color, size, focused }) => {
          let iconName: React.ComponentProps<typeof Ionicons>["name"] = "ellipse";

          if (route.name === "Home") {
            iconName = focused ? "home" : "home-outline";
          } else if (route.name === "Apartments") {
            iconName = focused ? "business" : "business-outline";
          } else if (route.name === "History") {
            iconName = focused ? "time" : "time-outline";
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: "Главная", title: "Главная" }} />
      <Tabs.Screen name="Apartments" component={ApartmentsScreen} options={{ title: "Квартиры" }} />
      <Tabs.Screen name="History" component={HistoryScreen} options={{ title: "История" }} />
    </Tabs.Navigator>
  );
}
