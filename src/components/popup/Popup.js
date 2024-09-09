import React, { forwardRef, useImperativeHandle } from "react";
import "./popup.css";

const Popup = forwardRef(({ children }, ref) => {
  const el = document.getElementById("popup");
  function makeVisible() {
    el.classList.add("visible");
  }
  function makeInVisible() {
    el.classList.remove("visible");
  }

  useImperativeHandle(ref, () => {
    return {
      makeVisible,
      makeInVisible,
    };
  });

  return (
    <div id="popup" className="popup-window">
      {children}
    </div>
  );
});

export default Popup;
