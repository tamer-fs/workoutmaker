import React, { forwardRef, useImperativeHandle } from "react";
import "./popup.css";

const Popup = forwardRef(({ children }, ref, window) => {
  function makeVisible(window) {
    const el = document.getElementsByClassName("popup-window")[window];
    el.classList.add("visible");
  }
  function makeInVisible(window) {
    const el = document.getElementsByClassName("popup-window")[window];
    el.classList.remove("visible");
  }

  useImperativeHandle(ref, () => {
    return {
      makeVisible,
      makeInVisible,
    };
  });

  return <div className="popup-window">{children}</div>;
});

export default Popup;
