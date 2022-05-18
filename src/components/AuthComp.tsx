import React, { useState } from "react";
import { useAuthContext } from "../contexts/auth/auth-context";
import Login from "./Login";
import SignUp from "./SignUp";

export default function AuthComp() {
  const [isLogin, setIsLogin] = useState(true);
  const { resetPassword, user } = useAuthContext();

  return (
    <div className="flex justify-center content-center">
      <div>
        <div className="mb-2">
          {isLogin ? (
            <Login setIsLogin={setIsLogin} />
          ) : (
            <SignUp setIsLogin={setIsLogin} />
          )}
        </div>
        {isLogin ? (
          <>
            <div className="toggle-line">
              Create new account?{" "}
              <button
                onClick={() => setIsLogin((prev) => !prev)}
                className="text-blue-500"
              >
                Sign Up
              </button>
            </div>
            <div className="toggle-line">
              Forgot password?{" "}
              <button
                className="text-blue-500"
                onClick={() => {
                  resetPassword && user && resetPassword(user.email!);
                }}
              >
                get Link
              </button>
            </div>
          </>
        ) : (
          <div className="toggle-line">
            Already Logged in?{" "}
            <button
              onClick={() => setIsLogin((prev) => !prev)}
              className="text-blue-500"
            >
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
