import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesConges() {
  const [conges, setConges] = useState([]);
  const [type, setType] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");

  useEffect(() => { fetchConges(); }, []);
  const fetchConges = async () => {
    const res = await api.get("/conges/me"); // congés de l’utilisateur connecté
    setConges(res.data);
  };

  const demander = async () => {
    await api.post("/conges", { type, dateDebut: debut, dateFin: fin });
    setType(""); setDebut(""); setFin("");
    fetchConges();
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📅 Mes congés</h2>
          <div>
            <input placeholder="Type de congé" value={type} onChange={e=>setType(e.target.value)} />
            <input type="date" value={debut} onChange={e=>setDebut(e.target.value)} />
            <input type="date" value={fin} onChange={e=>setFin(e.target.value)} />
            <button onClick={demander}>Demander</button>
          </div>

          <table border="1" cellPadding="6" style={{ marginTop: 20, width: "100%" }}>
            <thead><tr><th>Type</th><th>Début</th><th>Fin</th><th>Statut</th></tr></thead>
            <tbody>
              {conges.map(c => (
                <tr key={c._id}>
                  <td>{c.type}</td>
                  <td>{new Date(c.dateDebut).toLocaleDateString()}</td>
                  <td>{new Date(c.dateFin).toLocaleDateString()}</td>
                  <td>{c.statut}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </main>
      </div>
    </div>
  );
}
