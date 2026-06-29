import { Stack } from "expo-router";
import { AuthProvider } from "../context/authContext";
import { ThemeProvider } from "../context/themeContext";

export default function RootLayout() {
  return (
    <ThemeProvider>
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
          <Stack.Screen name="index" />
          <Stack.Screen name="login" />
          <Stack.Screen name="register" />
          <Stack.Screen name="(protected)" />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
