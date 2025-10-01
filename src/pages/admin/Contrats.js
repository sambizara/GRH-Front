import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Contrats() {
  const [contrats, setContrats] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Formulaire
  const initialForm = {
    userId: "",
    type: "CDI",
    dateDebut: "",
    dateFin: "",
    statut: "ACTIF"
  };
  const [form, setForm] = useState(initialForm);
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      setLoading(true);
      // récupère contrats (backend doit populater user)
      const [cRes, uRes] = await Promise.all([
        api.get("/contrats"),
        api.get("/users") // pour la sélection d'utilisateur (Admin only)
      ]);
      setContrats(cRes.data);
      setUsers(uRes.data);
    } catch (err) {
      console.error("Erreur chargement contrats/users:", err);
      alert("Erreur lors du chargement des contrats.");
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
  };

  const createContrat = async () => {
    if (!form.userId || !form.type || !form.dateDebut) {
      return alert("Remplis au moins l'utilisateur, le type et la date de début.");
    }
    try {
      const res = await api.post("/contrats", {
        userId: form.userId,
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin || null,
        statut: form.statut
      });
      setContrats([res.data, ...contrats]);
      resetForm();
    } catch (err) {
      console.error("Erreur création contrat:", err);
      alert("Impossible de créer le contrat.");
    }
  };

  const updateContrat = async () => {
    if (!editingId) return;
    try {
      const res = await api.put(`/contrats/${editingId}`, {
        type: form.type,
        dateDebut: form.dateDebut,
        dateFin: form.dateFin || null,
        statut: form.statut,
        userId: form.userId
      });
      setContrats(contrats.map(c => c._id === editingId ? res.data : c));
      resetForm();
    } catch (err) {
      console.error("Erreur mise à jour contrat:", err);
      alert("Impossible de mettre à jour le contrat.");
    }
  };

  const editClick = (c) => {
    setEditingId(c._id);
    setForm({
      userId: c.user?._id || "",
      type: c.type || "CDI",
      dateDebut: c.dateDebut ? new Date(c.dateDebut).toISOString().slice(0,10) : "",
      dateFin: c.dateFin ? new Date(c.dateFin).toISOString().slice(0,10) : "",
      statut: c.statut || "ACTIF"
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteContrat = async (id) => {
    if (!window.confirm("Supprimer ce contrat ?")) return;
    try {
      await api.delete(`/contrats/${id}`);
      setContrats(contrats.filter(c => c._id !== id));
    } catch (err) {
      console.error("Erreur suppression contrat:", err);
      alert("Impossible de supprimer le contrat.");
    }
  };

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>📑 Gestion des contrats (Admin RH)</h2>

          {/* Formulaire création / édition */}
          <section style={{ background: "#f7f7f7", padding: 12, borderRadius: 6, marginBottom: 20 }}>
            <h3>{editingId ? "Modifier un contrat" : "Créer un nouveau contrat"}</h3>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div>
                <label>Utilisateur (assigner)</label><br />
                <select name="userId" value={form.userId} onChange={handleChange} style={{ width: "100%" }}>
                  <option value="">-- Choisir un utilisateur --</option>
                  {users.map(u => (
                    <option key={u._id} value={u._id}>
                      {u.nom} {u.prenom} ({u.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label>Type</label><br />
                <select name="type" value={form.type} onChange={handleChange} style={{ width: "100%" }}>
                  <option value="CDI">CDI</option>
                  <option value="CDD">CDD</option>
                  <option value="AUTRE">AUTRE</option>
                </select>
              </div>

              <div>
                <label>Date début</label><br />
                <input type="date" name="dateDebut" value={form.dateDebut} onChange={handleChange} style={{ width: "100%" }} />
              </div>

              <div>
                <label>Date fin (optionnelle)</label><br />
                <input type="date" name="dateFin" value={form.dateFin} onChange={handleChange} style={{ width: "100%" }} />
              </div>

              <div>
                <label>Statut</label><br />
                <select name="statut" value={form.statut} onChange={handleChange} style={{ width: "100%" }}>
                  <option value="ACTIF">ACTIF</option>
                  <option value="TERMINE">TERMINE</option>
                  <option value="SUSPENDU">SUSPENDU</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: 12 }}>
              {editingId ? (
                <>
                  <button onClick={updateContrat}>💾 Enregistrer la modification</button>
                  <button onClick={resetForm} style={{ marginLeft: 8 }}>Annuler</button>
                </>
              ) : (
                <button onClick={createContrat}>➕ Créer le contrat</button>
              )}
            </div>
          </section>

          {/* Liste des contrats */}
          {loading ? (
            <p>Chargement...</p>
          ) : (
            <table border="1" cellPadding="8" style={{ width: "100%" }}>
              <thead>
                <tr>
                  <th>Utilisateur</th>
                  <th>Type</th>
                  <th>Date début</th>
                  <th>Date fin</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {contrats.map(c => (
                  <tr key={c._id}>
                    <td>{c.user ? `${c.user.nom} ${c.user.prenom}` : "—"}</td>
                    <td>{c.typeContrat}</td>
                    <td>{c.dateDebut ? new Date(c.dateDebut).toLocaleDateString() : "—"}</td>
                    <td>{c.dateFin ? new Date(c.dateFin).toLocaleDateString() : "—"}</td>
                    <td>{c.statut}</td>
                    <td>
                      <button onClick={() => editClick(c)}>✏️ Edit</button>
                      <button onClick={() => deleteContrat(c._id)} style={{ marginLeft: 8 }}>🗑 Supprimer</button>
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
