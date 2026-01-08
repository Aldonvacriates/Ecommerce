import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import {
  createUserWithEmailAndPassword,
  deleteUser,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  type User,
} from "firebase/auth";
import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { auth, db } from "../firebase/firebase";
import type { UserProfile } from "../types/types";

type RegisterInput = {
  email: string;
  password: string;
  name: string;
  address: string;
};

type ProfileUpdate = {
  name: string;
  address: string;
};

type AuthContextValue = {
  user: User | null;
  profile: UserProfile | null;
  loading: boolean;
  register: (input: RegisterInput) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (input: ProfileUpdate) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const toDateOrNull = (value: unknown): Date | null => {
  if (value && typeof (value as { toDate?: () => Date }).toDate === "function") {
    return (value as { toDate: () => Date }).toDate();
  }
  return null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!user) {
      setProfile(null);
      return;
    }

    const userRef = doc(db, "users", user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (snapshot) => {
        if (!snapshot.exists()) {
          setProfile(null);
          return;
        }
        const data = snapshot.data();
        setProfile({
          uid: data.uid ?? user.uid,
          email: data.email ?? user.email ?? "",
          name: data.name ?? "",
          address: data.address ?? "",
          createdAt: toDateOrNull(data.createdAt),
          updatedAt: toDateOrNull(data.updatedAt),
        });
      },
      (error) => {
        console.error("Failed to load user profile", error);
        setProfile(null);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const register = async ({ email, password, name, address }: RegisterInput) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    const currentUser = credential.user;
    await setDoc(doc(db, "users", currentUser.uid), {
      uid: currentUser.uid,
      email: currentUser.email ?? email,
      name,
      address,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  };

  const login = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateProfile = async ({ name, address }: ProfileUpdate) => {
    if (!user) {
      throw new Error("You must be signed in to update your profile.");
    }
    const createdAtValue = profile?.createdAt ?? serverTimestamp();
    await setDoc(
      doc(db, "users", user.uid),
      {
        uid: user.uid,
        email: user.email ?? "",
        name,
        address,
        createdAt: createdAtValue,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );
  };

  const deleteAccount = async () => {
    if (!user) return;

    const ordersQuery = query(collection(db, "orders"), where("userId", "==", user.uid));
    const ordersSnapshot = await getDocs(ordersQuery);
    await Promise.all(ordersSnapshot.docs.map((orderDoc) => deleteDoc(orderDoc.ref)));

    await deleteDoc(doc(db, "users", user.uid));
    await deleteUser(user);
  };

  const value = useMemo(
    () => ({
      user,
      profile,
      loading,
      register,
      login,
      logout,
      updateProfile,
      deleteAccount,
    }),
    [user, profile, loading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
