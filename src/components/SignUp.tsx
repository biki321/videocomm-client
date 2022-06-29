import { useEffect, useState } from "react";
import { useAuthContext } from "../contexts/auth/auth-context";
import "../static/css/signup.css";

// interface LocationState {
//   from: {
//     pathname: string;
//   };
// }

interface IProps {
  setIsLogin: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function SignUp({ setIsLogin }: IProps) {
  const { signUp, authErrorServer } = useAuthContext();
  const [inputData, setInputData] = useState({
    useremail: "",
    password: "",
  });
  const [inputError, setInputError] = useState({
    useremailError: "",
    useremailValid: false,
    passwordError: "",
    passwordValid: false,
  });
  const [valid, setValid] = useState(false);
  // const location = useLocation<LocationState>();
  // const history = useHistory();
  // const { from } = location.state || { from: { pathname: "/chat" } };

  useEffect(() => {
    if (inputError.useremailValid && inputError.passwordValid) setValid(true);
    else setValid(false);
    return () => {};
  }, [inputError.passwordValid, inputError.useremailValid]);

  // if (authState.isAuthLoading) {
  //   return <div>Loading</div>;
  // }

  // if (authState.user) {
  //   // console.log("isAuthenticated", authState.isAuthenticated);
  //   // history.replace("/home");
  //   console.log("signup page authState.isAuthenticated", from);
  //   return <Redirect to={from.pathname} />;
  // }

  const signUpFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    console.log("signUpFormSubmit");
    e.preventDefault();
    try {
      if (signUp) {
        await signUp(inputData.useremail, inputData.password);
        // setUser && setUser(userinfo);
        // console.log("userinfo", userinfo);
      }
    } catch (error) {}
    // setInputData({ useremail: "", password: "" });
    // setValid(false);
  };

  const setInputDataHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.name === "useremail") {
      setInputData((prevState) => ({
        ...prevState,
        useremail: e.target.value,
      }));
      // if condition for email
      let aecDomain = false;
      let splits = e.target.value.split("@");
      if (splits.length > 1 && splits[1] === "aec.ac.in") aecDomain = true;

      setInputError((prevState) => ({
        ...prevState,
        useremailError: !aecDomain ? "email have to be of aec domain" : "",
        useremailValid: !aecDomain ? false : true,
      }));
      // setInputError((prevState) => ({
      //   ...prevState,
      //   useremailError: "",
      //   useremailValid: true,
      // }));
    } else if (e.target.name === "password") {
      setInputData((prevState) => ({
        ...prevState,
        password: e.target.value,
      }));
      if (e.target.value.length < 4 || e.target.value.length > 30) {
        setInputError((prevState) => ({
          ...prevState,
          passwordError: "password should be between 5 to 30 characters",
          passwordValid: false,
        }));
      } else {
        setInputError((prevState) => ({
          ...prevState,
          passwordError: "",
          passwordValid: true,
        }));
      }
    }
  };

  return (
    <div className="">
      <div className="signup-page-div">
        <p className="signup-error">{authErrorServer?.signUpError}</p>
        <div className="signup-name">Sign Up</div>
        <form className="signup-form" onSubmit={(e) => signUpFormSubmit(e)}>
          <label htmlFor="useremail">Email</label>
          <input
            type="email"
            name="useremail"
            id="useremail"
            value={inputData.useremail}
            onChange={(e) => setInputDataHandler(e)}
            placeholder={"Enter email"}
            autoComplete="off"
          />
          <div className="signup-error">{inputError.useremailError}</div>
          <label htmlFor="password">Password</label>
          <input
            type="password"
            name="password"
            id="password"
            value={inputData.password}
            onChange={(e) => setInputDataHandler(e)}
            placeholder={"Enter password"}
          />

          <div className="signup-error">{inputError.passwordError}</div>
          <button
            type="submit"
            className={`signup-btn ${!valid ? "disabled-btn" : ""}`}
            disabled={!valid}
          >
            {"Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
}
