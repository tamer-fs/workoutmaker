import React, { forwardRef, useImperativeHandle, useState } from "react";
import auth from "./authConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./loginRegister.css";

const SignIn = forwardRef(({ ref, changePageFn }) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => alert(err.message));
  };

  const changeUsePage = (page) => {
    changePageFn(page);
  };

  useImperativeHandle(ref, () => ({
    callParentFunction: signIn,
    changeUsePage,
  }));

  return (
    <div className="login-register-app">
      <div className="login-register-form">
        <div className="login-register-title-container">
          <h2>Inloggen</h2>
        </div>
        <div className="login-register-inputs-container">
          <input
            placeholder="Email adress"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            placeholder="Wachtwoord"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button onClick={() => signIn()}>Login</button>
        </div>
        <div className="login-register-footer">
          <p>Nog geen account?</p>
          <button
            onClick={() => {
              navigate("/register");
            }}
          >
            Register
          </button>
        </div>
      </div>
    </div>
  );
});

export default SignIn;
