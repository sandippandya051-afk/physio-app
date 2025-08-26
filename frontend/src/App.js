import React, { useState, useEffect, useMemo, useRef } from "react";
import axios from "axios";
import { Chart } from "react-google-charts";
import "bootstrap/dist/css/bootstrap.min.css";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from "recharts";

function formatYMD(d) {
  const dt = new Date(d);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const day = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function getWeekDates(today = new Date()) {
  const day = today.getDay();
  const diffToMonday = (day + 6) % 7;
  const monday = new Date(today);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(monday.getDate() - diffToMonday);

  const days = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    days.push(d);
  }
  return days;
}

function App() {
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState([]);
  const [streak, setStreak] = useState(0);
  const [notification, setNotification] = useState("");
  const [quote, setQuote] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [difficultyFilter, setDifficultyFilter] = useState("All");

  const [newExercise, setNewExercise] = useState({
    name: "",
    description: "",
    duration: "",
    schedule: "",
    category: "",
    difficulty: ""
  });

  const [editExercise, setEditExercise] = useState({
    id: null,
    name: "",
    description: "",
    duration: "",
    schedule: "",
    category: "",
    difficulty: ""
  });

  const notifiedRef = useRef(new Set());
  const API = "http://localhost:5000";

  // ---- Fetchers ----
  const fetchExercises = async () => {
    const res = await axios.get(`${API}/exercises`);
    setExercises(res.data || []);
  };

  const fetchProgress = async () => {
    const res = await axios.get(`${API}/progress`);
    const data = res.data || [];
    setProgress(data);
    calculateStreak(data);
  };

  const fetchQuote = async () => {
    try {
      const res = await axios.get("https://type.fit/api/quotes");
      const random = res.data[Math.floor(Math.random() * res.data.length)];
      setQuote(random.text);
    } catch {
      setQuote("Stay consistent and results will follow!");
    }
  };

  useEffect(() => {
    fetchExercises();
    fetchProgress();
    fetchQuote();

    if ("Notification" in window && Notification.permission !== "granted") {
      Notification.requestPermission().catch(() => {});
    }

    const check = () => checkSchedules();
    check();
    const t = setInterval(check, 60000);
    return () => clearInterval(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- Helpers ----
  const calculateStreak = (data) => {
    const byDate = new Set(data.map((p) => p.date));
    let cur = new Date();
    cur.setHours(0, 0, 0, 0);
    let count = 0;
    while (byDate.has(formatYMD(cur))) {
      count++;
      cur.setDate(cur.getDate() - 1);
    }
    setStreak(count);
  };

  const checkSchedules = () => {
    if (!("Notification" in window) || Notification.permission !== "granted") return;
    const now = Date.now();
    const windowMs = 60 * 1000;
    exercises.forEach((ex) => {
      if (!ex.schedule) return;
      const when = new Date(ex.schedule).getTime();
      const key = `${ex.id}-${when}`;
      if (Math.abs(when - now) <= windowMs && !notifiedRef.current.has(key)) {
        new Notification(`⏰ Physio time: ${ex.name}`, {
          body: ex.description || "It's time for your scheduled exercise."
        });
        notifiedRef.current.add(key);
      }
    });
  };

  const weekDays = useMemo(() => getWeekDates(new Date()), []);
  const weeklyData = useMemo(() => {
    const counts = weekDays.map((d, idx) => ({
      day: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][idx],
      date: formatYMD(d),
      sessions: 0
    }));
    const indexByDate = new Map(counts.map((c, idx) => [c.date, idx]));
    progress.forEach((p) => {
      const idx = indexByDate.get(p.date);
      if (idx !== undefined) counts[idx].sessions += 1;
    });
    return counts;
  }, [progress, weekDays]);

  const totalThisWeek = weeklyData.reduce((sum, d) => sum + d.sessions, 0);

  // ---- Actions ----
  const handleAddExercise = async (e) => {
    e.preventDefault();
    const { name, description, duration, category } = newExercise;
    if (!name || !description || !duration || !category) {
      alert("Please fill all required fields!");
      return;
    }
    await axios.post(`${API}/exercises`, newExercise);
    setNewExercise({
      name: "",
      description: "",
      duration: "",
      schedule: "",
      category: "",
      difficulty: ""
    });
    fetchExercises();
    setNotification("Exercise added successfully!");
  };

  const handleEditExercise = (exercise) => {
    setEditExercise(exercise);
  };

  const handleUpdateExercise = async (e) => {
    e.preventDefault();
    await axios.put(`${API}/exercises/${editExercise.id}`, editExercise);
    setEditExercise({
      id: null,
      name: "",
      description: "",
      duration: "",
      schedule: "",
      category: "",
      difficulty: ""
    });
    fetchExercises();
    setNotification("Exercise updated successfully!");
  };

  const handleDeleteExercise = async (id) => {
    await axios.delete(`${API}/exercises/${id}`);
    fetchExercises();
    setNotification("Exercise deleted successfully!");
  };

  const handleCompleteExercise = async (id) => {
    await axios.post(`${API}/progress`, { exerciseId: id, date: formatYMD(new Date()) });
    fetchProgress();
    setNotification("Great job! Exercise completed!");
  };

  // ---- UI ----
  return (
    <div className="container py-4">
      <h1 className="text-center mb-4">Physio Tracker</h1>

      {notification && <div className="alert alert-success">{notification}</div>}

      {/* Streak & Quote */}
      <div className="row mb-4">
        <div className="col-md-6">
          <div className="card card-body shadow-sm">
            <h5>🔥 Current Streak: {streak} days</h5>
          </div>
        </div>
        <div className="col-md-6">
          <div className="card card-body shadow-sm">
            <h5>💡 Motivation</h5>
            <p>{quote}</p>
          </div>
        </div>
      </div>

      {/* Weekly Progress Chart */}
      <div className="card card-body shadow-sm mb-4">
        <h4>This Week’s Progress</h4>
        <div style={{ width: "100%", height: 260 }}>
          <ResponsiveContainer>
            <BarChart data={weeklyData} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="sessions" name="Completed" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
          <p className="mt-2">Total this week: {totalThisWeek}</p>
        </div>
      </div>

      {/* Add New Exercise Form */}
      <div className="card card-body shadow-sm mb-4">
        <h4>Add New Exercise</h4>
        <form onSubmit={handleAddExercise} className="row g-2">
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Exercise Name"
              value={newExercise.name}
              onChange={(e) => setNewExercise({ ...newExercise, name: e.target.value })}
              required
            />
          </div>
          <div className="col-md-3">
            <input
              type="text"
              className="form-control"
              placeholder="Description"
              value={newExercise.description}
              onChange={(e) => setNewExercise({ ...newExercise, description: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="number"
              className="form-control"
              placeholder="Duration (min)"
              value={newExercise.duration}
              onChange={(e) => setNewExercise({ ...newExercise, duration: e.target.value })}
              required
            />
          </div>
          <div className="col-md-2">
            <input
              type="time"
              className="form-control"
              value={newExercise.schedule}
              onChange={(e) => setNewExercise({ ...newExercise, schedule: e.target.value })}
            />
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newExercise.category}
              onChange={(e) => setNewExercise({ ...newExercise, category: e.target.value })}
              required
            >
              <option value="">Category</option>
              <option value="Neck">Neck</option>
              <option value="Shoulder">Shoulder</option>
              <option value="Back">Back</option>
              <option value="Legs">Legs</option>
            </select>
          </div>
          <div className="col-md-2">
            <select
              className="form-select"
              value={newExercise.difficulty}
              onChange={(e) => setNewExercise({ ...newExercise, difficulty: e.target.value })}
              required
            >
              <option value="">Difficulty</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
          <div className="col-md-2">
            <button type="submit" className="btn btn-primary w-100">
              Add
            </button>
          </div>
        </form>
      </div>

      {/* Filters */}
      <div className="card card-body shadow-sm mb-4">
        <div className="row g-2 align-items-end">
          <div className="col-md-4">
            <label className="form-label">Filter by Category</label>
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Neck">Neck</option>
              <option value="Shoulder">Shoulder</option>
              <option value="Back">Back</option>
              <option value="Legs">Legs</option>
            </select>
          </div>
          <div className="col-md-4">
            <label className="form-label">Filter by Difficulty</label>
            <select
              className="form-select"
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>
        </div>
      </div>

      {/* Exercise List */}
      <div className="row">
        {exercises
          .filter((ex) => categoryFilter === "All" || ex.category === categoryFilter)
          .filter((ex) => difficultyFilter === "All" || ex.difficulty === difficultyFilter)
          .map((ex) => (
            <div className="col-md-4 mb-3" key={ex.id}>
              <div className="card card-body shadow-sm">
                {editExercise.id === ex.id ? (
                  <form onSubmit={handleUpdateExercise}>
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editExercise.name}
                      onChange={(e) => setEditExercise({ ...editExercise, name: e.target.value })}
                    />
                    <input
                      type="text"
                      className="form-control mb-2"
                      value={editExercise.description}
                      onChange={(e) => setEditExercise({ ...editExercise, description: e.target.value })}
                    />
                    <input
                      type="number"
                      className="form-control mb-2"
                      value={editExercise.duration}
                      onChange={(e) => setEditExercise({ ...editExercise, duration: e.target.value })}
                    />
                    <input
                      type="time"
                      className="form-control mb-2"
                      value={editExercise.schedule}
                      onChange={(e) => setEditExercise({ ...editExercise, schedule: e.target.value })}
                    />
                    <select
                      className="form-select mb-2"
                      value={editExercise.category}
                      onChange={(e) => setEditExercise({ ...editExercise, category: e.target.value })}
                    >
                      <option value="Neck">Neck</option>
                      <option value="Shoulder">Shoulder</option>
                      <option value="Back">Back</option>
                      <option value="Legs">Legs</option>
                    </select>
                    <select
                      className="form-select mb-2"
                      value={editExercise.difficulty}
                      onChange={(e) => setEditExercise({ ...editExercise, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                    <button type="submit" className="btn btn-success w-100">Update</button>
                  </form>
                ) : (
                  <>
                    <div className="d-flex justify-content-between align-items-start">
                      <h5 className="card-title mb-1">{ex.name}</h5>
                      <div>
                        <span className="badge bg-info text-dark me-1">{ex.category}</span>
                        <span className="badge bg-secondary">{ex.difficulty}</span>
                      </div>
                    </div>
                    <p className="mb-1">{ex.description}</p>
                    <small className="text-muted">
                      Duration: {ex.duration} min | Scheduled at: {ex.schedule}
                    </small>
                    <div className="mt-2 d-flex justify-content-between">
                      <button className="btn btn-sm btn-success" onClick={() => handleCompleteExercise(ex.id)}>✅ Complete</button>
                      <button className="btn btn-sm btn-warning" onClick={() => handleEditExercise(ex)}>✏️ Edit</button>
                      <button className="btn btn-sm btn-danger" onClick={() => handleDeleteExercise(ex.id)}>🗑️ Delete</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
      </div>

      {/* Progress Chart */}
      <div className="card card-body shadow-sm mt-4">
        <h4>Progress Chart</h4>
        <Chart
          chartType="LineChart"
          width="100%"
          height="300px"
          data={[["Date", "Completed"], ...progress.map((p) => [new Date(p.date).toLocaleDateString(), 1])]}
          options={{ hAxis: { title: "Date" }, vAxis: { title: "Exercises Completed" }, legend: "none" }}
        />
      </div>
    </div>
  );
}

export default App;
