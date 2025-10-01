import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function MesAttestations() {
  const [attestations, setAttestations] = useState([]);
  const [type, setType] = useState("");

  useEffect(() => { fetchAttestations(); }, []);
  const fetchAttestations = async () => {
    const res = await api.get("/attestations/me");
    setAttestations(res.data);
  };

  const demander = async () => {
    await api.post("/attestations/salarie/demande", { type });
    setType("");
    fetchAttestations();
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📄 Mes attestations</h2>
          <input placeholder="Type" value={type} onChange={e=>setType(e.target.value)} />
          <button onClick={demander}>Demander</button>

          <ul style={{ marginTop: 20 }}>
            {attestations.map(a => (
              <li key={a._id}>
                {a.type} — {a.statut} ({new Date(a.createdAt).toLocaleDateString()})
              </li>
            ))}
          </ul>
        </main>
      </div>
    </div>
  );
}
