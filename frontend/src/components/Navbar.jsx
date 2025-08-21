import { motion } from "framer-motion";

export default function Navbar({ setActiveTab }) {
  const tabs = ["Story", "Backlog", "Estimation", "Prioritization", "Retrospective"];

  return (
    <motion.nav 
      className="flex gap-6 p-4 bg-indigo-600 text-white shadow-lg"
      initial={{ y: -50 }} animate={{ y: 0 }}
    >
      {tabs.map((tab) => (
        <button 
          key={tab}
          onClick={() => setActiveTab(tab)}
          className="hover:bg-indigo-800 px-3 py-1 rounded-lg"
        >
          {tab}
        </button>
      ))}
    </motion.nav>
  );
}
