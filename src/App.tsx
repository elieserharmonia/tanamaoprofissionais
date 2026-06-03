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
}  Save,
  Plus,
  Award,
  TrendingUp,
  Clock,
  Settings,
  FileText,
  CheckCheck,
  Megaphone,
  ShoppingCart,
  PercentCircle,
  Store,
  Menu
} from 'lucide-react';

import { Profissional, Oferta, UserSession, Message, ChatSession, Booking, ClientReview, AppNotification } from './types';
import ProfessionalPanel from './components/ProfessionalPanel';
import { Logo } from './components/Logo';
import { 
  INITIAL_PROFESSIONALS, 
  CATEGORIES_LIST, 
  INITIAL_OFFERS, 
  INITIAL_HERO_AD_SLIDES 
} from './data';
import {
  getProCoords,
  calculateHaversineDistance,
  formatCPFOrCNPJ,
  validateDocumento,
  CITY_CENTERS,
  generateSlug
} from './utils';

const stateAbbreviations: Record<string, string> = {
  "Acre": "AC", "Alagoas": "AL", "Amapá": "AP", "Amazonas": "AM", "Bahia": "BA",
  "Ceará": "CE", "Distrito Federal": "DF", "Espírito Santo": "ES", "Goiás": "GO",
  "Maranhão": "MA", "Mato Grosso": "MT", "Mato Grosso do Sul": "MS", "Minas Gerais": "MG",
  "Pará": "PA", "Paraíba": "PB", "Paraná": "PR", "Pernambuco": "PE", "Piauí": "PI",
  "Rio de Janeiro": "RJ", "Rio Grande do Norte": "RN", "Rio Grande do Sul": "RS",
  "Rondônia": "RO", "Roraima": "RR", "Santa Catarina": "SC", "São Paulo": "SP",
  "Sergipe": "SE", "Tocantins": "TO"
};

