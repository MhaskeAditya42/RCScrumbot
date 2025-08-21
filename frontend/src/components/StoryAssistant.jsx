import { useState } from "react";
import axios from "axios";

export default function StoryAnalyzer() {
  const [task, setTask] = useState("");
  const [createInJira, setCreateInJira] = useState(false);
  const [story, setStory] = useState(null);

  const handleSubmit = async () => {
    try {
      const res = await axios.post("http://localhost:8000/story-analyzer/", {
        task,
        create_in_jira: createInJira
      });
      setStory(res.data);
    } catch (err) {
      console.error(err);
      alert("Error generating story");
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-xl font-bold">Story Analyzer</h2>

      <textarea
        placeholder="Enter your task or requirement..."
        value={task}
        onChange={(e) => setTask(e.target.value)}
        className="w-full p-2 border rounded"
        rows={4}
      />

      {/* <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={createInJira}
          onChange={() => setCreateInJira(!createInJira)}
        />
        <label>Create in Jira</label>
      </div> */}

      <button
        onClick={handleSubmit}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Generate Story
      </button>

      {story && (
        <div className="mt-4 p-4 border rounded bg-gray-50">
          <h3 className="font-semibold">Generated Story</h3>
          <p>{story.user_story}</p>

          {story.acceptance_criteria.length > 0 && (
            <>
              <h4 className="mt-2 font-semibold">Acceptance Criteria</h4>
              <ul className="list-disc list-inside">
                {story.acceptance_criteria.map((c, idx) => (
                  <li key={idx}>{c}</li>
                ))}
              </ul>
            </>
          )}

          {story.jira_issue_key && (
            <p className="mt-2 text-green-600">
              ✅ Created in Jira: {story.jira_issue_key}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
