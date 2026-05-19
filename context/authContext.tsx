import * as SecureStore from "expo-secure-store";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

import { Platform } from "react-native";

const USER_KEY = "user";

type User = {
  username: string;
  password: string;
};

type AuthContextType = {
  user: User | null;

  registerUser: (
    username: string,
    password: string
  ) => Promise<void>;

  loginUser: (
    username: string,
    password: string
  ) => Promise<boolean>;

  logout: () => Promise<void>;
};

const AuthContext =
  createContext<AuthContextType>(
    {} as AuthContextType
  );

type Props = {
  children: ReactNode;
};

export function AuthProvider({
  children,
}: Props) {
  const [user, setUser] =
    useState<User | null>(null);

  useEffect(() => {
    loadUser();
  }, []);

  async function loadUser() {
    try {
      let data = null;

      if (Platform.OS === "web") {
        data =
          localStorage.getItem(USER_KEY);
      } else {
        data =
          await SecureStore.getItemAsync(
            USER_KEY
          );
      }

      if (data) {
        setUser(JSON.parse(data));
      }
    } catch (error) {
      console.log(
        "Erro ao carregar usuário"
      );
    }
  }

  async function registerUser(
    username: string,
    password: string
  ) {
    try {
      const newUser: User = {
        username,
        password,
      };

      if (Platform.OS === "web") {
        localStorage.setItem(
          USER_KEY,
          JSON.stringify(newUser)
        );
      } else {
        await SecureStore.setItemAsync(
          USER_KEY,
          JSON.stringify(newUser)
        );
      }

      setUser(newUser);

      console.log("Usuário salvo:");
      console.log(newUser);

    } catch (error) {
      console.log("Erro ao registrar");
    }
  }
async function loginUser(
  username: string,
  password: string
) {
  try {
    let data = null;

    if (Platform.OS === "web") {
      data = localStorage.getItem(USER_KEY);
    } else {
      data = await SecureStore.getItemAsync(
        USER_KEY
      );
    }

    if (!data) {
      return false;
    }

    const savedUser: User =
      JSON.parse(data);

    if (
      savedUser.username === username &&
      savedUser.password === password
    ) {
      setUser(savedUser);

      return true;
    }

    return false;

  } catch (error) {
    console.log("Erro no login");

    return false;
  }
}

  async function logout() {
    try {
      if (Platform.OS === "web") {
        localStorage.removeItem(
          USER_KEY
        );
      } else {
        await SecureStore.deleteItemAsync(
          USER_KEY
        );
      }

      setUser(null);

    } catch (error) {
      console.log("Erro ao sair");
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        registerUser,
        loginUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}