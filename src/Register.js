import React, { forwardRef, useImperativeHandle, useState } from "react";
import auth from "./authConfig";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import googleIcon from "./google-icon.png";

const Register = forwardRef(({ ref, changePageFn }) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const register = () => {
    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        if (password == "" || email == "") {
          setErrorMsg("Niet alle velden zijn ingevuld.");
          return;
        } else if (err.code == "auth/email-already-in-use") {
          setErrorMsg(
            "Het email adress dat u heeft ingevuld is al in gebruik."
          );
          return;
        }

        setErrorMsg(err.message);
      });
  };

  const registerWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        navigate("/dashboard");
      })
      .catch((error) => setErrorMsg(error.message));
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
          {errorMsg != "" && <p className="error-msg">{errorMsg}</p>}

          <button onClick={() => register()}>Registreren</button>
          <button className="google-btn" onClick={() => registerWithGoogle()}>
            <img src={googleIcon} alt="google-icon" />
            Registreer met google
          </button>
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
