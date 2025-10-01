import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesContrats() {
  const [contrats, setContrats] = useState([]);

  useEffect(() => {
    const fetchContrats = async () => {
      const res = await api.get("/contrats/me");
      setContrats(res.data);
    };
    fetchContrats();
  }, []);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📑 Mes contrats</h2>
          <ul>
            {contrats.map(c => (
              <li key={c._id}>
                {c.typeContrat} — {c.statut} ({new Date(c.dateDebut).toLocaleDateString()} ➝ {new Date(c.dateFin).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
