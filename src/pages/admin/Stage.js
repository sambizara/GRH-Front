import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Stagiaires() {
  const [stagiaires, setStagiaires] = useState([]);
  const [services, setServices] = useState([]);
  const [form, setForm] = useState({ nom:"", prenom:"", email:"", motDePasse:"", ecole:"", dateDebutStage:"", dateFinStage:"", encadrant:"", serviceId:"" });

  useEffect(()=>{ fetch(); }, []);
  const fetch = async () => {
    const [sRes, stRes] = await Promise.all([api.get("/services"), api.get("/stagiaires")]);
    setServices(sRes.data);
    setStagiaires(stRes.data);
  };

  const create = async () => {
    await api.post("/stagiaires", { 
      nom: form.nom, prenom: form.prenom, email: form.email, motDePasse: form.motDePasse,
      ecole: form.ecole, dateDebutStage: form.dateDebutStage, dateFinStage: form.dateFinStage,
      encadrant: form.encadrant, serviceId: form.serviceId
    });
    setForm({ nom:"", prenom:"", email:"", motDePasse:"", ecole:"", dateDebutStage:"", dateFinStage:"", encadrant:"", serviceId:"" });
    fetch();
  };

  const assign = async (id, serviceId) => {
    await api.put(`/stagiaires/${id}/assign-service`, { serviceId });
    fetch();
  };

  return (
    <div>
      <div style={{ display:"flex" }}>
        <main style={{ flex:1, padding:20 }}>
          <h2>🎓 Gestion des stagiaires</h2>

          <h3>Ajouter stagiaire</h3>
          <input placeholder="Nom" value={form.nom} onChange={e=>setForm({...form,nom:e.target.value})}/>
          <input placeholder="Prénom" value={form.prenom} onChange={e=>setForm({...form,prenom:e.target.value})}/>
          <input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})}/>
          <input placeholder="Mot de passe" value={form.motDePasse} onChange={e=>setForm({...form,motDePasse:e.target.value})}/>
          <input placeholder="Ecole" value={form.ecole} onChange={e=>setForm({...form,ecole:e.target.value})}/>
          <input type="date" value={form.dateDebutStage} onChange={e=>setForm({...form,dateDebutStage:e.target.value})}/>
          <input type="date" value={form.dateFinStage} onChange={e=>setForm({...form,dateFinStage:e.target.value})}/>
          <input placeholder="Encadrant" value={form.encadrant} onChange={e=>setForm({...form,encadrant:e.target.value})}/>
          <select value={form.serviceId} onChange={e=>setForm({...form,serviceId:e.target.value})}>
            <option value="">--Choisir service--</option>
            {services.map(s=> <option key={s._id} value={s._id}>{s.nomService}</option>)}
          </select>
          <button onClick={create}>Créer</button>

          <h3>Liste des stagiaires</h3>
          <table border="1" cellPadding="6" style={{width:"100%"}}>
            <thead><tr><th>Nom</th><th>École</th><th>Service</th><th>Encadrant</th><th>Affecter</th></tr></thead>
            <tbody>
              {stagiaires.map(st => (
                <tr key={st._id}>
                  <td>{st.nom} {st.prenom}</td>
                  <td>{st.ecole}</td>
                  <td>{st.service?.nomService || "-"}</td>
                  <td>{st.encadrant}</td>
                  <td>
                    <select onChange={e=>assign(st._id, e.target.value)} defaultValue="">
                      <option value="">--Affecter--</option>
                      {services.map(s=> <option key={s._id} value={s._id}>{s.nomService}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

        </main>
      </div>
    </div>
  );
}
