import { useState, useRef, useEffect } from "react";
import { supabase } from "./lib/supabase";

// ─── Types ────────────────────────────────────────────────────────────────────

type Screen =
  | "splash"
  | "login"
  | "register"
  | "profile"
  | "home"
  | "becomePro"
  | "becomeCompany"
  | "proForm"
  | "companyForm";

interface UserProfile {
  fullName: string;
  email: string;
  cpf: string;
  phone: string;
  birthDate: string;
  address: {
    street: string;
    number: string;
    complement: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  photoUrl: string;
  isProfessional: boolean;
  isCompany: boolean;
}

interface ProfessionalData {
  specialty: string;
  description: string;
  serviceArea: string;
  experienceYears: string;
  portfolio: string;
}

interface CompanyData {
  companyName: string;
  cnpj: string;
  segment: string;
  description: string;
  website: string;
  employees: string;
}

// ─── Logo SVG Component ───────────────────────────────

function TanaMaoLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect width="200" height="200" fill="#F5C800" />
      <path
        d="M 50 100 A 60 60 0 0 0 80 170"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <path
        d="M 150 100 A 60 60 0 0 1 120 170"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="7"
        strokeLinecap="round"
      />
      <rect x="65" y="35" width="70" height="30" rx="12" fill="#1A1A1A" />
      <rect x="80" y="60" width="40" height="70" fill="#1A1A1A" />
      <ellipse cx="125" cy="105" rx="28" ry="32" fill="#1A1A1A" />
      <ellipse cx="108" cy="95" rx="8" ry="15" fill="#1A1A1A" transform="rotate(-25 108 95)" />
      <ellipse cx="108" cy="110" rx="8" ry="15" fill="#1A1A1A" transform="rotate(-20 108 110)" />
      <ellipse cx="108" cy="125" rx="8" ry="15" fill="#1A1A1A" transform="rotate(-15 108 125)" />
      <g transform="translate(45, 65)">
        <line x1="0" y1="15" x2="0" y2="-5" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        <path d="M -8 -5 Q 0 -5 6 3" fill="none" stroke="#1A1A1A" strokeWidth="3" strokeLinecap="round" />
        <circle cx="6" cy="3" r="4" fill="#1A1A1A" />
      </g>
      <g transform="translate(45, 115)">
        <rect x="-10" y="-8" width="20" height="12" rx="2" fill="none" stroke="#1A1A1A" strokeWidth="2.5" />
        <rect x="-4" y="-12" width="8" height="4" rx="1" fill="none" stroke="#1A1A1A" strokeWidth="2" />
        <line x1="-10" y1="0" x2="10" y2="0" stroke="#1A1A1A" strokeWidth="2" />
      </g>
      <g transform="translate(145, 65)">
        <polygon points="0,-8 10,0 -10,0" fill="#1A1A1A" />
        <rect x="-8" y="0" width="16" height="10" rx="1" fill="#1A1A1A" />
        <rect x="-3" y="2" width="6" height="6" fill="#F5C800" />
      </g>
      <g transform="translate(145, 125)">
        <circle cx="0" cy="-4" r="4" fill="#1A1A1A" />
        <path d="M -8 6 Q -8 0 0 0 Q 8 0 8 6 Z" fill="#1A1A1A" />
      </g>
    </svg>
  );
}

// ─── Helper: CPF mask ─────────────────────────────────────────────────────────

function maskCPF(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

function maskPhone(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 11)
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function maskCEP(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 8)
    .replace(/(\d{5})(\d)/, "$1-$2");
}

