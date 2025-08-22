import { useState } from "react";
import { runRetro } from "../api";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import { History } from "lucide-react";

export default function RetrospectiveAssistant() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const notesArray = notes
      .split("\n")
      .map((note) => note.trim())
      .filter((note) => note.length > 0);

    const res = await runRetro({ sprint_notes: notesArray });
    setResult(res.data);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#121212", // Dark background
        px: 2,
      }}
    >
      <Card
        sx={{
          maxWidth: 700,
          width: "100%",
          borderRadius: 4,
          boxShadow: 6,
          p: 4,
          bgcolor: "#1E1E1E", // Darker card background
          border: "1px solid #333",
        }}
      >
        <CardContent>
          {/* Header */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="center"
            spacing={1.5}
            mb={4}
          >
            <History className="w-7 h-7 text-indigo-300" /> {/* Lighter indigo for icon */}
            <Typography variant="h4" fontWeight={700} color="#FFFFFF">
              Retrospective Assistant
            </Typography>
          </Stack>

          {/* Form */}
          <Box
            component="form"
            onSubmit={handleSubmit}
            sx={{ display: "flex", flexDirection: "column", gap: 3 }}
          >
            <TextField
              multiline
              rows={6}
              label="Enter sprint notes (one per line)"
              placeholder="Deployment was delayed due to CI/CD issues\nTeam communication improved\nTesting took longer than expected"
              variant="outlined"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
              sx={{
                "& .MuiOutlinedInput-root": {
                  color: "#FFFFFF", // White text
                  "& fieldset": { borderColor: "#555" }, // Subtle border
                  "&:hover fieldset": { borderColor: "#888" },
                  "&.Mui-focused fieldset": { borderColor: "#8AB4F8" }, // Light blue when focused
                },
                "& .MuiInputLabel-root": { color: "#BBBBBB" }, // Light gray label
                "& .MuiInputLabel-root.Mui-focused": { color: "#8AB4F8" }, // Light blue when focused
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                alignSelf: "center",
                px: 5,
                bgcolor: "#3949AB", // Indigo button
                color: "#FFFFFF", // White text
                "&:hover": { bgcolor: "#5C6BC0" }, // Lighter indigo on hover
                "&:disabled": { bgcolor: "#333", color: "#666" }, // Disabled state
              }}
              disabled={!notes.trim()}
            >
              Summarize Retro
            </Button>
          </Box>

          {/* Result */}
          {result && (
            <Box
              mt={5}
              p={3}
              border="1px solid"
              borderColor="#333" // Darker border
              borderRadius={3}
              bgcolor="#252525" // Slightly lighter dark background
            >
              <Typography
                variant="subtitle1"
                fontWeight={600}
                color="#FFFFFF" // White text
                mb={2}
              >
                Summary:
              </Typography>
              <Typography color="#E0E0E0" mb={3}> {/* Light gray for readability */}
                {result.summary}
              </Typography>

              {result.action_items && result.action_items.length > 0 && (
                <>
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    color="#FFFFFF" // White text
                    mb={2}
                  >
                    Action Items:
                  </Typography>
                  <List>
                    {result.action_items.map((item, index) => (
                      <ListItem key={index} disablePadding>
                        <ListItemText
                          primary={`• ${item}`}
                          primaryTypographyProps={{ color: "#E0E0E0" }} // Light gray
                        />
                      </ListItem>
                    ))}
                  </List>
                </>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}