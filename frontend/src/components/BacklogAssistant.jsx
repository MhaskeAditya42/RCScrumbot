import { useState } from "react";
import { groomBacklog } from "../api";
import { Wand2 } from "lucide-react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Chip,
} from "@mui/material";

export default function BacklogAssistant() {
  const [tasks, setTasks] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const taskArray = tasks
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await groomBacklog({ items: taskArray });
    setResult(res.data);
  };

  const handleFetchFromJira = async () => {
    const res = await groomBacklog({ use_jira: true });
    setResult(res.data);
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
          maxWidth: 800,
          width: "100%",
          borderRadius: 3,
          boxShadow: 6,
          bgcolor: "#161B22", // dark card bg
          color: "#E6EDF3",
        }}
      >
        <CardContent>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            spacing={2}
            justifyContent="center"
            mb={3}
          >
            <Wand2 className="w-6 h-6 text-indigo-400" />
            <Typography variant="h5" fontWeight={600} color="#E6EDF3">
              Backlog Grooming Assistant
            </Typography>
          </Stack>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={3}>
              <TextField
                label="Enter tasks (one per line)"
                placeholder="Add dark mode to UI\nFix login API error\nImprove dashboard performance"
                multiline
                rows={6}
                value={tasks}
                onChange={(e) => setTasks(e.target.value)}
                variant="outlined"
                fullWidth
                sx={{
                  "& .MuiOutlinedInput-root": {
                    backgroundColor: "#0D1117",
                    borderRadius: 2,
                    color: "#E6EDF3",
                    "& fieldset": {
                      borderColor: "#30363D",
                    },
                    "&:hover fieldset": {
                      borderColor: "#58A6FF",
                    },
                    "&.Mui-focused fieldset": {
                      borderColor: "#58A6FF",
                      boxShadow: "0 0 0 2px rgba(88,166,255,0.4)",
                    },
                  },
                  "& .MuiInputLabel-root": {
                    color: "#8B949E",
                  },
                  "& .MuiInputLabel-root.Mui-focused": {
                    color: "#58A6FF",
                  },
                  "& .MuiInputBase-input::placeholder": {
                    color: "#8B949E",
                    opacity: 1,
                  },
                }}
              />

              <Button
                type="button"
                variant="outlined"
                size="large"
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  borderColor: "#58A6FF",
                  color: "#58A6FF",
                  "&:hover": { borderColor: "#1f6feb", bgcolor: "#161B22" },
                }}
                onClick={handleFetchFromJira}
              >
                Fetch Backlog from Jira
              </Button>


              <Button
                type="submit"
                variant="contained"
                size="large"
                startIcon={<Wand2 className="w-5 h-5" />}
                sx={{
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: "#238636", // green button
                  "&:hover": { bgcolor: "#2ea043" },
                }}
                disabled={!tasks.trim()}
              >
                Groom Backlog
              </Button>
            </Stack>
          </form>

          {/* Result */}
          {result && (
            <Box mt={4}>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#58A6FF"
                mb={2}
              >
                Refined Backlog:
              </Typography>
              <Stack spacing={2}>
                {result.refined_backlog.map((item, index) => (
                  <Card
                    key={index}
                    variant="outlined"
                    sx={{
                      p: 2,
                      borderColor: "#30363D",
                      bgcolor: "#0D1117",
                      borderRadius: 2,
                    }}
                  >
                    <Stack
                      direction="row"
                      alignItems="center"
                      spacing={1}
                      mb={1}
                    >
                      <Chip
                        label={item.category}
                        size="small"
                        sx={{
                          bgcolor: "#1f6feb",
                          color: "white",
                          fontWeight: 600,
                        }}
                      />
                      <Typography variant="subtitle1" fontWeight={600} color="#E6EDF3">
                        {item.item}
                      </Typography>
                    </Stack>
                    <Typography variant="body2" color="#8B949E">
                      {item.note}
                    </Typography>
                  </Card>
                ))}
              </Stack>

              {result.duplicates?.length > 0 && (
                <Box mt={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#F85149"
                  >
                    Duplicates:
                  </Typography>
                  <ul>
                    {result.duplicates.map((dup, i) => (
                      <li key={i} style={{ color: "#8B949E" }}>{dup}</li>
                    ))}
                  </ul>
                </Box>
              )}

              {result.dependencies?.length > 0 && (
                <Box mt={3}>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#D29922"
                  >
                    Dependencies:
                  </Typography>
                  <ul>
                    {result.dependencies.map((dep, i) => (
                      <li key={i} style={{ color: "#8B949E" }}>{dep}</li>
                    ))}
                  </ul>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}