function maskCNPJ(v: string) {
  return v
    .replace(/\D/g, "")
    .slice(0, 14)
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const YELLOW = "#F5C800";
const BLACK = "#1A1A1A";
const DARK_GRAY = "#2C2C2A";
const LIGHT_BG = "#FAFAFA";
const BORDER = "#E0E0E0";

const styles: Record<string, React.CSSProperties> = {
  app: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    maxWidth: 480,
    margin: "0 auto",
    minHeight: "100vh",
    background: LIGHT_BG,
    display: "flex",
    flexDirection: "column",
  },
  header: {
    background: YELLOW,
    padding: "16px 20px",
    display: "flex",
    alignItems: "center",
    gap: 12,
    boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: BLACK,
    letterSpacing: -0.5,
  },
  headerSub: {
    fontSize: 11,
    color: "#555",
    letterSpacing: 1,
    textTransform: "uppercase" as const,
  },
  scroll: {
    flex: 1,
    overflowY: "auto" as const,
    padding: "20px 20px 80px",
  },
  card: {
    background: "#fff",
    border: `1px solid ${BORDER}`,
    borderRadius: 16,
    padding: "20px",
    marginBottom: 16,
  },
  btn: {
    background: YELLOW,
    color: BLACK,
    border: "none",
    borderRadius: 12,
    padding: "14px 24px",
    fontWeight: 700,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    marginBottom: 10,
  },
  btnOutline: {
    background: "transparent",
    color: BLACK,
    border: `2px solid ${BLACK}`,
    borderRadius: 12,
    padding: "13px 24px",
    fontWeight: 600,
    fontSize: 15,
    cursor: "pointer",
    width: "100%",
    marginBottom: 10,
  },
  btnSmall: {
    background: YELLOW,
    color: BLACK,
    border: "none",
    borderRadius: 8,
    padding: "8px 16px",
    fontWeight: 600,
    fontSize: 13,
    cursor: "pointer",
  },
  label: {
    display: "block",
    fontSize: 12,
    fontWeight: 600,
    color: "#555",
    marginBottom: 4,
    marginTop: 12,
    textTransform: "uppercase" as const,
    letterSpacing: 0.5,
  },
  input: {
    width: "100%",
    border: `1.5px solid ${BORDER}`,
    borderRadius: 10,
    padding: "11px 14px",
    fontSize: 15,
    background: "#fff",
    color: BLACK,
    boxSizing: "border-box" as const,
    outline: "none",
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 700,
    color: BLACK,
    marginBottom: 4,
  },
  sectionSub: {
    fontSize: 13,
    color: "#777",
    marginBottom: 20,
  },
  avatar: {
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: YELLOW,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 32,
    fontWeight: 700,
    color: BLACK,
    border: `3px solid ${BLACK}`,
    overflow: "hidden",
    cursor: "pointer",
    position: "relative" as const,
  },
  badge: {
    display: "inline-block",
    background: YELLOW,
    color: BLACK,
    borderRadius: 20,
    padding: "3px 10px",
    fontSize: 11,
    fontWeight: 700,
    marginRight: 6,
    marginTop: 4,
  },
  optionCard: {
    background: "#fff",
    border: `2px solid ${BORDER}`,
    borderRadius: 16,
    padding: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "flex-start",
    gap: 16,
    marginBottom: 14,
    transition: "border-color 0.15s",
  },
  optionIcon: {
    width: 52,
    height: 52,
    borderRadius: 14,
    background: YELLOW,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: 26,
    flexShrink: 0,
  },
  backBtn: {
    background: "none",
    border: "none",
    cursor: "pointer",
    fontSize: 22,
    padding: "0 4px",
    color: BLACK,
  },
  successBox: {
    background: "#E8F5E9",
    border: "1px solid #A5D6A7",
    borderRadius: 12,
    padding: 16,
    display: "flex",
    alignItems: "center",
    gap: 12,
    marginBottom: 16,
  },
};

// ─── Splash Screen ────────────────────────────────────────────────────────────