const BRAZILIAN_STATES = [
  { code: "SP", name: "São Paulo" }, { code: "RJ", name: "Rio de Janeiro" },
  { code: "MG", name: "Minas Gerais" }, { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" }, { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" }, { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" }, { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" }, { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" }, { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" }, { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" }, { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" }, { code: "PI", name: "Piauí" },
  { code: "RN", name: "Rio Grande do Norte" }, { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" }, { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" }, { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" }
];

interface ClientAdvertiser {
  id: number; nome: string; slogan: string; cidade: string;
  estado: string; foto: string; whatsapp: string; plano: string; validade: string;
}

const MOCK_CLIENT_ADVERTISERS: ClientAdvertiser[] = [
  { id: 1, nome: "Reformas Silva", slogan: "Qualidade e pontualidade garantidas", cidade: "Bauru", estado: "SP", foto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200", whatsapp: "14999990001", plano: "destaque_solo", validade: "2025-12-31" },
  { id: 2, nome: "Elétrica Costa", slogan: "24h para sua emergência elétrica", cidade: "Bauru", estado: "SP", foto: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200", whatsapp: "14999990002", plano: "destaque_solo", validade: "2025-12-31" },
  { id: 3, nome: "TecnoFix", slogan: "Assistência técnica rápida e confiável", cidade: "Bauru", estado: "SP", foto: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=1200", whatsapp: "14999990003", plano: "destaque_solo", validade: "2025-12-31" }
];

// ─── ML-STYLE QUICK ACCESS ICONS ────────────────────────────────────────────
const ML_QUICK_ICONS = [
  { id: 'ofertas', label: 'Ofertas', emoji: '%', color: 'bg-yellow-400', textColor: 'text-brand-blue' },
  { id: 'cupons', label: 'Cupons', emoji: '🎟', color: 'bg-blue-500', textColor: 'text-white' },
  { id: 'lojas', label: 'Lojas Oficiais', emoji: '🏪', color: 'bg-blue-400', textColor: 'text-white' },
  { id: 'servicos', label: 'Serviços', emoji: '🛠', color: 'bg-orange-400', textColor: 'text-white' },
  { id: 'top', label: 'Mais Pedidos', emoji: '⭐', color: 'bg-amber-400', textColor: 'text-white' },
  { id: 'veiculos', label: 'Veículos', emoji: '🚗', color: 'bg-gray-400', textColor: 'text-white' },
];

export default function App() {
  // ─── STATE ────────────────────────────────────────────────────────────────
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [activeRegion, setActiveRegion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentAdIdx, setCurrentAdIdx] = useState<number>(0);
  const [only24h, setOnly24h] = useState<boolean>(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const [activeLoginTab, setActiveLoginTab] = useState<'login' | 'register'>('login');
  const [userEmail, setUserEmail] = useState<string>("");
  const [userType, setUserType] = useState<'client' | 'pro'>('client');
  const [registerPassword, setRegisterPassword] = useState<string>("123456");
  const [monetizationTab, setMonetizationTab] = useState<'publish' | 'boost'>('publish');
  const [boostProId, setBoostProId] = useState<number | "">("");
  const [selectedPlanId, setSelectedPlanId] = useState<'solo' | 'linha' | 'galeria'>('solo');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [pixFeedback, setPixFeedback] = useState<string>("");
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [receiptFileSimulated, setReceiptFileSimulated] = useState<boolean>(false);
  const [activeCategoryTab, setActiveCategoryTab] = useState<string>('all');

  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg }]);
    setTimeout(() => { setToasts(prev => prev.filter(t => t.id !== id)); }, 3500);
  };

  const updateProfileIdWithHash = (id: number | null) => {
    setSelectedProfileId(id);
    if (id !== null) { window.location.hash = `#perfil-${id}`; }
    else { window.location.hash = '#home'; }
  };

  const [geoLoading, setGeoLoading] = useState<boolean>(false);
  const [geoFeedback, setGeoFeedback] = useState<string>("");
  const [showLocationFallback, setShowLocationFallback] = useState<boolean>(false);
  const [manualState, setManualState] = useState<string>("SP");
  const [manualCity, setManualCity] = useState<string>("");

  const triggerGeolocation = () => {
    if (!navigator.geolocation) {
      setGeoFeedback("Geolocalização não é suportada por seu navegador.");
      setShowLocationFallback(true);
      setRegionModalOpen(true);
      return;
    }
    setGeoLoading(true);
    setGeoFeedback("Obtendo permissão de localização...");
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        setUserLat(latitude); setUserLon(longitude);
        setGeoFeedback("Localização obtida! Identificando cidade...");
        try {
          const response = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`);
          if (!response.ok) throw new Error("Erro na geocodificação reversa");
          const data = await response.json();
          const address = data.address || {};
          const rawCity = address.city || address.town || address.village || address.municipality || address.suburb;
          const rawState = address.state || "";
          if (!rawCity) throw new Error("Nome da cidade não reconhecido.");
          const stateInitials = stateAbbreviations[rawState] || rawState || "SP";
          const resolvedRegion = `${rawCity} - ${stateInitials}`;
          setActiveRegion(resolvedRegion);
          localStorage.setItem('tanamao_region', resolvedRegion);
          localStorage.setItem('tanamao_geolocation', JSON.stringify({ cidade: rawCity, estado: stateInitials, lat: latitude, lon: longitude }));
          setGeoFeedback(`Sucesso! Localizado em ${resolvedRegion}`);
          addToast(`Localização atualizada para ${resolvedRegion}! 🗺️`);
          setGeoLoading(false);
          setShowLocationFallback(false);
          setTimeout(() => { setRegionModalOpen(false); setGeoFeedback(""); }, 1500);
        } catch (err) {
          setGeoFeedback("Não foi possível identificar sua cidade automaticamente. Selecione manualmente.");
          setGeoLoading(false); setShowLocationFallback(true); setRegionModalOpen(true);
        }
      },
      (error) => {
        let errorMsg = "Permissão negada.";
        if (error.code === error.PERMISSION_DENIED) errorMsg = "Permissão de localização negada pelo navegador.";
        else if (error.code === error.POSITION_UNAVAILABLE) errorMsg = "Sinal de localização indisponível.";
        else if (error.code === error.TIMEOUT) errorMsg = "Tempo esgotado ao obter localização.";
        setGeoFeedback(errorMsg); setGeoLoading(false); setShowLocationFallback(true); setRegionModalOpen(true);
      },
      { timeout: 10000 }
    );
  };

  const handleManualRegionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    const formattedCity = manualCity.trim().split(' ').map(word => {
      if (word.length <= 2 && /^(de|da|do|dos|das)$/i.test(word)) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    const resolvedRegion = `${formattedCity} - ${manualState}`;
    setActiveRegion(resolvedRegion);
    localStorage.setItem('tanamao_region', resolvedRegion);
    localStorage.setItem('tanamao_geolocation', JSON.stringify({ cidade: formattedCity, estado: manualState, lat: 0, lon: 0 }));
    setGeoFeedback(`Escolhido manualmente: ${resolvedRegion}`);
    setTimeout(() => { setRegionModalOpen(false); setGeoFeedback(""); setManualCity(""); }, 1200);
  };

  const [ratingFilter, setRatingFilter] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<string>("visitas");
  const [currentSlide, setCurrentSlide] = useState<number>(0);
  const [userSession, setUserSession] = useState<UserSession>({ nome: "Convidado", email: "convidado@tanamao.com.br", avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120", logado: false, tipo: 'client' });

  // ─── SUPABASE AUTH ────────────────────────────────────────────────────────
  const cadastrar = async (email: string, senha: string, nome: string, tipo: 'client' | 'pro') => {
    // @ts-ignore
    const { data: { user }, error } = await window.supabaseClient.auth.signUp({ email, password: senha, options: { data: { nome, tipo } } });
    if (error) throw error;
    // @ts-ignore
    await window.supabaseClient.from('usuarios').insert({ id: user?.id, nome, email, tipo, codigo_indicacao: `TN-${nome.substring(0,3).toUpperCase()}${Math.floor(Math.random()*1000)}` });
  };
  const login = async (email: string, senha: string) => {
    // @ts-ignore
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
    return data.user;
  };
  const logout = async () => {
    // @ts-ignore
    await window.supabaseClient.auth.signOut();
  };
  const loginGoogle = async () => {
    // @ts-ignore
    const { error } = await window.supabaseClient.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) console.error(error);
  };
  const cadastrarEmail = async (nome: string, email: string, senha: string, tipo: 'client' | 'pro') => {
    // @ts-ignore
    const { data, error } = await window.supabaseClient.auth.signUp({ email, password: senha, options: { data: { nome, tipo }, emailRedirectTo: window.location.origin } });
    if (error) throw error;
    // @ts-ignore
    await window.supabaseClient.from('usuarios').insert({ id: data.user?.id, nome, email, tipo, codigo_indicacao: `TN-${nome.substring(0,3).toUpperCase()}${Math.floor(Math.random()*1000)}` });
    addToast('✅ Verifique seu e-mail para confirmar o cadastro!');
  };
  const loginEmail = async (email: string, senha: string) => {
    // @ts-ignore
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({ email, password: senha });
    if (error) throw error;
  };
  const recuperarSenha = async (email: string) => {
    // @ts-ignore
    const { error } = await window.supabaseClient.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + '#/nova-senha' });
    if (!error) addToast('✅ Link de recuperação enviado para seu e-mail!');
  };
  const enviarOTP = async (telefone: string) => {
    const numero = '+55' + telefone.replace(/\D/g, '');
    // @ts-ignore
    const { error } = await window.supabaseClient.auth.signInWithOtp({ phone: numero });
    if (error) throw error;
  };
  const buscarProfissionais = async (cidade: string, estado: string, categoria: string | null = null) => {
    // @ts-ignore
    let query = window.supabaseClient.from('profissionais').select(`*, profissional_fotos(url, tipo), planos_ativos(tipo, status, fim)`).eq('cidade', cidade).eq('estado', estado).eq('ativo', true).order('total_visitas', { ascending: false });
    if (categoria) query = query.eq('categoria', categoria);
    // @ts-ignore
    const { data, error } = await query;
    if (error) throw error;
    return data || [];
  };
  const autocomplete = async (termo: string) => {
    // @ts-ignore
    const { data, error } = await window.supabaseClient.from('profissionais').select('id, nome, categoria, cidade, slug').or(`nome.ilike.%${termo}%,categoria.ilike.%${termo}%`).eq('ativo', true).limit(8);
    if (error) throw error;
    return data || [];
  };
  const uploadFoto = async (arquivo: File, bucket: string, pasta: string) => {
    const ext = arquivo.name.split('.').pop();
    const path = `${pasta}/${Date.now()}.${ext}`;
    // @ts-ignore
    const { error } = await window.supabaseClient.storage.from(bucket).upload(path, arquivo, { upsert: true });
    if (error) throw error;
    // @ts-ignore
    const { data } = window.supabaseClient.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  };

  useEffect(() => {
    const fetchData = async () => {
      if (activeRegion) {
        const [cidade, estado] = activeRegion.split(' - ');
        try {
          const data = await buscarProfissionais(cidade, estado, selectedCategory || null);
          setProfessionals(data);
        } catch (error) {
          setProfessionals(INITIAL_PROFESSIONALS);
        }
      } else { setProfessionals(INITIAL_PROFESSIONALS); }
    };
    fetchData();
  }, [activeRegion, selectedCategory]);

  useEffect(() => {
    // @ts-ignore
    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUserSession({ nome: session.user.user_metadata.nome || 'Usuário', email: session.user.email || '', avatar: session.user.user_metadata.avatar || '', logado: true, tipo: session.user.user_metadata.tipo || 'client' });
      } else {
        setUserSession({ nome: "Convidado", email: "convidado@tanamao.com.br", avatar: "...", logado: false, tipo: 'client' });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  const [distanceStepIdx, setDistanceStepIdx] = useState<number>(4);
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatProId, setActiveChatProId] = useState<number | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [chatMessageText, setChatMessageText] = useState<string>("");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingProId, setBookingProId] = useState<number | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>("");
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>("");
  const [userPanelOpen, setUserPanelOpen] = useState<boolean>(false);
  const [activeUserPanelTab, setActiveUserPanelTab] = useState<'agendamentos' | 'conversas' | 'dados' | 'planos'>('agendamentos');
  const [viewPainel, setViewPainel] = useState<boolean>(false);
  const [activePainelTab, setActivePainelTab] = useState<'dashboard' | 'estatisticas' | 'agendamentos' | 'mensagem' | 'planos' | 'perfil'>('dashboard');
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);
  const [notificationsPermissionState, setNotificationsPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showNotificationPromptModal, setShowNotificationPromptModal] = useState<boolean>(false);
  const [recommendationSeed, setRecommendationSeed] = useState<number>(0);
  const [viewPlanos, setViewPlanos] = useState<boolean>(false);
  const [activePlanPeriod, setActivePlanPeriod] = useState<'semanal' | 'mensal'>('mensal');
  const [contractModalOpen, setContractModalOpen] = useState<boolean>(false);
  const [selectedContractPlan, setSelectedContractPlan] = useState<any | null>(null);
  const [contractStep, setContractStep] = useState<1 | 2>(1);
  const [contractCity, setContractCity] = useState<string>("");
  const [contractCategory, setContractCategory] = useState<string>("");
  const [paymentPixCountdown, setPaymentPixCountdown] = useState<number>(900);
  const [creditCardName, setCreditCardName] = useState<string>("");
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [creditCardExpiry, setCreditCardExpiry] = useState<string>("08/30");
  const [creditCardCvv, setCreditCardCvv] = useState<string>("123");
  const [newProDocumento, setNewProDocumento] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerDocumento, setRegisterDocumento] = useState<string>("");
  const [regionModalOpen, setRegionModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [announceModalOpen, setAnnounceModalOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [contactForm, setContactForm] = useState({ nome: "", email: "", telefone: "", cidade: "", assunto: "Outro", mensagem: "" });
  const [isSending, setIsSending] = useState<boolean>(false);

  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault(); setIsSending(true);
    try {
      // @ts-ignore
      await window.emailjs.send("service_tanamao", "template_tanamao", { nome: contactForm.nome, email: contactForm.email, telefone: contactForm.telefone, cidade: contactForm.cidade, assunto: contactForm.assunto, mensagem: contactForm.mensagem, destinatario: "apptanamaoprofissionais@gmail.com" });
      addToast("✅ Mensagem enviada! Retornaremos em até 24h.");
    } catch (error) {
      const mailto = `mailto:apptanamaoprofissionais@gmail.com?subject=${encodeURIComponent(contactForm.assunto)}&body=${encodeURIComponent(`Nome: ${contactForm.nome}\nEmail: ${contactForm.email}\nTelefone: ${contactForm.telefone}\nCidade: ${contactForm.cidade}\n\n${contactForm.mensagem}`)}`;
      window.location.href = mailto;
    } finally {
      setIsSending(false); setContactModalOpen(false);
      setContactForm({ nome: "", email: "", telefone: "", cidade: "", assunto: "Outro", mensagem: "" });
    }
  };

  const [storiesModalOpen, setStoriesModalOpen] = useState<boolean>(false);
  const [storyBg, setStoryBg] = useState<'navy' | 'dark' | 'yellow' | 'gradient'>('navy');
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [loginFeedback, setLoginFeedback] = useState<string>("");
  const [newProNome, setNewProNome] = useState<string>("");
  const [newProEmpresa, setNewProEmpresa] = useState<string>("");
  const [newProCategoria, setNewProCategoria] = useState<string>("Reformas");
  const [newProCidade, setNewProCidade] = useState<string>("São Paulo - SP");
  const [newProAvatar, setNewProAvatar] = useState<string>("");
  const [newProBio, setNewProBio] = useState<string>("");
  const [newProTelefone, setNewProTelefone] = useState<string>("");
  const [newProCelular, setNewProCelular] = useState<string>("");
  const [newProEmail, setNewProEmail] = useState<string>("");
  const [newProEndereco, setNewProEndereco] = useState<string>("");
  const [newProImages, setNewProImages] = useState<string[]>([]);
  const [tempImageUrl, setTempImageUrl] = useState<string>("");
  const [newPro24h, setNewPro24h] = useState<boolean>(false);
  const [announceSuccess, setAnnounceSuccess] = useState<string>("");
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>("");
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportProId, setReportProId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>("Perfil falso ou duplicado");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportDescError, setReportDescError] = useState<string>("");
  const [portfolioModalOpen, setPortfolioModalOpen] = useState<boolean>(false);
  const [portfolioTitleInput, setPortfolioTitleInput] = useState<string>("");
  const [portfolioDescInput, setPortfolioDescInput] = useState<string>("");
  const [portfolioAntesInput, setPortfolioAntesInput] = useState<string>("");
  const [portfolioDepoisInput, setPortfolioDepoisInput] = useState<string>("");
  const [certModalOpen, setCertModalOpen] = useState<boolean>(false);
  const [certCourseInput, setCertCourseInput] = useState<string>("");
  const [certInstInput, setCertInstInput] = useState<string>("");
  const [certYearInput, setCertYearInput] = useState<string>("");
  const [reviewsFilter, setReviewsFilter] = useState<'recência' | 'fotos' | 'úteis'>('recência');
  const [replyOpenIndex, setReplyOpenIndex] = useState<number | null>(null);
  const [replyTextInput, setReplyTextInput] = useState<string>("");
  const [clientReviewModalOpen, setClientReviewModalOpen] = useState<boolean>(false);
  const [clientReviewBookingId, setClientReviewBookingId] = useState<string>("");
  const [clientReviewStars, setClientReviewStars] = useState<number>(5);
  const [clientReviewComentario, setClientReviewComentario] = useState<string>("");
  const [filterOnlyCertified, setFilterOnlyCertified] = useState<boolean>(false);
  const [clientReviews, setClientReviews] = useState<ClientReview[]>([]);
  const [reviewAuthor, setReviewAuthor] = useState<string>("");
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");
  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState<string>("");
  const [showNotificationCount, setShowNotificationCount] = useState<boolean>(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);

  // ─── SPLASH ───────────────────────────────────────────────────────────────
  useEffect(() => {
    const timer = setTimeout(() => { setShowSplash(false); }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // ─── INIT ─────────────────────────────────────────────────────────────────
  useEffect(() => {
    const storedRegion = localStorage.getItem('tanamao_region');
    if (storedRegion) { setActiveRegion(storedRegion); }
    else { setActiveRegion("Bauru - SP"); setRegionModalOpen(true); }

    const storedGeo = localStorage.getItem('tanamao_geolocation');
    if (storedGeo) {
      try { const p = JSON.parse(storedGeo); if (p.lat && p.lon) { setUserLat(p.lat); setUserLon(p.lon); } } catch (e) {}
    }

    const storedDB = localStorage.getItem('tanamao_db');
    let dbToHydrate: Profissional[] = INITIAL_PROFESSIONALS;
    if (storedDB) { try { dbToHydrate = JSON.parse(storedDB); } catch (e) {} }
    const processedDB = dbToHydrate.map(p => ({ ...p, slug: p.slug || generateSlug(p.nome, p.categoria), whatsappMsgDefault: p.whatsappMsgDefault || "Olá! Vi seu perfil no TáNaMão e gostaria de um orçamento." }));
    setProfessionals(processedDB);
    localStorage.setItem('tanamao_db', JSON.stringify(processedDB));

    const storedFavs = localStorage.getItem('tanamao_favs');
    if (storedFavs) { try { setFavorites(JSON.parse(storedFavs)); } catch (e) {} }

    const storedNotifications = localStorage.getItem('tanamao_notifications');
    if (storedNotifications) { try { setNotifications(JSON.parse(storedNotifications)); } catch (e) {} }
    else {
      const initialNotifications: AppNotification[] = [
        { id: 'notif-1', text: '👁 Seu perfil foi visitado 50 vezes hoje', timestamp: new Date(2026, 5, 2, 10, 30).toISOString(), read: false, type: 'visitas' },
        { id: 'notif-2', text: '⭐ Você recebeu uma nova avaliação 5★', timestamp: new Date(2026, 5, 2, 8, 15).toISOString(), read: false, type: 'avaliacao' },
        { id: 'notif-3', text: '💬 Nova mensagem de Maria Lima', timestamp: new Date(2026, 5, 1, 19, 45).toISOString(), read: true, type: 'mensagem' },
      ];
      setNotifications(initialNotifications);
      localStorage.setItem('tanamao_notifications', JSON.stringify(initialNotifications));
    }

    const storedChats = localStorage.getItem('tanamao_chats');
    if (storedChats) { try { setChatSessions(JSON.parse(storedChats)); } catch (e) {} }

    const storedBookings = localStorage.getItem('tanamao_bookings');
    if (storedBookings) { try { setBookings(JSON.parse(storedBookings)); } catch (e) {} }
    else {
      const initialBookings: Booking[] = [
        { id: "booking-mock-1", clientId: "eliesermusicoccb@gmail.com", clientName: "Elieser Músico", proId: 6, proNome: "Ricardo Abreu", proCategoria: "Tecnologia", data: "2026-05-20", hora: "10:00", status: "Concluído", avaliado: true },
        { id: "booking-mock-2", clientId: "eliesermusicoccb@gmail.com", clientName: "Elieser Músico", proId: 1, proNome: "Carlos Eduardo", proCategoria: "Reformas", data: "2026-05-22", hora: "14:00", status: "Concluído", avaliado: false },
        { id: "booking-mock-3", clientId: "eliesermusicoccb@gmail.com", clientName: "Elieser Músico", proId: 4, proNome: "Sofia Nogueira", proCategoria: "Beleza", data: "2026-06-05", hora: "09:30", status: "Confirmado", avaliado: false }
      ];
      setBookings(initialBookings);
      localStorage.setItem('tanamao_bookings', JSON.stringify(initialBookings));
    }

    const handleHashChange = () => {
      const hash = window.location.hash;
      const stored = localStorage.getItem('tanamao_db');
      let list: Profissional[] = INITIAL_PROFESSIONALS;
      if (stored) { try { list = JSON.parse(stored); } catch (e) {} }
      if (hash.startsWith('#/perfil/')) {
        const slug = hash.replace('#/perfil/', '');
        const found = list.find(p => p.slug === slug || generateSlug(p.nome, p.categoria) === slug);
        if (found) { setSelectedProfileId(found.id); setViewPlanos(false); setViewPainel(false); }
        else { setSelectedProfileId(null); setViewPlanos(false); setViewPainel(false); }
      } else if (hash.startsWith('#perfil-')) {
        const id = parseInt(hash.replace('#perfil-', ''), 10);
        if (!isNaN(id)) { setSelectedProfileId(id); setViewPlanos(false); setViewPainel(false); }
      } else if (hash === '#planos' || hash === '#/planos') {
        setSelectedProfileId(null); setViewPlanos(true); setViewPainel(false);
      } else if (hash === '#/painel' || hash === '#painel') {
        setSelectedProfileId(null); setViewPlanos(false); setViewPainel(true);
      } else if (hash.startsWith('#/cadastro') || hash.startsWith('#cadastro')) {
        setSelectedProfileId(null); setViewPlanos(false); setViewPainel(false); setLoginModalOpen(true);
      } else if (hash === '' || hash === '#home' || hash === '#catalog' || hash === '#/') {
        setSelectedProfileId(null); setViewPlanos(false); setViewPainel(false);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault(); setDeferredPrompt(e);
      const hideUntil = localStorage.getItem('tanamao_pwa_banner_hidden_until');
      if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) setShowPwaBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // ─── UTILS ────────────────────────────────────────────────────────────────
  const syncDB = (updatedList: Profissional[]) => { setProfessionals(updatedList); localStorage.setItem('tanamao_db', JSON.stringify(updatedList)); };
  const syncChats = (updatedChats: ChatSession[]) => { setChatSessions(updatedChats); localStorage.setItem('tanamao_chats', JSON.stringify(updatedChats)); };
  const syncBookings = (updatedBookings: Booking[]) => { setBookings(updatedBookings); localStorage.setItem('tanamao_bookings', JSON.stringify(updatedBookings)); };
  const syncNotifications = (updatedNotifs: AppNotification[]) => { setNotifications(updatedNotifs); localStorage.setItem('tanamao_notifications', JSON.stringify(updatedNotifs)); };

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (contractModalOpen && contractStep === 2 && paymentPixCountdown > 0) {
      timer = setInterval(() => { setPaymentPixCountdown(prev => prev - 1); }, 1000);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [contractModalOpen, contractStep, paymentPixCountdown]);

  const toggleFavorite = (proId: number) => {
    let nextFavs;
    if (favorites.includes(proId)) { nextFavs = favorites.filter(id => id !== proId); addToast("Removido dos favoritos 💔"); }
    else { nextFavs = [...favorites, proId]; addToast("Adicionado aos favoritos! ❤️"); }
    setFavorites(nextFavs); localStorage.setItem('tanamao_favs', JSON.stringify(nextFavs));
  };

  const handleSelectRegion = (regionName: string) => {
    setActiveRegion(regionName); localStorage.setItem('tanamao_region', regionName); setRegionModalOpen(false);
  };

  useEffect(() => {
    const timer = setInterval(() => { setCurrentSlide(prev => (prev + 1) % INITIAL_HERO_AD_SLIDES.length); }, 4000);
    return () => clearInterval(timer);
  }, []);

  const getAverageRating = (p: Profissional) => {
    if (!p.avaliacoes || p.avaliacoes.length === 0) return 5.0;
    const sum = p.avaliacoes.reduce((acc, cur) => acc + cur.estrelas, 0);
    return Number((sum / p.avaliacoes.length).toFixed(1));
  };
  const getRatingCount = (p: Profissional) => p.avaliacoes ? p.avaliacoes.length : 0;

  useEffect(() => { if (selectedCategory) localStorage.setItem('tanamao_last_category', selectedCategory); }, [selectedCategory]);

  useEffect(() => {
    if (selectedProfileId !== null) {
      const p = professionals.find(item => item.id === selectedProfileId);
      if (p) {
        if (p.galeria && p.galeria.length > 0) setActiveGalleryPhoto(p.galeria[0]);
        else setActiveGalleryPhoto(p.avatar);
        const updatedList = professionals.map(item => item.id === selectedProfileId ? { ...item, visitas: item.visitas + 1 } : item);
        syncDB(updatedList);
      }
    }
  }, [selectedProfileId]);

  const renderCategoryIcon = (catName: string, cssClass: string = "w-6 h-6") => {
    switch (catName) {
      case "Reformas": return <Hammer className={cssClass} />;
      case "Beleza": return <Scissors className={cssClass} />;
      case "Aulas": return <GraduationCap className={cssClass} />;
      case "Tecnologia": return <Laptop className={cssClass} />;
      case "Casa": return <HomeIcon className={cssClass} />;
      case "Consultoria": return <MessageSquare className={cssClass} />;
      default: return <Briefcase className={cssClass} />;
    }
  };

  // ─── MEMOS ────────────────────────────────────────────────────────────────
  const highlightedPros = useMemo(() => professionals.filter(p => p.destaque === 'linha'), [professionals]);
  const soloHighlightedPros = useMemo(() => professionals.filter(p => p.destaque === 'solo' && p.cidade === activeRegion), [professionals, activeRegion]);

  const regionAdvertisers = useMemo(() => {
    const cityName = activeRegion ? activeRegion.split(' - ')[0].trim() : "Bauru";
    const mockFiltered = MOCK_CLIENT_ADVERTISERS.filter(ad => ad.cidade.toLowerCase() === cityName.toLowerCase());
    const realFiltered = professionals.filter(p => p.destaque === 'solo' && p.cidade === activeRegion).map(p => ({ id: p.id, nome: p.nome, slogan: p.bio, cidade: p.cidade.split(' - ')[0], estado: p.cidade.split(' - ')[1] || "SP", foto: p.galeria && p.galeria.length > 0 ? p.galeria[0] : p.avatar, whatsapp: p.celular.replace(/\D/g, ''), plano: "destaque_solo", validade: "2025-12-31", isReal: true }));
    return [...mockFiltered, ...realFiltered];
  }, [activeRegion, professionals]);

  useEffect(() => { setCurrentAdIdx(0); }, [activeRegion]);
  useEffect(() => {
    if (regionAdvertisers.length <= 1) return;
    const interval = setInterval(() => { setCurrentAdIdx(prev => (prev + 1) % regionAdvertisers.length); }, 5000);
    return () => clearInterval(interval);
  }, [regionAdvertisers]);

  const computedOffers = useMemo(() => INITIAL_OFFERS.filter(of => { const pro = professionals.find(p => p.id === of.profissionalId); return pro ? pro.cidade === activeRegion : false; }), [professionals, activeRegion]);

  const currentUserLat = userLat !== null ? userLat : (CITY_CENTERS[activeRegion]?.lat ?? -22.3147);
  const currentUserLon = userLon !== null ? userLon : (CITY_CENTERS[activeRegion]?.lon ?? -49.0606);

  const getProDistance = (p: Profissional) => {
    const proCoords = getProCoords(p);
    return calculateHaversineDistance(currentUserLat, currentUserLon, proCoords.lat, proCoords.lon);
  };

  const autocompleteSuggestions = useMemo(() => {
    if (searchTerm.trim().length < 2) return { pros: [], cats: [], cities: [], totalCount: 0 };
    const term = searchTerm.toLowerCase();
    const matchedPros = professionals.filter(p => p.nome.toLowerCase().includes(term) || p.empresa.toLowerCase().includes(term) || p.categoria.toLowerCase().includes(term)).slice(0, 4);
    const matchedCats = CATEGORIES_LIST.filter(c => c.name.toLowerCase().includes(term)).slice(0, 3);
    const allCities = ["São Paulo - SP", "Campinas - SP", "Bauru - SP"];
    const matchedCities = allCities.filter(city => city.toLowerCase().includes(term));
    return { pros: matchedPros, cats: matchedCats, cities: matchedCities, totalCount: matchedPros.length + matchedCats.length + matchedCities.length };
  }, [professionals, searchTerm]);

  const computedCatalog = useMemo(() => {
    const maxDistance = [5, 10, 25, 50, 99999][distanceStepIdx];
    let result = professionals.filter(p => {
      if ((p.denuncias?.length || 0) >= 4) return false;
      if (filterOnlyCertified && !(p.isTanamaoCertificado || p.verificado || p.verificadoCPF || p.verificadoCNPJ)) return false;
      const matchRegion = p.cidade === activeRegion;
      const matchCategory = !selectedCategory || p.categoria.toLowerCase() === selectedCategory.toLowerCase();
      const textMatch = !searchTerm.trim() || p.nome.toLowerCase().includes(searchTerm.toLowerCase()) || p.empresa.toLowerCase().includes(searchTerm.toLowerCase()) || p.bio.toLowerCase().includes(searchTerm.toLowerCase()) || p.categoria.toLowerCase().includes(searchTerm.toLowerCase());
      const avg = getAverageRating(p);
      let matchRating = true;
      if (ratingFilter === '4.5+') matchRating = avg >= 4.5;
      else if (ratingFilter === '4.0+') matchRating = avg >= 4.0;
      const match24h = !only24h || p.atende24h;
      const proCoords = getProCoords(p);
      const dist = calculateHaversineDistance(currentUserLat, currentUserLon, proCoords.lat, proCoords.lon);
      const matchDistance = maxDistance >= 99999 || dist <= maxDistance;
      return matchRegion && matchCategory && textMatch && matchRating && match24h && matchDistance;
    });
    result.sort((a, b) => {
      const getRank = (p: any) => {
        if (p.destaque === 'solo' && p.cidade === activeRegion) return 1;
        if (p.destaque === 'categoria' && selectedCategory && p.categoria.toLowerCase() === selectedCategory.toLowerCase()) return 2;
        if (p.destaque === 'patrocinado' && searchTerm.trim().length > 0) return 3;
        if (p.destaque === 'linha') return 4;
        return 5;
      };
      const rankA = getRank(a), rankB = getRank(b);
      if (rankA !== rankB) return rankA - rankB;
      if (sortOrder === "visitas") return b.visitas - a.visitas;
      else if (sortOrder === "nota") return getAverageRating(b) - getAverageRating(a);
      else if (sortOrder === "recentes") return new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime();
      else if (sortOrder === "alfabetica") return a.nome.localeCompare(b.nome);
      return b.visitas - a.visitas;
    });
    return result;
  }, [professionals, activeRegion, selectedCategory, searchTerm, ratingFilter, sortOrder, only24h, distanceStepIdx, userLat, userLon, filterOnlyCertified]);

  const activeProfile = useMemo(() => professionals.find(p => p.id === selectedProfileId) || null, [professionals, selectedProfileId]);

  // ─── HANDLERS ─────────────────────────────────────────────────────────────
  const handleContactCountAndCharge = (proId: number, type: 'whatsapp' | 'telefone' | 'chat') => {
    const proIndex = professionals.findIndex(p => p.id === proId);
    if (proIndex === -1) return;
    const pro = professionals[proIndex];
    if (pro.planoTipo === 'lead') {
      const currentBalance = pro.saldoLeads ?? 0;
      const chargeAmount = 5.00;
      const nextBalance = Math.max(0, Number((currentBalance - chargeAmount).toFixed(2)));
      const descMap = { whatsapp: 'Contato via WhatsApp', telefone: 'Contato via Ligação de Telefone', chat: 'Primeiro Contato via Chat de Conversa' };
      const newRecord = { data: new Date().toISOString().split('T')[0], tipo: descMap[type], valor: -chargeAmount };
      const updatedPro = { ...pro, saldoLeads: nextBalance, historicoLeads: [newRecord, ...(pro.historicoLeads || [])], leadsRecebidosSemana: (pro.leadsRecebidosSemana ?? 0) + 1 };
      syncDB(professionals.map(p => p.id === proId ? updatedPro : p));
      if (nextBalance < 5.00) addToast(`⚠️ Saldo de leads de ${pro.nome} está baixo: R$ ${nextBalance.toFixed(2)}.`);
      else addToast(`💼 Lead registrado! Saldo do profissional debitado em R$ 5,00.`);
    }
  };

  const handleStartChat = (proId: number) => {
    if (!userSession.logado) { addToast("Para iniciar uma conversa, por favor conecte sua conta! 🔑"); setLoginModalOpen(true); return; }
    const existingSession = chatSessions.find(s => s.clientId === userSession.email && s.proId === proId);
    if (!existingSession) {
      handleContactCountAndCharge(proId, 'chat');
      const newSession: ChatSession = { clientId: userSession.email, proId: proId, messages: [], unlockedPhone: false };
      syncChats([...chatSessions, newSession]);
    }
    setActiveChatProId(proId); setChatModalOpen(true);
  };

  const handleSendChatMessage = (text: string) => {
    if (!text.trim() || activeChatProId === null) return;
    const pro = professionals.find(p => p.id === activeChatProId);
    if (!pro) return;
    let updatedSessions = chatSessions.map(session => {
      if (session.clientId === userSession.email && session.proId === activeChatProId) {
        const newMessage: Message = { sender: 'client', text: text, timestamp: new Date().toISOString() };
        return { ...session, messages: [...session.messages, newMessage], unlockedPhone: true };
      }
      return session;
    });
    syncChats(updatedSessions); setChatMessageText(""); addToast("Mensagem enviada com sucesso! 💬");
    setTimeout(async () => {
      const customAutoText = localStorage.getItem('tanamao_auto_resp_text') || 'Olá! Recebi sua mensagem e retorno em breve. 😊';
      const guarantee = localStorage.getItem('tanamao_response_guarantee') || '2h';
      let replyText = `🤖 [IA Assistente de ${pro.nome}]: Olá, ${userSession.nome}! Recebi sua mensagem: "${text}". Retornarei em no máximo ${guarantee}. Se preferir, meus canais de contato foram liberados em meu perfil!`;
      const replyMsg: Message = { sender: 'pro', text: replyText, timestamp: new Date().toISOString() };
      let freshSessions: ChatSession[] = [];
      const stored = localStorage.getItem('tanamao_chats');
      if (stored) { try { freshSessions = JSON.parse(stored); } catch (e) {} } else { freshSessions = chatSessions; }
      const sessionsWithReply = freshSessions.map(sess => {
        if (sess.clientId === userSession.email && sess.proId === activeChatProId) return { ...sess, messages: [...sess.messages, replyMsg], unlockedPhone: true };
        return sess;
      });
      syncChats(sessionsWithReply); addToast(`Resposta automática de ${pro.nome} 💬`);
    }, 1500);
  };

  const handleStartBooking = (proId: number) => {
    if (!userSession.logado) { addToast("Para agendar um horário, faça login primeiro! 📅"); setLoginModalOpen(true); return; }
    setBookingProId(proId); setSelectedBookingDate(""); setSelectedBookingTime(""); setBookingModalOpen(true);
  };

  const handleConfirmBooking = () => {
    if (!bookingProId || !selectedBookingDate || !selectedBookingTime) { addToast("Selecione uma data e hora válidas para agendar. ⚠️"); return; }
    const pro = professionals.find(p => p.id === bookingProId);
    if (!pro) return;
    const newBooking: Booking = { id: Math.random().toString(36).substring(2, 9).toUpperCase(), clientId: userSession.email, clientName: userSession.nome, proId: pro.id, proNome: pro.nome, proCategoria: pro.categoria, data: selectedBookingDate, hora: selectedBookingTime, status: 'Confirmado' };
    syncBookings([newBooking, ...bookings]); setBookingModalOpen(false); addToast(`📅 Agendamento com ${pro.nome} CONFIRMADO!`);
  };

  const handleUpdateBookingStatus = (bookingId: string, status: 'Confirmado' | 'Concluído' | 'Cancelado') => {
    syncBookings(bookings.map(b => b.id === bookingId ? { ...b, status } : b)); addToast(`Agendamento atualizado para: ${status}! ✅`);
  };

  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [bookingReviewStars, setBookingReviewStars] = useState<number>(5);
  const [bookingReviewComment, setBookingReviewComment] = useState<string>("");

  const handleSubmitBookingReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewBooking) return;
    if (!bookingReviewComment.trim()) { alert("Por favor, preencha o comentário para enviar a avaliação."); return; }
    const newRev = { autor: activeReviewBooking.clientName, estrelas: bookingReviewStars, comentario: bookingReviewComment.trim(), data: new Date().toISOString().split('T')[0] };
    syncDB(professionals.map(p => p.id === activeReviewBooking.proId ? { ...p, avaliacoes: [newRev, ...(p.avaliacoes || [])] } : p));
    syncBookings(bookings.map(b => b.id === activeReviewBooking.id ? { ...b, avaliado: true } : b));
    addToast("Avaliação enviada com sucesso! ⭐"); setReviewModalOpen(false); setActiveReviewBooking(null); setBookingReviewComment(""); setBookingReviewStars(5);
  };

  const handleInitiateContract = (plan: any) => {
    if (!userSession.logado) { addToast("É necessário entrar em uma conta antes de contratar planos! 🔑"); setLoginModalOpen(true); return; }
    setSelectedContractPlan(plan); setContractStep(1); setContractCity(activeRegion || "Bauru - SP"); setContractCategory(selectedCategory || "Reformas"); setCopiedPix(false); setReceiptFileSimulated(false); setContractModalOpen(true);
  };

  const handleConfirmContractStep1 = () => {
    if (!selectedContractPlan) return;
    if (selectedContractPlan.id === 'solo') {
      const existingSolo = professionals.find(p => p.destaque === 'solo' && p.cidade === contractCity && p.id !== userSession.profissionalId);
      if (existingSolo) { addToast(`⚠️ O Destaque Solo nesta cidade já está ocupado por ${existingSolo.nome}.`); return; }
    }
    setContractStep(2); setPaymentPixCountdown(900);
  };

  const handleExecuteContractPurchase = (method: 'pix' | 'card') => {
    if (!selectedContractPlan) return;
    if (method === 'card') { if (!creditCardNumber.trim() || !creditCardName.trim()) { addToast("⚠️ Preencha os dados do cartão!"); return; } }
    else { if (!receiptFileSimulated) { addToast("⚠️ Anexe o comprovante do PIX!"); return; } }
    setContractModalOpen(false); setViewPlanos(false); window.location.hash = '#home';
    addToast(`🚀 Plano ${selectedContractPlan.nome} ativado com sucesso!`);
  };

  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;
    const emailStr = `${usernameInput.trim().toLowerCase().replace(/\s+/g, '')}@tanamao.com.br`;
    const session: UserSession = { nome: usernameInput.trim(), email: emailStr, avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(usernameInput.trim())}&background=1B2A6B&color=F5C800&bold=true`, logado: true, tipo: 'client' };
    setUserSession(session); localStorage.setItem('tanamao_session_user', JSON.stringify(session));
    setLoginFeedback(`Bem-vindo, ${session.nome}!`);
    setTimeout(() => { setLoginModalOpen(false); setLoginFeedback(""); setUsernameInput(""); triggerGeolocation(); }, 1200);
  };

  const handleLogout = async () => { await logout(); };

  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try { const { outcome } = await deferredPrompt.userChoice; if (outcome === 'accepted') { localStorage.setItem('tanamao_is_pwa_installed', 'true'); setShowPwaBanner(false); addToast("🎉 Aplicativo TáNaMão instalado!"); } } catch (e) {}
      setDeferredPrompt(null);
    } else { localStorage.setItem('tanamao_is_pwa_installed', 'true'); setShowPwaBanner(false); addToast("🎉 PWA instalado! (Simulado)"); }
  };

  const handlePwaDismiss = () => {
    const hiddenUntil = Date.now() + 7 * 24 * 60 * 60 * 1000;
    localStorage.setItem('tanamao_pwa_banner_hidden_until', hiddenUntil.toString()); setShowPwaBanner(false);
  };

  const handleAddPhotoUrl = () => { if (tempImageUrl.trim()) { setNewProImages(prev => [...prev, tempImageUrl.trim()]); setTempImageUrl(""); } };

  const handleCreateAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!newProNome.trim() || !newProEmpresa.trim() || !newProCelular.trim() || !newProBio.trim()) { alert("Por favor, preencha os dados básicos obrigatórios (*)."); return; }
    const nextId = professionals.length > 0 ? Math.max(...professionals.map(p => p.id)) + 1 : 1;
    const proAvatars = ["https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200", "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200", "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200", "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200"];
    const finalAvatar = newProAvatar.trim() || proAvatars[nextId % proAvatars.length];
    const finalGallery = newProImages.length > 0 ? newProImages : ["https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600", "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600"];
    const isDocValid = validateDocumento(newProDocumento);
    const newlyBuilt: Profissional = { id: nextId, nome: newProNome.trim(), empresa: newProEmpresa.trim(), categoria: newProCategoria, emoji: newProCategoria === "Reformas" ? "🔨" : newProCategoria === "Beleza" ? "💅" : newProCategoria === "Aulas" ? "📚" : newProCategoria === "Tecnologia" ? "💻" : newProCategoria === "Casa" ? "🏠" : "🤝", cidade: newProCidade, avatar: finalAvatar, bio: newProBio.trim(), telefone: newProTelefone.trim() || "(00) 0000-0000", celular: newProCelular.trim(), email: newProEmail.trim() || "contato@profissional.com.br", endereco: newProEndereco.trim() || "Atendimento presencial e domiciliar", destaque: 'none', atende24h: newPro24h, comGaleriaAmpliada: false, visitas: 1, dataCadastro: new Date().toISOString(), galeria: finalGallery, avaliacoes: [], verificado: isDocValid, documento: newProDocumento.trim() ? newProDocumento.trim() : undefined };
    syncDB([newlyBuilt, ...professionals]);
    setAnnounceSuccess("Seu serviço foi publicado com sucesso no TáNaMão! Redirecionando...");
    addToast("Seu serviço está no ar! Anúncio criado com sucesso 🚀");
    setTimeout(() => { setNewProNome(""); setNewProEmpresa(""); setNewProAvatar(""); setNewProBio(""); setNewProTelefone(""); setNewProCelular(""); setNewProEmail(""); setNewProEndereco(""); setNewProImages([]); setNewPro24h(false); setNewProDocumento(""); setAnnounceSuccess(""); setAnnounceModalOpen(false); setActiveRegion(newProCidade); updateProfileIdWithHash(newlyBuilt.id); }, 2000);
  };

  const handlePostReview = (e: FormEvent, targetProId: number) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) { alert("Preencha o seu nome e seu comentário para avaliar."); return; }
    const newRev = { autor: reviewAuthor.trim(), estrelas: reviewStars, comentario: reviewComment.trim(), data: new Date().toISOString().split('T')[0] };
    syncDB(professionals.map(p => p.id === targetProId ? { ...p, avaliacoes: [newRev, ...(p.avaliacoes || [])] } : p));
    addToast("Avaliação enviada com sucesso! ⭐"); setReviewAuthor(""); setReviewComment(""); setReviewStars(5);
  };

  const handleBoostSelectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!boostProId) { addToast("Por favor, selecione um profissional!"); return; }
    if (paymentMethod === 'pix') {
      if (!receiptFileSimulated) { addToast("Por favor, marque que o comprovante foi anexado!"); return; }
      setPixFeedback("Processando...");
      setTimeout(() => {
        const updated = professionals.map(p => { if (p.id === Number(boostProId)) { if (selectedPlanId === 'solo') return { ...p, destaque: 'solo' as const }; else if (selectedPlanId === 'linha') return { ...p, destaque: 'linha' as const }; else if (selectedPlanId === 'galeria') return { ...p, comGaleriaAmpliada: true }; } return p; });
        syncDB(updated); addToast("Pagamento aprovado! Plano de destaque ativo! 🚀"); setPixFeedback("Confirmado ✅");
        setTimeout(() => { setAnnounceModalOpen(false); setPixFeedback(""); setReceiptFileSimulated(false); setCopiedPix(false); updateProfileIdWithHash(Number(boostProId)); }, 1500);
      }, 2000);
    } else {
      addToast("Autorizando pagamento...");
      setTimeout(() => {
        const updated = professionals.map(p => { if (p.id === Number(boostProId)) { if (selectedPlanId === 'solo') return { ...p, destaque: 'solo' as const }; else if (selectedPlanId === 'linha') return { ...p, destaque: 'linha' as const }; else if (selectedPlanId === 'galeria') return { ...p, comGaleriaAmpliada: true }; } return p; });
        syncDB(updated); addToast("Transação autorizada! Plano habilitado."); setAnnounceModalOpen(false); updateProfileIdWithHash(Number(boostProId));
      }, 1500);
    }
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gray-100 text-slate-800 font-sans flex flex-col antialiased selection:bg-brand-blue selection:text-brand-yellow">

      {/* SPLASH */}
      <AnimatePresence>
        {showSplash && (
          <motion.div id="splash-screen" initial={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.5 }} className="fixed inset-0 z-50 bg-[#F5C800] flex flex-col items-center justify-center select-none">
            <div className="flex flex-col items-center text-center px-6">
              <Logo size={120} mode="original" className="animate-pulse shadow-md rounded-2xl" />
              <h1 className="text-[#1A1A1A] font-black text-[28px] mt-4 font-display tracking-tight leading-none">TáNaMão</h1>
              <p className="text-[#1A1A1A] font-extrabold text-[14px] mt-1.5 opacity-90">Conecte-se com os melhores</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════════════════════════════════════════
          HEADER — ESTILO MERCADO LIVRE COM CORES TANAMÃO
      ════════════════════════════════════════════════════════ */}
      <header className="sticky top-0 z-40 bg-brand-yellow shadow-md">
        {/* Linha 1: Logo + Busca + Ações */}
        <div className="px-3 py-2.5 flex items-center gap-2">
          {/* Logo */}
          <div onClick={() => { updateProfileIdWithHash(null); setSelectedCategory(""); setSearchTerm(""); }} className="flex items-center gap-2 cursor-pointer select-none shrink-0">
            <Logo size={36} mode="original" className="rounded-xl" />
            <div className="hidden sm:block">
              <span className="text-brand-blue font-black text-base leading-none block">TáNaMão</span>
              <span className="text-brand-blue/70 text-[9px] font-bold uppercase tracking-wider">Páginas Amarelas</span>
            </div>
          </div>

          {/* Barra de busca central — igual ML */}
          <div className="flex-1 relative">
            <div className="flex items-center bg-white rounded-full px-4 py-2.5 shadow-sm border border-yellow-300">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setAutocompleteOpen(true); }}
                onFocus={() => setAutocompleteOpen(true)}
                onKeyDown={(e) => { if (e.key === 'Escape' || e.key === 'Enter') setAutocompleteOpen(false); }}
                placeholder="Buscar profissionais e serviços..."
                className="flex-1 outline-none text-sm text-brand-blue placeholder-gray-400 bg-transparent"
              />
              {searchTerm ? (
                <button onClick={() => { setSearchTerm(""); setAutocompleteOpen(false); }} className="text-gray-400 hover:text-gray-600 mr-1"><X className="w-4 h-4" /></button>
              ) : null}
              <Search className="w-4 h-4 text-brand-blue flex-shrink-0" />
            </div>

            {/* Autocomplete dropdown */}
            {autocompleteOpen && autocompleteSuggestions.totalCount > 0 && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setAutocompleteOpen(false)} />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden text-slate-800">
                  {autocompleteSuggestions.cats.length > 0 && (
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 px-2">Categorias</p>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {autocompleteSuggestions.cats.map(cat => (
                          <button key={cat.id} onClick={() => { setSelectedCategory(cat.name); setSearchTerm(""); setAutocompleteOpen(false); updateProfileIdWithHash(null); }} className="bg-brand-blue/5 hover:bg-brand-blue/10 text-brand-blue rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-all">
                            <span>{cat.emoji}</span><span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {autocompleteSuggestions.pros.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1 px-2">Profissionais</p>
                      {autocompleteSuggestions.pros.map(pro => (
                        <button key={pro.id} onClick={() => { updateProfileIdWithHash(pro.id); setSearchTerm(""); setAutocompleteOpen(false); }} className="w-full flex items-center gap-2.5 text-left p-2 hover:bg-slate-50 rounded-xl transition-all">
                          <img src={pro.avatar} alt={pro.nome} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                          <div>
                            <h4 className="text-xs font-bold text-slate-800">{pro.nome}</h4>
                            <p className="text-[10px] text-slate-500">{pro.empresa} • {pro.categoria}</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Ícone câmera (busca por foto) */}
          <button className="p-2 text-brand-blue hover:bg-yellow-300 rounded-full transition hidden sm:block">
            <Search className="w-5 h-5" />
          </button>

          {/* Notificações */}
          <div className="relative">
            <button onClick={() => setNotificationDrawerOpen(!notificationDrawerOpen)} className="relative p-2 text-brand-blue hover:bg-yellow-300 rounded-full transition">
              <Bell className="w-5 h-5" />
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold animate-pulse">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </button>
            {notificationDrawerOpen && (
              <div className="absolute right-0 mt-3 w-72 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-3 px-4 text-xs z-50">
                <div className="flex items-center justify-between border-b pb-2 mb-2">
                  <span className="font-bold text-slate-900">Central de Alertas 🔔</span>
                  {notifications.some(n => !n.read) && (
                    <button onClick={() => { syncNotifications(notifications.map(n => ({ ...n, read: true }))); addToast("Todas marcadas como lidas! ✓"); }} className="text-[10px] text-brand-blue font-bold hover:underline">Lidas ✓</button>
                  )}
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                  {notifications.length === 0 ? <p className="text-center text-slate-400 py-4">Nenhum alerta recente.</p> : notifications.map((not) => (
                    <div key={not.id} onClick={() => { syncNotifications(notifications.map(n => n.id === not.id ? { ...n, read: true } : n)); setNotificationDrawerOpen(false); }} className={`p-2 rounded-xl border cursor-pointer ${not.read ? 'bg-white border-transparent hover:bg-slate-50' : 'bg-blue-50/60 border-blue-100 font-semibold'}`}>
                      <p className="leading-snug">{not.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Conta */}
          {userSession.logado ? (
            <button onClick={() => { setActiveUserPanelTab("agendamentos"); setUserPanelOpen(true); }} className="shrink-0">
              <img src={userSession.avatar} alt="avatar" className="w-8 h-8 rounded-full border-2 border-brand-blue object-cover shadow" />
            </button>
          ) : (
            <button onClick={() => setLoginModalOpen(true)} className="shrink-0 flex items-center gap-1 bg-brand-blue text-brand-yellow px-3 py-1.5 rounded-full text-xs font-bold transition">
              <User className="w-3.5 h-3.5" /><span className="hidden sm:inline">Entrar</span>
            </button>
          )}
        </div>

        {/* Linha 2: Localização */}
        <div className="px-4 pb-2 flex items-center gap-1.5 cursor-pointer" onClick={() => setRegionModalOpen(true)}>
          <MapPin className="w-3.5 h-3.5 text-brand-blue shrink-0" />
          <span className="text-brand-blue text-xs font-semibold truncate">
            {activeRegion ? activeRegion : "Onde você está?"}
          </span>
          <ChevronRight className="w-3 h-3 text-brand-blue" />
        </div>

        {/* Linha 3: Category tabs deslizáveis — igual ML */}
        <div className="bg-brand-yellow border-t border-yellow-300">
          <div className="flex gap-0 overflow-x-auto scrollbar-hide px-2 py-1.5">
            {[{ id: 'all', label: 'Tudo' }, ...CATEGORIES_LIST.map(c => ({ id: c.name, label: c.name }))].map((cat) => (
              <button
                key={cat.id}
                onClick={() => { setActiveCategoryTab(cat.id); setSelectedCategory(cat.id === 'all' ? '' : cat.id); }}
                className={`flex-shrink-0 px-4 py-1.5 text-sm font-semibold whitespace-nowrap transition-all border-b-2 ${
                  activeCategoryTab === cat.id
                    ? 'border-brand-blue text-brand-blue font-bold'
                    : 'border-transparent text-brand-blue/70 hover:text-brand-blue'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* PWA BANNER */}
      {showPwaBanner && (
        <div className="bg-gradient-to-r from-indigo-700 to-brand-blue text-white py-3 px-4 shadow-md z-35">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-semibold">
            <div className="flex items-center gap-2.5"><span className="text-xl animate-bounce">📱</span><p><strong>Instale o TáNaMão</strong> no seu celular — grátis e funciona offline!</p></div>
            <div className="flex items-center gap-2">
              <button onClick={handlePwaInstall} className="bg-brand-yellow hover:bg-yellow-300 text-brand-blue text-xs font-black uppercase px-4 py-2 rounded-xl shadow-sm transition">Instalar agora</button>
              <button onClick={handlePwaDismiss} className="bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold px-3 py-2 rounded-xl transition">Agora não</button>
            </div>
          </div>
        </div>
      )}

      {/* ════════════════════════════════════════════════════════
          CONTEÚDO PRINCIPAL
      ════════════════════════════════════════════════════════ */}
      <main className="flex-1 pb-24 md:pb-0">

        {viewPainel ? (
          <div className="max-w-7xl mx-auto px-4 py-6">
            <ProfessionalPanel userSession={userSession} professionals={professionals} syncDB={syncDB} bookings={bookings} syncBookings={syncBookings} chatSessions={chatSessions} syncChats={syncChats} notifications={notifications} syncNotifications={syncNotifications} addToast={addToast} activePainelTab={activePainelTab} setActivePainelTab={setActivePainelTab} setSelectedContractPlan={setSelectedContractPlan} setContractCity={setContractCity} setContractStep={setContractStep} setContractModalOpen={setContractModalOpen} />
          </div>
        ) : selectedProfileId !== null && activeProfile ? (

          /* ── PERFIL DO PROFISSIONAL ───────────────────────── */
          <div className="max-w-7xl mx-auto px-4 py-6 space-y-6 animate-slideup">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button onClick={() => updateProfileIdWithHash(null)} className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold shadow transition-all">
                <ArrowLeft className="w-4 h-4" /><span>Voltar ao catálogo</span>
              </button>
              <div className="flex gap-2 justify-end">
                <button onClick={() => { setStoriesModalOpen(true); addToast("🎨 Card de Stories preparado!"); }} className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full text-xs font-bold shadow transition"><Share2 className="w-4 h-4" /><span>Gerar Stories</span></button>
                <button onClick={() => toggleFavorite(activeProfile.id)} className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold shadow border transition ${favorites.includes(activeProfile.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  <Heart className={`w-4 h-4 ${favorites.includes(activeProfile.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{favorites.includes(activeProfile.id) ? "Favoritado" : "Favoritar"}</span>
                </button>
              </div>
            </div>

            {/* Hero do perfil */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm">
              <div className="h-44 md:h-60 bg-gradient-to-r from-brand-blue to-brand-blue-dark relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5C5C5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg">📍 Atendimento Credenciado</div>
              </div>
              <div className="p-6 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20">
                <img src={activeProfile.avatar} alt={activeProfile.nome} className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-md bg-white shrink-0" />
                <div className="text-center md:text-left flex-1 space-y-1.5 md:pb-3">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                    <span className="bg-brand-yellow text-brand-blue font-bold text-xs uppercase px-2.5 py-0.5 rounded-full">{activeProfile.emoji} {activeProfile.categoria}</span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold">{activeProfile.cidade}</span>
                  </div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">{activeProfile.nome}</h1>
                    {activeProfile.verificado && <span className="inline-flex items-center gap-1 bg-brand-blue text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm">✅ VERIFICADO</span>}
                    {activeProfile.atende24h && <span className="inline-flex items-center gap-1 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">🕐 24 HORAS</span>}
                  </div>
                  <p className="text-sm text-slate-500 font-semibold">💼 {activeProfile.empresa}</p>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-3 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1 text-brand-blue"><Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" /><strong className="text-slate-900">{getAverageRating(activeProfile).toFixed(1)}</strong><span>({getRatingCount(activeProfile)} avaliações)</span></span>
                    <span className="h-4 w-px bg-slate-300"></span>
                    <span className="flex items-center gap-1"><Eye className="w-4 h-4 text-slate-400" /><strong className="text-slate-900">{activeProfile.visitas}</strong> visitas</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              <div className="lg:col-span-8 space-y-6">
                {/* Bio */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2 border-b pb-3"><Briefcase className="w-5 h-5 text-brand-blue" />Apresentação Profissional</h3>
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-slate-50 p-4 rounded-2xl">{activeProfile.bio}</p>
                </div>
                {/* Galeria */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2"><ImageIcon className="w-5 h-5 text-brand-blue" />Galeria de Projetos</h3>
                    <span className="text-xs text-slate-400 font-bold">{activeProfile.galeria ? activeProfile.galeria.length : 0} fotos</span>
                  </div>
                  {activeGalleryPhoto && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 h-64 sm:h-96 flex items-center justify-center">
                      <img src={activeGalleryPhoto} alt="Portfólio" className="max-w-full max-h-full object-contain" />
                    </div>
                  )}
                  {activeProfile.galeria && activeProfile.galeria.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {(activeProfile.comGaleriaAmpliada ? activeProfile.galeria : activeProfile.galeria.slice(0, 5)).map((pic, idx) => (
                        <button key={idx} onClick={() => setActiveGalleryPhoto(pic)} className={`relative rounded-xl overflow-hidden h-14 md:h-20 border-2 transition ${activeGalleryPhoto === pic ? 'border-brand-blue scale-95 ring-4 ring-brand-yellow/30' : 'border-slate-200 opacity-80 hover:opacity-100'}`}>
                          <img src={pic} alt={`Slide ${idx + 1}`} className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                {/* Avaliações */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  <div className="flex items-center justify-between border-b pb-3">
                    <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2"><Star className="w-5 h-5 fill-brand-yellow text-brand-yellow" />Avaliações dos Clientes</h3>
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">Média {getAverageRating(activeProfile).toFixed(1)} / 5.0</span>
                  </div>
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {activeProfile.avaliacoes && activeProfile.avaliacoes.length > 0 ? activeProfile.avaliacoes.map((av, index) => (
                      <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
                        <div className="flex items-start justify-between">
                          <div><h5 className="text-xs font-extrabold text-slate-900">{av.autor}</h5><p className="text-[10px] text-slate-400 font-semibold">{av.data}</p></div>
                          <div className="flex gap-0.5">{[...Array(5)].map((_, stIdx) => (<Star key={stIdx} className={`w-3.5 h-3.5 ${stIdx < av.estrelas ? 'fill-brand-yellow text-brand-yellow' : 'text-slate-300'}`} />))}</div>
                        </div>
                        <p className="text-xs text-slate-600 italic">💬 "{av.comentario}"</p>
                      </div>
                    )) : <div className="text-center py-6 text-slate-400 text-xs">Nenhuma avaliação ainda. Seja o primeiro!</div>}
                  </div>
                  <form onSubmit={(e) => handlePostReview(e, activeProfile.id)} className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <h4 className="text-xs font-bold text-slate-900 uppercase">✍️ Avaliar este profissional</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Meu Nome:</label>
                        <input type="text" required value={reviewAuthor} onChange={(e) => setReviewAuthor(e.target.value)} placeholder="Ex: Amanda Lima" className="bg-white text-slate-800 text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-blue" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Estrelas:</label>
                        <div className="flex items-center gap-1.5 mt-1.5">
                          {[1,2,3,4,5].map((stValue) => (<button type="button" key={stValue} onClick={() => setReviewStars(stValue)} className="focus:outline-none hover:scale-110 transition"><Star className={`w-6 h-6 cursor-pointer ${stValue <= reviewStars ? 'fill-brand-yellow text-brand-yellow' : 'text-slate-300'}`} /></button>))}
                        </div>
                      </div>
                    </div>
                    <textarea rows={3} required value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Fale sobre o serviço prestado..." className="bg-white text-slate-800 text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-blue placeholder:text-slate-400" />
                    <div className="flex justify-end"><button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-brand-yellow px-4 py-2 rounded-xl text-xs font-bold transition">Publicar Avaliação</button></div>
                  </form>
                </div>
              </div>

              {/* Sidebar contatos */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="text-slate-950 font-black text-xs uppercase tracking-wide border-b pb-2">📱 Canais de Contato</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button onClick={() => handleStartChat(activeProfile.id)} className="flex items-center justify-center gap-1.5 p-3 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-2xl font-black text-xs uppercase shadow transition">
                      <MessageSquare className="w-4 h-4 text-brand-yellow shrink-0" /><span>Chat</span>
                    </button>
                    <button onClick={() => handleStartBooking(activeProfile.id)} className="flex items-center justify-center gap-1.5 p-3 bg-brand-yellow text-brand-blue hover:bg-yellow-300 rounded-2xl font-black text-xs uppercase shadow transition">
                      <Calendar className="w-4 h-4 shrink-0" /><span>Agendar</span>
                    </button>
                  </div>
                  {!chatSessions.some(c => c.proId === activeProfile.id && c.clientId === userSession.email && c.messages.length > 0) ? (
                    <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                      <p className="text-[10px] uppercase font-bold text-slate-400 text-center">🔐 Contatos Privados</p>
                      <p className="text-xs text-slate-500 text-center">Envie uma mensagem para liberar os contatos</p>
                      <button onClick={() => handleStartChat(activeProfile.id)} className="w-full py-2.5 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-xl text-xs font-black uppercase transition">💬 Iniciar Conversa</button>
                    </div>
                  ) : (
                    <>
                      {activeProfile.telefone && (
                        <a href={`tel:${activeProfile.telefone.replace(/\D/g, '')}`} onClick={() => handleContactCountAndCharge(activeProfile.id, 'telefone')} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl group transition">
                          <div className="p-2.5 bg-brand-blue text-brand-yellow rounded-xl"><Phone className="w-5 h-5" /></div>
                          <div><p className="text-[10px] font-bold text-slate-400 uppercase">Telefone</p><p className="text-xs font-extrabold text-slate-800">{activeProfile.telefone}</p></div>
                        </a>
                      )}
                      {activeProfile.celular && (
                        <a href={`https://api.whatsapp.com/send?phone=55${activeProfile.celular.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá ${activeProfile.nome}, encontrei seu anúncio no TáNaMão e gostaria de um orçamento!`)}`} target="_blank" rel="noopener noreferrer" onClick={() => handleContactCountAndCharge(activeProfile.id, 'whatsapp')} className="flex items-center justify-center gap-2 w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs uppercase shadow transition">
                          <PhoneCall className="w-4 h-4 fill-white text-white shrink-0" /><span>Conversar no WhatsApp</span>
                        </a>
                      )}
                    </>
                  )}
                  {activeProfile.email && (
                    <a href={`mailto:${activeProfile.email}`} className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl group transition">
                      <div className="p-2.5 bg-brand-blue text-brand-yellow rounded-xl"><Mail className="w-5 h-5" /></div>
                      <div className="min-w-0"><p className="text-[10px] font-bold text-slate-400 uppercase">Email</p><p className="text-xs font-extrabold text-slate-800 truncate">{activeProfile.email}</p></div>
                    </a>
                  )}
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold"><MapPin className="w-4 h-4 text-brand-blue shrink-0" /><span>Endereço</span></div>
                    <p className="font-semibold">{activeProfile.endereco}</p>
                    <span className="text-[10px] font-bold bg-brand-blue text-brand-yellow px-2 py-0.5 rounded inline-block">📍 {activeProfile.cidade}</span>
                  </div>
                </div>
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-xs text-slate-500 space-y-2">
                  <h4 className="font-extrabold text-slate-800 uppercase flex items-center gap-1.5"><AlertCircle className="w-4 h-4 text-emerald-600" />Utilidade Pública</h4>
                  <p className="leading-relaxed">O <strong>TáNaMão</strong> é um diretório de listagem. Sempre solicite orçamentos por escrito e negocie com segurança.</p>
                </div>
              </div>
            </div>
          </div>

        ) : (
          /* ── HOME / CATÁLOGO — LAYOUT MERCADO LIVRE ─────────── */
          <div className="animate-fadein">

            {/* BANNER PRINCIPAL — estilo ML */}
            <div className="bg-brand-yellow px-3 pt-2 pb-3">
              {regionAdvertisers.length > 0 ? (
                <div className="relative h-[160px] md:h-[200px] rounded-2xl overflow-hidden border border-yellow-400 shadow-md">
                  {regionAdvertisers.map((ad, idx) => (
                    <div key={ad.id + '-' + idx} className={`absolute inset-0 transition-opacity duration-700 flex flex-col justify-center px-6 py-4 ${idx === currentAdIdx ? 'opacity-100 z-10' : 'opacity-0 z-0'}`} style={{ backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(27,42,107,0.6) 60%, rgba(27,42,107,0.2) 100%), url(${ad.foto})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                      <span className="inline-flex items-center gap-1 bg-brand-yellow text-brand-blue text-[10px] font-black uppercase py-0.5 px-2.5 rounded-full shadow mb-2 w-fit">⭐ Destaque — {ad.cidade}</span>
                      <h2 className="text-lg md:text-2xl font-black text-white uppercase truncate max-w-lg">{ad.nome}</h2>
                      <p className="text-[11px] text-slate-200 font-medium leading-tight max-w-sm line-clamp-1 mt-1">{ad.slogan}</p>
                      <div className="mt-2">
                        {(ad as any).isReal ? (
                          <button onClick={() => { updateProfileIdWithHash(ad.id); }} className="bg-brand-yellow hover:bg-yellow-300 text-brand-blue px-4 py-1.5 rounded-xl text-xs font-black uppercase shadow transition">Ver perfil</button>
                        ) : (
                          <a href={`https://api.whatsapp.com/send?phone=55${ad.whatsapp}&text=${encodeURIComponent(`Olá ${ad.nome}, vi seu destaque no TáNaMão e gostaria de um orçamento!`)}`} target="_blank" rel="noopener noreferrer" className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-1.5 rounded-xl text-xs font-black uppercase shadow transition inline-flex items-center gap-1.5">
                            <PhoneCall className="w-3.5 h-3.5 fill-white" /><span>WhatsApp</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                  {regionAdvertisers.length > 1 && (
                    <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/30 p-1 rounded-full">
                      {regionAdvertisers.map((_, dotIndex) => (<button key={dotIndex} onClick={() => setCurrentAdIdx(dotIndex)} className={`w-1.5 h-1.5 rounded-full transition-all ${dotIndex === currentAdIdx ? 'bg-brand-yellow w-3' : 'bg-white/50'}`} />))}
                    </div>
                  )}
                </div>
              ) : (
                <div className="relative h-[160px] rounded-2xl overflow-hidden border border-yellow-400 shadow-md flex items-center px-6" style={{ backgroundImage: `linear-gradient(to right, rgba(15,23,42,0.92) 0%, rgba(27,42,107,0.7) 100%), url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200)`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                  <div className="max-w-2xl space-y-2">
                    <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-brand-yellow text-[10px] font-black uppercase py-1 px-3 rounded-md">👑 ESPAÇO DISPONÍVEL</span>
                    <h2 className="text-base md:text-xl font-black text-white uppercase">Seja o Destaque em {activeRegion ? activeRegion.split(' - ')[0] : "Sua Cidade"}!</h2>
                    <p className="text-[11px] text-slate-200 font-medium leading-tight max-w-sm">Ocupe este banner exclusivo por apenas R$97/semana.</p>
                    <button onClick={() => { setSelectedPlanId('solo'); setMonetizationTab('boost'); setAnnounceModalOpen(true); }} className="bg-brand-yellow hover:bg-yellow-300 text-brand-blue text-xs font-black uppercase px-4 py-1.5 rounded-xl shadow transition">Anuncie aqui →</button>
                  </div>
                </div>
              )}
            </div>

            {/* FAIXA OFERTA ESPECIAL — igual ML roxo */}
            <div className="bg-brand-yellow px-3 pb-2">
              <button onClick={() => setAnnounceModalOpen(true)} className="w-full bg-[#7B2D8B] hover:bg-[#6a2579] text-white rounded-xl py-2.5 px-4 flex items-center justify-between text-xs font-bold transition shadow">
                <span>🎯 OFERTA ESPECIAL | Publique seu serviço GRÁTIS hoje!</span>
                <ChevronRight className="w-4 h-4 shrink-0" />
              </button>
            </div>

            {/* ÍCONES DE ACESSO RÁPIDO — igual ML */}
            <div className="bg-white mx-3 mt-3 rounded-2xl shadow-sm border border-slate-100 p-3">
              <div className="grid grid-cols-6 gap-2">
                {ML_QUICK_ICONS.map((item) => (
                  <button key={item.id} onClick={() => { if (item.id === 'ofertas') setAnnounceModalOpen(true); else if (item.id !== 'all') { setSelectedCategory(item.id === 'servicos' ? '' : ''); addToast(`Navegando: ${item.label}`); } }} className="flex flex-col items-center gap-1.5 p-1 hover:scale-105 transition-transform">
                    <div className={`${item.color} ${item.textColor} w-10 h-10 rounded-full flex items-center justify-center text-lg font-black border-2 border-white shadow-sm`}>
                      {item.id === 'ofertas' ? '%' : item.emoji}
                    </div>
                    <span className="text-[10px] font-medium text-slate-700 text-center leading-tight line-clamp-2">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* OFERTAS RELÂMPAGO — estilo ML */}
            {computedOffers.length > 0 && (
              <div className="mx-3 mt-3">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                  <div className="bg-brand-blue px-4 py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-brand-yellow animate-bounce" />
                      <span className="text-white font-black text-sm">OFERTAS RELÂMPAGO</span>
                    </div>
                    <span className="text-brand-yellow text-xs font-bold">Encerram em breve ⏰</span>
                  </div>
                  <div className="flex gap-3 overflow-x-auto p-3 snap-x">
                    {computedOffers.map((of) => (
                      <div key={of.id} className="flex-shrink-0 w-40 snap-center">
                        <div className="relative h-28 bg-slate-100 rounded-xl overflow-hidden">
                          <img src={of.imagem} alt={of.titulo} className="w-full h-full object-cover" />
                          <div className="absolute top-1.5 left-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{of.desconto}</div>
                        </div>
                        <div className="mt-2 space-y-1">
                          <p className="text-[11px] font-bold text-slate-800 line-clamp-2 leading-tight">{of.titulo}</p>
                          <p className="text-[10px] text-slate-400 line-through">R$ {of.precoOriginal.toFixed(2)}</p>
                          <p className="text-sm font-black text-brand-blue">R$ {of.precoPromocional.toFixed(2)}</p>
                          <button onClick={() => updateProfileIdWithHash(of.profissionalId)} className="w-full bg-brand-blue text-white text-[10px] font-bold py-1.5 rounded-lg">Ver Vaga</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* GRID PRINCIPAL DE PROFISSIONAIS — estilo ML 2 colunas */}
            <div className="mx-3 mt-3">
              {/* Filtros compactos */}
              <div className="flex items-center gap-2 mb-3 overflow-x-auto pb-1">
                <button onClick={() => setOnly24h(!only24h)} className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-bold border transition ${only24h ? 'bg-brand-blue text-white border-brand-blue' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}>
                  🕐 24h
                </button>
                <select value={ratingFilter} onChange={(e) => setRatingFilter(e.target.value)} className="flex-shrink-0 bg-white text-slate-700 text-[11px] font-bold border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none">
                  <option value="all">Todas as notas</option>
                  <option value="4.5+">Nota 4.5+ ⭐</option>
                  <option value="4.0+">Nota 4.0+ ⭐</option>
                </select>
                <select value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} className="flex-shrink-0 bg-white text-slate-700 text-[11px] font-bold border border-slate-200 rounded-full px-3 py-1.5 focus:outline-none">
                  <option value="visitas">Mais visitados</option>
                  <option value="nota">Melhor avaliados</option>
                  <option value="recentes">Mais recentes</option>
                  <option value="alfabetica">A-Z</option>
                </select>
                {(selectedCategory || searchTerm || ratingFilter !== 'all') && (
                  <button onClick={() => { setSelectedCategory(""); setSearchTerm(""); setRatingFilter("all"); setDistanceStepIdx(4); setSortOrder("visitas"); setActiveCategoryTab('all'); }} className="flex-shrink-0 px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-[11px] font-bold">✕ Limpar</button>
                )}
              </div>

              <p className="text-[11px] text-slate-400 font-medium mb-3">
                <strong className="text-slate-700">{computedCatalog.length}</strong> profissionais em {activeRegion}
              </p>

              {computedCatalog.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {computedCatalog.map((p) => {
                    const avgNote = getAverageRating(p);
                    return (
                      <div key={p.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col group">
                        {/* Imagem */}
                        <div className="relative aspect-square bg-slate-100 overflow-hidden">
                          <img src={p.galeria && p.galeria.length > 0 ? p.galeria[0] : p.avatar} alt={p.nome} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          {/* Badges */}
                          <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                            {p.destaque && p.destaque !== 'none' && <span className="bg-brand-yellow text-brand-blue text-[9px] font-black px-2 py-0.5 rounded shadow">DESTAQUE</span>}
                            {p.atende24h && <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow animate-pulse">24h</span>}
                          </div>
                          {/* Favoritar */}
                          <button onClick={() => toggleFavorite(p.id)} className="absolute top-2 right-2 p-1.5 bg-white/85 hover:bg-white rounded-full transition z-10 shadow-sm">
                            <Heart className={`w-3.5 h-3.5 ${favorites.includes(p.id) ? 'fill-red-500 text-red-500' : 'text-slate-400 hover:text-red-500'}`} />
                          </button>
                          {/* Mais vendido badge (para destaques) */}
                          {p.destaque === 'solo' && (
                            <div className="absolute bottom-0 left-0 right-0 bg-brand-blue/90 text-brand-yellow text-[9px] font-black uppercase px-2 py-1 text-center">MAIS PEDIDO</div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="p-3 flex-1 flex flex-col justify-between">
                          <div className="space-y-1">
                            <h4 onClick={() => updateProfileIdWithHash(p.id)} className="text-xs font-bold text-slate-800 leading-tight line-clamp-2 cursor-pointer hover:text-brand-blue transition">
                              {p.nome}
                            </h4>
                            <p className="text-[10px] text-slate-400 font-medium">{p.empresa}</p>
                          </div>

                          <div className="mt-2 space-y-1.5">
                            {/* Rating */}
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (<Star key={i} className={`w-3 h-3 ${i < Math.floor(avgNote) ? 'fill-yellow-400 text-yellow-400' : 'text-slate-300'}`} />))}
                              <span className="text-[10px] font-bold text-slate-600 ml-1">{avgNote.toFixed(1)}</span>
                              <span className="text-[10px] text-slate-400">({getRatingCount(p)})</span>
                            </div>

                            {/* Frete grátis / categoria */}
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] text-emerald-600 font-bold">✓ Disponível</span>
                              <span className="text-[9px] text-slate-400 font-medium">{p.emoji} {p.categoria}</span>
                            </div>

                            <button onClick={() => updateProfileIdWithHash(p.id)} className="w-full bg-brand-blue hover:bg-brand-blue-dark text-white text-[10px] font-black uppercase py-2 rounded-lg transition mt-1">
                              Ver Perfil
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <p className="text-xl mb-2">🔍</p>
                  <h4 className="font-bold text-slate-800">Nenhum profissional encontrado</h4>
                  <p className="text-xs text-slate-400 mt-1">Tente limpar os filtros ou ajustar sua pesquisa.</p>
                  <button onClick={() => { setSelectedCategory(""); setSearchTerm(""); setRatingFilter("all"); setActiveCategoryTab('all'); }} className="mt-3 text-xs bg-brand-blue text-white px-4 py-2 rounded-full font-bold shadow">Resetar</button>
                </div>
              )}
            </div>

            {/* FOOTER */}
            <footer className="bg-brand-blue text-slate-400 text-xs py-8 border-t border-brand-blue-dark mt-8 mx-3 rounded-2xl mb-3">
              <div className="px-6 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">TáNaMão Páginas Amarelas</h4>
                  <p className="leading-relaxed text-slate-400">O maior diretório digital de profissionais locais.</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">Atendimento</h4>
                  <p>🇧🇷 Todo o Brasil</p>
                </div>
                <div className="space-y-2">
                  <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">Suporte</h4>
                  <p className="text-white font-bold">✉️ apptanamaoprofissionais@gmail.com</p>
                  <button onClick={() => setContactModalOpen(true)} className="text-brand-yellow font-bold hover:text-white transition">📩 Enviar mensagem</button>
                </div>
              </div>
              <div className="px-6 pt-6 mt-6 border-t border-brand-blue-dark/50 text-center text-[11px] text-slate-500">
                © 2025 TáNaMão — Todos os direitos reservados
              </div>
            </footer>
          </div>
        )}
      </main>

      {/* ════════════════════════════════════════════════════════
          BOTTOM NAVIGATION — ESTILO ML
      ════════════════════════════════════════════════════════ */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex justify-around items-center px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
        <button onClick={() => { window.location.hash = '#home'; setSelectedCategory(""); setSearchTerm(""); updateProfileIdWithHash(null); setActiveCategoryTab('all'); }} className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold ${(!viewPainel && selectedProfileId === null) ? 'text-brand-blue' : 'text-slate-400'}`}>
          <HomeIcon className="w-5 h-5 mb-0.5" /><span>Início</span>
        </button>
        <button onClick={() => { const el = document.querySelector('input[placeholder*="Buscar"]') as HTMLInputElement; if (el) el.focus(); }} className="flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold text-slate-400">
          <Search className="w-5 h-5 mb-0.5" /><span>Buscar</span>
        </button>
        <button onClick={() => { if (!userSession.logado) { addToast("Faça login para ver sua agenda! 📅"); setLoginModalOpen(true); } else if (userSession.tipo === 'pro') { window.location.hash = '#/painel'; setActivePainelTab('agendamentos'); } else { setActiveUserPanelTab('agendamentos'); setUserPanelOpen(true); } }} className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold ${(viewPainel && activePainelTab === 'agendamentos') ? 'text-brand-blue' : 'text-slate-400'}`}>
          <Calendar className="w-5 h-5 mb-0.5" /><span>Agenda</span>
        </button>
        <button onClick={() => { if (!userSession.logado) { setLoginModalOpen(true); } else if (userSession.tipo === 'pro') { window.location.hash = '#/painel'; setActivePainelTab('mensagem'); } else { setActiveUserPanelTab('conversas'); setUserPanelOpen(true); } }} className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold ${(viewPainel && activePainelTab === 'mensagem') ? 'text-brand-blue' : 'text-slate-400'}`}>
          <MessageSquare className="w-5 h-5 mb-0.5" /><span>Mensagens</span>
        </button>
        <button onClick={() => { if (!userSession.logado) { setLoginModalOpen(true); } else if (userSession.tipo === 'pro') { window.location.hash = '#/painel'; } else { setUserPanelOpen(true); } }} className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold ${viewPainel ? 'text-brand-blue' : 'text-slate-400'}`}>
          <User className="w-5 h-5 mb-0.5" /><span>{userSession.logado ? (userSession.tipo === 'pro' ? 'Painel' : 'Conta') : 'Entrar'}</span>
        </button>
      </nav>

      {/* FLOATING BUTTON */}
      <button onClick={() => setAnnounceModalOpen(true)} className="fixed bottom-24 md:bottom-6 right-4 z-35 bg-brand-yellow hover:bg-yellow-300 text-brand-blue p-3.5 rounded-full shadow-lg border-2 border-brand-blue flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wide transition-all hover:-translate-y-1 active:translate-y-0.5 animate-bounce hover:animate-none" title="Anuncie seu serviço">
        <PlusCircle className="w-5 h-5 shrink-0" /><span className="hidden sm:inline">Anuncie</span>
      </button>

      {/* TOASTS */}
      <div className="fixed top-20 right-4 z-[200] space-y-2 pointer-events-none">
        {toasts.map(t => (
          <div key={t.id} className="bg-brand-blue text-white text-xs font-bold px-4 py-3 rounded-2xl shadow-lg border border-brand-blue-dark max-w-[280px] animate-slideup">
            {t.message}
          </div>
        ))}
      </div>

      {/* ════════════════ MODAIS ════════════════ */}

      {/* MODAL REGIÃO */}
      {regionModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5 animate-slideup my-8">
            <div className="text-center space-y-2">
              <h3 className="text-lg font-black text-slate-900 font-display">🌎 Sua Localização</h3>
              <p className="text-xs text-slate-400">Encontre profissionais perto de você</p>
            </div>
            {showLocationFallback && (<div className="bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-200 text-xs font-semibold flex items-start gap-2.5"><AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" /><p>Ative a localização ou selecione manualmente abaixo.</p></div>)}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              {geoFeedback && <p className="text-xs font-bold text-brand-blue bg-yellow-50 px-3 py-2 rounded-xl border border-yellow-200">{geoFeedback}</p>}
              <button type="button" onClick={triggerGeolocation} disabled={geoLoading} className="w-full py-2.5 bg-brand-blue hover:bg-slate-900 text-brand-yellow font-black text-xs uppercase rounded-xl transition shadow disabled:opacity-50 flex items-center justify-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 animate-pulse" /><span>Usar minha localização</span>
              </button>
            </div>
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Capitais:</span>
              <div className="grid grid-cols-3 gap-2">
                {[["São Paulo - SP","🏢 São Paulo"],["Rio de Janeiro - RJ","🌊 Rio de Jan."],["Belo Horizonte - MG","⛰️ BH - MG"]].map(([region, label]) => (
                  <button key={region} onClick={() => handleSelectRegion(region)} className="p-2.5 bg-slate-50 hover:bg-brand-yellow/15 border border-slate-200 hover:border-brand-yellow text-center rounded-xl transition text-xs font-bold text-slate-800">{label}</button>
                ))}
              </div>
            </div>
            <form onSubmit={handleManualRegionSubmit} className="space-y-3 pt-3 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ou defina outra região:</span>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4">
                  <select value={manualState} onChange={(e) => setManualState(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none">
                    {BRAZILIAN_STATES.map(st => (<option key={st.code} value={st.code}>{st.code}</option>))}
                  </select>
                </div>
                <div className="col-span-8">
                  <input type="text" required placeholder="Ex: Campinas" value={manualCity} onChange={(e) => setManualCity(e.target.value)} className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none" />
                </div>
              </div>
              <button type="submit" className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase rounded-xl transition shadow">Confirmar 🚀</button>
            </form>
            {activeRegion && (<button onClick={() => setRegionModalOpen(false)} className="w-full pt-1 text-center text-slate-400 hover:text-slate-600 text-xs font-bold uppercase">Voltar ao Catálogo ({activeRegion})</button>)}
          </div>
        </div>
      )}

      {/* MODAL LOGIN */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5 animate-slideup">
            <div className="flex items-center justify-between"><h3 className="text-sm font-bold text-slate-900 uppercase">Acesso / Registro</h3><button onClick={() => setLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-4 h-4" /></button></div>
            <div className="flex justify-center"><Logo size={80} mode="original" className="shadow-lg rounded-2xl" /></div>
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">Seu nome ou apelido:</label>
                <input type="text" required value={usernameInput} onChange={(e) => setUsernameInput(e.target.value)} placeholder="Ex: Marcos Aurélio" className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-blue" />
              </div>
              {loginFeedback && (<p className="text-xs text-brand-blue font-bold text-center bg-brand-yellow/10 py-1 rounded">{loginFeedback}</p>)}
              <button type="submit" className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-brand-yellow rounded-xl text-xs font-bold transition">Conectar Conta</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL ANÚNCIO */}
      {announceModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-xl p-6 space-y-5 animate-slideup my-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div><h3 className="text-sm font-bold text-slate-900 uppercase">📋 Publicar Anúncio de Serviço</h3><p className="text-[11px] text-slate-400">Atraia clientes na sua cidade.</p></div>
              <button onClick={() => setAnnounceModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Completo: *</label><input type="text" required value={newProNome} onChange={(e) => setNewProNome(e.target.value)} placeholder="Ex: Carlos Eduardo de Oliveira" className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome da Empresa: *</label><input type="text" required value={newProEmpresa} onChange={(e) => setNewProEmpresa(e.target.value)} placeholder="Ex: Oliveira Instalações" className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Categoria: *</label><select value={newProCategoria} onChange={(e) => setNewProCategoria(e.target.value)} className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none font-bold">{CATEGORIES_LIST.map(c => (<option key={c.name} value={c.name}>{c.name}</option>))}</select></div>
                <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Celular / WhatsApp: *</label><input type="text" required value={newProCelular} onChange={(e) => setNewProCelular(e.target.value)} placeholder="(11) 94821-3322" className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
              </div>
              <div><label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Descrição dos Serviços: *</label><textarea rows={4} required value={newProBio} onChange={(e) => setNewProBio(e.target.value)} placeholder="Descreva detalhadamente seus serviços, qualificações e diferenciais..." className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
              {announceSuccess && (<div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center border border-emerald-200 animate-pulse">{announceSuccess}</div>)}
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <button type="button" onClick={() => setAnnounceModalOpen(false)} className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold">Cancelar</button>
                <button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-brand-yellow px-6 py-2.5 rounded-xl text-xs font-bold transition shadow">Publicar Agora 🚀</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CONTATO */}
      {contactModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl p-6 space-y-4 animate-slideup">
            <div className="flex justify-between items-center"><h3 className="text-lg font-black font-display text-slate-900">📩 Enviar mensagem</h3><button onClick={() => setContactModalOpen(false)} className="text-slate-400 hover:text-slate-900 p-2"><X /></button></div>
            <form onSubmit={handleSendEmail} className="space-y-4">
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Nome completo</label><input type="text" required value={contactForm.nome} onChange={(e) => setContactForm({...contactForm, nome: e.target.value})} className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-blue" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">E-mail</label><input type="email" required value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} className="w-full text-sm border border-slate-200 rounded-xl p-3 focus:outline-none focus:ring-1 focus:ring-brand-blue" /></div>
              <div><label className="block text-xs font-bold text-slate-500 mb-1">Mensagem</label><textarea required minLength={20} value={contactForm.mensagem} onChange={(e) => setContactForm({...contactForm, mensagem: e.target.value})} className="w-full text-sm border border-slate-200 rounded-xl p-3 h-24 focus:outline-none focus:ring-1 focus:ring-brand-blue" /></div>
              <button type="submit" disabled={isSending} className="w-full py-3 bg-brand-blue text-white font-bold rounded-xl hover:bg-brand-blue-dark transition flex items-center justify-center">{isSending ? 'Enviando...' : 'Enviar mensagem 📩'}</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CHAT */}
      {chatModalOpen && activeChatProId !== null && (() => {
        const pro = professionals.find(p => p.id === activeChatProId);
        if (!pro) return null;
        const session = chatSessions.find(s => s.clientId === userSession.email && s.proId === activeChatProId) || { messages: [] };
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[500px] border border-slate-200 overflow-hidden animate-scaleup">
              <div className="bg-brand-blue text-white p-4 flex items-center justify-between border-b border-brand-blue-dark">
                <div className="flex items-center gap-3"><img src={pro.avatar} alt={pro.nome} className="w-10 h-10 rounded-full object-cover border-2 border-brand-yellow bg-white" /><div><h4 className="text-sm font-black text-brand-yellow truncate max-w-[180px]">{pro.nome}</h4><p className="text-[10px] text-slate-300 font-bold uppercase">{pro.categoria}</p></div></div>
                <button onClick={() => setChatModalOpen(false)} className="p-1 px-2.5 bg-white/15 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs">X</button>
              </div>
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
                {session.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2"><span className="text-2xl">💬</span><h5 className="text-xs font-bold text-slate-700">Inicie sua conversa</h5><p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">Envie uma mensagem para liberar os contatos do profissional!</p></div>
                ) : (
                  session.messages.map((m, idx) => {
                    const isClient = m.sender === 'client';
                    return (<div key={idx} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}><div className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm leading-relaxed ${isClient ? 'bg-brand-blue text-white rounded-br-none' : 'bg-white text-slate-800 border rounded-bl-none border-slate-200'}`}><p className="font-medium whitespace-pre-wrap">{m.text}</p></div></div>);
                  })
                )}
              </div>
              <div className="p-3 border-t border-slate-100 bg-white">
                <form onSubmit={(e) => { e.preventDefault(); if (!chatMessageText.trim()) return; handleSendChatMessage(chatMessageText); }} className="flex gap-2">
                  <input type="text" value={chatMessageText} onChange={(e) => setChatMessageText(e.target.value)} placeholder="Pergunte sobre preços ou prazos..." className="flex-1 text-xs p-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-blue" />
                  <button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-brand-yellow px-4 rounded-xl text-xs font-black uppercase transition">Enviar</button>
                </form>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL AGENDAMENTO */}
      {bookingModalOpen && bookingProId !== null && (() => {
        const pro = professionals.find(p => p.id === bookingProId);
        if (!pro) return null;
        const daysToShow: { dateString: string; label: string; weekday: string }[] = [];
        const baseDate = new Date(2026, 5, 2);
        const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        for (let i = 0; i < 11; i++) { const d = new Date(baseDate); d.setDate(baseDate.getDate() + i); daysToShow.push({ dateString: d.toISOString().split('T')[0], label: `${d.getDate()}/${d.getMonth() + 1}`, weekday: weekdays[d.getDay()] }); }
        const timesMock = ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30", "18:00"];
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden animate-scaleup">
              <div className="bg-brand-blue text-white p-4 flex items-center justify-between border-b border-brand-blue-dark">
                <div className="flex items-center gap-3"><span className="text-xl">📅</span><div><h4 className="text-sm font-black text-brand-yellow">Solicitar Agendamento</h4><p className="text-[10px] text-slate-300 font-bold uppercase">{pro.nome}</p></div></div>
                <button onClick={() => setBookingModalOpen(false)} className="p-1 px-2.5 bg-white/15 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs">X</button>
              </div>
              <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50">
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">1. Selecione a Data:</label>
                  <div className="flex gap-2 overflow-x-auto pb-2.5">
                    {daysToShow.map(day => (<button key={day.dateString} type="button" onClick={() => setSelectedBookingDate(day.dateString)} className={`flex flex-col items-center p-2.5 rounded-xl border min-w-[64px] transition cursor-pointer text-center ${selectedBookingDate === day.dateString ? 'bg-brand-blue border-brand-blue text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}><span className="text-[10px] font-black uppercase opacity-60">{day.weekday}</span><span className="text-sm font-extrabold mt-0.5">{day.label.split('/')[0]}</span><span className="text-[9px] font-bold opacity-80">Jun</span></button>))}
                  </div>
                </div>
                {selectedBookingDate && (<div className="space-y-2 animate-fadein"><label className="block text-[11px] font-extrabold text-slate-500 uppercase">2. Horário:</label><div className="grid grid-cols-4 gap-2">{timesMock.map(time => (<button key={time} type="button" onClick={() => setSelectedBookingTime(time)} className={`p-2 rounded-xl text-center text-xs font-bold border transition ${selectedBookingTime === time ? 'bg-brand-yellow border-brand-yellow text-brand-blue font-black shadow' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}>{time}</button>))}</div></div>)}
              </div>
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
                <button type="button" onClick={() => setBookingModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase">Cancelar</button>
                <button type="button" disabled={!selectedBookingDate || !selectedBookingTime} onClick={handleConfirmBooking} className="bg-brand-blue disabled:bg-slate-300 disabled:text-slate-500 text-brand-yellow px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow transition">Confirmar 📅</button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* MODAL AVALIAÇÃO */}
      {reviewModalOpen && activeReviewBooking !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <form onSubmit={handleSubmitBookingReview} className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-scaleup">
            <div className="bg-brand-blue text-white p-4 flex items-center justify-between border-b border-brand-blue-dark">
              <div className="flex items-center gap-2"><span className="text-lg">⭐</span><h4 className="text-sm font-black text-brand-yellow">Avaliar Serviço</h4></div>
              <button type="button" onClick={() => setReviewModalOpen(false)} className="p-1 px-2.5 bg-white/15 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs">X</button>
            </div>
            <div className="p-5 bg-slate-50 space-y-4 text-xs">
              <div className="p-3 bg-white border border-slate-150 rounded-xl"><p className="text-[10px] text-slate-400 uppercase">Prestador:</p><strong className="text-slate-850 text-sm">{activeReviewBooking.proNome}</strong></div>
              <div className="space-y-1.5 text-center py-2 bg-white rounded-xl border border-slate-150">
                <label className="block text-[11px] font-black text-slate-500 uppercase">Qualidade:</label>
                <div className="flex items-center justify-center gap-1.5">{[1,2,3,4,5].map(st => (<button key={st} type="button" onClick={() => setBookingReviewStars(st)} className="p-1 text-xl hover:scale-110 active:scale-95 transition"><span className={st <= bookingReviewStars ? "text-amber-400" : "text-slate-200"}>★</span></button>))}</div>
              </div>
              <textarea rows={3} required value={bookingReviewComment} onChange={(e) => setBookingReviewComment(e.target.value)} placeholder="Escreva suas impressões sobre o serviço..." className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" />
            </div>
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
              <button type="button" onClick={() => setReviewModalOpen(false)} className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase">Voltar</button>
              <button type="submit" className="bg-brand-blue hover:bg-brand-blue-dark text-brand-yellow px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow">Enviar ⭐</button>
            </div>
          </form>
        </div>
      )}

      {/* PAINEL DO USUÁRIO */}
      {userPanelOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-[90] p-0 md:p-4">
          <div className="bg-white w-full max-w-xl h-full md:h-[95vh] md:rounded-3xl shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-slideright">
            <div className="bg-brand-blue text-white p-5 flex items-center justify-between border-b border-brand-blue-dark">
              <div className="flex items-center gap-3">
                <img src={userSession.avatar} alt="avatar" className="w-12 h-12 rounded-full border-2 border-brand-yellow bg-white object-cover" />
                <div>
                  <h4 className="text-sm font-black text-brand-yellow">{userSession.nome}</h4>
                  <p className="text-[10px] font-mono font-medium text-slate-300">{userSession.email}</p>
                </div>
              </div>
              <button onClick={() => setUserPanelOpen(false)} className="p-1.5 px-3 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs">Fechar X</button>
            </div>
            <div className="flex border-b border-slate-200 bg-slate-50 overflow-x-auto shrink-0">
              {[{id:"agendamentos",label:"📅 Agenda"},{id:"conversas",label:"💬 Mensagens"},{id:"dados",label:"✅ Verificação"}].map(tab => (
                <button key={tab.id} onClick={() => setActiveUserPanelTab(tab.id as any)} className={`flex-1 min-w-[100px] py-3 text-center text-[11px] font-black uppercase border-b-2 transition ${activeUserPanelTab === tab.id ? 'bg-white border-brand-blue text-brand-blue' : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-800'}`}>{tab.label}</button>
              ))}
            </div>
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
              {activeUserPanelTab === "agendamentos" && (() => {
                const myBookings = bookings.filter(b => b.clientId === userSession.email);
                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500">Meus Agendamentos ({myBookings.length})</h4>
                    {myBookings.length === 0 ? <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-2"><span className="text-xl">📅</span><h5 className="text-xs font-bold text-slate-800">Nenhum agendamento</h5></div> : (
                      <div className="space-y-3">
                        {myBookings.map(bk => (
                          <div key={bk.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3">
                            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                              <div><span className="text-[9px] uppercase font-bold text-slate-400">{bk.proCategoria}</span><strong className="block text-xs">{bk.proNome}</strong></div>
                              <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${bk.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : bk.status === 'Confirmado' ? 'bg-blue-50 text-blue-700' : 'bg-rose-50 text-rose-700'}`}>● {bk.status}</span>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div><span className="text-[8px] uppercase font-bold text-slate-400">Data:</span><strong className="block font-mono text-[11px]">{new Date(bk.data + 'T00:00:00').toLocaleDateString('pt-BR')}</strong></div>
                              <div><span className="text-[8px] uppercase font-bold text-slate-400">Hora:</span><strong className="block font-mono text-[11px]">{bk.hora} h</strong></div>
                            </div>
                            {bk.status === 'Concluído' && !bk.avaliado && (
                              <button type="button" onClick={() => { setActiveReviewBooking(bk); setBookingReviewStars(5); setBookingReviewComment(""); setReviewModalOpen(true); }} className="w-full p-1.5 bg-brand-yellow text-brand-blue font-black rounded-lg text-[9px] uppercase animate-pulse">⭐ Avaliar Serviço</button>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}
              {activeUserPanelTab === "conversas" && (() => {
                const myChats = chatSessions.filter(c => c.clientId === userSession.email);
                return (
                  <div className="space-y-4">
                    <h4 className="text-xs font-black uppercase text-slate-500">Minhas Conversas ({myChats.length})</h4>
                    {myChats.length === 0 ? <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-2"><span className="text-2xl">💬</span><h5 className="text-xs font-bold text-slate-800">Nenhuma conversa ativa</h5></div> : (
                      <div className="space-y-2.5">
                        {myChats.map((sess, index) => {
                          const lastMsg = sess.messages[sess.messages.length - 1];
                          const proObj = professionals.find(p => p.id === sess.proId);
                          return (
                            <button key={index} type="button" onClick={() => { setActiveChatProId(sess.proId); setChatModalOpen(true); }} className="w-full text-left bg-white p-3 rounded-2xl border border-slate-200 hover:border-brand-blue transition shadow-sm flex items-center justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={proObj?.avatar || ''} alt="" className="w-10 h-10 rounded-full object-cover border" />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-black text-slate-900 truncate">{proObj?.nome || "Profissional"}</h5>
                                  <p className="text-[11px] text-slate-500 truncate">{lastMsg ? lastMsg.text : "Mensagem pendente..."}</p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-brand-blue bg-brand-blue/5 p-1 px-2.5 rounded-lg">Responder 💬</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}
              {activeUserPanelTab === "dados" && (
                <div className="space-y-4 text-xs">
                  <div className="bg-white p-5 rounded-2xl border border-slate-200">
                    <h4 className="text-xs font-black text-brand-blue uppercase border-l-2 border-brand-yellow pl-2 mb-3">Selo Oficial Verificado ✅</h4>
                    <p className="text-slate-600 leading-relaxed font-semibold mb-4">O selo <strong>✅ Verificado</strong> aumenta a confiança dos clientes no seu perfil.</p>
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-2">
                      <p className="text-[10px] font-black text-brand-blue uppercase">Simular Validação:</p>
                      <input type="text" value={registerDocumento} onChange={(e) => setRegisterDocumento(formatCPFOrCNPJ(e.target.value))} placeholder="Insira CPF ou CNPJ..." className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" />
                      <button type="button" onClick={() => { if (!registerDocumento) { addToast("Informe o CPF/CNPJ! ⚠️"); return; } const isOk = validateDocumento(registerDocumento); if (isOk) { addToast(`Documento ${registerDocumento} VALIDADO com sucesso! ✅`); } else { addToast(`CPF ou CNPJ inválido! ❌`); } }} className="w-full py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-black uppercase">✓ Simular Validação</button>
                    </div>
                  </div>
                  <div className="bg-white p-4 rounded-xl border border-slate-200">
                    <button onClick={handleLogout} className="w-full py-2.5 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 rounded-xl text-xs font-black uppercase transition">Sair da Conta</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL STORIES */}
      {storiesModalOpen && activeProfile && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-slideup my-6">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-xs font-black text-slate-900 uppercase">📸 Gerador de Stories</h3>
              <button onClick={() => setStoriesModalOpen(false)} className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <div className={`w-[260px] h-[460px] rounded-xl relative shadow-lg overflow-hidden p-4 flex flex-col justify-between ${storyBg === 'navy' ? 'bg-brand-blue text-white' : storyBg === 'dark' ? 'bg-slate-900 text-white' : storyBg === 'gradient' ? 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 text-white' : 'bg-brand-yellow text-slate-900'}`}>
                <div className="flex items-center gap-2"><Logo size={40} mode={storyBg === 'yellow' ? 'original' : 'header'} className="rounded-lg shrink-0" /><div><span className={`text-[13px] font-black block leading-none ${storyBg === 'yellow' ? 'text-slate-900' : 'text-brand-yellow'}`}>TáNaMão</span><span className={`text-[8px] font-mono block uppercase font-bold ${storyBg === 'yellow' ? 'text-slate-800' : 'text-white/70'}`}>PRESTADORES</span></div></div>
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-center">
                  <img src={activeProfile.avatar} alt={activeProfile.nome} className="w-20 h-20 rounded-full border-2 border-white object-cover shadow-md" />
                  <div><p className={`text-[9px] font-black uppercase tracking-wider ${storyBg === 'yellow' ? 'text-slate-600' : 'text-brand-yellow'}`}>{activeProfile.categoria}</p><h4 className="text-sm font-black tracking-tight uppercase">{activeProfile.nome}</h4></div>
                </div>
                <div className={`py-1.5 rounded-lg text-center font-black text-[10px] uppercase ${storyBg === 'yellow' ? 'bg-slate-900 text-brand-yellow' : 'bg-brand-yellow text-brand-blue'}`}>🚀 AGENDE SEU SERVIÇO</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button type="button" onClick={() => { addToast("💾 Card salvo com sucesso!"); }} className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[10px] font-bold uppercase transition">💾 Salvar</button>
              <button type="button" onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/#/perfil/${activeProfile.id}`); addToast("📋 Link copiado!"); }} className="w-full py-2 bg-brand-blue text-white hover:bg-brand-blue-dark rounded-xl text-[10px] font-bold uppercase transition">📋 Copiar Link</button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTRATO */}
      {contractModalOpen && selectedContractPlan && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5 animate-slideup my-8 max-h-[95vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-sm font-black text-slate-900">{selectedContractPlan.nome}</h3>
              <button onClick={() => setContractModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5" /></button>
            </div>
            {contractStep === 1 ? (
              <div className="space-y-4">
                <div className="bg-brand-blue/5 p-4 rounded-2xl border border-brand-blue/10 space-y-1">
                  <p className="text-xs font-semibold text-slate-700">{selectedContractPlan.desc}</p>
                  <div className="pt-2"><span className="text-base font-black text-slate-950">R$ {activePlanPeriod === 'semanal' ? selectedContractPlan.precoSemana : selectedContractPlan.precoMes}</span><span className="text-[10px] text-slate-400 font-bold">/{activePlanPeriod}</span></div>
                </div>
                <button type="button" onClick={handleConfirmContractStep1} className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-brand-yellow rounded-2xl text-xs font-black uppercase shadow transition">Avançar para Pagamento</button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                  <button type="button" onClick={() => setPaymentMethod('pix')} className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase rounded-lg transition ${paymentMethod === 'pix' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>🔹 PIX</button>
                  <button type="button" onClick={() => setPaymentMethod('cartao')} className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase rounded-lg transition ${paymentMethod === 'cartao' ? 'bg-brand-blue text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}>💳 Cartão</button>
                </div>
                {paymentMethod === 'pix' ? (
                  <div className="space-y-3">
                    <p className="text-[11px] text-slate-500">Use o PIX copia e cola ou QR Code para pagar.</p>
                    <div className="flex items-center justify-center p-4 bg-slate-50 rounded-2xl border border-slate-200">
                      <div className="w-24 h-24 bg-slate-200 rounded-xl flex items-center justify-center text-2xl">📱</div>
                    </div>
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase">PIX Copia e Cola:</label>
                      <div className="flex gap-2">
                        <input type="text" readOnly value="00020101021226870014br.gov.pix0125tanamao" className="bg-slate-50 text-slate-500 text-[9px] font-mono p-2 rounded-xl border border-slate-200 flex-1 focus:outline-none" />
                        <button type="button" onClick={() => { setCopiedPix(true); addToast("Chave PIX copiada!"); setTimeout(() => setCopiedPix(false), 2000); }} className="px-3 bg-brand-blue text-brand-yellow rounded-xl text-[10px] font-black uppercase transition">{copiedPix ? "Copiado!" : "Copiar"}</button>
                      </div>
                    </div>
                    <div className="p-4 border-2 border-dashed border-slate-250 hover:border-brand-blue rounded-2xl text-center bg-slate-50 relative cursor-pointer">
                      <input type="file" onChange={() => { setReceiptFileSimulated(true); addToast("Comprovante anexado! 📄"); }} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                      {receiptFileSimulated ? <div className="text-emerald-600"><span className="text-xl">📄</span><p className="text-[10px] font-black uppercase">Comprovante Carregado</p></div> : <div className="text-slate-400"><span className="text-xl">📤</span><p className="text-[10px] font-black uppercase">Anexar Comprovante</p></div>}
                    </div>
                    <button type="button" onClick={() => handleExecuteContractPurchase('pix')} className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-black rounded-2xl text-xs uppercase shadow transition">Liberar Destaque Via PIX</button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Número do Cartão:</label><input type="text" required value={creditCardNumber} onChange={(e) => setCreditCardNumber(e.target.value)} placeholder="4444 5555 6666 7777" className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
                    <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Nome do Titular:</label><input type="text" required value={creditCardName} onChange={(e) => setCreditCardName(e.target.value)} placeholder="TITULAR DO CARTÃO" className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
                    <div className="grid grid-cols-2 gap-3">
                      <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">Validade:</label><input type="text" required value={creditCardExpiry} onChange={(e) => setCreditCardExpiry(e.target.value)} placeholder="MM/AA" maxLength={5} className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
                      <div><label className="block text-[9px] font-black text-slate-400 uppercase mb-0.5">CVV:</label><input type="text" required value={creditCardCvv} onChange={(e) => setCreditCardCvv(e.target.value)} placeholder="123" maxLength={3} className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none" /></div>
                    </div>
                    <button type="button" onClick={() => handleExecuteContractPurchase('card')} className="w-full py-3 bg-brand-blue hover:bg-brand-blue-dark text-white font-black rounded-2xl text-xs uppercase shadow transition">Pagar e Ativar</button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
