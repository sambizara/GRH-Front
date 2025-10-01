import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Conges() {
  const [conges, setConges] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les demandes de congés
  useEffect(() => {
    const fetchConges = async () => {
      try {
        const res = await api.get("/conges"); // 👈 appel API
        setConges(res.data);
      } catch (err) {
        console.error("Erreur chargement congés:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchConges();
  }, []);

  // Changer le statut (APPROUVE / REFUSE)
  const updateStatut = async (id, statut) => {
    try {
      const res = await api.put(`/conges/${id}`, { statut });
      setConges(conges.map(c => c._id === id ? res.data : c));
    } catch (err) {
      console.error("Erreur mise à jour:", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: "20px" }}>
          <h2>📅 Gestion des congés</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Employé</th>
                  <th>Type</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {conges.map((c) => (
                  <tr key={c._id}>
                    <td>{c.user?.nom} {c.user?.prenom}</td>
                    <td>{c.type}</td>
                    <td>{new Date(c.dateDebut).toLocaleDateString()}</td>
                    <td>{new Date(c.dateFin).toLocaleDateString()}</td>
                    <td>{c.statut}</td>
                    <td>
                      {c.statut === "EN_ATTENTE" && (
                        <>
                          <button onClick={() => updateStatut(c._id, "APPROUVE")}>
                            ✅ Approuver
                          </button>
                          <button onClick={() => updateStatut(c._id, "REFUSE")}>
                            ❌ Refuser
                          </button>
                        </>
                      )}
                    </td>
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
