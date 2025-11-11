import React from "react";
import ReactDOM from "react-dom/client";
import App from "./app";
import { LoadingProvider } from "./context/LoadingContext";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <LoadingProvider>
      <App />
    </LoadingProvider>
  </React.StrictMode>
);
