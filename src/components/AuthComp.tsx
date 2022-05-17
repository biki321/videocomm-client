import React, { useState } from "react";
import Login from "./Login";
import SignUp from "./SignUp";

export default function AuthComp() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex justify-center content-center">
      <div>
        <div className=" ">
          {isLogin ? (
            <Login setIsLogin={setIsLogin} />
          ) : (
            <SignUp setIsLogin={setIsLogin} />
          )}
        </div>
        {isLogin ? (
          <div className="toggle-line">
            Create new account?{" "}
            <button onClick={() => setIsLogin((prev) => !prev)} className="">
              Sign Up
            </button>
          </div>
        ) : (
          <div className="toggle-line">
            Already Logged in?
            <button onClick={() => setIsLogin((prev) => !prev)} className="">
              Sign In
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
