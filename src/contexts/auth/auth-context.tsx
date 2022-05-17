import { createContext, useContext, useEffect } from "react";
import { useState } from "react";
import { User } from "firebase/auth";
import { sendEmailVerification, UserCredential } from "firebase/auth";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
  sendPasswordResetEmail,
} from "firebase/auth";
import AuthComp from "../../components/AuthComp";
import { auth } from "../../config/firebase-config";

interface IProps {
  children: JSX.Element;
}

interface IContext {
  user: User | null;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setUser: React.Dispatch<React.SetStateAction<any>>;
  signUp: (
    email: string,
    password: string
  ) => Promise<UserCredential | undefined>;
  signIn: (
    email: string,
    password: string
  ) => Promise<UserCredential | undefined>;
  resetPassword: (email: string) => Promise<void>;
  deleteUser: () => Promise<void>;
}

// const initialAuthContext: IContext = {
//   user: {},
//   setUser: function (): Promise<void> {
//     throw new Error("Function not implemented.");
//   },
//   refreshToken: function (): Promise<string | null> {
//     throw new Error("Function not implemented.");
//   },
//   logout: function (): void {
//     throw new Error("Function not implemented.");
//   },
//   signUp: (email: string, password: string) =>
//     new Promise<undefined>(undefined),
// };

const AuthContext = createContext<Partial<IContext>>({});

console.log("inside auth context");

export function useAuthContext() {
  return useContext(AuthContext);
}

export function AuthContextProvider({ children }: IProps) {
  const [user, setUser] = useState<User | null>(null);
  const [getin, setGetin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const redirectUrl = process.env.REACT_APP_URL;

  const signUp = async (email: string, password: string) => {
    try {
      const userinfo = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      await sendEmailVerification(auth.currentUser!);
      console.log("email sent for verification");
      console.log("userinfo", userinfo);
      return userinfo;
    } catch (error) {}
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userinfo = await signInWithEmailAndPassword(auth, email, password);

      return userinfo;
    } catch (error) {}
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {}
  };

  const deleteUser = async () => {
    try {
      await auth.currentUser?.delete();
    } catch (error) {}
  };

  useEffect(() => {
    const unlisten = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log(currentUser);
        setUser(currentUser);
        const token = await currentUser.getIdToken();
        window.localStorage.setItem("token", token);
        setGetin(() => currentUser.emailVerified);
      } else setUser(null);
    });

    return () => {
      unlisten();
    };
  }, []);

  const values = { user, setUser, signUp, signIn, resetPassword, deleteUser };

  return (
    <AuthContext.Provider value={values}>
      {getin ? children : <AuthComp />}
    </AuthContext.Provider>
  );
}
