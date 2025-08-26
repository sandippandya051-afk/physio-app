// src/components/ProgressTracker.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "react-bootstrap";

export default function ProgressTracker() {
  const [exercises, setExercises] = useState([]);
  const [progress, setProgress] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/exercises").then((res) => setExercises(res.data));
    axios.get("http://localhost:5000/progress").then((res) => setProgress(res.data));
  }, []);

  const markComplete = async (exerciseId) => {
    const today = new Date().toISOString().split("T")[0];
    const res = await axios.post("http://localhost:5000/progress", {
      exerciseId,
      date: today,
    });
    setProgress([...progress, res.data]);
  };

  return (
    <div className="container mt-4">
      <h2>✅ Progress Tracker</h2>
      {exercises.map((ex) => (
        <div key={ex.id} className="card p-3 mb-3">
          <h4>{ex.name}</h4>
          <Button onClick={() => markComplete(ex.id)}>Mark as Done</Button>
        </div>
      ))}

      <h3 className="mt-4">📊 History</h3>
      <ul>
        {progress.map((p) => (
          <li key={p.id}>
            Exercise #{p.exerciseId} → {p.date}
          </li>
        ))}
      </ul>
    </div>
  );
}
