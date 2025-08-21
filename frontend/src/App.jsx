import { useState } from "react";
import Navbar from "./components/Navbar";
import StoryAssistant from "./components/StoryAssistant";
import BacklogAssistant from "./components/BacklogAssistant";
import EstimationAssistant from "./components/EstimationAssistant";
import PrioritizationAssistant from "./components/PrioritizationAssistant";
import RetrospectiveAssistant from "./components/RetrospectiveAssistant";

export default function App() {
  const [activeTab, setActiveTab] = useState("Story");

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar setActiveTab={setActiveTab} />
      <div className="max-w-4xl mx-auto mt-6 bg-white rounded-xl shadow-lg p-6">
        {activeTab === "Story" && <StoryAssistant />}
        {activeTab === "Backlog" && <BacklogAssistant />}
        {activeTab === "Estimation" && <EstimationAssistant />}
        {activeTab === "Prioritization" && <PrioritizationAssistant />}
        {activeTab === "Retrospective" && <RetrospectiveAssistant />}
      </div>
    </div>
  );
}
