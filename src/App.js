import "./App.css";
import { useEffect, useRef, useState } from "react";
import Popup from "./components/popup/Popup";
import ExcerciseWidget from "./components/excerciseWidget/ExcerciseWidget";
import WorkoutWidget from "./components/workoutWidget/WorkoutWidget";

function App() {
  // refs
  const addExserciseRef = useRef();
  const addToWorkoutRef = useRef();
  const workoutWidgetRef = useRef();

  // usesates
  const [muscleInput, setMuscleInput] = useState("legs");
  const [workoutDate, setWorkoutDate] = useState("Workout: 9-7-2025");
  const [dateIncrement, setDateIncrement] = useState(0);

  const [excerciseName, setExcerciseName] = useState("");
  const [excerciseDuration, setexcerciseDuration] = useState();
  const [excerciseColor, setExcerciseColor] = useState("green");

  const [workouts, setWorkouts] = useState([]);
  const [excercises, setExcercises] = useState([]);

  // functions
  const changeDateIncrement = (inc) => {
    let increment = dateIncrement;
    increment += inc;
    setDateIncrement(increment);
  };

  const changeDate = () => {
    let date = new Date();
    date.setDate(date.getDate() + dateIncrement);
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    setWorkoutDate(`Workout: ${day}-${month + 1}-${year}`);
  };

  const addExcercise = () => {
    let listCopy = workouts;
    let useList = workouts.filter((obj) => obj.date == workoutDate);
    listCopy.push({
      name: excerciseName,
      duration: excerciseDuration,
      color: excerciseColor,
      date: workoutDate,
      order: useList.length,
    });
    setWorkouts(listCopy);
    console.log(workouts);
    setExcerciseName("");
    setexcerciseDuration();
    setExcerciseColor("green");
    console.log(workouts);
  };

  const changeWorkouts = (list) => {
    setExcercises(list);
    console.log(excercises);
  };

  async function getExcerciseData(muscleType) {
    console.log(muscleType.toLowerCase());
    const url = `https://work-out-api1.p.rapidapi.com/search?Muscles=${muscleType.toLowerCase()}`;
    const options = {
      method: "GET",
      headers: {
        "x-rapidapi-key": "bb1fd2f288msh92f505bd8a31870p19a132jsnc1ce7bb36105",
        "x-rapidapi-host": "work-out-api1.p.rapidapi.com",
      },
    };

    try {
      const response = await fetch(url, options);
      const result = await response.text();
      let res = JSON.parse(result);
      let list = [];
      res.forEach((excercise) => {
        list.push({
          name: excercise["WorkOut"],
          muscle: excercise["Muscles"],
          equipment: excercise["Equipment"],
          explaination: excercise["Explaination"],
          intensity: excercise["Intensity_Level"],
        });
      });
      changeWorkouts(list);
    } catch (error) {
      console.error(error);
    }
  }

  const testFn = (name) => {
    setExcerciseName(name);
    addExserciseRef.current?.makeVisible();
  };

  const deleteExcerciseFromWorkout = (index) => {
    let listCopy = workouts;
    listCopy.splice(index, 1);
    let list = [];
    setWorkouts([]);
    listCopy.forEach((element) => {
      list.push({
        color: element.color,
        date: element.date,
        duration: element.duration,
        name: element.name,
        order: element.order,
      });
    });
    setWorkouts(list);
  };

  const changeWorkoutOrder = (order, index) => {
    let listCopy = workouts.filter((obj) => obj.date == workoutDate);
    let element = listCopy[index];

    element = {
      color: element.color,
      date: element.date,
      duration: element.duration,
      name: element.name,
      order: order,
    };
    listCopy[index] = element;
    let list = [];
    setWorkouts([]);
    listCopy.forEach((element) => {
      list.push({
        color: element.color,
        date: element.date,
        duration: element.duration,
        name: element.name,
        order: element.order,
      });
    });
    setWorkouts(list);
  };

  // use effects
  useEffect(() => {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    setWorkoutDate(`Workout: ${day}-${month + 1}-${year}`);
    getExcerciseData("legs");
  }, []);

  return (
    <>
      <Popup ref={addExserciseRef}>
        <div className="workout-adder">
          <div className="name-input">
            <input
              type="text"
              id="excercise-name-input"
              placeholder="Warming up"
              value={excerciseName}
              onChange={(e) => setExcerciseName(e.target.value)}
            />
          </div>
          <div className="details">
            <div className="time-choose">
              <input
                type="text"
                id="time-input"
                placeholder="5"
                value={excerciseDuration}
                onChange={(e) => setexcerciseDuration(e.target.value)}
              />
              <h3>min</h3>
            </div>
            <div className="color-choose">
              <input
                className="choose-point"
                style={{ backgroundColor: "#20CB6F" }}
                onClick={() => setExcerciseColor("green")}
              ></input>
              <input
                className="choose-point"
                style={{ backgroundColor: "#F4E55E" }}
                onClick={() => setExcerciseColor("yellow")}
              ></input>
              <input
                className="choose-point"
                style={{ backgroundColor: "#E67444" }}
                onClick={() => setExcerciseColor("orange")}
              ></input>
              <input
                className="choose-point"
                style={{ backgroundColor: "#DE4343" }}
                onClick={() => setExcerciseColor("red")}
              ></input>
            </div>
          </div>
          <div className="finish">
            <button
              onClick={() => {
                addExserciseRef.current?.makeInVisible();
              }}
            >
              annuleer
            </button>
            <button
              onClick={() => {
                addExcercise();
                addExserciseRef.current?.makeInVisible();
              }}
            >
              voeg oefening toe
            </button>
          </div>
        </div>
      </Popup>

      <div className="app-container">
        <div className="excercise-list-widget">
          <div className="input-field">
            <input
              type="text"
              id="muscle-input"
              placeholder="Welk spier wilt u trainen?"
              onChange={(e) => {
                setMuscleInput(e.target.value);
                getExcerciseData(muscleInput);
                setExcercises([]);
              }}
              value={muscleInput}
            />
          </div>
          <div className="excercise-list">
            {excercises.map((excercise, index) => (
              <div id={index}>
                <ExcerciseWidget
                  name={excercise.name}
                  muscle={excercise.muscle}
                  equipment={excercise.equipment}
                  descriptionText={excercise.explaination}
                  intensity={excercise.intensity}
                  addToWorkoutFunction={testFn}
                  ref={addToWorkoutRef}
                />
              </div>
            ))}
          </div>
        </div>
        <div className="workout-widget">
          <div className="date-selection">
            <button
              onClick={() => {
                changeDate();
                changeDateIncrement(-1);
              }}
            >
              {"<"}
            </button>
            <h3>{workoutDate}</h3>
            <button
              onClick={() => {
                changeDate();
                changeDateIncrement(1);
              }}
            >
              {">"}
            </button>
          </div>
          <div className="workout-planning">
            {workouts
              .filter((obj) => obj.date == workoutDate)
              .sort((e1, e2) =>
                e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
              )
              .map((workout, index) => (
                <div id={index}>
                  <WorkoutWidget
                    name={workout.name}
                    duration={workout.duration}
                    color={workout.color}
                    index={index}
                    ref={workoutWidgetRef}
                    deleteFn={deleteExcerciseFromWorkout}
                    changeOrderFn={changeWorkoutOrder}
                  />
                </div>
              ))}
          </div>
          <div className="workout-buttons">
            <button
              onClick={() => {
                addExserciseRef.current?.makeVisible();
              }}
            >
              voeg eigen oefening toe
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default App;
