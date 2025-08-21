import {
  Drawer,
  Toolbar,
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import AssignmentIcon from "@mui/icons-material/Assignment";
import ListAltIcon from "@mui/icons-material/ListAlt";
import TimelineIcon from "@mui/icons-material/Timeline";
import InsightsIcon from "@mui/icons-material/Insights";
import RestoreIcon from "@mui/icons-material/Restore";

export default function Navbar({ drawerWidth = 260 }) {
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: "none", md: "block" },
        width: drawerWidth,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          background: "#0052CC",
          color: "#fff",
          borderRight: 0,
        },
      }}
      open
    >
      <Toolbar />
      <Box sx={{ px: 2, py: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700, letterSpacing: 0.3 }}>
          Scrumbot
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85 }}>
          AI Agile Assistant
        </Typography>
      </Box>
      <Divider sx={{ borderColor: "rgba(255,255,255,.2)" }} />
      <List dense>
        <ListItemButton sx={navItemSx}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <AssignmentIcon />
          </ListItemIcon>
          <ListItemText primary="Story Analyzer" />
        </ListItemButton>
        <ListItemButton sx={navItemSx}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <ListAltIcon />
          </ListItemIcon>
          <ListItemText primary="Backlog Grooming" />
        </ListItemButton>
        <ListItemButton sx={navItemSx}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <TimelineIcon />
          </ListItemIcon>
          <ListItemText primary="Estimation Assistant" />
        </ListItemButton>

        {/* Optional future entries */}
        <ListItemButton sx={navItemSx}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <InsightsIcon />
          </ListItemIcon>
          <ListItemText primary="Prioritization" />
        </ListItemButton>
        <ListItemButton sx={navItemSx}>
          <ListItemIcon sx={{ color: "inherit" }}>
            <RestoreIcon />
          </ListItemIcon>
          <ListItemText primary="Retrospective" />
        </ListItemButton>
      </List>
    </Drawer>
  );
}

const navItemSx = {
  mx: 1,
  my: 0.5,
  borderRadius: 2,
  color: "white",
  "&:hover": {
    backgroundColor: "rgba(255,255,255,.12)",
    transform: "translateX(2px)",
  },
};
