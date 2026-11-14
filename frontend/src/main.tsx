import { HardwareProvider } from "./features/hardware/state";
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource/be-vietnam-pro/400.css";
import "@fontsource/be-vietnam-pro/500.css";
import "@fontsource/be-vietnam-pro/600.css";
import "@fontsource/be-vietnam-pro/700.css";
import "./i18n";
import "./styles/index.css";
import { AppProvider } from "./core/state";
import App from "./app/App";
import { AnalysisProvider } from "./features/analysis/state";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AppProvider>
        <HardwareProvider>
          <AnalysisProvider><App /></AnalysisProvider>
        </HardwareProvider>
      </AppProvider>
    </BrowserRouter>
  </React.StrictMode>,
);
