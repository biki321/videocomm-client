import { useState } from "react";
// import { Redirect, useHistory, useLocation } from "react-router-dom";
import { useAuthContext } from "../contexts/auth/auth-context";
import "../static/css/login.css";

// interface LocationState {
//   from: {
//     pathname: string;
//   };
// }
interface IProps {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}
export default function Login({ setIsLogin }: IProps) {
  const { signIn, authErrorServer } = useAuthContext();
  const [inputData, setInputData] = useState({ useremail: "", password: "" });
  // const location = useLocation<LocationState>();
  // const history = useHistory();
  // const { from } = location.state || { from: { pathname: "/chat" } };

  // if (authState.user) {
  //   console.log("login page authState.isAuthenticated", from);
  //   return <Redirect to={from.pathname} />;
  // }

  const loginFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (signIn) {
        await signIn(inputData.useremail, inputData.password);
        // setUser && setUser(userinfo);
      }
    } catch (error) {}
    // setInputData({ useremail: "", password: "" });
  };

  const setInputDataHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "useremail") {
      setInputData((prevState) => ({
        ...prevState,
        useremail: e.target.value,
      }));
    } else if (e.target.name === "password") {
      setInputData((prevState) => ({
        ...prevState,
        password: e.target.value,
      }));
    }
  };

  return (
    <div className="login-page-div">
      <p className="login-error">{authErrorServer?.signInError}</p>
      <div className="login-name">Sign In</div>
      <form className="login-form" onSubmit={(e) => loginFormSubmit(e)}>
        <label htmlFor="useremail">Email</label>
        <input
          type="text"
          name="useremail"
          id="useremail"
          value={inputData.useremail}
          onChange={(e) => setInputDataHandler(e)}
          placeholder={"Enter email"}
          autoComplete="on"
          required
        />

        <label htmlFor="password">Password</label>
        <input
          type="password"
          name="password"
          id="password"
          value={inputData.password}
          onChange={(e) => setInputDataHandler(e)}
          placeholder={"Enter password"}
          required
        />

        <button type="submit" className="login-btn">
          {"Sign In"}
        </button>
      </form>
    </div>
  );
}
