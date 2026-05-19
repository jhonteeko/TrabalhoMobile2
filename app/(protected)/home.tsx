import { Redirect } from "expo-router";

import {
  View,
  Text,
  StyleSheet,
} from "react-native";

import { useAuth } from "../../context/authContext";

export default function Home() {
  const { user } = useAuth();

  if (!user) {
    return <Redirect href="/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Home
      </Text>

      <Text style={styles.text}>
        Usuário:
      </Text>

      <Text style={styles.value}>
        {user.username}
      </Text>

      <Text style={styles.text}>
        Senha:
      </Text>

      <Text style={styles.value}>
        {user.password}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0a0a0a",
    justifyContent: "center",
    alignItems: "center",
  },

  title: {
    color: "#fff",
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 30,
  },

  text: {
    color: "#888",
    fontSize: 16,
    marginTop: 10,
  },

  value: {
    color: "#e8ff47",
    fontSize: 22,
    fontWeight: "bold",
  },
});