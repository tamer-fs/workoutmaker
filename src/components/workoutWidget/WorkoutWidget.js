import React, {
  useEffect,
  useImperativeHandle,
  forwardRef,
  useState,
} from "react";
import "./workoutWidget.css";

const WorkoutWidget = forwardRef(
  ({
    name = "Deadlift",
    duration = "10",
    color = "red",
    index,
    ref,
    deleteFn,
    changeOrderFn,
  }) => {
    let style = {};
    if (color == "green") {
      style = {
        backgroundColor: "rgba(32, 203, 111, 0.6)",
        border: "4px solid rgba(32, 203, 111)",
      };
    } else if (color == "yellow") {
      style = {
        backgroundColor: "rgba(244, 229, 94, 0.6)",
        border: "4px solid rgb(244, 229, 94)",
      };
    } else if (color == "orange") {
      style = {
        backgroundColor: "rgba(230, 116, 68, 0.6)",
        border: "4px solid rgb(230, 116, 68)",
      };
    } else {
      style = {
        backgroundColor: "rgba(222, 67, 67, 0.6)",
        border: "4px solid rgba(222, 67, 67)",
      };
    }

    const [workoutOrderInput, setWorkoutOrderInput] = useState("");

    const deleteExcercise = () => {
      deleteFn(index);
    };

    const changeWorkoutOrder = (movement) => {
      changeOrderFn(movement, index);
    };

    const setWorkoutOrder = (order) => {
      setWorkoutOrderInput(order);
    };

    useImperativeHandle(ref, () => ({
      callParentFunction: deleteExcercise,
      changeWorkoutOrder,
      setWorkoutOrder,
    }));

    return (
      <>
        <div style={style} className="workout-widget-container">
          <div className="data-container">
            <h2>{name}</h2>
            <h3>{duration}min</h3>
          </div>
          <div className="buttons-container">
            <button className="x-btn" onClick={() => deleteExcercise()}>
              ✖
            </button>
            <div>
              <input
                type="text"
                placeholder="0"
                id="order-input"
                value={workoutOrderInput}
                onChange={(e) => setWorkoutOrderInput(e.target.value)}
              ></input>
              <button
                className="up-btn"
                onClick={() => changeWorkoutOrder(workoutOrderInput)}
              >
                ok
              </button>
            </div>
          </div>
        </div>
      </>
    );
  }
);

export default WorkoutWidget;
