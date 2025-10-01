import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesPresences() {
  const [presences, setPresences] = useState([]);
  const [loading, setLoading] = useState(true);
  const [todayPresence, setTodayPresence] = useState(null);

  useEffect(() => {
    fetchPresences();
  }, []);

  const fetchPresences = async () => {
    try {
      setLoading(true);
      const res = await api.get("/presences/me"); // attendu backend
      setPresences(res.data);
      // cherche une présence d'aujourd'hui
      const today = new Date().toISOString().slice(0,10);
      const todayP = res.data.find(p => new Date(p.date).toISOString().slice(0,10) === today);
      setTodayPresence(todayP || null);
    } catch (err) {
      console.error("Erreur chargement présences:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pointer arrivée (crée une présence pour aujourd'hui)
  const pointerArrivee = async () => {
    try {
      const date = new Date();
      const body = {
        date: date.toISOString().slice(0,10),
        heureArrivee: date.toTimeString().slice(0,5),
        statut: "PRESENT"
      };
      const res = await api.post("/presences/me", body); // attendu backend
      setTodayPresence(res.data);
      setPresences(prev => [res.data, ...prev]);
    } catch (err) {
      console.error("Erreur pointage arrivée:", err);
      alert("Impossible de pointer l'arrivée.");
    }
  };

  // Pointer départ (met à jour la présence d'aujourd'hui)
  const pointerDepart = async () => {
    try {
      if (!todayPresence) return alert("Vous n'avez pas d'arrivée enregistrée aujourd'hui.");
      const date = new Date();
      const body = { heureDepart: date.toTimeString().slice(0,5) };
      // endpoint attendu : PUT /presences/me/:id/checkout ou PUT /presences/:id (selon backend)
      const res = await api.put(`/presences/${todayPresence._id}`, body);
      // mettre à jour localement
      setTodayPresence(res.data);
      setPresences(prev => prev.map(p => p._id === res.data._id ? res.data : p));
    } catch (err) {
      console.error("Erreur pointage départ:", err);
      alert("Impossible de pointer le départ.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📋 Mes présences</h2>

          <div style={{ marginBottom: 20 }}>
            <strong>Pointage rapide (aujourd'hui)</strong>
            <div style={{ marginTop: 8 }}>
              {todayPresence ? (
                <div>
                  <div>Arrivée : {todayPresence.heureArrivee || "-"}</div>
                  <div>Départ : {todayPresence.heureDepart || "-"}</div>
                  {!todayPresence.heureDepart && (
                    <button onClick={pointerDepart} style={{ marginTop: 8 }}>🕒 Pointer départ</button>
                  )}
                </div>
              ) : (
                <button onClick={pointerArrivee}>🕒 Pointer arrivée</button>
              )}
            </div>
          </div>

          <h3>Historique des présences</h3>
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: "100%", marginTop: 10 }}>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Heure arrivée</th>
                  <th>Heure départ</th>
                  <th>Statut</th>
                </tr>
              </thead>
              <tbody>
                {presences.map(p => (
                  <tr key={p._id}>
                    <td>{new Date(p.date).toLocaleDateString()}</td>
                    <td>{p.heureArrivee || "-"}</td>
                    <td>{p.heureDepart || "-"}</td>
                    <td>{p.statut}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </main>
      </div>
    </div>
  );
}
