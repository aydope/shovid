import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ThemeProvider, CssBaseline } from "@mui/material";
import App from "./App";
import { AppProvider } from "./auth";
import { CartProvider } from "./store";
import { loadImages } from "./images";
import { theme } from "./theme";
import { ToastProvider } from "./toast";
import "./index.css";

void loadImages().finally(() => {
  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline enableColorScheme />
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <MotionConfig reducedMotion="user">
          <ToastProvider>
            <AppProvider>
              <CartProvider>
                <App />
              </CartProvider>
            </AppProvider>
          </ToastProvider>
          </MotionConfig>
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>,
  );
});
