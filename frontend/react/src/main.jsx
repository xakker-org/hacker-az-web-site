import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { CommandProvider } from "./contexts/CommandContext";

import "./styles/tokens.css";
import "./styles/base.css";
import "./styles/shell.css";
import "./styles/bento.css";
import "./styles/compat.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <CommandProvider>
        <App />
      </CommandProvider>
    </BrowserRouter>
  </React.StrictMode>
);
