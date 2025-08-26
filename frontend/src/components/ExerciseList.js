// src/components/ExerciseList.js
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";

export default function ExerciseList() {
  const [exercises, setExercises] = useState([]);
  const [schedules, setSchedules] = useState({});

  useEffect(() => {
    axios.get("http://localhost:5000/exercises").then((res) => {
      setExercises(res.data);
    });
  }, []);

  const updateSchedule = async (id) => {
    if (!schedules[id]) return;
    const res = await axios.put(`http://localhost:5000/exercises/${id}`, {
      schedule: schedules[id],
    });
    alert(`✅ Schedule updated for ${res.data.name}`);
  };

  return (
    <div className="container mt-4">
      <h2>📅 Scheduled Exercises</h2>
      {exercises.map((ex) => (
        <div key={ex.id} className="card p-3 mb-3">
          <h4>{ex.name}</h4>
          <p>{ex.description}</p>
          <p><b>Duration:</b> {ex.duration}</p>
          <p>
            <b>Scheduled:</b>{" "}
            {ex.schedule ? new Date(ex.schedule).toLocaleString() : "Not Scheduled"}
          </p>
          <Form.Control
            type="datetime-local"
            onChange={(e) => setSchedules({ ...schedules, [ex.id]: e.target.value })}
          />
          <Button className="mt-2" onClick={() => updateSchedule(ex.id)}>
            Update Schedule
          </Button>
        </div>
      ))}
    </div>
  );
}
