import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MonStage() {
  const [stage, setStage] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStage();
  }, []);

  const fetchStage = async () => {
    try {
      setLoading(true);
      const res = await api.get("/users/me"); // récupère ecole, dateDebutStage, dateFinStage, encadrant, service
      setStage(res.data);
    } catch (err) {
      console.error("Erreur chargement stage:", err);
    } finally {
      setLoading(false);
    }
  };

  const daysRemaining = () => {
    if (!stage?.dateFinStage) return null;
    const end = new Date(stage.dateFinStage);
    const now = new Date();
    const diff = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return diff;
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>🎓 Mon stage</h2>

          {loading ? (
            <p>Chargement...</p>
          ) : !stage ? (
            <p>Informations de stage non trouvées.</p>
          ) : (
            <div>
              <ul>
                <li><b>École :</b> {stage.ecole || "-"}</li>
                <li><b>Période :</b> {stage.dateDebutStage ? new Date(stage.dateDebutStage).toLocaleDateString() : "-"} ➝ {stage.dateFinStage ? new Date(stage.dateFinStage).toLocaleDateString() : "-"}</li>
                <li><b>Encadrant :</b> {stage.encadrant || "-"}</li>
                <li><b>Service :</b> {stage.service?.nomService || "-"}</li>
              </ul>

              {stage.dateFinStage && (
                <div style={{ marginTop: 10 }}>
                  <strong>Jours restants :</strong> {daysRemaining() >= 0 ? `${daysRemaining()} jours` : "Stage terminé"}
                </div>
              )}

              <div style={{ marginTop: 16 }}>
                <button onClick={() => window.location.href = "/stagiaire/rapports"}>📤 Déposer un rapport</button>
                {stage.encadrant && (
                  <a style={{ marginLeft: 12 }} href={`mailto:${stage.encadrant}`} >
                    ✉️ Contacter l'encadrant
                  </a>
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
