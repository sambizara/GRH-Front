import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";

// Layouts
import LayoutAdmin from "./layouts/LayoutAdmin";
import LayoutSalarie from "./layouts/LayoutSalarie";
import LayoutStagiaire from "./layouts/LayoutStagiaire";

// Pages communes
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";

// Pages ADMIN
import Users from "./pages/admin/Users";
import Contrats from "./pages/admin/Contrats";
import Services from "./pages/admin/Service";
import Presence from "./pages/admin/Presence";
import Conges from "./pages/admin/Conges";
import Attestations from "./pages/admin/Attestations";
import Rapports from "./pages/admin/Rapport";
import Stages from "./pages/admin/Stage";

// Pages SALARIE
import ProfilSalarie from "./pages/salarie/Profil";
import MesConges from "./pages/salarie/MesConges";
import MesStagesEncadres from "./pages/salarie/MesStagesEncadres";
import MesAttestations from "./pages/salarie/MesAttestations";
import MesContrats from "./pages/salarie/MesContrats";

// Pages STAGIAIRE
import ProfilStagiaire from "./pages/stagiaire/Profil";
import MonStage from "./pages/stagiaire/MonStage";
import MesAttestationsStagiaire from "./pages/stagiaire/MesAttestations";
import MesRapports from "./pages/stagiaire/MesRapports";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth */}
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Login />} />

          {/* ================= ADMIN RH ================= */}
          <Route 
            path="/admin/*"
            element={
              <ProtectedRoute roles={["ADMIN_RH"]}>
                <LayoutAdmin />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="users" element={<Users />} />
            <Route path="contrats" element={<Contrats />} />
            <Route path="service" element={<Services />} />
            <Route path="presence" element={<Presence />} />
            <Route path="conges" element={<Conges />} />
            <Route path="stage" element={<Stages/>} />
            <Route path="attestations" element={<Attestations />} />
            <Route path="rapports" element={<Rapports />} />
          </Route>

          {/* ================= SALARIE ================= */}
          <Route 
            path="/salarie/*"
            element={
              <ProtectedRoute roles={["SALARIE"]}>
                <LayoutSalarie />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profil" element={<ProfilSalarie />} />
            <Route path="conges" element={<MesConges />} />
            <Route path="messtagesencadres" element={<MesStagesEncadres />} />
            <Route path="attestations" element={<MesAttestations />} />
            <Route path="contrats" element={<MesContrats />} />
          </Route>

          {/* ================= STAGIAIRE ================= */}
          <Route 
            path="/stagiaire/*"
            element={
              <ProtectedRoute roles={["STAGIAIRE"]}>
                <LayoutStagiaire />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<Dashboard />} />
            <Route path="profil" element={<ProfilStagiaire />} />
            <Route path="monstage" element={<MonStage />} />
            <Route path="attestations" element={<MesAttestationsStagiaire />} />
            <Route path="rapports" element={<MesRapports />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;