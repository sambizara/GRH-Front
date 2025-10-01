import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Attestations() {
  const [attestations, setAttestations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger toutes les demandes
  useEffect(() => {
    const fetchAttestations = async () => {
      try {
        const res = await api.get("/attestations"); // Appelle la nouvelle route backend
        setAttestations(res.data);
      } catch (err) {
        console.error("Erreur chargement attestations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAttestations();
  }, []);

  // Générer une attestation
  const genererAttestation = async (id) => {
    try {
      const res = await api.put(`/attestations/generer/${id}`);
      setAttestations(attestations.map(a => a._id === id ? res.data : a));
    } catch (err) {
      console.error("Erreur génération:", err);
    }
  };

  // Télécharger (placeholder)
  const telecharger = async (id) => {
    try {
      const res = await api.get(`/attestations/download/${id}`);
      alert(res.data.message);
    } catch (err) {
      console.error("Erreur téléchargement:", err);
    }
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: "20px" }}>
          <h2>📄 Gestion des attestations</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table border="1" cellPadding="10" style={{ width: "100%", marginTop: "20px" }}>
              <thead>
                <tr>
                  <th>Demandeur</th>
                  <th>Rôle</th>
                  <th>Type</th>
                  <th>Statut</th>
                  <th>Date demande</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {attestations.map((a) => (
                  <tr key={a._id}>
                    <td>{a.user?.nom} {a.user?.prenom}</td>
                    <td>{a.user?.role}</td>
                    <td>{a.typeAttestation}</td>
                    <td>{a.statut}</td>
                    <td>{new Date(a.createdAt).toLocaleDateString()}</td>
                    <td>
                      {a.statut === "En Attente" && (
                        <button onClick={() => genererAttestation(a._id)}>
                          ⚙️ Générer
                        </button>
                      )}
                      {a.statut === "Approuvé" && (
                        <button onClick={() => telecharger(a._id)}>
                          ⬇️ Télécharger
                        </button>
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