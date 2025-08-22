import { useState } from "react";
import axios from "axios";
import { Loader2, FileText, CheckCircle2 } from "lucide-react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Typography,
  TextField,
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Divider,
  Stack,
} from "@mui/material";

export default function StoryAnalyzer() {
  const [task, setTask] = useState("");
  const [createInJira, setCreateInJira] = useState(false);
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post("http://localhost:8000/story-analyzer/", {
        task,
        create_in_jira: createInJira,
      });
      setStory(res.data);
    } catch (err) {
      console.error(err);
      alert("Error generating story");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0D1117", // dark background
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 900,
          width: "100%",
          borderRadius: 3,
          boxShadow: 6,
          overflow: "hidden",
        }}
      >
        {/* Gradient Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            px: 3,
            py: 2,
            bgcolor: "linear-gradient(90deg, #6a11cb 0%, #2575fc 100%)",
            color: "white",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1}>
            <FileText className="w-6 h-6" />
            <Typography variant="h6" fontWeight={600}>
              Story Analyzer
            </Typography>
          </Stack>

          <Stack direction="row" spacing={2}>
            <Button
              variant="outlined"
              sx={{
                borderColor: "white",
                color: "white",
                "&:hover": { borderColor: "white", bgcolor: "rgba(255,255,255,0.1)" },
              }}
            >
              Back
            </Button>
            <Button
              variant="contained"
              sx={{
                bgcolor: "white",
                color: "#2575fc",
                fontWeight: 600,
                "&:hover": { bgcolor: "#f5f5f5" },
              }}
            >
              Launch
            </Button>
          </Stack>
        </Box>

        {/* Main Content */}
        <CardContent sx={{ p: 4 }}>
          {/* Task Input */}
          <TextField
            label="Enter your task or requirement"
            value={task}
            onChange={(e) => setTask(e.target.value)}
            fullWidth
            multiline
            rows={6}
            placeholder="Write your task here..."
            variant="outlined"
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                backgroundColor: "#161B22", // dark input bg
                borderRadius: 2,
                color: "#E6EDF3", // light text
                "& fieldset": {
                  borderColor: "#30363D", // subtle border
                },
                "&:hover fieldset": {
                  borderColor: "#58A6FF", // hover glow
                },
                "&.Mui-focused fieldset": {
                  borderColor: "#58A6FF",
                  boxShadow: "0 0 0 2px rgba(88,166,255,0.4)", // focus ring
                },
              },
              "& .MuiInputLabel-root": {
                color: "#8B949E", // muted label
              },
              "& .MuiInputLabel-root.Mui-focused": {
                color: "#58A6FF", // focus label
              },
              "& .MuiInputBase-input::placeholder": {
                color: "#8B949E", // placeholder style
                opacity: 1,
              },
            }}
          />

          {/* Jira toggle */}
          <FormControlLabel
            control={
              <Checkbox
                checked={createInJira}
                onChange={() => setCreateInJira(!createInJira)}
                sx={{
                  color: "white", // unchecked color
                  "&.Mui-checked": {
                    color: "white", // checked color
                  },
                }}
              />
            }
            label="Create in Jira"
            sx={{ mb: 3, color: "white" }} // label text color white
          />

          {/* Generate button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !task.trim()}
            fullWidth
            variant="contained"
            size="large"
            sx={{ py: 1.5, fontWeight: 600, borderRadius: 2 }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Generate Story"
            )}
          </Button>

          {/* Generated Story */}
          {story && (
            <Box
              mt={4}
              p={3}
              border="1px solid"
              borderColor="#30363D"
              borderRadius={2}
              bgcolor="#161B22"
            >
              <Typography variant="h6" gutterBottom fontWeight={600} color="#E6EDF3">
                Generated Story
              </Typography>
              <Typography color="#E6EDF3" sx={{ mb: 2 }}>
                {story.user_story}
              </Typography>

              {story.acceptance_criteria.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600} color="#E6EDF3">
                    Acceptance Criteria
                  </Typography>
                  <ul style={{ paddingLeft: "1.2rem", color: "#E6EDF3" }}>
                    {story.acceptance_criteria.map((c, idx) => (
                      <li key={idx}>
                        <Typography color="#E6EDF3">{c}</Typography>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {story.jira_issue_key && (
                <Stack
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mt={2}
                  color="success.main"
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <Typography fontWeight={600}>
                    Created in Jira: {story.jira_issue_key}
                  </Typography>
                </Stack>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}