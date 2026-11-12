import React from "react";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

export default function RootLayout() {
  return (
    <>
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: "#0B0F17" },
          headerTintColor: "#F8FAFC",
          headerTitleStyle: { fontWeight: "800" },
          contentStyle: { backgroundColor: "#0B0F17" },
        }}
      >
        <Stack.Screen
          name="index"
          options={{
            title: "FormFlow AI • Biomechanics Coach",
          }}
        />
        <Stack.Screen
          name="analysis/[jobId]"
          options={{
            title: "Step-by-Step Flow & Angles",
          }}
        />
      </Stack>
    </>
  );
}
