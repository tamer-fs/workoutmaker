import React, { forwardRef, useState, useImperativeHandle } from "react";
import "./excerciseWidget.css";

const ExcerciseWidget = forwardRef(
  ({
    name = "Chest dumbell fly",
    muscle = "chest",
    equipment = "dumbells",
    descriptionText = "Well if you didn't know that this is the real deal then listen to this litte bit of information.",
    intensity = "beginner",
    addToWorkoutFunction,
    ref,
  }) => {
    const [btnText, setBtnText] = useState("Lees meer");
    const [description, setDescription] = useState(false);

    const toggleDescription = () => {
      if (description == false) {
        setDescription(true);
        setBtnText("Lees minder");
      } else {
        setDescription(false);
        setBtnText("Lees meer");
      }
    };

    const addToWorkout = (nm) => {
      addToWorkoutFunction(nm);
    };

    useImperativeHandle(ref, () => ({
      callParentFunction: addToWorkout,
    }));

    return (
      <div className="excercise-widget-container">
        <div className="title-container">
          <h2>{name}</h2>
        </div>
        <div className="excercise-details">
          <p>muscle: {muscle}</p>
          <p>equipment: {equipment}</p>
          <p>intensity: {intensity}</p>
        </div>
        {description && (
          <p className="description-details">{descriptionText}</p>
        )}
        <div className="buttons">
          <button
            style={{
              backgroundColor: "transparent",
              border: "2px solid #4365de",
              color: "#4365de",
            }}
            onClick={() => {
              toggleDescription();
            }}
          >
            {btnText}
          </button>
          <button onClick={() => addToWorkout(name)}>
            voeg toe aan workout
          </button>
        </div>
      </div>
    );
  }
);

export default ExcerciseWidget;
