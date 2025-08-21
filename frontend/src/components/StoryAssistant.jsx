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
        bgcolor: "grey.100",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card sx={{ maxWidth: 700, width: "100%", borderRadius: 3, boxShadow: 4 }}>
        <CardContent>
          {/* Title */}
          <Stack direction="row" alignItems="center" spacing={1} mb={3}>
            <FileText className="w-6 h-6 text-blue-600" />
            <Typography variant="h5" fontWeight={600} color="text.primary">
              Story Analyzer
            </Typography>
          </Stack>

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
              "& .MuiInputBase-root": {
                fontSize: "1rem",
              },
            }}
          />

          {/* Jira toggle */}
          <FormControlLabel
            control={
              <Checkbox
                checked={createInJira}
                onChange={() => setCreateInJira(!createInJira)}
                color="primary"
              />
            }
            label="Create in Jira"
            sx={{ mb: 2 }}
          />

          {/* Generate button */}
          <Button
            onClick={handleSubmit}
            disabled={loading || !task.trim()}
            fullWidth
            variant="contained"
            size="large"
            sx={{ py: 1.5, fontWeight: 600 }}
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
              borderColor="grey.300"
              borderRadius={2}
              bgcolor="grey.50"
            >
              <Typography variant="h6" gutterBottom fontWeight={600}>
                Generated Story
              </Typography>
              <Typography color="text.secondary" sx={{ mb: 2 }}>
                {story.user_story}
              </Typography>

              {story.acceptance_criteria.length > 0 && (
                <>
                  <Divider sx={{ my: 2 }} />
                  <Typography variant="subtitle1" fontWeight={600}>
                    Acceptance Criteria
                  </Typography>
                  <ul style={{ paddingLeft: "1.2rem" }}>
                    {story.acceptance_criteria.map((c, idx) => (
                      <li key={idx}>
                        <Typography color="text.secondary">{c}</Typography>
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