function SplashScreen({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      style={{
        background: YELLOW,
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 32,
      }}
    >
      <TanaMaoLogo size={140} />
      <div style={{ marginTop: 24, textAlign: "center" }}>
        <div style={{ fontSize: 32, fontWeight: 900, color: BLACK, letterSpacing: -1 }}>
          TáNaMão
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: DARK_GRAY,
            letterSpacing: 3,
            textTransform: "uppercase",
            marginTop: 4,
          }}
        >
          PROFISSIONAIS
        </div>
        <div style={{ fontSize: 14, color: "#444", marginTop: 12, maxWidth: 260 }}>
          Conectando você aos melhores profissionais e empresas da sua região
        </div>
      </div>
      <button
        style={{ ...styles.btn, marginTop: 48, maxWidth: 300, borderRadius: 50 }}
        onClick={onContinue}
      >
        Começar agora →
      </button>
    </div>
  );
}

// ─── Login Screen ─────────────────────────────────────────────────────────────

function LoginScreen({
  onLogin,
  onGoRegister,
}: {
  onLogin: (e: string, p: string) => void;
  onGoRegister: () => void;
}) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");

  return (
    <div style={styles.app}>
      <div
        style={{
          background: YELLOW,
          padding: "40px 24px 28px",
          textAlign: "center",
        }}
      >
        <TanaMaoLogo size={80} />
        <div style={{ fontSize: 24, fontWeight: 800, color: BLACK, marginTop: 12 }}>
          TáNaMão
        </div>
        <div style={{ fontSize: 11, letterSpacing: 2, color: "#555", fontWeight: 700 }}>
          PROFISSIONAIS
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={{ ...styles.card, marginTop: 8 }}>
          <div style={styles.sectionTitle}>Entrar na conta</div>
          <div style={styles.sectionSub}>Bem-vindo de volta!</div>

          <label style={styles.label}>E-mail</label>
          <input
            style={styles.input}
            type="email"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <label style={styles.label}>Senha</label>
          <input
            style={styles.input}
            type="password"
            placeholder="••••••••"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <button style={{ ...styles.btn, marginTop: 16 }} onClick={() => onLogin(email, pass)}>
            Entrar
          </button>
          <button style={styles.btnOutline} onClick={onGoRegister}>
            Criar conta grátis
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Register Screen ──────────────────────────────────────────────────────────

function RegisterScreen({
  onRegister,
  onBack,
}: {
  onRegister: (profile: UserProfile, pass: string) => void;
  onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
  const [pass, setPass] = useState("");
  const [form, setForm] = useState({
    fullName: "",
    email: "",
    cpf: "",
    phone: "",
    birthDate: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    cep: "",
  });

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setPhoto(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  function handleSubmit() {
    const profile: UserProfile = {
      fullName: form.fullName,
      email: form.email,
      cpf: form.cpf,
      phone: form.phone,
      birthDate: form.birthDate,
      address: {
        street: form.street,
        number: form.number,
        complement: form.complement,
        neighborhood: form.neighborhood,
        city: form.city,
        state: form.state,
        cep: form.cep,
      },
      photoUrl: photo,
      isProfessional: false,
      isCompany: false,
    };
    onRegister(profile, pass);
  }

  const initials = form.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          ←
        </button>
        <div>
          <div style={styles.headerTitle}>Criar conta</div>
          <div style={styles.headerSub}>Preencha seus dados</div>
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={{ ...styles.card, textAlign: "center" }}>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 10,
            }}
          >
            <div style={styles.avatar} onClick={() => fileRef.current?.click()}>
              {photo ? (
                <img src={photo} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>{initials || "📷"}</span>
              )}
            </div>
            <button style={styles.btnSmall} onClick={() => fileRef.current?.click()}>
              {photo ? "Trocar foto" : "Adicionar foto"}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={handlePhoto}
            />
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginBottom: 4 }}>
            📋 Dados pessoais
          </div>

          <label style={styles.label}>Nome completo *</label>
          <input
            style={styles.input}
            placeholder="João da Silva"
            value={form.fullName}
            onChange={(e) => set("fullName", e.target.value)}
          />

          <label style={styles.label}>CPF *</label>
          <input
            style={styles.input}
            placeholder="000.000.000-00"
            value={form.cpf}
            onChange={(e) => set("cpf", maskCPF(e.target.value))}
            inputMode="numeric"
          />
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginBottom: 4 }}>
            📱 Acesso e Contato
          </div>

          <label style={styles.label}>E-mail *</label>
          <input
            style={styles.input}
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
          />

          <label style={styles.label}>Senha *</label>
          <input
            style={styles.input}
            type="password"
            placeholder="Sua senha"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
          />

          <label style={styles.label}>WhatsApp *</label>
          <input
            style={styles.input}
            placeholder="(00) 00000-0000"
            value={form.phone}
            onChange={(e) => set("phone", maskPhone(e.target.value))}
            inputMode="tel"
          />
        </div>

        <button style={styles.btn} onClick={handleSubmit}>
          Criar minha conta →
        </button>
      </div>
    </div>
  );
}

