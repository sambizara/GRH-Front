import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Rapports() {
  const [rapports, setRapports] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger tous les rapports
  useEffect(() => {
    const fetchRapports = async () => {
      try {
        const res = await api.get("/rapports");
        setRapports(res.data);
      } catch (err) {
        console.error("Erreur chargement rapports:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRapports();
  }, []);

  // Mettre à jour le statut
  const updateStatut = async (id, statut) => {
    try {
      const res = await api.put(`/rapports/${id}`, { statut });
      setRapports(rapports.map(r => r._id === id ? res.data : r));
    } catch (err) {
      console.error("Erreur mise à jour rapport:", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: "20px" }}>
          <h2>📘 Gestion des rapports</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Stagiaire</th>
                  <th>Titre</th>
                  <th>Fichier</th>
                  <th>Date dépôt</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {rapports.map((r) => (
                  <tr key={r._id}>
                    <td>{r.user?.nom} {r.user?.prenom}</td>
                    <td>{r.titre}</td>
                    <td>
                      <a href={r.fichier} target="_blank" rel="noreferrer">
                        📄 Télécharger
                      </a>
                    </td>
                    <td>{new Date(r.dateDepot).toLocaleDateString()}</td>
                    <td>{r.statut}</td>
                    <td>
                      {r.statut === "EN_ATTENTE" && (
                        <>
                          <button onClick={() => updateStatut(r._id, "VALIDE")}>
                            ✅ Valider
                          </button>
                          <button onClick={() => updateStatut(r._id, "REFUSE")}>
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
