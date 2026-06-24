import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";

const App = lazy(() => import("./App"));

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-slate-900 font-sans text-yellow-400">
          Yükleniyor...
        </div>
      }
    >
      <App />
    </Suspense>
  </React.StrictMode>
);
