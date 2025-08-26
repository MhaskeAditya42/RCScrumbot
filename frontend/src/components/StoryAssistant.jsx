import { useState, useEffect } from "react";
import axios from "axios";
import {
  Box, Button, Card, CardContent, Typography, TextField, CircularProgress,
  Divider, Stack, MenuItem, Select, Dialog, DialogActions, DialogContent,
  DialogContentText, DialogTitle, LinearProgress
} from "@mui/material";
import { FileText, CheckCircle2, Info } from "lucide-react";

export default function StoryAnalyzer() {
  const [task, setTask] = useState("");
  const [backlog, setBacklog] = useState([]);
  const [selectedTask, setSelectedTask] = useState("");
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  // Fetch backlog from backend
  useEffect(() => {
    axios.get("http://localhost:8000/story-analyzer/backlog")
      .then(res => setBacklog(res.data))
      .catch(err => console.error(err));
  }, []);

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const chosenTask = selectedTask
        ? backlog.find(b => b.key === selectedTask)?.summary
        : task;

      const res = await axios.post("http://localhost:8000/story-analyzer/", {
        task: chosenTask,
        create_in_jira: false, // only generate
      });
      setStory(res.data);
    } catch (err) {
      console.error(err);
      alert("Error generating story");
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAdd = async () => {
    try {
      const chosenTask = selectedTask
        ? backlog.find(b => b.key === selectedTask)
        : null;

      const res = await axios.post("http://localhost:8000/story-analyzer/", {
        task: chosenTask ? chosenTask.summary : task,
        issue_key: chosenTask ? chosenTask.key : null,
        create_in_jira: true,
      });

      setStory(res.data);
    } catch (err) {
      console.error(err);
      alert("Error adding story to Jira");
    } finally {
      setConfirmOpen(false);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#0D1117", display: "flex", alignItems: "center", justifyContent: "center", p: 3 }}>
      <Card sx={{ maxWidth: 900, width: "100%", borderRadius: 3, boxShadow: 6 }}>
        {/* Header */}
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", px: 3, py: 2, bgcolor: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)", color: "white" }}>
          <Stack direction="row" alignItems="center" spacing={1}>
            <FileText className="w-6 h-6" />
            <Typography variant="h6" fontWeight={600}>Story Analyzer</Typography>
          </Stack>
        </Box>

        <CardContent sx={{ p: 4 }}>
          {/* Backlog Dropdown */}
          <Select
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            displayEmpty
            fullWidth
            sx={{
              mb: 3,
              bgcolor: "#161B22",
              color: "#E6EDF3",
              "& .MuiSelect-icon": { color: "#E6EDF3" },
            }}
            MenuProps={{
              PaperProps: {
                sx: { bgcolor: "#161B22", color: "#E6EDF3" },
              },
            }}
          >
            <MenuItem value="">
              <em style={{ color: "#8B949E" }}>None (enter custom task below)</em>
            </MenuItem>
            {backlog.map((issue) => (
              <MenuItem key={issue.key} value={issue.key} sx={{ color: "#E6EDF3" }}>
                {issue.key} - {issue.summary}
              </MenuItem>
            ))}
          </Select>

          {/* Manual task input */}
          <TextField
            label="Or enter a custom task"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            fullWidth
            multiline
            rows={4}
            placeholder="Write your task here..."
            variant="outlined"
            sx={{
              mb: 3,
              bgcolor: "#161B22",
              "& .MuiInputBase-input": { color: "#E6EDF3" },
              "& .MuiInputLabel-root": { color: "#E6EDF3" },
              "& .MuiOutlinedInput-notchedOutline": { borderColor: "#30363D" },
              "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#8B949E" },
              "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#58A6FF" },
              "& .MuiInputBase-input::placeholder": { color: "#8B949E" },
            }}
          />

          {/* Generate button */}
          <Button onClick={handleGenerate} disabled={loading || (!task.trim() && !selectedTask)} fullWidth variant="contained" size="large" sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}>
            {loading ? <CircularProgress size={24} color="inherit" /> : "Generate Story"}
          </Button>

          {/* Generated Story */}
          {story && (
            <Box mt={4} p={3} border="1px solid #30363D" borderRadius={2} bgcolor="#161B22">
              <Typography variant="h6" gutterBottom fontWeight={600} color="#E6EDF3">Generated Story</Typography>
              <Typography color="#E6EDF3" sx={{ mb: 2 }}>{story.user_story}</Typography>

              {/* INVEST Score */}
              {story.investment_score !== null && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#E6EDF3">INVEST Score</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={story.investment_score * 100}
                    sx={{
                      height: 10,
                      borderRadius: 5,
                      mt: 1,
                      bgcolor: "#30363D",
                      "& .MuiLinearProgress-bar": { bgcolor: "#58A6FF" },
                    }}
                  />
                  <Typography color="#8B949E" variant="body2" mt={1}>
                    {Math.round(story.investment_score * 100)}%
                  </Typography>
                </>
              )}

              {/* Acceptance Criteria */}
              {story.acceptance_criteria.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#E6EDF3">Acceptance Criteria</Typography>
                  <ul style={{ paddingLeft: "1.2rem", color: "#E6EDF3" }}>
                    {story.acceptance_criteria.map((c, idx) => (
                      <li key={idx}><Typography color="#E6EDF3">{c}</Typography></li>
                    ))}
                  </ul>
                </>
              )}

              {/* Notes */}
              {story.notes && story.notes.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#E6EDF3">Notes</Typography>
                  <ul style={{ paddingLeft: "1.2rem", color: "#E6EDF3" }}>
                    {story.notes.map((n, idx) => (
                      <li key={idx}><Typography color="#E6EDF3">{n}</Typography></li>
                    ))}
                  </ul>
                </>
              )}

              {/* Ask confirmation before adding to Jira */}
              {!story.jira_issue_key && (
                <Button variant="outlined" sx={{ mt: 2 }} onClick={() => setConfirmOpen(true)}>
                  Add to Jira?
                </Button>
              )}

              {story.jira_issue_key && (
                <Stack direction="row" alignItems="center" spacing={1} mt={2} color="success.main">
                  <CheckCircle2 className="w-5 h-5" />
                  <Typography fontWeight={600}>Created in Jira: {story.jira_issue_key} <br></br> Label: INVEST-READY </Typography>
                </Stack>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle sx={{color: "#e5e2e2ff"}}>Confirm Add</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{color: "#e5e2e2ff"}}>Do you want to add this story to Jira?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancel</Button>
          <Button onClick={handleConfirmAdd} autoFocus>Add to Jira</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
