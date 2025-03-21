import React, { createContext, useContext, useState, useEffect, ReactNode, } from "react";
import { auth } from "../constants/firebaseConfig";
import { User, onAuthStateChanged, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut,} from "firebase/auth";

  
  // Define the shape of our AuthContext
  interface AuthContextType {
    currentUser: User | null;
    login: (email: string, password: string) => Promise<any>;
    signup: (email: string, password: string) => Promise<any>;
    logout: () => Promise<void>;
    loading: boolean;
  }
  
  // Create Context
  const AuthContext = createContext<AuthContextType | undefined>(undefined);
  
  // Hook to use auth context
  export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
      throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
  }
  
  // Provider Props
  interface AuthProviderProps {
    children: ReactNode;
  }
  
  // AuthProvider Component
  export default function AuthProvider({ children }: AuthProviderProps) {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
  
    // Handle login
    const login = (email: string, password: string) => {
      return signInWithEmailAndPassword(auth, email, password);
    };
  
    // Handle signup
    const signup = (email: string, password: string) => {
      return createUserWithEmailAndPassword(auth, email, password);
    };
  
    // Handle logout
    const logout = () => {
      return signOut(auth);
    };
  
    // Track auth state
    useEffect(() => {
      const unsubscribe = onAuthStateChanged(auth, async (user) => {
        try {
          if (user) {
            // Optional: check token to confirm it's still valid
            await user.getIdToken(); // throws if invalid
            setCurrentUser(user);
          } else {
            setCurrentUser(null);
          }
        } catch (err) {
          console.warn("User token invalid, logging out.");
          await logout();
          setCurrentUser(null);
        } finally {
          setLoading(false);
        }
      });
  
      return unsubscribe;
    }, []);
  
    const value: AuthContextType = {
      currentUser,
      login,
      signup,
      logout,
      loading,
    };
  
    return (
      <AuthContext.Provider value={value}>
        {!loading && children}
      </AuthContext.Provider>
    );
  }
  