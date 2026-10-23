import { useState, useCallback } from "react";
import Sidebar from "./components/Sidebar.jsx";
import Tester from "./components/Tester.jsx";
import Dashboard from "./components/Dashboard.jsx";
import Reports from "./components/Reports.jsx";
import SavedRequests from "./components/SavedRequests.jsx";
import { ToastStack, useToasts } from "./components/Toast.jsx";
import { getSavedRequests } from "./storage.js";

export default function App() {
  const [active, setActive] = useState("tester");
  const [savedRequests, setSavedRequests] = useState(getSavedRequests());
  const [pendingLoad, setPendingLoad] = useState(null);
  const { toasts, push } = useToasts();

  const refreshSaved = useCallback(() => setSavedRequests(getSavedRequests()), []);

  function loadSavedIntoTester(entry) {
    setPendingLoad(entry);
    setActive("tester");
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg text-text-primary">
      <Sidebar active={active} onNavigate={setActive} />

      <main className="flex-1 min-w-0 overflow-hidden">
        {active === "tester" && (
          <Tester pendingLoad={pendingLoad} onConsumeLoad={() => setPendingLoad(null)} notify={push} />
        )}
        {active === "dashboard" && <Dashboard />}
        {active === "reports" && <Reports />}
        {active === "saved" && (
          <SavedRequests requests={savedRequests} onRefresh={refreshSaved} onLoad={loadSavedIntoTester} />
        )}
      </main>

      <ToastStack toasts={toasts} />
    </div>
  );
}
