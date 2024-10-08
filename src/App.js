import React, { useRef, useState } from "react";
import App from "./Main";
import SignIn from "./Login";
import Register from "./Register";
import { HashRouter, Routes, Route } from "react-router-dom";

function MainApp() {
  const [page, setPage] = useState(0);

  const changePage = (value) => {
    setPage(value);
  };

  const loginRef = useRef();
  const registerRef = useRef();

  return (
    <>
      <HashRouter>
        <Routes>
          <Route
            index
            element={<SignIn ref={loginRef} changePageFn={changePage} />}
          />
          <Route path="/dashboard" element={<App />} />
          <Route
            path="/register"
            element={<Register ref={registerRef} changePageFn={changePage} />}
          />
        </Routes>
      </HashRouter>
    </>
  );
}

export default MainApp;
