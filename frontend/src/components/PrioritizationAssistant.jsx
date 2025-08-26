import { useState, useEffect } from "react";
import { prioritizeTasks, fetchPrioritizationTasks } from "../api";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  IconButton,
  Stack,
  List,
  ListItem,
  Chip,
  Divider,
} from "@mui/material";
import SortIcon from "@mui/icons-material/Sort";
import DeleteIcon from "@mui/icons-material/Delete";

export default function PrioritizationAssistant() {
  const [tasks, setTasks] = useState([]);
  const [prioritized, setPrioritized] = useState([]);
  const [scores, setScores] = useState([]);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const res = await fetchPrioritizationTasks();
        setTasks(res.data.tasks || []);
      } catch (err) {
        console.error("Failed to fetch Jira tasks:", err);
      }
    };
    loadTasks();
  }, []);

  const handleChange = (index, field, value) => {
    const next = [...tasks];
    next[index][field] = value;
    setTasks(next);
  };

  const handleRemoveRow = (index) => {
    setTasks(tasks.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await prioritizeTasks({ items: tasks });
    setPrioritized(res.data.prioritized_items);
    setScores(res.data.scores);
  };

  const getPriorityLabel = (wsjf) => {
    if (wsjf >= 20) return <Chip label="High" sx={{ bgcolor: "#ff4d4d", color: "#fff" }} />;
    if (wsjf >= 10) return <Chip label="Medium" sx={{ bgcolor: "#f4c542", color: "#000" }} />;
    return <Chip label="Low" sx={{ bgcolor: "#2ea043", color: "#fff" }} />;
  };

  const inputDarkSx = {
    "& .MuiInputBase-root": {
      backgroundColor: "#2c2c3e",
      color: "#E6EDF3",
      borderRadius: 1,
    },
    "& .MuiInputBase-input": { color: "#E6EDF3" },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#58A6FF" },
    "& .MuiInputLabel-root": { color: "#bbb" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#58A6FF" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "#8B8B8B" },
  };

  return (
    <Card
      sx={{
        borderRadius: 3,
        boxShadow: 8,
        backgroundColor: "#161B22",
        color: "#E6EDF3",
        p: 2,
      }}
    >
      <CardContent>
        {/* Heading */}
        <Box display="flex" alignItems="center" mb={3}>
          <SortIcon sx={{ mr: 1, color: "#58A6FF" }} />
          <Typography
            variant="h5"
            fontWeight="bold"
            sx={{
              color: "#E6EDF3",
              borderBottom: "2px solid #58A6FF",
              display: "inline-block",
              pb: 0.5,
            }}
          >
            Prioritization Assistant
          </Typography>
        </Box>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {tasks.map((task, index) => (
            <Stack key={index} direction="row" spacing={2} mb={2} alignItems="center">
              <TextField
                label="Task"
                value={task.title}
                fullWidth
                InputProps={{ readOnly: true }}
                sx={inputDarkSx}
              />

              <TextField
                label="Value"
                type="number"
                value={task.value}
                onChange={(e) => handleChange(index, "value", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              <TextField
                label="Time Crit."
                type="number"
                value={task.time_criticality ?? 0}
                onChange={(e) => handleChange(index, "time_criticality", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              <TextField
                label="Risk Red."
                type="number"
                value={task.risk_reduction ?? 0}
                onChange={(e) => handleChange(index, "risk_reduction", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              <TextField
                label="Effort"
                type="number"
                value={task.effort}
                onChange={(e) => handleChange(index, "effort", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              <IconButton onClick={() => handleRemoveRow(index)} sx={{ color: "#ff6b6b" }}>
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            sx={{
              mt: 2,
              py: 1.2,
              fontSize: "1rem",
              backgroundColor: "#238636",
              fontWeight: 700,
              "&:hover": { backgroundColor: "#2ea043" },
            }}
          >
            Prioritize
          </Button>
        </form>

        {/* Results */}
        {prioritized.length > 0 && (
          <Box mt={4}>
            <Typography
              variant="h6"
              fontWeight="bold"
              mb={2}
              sx={{ color: "#E6EDF3", borderBottom: "1px solid #444", pb: 0.5 }}
            >
              Prioritized Tasks
            </Typography>

            <List>
              {scores.map((s, i) => (
                <ListItem
                  key={i}
                  sx={{
                    backgroundColor: "#0D1117",
                    borderRadius: 2,
                    mb: 2,
                    p: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <Box>
                    <Typography fontWeight="bold" sx={{ color: "#E6EDF3" }}>
                      {i + 1}. {s.title}
                    </Typography>
                    <Typography variant="body2" sx={{ color: "#bbb" }}>
                      WSJF Score: <span style={{ color: "#FFD700" }}>{s.wsjf}</span>
                    </Typography>
                  </Box>
                  {getPriorityLabel(s.wsjf)}
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
