import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function ProfilStagiaire() {
  const [profil, setProfil] = useState(null);

  useEffect(() => {
    const fetchProfil = async () => {
      const res = await api.get("/users/me");
      setProfil(res.data);
    };
    fetchProfil();
  }, []);

  return (
    <div>
      <div style={{ display: "flex" }}>
        <main style={{ flex: 1, padding: 20 }}>
          <h2>🙍 Mon profil (stagiaire)</h2>
          {profil ? (
            <ul>
              <li><b>Nom :</b> {profil.nom}</li>
              <li><b>Prénom :</b> {profil.prenom}</li>
              <li><b>Email :</b> {profil.email}</li>
              <li><b>École :</b> {profil.ecole}</li>
              <li><b>Période :</b> {profil.dateDebutStage} ➝ {profil.dateFinStage}</li>
            </ul>
          ) : <p>Chargement...</p>}
        </main>
      </div>
    </div>
  );
}
