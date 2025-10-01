import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

export default function Login() {
  const { login, loading } = useContext(AuthContext);
  const [email, setEmail] = useState("");
  const [motDePasse, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validation des champs
    if (!email || !motDePasse) {
      setError("Veuillez remplir tous les champs");
      return;
    }

    try {
      const result = await login(email, motDePasse);
      
      if (result.success) {
        const userData = JSON.parse(localStorage.getItem("user"));
        const role = userData?.role;
        
        switch(role) {
          case "ADMIN_RH":
            navigate("/admin/users");
            break;
          case "SALARIE":
            navigate("/salarie/profil");
            break;
          case "STAGIAIRE":
            navigate("/stagiaire/profil");
            break;
          default:
            navigate("/");
        }
      } else {
        throw new Error(result.message || "Erreur de connexion");
      }
    } catch (err) {
      setError(err.message || "Email ou mot de passe incorrect");
    }
  };

  const handleDemoLogin = (role) => {
    const demoAccounts = {
      ADMIN_RH: { email: "admin@grh.com", password: "admin123" },
      SALARIE: { email: "salarie@grh.com", password: "salarie123" },
      STAGIAIRE: { email: "stagiaire@grh.com", password: "stagiaire123" }
    };
    
    const account = demoAccounts[role];
    if (account) {
      setEmail(account.email);
      setPassword(account.password);
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
      boxSizing: "border-box"
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
      padding: "4px"
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

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* En-tête */}
        <div style={styles.header}>
          <div style={styles.logo}>GRH</div>
          <h1 style={styles.title}>Connexion</h1>
          <p style={styles.subtitle}>Système de Gestion des Ressources Humaines</p>
        </div>

        {/* Message d'erreur */}
        {error && (
          <div style={styles.error}>
            <svg style={{ width: "16px", height: "16px", marginRight: "8px", flexShrink: "0" }} fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
            </svg>
            {error}
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit}>
          {/* Champ Email */}
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
              <div style={{ position: "absolute", right: "12px", top: "50%", transform: "translateY(-50%)", color: "#6b7280" }}>
                <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Champ Mot de passe */}
          <div style={styles.formGroup}>
            <label htmlFor="password" style={styles.label}>
              Mot de passe
            </label>
            <div style={styles.inputContainer}>
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                required
                value={motDePasse}
                onChange={(e) => setPassword(e.target.value)}
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
              >
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {showPassword ? (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L9 9m9 9l-3-3m-3-3l3 3m0 0l3 3M15 15l-3-3" />
                    </>
                  ) : (
                    <>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>

          {/* Bouton de connexion */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.submitButton,
              ...(loading ? styles.submitButtonDisabled : {})
            }}
            onMouseOver={(e) => {
              if (!loading) {
                e.target.style.background = styles.submitButtonHover.background;
              }
            }}
            onMouseOut={(e) => {
              if (!loading) {
                e.target.style.background = styles.submitButton.background;
              }
            }}
          >
            {loading ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg style={{ animation: "spin 1s linear infinite", marginRight: "8px", width: "16px", height: "16px" }} fill="none" viewBox="0 0 24 24">
                  <circle style={{ opacity: 0.25 }} cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path style={{ opacity: 0.75 }} fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Connexion en cours...
              </div>
            ) : (
              <div style={{ display: "flex", alignItems: "center" }}>
                <svg style={{ width: "16px", height: "16px", marginRight: "8px" }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                </svg>
                Se connecter
              </div>
            )}
          </button>
        </form>

        {/* Comptes de démonstration */}
        <div style={styles.demoSection}>
          <p style={styles.demoTitle}>Comptes de démonstration</p>
          <div style={styles.demoButtons}>
            <button
              type="button"
              onClick={() => handleDemoLogin("ADMIN_RH")}
              style={{
                ...styles.demoButton,
                background: "#ede9fe",
                color: "#7c3aed"
              }}
              onMouseOver={(e) => e.target.style.background = "#ddd6fe"}
              onMouseOut={(e) => e.target.style.background = "#ede9fe"}
            >
              Admin RH
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("SALARIE")}
              style={{
                ...styles.demoButton,
                background: "#dbeafe",
                color: "#1d4ed8"
              }}
              onMouseOver={(e) => e.target.style.background = "#bfdbfe"}
              onMouseOut={(e) => e.target.style.background = "#dbeafe"}
            >
              Salarié
            </button>
            <button
              type="button"
              onClick={() => handleDemoLogin("STAGIAIRE")}
              style={{
                ...styles.demoButton,
                background: "#dcfce7",
                color: "#166534"
              }}
              onMouseOver={(e) => e.target.style.background = "#bbf7d0"}
              onMouseOut={(e) => e.target.style.background = "#dcfce7"}
            >
              Stagiaire
            </button>
          </div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>© 2025 GRH System. Tous droits réservés.</p>
        </div>
      </div>

      {/* Style pour l'animation de spin */}
      <style>
        {`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
}