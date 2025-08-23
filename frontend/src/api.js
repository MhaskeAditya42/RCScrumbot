import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:8000", // backend FastAPI
});

// Story
export const generateStory = (data) => API.post("/story-analyzer/", data);

// Backlog Grooming
export const groomBacklog = (data) => API.post("/backlog-grooming/", data);

// Estimation
export const estimateTask = (data) => API.post("/estimation/", data);

export const fetchJiraTasks = (params) => API.get("/estimation/tasks", { params });


// Prioritization
export const prioritizeTasks = (data) => API.post("/prioritization/", data);

// Retrospective
export const runRetro = (data) => API.post("/retrospective/", data);

// Fetch Jira tasks for prioritization
export const fetchPrioritizationTasks = () => API.get("/prioritization/tasks");


export default API;
