import { useEffect, useMemo, useState } from "react";
import { estimateTask, fetchJiraTasks } from "../api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
  Autocomplete,
  CircularProgress,
  Divider,
  Tooltip,
} from "@mui/material";
import { Clock } from "lucide-react";

export default function EstimationAssistant() {
  const [task, setTask] = useState(""); // manual entry
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Jira tasks for dropdown
  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [error, setError] = useState(null);

  // Load Jira tasks on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        setLoadingTasks(true);
        const res = await fetchJiraTasks(); // optional: pass { jql_filter }
        if (!mounted) return;
        setTasks(res.data || []);
      } catch (e) {
        setError(e?.response?.data?.detail || e?.message || "Failed to load tasks");
      } finally {
        setLoadingTasks(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const canEstimate = useMemo(() => {
    return (selectedIssue && selectedIssue.key) || (task && task.trim().length > 0);
  }, [selectedIssue, task]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    setResult(null);
    try {
      const payload = selectedIssue?.key
        ? { issue_key: selectedIssue.key }
        : { story_text: task };
      const res = await estimateTask(payload);
      setResult(res.data.estimate);
    } catch (e) {
      setError(e?.response?.data?.detail || e?.message || "Estimation failed");
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setSelectedIssue(null);
    setTask("");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#0D1117",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 3,
      }}
    >
      <Card
        sx={{
          maxWidth: 700,
          width: "100%",
          borderRadius: 3,
          boxShadow: 6,
          bgcolor: "#161B22",
          color: "#E6EDF3",
        }}
      >
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1} mb={3}>
            <Clock className="w-6 h-6 text-indigo-400" />
            <Typography variant="h5" fontWeight={600} color="#E6EDF3">
              Estimation Assistant
            </Typography>
          </Stack>

          {/* Optional error */}
          {error && (
            <Box
              mb={2}
              p={1.5}
              borderRadius={1.5}
              sx={{ bgcolor: "#2d1f1f", border: "1px solid #4f1e1e", color: "#ffb4b4" }}
            >
              <Typography variant="body2">{error}</Typography>
            </Box>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              {/* Jira task dropdown + Clear */}
              <Stack direction="row" spacing={1} alignItems="center">
                <Autocomplete
                  options={tasks}
                  value={selectedIssue}
                  onChange={(_, v) => {
                    setSelectedIssue(v);
                    if (v) setTask(""); // clear manual if selected
                  }}
                  getOptionLabel={(opt) => (opt ? `${opt.key} — ${opt.summary || ""}` : "")}
                  loading={loadingTasks}
                  noOptionsText={loadingTasks ? "Loading..." : "No tasks found"}
                  clearOnEscape
                  disableClearable={false} // show "X" clear icon
                  // Style the dropdown list (renders in a portal)
                  ListboxProps={{
                    sx: {
                      bgcolor: "#0D1117",
                      color: "#E6EDF3",
                      "& .MuiAutocomplete-option": {
                        color: "#E6EDF3",
                        "&.Mui-focused": { backgroundColor: "rgba(88,166,255,0.15)" },
                        "&[aria-selected='true']": { backgroundColor: "rgba(88,166,255,0.25)" },
                      },
                    },
                  }}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Pick a Jira task"
                      placeholder="Search by key or summary"
                      variant="outlined"
                      sx={{
                        "& .MuiOutlinedInput-root": {
                          backgroundColor: "#0D1117",
                          borderRadius: 2,
                          color: "#E6EDF3",
                          "& fieldset": { borderColor: "#30363D" },
                          "&:hover fieldset": { borderColor: "#58A6FF" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#58A6FF",
                            boxShadow: "0 0 0 2px rgba(88,166,255,0.4)",
                          },
                        },
                        "& .MuiInputLabel-root": { color: "#8B949E" },
                        "& .MuiInputLabel-root.Mui-focused": { color: "#58A6FF" },
                        // Force the actual input text + placeholder to white/grey
                        "& .MuiInputBase-input": {
                          color: "#E6EDF3",
                          "&::placeholder": { color: "#8B949E", opacity: 1 },
                        },
                      }}
                      // Extra guarantees the input text is white (high specificity)
                      InputProps={{
                        ...params.InputProps,
                        sx: {
                          color: "#E6EDF3",
                          "& .MuiInputBase-input": { color: "#E6EDF3" },
                          "& .MuiSvgIcon-root": { color: "#E6EDF3" }, // dropdown/clear icons
                        },
                        endAdornment: (
                          <>
                            {loadingTasks ? <CircularProgress size={18} /> : null}
                            {params.InputProps.endAdornment}
                          </>
                        ),
                      }}
                      inputProps={{
                        ...params.inputProps,
                        style: { color: "#E6EDF3" }, // inline style on the <input/>
                      }}
                    />
                  )}
                  sx={{
                    flex: 1,
                    // Ensure typed text is white even if MUI overrides
                    "& .MuiAutocomplete-inputRoot": { color: "#E6EDF3" },
                    "& .MuiAutocomplete-input": { color: "#E6EDF3 !important" },
                    "& .MuiOutlinedInput-notchedOutline": { borderColor: "#30363D" },
                    "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: "#58A6FF" },
                    "&.Mui-focused .MuiOutlinedInput-notchedOutline": { borderColor: "#58A6FF" },
                  }}
                />

                <Button
                  variant="outlined"
                  onClick={handleClear}
                  sx={{
                    borderColor: "#30363D",
                    color: "#E6EDF3",
                    borderRadius: 2,
                    "&:hover": { borderColor: "#58A6FF" },
                    whiteSpace: "nowrap",
                    height: 56, // match MUI TextField default height
                  }}
                >
                  Clear
                </Button>
              </Stack>

              <Stack direction="row" alignItems="center" spacing={1}>
                <Divider sx={{ flex: 1, borderColor: "#30363D" }} />
                <Typography variant="caption" color="#8B949E">
                  or
                </Typography>
                <Divider sx={{ flex: 1, borderColor: "#30363D" }} />
              </Stack>

              {/* Manual entry (disabled when an issue is chosen) */}
              <Tooltip title={selectedIssue ? "Clear selected Jira task to type manually" : ""} arrow>
                <span>
                  <TextField
                    label="Enter a task to estimate"
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    variant="outlined"
                    fullWidth
                    size="medium"
                    disabled={!!selectedIssue}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        backgroundColor: "#0D1117",
                        borderRadius: 2,
                        color: "#E6EDF3",
                        "& fieldset": { borderColor: "#30363D" },
                        "&:hover fieldset": { borderColor: "#58A6FF" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#58A6FF",
                          boxShadow: "0 0 0 2px rgba(88,166,255,0.4)",
                        },
                      },
                      "& .MuiInputLabel-root": { color: "#8B949E" },
                      "& .MuiInputLabel-root.Mui-focused": { color: "#58A6FF" },
                      "& .MuiInputBase-input": { color: "#E6EDF3" },
                      "& .MuiInputBase-input::placeholder": { color: "#8B949E", opacity: 1 },
                    }}
                  />
                </span>
              </Tooltip>

              <Button
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  alignSelf: "flex-start",
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: "#238636",
                  "&:hover": { bgcolor: "#2ea043" },
                }}
                disabled={!canEstimate || loading}
              >
                {loading ? "Estimating..." : "Estimate"}
              </Button>
            </Stack>
          </form>

          {/* Result */}
          {result && (
            <Box
              mt={4}
              p={3}
              border="1px solid"
              borderColor="#30363D"
              borderRadius={2}
              bgcolor="#0D1117"
            >
              <Typography variant="subtitle1" fontWeight={600} color="#58A6FF" mb={1}>
                Story Points: <strong>{result.story_points}</strong>
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="#D29922" mb={1}>
                Confidence: <strong>{result.confidence}</strong>
              </Typography>
              <Typography variant="subtitle1" fontWeight={600} color="#E6EDF3" mb={1}>
                Rationale:
              </Typography>
              <Typography color="#8B949E">{result.rationale}</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
