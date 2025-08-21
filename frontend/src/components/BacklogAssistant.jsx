import { useState } from "react";
import { groomBacklog } from "../api";

export default function BacklogAssistant() {
  const [tasks, setTasks] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await groomBacklog({ tasks: tasks.split(",") });
    setResult(res.data.groomed_backlog.join(", "));
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Backlog Grooming Assistant</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea 
          className="p-2 border rounded-lg"
          placeholder="Enter tasks separated by commas"
          value={tasks}
          onChange={(e) => setTasks(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800">
          Groom Backlog
        </button>
      </form>
      {result && <div className="mt-4 p-3 border bg-gray-50 rounded-lg">{result}</div>}
    </div>
  );
}
