import React, { useEffect, useState } from "react";
import "./dropdown.css";

function Dropdown({ children, id, maxHeight, title }) {
  const [open, setOpen] = useState(false);
  const [list, setList] = useState();
  const [arrow, setArrow] = useState();

  const toggleDropdown = () => {
    console.log(list);
    if (open) {
      setOpen(false);
      list.style.overflowY = "hidden";
      list.style.height = "0px";
      list.style.visibility = "collapse";
      arrow.style.transform = "rotate(90deg)";
    } else {
      setOpen(true);
      list.style.overflowY = "scroll";
      list.style.height = `${maxHeight}px`;
      list.style.visibility = "visible";
      arrow.style.transform = "rotate(-90deg)";
    }
  };

  useEffect(() => {
    setArrow(document.getElementById(`${id}-arrow`));
    setList(document.getElementById(`${id}-list`));
  }, []);

  return (
    <div className="dropdown-btn" id={id}>
      <div className="dropdown-btn-container" onClick={() => toggleDropdown()}>
        <h4>{title}</h4>
        <h3 id={`${id}-arrow`}>{">"}</h3>
      </div>

      <ul
        className="dropdown-btns"
        id={`${id}-list`}
        onClick={() => toggleDropdown()}
      >
        {children}
      </ul>
    </div>
  );
}

export default Dropdown;
