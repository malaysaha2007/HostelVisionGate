import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import {
  GoogleOAuthProvider
} from "@react-oauth/google";

ReactDOM.createRoot(
  document.getElementById("root")
).render(

  <React.StrictMode>

    <GoogleOAuthProvider
      clientId="615531974414-9ejio80alq154o94asa4su4ou7iib4d1.apps.googleusercontent.com"
    >

      <App />

    </GoogleOAuthProvider>

  </React.StrictMode>

);