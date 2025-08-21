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
  const [result, setResult] = useState(null); // store full object

  const handleSubmit = async (e) => {
    e.preventDefault();
    const res = await estimateTask({ story_text: task });
    setResult(res.data.estimate); // store the estimate object
  };

  return (
    <Card sx={{ maxWidth: 600, mx: "auto", borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={1}
          mb={3}
        >
          <Clock className="w-6 h-6 text-indigo-600" />
          <Typography variant="h5" fontWeight={600} color="text.primary">
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
            />
            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{ px: 4, borderRadius: 2, fontWeight: 600 }}
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
            borderColor="indigo.200"
            borderRadius={2}
            bgcolor="indigo.50"
          >
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
              Story Points: <strong>{result.story_points}</strong>
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
              Confidence: <strong>{result.confidence}</strong>
            </Typography>
            <Typography variant="subtitle1" fontWeight={600} color="text.primary" mb={1}>
              Rationale:
            </Typography>
            <Typography color="text.secondary">{result.rationale}</Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