// ─── Profile Screen ───────────────────────────────────────────────────────────

function ProfileScreen({
  user,
  onUpdate,
  onBack,
}: {
  user: UserProfile;
  onUpdate: (u: UserProfile) => void;
  onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(user);

  function set(k: string, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  function setAddr(k: string, v: string) {
    setForm((f) => ({ ...f, address: { ...f.address, [k]: v } }));
  }

  function handlePhoto(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setForm((f) => ({ ...f, photoUrl: ev.target?.result as string }));
    reader.readAsDataURL(file);
  }

  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>
          ←
        </button>
        <div style={{ flex: 1 }}>
          <div style={styles.headerTitle}>Meu Perfil</div>
        </div>
        <button style={styles.btnSmall} onClick={() => editing ? (onUpdate(form), setEditing(false)) : setEditing(true)}>
          {editing ? "Salvar" : "Editar"}
        </button>
      </div>

      <div style={styles.scroll}>
        <div style={{ ...styles.card, textAlign: "center" }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <div style={styles.avatar} onClick={() => editing && fileRef.current?.click()}>
              {form.photoUrl ? (
                <img src={form.photoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              ) : (
                <span>{initials}</span>
              )}
            </div>
            {editing && (
              <>
                <button style={styles.btnSmall} onClick={() => fileRef.current?.click()}>
                  Trocar foto
                </button>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhoto} />
              </>
            )}
            <div style={{ fontSize: 20, fontWeight: 700, color: BLACK }}>{user.fullName}</div>
            <div style={{ fontSize: 13, color: "#777" }}>{user.email}</div>
            <div>
              {user.isProfessional && <span style={styles.badge}>✓ Profissional</span>}
              {user.isCompany && <span style={styles.badge}>✓ Empresa</span>}
              {!user.isProfessional && !user.isCompany && (
                <span style={{ ...styles.badge, background: "#eee", color: "#666" }}>Usuário</span>
              )}
            </div>
          </div>
        </div>

        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Dados pessoais</div>
          {editing ? (
            <>
              <label style={styles.label}>Nome completo</label>
              <input style={styles.input} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              <label style={styles.label}>CPF</label>
              <input style={styles.input} value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} />
            </>
          ) : (
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                <tr>
                  <td style={{ color: "#888", padding: "6px 0", width: "40%" }}>CPF</td>
                  <td style={{ fontWeight: 500, color: BLACK }}>{user.cpf || "—"}</td>
                </tr>
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Home Screen ──────────────────────────────────────────────────────────────

function HomeScreen({
  user,
  onGoProfile,
  onBecomePro,
  onLogout
}: {
  user: UserProfile;
  onGoProfile: () => void;
  onBecomePro: () => void;
  onLogout: () => void;
}) {
  const initials = user.fullName
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

  const categories = [
    { icon: "🔧", label: "Encanadores" },
    { icon: "⚡", label: "Eletricistas" },
    { icon: "🏠", label: "Pedreiros" },
    { icon: "🎨", label: "Pintores" }
  ];

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <TanaMaoLogo size={38} />
        <div style={{ flex: 1 }}>
          <div style={styles.headerTitle}>TáNaMão</div>
          <div style={styles.headerSub}>PROFISSIONAIS</div>
        </div>
        <div
          style={{ ...styles.avatar, width: 40, height: 40, fontSize: 14, cursor: "pointer" }}
          onClick={onGoProfile}
        >
          {user.photoUrl ? (
            <img src={user.photoUrl} alt="Foto" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          ) : (
            <span>{initials}</span>
          )}
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BLACK }}>
            Olá, {user.fullName.split(" ")[0]}! 👋
          </div>
        </div>

        <div style={{ fontSize: 15, fontWeight: 700, color: BLACK, marginBottom: 12 }}>
          Categorias
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: 10,
            marginBottom: 24,
          }}
        >
          {categories.map((c) => (
            <div
              key={c.label}
              style={{
                background: "#fff",
                border: `1px solid ${BORDER}`,
                borderRadius: 12,
                padding: "12px 6px",
                textAlign: "center",
                cursor: "pointer",
              }}
            >
              <div style={{ fontSize: 24 }}>{c.icon}</div>
              <div style={{ fontSize: 11, color: "#555", marginTop: 4, fontWeight: 500 }}>
                {c.label}
              </div>
            </div>
          ))}
        </div>

        {!user.isProfessional && !user.isCompany && (
          <div
            style={{
              background: BLACK,
              borderRadius: 16,
              padding: 20,
              color: "#fff",
              marginBottom: 16,
            }}
          >
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>
              🚀 Você é profissional?
            </div>
            <button
              style={{ ...styles.btn, marginBottom: 0, borderRadius: 10 }}
              onClick={onBecomePro}
            >
              Quero me cadastrar
            </button>
          </div>
        )}

        <button style={styles.btnOutline} onClick={onLogout}>Sair da conta</button>
      </div>
    </div>
  );
}

