import "./App.css";
import { useEffect, useRef, useState } from "react";
import Popup from "./components/popup/Popup";
import ExcerciseWidget from "./components/excerciseWidget/ExcerciseWidget";
import WorkoutWidget from "./components/workoutWidget/WorkoutWidget";
import $ from "jquery";
import audio from "./done.mp3";

function App() {
  // refs
  const addExserciseRef = useRef();
  const addToWorkoutRef = useRef();
  const workoutWidgetRef = useRef();
  const workoutTimerRef = useRef();

  // usesates
  const muscles = [
    "abdominals",
    "abductors",
    "adductors",
    "biceps",
    "calves",
    "chest",
    "forearms",
    "glutes",
    "hamstrings",
    "lats",
    "lower_back",
    "middle_back",
    "neck",
    "quadriceps",
    "traps",
    "triceps",
  ];
  const [muscleInput, setMuscleInput] = useState(
    muscles[Math.floor(Math.random() * muscles.length)]
  );
  const [workoutDate, setWorkoutDate] = useState("Workout: 9-7-2025");
  const [dateIncrement, setDateIncrement] = useState(0);

  const [excerciseName, setExcerciseName] = useState("");
  const [excerciseDuration, setexcerciseDuration] = useState();
  const [excerciseColor, setExcerciseColor] = useState("green");

  const [workouts, setWorkouts] = useState([]);
  const [excercises, setExcercises] = useState([]);

  const [timers, setTimers] = useState([]);
  const [timerRunning, setTimerRunning] = useState(false);
  const [timerIndex, setTimerIndex] = useState(0);
  const [timerMax, setTimerMax] = useState(0);
  const [timerTimers, setTimerTimers] = useState([]);
  const [maxTimerLocation, setMaxTimerLocation] = useState(0);
  const [timer, setTimer] = useState(0);
  const [timing, setTiming] = useState(false);

  const [timerLocation, setTimerLocation] = useState(0);

  const [currentTimer, setCurrentTimer] = useState();

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
      timed: false,
    });
    setWorkouts(listCopy);
    console.log(workouts);
    setExcerciseName("");
    setexcerciseDuration(0);
    setExcerciseColor("green");
    console.log(workouts);
  };

  const changeWorkouts = (list) => {
    setExcercises(list);
    console.log(excercises);
  };

  async function getExcerciseData(muscleType) {
    $.ajax({
      method: "GET",
      url:
        "https://api.api-ninjas.com/v1/exercises?muscle=" +
        muscleType.toLowerCase(),
      headers: { "X-Api-Key": "4lhW1PRAB676NvhWSXgYjA==H0ZvjGW8BLFQ3QvW" },
      contentType: "application/json",
      success: function (result) {
        let list = [];
        result.forEach((excercise) => {
          list.push({
            name: excercise["name"],
            muscle: excercise["muscle"],
            equipment: excercise["equipment"],
            explaination: excercise["instructions"],
            intensity: excercise["difficulty"],
          });
        });
        changeWorkouts(list);
      },
      error: function ajaxError(jqXHR) {
        console.error("Error: ", jqXHR.responseText);
      },
    });
  }

  const testFn = (name) => {
    setExcerciseName(name);
    addExserciseRef.current?.makeVisible(0);
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
        timed: element.timed,
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
      timed: element.timed,
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
        timed: element.timed,
      });
    });
    setWorkouts(list);
  };

  const convertStoMs = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    return minutes + " : " + Math.round(extraSeconds);
  };

  const createTimerList = () => {
    setTimers([]);
    let list = workouts
      .filter((obj) => obj.date == workoutDate)
      .sort((e1, e2) =>
        e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
      );
    list.forEach((obj) => {
      obj.running = false;
    });
    setTimers(list);
    console.log(timers);
  };

  const incTimer = () => {
    setTimer((timer) => timer - 0.5);
  };

  const startTimer = () => {
    setTimerLocation(0);

    let timers = workouts
      .filter((obj) => obj.date == workoutDate)
      .sort((e1, e2) =>
        e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
      );

    setMaxTimerLocation(timers.length);

    let durations = [];

    timers.forEach((element) => {
      durations.push(parseFloat(element.duration));
    });

    setTimer(durations[0] * 60);
    setTiming(true);

    setTimeout(() => {
      new Audio(audio).play();
      console.log("oui");
      setTiming(false);
    }, durations[0] * 60 * 1000);
  };

  const continueTimer = () => {
    let locTimer = timerLocation;
    locTimer += 1;

    if (locTimer <= maxTimerLocation) {
      setTimerLocation(locTimer);

      let timers = workouts
        .filter((obj) => obj.date == workoutDate)
        .sort((e1, e2) =>
          e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
        );

      let durations = [];

      timers.forEach((element) => {
        durations.push(parseFloat(element.duration));
      });

      setTimer(durations[locTimer] * 60);
      setTiming(true);

      console.log(durations[locTimer]);

      setTimeout(() => {
        console.log("oui");
        var snd = new Audio(
          "data:audio/wav;base64,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qJrx4KOQjahZxWbcZgztj2c49nKmkId44S71j0c8eV9yDK6uPRzx5X18eDvjvQ6yKo9ZSS6l//8elePK/Lf//IInrOF/FvDoADYAGBMGb7FtErm5MXMlmPAJQVgWta7Zx2go+8xJ0UiCb8LHHdftWyLJE0QIAIsI+UbXu67dZMjmgDGCGl1H+vpF4NSDckSIkk7Vd+sxEhBQMRU8j/12UIRhzSaUdQ+rQU5kGeFxm+hb1oh6pWWmv3uvmReDl0UnvtapVaIzo1jZbf/pD6ElLqSX+rUmOQNpJFa/r+sa4e/pBlAABoAAAAA3CUgShLdGIxsY7AUABPRrgCABdDuQ5GC7DqPQCgbbJUAoRSUj+NIEig0YfyWUho1VBBBA//uQZB4ABZx5zfMakeAAAAmwAAAAF5F3P0w9GtAAACfAAAAAwLhMDmAYWMgVEG1U0FIGCBgXBXAtfMH10000EEEEEECUBYln03TTTdNBDZopopYvrTTdNa325mImNg3TTPV9q3pmY0xoO6bv3r00y+IDGid/9aaaZTGMuj9mpu9Mpio1dXrr5HERTZSmqU36A3CumzN/9Robv/Xx4v9ijkSRSNLQhAWumap82WRSBUqXStV/YcS+XVLnSS+WLDroqArFkMEsAS+eWmrUzrO0oEmE40RlMZ5+ODIkAyKAGUwZ3mVKmcamcJnMW26MRPgUw6j+LkhyHGVGYjSUUKNpuJUQoOIAyDvEyG8S5yfK6dhZc0Tx1KI/gviKL6qvvFs1+bWtaz58uUNnryq6kt5RzOCkPWlVqVX2a/EEBUdU1KrXLf40GoiiFXK///qpoiDXrOgqDR38JB0bw7SoL+ZB9o1RCkQjQ2CBYZKd/+VJxZRRZlqSkKiws0WFxUyCwsKiMy7hUVFhIaCrNQsKkTIsLivwKKigsj8XYlwt/WKi2N4d//uQRCSAAjURNIHpMZBGYiaQPSYyAAABLAAAAAAAACWAAAAApUF/Mg+0aohSIRobBAsMlO//Kk4soosy1JSFRYWaLC4qZBYWFRGZdwqKiwkNBVmoWFSJkWFxX4FFRQWR+LsS4W/rFRb/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////VEFHAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAU291bmRib3kuZGUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAMjAwNGh0dHA6Ly93d3cuc291bmRib3kuZGUAAAAAAAAAACU="
        );
        snd.play();
        setTiming(false);
      }, durations[locTimer] * 60 * 1000);
    }
  };

  // use effects
  useEffect(() => {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    setWorkoutDate(`Workout: ${day}-${month + 1}-${year}`);
    getExcerciseData(muscleInput);
    setInterval(() => {
      incTimer();
    }, 1000);
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
                addExserciseRef.current?.makeInVisible(0);
              }}
            >
              annuleer
            </button>
            <button
              onClick={() => {
                addExcercise();
                addExserciseRef.current?.makeInVisible(0);
              }}
            >
              voeg oefening toe
            </button>
          </div>
        </div>
      </Popup>

      <Popup ref={workoutTimerRef}>
        <div className="workout-timer-window">
          <div className="timer-title">
            <h1>Timer starten</h1>
          </div>
          <div className="excercises-timer">
            {workouts
              .filter((obj) => obj.date == workoutDate)
              .sort((e1, e2) =>
                e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
              )
              .map((workout, index) => (
                <div id={index} className="timer-block">
                  <h1>
                    {workout.name} - {workout.duration}min
                  </h1>
                  {timerLocation == index && timing && (
                    <h5>{convertStoMs(timer)}</h5>
                  )}
                </div>
              ))}
          </div>
          <div className="timer-btns">
            <button
              onClick={() => {
                startTimer();
              }}
            >
              start
            </button>
            <button
              onClick={() => {
                continueTimer();
              }}
            >
              continue
            </button>
            <button onClick={() => workoutTimerRef.current?.makeInVisible(1)}>
              afsluiten
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
              }}
              value={muscleInput}
            />
            <button
              className="search-btn"
              onClick={() => {
                getExcerciseData(muscleInput);
                setExcercises([]);
              }}
            >
              Zoek
            </button>
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
                    timed={workout.timed}
                  />
                </div>
              ))}
          </div>
          <div className="workout-buttons">
            <button
              style={{ backgroundColor: "rgba(32, 203, 111)", color: "white" }}
              onClick={() => {
                workoutTimerRef.current?.makeVisible(1);
                createTimerList();
              }}
            >
              Start workout
            </button>

            <button
              onClick={() => {
                addExserciseRef.current?.makeVisible(0);
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
