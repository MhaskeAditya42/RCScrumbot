import { useState } from "react";
import { prioritizeTasks } from "../api";

export default function PrioritizationAssistant() {
  const [tasks, setTasks] = useState("");
  const [result, setResult] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await prioritizeTasks({ tasks: tasks.split(",") });
    setResult(res.data.prioritized_tasks);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Prioritization Assistant</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea 
          className="p-2 border rounded-lg"
          placeholder="Enter tasks separated by commas"
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800">
          Prioritize
        </button>
      </form>
      {result.length > 0 && (
        <div className="mt-4 p-3 border bg-gray-50 rounded-lg">
          <ol className="list-decimal pl-4">
            {result.map((t, i) => <li key={i}>{t}</li>)}
          </ol>
        </div>
      )}
    </div>
  );
}
