const express = require("express");
const cors = require("cors");
const low = require("lowdb");
const FileSync = require("lowdb/adapters/FileSync");

// Connect to db.json
const adapter = new FileSync("db.json");
const db = low(adapter);

// Set default structure
db.defaults({ exercises: [], schedule: [], progress: [] }).write();

const app = express();
app.use(cors());
app.use(express.json());

// ----------------- EXERCISES -----------------

// Get all exercises
app.get("/exercises", (req, res) => {
  res.json(db.get("exercises").value());
});

// Add a new exercise
app.post("/exercises", (req, res) => {
  const id = Date.now();
  const newExercise = { id, ...req.body };
  db.get("exercises").push(newExercise).write();
  res.json(newExercise);
});

// Update an exercise
app.put("/exercises/:id", (req, res) => {
  const id = parseInt(req.params.id);
  db.get("exercises").find({ id }).assign(req.body).write();
  const updated = db.get("exercises").find({ id }).value();
  res.json(updated);
});

// Delete an exercise
app.delete("/exercises/:id", (req, res) => {
  const id = parseInt(req.params.id);
  db.get("exercises").remove({ id }).write();
  res.json({ success: true });
});

// ----------------- SCHEDULE -----------------

// Get all schedules
app.get("/schedule", (req, res) => {
  res.json(db.get("schedule").value());
});

// Add schedule
app.post("/schedule", (req, res) => {
  const id = Date.now();
  const newSchedule = { id, ...req.body };
  db.get("schedule").push(newSchedule).write();
  res.json(newSchedule);
});

// ----------------- PROGRESS -----------------

// Get all progress entries
app.get("/progress", (req, res) => {
  res.json(db.get("progress").value());
});

// Mark exercise as done
app.post("/progress", (req, res) => {
  const id = Date.now();
  const newProgress = { id, ...req.body }; // expects { exerciseId, date }
  db.get("progress").push(newProgress).write();
  res.json(newProgress);
});

// ----------------- START SERVER -----------------
const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Backend running at http://localhost:${PORT}`));
