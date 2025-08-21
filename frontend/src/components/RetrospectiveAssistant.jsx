import { useState } from "react";
import { runRetro } from "../api";

export default function RetrospectiveAssistant() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await runRetro({ notes: notes.split(",") });
    setResult(res.data.retro_summary);
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold mb-4">Retrospective Assistant</h2>
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <textarea 
          className="p-2 border rounded-lg"
          placeholder="Enter notes separated by commas"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
        <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-800">
          Summarize Retro
        </button>
      </form>
      {result && <div className="mt-4 p-3 border bg-gray-50 rounded-lg">{result}</div>}
    </div>
  );
}
