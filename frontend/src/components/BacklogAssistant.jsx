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
    // Split by lines, remove empty lines
    const taskArray = tasks
      .split("\n")
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const res = await groomBacklog({ items: taskArray });
    setResult(res.data);
  };

  return (
    <Card sx={{ maxWidth: 700, mx: "auto", borderRadius: 3, boxShadow: 4 }}>
      <CardContent>
        {/* Header */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={2}
          justifyContent="center"
          mb={3}
        >
          <Wand2 className="w-6 h-6 text-indigo-600" />
          <Typography variant="h5" fontWeight={600} color="text.primary">
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
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              startIcon={<Wand2 className="w-5 h-5" />}
              sx={{ borderRadius: 2, fontWeight: 600 }}
              disabled={!tasks.trim()}
            >
              Groom Backlog
            </Button>
          </Stack>
        </form>

        {/* Result */}
        {result && (
          <Box mt={4}>
            <Typography variant="subtitle1" fontWeight={600} color="indigo.700" mb={2}>
              Refined Backlog:
            </Typography>
            <Stack spacing={2}>
              {result.refined_backlog.map((item, index) => (
                <Card key={index} variant="outlined" sx={{ p: 2 }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1}>
                    <Chip label={item.category} color="primary" size="small" />
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.item}
                    </Typography>
                  </Stack>
                  <Typography variant="body2">{item.note}</Typography>
                </Card>
              ))}
            </Stack>

            {result.duplicates && result.duplicates.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600} color="error">
                  Duplicates:
                </Typography>
                <ul>
                  {result.duplicates.map((dup, i) => (
                    <li key={i}>{dup}</li>
                  ))}
                </ul>
              </Box>
            )}

            {result.dependencies && result.dependencies.length > 0 && (
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight={600} color="secondary.main">
                  Dependencies:
                </Typography>
                <ul>
                  {result.dependencies.map((dep, i) => (
                    <li key={i}>{dep}</li>
                  ))}
                </ul>
              </Box>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
