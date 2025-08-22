import { useState } from "react";
import { estimateTask } from "../api";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
import { Clock } from "lucide-react";

export default function EstimationAssistant() {
  const [task, setTask] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await estimateTask({ story_text: task });
    setResult(res.data.estimate);
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
          maxWidth: 700,
          width: "100%",
          borderRadius: 3,
          boxShadow: 6,
          bgcolor: "#161B22", // dark card background
          color: "#E6EDF3",
        }}
      >
        <CardContent>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1}
            mb={3}
          >
            <Clock className="w-6 h-6 text-indigo-400" />
            <Typography variant="h5" fontWeight={600} color="#E6EDF3">
              Estimation Assistant
            </Typography>
          </Stack>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <Stack direction="row" spacing={2}>
              <TextField
                label="Enter a task to estimate"
                value={task}
                onChange={(e) => setTask(e.target.value)}
                variant="outlined"
                fullWidth
                size="medium"
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
                type="submit"
                variant="contained"
                size="large"
                sx={{
                  px: 4,
                  borderRadius: 2,
                  fontWeight: 600,
                  bgcolor: "#238636",
                  "&:hover": { bgcolor: "#2ea043" },
                }}
                disabled={!task.trim()}
              >
                Estimate
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
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#58A6FF"
                mb={1}
              >
                Story Points: <strong>{result.story_points}</strong>
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#D29922"
                mb={1}
              >
                Confidence: <strong>{result.confidence}</strong>
              </Typography>
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#E6EDF3"
                mb={1}
              >
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