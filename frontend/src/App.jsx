import { useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import {
  Box,
  Container,
  Grid,
  Toolbar,
  Typography,
  Card,
  CardContent,
  Button,
} from "@mui/material";
import StoryAssistant from "./components/StoryAssistant";
import BacklogAssistant from "./components/BacklogAssistant";
import EstimationAssistant from "./components/EstimationAssistant";
import RetrospectiveAssistant from "./components/RetrospectiveAssistant";
import PrioritizationAssistant from "./components/PrioritizationAssistant";


const theme = createTheme({
  palette: {
    background: { default: "#0D1117", paper: "#161B22" }, // dark bg like screenshot
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h5: { fontWeight: 600 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 16 },
});

export default function App() {
  const [activeSection, setActiveSection] = useState(null);

  const sections = [
    {
      key: "story",
      title: "Story Analyzer",
      description:
        "Quickly review and summarize your user stories, highlighting key details and improvements.",
      gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      component: <StoryAssistant />,
    },
    {
      key: "backlog",
      title: "Backlog Grooming",
      description:
        "Organize, prioritize, and refine your backlog with actionable insights for smoother sprint planning.",
      gradient: "linear-gradient(135deg, #f7971e 0%, #ffd200 100%)",
      component: <BacklogAssistant />,
    },
    {
      key: "estimation",
      title: "Estimation",
      description:
        "Estimate story points and effort collaboratively to plan sprints efficiently.",
      gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
      component: <EstimationAssistant />,
    },
    {
      key: "retrospective",
      title: "Retrospective",
      description:
        "Reflect on your sprint, gather feedback, and identify improvements to help your team grow.",
      gradient: "linear-gradient(135deg, #da22ff 0%, #9733ee 100%)",
      component: <RetrospectiveAssistant />,
    },
    {
      key: "prioritization",
      title: "Prioritization",
      description:
        "Rank tasks and stories based on value, urgency, and effort to maximize delivery impact.",
      gradient: "linear-gradient(135deg, #ff7e5f 0%, #feb47b 100%)", // 🔶 Orange gradient
      component: <PrioritizationAssistant />, // <-- make sure you import this
    },
  ];

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ minHeight: "100vh", p: { xs: 2, md: 6 } }}>
        <Toolbar />
        <Container maxWidth="lg">
          {!activeSection ? (
            <>
              <Typography
                variant="h4"
                gutterBottom
                sx={{ fontWeight: 700, color: "#fff", textAlign: "center", mb: 4 }}
              >
                AI-gility, Developed by GAS-IT-Pune
              </Typography>

              {/* 2x2 Grid */}
              <Grid container spacing={4} justifyContent="center">
                {sections.map((section) => (
                  <Grid item xs={12} md={6} key={section.key}>
                    <Card
                      sx={{
                        background: section.gradient,
                        color: "#fff",
                        borderRadius: "24px",
                        boxShadow: 6,
                        height: "100%",
                        maxWidth: 500,              // 🔹 keeps card width controlled
                        mx: "auto",                 // 🔹 center horizontally
                        p: 3,                       // 🔹 internal padding
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                      }}
                    >
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                          {section.title}
                        </Typography>
                        <Typography variant="body2" gutterBottom sx={{ mb: 2 }}>
                          {section.description}
                        </Typography>
                        <Button
                          variant="contained"
                          sx={{
                            mt: 1,
                            bgcolor: "rgba(255,255,255,0.9)",
                            color: "#000",
                            fontWeight: "bold",
                            borderRadius: "20px",
                            px: 3,
                            "&:hover": { bgcolor: "rgba(255,255,255,1)" },
                          }}
                          onClick={() => setActiveSection(section.key)}
                        >
                          Open →
                        </Button>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </>
          ) : (
            <>
              <Button
                variant="outlined"
                sx={{ mb: 2, color: "#fff", borderColor: "#fff" }}
                onClick={() => setActiveSection(null)}
              >
                ← Back to Dashboard
              </Button>
              {sections.find((s) => s.key === activeSection)?.component}
            </>
          )}
        </Container>
      </Box>
    </ThemeProvider>
  );
}