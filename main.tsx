import React from "react"; 
import ReactDOM from "react-dom/client";
import "./styles/editor.css";
import EditorLayout from "./layout/EditorLayout";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <EditorLayout />
  </React.StrictMode>
);
