import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function ProfilSalarie() {
  const [profil, setProfil] = useState(null);

  useEffect(() => {
    const fetchProfil = async () => {
      try {
        const res = await api.get("/users/me"); // endpoint backend pour profil connecté
        setProfil(res.data);
      } catch (err) {
        console.error("Erreur profil:", err);
      }
    };
    fetchProfil();
  }, []);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>🙍 Mon profil</h2>
          {profil ? (
            <ul>
              <li><b>Nom :</b> {profil.nom}</li>
              <li><b>Prénom :</b> {profil.prenom}</li>
              <li><b>Email :</b> {profil.email}</li>
              <li><b>Service :</b> {profil.service?.nomService || "-"}</li>
            </ul>
          ) : <p>Chargement...</p>}
        </main>
      </div>
    </div>
  );
}
