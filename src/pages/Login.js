import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    console.log("=== DÉBUT handleSubmit ===");
    console.log("Email:", email);
    console.log("Mot de passe:", motDePasse);

    if (!email || !motDePasse) {
      console.log("❌ Champs manquants");
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      console.log("🔄 Appel de la fonction login...");
      const result = await login(email, motDePasse);
      
      console.log("📦 Résultat reçu dans handleSubmit:", result);
      console.log("Token dans le résultat:", result?.token);
      console.log ("User dans le résultat:", result?.user);

      // Vérification corrigée
      if (result && result.token) {
        console.log("✅ Connexion réussie, redirection...");
        console.log("Role de l'utilisateur:", result.user.role);
        
        const role = result.user.role;
        switch (role) {
          case "ADMIN_RH":
            console.log("➡️ Redirection vers /admin/users");
            navigate("/admin/users");
            break;
          case "SALARIE":
            console.log("➡️ Redirection vers /salarie/profil");
            navigate("/salarie/profil");
            break;
          case "STAGIAIRE":
            console.log("➡️ Redirection vers /stagiaire/profil");
            navigate("/stagiaire/profil");
            break;
          default:
            console.log("➡️ Redirection vers / (default)");
            navigate("/");
        }
      } else {
        console.log("❌ Échec de connexion - Message:", result?.message);
        setError(result?.message || "Email ou mot de passe incorrect");
      }
    } catch (err) {
      console.error('💥 Erreur attrapée dans handleSubmit:', err);
      console.error('Message d\'erreur:', err.message);
      console.error('Stack:', err.stack);
      setError("Erreur lors de la connexion");
    }
    
    console.log("=== FIN handleSubmit ===");
  };

  const handleDemoLogin = (role) => {
    console.log("🔄 Clic sur compte démo:", role);
    
    const demoAccounts = {
      ADMIN_RH: { email: "admin@grh.com", password: "admin123" },
      SALARIE: { email: "salarie@grh.com", password: "salarie123" },
      STAGIAIRE: { email: "stagiaire@grh.com", password: "stagiaire123" }
    };
    
    const account = demoAccounts[role];
    if (account) {
      console.log("📝 Remplissage des champs avec:", account);
      setEmail(account.email);
      setMotDePasse(account.password);
      
      // Optionnel : connexion automatique après un court délai
      setTimeout(() => {
        console.log("🔄 Connexion automatique après remplissage...");
        const submitEvent = new Event('submit', { cancelable: true });
        const form = document.querySelector('form');
        if (form) {
          form.dispatchEvent(submitEvent);
        }
      }, 100);
    }
  };

  // Styles
  const styles = {
    container: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)",
      padding: "20px",
      fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif"
    },
    card: {
      maxWidth: "400px",
      width: "100%",
      background: "white",
      padding: "40px 30px",
      borderRadius: "16px",
      boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
      border: "1px solid #e1e5e9"
    },
    header: { 
      textAlign: "center", 
      marginBottom: "30px" 
    },
    logo: {
      margin: "0 auto 15px auto",
      width: "60px",
      height: "60px",
      background: "#3b82f6",
      borderRadius: "50%",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      color: "white",
      fontSize: "20px",
      fontWeight: "bold"
    },
    title: { 
      fontSize: "28px", 
      fontWeight: "700", 
      color: "#1f2937", 
      marginBottom: "8px" 
    },
    subtitle: { 
      fontSize: "14px", 
      color: "#6b7280" 
    },
    error: {
      background: "#fef2f2",
      border: "1px solid #fecaca",
      color: "#dc2626",
      padding: "12px 16px",
      borderRadius: "8px",
      marginBottom: "20px",
      display: "flex",
      alignItems: "center",
      fontSize: "14px"
    },
    formGroup: { 
      marginBottom: "20px" 
    },
    label: { 
      display: "block", 
      fontSize: "14px", 
      fontWeight: "500", 
      color: "#374151", 
      marginBottom: "6px" 
    },
    inputContainer: { 
      position: "relative" 
    },
    input: {
      width: "100%",
      padding: "12px 16px",
      border: "1px solid #d1d5db",
      borderRadius: "8px",
      fontSize: "14px",
      outline: "none",
      transition: "all 0.2s ease",
      boxSizing: "border-box",
      backgroundColor: loading ? "#f9fafb" : "white"
    },
    inputFocus: { 
      borderColor: "#3b82f6", 
      boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)" 
    },
    passwordToggle: { 
      position: "absolute", 
      right: "12px", 
      top: "50%", 
      transform: "translateY(-50%)", 
      background: "none", 
      border: "none", 
      color: "#6b7280", 
      cursor: "pointer", 
      padding: "4px",
      fontSize: "16px"
    },
    submitButton: { 
      width: "100%", 
      padding: "14px", 
      background: "#3b82f6", 
      color: "white", 
      border: "none", 
      borderRadius: "8px", 
      fontSize: "16px", 
      fontWeight: "600", 
      cursor: "pointer", 
      transition: "all 0.2s ease", 
      display: "flex", 
      alignItems: "center", 
      justifyContent: "center" 
    },
    submitButtonHover: { 
      background: "#2563eb" 
    },
    submitButtonDisabled: { 
      opacity: "0.6", 
      cursor: "not-allowed" 
    },
    demoSection: { 
      marginTop: "25px", 
      paddingTop: "25px", 
      borderTop: "1px solid #e5e7eb" 
    },
    demoTitle: { 
      textAlign: "center", 
      fontSize: "12px", 
      color: "#6b7280", 
      marginBottom: "12px", 
      textTransform: "uppercase", 
      letterSpacing: "0.5px" 
    },
    demoButtons: { 
      display: "grid", 
      gridTemplateColumns: "1fr 1fr 1fr", 
      gap: "8px" 
    },
    demoButton: { 
      padding: "8px 6px", 
      fontSize: "11px", 
      fontWeight: "500", 
      border: "none", 
      borderRadius: "6px", 
      cursor: "pointer", 
      transition: "all 0.2s ease" 
    },
    footer: { 
      marginTop: "25px", 
      textAlign: "center" 
    },
    footerText: { 
      fontSize: "11px", 
      color: "#9ca3af" 
    }
  };

  console.log("🔄 Rendu du composant Login");
  console.log("État actuel - Email:", email, "Loading:", loading, "Error:", error);

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.logo}>GRH</div>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.subtitle}>Système de Gestion des Ressources Humaines</p>
        </div>

        {error && (
          <div style={styles.error}>
            <svg style={{ width: "16px", height: "16px", marginRight: "8px", flexShrink: "0" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Adresse email
            </label>
            <div style={styles.inputContainer}>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={styles.input}
                placeholder="votre@email.com"
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = styles.inputFocus.borderColor;
                  e.target.style.boxShadow = styles.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = styles.input.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
            </div>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="motDePasse" style={styles.label}>
              Mot de passe
            </label>
            <div style={styles.inputContainer}>
              <input
                id="motDePasse"
                name="motDePasse"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={motDePasse}
                onChange={(e) => setMotDePasse(e.target.value)}
                style={styles.input}
                placeholder="Votre mot de passe"
                disabled={loading}
                onFocus={(e) => {
                  e.target.style.borderColor = styles.inputFocus.borderColor;
                  e.target.style.boxShadow = styles.inputFocus.boxShadow;
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = styles.input.border;
                  e.target.style.boxShadow = 'none';
                }}
              />
              <button 
                type="button" 
                style={styles.passwordToggle} 
                onClick={() => setShowPassword(!showPassword)}
                disabled={loading}
              >
                {showPassword ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            onMouseOver={(e) => { 
              if (!loading) e.target.style.background = styles.submitButtonHover.background; 
            }}
            onMouseOut={(e) => { 
              if (!loading) e.target.style.background = styles.submitButton.background; 
            }}
          >
            {loading ? "Connexion en cours..." : "Se connecter"}
          </button>
        </form>

        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Comptes de démonstration</p>
          <div style={styles.demoButtons}>
            <button 
              type="button" 
              onClick={() => handleDemoLogin("ADMIN_RH")} 
              style={{ ...styles.demoButton, background: "#ede9fe", color: "#7c3aed" }}
              disabled={loading}
            >
              Admin RH
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin("SALARIE")} 
              style={{ ...styles.demoButton, background: "#dbeafe", color: "#1d4ed8" }}
              disabled={loading}
            >
              Salarié
            </button>
            <button 
              type="button" 
              onClick={() => handleDemoLogin("STAGIAIRE")} 
              style={{ ...styles.demoButton, background: "#dcfce7", color: "#166534" }}
              disabled={loading}
            >
              Stagiaire
            </button>
          </div>
        </div>

        <div style={styles.footer}>
          <p style={styles.footerText}>© 2025 GRH System. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  );
}