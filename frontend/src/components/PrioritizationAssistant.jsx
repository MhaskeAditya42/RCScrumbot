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

  const inputDarkSx = {
    "& .MuiInputBase-root": {
      backgroundColor: "#2c2c3e",
      color: "#E6EDF3",
      borderRadius: 1,
    },
    "& .MuiInputBase-input": {
      color: "#E6EDF3",
      // If you keep the field DISABLED, uncomment next two lines:
      // "&.Mui-disabled": {
      //   WebkitTextFillColor: "#E6EDF3", opacity: 1
      // },
    },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#444" },
    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#666" },
    "& .Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#58A6FF" },
    "& .MuiInputLabel-root": { color: "#bbb" },
    "& .MuiInputLabel-root.Mui-focused": { color: "#58A6FF" },
    "& .MuiInputLabel-root.Mui-disabled": { color: "#8B8B8B" },
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 6, backgroundColor: "#161B22", color: "#E6EDF3" }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <SortIcon sx={{ mr: 1, color: "#E6EDF3" }} />
          <Typography variant="h6" fontWeight="bold" sx={{ color: "#E6EDF3" }}>
            Prioritization Assistant
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {tasks.map((task, index) => (
            <Stack key={index} direction="row" spacing={2} mb={1} alignItems="center">
              {/* Jira task (read-only so color applies in dark mode) */}
              <TextField
                label="Task"
                value={task.title}
                fullWidth
                InputProps={{ readOnly: true }} // ← use readOnly instead of disabled
                // If you really want disabled, add: disabled
                sx={inputDarkSx}
              />

              {/* Value */}
              <TextField
                label="Value"
                type="number"
                value={task.value}
                onChange={(e) => handleChange(index, "value", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              {/* Time Criticality */}
              <TextField
                label="Time Crit."
                type="number"
                value={task.time_criticality ?? 0}
                onChange={(e) => handleChange(index, "time_criticality", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              {/* Risk Reduction */}
              <TextField
                label="Risk Red."
                type="number"
                value={task.risk_reduction ?? 0}
                onChange={(e) => handleChange(index, "risk_reduction", Number(e.target.value))}
                sx={{ width: 110, ...inputDarkSx }}
              />

              {/* Effort */}
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
              backgroundColor: "#238636",
              fontWeight: 700,
              "&:hover": { backgroundColor: "#2ea043" },
            }}
          >
            Prioritize
          </Button>
        </form>

        {prioritized.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1} sx={{ color: "#E6EDF3" }}>
              Prioritized Tasks:
            </Typography>
            <List>
              {prioritized.map((t, i) => (
                <ListItem
                  key={i}
                  sx={{ backgroundColor: "#0D1117", borderRadius: 1, mb: 1, color: "#E6EDF3" }}
                >
                  {i + 1}. {t}
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1} sx={{ color: "#E6EDF3" }}>
              WSJF Scores:
            </Typography>
            <List>
              {scores.map((s, i) => (
                <ListItem
                  key={i}
                  sx={{ backgroundColor: "#0D1117", borderRadius: 1, mb: 1, color: "#E6EDF3" }}
                >
                  <Stack direction="row" justifyContent="space-between" width="100%">
                    <Typography sx={{ color: "#E6EDF3" }}>{s.title}</Typography>
                    <Typography fontWeight="bold" sx={{ color: "#FFD700" }}>
                      {s.wsjf}
                    </Typography>
                  </Stack>
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
