import React, { forwardRef, useImperativeHandle, useState } from "react";
import auth from "./authConfig";
import {
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  signInWithPopup,
} from "firebase/auth";
import { useNavigate } from "react-router-dom";
import "./loginRegister.css";
import googleIcon from "./google-icon.png";

const SignIn = forwardRef(({ ref, changePageFn }) => {
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");

  const [errorMsg, setErrorMsg] = useState("");

  const navigate = useNavigate();

  const signIn = () => {
    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        navigate("/dashboard");
      })
      .catch((err) => {
        if (password == "" || email == "") {
          setErrorMsg("Niet alle velden zijn ingevuld.");
          return;
        } else if (err.code == "auth/invalid-credential") {
          setErrorMsg(
            "Inloggen is mislukt: check goed of u het wachtwoord / email adress goed heeft ingevuld."
          );
          return;
        } else if (err.code == "auth/too-many-requests") {
          setErrorMsg(
            "Toegang tot dit account is tijdelijk geblokkeerd, omdat u te vaak verkeerd heeft proberen in te loggen."
          );
          return;
        }

        setErrorMsg(err.message);
      });
  };

  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider)
      .then((result) => {
        navigate("/dashboard");
      })
      .catch((error) => {
        setErrorMsg(error.message);
      });
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
          {errorMsg != "" && <p className="error-msg">{errorMsg}</p>}

          <button className="normal-btn" onClick={() => signIn()}>
            Inloggen
          </button>
          <button className="google-btn" onClick={() => signInWithGoogle()}>
            <img src={googleIcon} alt="google-icon" />
            Log in met google
          </button>
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
