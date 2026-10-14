import { createTheme } from "@mui/material/styles";

export const theme = createTheme({
  palette: {
    mode: "light",
    primary: { main: "#1d1d1f" },
    secondary: { main: "#6c4bff" },
    background: { default: "#fbfbfd", paper: "#ffffff" },
  },
  shape: { borderRadius: 20 },
  typography: { fontFamily: '"Plus Jakarta Sans", sans-serif' },
  components: {
    MuiPaper: { styleOverrides: { root: { backgroundImage: "none", boxShadow: "0 1px 2px rgba(0,0,0,.04), 0 8px 30px rgba(0,0,0,.05)", border: "1px solid #e8e8ee" } } },
    MuiTableCell: { styleOverrides: { head: { fontSize: 12, fontWeight: 600, color: "#6e6e73" } } },
    MuiAccordion: { styleOverrides: { root: { boxShadow: "none", border: "1px solid #e8e8ee", marginBottom: 12, "&:before": { display: "none" } } } },
  },
});
