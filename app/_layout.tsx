import { Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";

export default function RootLayout() {
  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: "fade",
          contentStyle: {
            backgroundColor: "#0a0a0a",
          },
        }}
      >
        {/* Públicas */}
        <Stack.Screen name="index" />
        <Stack.Screen name="login" />
        <Stack.Screen name="register" />

        {/* Protegidas */}
        <Stack.Screen name="(protected)" />
      </Stack>
    </AuthProvider>
  );
}
