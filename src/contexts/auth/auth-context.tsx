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
import InformationLine from "../../components/InformationLine";

interface IProps {
  children: JSX.Element;
}

interface IContext {
  user: User | null;
  isLoading: boolean;
  authErrorServer: {
    signInError: string;
    signUpError: string;
  };
  setAuthErrorServer: React.Dispatch<
    React.SetStateAction<{
      signInError: string;
      signUpError: string;
    }>
  >;
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
  signOutUser: () => Promise<void>;
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
  const [verifyEmail, setVerifyEmail] = useState(false);
  const [resetLinkSent, setResetLinkSent] = useState(false);
  const [getin, setGetin] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(true);
  const [authErrorServer, setAuthErrorServer] = useState({
    signInError: "",
    signUpError: "",
  });
  const redirectUrl = process.env.REACT_APP_URL;

  const signUp = async (email: string, password: string) => {
    try {
      const userinfo = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      console.log("at send emal verify", auth.currentUser!);
      await sendEmailVerification(auth.currentUser!, { url: redirectUrl! });
      console.log("userinfo", userinfo);
      setVerifyEmail(true);
      setAuthErrorServer({ signInError: "", signUpError: "" });
      return userinfo;
    } catch (error: any) {
      if (error.code === "auth/email-already-in-use")
        setAuthErrorServer((ps) => ({
          ...ps,
          signUpError: "Email already in use",
        }));
      console.log("error at sign up", error);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const userinfo = await signInWithEmailAndPassword(auth, email, password);
      setAuthErrorServer({ signInError: "", signUpError: "" });
      return userinfo;
    } catch (error: any) {
      // 'auth/wrong-password' - error code
      if (error.code === "auth/wrong-password")
        setAuthErrorServer((ps) => ({
          ...ps,
          signInError: "You have entered wrong password",
        }));
      else if (error.code === "auth/user-not-found")
        setAuthErrorServer((ps) => ({
          ...ps,
          signInError: "This user does not exist",
        }));
    }
  };

  const signOutUser = async () => {
    console.log("signout user");
    signOut(auth);
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth, email, { url: redirectUrl! });
      console.log("password reset link has been sent");
      setResetLinkSent(true);
    } catch (error) {
      console.log("error at reset", error);
    }
  };

  const deleteUser = async () => {
    try {
      await auth.currentUser?.delete();
    } catch (error) {}
  };

  useEffect(() => {
    const unlisten = onAuthStateChanged(
      auth,
      async (currentUser) => {
        console.log("currentUser", currentUser);
        if (currentUser && currentUser.emailVerified) {
          console.log(currentUser);
          setUser(currentUser);
          const token = await currentUser.getIdToken();
          window.localStorage.setItem("token", token);
          setGetin(() => currentUser.emailVerified);
        } else {
          setUser(null);
          setGetin(false);
        }
        setIsAuthLoading(false);
      },
      async (error: any) => {
        console.log("error at onAuthStateChanged", error);
      }
    );

    return () => {
      unlisten();
    };
  }, []);

  const values = {
    user,
    setUser,
    signUp,
    signIn,
    signOutUser,
    resetPassword,
    deleteUser,
    authErrorServer,
    setAuthErrorServer,
  };

  const chooseComp = () => {
    if (verifyEmail)
      return (
        <InformationLine text="Verification link has been sent to your email" />
      );
    if (resetLinkSent)
      <InformationLine text="Password reset link has been sent to your email" />;

    if (isAuthLoading) return "loading";

    if (getin) return children;
    else return <AuthComp />;
  };

  return (
    <AuthContext.Provider value={values}>
      {chooseComp()}
      {/* {isAuthLoading ? "Loading" : getin ? children : <AuthComp />} */}
    </AuthContext.Provider>
  );
}
