import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Pressable } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route, navigation }) => ({
        tabBarActiveTintColor: "#facc15",
        tabBarInactiveTintColor: "gray",
        headerTitleAlign: "center",
        headerLeft: () => <></>, // helps balance center alignment
        headerRight: () => (
          <Pressable
            onPress={() => navigation.navigate("modal" as never)}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="person-circle-outline" size={26} color="#facc15" />
          </Pressable>
        ),
        tabBarIcon: ({ color, size }) => {
          let iconName = "";

          switch (route.name) {
            case "index":
              iconName = "calendar-outline";
              break;
            case "exercises":
              iconName = "fitness-outline";
              break;
            case "events":
              iconName = "people-outline";
              break;
            case "questions":
              iconName = "chatbubble-ellipses-outline";
              break;
            case "leaderboard":
              iconName = "trophy-outline";
              break;
            default:
              iconName = "ellipse-outline";
          }

          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Routine" }} />
      <Tabs.Screen name="exercises" options={{ title: "Exercises" }} />
      <Tabs.Screen name="events" options={{ title: "Events" }} />
      <Tabs.Screen name="questions" options={{ title: "Journal" }} />
      <Tabs.Screen name="leaderboard" options={{ title: "Leaderboard" }} />
    </Tabs>
  );
}
