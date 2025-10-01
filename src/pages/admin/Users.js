import React, { useEffect, useState } from "react";
import api from "../../api/axiosConfig";

export default function Users() {
  const [users, setUsers] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState(null);
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    sexe: "Homme",
    role: "SALARIE",
    motDePasse: "",
    service: "",
  });

  // Charger les utilisateurs ET les services
  useEffect(() => {
    fetchUsers();
    fetchServices();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data);
    } catch (error) {
      console.error("Erreur chargement utilisateurs:", error);
      alert("Erreur lors du chargement des utilisateurs");
    } finally {
      setLoading(false);
    }
  };

  // Charger la liste des services
  const fetchServices = async () => {
    try {
      const response = await api.get("/services");
      setServices(response.data);
    } catch (error) {
      console.error("Erreur chargement services:", error);
      alert("Erreur lors du chargement des services");
    }
  };
  // Recherche et filtrage
  const filteredUsers = users.filter(user =>
    user.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.prenom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.service && user.service.nom?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Gestion du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Réinitialiser le formulaire
  const resetForm = () => {
    setForm({
      nom: "",
      prenom: "",
      email: "",
      sexe: "Homme",
      role: "SALARIE",
      motDePasse: "",
      service: ""
    });
    setEditingUser(null);
    setShowForm(false);
  };

  // Vérifier si le service est requis
  const isServiceRequired = () => {
    return form.role === "SALARIE" || form.role === "STAGIAIRE";
  };

  // Ajouter un utilisateur
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation des champs obligatoires
    if (!form.nom || !form.prenom || !form.email || !form.role) {
      alert("Veuillez remplir tous les champs obligatoires");
      return;
    }

    if (!form.sexe || !["Homme", "Femme"].includes(form.sexe)) {
      alert("Veuillez sélectionner un sexe valide (Homme ou Femme)");
      return;
    }

    // Validation du service pour salarié et stagiaire
    if (isServiceRequired() && !form.service) {
      alert("Veuillez sélectionner un service pour un salarié ou stagiaire");
      return;
    }

    if (!editingUser && !form.motDePasse) {
      alert("Veuillez saisir un mot de passe pour le nouvel utilisateur");
      return;
    }

    try {
      const userData = {
        nom: form.nom,
        prenom: form.prenom,
        email: form.email,
        sexe: form.sexe,
        role: form.role,
        motDePasse: form.motDePasse
      };

      // Ajouter le service seulement si requis
      if (isServiceRequired() && form.service) {
        userData.service = form.service;
      }

      console.log("📤 Données envoyées:", userData);

      if (editingUser) {
        // Modification
        await api.put(`/users/${editingUser._id}`, userData);
        alert("Utilisateur modifié avec succès");
      } else {
        // Création
        await api.post("/users", userData);
        alert("Utilisateur créé avec succès");
      }
      
      resetForm();
      fetchUsers();
    } catch (error) {
      console.error("Erreur:", error);
      alert(error.response?.data?.message || "Erreur lors de l'opération");
    }
  };

  // Modifier un utilisateur
  const handleEdit = (user) => {
    console.log("✏️ Modification user:", user);
    setEditingUser(user);
    setForm({
      nom: user.nom,
      prenom: user.prenom,
      email: user.email,
      sexe: user.sexe,
      role: user.role,
      motDePasse: "", // Mot de passe vide pour l'édition
      service: user.service?._id || user.service || "" // Service existant
    });
    setShowForm(true);
  };

  // Supprimer un utilisateur
  const handleDelete = async (user) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer l'utilisateur ${user.nom} ${user.prenom} ?`)) {
      return;
    }

    try {
      await api.delete(`/users/${user._id}`);
      alert("Utilisateur supprimé avec succès");
      fetchUsers();
    } catch (error) {
      console.error("Erreur suppression:", error);
      alert("Erreur lors de la suppression");
    }
  };

  return (
    <div style={{ padding: "20px" }}>

      

      {/* En-tête avec bouton d'ajout et recherche */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "30px",
        flexWrap: "wrap",
        gap: "15px"
      }}>
        <h1 style={{ margin: 0, color: "#2c3e50" }}>👥 Gestion des Utilisateurs</h1>
        
        <div style={{ display: "flex", gap: "15px", alignItems: "center", flexWrap: "wrap" }}>
          {/* Barre de recherche */}
          <div style={{ position: "relative" }}>
            <input
              type="text"
              placeholder="Rechercher un utilisateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                padding: "10px 40px 10px 15px",
                border: "1px solid #ddd",
                borderRadius: "6px",
                width: "250px",
                fontSize: "14px"
              }}
            />
            <span style={{
              position: "absolute",
              right: "12px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#7f8c8d"
            }}>
              🔍
            </span>
          </div>

          {/* Bouton Ajouter */}
          <button
            onClick={() => setShowForm(true)}
            style={{
              background: "#27ae60",
              color: "white",
              border: "none",
              padding: "10px 20px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "bold",
              display: "flex",
              alignItems: "center",
              gap: "8px"
            }}
          >
            ➕ Ajouter un utilisateur
          </button>
        </div>
      </div>

      {/* Formulaire d'ajout/modification */}
      {showForm && (
        <div style={{
          background: "#f8f9fa",
          padding: "25px",
          borderRadius: "10px",
          marginBottom: "30px",
          border: "1px solid #e9ecef"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "20px", color: "#2c3e50" }}>
            {editingUser ? "✏️ Modifier l'utilisateur" : "➕ Ajouter un nouvel utilisateur"}
          </h3>
          
          <form onSubmit={handleSubmit} style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "15px"
          }}>
            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Nom *</label>
              <input
                type="text"
                name="nom"
                value={form.nom}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Prénom *</label>
              <input
                type="text"
                name="prenom"
                value={form.prenom}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Email *</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>
            <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Sexe *</label>
                <select
                  name="sexe"
                  value={form.sexe}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    background: "white"
                  }}
                >
                  <option value="Homme">Homme</option>
                  <option value="Femme">Femme</option>
                </select>
            </div>

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>Rôle *</label>
              <select
                name="role"
                value={form.role}
                onChange={handleInputChange}
                required
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px",
                  background: "white"
                }}
              >
                <option value="SALARIE">Salarié</option>
                <option value="ADMIN_RH">Admin RH</option>
                <option value="STAGIAIRE">Stagiaire</option>
              </select>
            </div>

            {/* Sélection du service - Conditionnel */}
            {(form.role === "SALARIE" || form.role === "STAGIAIRE") && (
              <div>
                <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                  Service {services.length > 0 ? "*" : "(Aucun service disponible)"}
                </label>
                <select
                  name="service"
                  value={form.service}
                  onChange={handleInputChange}
                  required={services.length > 0}
                  disabled={services.length === 0}
                  style={{
                    width: "100%",
                    padding: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "4px",
                    fontSize: "14px",
                    background: services.length === 0 ? "#f5f5f5" : "white",
                    color: services.length === 0 ? "#999" : "inherit"
                  }}
                >
                  <option value="">
                    {services.length === 0 ? "Aucun service disponible" : "Sélectionner un service"}
                  </option>
                  {services.map(service => (
                    <option key={service._id} value={service._id}>
                      {service.nomService}
                    </option>
                  ))}
                </select>
                {services.length === 0 && (
                  <div style={{ fontSize: "12px", color: "#e74c3c", marginTop: "5px" }}>
                    ⚠️ Aucun service trouvé. Vérifiez votre backend.
                  </div>
                )}
              </div>
            )}

            <div>
              <label style={{ display: "block", marginBottom: "5px", fontWeight: "500" }}>
                Mot de passe {!editingUser && "*"}
              </label>
              <input
                type="password"
                name="motDePasse"
                value={form.motDePasse}
                onChange={handleInputChange}
                required={!editingUser}
                placeholder={editingUser ? "Laisser vide pour ne pas modifier" : ""}
                style={{
                  width: "100%",
                  padding: "10px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  fontSize: "14px"
                }}
              />
            </div>

            <div style={{ gridColumn: "1 / -1", display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button
                type="button"
                onClick={resetForm}
                style={{
                  background: "#95a5a6",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Annuler
              </button>
              <button
                type="submit"
                style={{
                  background: "#3498db",
                  color: "white",
                  border: "none",
                  padding: "10px 20px",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "bold"
                }}
              >
                {editingUser ? "Modifier" : "Créer"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tableau des utilisateurs */}
      <div style={{
        background: "white",
        borderRadius: "8px",
        overflow: "hidden",
        boxShadow: "0 2px 10px rgba(0,0,0,0.1)"
      }}>
        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            Chargement des utilisateurs...
          </div>
        ) : filteredUsers.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px", color: "#7f8c8d" }}>
            {searchTerm ? "Aucun utilisateur trouvé" : "Aucun utilisateur enregistré"}
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ background: "#34495e", color: "white" }}>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Nom & Prénom</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Email</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Rôle</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Service</th>
                  <th style={{ padding: "15px", textAlign: "left", fontSize: "14px" }}>Date création</th>
                  <th style={{ padding: "15px", textAlign: "center", fontSize: "14px" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user, index) => (
                  <tr 
                    key={user._id}
                    style={{ 
                      background: index % 2 === 0 ? "#f8f9fa" : "white",
                      borderBottom: "1px solid #e9ecef"
                    }}
                  >
                    <td style={{ padding: "15px", fontWeight: "500" }}>
                      {user.nom} {user.prenom}
                    </td>
                    <td style={{ padding: "15px", color: "#2980b9" }}>
                      {user.email}
                    </td>
                    <td style={{ padding: "15px" }}>
                      <span style={{
                        padding: "4px 12px",
                        borderRadius: "20px",
                        fontSize: "12px",
                        fontWeight: "bold",
                        background: 
                          user.role === "ADMIN_RH" ? "#e74c3c" :
                          user.role === "SALARIE" ? "#3498db" : "#2ecc71",
                        color: "white"
                      }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d" }}>
                      {user.service ? user.service.nomService : "-"}
                    </td>
                    <td style={{ padding: "15px", color: "#7f8c8d", fontSize: "13px" }}>
                      {new Date(user.createdAt).toLocaleDateString('fr-FR')}
                    </td>
                    <td style={{ padding: "15px", textAlign: "center" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "center" }}>
                        <button
                          onClick={() => handleEdit(user)}
                          style={{
                            background: "#f39c12",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          ✏️ Modifier
                        </button>
                        <button
                          onClick={() => handleDelete(user)}
                          style={{
                            background: "#e74c3c",
                            color: "white",
                            border: "none",
                            padding: "6px 12px",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontSize: "12px",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          🗑️ Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Statistiques */}
      <div style={{
        marginTop: "20px",
        display: "flex",
        gap: "15px",
        flexWrap: "wrap"
      }}>
        <div style={{
          background: "#3498db",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Total utilisateurs</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>{users.length}</div>
        </div>
        
        <div style={{
          background: "#e74c3c",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Admins RH</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.role === "ADMIN_RH").length}
          </div>
        </div>
        
        <div style={{
          background: "#2ecc71",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Salariés</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.role === "SALARIE").length}
          </div>
        </div>
        
        <div style={{
          background: "#f39c12",
          color: "white",
          padding: "15px",
          borderRadius: "6px",
          flex: "1",
          minWidth: "150px"
        }}>
          <div style={{ fontSize: "12px", opacity: 0.9 }}>Stagiaires</div>
          <div style={{ fontSize: "24px", fontWeight: "bold" }}>
            {users.filter(u => u.role === "STAGIAIRE").length}
          </div>
        </div>
      </div>
    </div>
  );
}