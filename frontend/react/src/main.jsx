import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CommandProvider } from "./contexts/CommandContext";
import { LanguageProvider } from "./contexts/LanguageContext";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/bento.css";
import "./styles/compat.css";
import "./styles/dashboard.css";
import "./styles/screens.css";
import "./styles/proto.css";
import "./styles/lab.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <LanguageProvider>
        <CommandProvider>
          <App />
        </CommandProvider>
      </LanguageProvider>
    </BrowserRouter>
  </React.StrictMode>
);
