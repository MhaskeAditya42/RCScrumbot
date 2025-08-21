import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { Box, Container, Grid, Toolbar, Typography } from "@mui/material";
import Navbar from "./components/Navbar";
import StoryAssistant from "./components/StoryAssistant";
import BacklogAssistant from "./components/BacklogAssistant";
import EstimationAssistant from "./components/EstimationAssistant";
import PrioritizationAssistant from "./components/PrioritizationAssistant";
import RetrospectiveAssistant from "./components/RetrospectiveAssistant";

const theme = createTheme({
  palette: {
    primary: { main: "#0052CC" }, // Jira-inspired blue
    secondary: { main: "#172B4D" }, // Slate accent
    background: { default: "#F4F5F7", paper: "#FFFFFF" },
  },
  typography: {
    fontFamily: "Inter, Roboto, Arial, sans-serif",
    h5: { fontWeight: 600 },
    body1: { lineHeight: 1.65 },
    button: { textTransform: "none", fontWeight: 600 },
  },
  shape: { borderRadius: 12 },
  components: {
    MuiCard: { styleOverrides: { root: { transition: "all .25s ease" } } },
  },
});

const drawerWidth = 260;

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box sx={{ display: "flex", minHeight: "100vh" }}>
        {/* Sidebar */}
        <Navbar drawerWidth={drawerWidth} />

        {/* Main content */}
        <Box component="main" sx={{ flexGrow: 1, p: { xs: 2, md: 4 } }}>
          <Toolbar />

          <Container maxWidth="lg">
            {/* Page Title */}
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 700 }}>
              Agile Assistant Dashboard
            </Typography>

            <Grid container spacing={4}>
              {/* Row 1: Story & Backlog */}
              <Grid item xs={12} md={6}>
                <StoryAssistant />
              </Grid>
              <Grid item xs={12} md={6}>
                <BacklogAssistant />
              </Grid>

              {/* Row 2: Estimation & Prioritization */}
              <Grid item xs={12} md={6}>
                <EstimationAssistant />
              </Grid>
              <Grid item xs={12} md={6}>
                <PrioritizationAssistant />
              </Grid>

              {/* Row 3: Retrospective (full width) */}
              <Grid item xs={12}>
                <RetrospectiveAssistant />
              </Grid>
            </Grid>
          </Container>
        </Box>
      </Box>
    </ThemeProvider>
  );
}
