import "./App.css";
import { useEffect, useRef, useState } from "react";
import Popup from "./components/popup/Popup";
import ExcerciseWidget from "./components/excerciseWidget/ExcerciseWidget";
import WorkoutWidget from "./components/workoutWidget/WorkoutWidget";
import $ from "jquery";
import audio from "./done.mp3";
import db from "./firebaseConfig";
import { onValue, ref, set, update } from "firebase/database";

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
    let id = Math.round(Math.random() * 10000);
    listCopy.push({
      name: excerciseName,
      duration: excerciseDuration,
      color: excerciseColor,
      date: workoutDate,
      order: useList.length,
      timed: false,
      id: id,
    });
    setWorkouts(listCopy);
    console.log(workouts);
    setExcerciseName("");
    setexcerciseDuration(0);
    setExcerciseColor("green");
    set(ref(db, `/${id}`), {
      name: excerciseName,
      duration: excerciseDuration,
      color: excerciseColor,
      date: workoutDate,
      order: useList.length,
      timed: false,
      id: id,
    });
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
    set(ref(db, `/${listCopy[index].id}`), {});
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
        id: element.id,
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
      id: element.id,
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
        id: element.id,
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
    setTimer((timer) => timer - 1);
  };

  const stopTimer = () => {
    setTiming(false);
    setTimerLocation(0);
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

    console.log(timing);

    setTimeout(() => {
      if (timing) {
        new Audio(audio).play();
        setTiming(false);
      }
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
        if (timing) {
          new Audio(audio).play();
          setTiming(false);
        }
      }, durations[locTimer] * 60 * 1000);
    }
  };

  const setTimingTrue = () => {
    if (timing == false) {
      setTiming((timing) => !timing);
    }
  };

  // use effects
  useEffect(() => {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    setWorkoutDate(`Workout: ${day}-${month + 1}-${year}`);

    const dataRef = ref(db, "/");
    onValue(dataRef, (snapshot) => {
      const data = snapshot.val();
      let values;
      if (data) {
        values = Object.values(data);
        setWorkouts(values);
      }
    });

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
              id="btn1"
              onClick={() => {
                setTimingTrue();
                startTimer();
              }}
            >
              start
            </button>
            <button
              id="btn2"
              onClick={() => {
                continueTimer();
              }}
            >
              continue
            </button>
            <button id="btn3" onClick={() => stopTimer()}>
              stop
            </button>
            <button
              id="btn4"
              onClick={() => workoutTimerRef.current?.makeInVisible(1)}
            >
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