// ─── Become Pro / Company Choice Screen ──────────────────────────────────────

function BecomeProScreen({
  onChoosePro,
  onChooseCompany,
  onBack,
}: {
  onChoosePro: () => void;
  onChooseCompany: () => void;
  onBack: () => void;
}) {
  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div>
          <div style={styles.headerTitle}>Cadastro profissional</div>
          <div style={styles.headerSub}>Como você quer se cadastrar?</div>
        </div>
      </div>

      <div style={styles.scroll}>
        <div
          style={{ ...styles.optionCard, borderColor: YELLOW }}
          onClick={onChoosePro}
        >
          <div style={styles.optionIcon}>👷</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: BLACK, marginBottom: 4 }}>
              Profissional autônomo
            </div>
          </div>
        </div>

        <div
          style={{ ...styles.optionCard, borderColor: YELLOW }}
          onClick={onChooseCompany}
        >
          <div style={styles.optionIcon}>🏢</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: BLACK, marginBottom: 4 }}>
              Empresa
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Professional Form ────────────────────────────────────────────────────────

function ProFormScreen({
  onSave,
  onBack,
}: {
  onSave: (data: ProfessionalData) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<ProfessionalData>({
    specialty: "",
    description: "",
    serviceArea: "",
    experienceYears: "",
    portfolio: "",
  });

  function set(k: keyof ProfessionalData, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div>
          <div style={styles.headerTitle}>Perfil profissional</div>
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={styles.card}>
          <label style={styles.label}>Especialidade *</label>
          <input
            style={styles.input}
            value={form.specialty}
            onChange={(e) => set("specialty", e.target.value)}
          />

          <label style={styles.label}>Descrição dos seus serviços *</label>
          <textarea
            style={{ ...styles.input, minHeight: 100 }}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />
        </div>

        <button style={styles.btn} onClick={() => onSave(form)}>
          Publicar perfil profissional →
        </button>
      </div>
    </div>
  );
}

// ─── Company Form ─────────────────────────────────────────────────────────────

function CompanyFormScreen({
  onSave,
  onBack,
}: {
  onSave: (data: CompanyData) => void;
  onBack: () => void;
}) {
  const [form, setForm] = useState<CompanyData>({
    companyName: "",
    cnpj: "",
    segment: "",
    description: "",
    website: "",
    employees: "",
  });

  function set(k: keyof CompanyData, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div>
          <div style={styles.headerTitle}>Cadastro de empresa</div>
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={styles.card}>
          <label style={styles.label}>Nome fantasia *</label>
          <input
            style={styles.input}
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
          />

          <label style={styles.label}>CNPJ *</label>
          <input
            style={styles.input}
            value={form.cnpj}
            onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
          />
        </div>

        <button style={styles.btn} onClick={() => onSave(form)}>
          Cadastrar empresa →
        </button>
      </div>
    </div>
  );
}

// ─── App Root (Lógica do Supabase) ──────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [user, setUser] = useState<UserProfile | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setUser(null);
        setScreen("splash");
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  async function fetchUserProfile(userId: string) {
    const { data, error } = await supabase.from('users').select('*').eq('id', userId).single();
    if (data) {
      setUser(data);
      setScreen("home");
    }
  }

  async function handleLogin(email: string, pass: string) {
    const { error } = await supabase.auth.signInWithPassword({
      email: email,
      password: pass,
    });
    if (error) {
      alert("Erro ao entrar: " + error.message);
    }
  }

  async function handleRegister(profile: UserProfile, pass: string) {
    const { data, error } = await supabase.auth.signUp({
      email: profile.email,
      password: pass,
    });
    
    if (error) {
      return alert("Erro ao registrar: " + error.message);
    }

    if (data.user) {
      const { error: dbError } = await supabase.from('users').insert([{
        id: data.user.id,
        ...profile
      }]);
      
      if (dbError) {
        alert("Erro ao salvar dados do perfil.");
      } else {
        setUser(profile);
        setScreen("home");
      }
    }
  }

  async function handleLogout() {
    await supabase.auth.signOut();
  }

  async function handleSavePro(data: ProfessionalData) {
    if (!user) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (userId) {
      await supabase.from('professionals').insert([{ user_id: userId, ...data }]);
      await supabase.from('users').update({ isProfessional: true }).eq('id', userId);
      setUser({ ...user, isProfessional: true });
      setScreen("home");
    }
  }

  async function handleSaveCompany(data: CompanyData) {
    if (!user) return;
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id;
    
    if (userId) {
      await supabase.from('companies').insert([{ user_id: userId, ...data }]);
      await supabase.from('users').update({ isCompany: true }).eq('id', userId);
      setUser({ ...user, isCompany: true });
      setScreen("home");
    }
  }

  if (screen === "splash") {
    return <SplashScreen onContinue={() => setScreen("login")} />;
  }

  if (screen === "login") {
    return <LoginScreen onLogin={handleLogin} onGoRegister={() => setScreen("register")} />;
  }

  if (screen === "register") {
    return <RegisterScreen onRegister={handleRegister} onBack={() => setScreen("login")} />;
  }

  if (screen === "home" && user) {
    return (
      <HomeScreen
        user={user}
        onGoProfile={() => setScreen("profile")}
        onBecomePro={() => setScreen("becomePro")}
        onLogout={handleLogout}
      />
    );
  }

  if (screen === "profile" && user) {
    return (
      <ProfileScreen
        user={user}
        onUpdate={async (u) => {
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData.session) {
             await supabase.from('users').update(u).eq('id', sessionData.session.user.id);
             setUser(u);
          }
        }}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "becomePro") {
    return (
      <BecomeProScreen
        onChoosePro={() => setScreen("proForm")}
        onChooseCompany={() => setScreen("companyForm")}
        onBack={() => setScreen("home")}
      />
    );
  }

  if (screen === "proForm") {
    return <ProFormScreen onSave={handleSavePro} onBack={() => setScreen("becomePro")} />;
  }

  if (screen === "companyForm") {
    return <CompanyFormScreen onSave={handleSaveCompany} onBack={() => setScreen("becomePro")} />;
  }

  return null;
}