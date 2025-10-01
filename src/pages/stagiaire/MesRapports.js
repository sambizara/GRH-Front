import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesRapports() {
  const [rapports, setRapports] = useState([]);
  const [titre, setTitre] = useState("");
  const [fichier, setFichier] = useState("");

  useEffect(() => { fetchRapports(); }, []);
  const fetchRapports = async () => {
    const res = await api.get("/rapports/me");
    setRapports(res.data);
  };

  const deposer = async () => {
    await api.post("/rapports", { titre, fichier });
    setTitre(""); setFichier("");
    fetchRapports();
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📘 Mes rapports</h2>
          <input placeholder="Titre" value={titre} onChange={e=>setTitre(e.target.value)} />
          <input placeholder="Nom du fichier (pdf...)" value={fichier} onChange={e=>setFichier(e.target.value)} />
          <button onClick={deposer}>Déposer</button>

          <ul style={{ marginTop: 20 }}>
            {rapports.map(r => (
              <li key={r._id}>
                {r.titre} — {r.statut} ({new Date(r.dateDepot).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
