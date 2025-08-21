import { useState } from "react";
import { estimateTask } from "../api";

export default function EstimationAssistant() {
  const [task, setTask] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await estimateTask({ task });
    setResult(res.data.estimation);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Estimation Assistant</h2>
      <form onSubmit={handleSubmit} className="flex gap-3">
        <input 
          className="p-2 border rounded-lg flex-1"
          placeholder="Enter task"
          value={task}
          onChange={(e) => setTask(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800">
          Estimate
        </button>
      </form>
      {result && <div className="mt-4 p-3 border bg-gray-50 rounded-lg">Estimation: {result}</div>}
    </div>
  );
}
