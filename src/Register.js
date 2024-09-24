import React, { forwardRef, useImperativeHandle, useState } from "react";
import auth from "./authConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const Register = forwardRef(({ ref, changePageFn }) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const navigate = useNavigate();

  const register = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const changeUsePage = (page) => {
    changePageFn(page);
  };

  useImperativeHandle(ref, () => ({
    callParentFunction: register,
    changeUsePage,
  }));

  return (
    <div className="login-register-app">
      <div className="login-register-form">
        <div className="login-register-title-container">
          <h2>Registreren</h2>
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

          <button onClick={() => register()}>Registreren</button>
        </div>
        <div className="login-register-footer">
          <p>Heeft u al een account?</p>
          <button
            onClick={() => {
              navigate("/");
            }}
          >
            Inloggen
          </button>
        </div>
      </div>
    </div>
  );
});

export default Register;
