import { useState } from "react";
import { runRetro } from "../api";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  List,
  ListItem,
  ListItemText,
  Stack,
} from "@mui/material";
import { History } from "lucide-react";

export default function RetrospectiveAssistant() {
  const [file, setFile] = useState(null);
  const [result, setResult] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await runRetro(formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    setResult(res.data);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#121212",
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
          bgcolor: "#1E1E1E",
          border: "1px solid #333",
        }}
      >
        <CardContent>
          {/* Header */}
          <Stack direction="row" alignItems="center" justifyContent="center" spacing={1.5} mb={4}>
            <History className="w-7 h-7 text-indigo-300" />
            <Typography variant="h4" fontWeight={700} color="#FFFFFF">
              Retrospective Assistant
            </Typography>
          </Stack>

          {/* File Upload */}
          <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Button variant="outlined" component="label" sx={{ color: "#FFFFFF", borderColor: "#555" }}>
              Upload Transcript (.txt)
              <input type="file" hidden accept=".txt" onChange={handleFileChange} />
            </Button>

            <Button
              type="submit"
              variant="contained"
              size="large"
              sx={{
                borderRadius: 3,
                fontWeight: 600,
                alignSelf: "center",
                px: 5,
                bgcolor: "#3949AB",
                color: "#FFFFFF",
                "&:hover": { bgcolor: "#5C6BC0" },
              }}
              disabled={!file}
            >
              Analyze Retro
            </Button>
          </Box>

          {/* Result */}
          {/* Result */}
          {result && (
            <Box
              mt={5}
              display="flex"
              flexDirection="column"
              gap={3} // spacing between sections
              sx={{ minHeight: "80vh" }} // increase outer box height
            >
              {/* Risks Section */}
              <Box
                p={3}
                borderRadius={3}
                sx={{
                  background: "linear-gradient(135deg, #FF6B6B, #FF8E53)", // red-orange gradient
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#FFFFFF" mb={2}>
                  Risks
                </Typography>
                <List>
                  {result.risks.map((risk, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText
                        primary={`• ${risk}`}
                        primaryTypographyProps={{ color: "#FFFFFF" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Sprint Notes Section */}
              <Box
                p={3}
                borderRadius={3}
                sx={{
                  background: "linear-gradient(135deg, #42A5F5, #478ED1)", // blue gradient
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#FFFFFF" mb={2}>
                  Sprint Notes
                </Typography>
                <List>
                  {result.sprint_notes.map((note, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText
                        primary={`• ${note}`}
                        primaryTypographyProps={{ color: "#FFFFFF" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Overall Sprint Track Section */}
              <Box
                p={3}
                borderRadius={3}
                sx={{
                  background: "linear-gradient(135deg, #66BB6A, #43A047)", // green gradient
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#FFFFFF" mb={2}>
                  Anti-Patterns
                </Typography>
                <List>
                  {result.anti_patterns.map((note, i) => (
                    <ListItem key={i} disablePadding>
                      <ListItemText
                        primary={`• ${note}`}
                        primaryTypographyProps={{ color: "#FFFFFF" }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>

              {/* Coaching Nugget Section */}
              <Box
                p={3}
                borderRadius={3}
                sx={{
                  background: "linear-gradient(135deg, #FFD54F, #FFA000)", // yellow-orange gradient
                }}
              >
                <Typography variant="h6" fontWeight={700} color="#000000" mb={2}>
                  Coaching Nugget
                </Typography>
                <Typography color="#000000">{result.coaching_nugget}</Typography>
              </Box>
            </Box>
          )}



        </CardContent>
      </Card>
    </Box>
  );
}
