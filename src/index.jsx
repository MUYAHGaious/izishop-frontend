import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/tailwind.css";
import "./styles/index.css";
// Auto-load project console logger - saves to backend/debug-logs/ folder
import "./utils/projectConsoleLogger";

const container = document.getElementById("root");
const root = createRoot(container);

root.render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <App />
  </BrowserRouter>
);
