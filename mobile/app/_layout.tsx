import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { MenuProvider, MenuButton } from "../src/components/SideMenu";

export default function RootLayout() {
  return (
    <MenuProvider>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0B0F17" },
          headerTintColor: "#F8FAFC",
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: "#0B0F17" },
          headerRight: () => <MenuButton />,
        }}
      >
        <Stack.Screen name="index" options={{ title: "LastRepEasy" }} />
        <Stack.Screen name="form" options={{ title: "Form check" }} />
        <Stack.Screen name="analysis/[jobId]" options={{ title: "Results" }} />
        <Stack.Screen name="plans/index" options={{ title: "Training plans" }} />
        <Stack.Screen name="plans/[planId]" options={{ title: "Plan" }} />
        <Stack.Screen name="workout/[planId]/[week]/[day]" options={{ title: "Workout" }} />
        <Stack.Screen name="lifts" options={{ title: "My lifts" }} />
        <Stack.Screen name="photos" options={{ title: "Progress photos" }} />
      </Stack>
    </MenuProvider>
  );
}
