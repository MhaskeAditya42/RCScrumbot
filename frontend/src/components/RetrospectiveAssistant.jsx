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
} from "@mui/material";

export default function RetrospectiveAssistant() {
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Split by new lines and remove empty lines
    const notesArray = notes
      .split("\n")
      .map((note) => note.trim())
      .filter((note) => note.length > 0);

    const res = await runRetro({ sprint_notes: notesArray });
    setResult(res.data);
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "20px auto", borderRadius: 3, boxShadow: 3 }}>
      <CardContent>
        <Typography variant="h5" gutterBottom fontWeight="bold">
          Retrospective Assistant
        </Typography>

        <Box
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: "flex", flexDirection: "column", gap: 2 }}
        >
          <TextField
            multiline
            rows={6}
            label="Enter sprint notes (one per line)"
            placeholder="Deployment was delayed due to CI/CD issues\nTeam communication improved\nTesting took longer than expected"
            variant="outlined"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            sx={{
              backgroundColor: "#1976d2",
              "&:hover": { backgroundColor: "#115293" },
              borderRadius: 2,
            }}
          >
            Summarize Retro
          </Button>
        </Box>

        {result && (
          <Box
            mt={3}
            p={2}
            sx={{
              border: "1px solid #e0e0e0",
              borderRadius: 2,
              backgroundColor: "#f9f9f9",
            }}
          >
            <Typography variant="subtitle1" fontWeight="bold" mb={1}>
              Summary:
            </Typography>
            <Typography variant="body2" mb={2}>
              {result.summary}
            </Typography>

            {result.action_items && result.action_items.length > 0 && (
              <>
                <Typography variant="subtitle1" fontWeight="bold" mb={1}>
                  Action Items:
                </Typography>
                <List>
                  {result.action_items.map((item, index) => (
                    <ListItem key={index} disablePadding>
                      <ListItemText primary={`• ${item}`} />
                    </ListItem>
                  ))}
                </List>
              </>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
