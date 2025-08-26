const express = require("express");
const cors = require("cors");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

// Setup DB
const adapter = new FileSync("db.json");
const db = low(adapter);

// Default data
db.defaults({ exercises: [], progress: [] }).write();

// Sample exercises if empty
if (db.get("exercises").value().length === 0) {
  db.get("exercises")
    .push({ id: 1, name: "Neck Stretch", description: "Gently tilt head side to side", duration: "2 min", schedule: null })
    .push({ id: 2, name: "Shoulder Roll", description: "Rotate shoulders clockwise & anti-clockwise", duration: "3 min", schedule: null })
    .push({ id: 3, name: "Leg Raise", description: "Raise one leg at a time while lying down", duration: "5 min", schedule: null })
    .write();

  console.log("✅ Sample Exercises added");
}

const app = express();
app.use(cors());
app.use(express.json());

// ---------------- Routes ----------------

// Welcome route
app.get("/", (req, res) => {
  res.send("Welcome to Physio App Backend 🚀");
});

// Get all exercises
app.get("/exercises", (req, res) => {
  const exercises = db.get("exercises").value();
  res.json(exercises);
});

// Add new exercise (with optional schedule)
app.post("/exercises", (req, res) => {
  const { name, description, duration, schedule } = req.body;
  const newExercise = {
    id: Date.now(),
    name,
    description,
    duration,
    schedule: schedule || null,
  };
  db.get("exercises").push(newExercise).write();
  res.status(201).json(newExercise);
});

// Update exercise (including schedule)
app.put("/exercises/:id", (req, res) => {
  const { id } = req.params;
  const { name, description, duration, schedule } = req.body;
  const updated = db
    .get("exercises")
    .find({ id: parseInt(id) })
    .assign({ name, description, duration, schedule })
    .write();
  res.json(updated);
});

// Delete exercise
app.delete("/exercises/:id", (req, res) => {
  const { id } = req.params;
  db.get("exercises").remove({ id: parseInt(id) }).write();
  res.json({ success: true });
});

// ---------------- Progress Tracking ----------------

// Get all progress records
app.get("/progress", (req, res) => {
  const progress = db.get("progress").value();
  res.json(progress);
});

// Mark exercise as done
app.post("/progress", (req, res) => {
  const { exerciseId, date } = req.body;
  const newProgress = { id: Date.now(), exerciseId, date };
  db.get("progress").push(newProgress).write();
  res.status(201).json(newProgress);
});

// ---------------- Server ----------------
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
