import { useState } from "react";
import { prioritizeTasks } from "../api";
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
  const [tasks, setTasks] = useState([{ title: "", value: "", effort: "" }]);
  const [prioritized, setPrioritized] = useState([]);
  const [scores, setScores] = useState([]);

  const handleChange = (index, field, value) => {
    const newTasks = [...tasks];
    newTasks[index][field] = value;
    setTasks(newTasks);
  };

  const handleAddRow = () => {
    setTasks([...tasks, { title: "", value: "", effort: "" }]);
  };

  const handleRemoveRow = (index) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Convert value/effort to numbers
    const taskArray = tasks.map((t) => ({
      title: t.title,
      value: Number(t.value),
      effort: Number(t.effort),
    }));

    const res = await prioritizeTasks({ items: taskArray });

    setPrioritized(res.data.prioritized_items);
    setScores(res.data.scores);
  };

  return (
    <Card sx={{ borderRadius: 4, boxShadow: 3 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <SortIcon color="primary" sx={{ mr: 1 }} />
          <Typography variant="h6" fontWeight="bold">
            Prioritization Assistant
          </Typography>
        </Box>

        <form onSubmit={handleSubmit}>
          {tasks.map((task, index) => (
            <Stack direction="row" spacing={2} mb={1} key={index} alignItems="center">
              <TextField
                label="Task"
                value={task.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                fullWidth
              />
              <TextField
                label="Value"
                type="number"
                value={task.value}
                onChange={(e) => handleChange(index, "value", e.target.value)}
                sx={{ width: 100 }}
              />
              <TextField
                label="Effort"
                type="number"
                value={task.effort}
                onChange={(e) => handleChange(index, "effort", e.target.value)}
                sx={{ width: 100 }}
              />
              <IconButton onClick={() => handleRemoveRow(index)} color="error">
                <DeleteIcon />
              </IconButton>
            </Stack>
          ))}

          <Button variant="outlined" onClick={handleAddRow} sx={{ mb: 2 }}>
            Add Task
          </Button>
          <Button type="submit" variant="contained" color="primary" fullWidth>
            Prioritize
          </Button>
        </form>

        {prioritized.length > 0 && (
          <Box mt={3}>
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Prioritized Tasks:
            </Typography>
            <List>
              {prioritized.map((t, i) => (
                <ListItem key={i}>
                  {i + 1}. {t}
                </ListItem>
              ))}
            </List>

            <Typography variant="subtitle1" fontWeight="bold" mt={2} mb={1}>
              WSJF Scores:
            </Typography>
            <List>
              {scores.map((s, i) => (
                <ListItem key={i}>
                  <Stack direction="row" justifyContent="space-between" width="100%">
                    <Typography>{s.title}</Typography>
                    <Typography fontWeight="bold">{s.wsjf}</Typography>
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
