import "./App.css";
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import Popup from "./components/popup/Popup";
import ExcerciseWidget from "./components/excerciseWidget/ExcerciseWidget";
import WorkoutWidget from "./components/workoutWidget/WorkoutWidget";
import $ from "jquery";
import audio from "./done.mp3";
import db from "./firebaseConfig";
import { get, onValue, ref, set, update } from "firebase/database";
import Dropdown from "./components/dropdown/Dropdown";
import { Line, Pie } from "react-chartjs-2";
import auth from "./authConfig";
import { signOut } from "firebase/auth";
import {
  CategoryScale,
  Chart,
  LinearScale,
  LineElement,
  PointElement,
} from "chart.js";
import { useNavigate } from "react-router-dom";

const App = () => {
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

  const colors = {
    red: {
      backgroundColor: "rgba(222, 67, 67, 0.6)",
      border: "4px solid rgba(222, 67, 67)",
    },
    orange: {
      backgroundColor: "rgba(230, 116, 68, 0.6)",
      border: "4px solid rgb(230, 116, 68)",
    },
    yellow: {
      backgroundColor: "rgba(244, 229, 94, 0.6)",
      border: "4px solid rgb(244, 229, 94)",
    },
    green: {
      backgroundColor: "rgba(32, 203, 111, 0.6)",
      border: "4px solid rgba(32, 203, 111)",
    },
  };

  const [excerciseName, setExcerciseName] = useState("");
  const [excerciseDuration, setexcerciseDuration] = useState();
  const [excerciseColor, setExcerciseColor] = useState("green");

  const [weightInput, setWeigtInput] = useState("");
  const [fatInput, setFatInput] = useState("");
  const [spierInput, setSpierInput] = useState("");
  const [dateInput, setDateInput] = useState("");

  const [workouts, setWorkouts] = useState([]);
  const [excercises, setExcercises] = useState([]);
  const [editing, setEditing] = useState(false);
  const [editingIndex, setEditingIndex] = useState(0);

  const [currentWindow, setCurrentWindow] = useState(0);

  const [graphSetting, setGraphSetting] = useState(
    "Gewicht, Spiermassa, Vetmassa"
  );

  const [timer, setTimer] = useState(0);
  const [timing, setTiming] = useState({
    canTime: false,
    timingValue: 0,
    currentlyTiming: 0,
  });
  const [timeOut, setTimeOut] = useState(null);

  const [progressData, setProgressData] = useState([]);

  const [progressChartData, setProgressChartData] = useState({
    labels: progressData.map((data) => data.date),
    datasets: [
      {
        labels: ["Gewicht"],
        data: progressData.map((data) => data.weight),
        backgroundColor: ["#4365de"],
        borderColor: "#4365de",
        borderWidth: 5,
      },
      {
        labels: ["Spier massa"],
        data: progressData.map((data) => data.muscleMass),
        backgroundColor: ["rgba(32, 203, 111)"],
        borderColor: "rgba(32, 203, 111)",
        borderWidth: 5,
      },
      {
        labels: ["Vet massa"],
        data: progressData.map((data) => data.fatMass),
        backgroundColor: ["rgb(230, 116, 68)"],
        borderColor: "rgb(230, 116, 68)",
        borderWidth: 5,
      },
    ],
  });

  const navigate = useNavigate();

  // functions

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        navigate("/");
      })
      .catch((err) => {
        alert(err.message);
      });
  };

  const changeDate = (inc) => {
    let dateIncrementVar = dateIncrement;
    dateIncrementVar += inc;
    setDateIncrement((increment) => increment + inc);

    let date = new Date();
    date.setDate(date.getDate() + dateIncrementVar);
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
    setexcerciseDuration("");
    setExcerciseColor("green");
    set(ref(db, `${auth.currentUser.uid}/excercises/${id}`), {
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
            name: excercise["name"].replace("_", " "),
            muscle: excercise["muscle"].replace("_", " "),
            equipment: excercise["equipment"].replace("_", " "),
            explaination: excercise["instructions"].replace("_", " "),
            intensity: excercise["difficulty"].replace("_", " "),
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
    let listCopy = workouts.filter((obj) => obj.date == workoutDate);
    let listCopyOtherDate = workouts
      .filter((obj) => obj.date != workoutDate)
      .sort((e1, e2) =>
        e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
      );

    let list = [];
    set(
      ref(db, `${auth.currentUser.uid}/excercises/${listCopy[index].id}`),
      {}
    );

    listCopy
      .splice(index, 1)
      .sort((e1, e2) =>
        e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
      );

    let order = 0;
    listCopy.forEach((element) => {
      element.order = order;
      order += 1;
    });

    list = listCopy.concat(listCopyOtherDate);
    setWorkouts(list);
  };

  const changeWorkoutOrder = (movement, index) => {
    let listCopy = workouts.filter((obj) => obj.date == workoutDate);
    let element = listCopy[index];
    let otherElement;
    let succes;

    if (movement == "up") {
      if (element.order != 0) {
        otherElement = listCopy[index - 1];
        listCopy[index] = {
          color: element.color,
          date: element.date,
          duration: element.duration,
          name: element.name,
          order: otherElement.order,
          timed: element.timed,
          id: element.id,
        };
        listCopy[index - 1] = {
          color: otherElement.color,
          date: otherElement.date,
          duration: otherElement.duration,
          name: otherElement.name,
          order: element.order,
          timed: otherElement.timed,
          id: otherElement.id,
        };
        succes = true;
      }
    } else if (movement == "down") {
      if (element.order < listCopy.length - 1) {
        otherElement = listCopy[index + 1];
        listCopy[index] = {
          color: element.color,
          date: element.date,
          duration: element.duration,
          name: element.name,
          order: otherElement.order,
          timed: element.timed,
          id: element.id,
        };
        listCopy[index + 1] = {
          color: otherElement.color,
          date: otherElement.date,
          duration: otherElement.duration,
          name: otherElement.name,
          order: element.order,
          timed: otherElement.timed,
          id: otherElement.id,
        };
        succes = true;
      }
    }

    let list = listCopy.sort((e1, e2) =>
      e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
    );

    if (succes) {
      setWorkouts(list);

      set(ref(db, `${auth.currentUser.uid}/excercises/${element.id}`), {
        name: element.name,
        duration: element.duration,
        color: element.color,
        date: element.date,
        order: otherElement.order,
        timed: element.timed,
        id: element.id,
      });

      set(ref(db, `${auth.currentUser.uid}/excercises/${otherElement.id}`), {
        name: otherElement.name,
        duration: otherElement.duration,
        color: otherElement.color,
        date: otherElement.date,
        order: element.order,
        timed: otherElement.timed,
        id: otherElement.id,
      });
    }
  };

  const editWorkout = (index) => {
    let listCopy = workouts.filter((obj) => obj.date == workoutDate);
    let element = listCopy[index];

    setExcerciseColor(element.color);
    setExcerciseName(element.name);
    setexcerciseDuration(element.duration);

    setEditing(true);
    setEditingIndex(index);

    addExserciseRef.current?.makeVisible(0);
  };

  const editExcercise = (index) => {
    let listCopy = workouts.filter((obj) => obj.date == workoutDate);
    let element = listCopy[index];
    listCopy[index] = {
      name: excerciseName,
      duration: excerciseDuration,
      color: excerciseColor,
      date: element.date,
      order: element.order,
      timed: element.timed,
      id: element.id,
    };
    setWorkouts(listCopy);
    setExcerciseName("");
    setexcerciseDuration("");
    setExcerciseColor("green");
    setEditing(false);
    set(ref(db, `${auth.currentUser.uid}/excercises/${element.id}`), {
      name: excerciseName,
      duration: excerciseDuration,
      color: excerciseColor,
      date: element.date,
      order: element.order,
      timed: element.timed,
      id: element.id,
    });
  };

  const convertStoMs = (seconds) => {
    let minutes = Math.floor(seconds / 60);
    let extraSeconds = seconds % 60;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    extraSeconds = extraSeconds < 10 ? "0" + extraSeconds : extraSeconds;
    if (extraSeconds > 9) {
      return minutes + " : " + Math.round(extraSeconds);
    } else if (extraSeconds <= 9) {
      return minutes + " : " + "0" + Math.round(extraSeconds);
    }
  };

  // ! CHANGE TO 0.5 WHILE DEVELOPING | CHANGE TO 1 WHILE COMMITING
  const incTimer = () => {
    setTimer((timer) => timer - 1);
  };

  const getTimers = (ms) => {
    let timers = workouts
      .filter((obj) => obj.date == workoutDate)
      .sort((e1, e2) =>
        e1.order < e2.order ? 1 : e1.order > e2.order ? -1 : 0
      );
    console.log(timers);
    let list = [];
    timers.forEach((obj) => {
      if (ms) {
        list.push(obj.duration * 60 * 1000);
      } else {
        list.push(obj.duration * 60);
      }
    });

    return list;
  };

  const startTimer = () => {
    setTiming((prevState) => ({
      ...prevState,
      canTime: true,
      timingValue: 0,
      currentlyTiming: 0,
    }));
    return;
  };

  const startContinueTimer = () => {
    setTiming((prevState) => ({
      ...prevState,
      canTime: true,
      timingValue: 0,
      currentlyTiming: prevState.currentlyTiming,
    }));
  };

  const stopTimer = () => {
    setTiming((prevState) => ({
      ...prevState,
      canTime: false,
      timingValue: 0,
      currentlyTiming: 0,
    }));
    return;
  };

  const runTimer = (increase) => {
    let timersSeconds = getTimers(false).reverse();
    let workoutList = workouts.filter((obj) => obj.date == workoutDate);
    let timingVar = timing;
    let currentTiming = timingVar.currentlyTiming + 1;

    console.log(timersSeconds);

    if (increase == true) {
      if (timingVar.currentlyTiming + 1 <= workoutList.length) {
        setTiming((prevState) => ({
          ...prevState,
          canTime: true,
          timingValue: timersSeconds[currentTiming],
          currentlyTiming: currentTiming,
        }));
        timingVar = {
          canTime: true,
          timingValue: timersSeconds[currentTiming],
          currentlyTiming: currentTiming,
        };
      }
    } else if (increase == false) {
      setTiming((prevState) => ({
        ...prevState,
        canTime: true,
        timingValue: timersSeconds[0],
        currentlyTiming: 0,
      }));
      timingVar = {
        canTime: true,
        timingValue: timersSeconds[0],
        currentlyTiming: 0,
      };
    }

    setTimer(timingVar.timingValue);
    console.log(timingVar.timingValue);

    const timeoutID = setTimeout(() => {
      if (timingVar.canTime) {
        setTiming((prevState) => ({
          ...prevState,
          canTime: false,
          timingValue: timersSeconds,
          currentlyTiming: timingVar.currentlyTiming,
        }));
        timingVar = {
          canTime: false,
          timingValue: timersSeconds,
          currentlyTiming: timingVar.currentlyTiming,
        };
        new Audio(audio).play();
      }
    }, timingVar.timingValue * 1000);

    setTimeOut(timeoutID);
  };

  const addChartData = () => {
    let dataRef = ref(db, `${auth.currentUser.uid}/chartData/${dateInput}`);
    set(dataRef, {
      id: dateInput,
      muscleMass: spierInput,
      fatMass: fatInput,
      weight: weightInput,
      date: dateInput,
    });

    let progressDataCopy = progressData;
    progressDataCopy.push({
      id: dateInput,
      muscleMass: spierInput,
      fatMass: fatInput,
      weight: weightInput,
      date: dateInput,
    });
    setProgressData(progressDataCopy);

    setProgressChartData({
      labels: progressDataCopy.map((data) => data.date),
      datasets: [
        {
          labels: ["Gewicht"],
          data: progressDataCopy.map((data) => data.weight),
          backgroundColor: ["#4365de"],
          borderColor: "#4365de",
          borderWidth: 5,
        },
        {
          labels: ["Spier massa"],
          data: progressDataCopy.map((data) => data.muscleMass),
          backgroundColor: ["rgba(32, 203, 111)"],
          borderColor: "rgba(32, 203, 111)",
          borderWidth: 5,
        },
        {
          labels: ["Vet massa"],
          data: progressDataCopy.map((data) => data.fatMass),
          backgroundColor: ["rgb(230, 116, 68)"],
          borderColor: "rgb(230, 116, 68)",
          borderWidth: 5,
        },
      ],
    });

    setSpierInput("");
    setFatInput("");
    setWeigtInput("");

    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    setDateInput(`${day}-${month + 1}-${year}`);
  };

  // use effects
  useEffect(() => {
    let date = new Date();
    let day = date.getDate();
    let month = date.getMonth();
    let year = date.getFullYear();
    setWorkoutDate(`Workout: ${day}-${month + 1}-${year}`);
    setDateInput(`${day}-${month + 1}-${year}`);
    let currUserID;

    auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate("/");
      } else {
        currUserID = user.uid;
        console.log(currUserID);

        const dataRef = ref(db, `${currUserID}/excercises/`);
        onValue(dataRef, (snapshot) => {
          const data = snapshot.val();
          let values;
          if (data) {
            values = Object.values(data).sort((e1, e2) =>
              e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
            );
            setWorkouts(values);
          }
        });

        const chartref = ref(db, `${currUserID}/chartData/`);
        onValue(chartref, (snapshot) => {
          const data = snapshot.val();
          let values;
          if (data) {
            values = Object.values(data);
            values = values.sort((a, b) => {
              let da_split = a.date.split("-");
              let db_split = b.date.split("-");
              let da = new Date(`${da_split[2]}-${da_split[1]}-${da_split[0]}`),
                dab = new Date(`${db_split[2]}-${db_split[1]}-${db_split[0]}`);

              console.log(da);

              return da.getTime() - dab.getTime();
            });
            console.log(values);
            setProgressData(values);
            setProgressChartData({
              labels: values.map((data) => data.date),
              datasets: [
                {
                  labels: ["Gewicht"],
                  data: values.map((data) => data.weight),
                  backgroundColor: ["#4365de"],
                  borderColor: "#4365de",
                  borderWidth: 5,
                },
                {
                  labels: ["Spier massa"],
                  data: values.map((data) => data.muscleMass),
                  backgroundColor: ["rgba(32, 203, 111)"],
                  borderColor: "rgba(32, 203, 111)",
                  borderWidth: 5,
                },
                {
                  labels: ["Vet massa"],
                  data: values.map((data) => data.fatMass),
                  backgroundColor: ["rgb(230, 116, 68)"],
                  borderColor: "rgb(230, 116, 68)",
                  borderWidth: 5,
                },
              ],
            });
          }
        });
      }
    });

    getExcerciseData(muscleInput);
    setInterval(function () {
      incTimer();
    }, 1000);
  }, []);

  Chart.register(CategoryScale);
  Chart.register(LinearScale);
  Chart.register(PointElement);
  Chart.register(LineElement);

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
              {excerciseColor == "green" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "#20CB6F",
                    border: "4px solid #20CB6F",
                  }}
                  onClick={() => setExcerciseColor("green")}
                ></input>
              )}

              {excerciseColor != "green" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "rgba(32, 203, 111, 0.2)",
                    border: "4px solid #20CB6F",
                  }}
                  onClick={() => setExcerciseColor("green")}
                ></input>
              )}

              {excerciseColor == "yellow" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "#F4E55E",
                    border: "4px solid #F4E55E",
                  }}
                  onClick={() => setExcerciseColor("yellow")}
                ></input>
              )}

              {excerciseColor != "yellow" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "rgba(244, 229, 94, 0.2)",
                    border: "4px solid #F4E55E",
                  }}
                  onClick={() => setExcerciseColor("yellow")}
                ></input>
              )}

              {excerciseColor == "orange" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "#E67444",
                    border: "4px solid #E67444",
                  }}
                  onClick={() => setExcerciseColor("orange")}
                ></input>
              )}

              {excerciseColor != "orange" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "rgba(230, 116, 68, 0.2)",
                    border: "4px solid #E67444",
                  }}
                  onClick={() => setExcerciseColor("orange")}
                ></input>
              )}

              {excerciseColor == "red" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "#DE4343",
                    border: "4px solid #DE4343",
                  }}
                  onClick={() => setExcerciseColor("red")}
                ></input>
              )}

              {excerciseColor != "red" && (
                <input
                  className="choose-point"
                  style={{
                    backgroundColor: "rgba(222, 67, 67, 0.2)",
                    border: "4px solid #DE4343",
                  }}
                  onClick={() => setExcerciseColor("red")}
                ></input>
              )}
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
            {!editing && (
              <button
                onClick={() => {
                  addExcercise();
                  addExserciseRef.current?.makeInVisible(0);
                }}
              >
                voeg oefening toe
              </button>
            )}
            {editing && (
              <button
                onClick={() => {
                  editExcercise(editingIndex);
                  addExserciseRef.current?.makeInVisible(0);
                }}
              >
                pas oefening aan
              </button>
            )}
          </div>
        </div>
      </Popup>

      <Popup ref={workoutTimerRef}>
        <div className="workout-timer-window">
          <div className="timer-title">
            <h1>Workout Timer</h1>
          </div>
          <div className="excercises-timer">
            {workouts
              .filter((obj) => obj.date == workoutDate)
              .sort((e1, e2) =>
                e1.order > e2.order ? 1 : e1.order < e2.order ? -1 : 0
              )
              .map((workout, index) => (
                <div
                  id={index}
                  className="timer-block"
                  style={colors[workout.color]}
                >
                  <h1>{workout.name}</h1>
                  {timing.canTime && timing.currentlyTiming == index && (
                    <h5 style={colors[workout.color]}>{convertStoMs(timer)}</h5>
                  )}

                  {timing.canTime == false && (
                    <h4>{convertStoMs(workout.duration * 60)}</h4>
                  )}
                </div>
              ))}
          </div>
          <div className="timer-btns">
            <button
              id="btn1"
              onClick={() => {
                startTimer();
                runTimer(false);
              }}
            >
              start
            </button>
            <button
              id="btn2"
              onClick={() => {
                clearTimeout(timeOut);
                startContinueTimer();
                runTimer(true);
              }}
            >
              volgende
            </button>
            <button
              id="btn3"
              onClick={() => {
                clearTimeout(timeOut);
                stopTimer();
              }}
            >
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
          <div className="tab-switcher">
            <button
              style={{
                borderColor: "rgb(222, 67, 67)",
                color: "rgb(222, 67, 67)",
              }}
              onClick={() => handleSignOut()}
            >
              sign out
            </button>
            <button onClick={() => setCurrentWindow(0)}>Oefeningen</button>
            <button onClick={() => setCurrentWindow(1)}>Vooruitgang</button>
          </div>
          {currentWindow == 0 && (
            <>
              <div className="input-field">
                <Dropdown
                  id={"dropdown-0"}
                  maxHeight={400}
                  title={muscleInput.replace("_", " ")}
                >
                  <h2>upper body</h2>
                  <li
                    onClick={() => {
                      setMuscleInput("abdominals");
                      getExcerciseData("abdominals");
                      setExcercises([]);
                    }}
                  >
                    abdominals
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("abductors");
                      getExcerciseData("abductors");
                      setExcercises([]);
                    }}
                  >
                    abductors
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("adductors");
                      getExcerciseData("adductors");
                      setExcercises([]);
                    }}
                  >
                    adductors
                  </li>

                  <li
                    onClick={() => {
                      setMuscleInput("triceps");
                      getExcerciseData("triceps");
                      setExcercises([]);
                    }}
                  >
                    triceps
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("biceps");
                      getExcerciseData("biceps");
                      setExcercises([]);
                    }}
                  >
                    biceps
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("forearms");
                      getExcerciseData("forearms");
                      setExcercises([]);
                    }}
                  >
                    forearms
                  </li>

                  <li
                    onClick={() => {
                      setMuscleInput("chest");
                      getExcerciseData("chest");
                      setExcercises([]);
                    }}
                  >
                    chest
                  </li>

                  <li
                    onClick={() => {
                      setMuscleInput("lats");
                      getExcerciseData("lats");
                      setExcercises([]);
                    }}
                  >
                    lats
                  </li>

                  <li
                    onClick={() => {
                      setMuscleInput("lower_back");
                      getExcerciseData("lower_back");
                      setExcercises([]);
                    }}
                  >
                    lower back
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("middle_back");
                      getExcerciseData("middle_back");
                      setExcercises([]);
                    }}
                  >
                    middle back
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("traps");
                      getExcerciseData("traps");
                      setExcercises([]);
                    }}
                  >
                    traps
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("neck");
                      getExcerciseData("neck");
                      setExcercises([]);
                    }}
                  >
                    neck
                  </li>

                  <br />

                  <h2>lower body</h2>
                  <li
                    onClick={() => {
                      setMuscleInput("quadriceps");
                      getExcerciseData("quadriceps");
                      setExcercises([]);
                    }}
                  >
                    quadriceps
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("hamstrings");
                      getExcerciseData("hamstrings");
                      setExcercises([]);
                    }}
                  >
                    hamstrings
                  </li>
                  <li
                    onClick={() => {
                      setMuscleInput("glutes");
                      getExcerciseData("glutes");
                      setExcercises([]);
                    }}
                  >
                    glutes
                  </li>

                  <li
                    onClick={() => {
                      setMuscleInput("calves");
                      getExcerciseData("calves");
                      setExcercises([]);
                    }}
                  >
                    calves
                  </li>
                </Dropdown>
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
            </>
          )}
          {currentWindow == 1 && (
            <>
              <div className="chart-title-container">
                <Dropdown
                  id={"dropdown-1"}
                  maxHeight={200}
                  title={graphSetting}
                >
                  <li
                    onClick={() => {
                      setProgressChartData({
                        labels: progressData.map((data) => data.date),
                        datasets: [
                          {
                            labels: ["Gewicht"],
                            data: progressData.map((data) => data.weight),
                            backgroundColor: ["#4365de"],
                            borderColor: "#4365de",
                            borderWidth: 5,
                          },
                        ],
                      });
                      setGraphSetting("Gewicht");
                    }}
                  >
                    Gewicht
                  </li>

                  <li
                    onClick={() => {
                      setProgressChartData({
                        labels: progressData.map((data) => data.date),
                        datasets: [
                          {
                            labels: ["Vet massa"],
                            data: progressData.map((data) => data.fatMass),
                            backgroundColor: ["rgb(230, 116, 68)"],
                            borderColor: "rgb(230, 116, 68)",
                            borderWidth: 5,
                          },
                        ],
                      });
                      setGraphSetting("Vetmassa");
                    }}
                  >
                    Vetmassa
                  </li>
                  <li
                    onClick={() => {
                      setProgressChartData({
                        labels: progressData.map((data) => data.date),
                        datasets: [
                          {
                            labels: ["Spier massa"],
                            data: progressData.map((data) => data.muscleMass),
                            backgroundColor: ["rgba(32, 203, 111)"],
                            borderColor: "rgba(32, 203, 111)",
                            borderWidth: 5,
                          },
                        ],
                      });
                      setGraphSetting("Spiermassa");
                    }}
                  >
                    Spiermassa
                  </li>
                  <li
                    onClick={() => {
                      setProgressChartData({
                        labels: progressData.map((data) => data.date),
                        datasets: [
                          {
                            labels: ["Gewicht"],
                            data: progressData.map((data) => data.weight),
                            backgroundColor: ["#4365de"],
                            borderColor: "#4365de",
                            borderWidth: 5,
                          },
                          {
                            labels: ["Spier massa"],
                            data: progressData.map((data) => data.muscleMass),
                            backgroundColor: ["rgba(32, 203, 111)"],
                            borderColor: "rgba(32, 203, 111)",
                            borderWidth: 5,
                          },
                          {
                            labels: ["Vet massa"],
                            data: progressData.map((data) => data.fatMass),
                            backgroundColor: ["rgb(230, 116, 68)"],
                            borderColor: "rgb(230, 116, 68)",
                            borderWidth: 5,
                          },
                        ],
                      });
                      setGraphSetting("Gewicht, Spiermassa, Vetmassa");
                    }}
                  >
                    Gewicht, spiermassa, vetmassa
                  </li>
                </Dropdown>
              </div>

              <div className="progress-chart-container">
                <div className="line-container">
                  <Line
                    data={progressChartData}
                    options={{
                      tension: 0.2,
                      plugins: {
                        responsive: true,
                        legend: {
                          position: "top",
                        },
                        title: {
                          display: true,
                          text: "hellloooo",
                        },
                        tooltip: {
                          displayColors: true,
                        },
                      },
                    }}
                  />
                </div>

                <div className="data-add-continer">
                  <h2>Gegevens toevoegen:</h2>
                  <div className="data-add-input-container">
                    <input
                      value={weightInput}
                      onChange={(e) => {
                        setWeigtInput(e.target.value);
                      }}
                      id="weight-input"
                      placeholder="gewicht (kg)"
                    ></input>
                    <input
                      value={spierInput}
                      onChange={(e) => {
                        setSpierInput(e.target.value);
                      }}
                      id="muscle-mass-input"
                      placeholder="spier massa (kg)"
                    ></input>
                    <input
                      value={fatInput}
                      onChange={(e) => {
                        setFatInput(e.target.value);
                      }}
                      id="fat-mass-input"
                      placeholder="vet massa (kg)"
                    ></input>
                    <input
                      value={dateInput}
                      onChange={(e) => {
                        setDateInput(e.target.value);
                      }}
                      id="date-input"
                      placeholder="date (dd-mm-yyyy)"
                    ></input>
                  </div>
                  <button onClick={() => addChartData()}>
                    Voeg gegevens toe
                  </button>
                </div>
              </div>
            </>
          )}
          {currentWindow == 2 && (
            <>
              <h1>hello world</h1>
            </>
          )}
        </div>
        <div className="workout-widget">
          <div className="date-selection">
            <button
              onClick={() => {
                changeDate(-1);
              }}
            >
              {"<"}
            </button>
            <h3>{workoutDate}</h3>
            <button
              onClick={() => {
                changeDate(1);
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
                    editFn={editWorkout}
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
              }}
            >
              Workout timer
            </button>

            <button
              onClick={() => {
                setEditing(false);
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
};

export default App;
