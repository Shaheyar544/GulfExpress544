import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  UserCredential,
} from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";

interface AdminUser extends User {
  role?: string;
}

interface AuthContextType {
  currentUser: AdminUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<UserCredential>;
  logout: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentUser, setCurrentUser] = useState<AdminUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // Check if user is an admin
        try {
          const adminDoc = await getDoc(doc(db, "admins", user.uid));
          if (adminDoc.exists()) {
            const adminData = adminDoc.data();
            const adminUser = {
              ...user,
              role: adminData.role || "admin",
            } as AdminUser;
            setCurrentUser(adminUser);
          } else {
            // User is authenticated but not an admin
            setCurrentUser(null);
            await signOut(auth);
          }
        } catch (error) {
          console.error("Error checking admin status:", error);
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const login = async (email: string, password: string): Promise<UserCredential> => {
    try {
      // Ensure we have valid string values
      const emailValue = String(email).trim();
      const passwordValue = String(password).trim();

      if (!emailValue || !passwordValue) {
        throw new Error("Email and password are required");
      }

      // Sign in with email and password
      const userCredential = await signInWithEmailAndPassword(auth, emailValue, passwordValue);
      
      // Verify admin status after successful authentication
      try {
        const adminDoc = await getDoc(doc(db, "admins", userCredential.user.uid));
        if (!adminDoc.exists()) {
          await signOut(auth);
          throw new Error("You are not authorized to access the admin panel.");
        }

        const adminData = adminDoc.data();
        const adminUser = {
          ...userCredential.user,
          role: adminData.role || "admin",
        } as AdminUser;
        setCurrentUser(adminUser);

        return userCredential;
      } catch (adminError: any) {
        // If admin check fails, sign out and throw error
        await signOut(auth);
        throw adminError;
      }
    } catch (error: any) {
      console.error("Login error:", error);
      // Re-throw with user-friendly message
      const errorCode = error?.code;
      let errorMessage = "Failed to sign in. Please try again.";

      if (errorCode === "auth/user-not-found" || errorCode === "auth/wrong-password") {
        errorMessage = "Invalid email or password.";
      } else if (errorCode === "auth/invalid-email") {
        errorMessage = "Invalid email address.";
      } else if (errorCode === "auth/network-request-failed") {
        errorMessage = "Network error. Please check your internet connection and try again.";
      } else if (errorCode === "auth/too-many-requests") {
        errorMessage = "Too many failed attempts. Please try again later.";
      } else if (error?.message) {
        errorMessage = error.message;
      }

      throw new Error(errorMessage);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
      setCurrentUser(null);
    } catch (error) {
      console.error("Logout error:", error);
      throw error;
    }
  };

  const value: AuthContextType = {
    currentUser,
    loading,
    login,
    logout,
    isAdmin: currentUser?.role === "admin" || currentUser?.role === "super_admin",
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

