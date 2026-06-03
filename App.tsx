import { useState, useRef } from "react";

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
  phone: string; // WhatsApp
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

// ─── Logo SVG Component ───────────────────────────────────────────────────────

function TanaMaoLogo({ size = 80 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Yellow circle background */}
      <circle cx="100" cy="100" r="100" fill="#F5C800" />

      {/* Outer arc (partial circle decoration) */}
      <path
        d="M 30 110 A 75 75 0 0 1 170 110"
        fill="none"
        stroke="#1A1A1A"
        strokeWidth="7"
        strokeLinecap="round"
      />

      {/* Hand fist shape */}
      <ellipse cx="100" cy="120" rx="30" ry="35" fill="#1A1A1A" />
      <rect x="72" y="90" width="56" height="40" rx="6" fill="#1A1A1A" />
      {/* Finger lines on fist */}
      <line x1="82" y1="93" x2="82" y2="108" stroke="#F5C800" strokeWidth="2" />
      <line x1="91" y1="91" x2="91" y2="106" stroke="#F5C800" strokeWidth="2" />
      <line x1="100" y1="91" x2="100" y2="106" stroke="#F5C800" strokeWidth="2" />
      <line x1="109" y1="91" x2="109" y2="106" stroke="#F5C800" strokeWidth="2" />

      {/* T letter top bar */}
      <rect x="55" y="38" width="90" height="22" rx="11" fill="#1A1A1A" />
      {/* T letter vertical bar held by hand */}
      <rect x="87" y="55" width="26" height="42" fill="#1A1A1A" />

      {/* Wrench icon - top left */}
      <g transform="translate(28, 52) rotate(-45)">
        <rect x="-3" y="-18" width="6" height="24" rx="2" fill="#1A1A1A" />
        <circle cx="0" cy="-18" r="6" fill="none" stroke="#1A1A1A" strokeWidth="4" />
        <line x1="-4" y1="-18" x2="-4" y2="-12" stroke="#F5C800" strokeWidth="2" />
      </g>

      {/* Briefcase icon - bottom left */}
      <g transform="translate(40, 130)">
        <rect x="-14" y="-10" width="28" height="20" rx="3" fill="#1A1A1A" />
        <rect x="-7" y="-14" width="14" height="6" rx="2" fill="none" stroke="#1A1A1A" strokeWidth="3" />
        <line x1="-14" y1="-2" x2="14" y2="-2" stroke="#F5C800" strokeWidth="2" />
      </g>

      {/* House icon - top right */}
      <g transform="translate(160, 65)">
        <polygon points="0,-16 14,0 -14,0" fill="#1A1A1A" />
        <rect x="-11" y="0" width="22" height="16" rx="2" fill="#1A1A1A" />
        <rect x="-4" y="4" width="8" height="12" rx="1" fill="#F5C800" />
      </g>

      {/* Person icon - bottom right */}
      <g transform="translate(158, 130)">
        <circle cx="0" cy="-12" r="7" fill="#1A1A1A" />
        <path d="M -12 8 Q -12 -4 0 -4 Q 12 -4 12 8 Z" fill="#1A1A1A" />
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
  onLogin: () => void;
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

          <div style={{ textAlign: "right", marginTop: 8, marginBottom: 16 }}>
            <span style={{ fontSize: 13, color: "#777", cursor: "pointer" }}>
              Esqueci a senha
            </span>
          </div>

          <button style={styles.btn} onClick={onLogin}>
            Entrar
          </button>
          <button style={styles.btnOutline} onClick={onGoRegister}>
            Criar conta grátis
          </button>
        </div>

        <div style={{ textAlign: "center", fontSize: 12, color: "#999", marginTop: 8 }}>
          Ao entrar, você concorda com nossos Termos de Uso e Política de Privacidade
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
  onRegister: (profile: UserProfile) => void;
  onBack: () => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [photo, setPhoto] = useState("");
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
    onRegister(profile);
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
        {/* Photo upload */}
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

        {/* Personal data */}
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

          <label style={styles.label}>Data de nascimento</label>
          <input
            style={styles.input}
            type="date"
            value={form.birthDate}
            onChange={(e) => set("birthDate", e.target.value)}
          />
        </div>

        {/* Contact */}
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginBottom: 4 }}>
            📱 Contato
          </div>

          <label style={styles.label}>E-mail *</label>
          <input
            style={styles.input}
            type="email"
            placeholder="seu@email.com"
            value={form.email}
            onChange={(e) => set("email", e.target.value)}
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

        {/* Address */}
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, color: BLACK, marginBottom: 4 }}>
            📍 Endereço
          </div>

          <label style={styles.label}>CEP</label>
          <input
            style={styles.input}
            placeholder="00000-000"
            value={form.cep}
            onChange={(e) => set("cep", maskCEP(e.target.value))}
            inputMode="numeric"
          />

          <label style={styles.label}>Rua / Logradouro</label>
          <input
            style={styles.input}
            placeholder="Rua das Flores"
            value={form.street}
            onChange={(e) => set("street", e.target.value)}
          />

          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Número</label>
              <input
                style={styles.input}
                placeholder="123"
                value={form.number}
                onChange={(e) => set("number", e.target.value)}
              />
            </div>
            <div>
              <label style={styles.label}>Complemento</label>
              <input
                style={styles.input}
                placeholder="Apto 4"
                value={form.complement}
                onChange={(e) => set("complement", e.target.value)}
              />
            </div>
          </div>

          <label style={styles.label}>Bairro</label>
          <input
            style={styles.input}
            placeholder="Centro"
            value={form.neighborhood}
            onChange={(e) => set("neighborhood", e.target.value)}
          />

          <div style={styles.row2}>
            <div>
              <label style={styles.label}>Cidade</label>
              <input
                style={styles.input}
                placeholder="São Paulo"
                value={form.city}
                onChange={(e) => set("city", e.target.value)}
              />
            </div>
            <div>
              <label style={styles.label}>Estado</label>
              <select
                style={{ ...styles.input, cursor: "pointer" }}
                value={form.state}
                onChange={(e) => set("state", e.target.value)}
              >
                <option value="">UF</option>
                {["AC","AL","AP","AM","BA","CE","DF","ES","GO","MA","MT","MS","MG","PA","PB","PR","PE","PI","RJ","RN","RS","RO","RR","SC","SP","SE","TO"].map(
                  (uf) => (
                    <option key={uf} value={uf}>
                      {uf}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>
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
        {/* Avatar + name */}
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

        {/* Personal info */}
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📋 Dados pessoais</div>
          {editing ? (
            <>
              <label style={styles.label}>Nome completo</label>
              <input style={styles.input} value={form.fullName} onChange={(e) => set("fullName", e.target.value)} />
              <label style={styles.label}>CPF</label>
              <input style={styles.input} value={form.cpf} onChange={(e) => set("cpf", maskCPF(e.target.value))} />
              <label style={styles.label}>Data de nascimento</label>
              <input style={styles.input} type="date" value={form.birthDate} onChange={(e) => set("birthDate", e.target.value)} />
            </>
          ) : (
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["CPF", user.cpf || "—"],
                  ["Data de nascimento", user.birthDate || "—"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: "#888", padding: "6px 0", width: "40%" }}>{k}</td>
                    <td style={{ fontWeight: 500, color: BLACK }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Contact */}
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📱 Contato</div>
          {editing ? (
            <>
              <label style={styles.label}>E-mail</label>
              <input style={styles.input} type="email" value={form.email} onChange={(e) => set("email", e.target.value)} />
              <label style={styles.label}>WhatsApp</label>
              <input style={styles.input} value={form.phone} onChange={(e) => set("phone", maskPhone(e.target.value))} />
            </>
          ) : (
            <table style={{ width: "100%", fontSize: 14, borderCollapse: "collapse" }}>
              <tbody>
                {[
                  ["E-mail", user.email],
                  ["WhatsApp", user.phone || "—"],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td style={{ color: "#888", padding: "6px 0", width: "40%" }}>{k}</td>
                    <td style={{ fontWeight: 500, color: BLACK, wordBreak: "break-all" }}>{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Address */}
        <div style={styles.card}>
          <div style={{ fontSize: 14, fontWeight: 700, marginBottom: 12 }}>📍 Endereço</div>
          {editing ? (
            <>
              <label style={styles.label}>CEP</label>
              <input style={styles.input} value={form.address.cep} onChange={(e) => setAddr("cep", maskCEP(e.target.value))} />
              <label style={styles.label}>Rua</label>
              <input style={styles.input} value={form.address.street} onChange={(e) => setAddr("street", e.target.value)} />
              <div style={styles.row2}>
                <div>
                  <label style={styles.label}>Número</label>
                  <input style={styles.input} value={form.address.number} onChange={(e) => setAddr("number", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>Complemento</label>
                  <input style={styles.input} value={form.address.complement} onChange={(e) => setAddr("complement", e.target.value)} />
                </div>
              </div>
              <label style={styles.label}>Bairro</label>
              <input style={styles.input} value={form.address.neighborhood} onChange={(e) => setAddr("neighborhood", e.target.value)} />
              <div style={styles.row2}>
                <div>
                  <label style={styles.label}>Cidade</label>
                  <input style={styles.input} value={form.address.city} onChange={(e) => setAddr("city", e.target.value)} />
                </div>
                <div>
                  <label style={styles.label}>Estado</label>
                  <input style={styles.input} value={form.address.state} onChange={(e) => setAddr("state", e.target.value)} />
                </div>
              </div>
            </>
          ) : (
            <div style={{ fontSize: 14, color: BLACK, lineHeight: 1.7 }}>
              {user.address.street
                ? `${user.address.street}, ${user.address.number}${user.address.complement ? " – " + user.address.complement : ""}\n${user.address.neighborhood} – ${user.address.city}/${user.address.state}\nCEP: ${user.address.cep}`
                    .split("\n")
                    .map((l, i) => <div key={i}>{l}</div>)
                : "Endereço não informado"}
            </div>
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
}: {
  user: UserProfile;
  onGoProfile: () => void;
  onBecomePro: () => void;
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
    { icon: "🎨", label: "Pintores" },
    { icon: "🧹", label: "Limpeza" },
    { icon: "🌳", label: "Jardinagem" },
    { icon: "❄️", label: "Ar-cond." },
    { icon: "📦", label: "Mudanças" },
  ];

  return (
    <div style={styles.app}>
      {/* Header */}
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
        {/* Welcome */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: BLACK }}>
            Olá, {user.fullName.split(" ")[0]}! 👋
          </div>
          <div style={{ fontSize: 14, color: "#777", marginTop: 4 }}>
            O que você precisa hoje?
          </div>
        </div>

        {/* Search */}
        <div
          style={{
            background: "#fff",
            border: `1.5px solid ${BORDER}`,
            borderRadius: 14,
            padding: "12px 16px",
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 20,
          }}
        >
          <span style={{ fontSize: 18 }}>🔍</span>
          <span style={{ color: "#aaa", fontSize: 15 }}>Buscar profissional ou serviço...</span>
        </div>

        {/* Categories */}
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

        {/* CTA: become professional / company */}
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
            <div style={{ fontSize: 13, color: "#ccc", marginBottom: 14 }}>
              Cadastre-se e alcance novos clientes na sua região hoje mesmo!
            </div>
            <button
              style={{ ...styles.btn, marginBottom: 0, borderRadius: 10 }}
              onClick={onBecomePro}
            >
              Quero me cadastrar
            </button>
          </div>
        )}

        {(user.isProfessional || user.isCompany) && (
          <div style={styles.successBox}>
            <span style={{ fontSize: 24 }}>✅</span>
            <div>
              <div style={{ fontWeight: 700, color: "#2E7D32", fontSize: 14 }}>
                Perfil ativo!
              </div>
              <div style={{ fontSize: 12, color: "#388E3C" }}>
                {user.isProfessional ? "Profissional cadastrado" : "Empresa cadastrada"} com sucesso
              </div>
            </div>
          </div>
        )}

        {/* Recent professionals (mockup) */}
        <div style={{ fontSize: 15, fontWeight: 700, color: BLACK, marginBottom: 12 }}>
          Profissionais em destaque
        </div>
        {[
          { name: "Carlos Silva", job: "Eletricista", rating: "4.9", reviews: 87 },
          { name: "Maria Fernanda", job: "Pintora", rating: "4.8", reviews: 54 },
          { name: "João Pereira", job: "Encanador", rating: "5.0", reviews: 120 },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              ...styles.card,
              display: "flex",
              alignItems: "center",
              gap: 14,
              cursor: "pointer",
            }}
          >
            <div
              style={{
                ...styles.avatar,
                width: 50,
                height: 50,
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              {p.name
                .split(" ")
                .slice(0, 2)
                .map((w) => w[0])
                .join("")}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: BLACK }}>{p.name}</div>
              <div style={{ fontSize: 12, color: "#777" }}>{p.job}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontWeight: 700, fontSize: 14, color: BLACK }}>⭐ {p.rating}</div>
              <div style={{ fontSize: 11, color: "#aaa" }}>{p.reviews} avaliações</div>
            </div>
          </div>
        ))}
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
        <div style={{ marginBottom: 24 }}>
          <div style={styles.sectionTitle}>Escolha o tipo de cadastro</div>
          <div style={styles.sectionSub}>
            Selecione a opção que melhor descreve você
          </div>
        </div>

        <div
          style={{ ...styles.optionCard, borderColor: YELLOW }}
          onClick={onChoosePro}
        >
          <div style={styles.optionIcon}>👷</div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: BLACK, marginBottom: 4 }}>
              Profissional autônomo
            </div>
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
              Sou um profissional independente: eletricista, encanador, pintor, diarista, técnico, etc.
            </div>
            <div style={{ ...styles.badge, marginTop: 8 }}>Grátis para começar</div>
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
            <div style={{ fontSize: 13, color: "#666", lineHeight: 1.5 }}>
              Represento uma empresa ou tenho CNPJ próprio e quero divulgar meus serviços.
            </div>
            <div style={{ ...styles.badge, marginTop: 8 }}>Grátis para começar</div>
          </div>
        </div>

        <div
          style={{
            background: "#FFF9E0",
            border: `1px solid ${YELLOW}`,
            borderRadius: 12,
            padding: 14,
            fontSize: 13,
            color: "#555",
            lineHeight: 1.6,
          }}
        >
          💡 <strong>Dica:</strong> Você pode se cadastrar como profissional E ter uma empresa cadastrada no mesmo perfil.
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

  const specialties = [
    "Eletricista", "Encanador", "Pintor", "Pedreiro", "Carpinteiro",
    "Diarista / Faxineiro(a)", "Jardineiro", "Técnico de informática",
    "Técnico de ar-condicionado", "Motorista / Mototaxista",
    "Personal trainer", "Nutricionista", "Advogado", "Contador",
    "Fotógrafo", "Designer", "Outro",
  ];

  return (
    <div style={styles.app}>
      <div style={styles.header}>
        <button style={styles.backBtn} onClick={onBack}>←</button>
        <div>
          <div style={styles.headerTitle}>Perfil profissional</div>
          <div style={styles.headerSub}>Complete seus dados</div>
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={styles.card}>
          <label style={styles.label}>Especialidade *</label>
          <select
            style={{ ...styles.input, cursor: "pointer" }}
            value={form.specialty}
            onChange={(e) => set("specialty", e.target.value)}
          >
            <option value="">Selecione...</option>
            {specialties.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>

          <label style={styles.label}>Descrição dos seus serviços *</label>
          <textarea
            style={{
              ...styles.input,
              minHeight: 100,
              resize: "vertical",
            }}
            placeholder="Descreva seus serviços, diferenciais, experiências..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          <label style={styles.label}>Área de atendimento</label>
          <input
            style={styles.input}
            placeholder="Ex: São Paulo – Zona Sul, Santo André, ABC"
            value={form.serviceArea}
            onChange={(e) => set("serviceArea", e.target.value)}
          />

          <label style={styles.label}>Anos de experiência</label>
          <select
            style={{ ...styles.input, cursor: "pointer" }}
            value={form.experienceYears}
            onChange={(e) => set("experienceYears", e.target.value)}
          >
            <option value="">Selecione...</option>
            <option>Menos de 1 ano</option>
            <option>1-2 anos</option>
            <option>3-5 anos</option>
            <option>6-10 anos</option>
            <option>Mais de 10 anos</option>
          </select>

          <label style={styles.label}>Link do portfólio / redes sociais</label>
          <input
            style={styles.input}
            placeholder="https://instagram.com/seuperfil"
            value={form.portfolio}
            onChange={(e) => set("portfolio", e.target.value)}
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
          <div style={styles.headerSub}>Dados da empresa</div>
        </div>
      </div>

      <div style={styles.scroll}>
        <div style={styles.card}>
          <label style={styles.label}>Razão social / Nome fantasia *</label>
          <input
            style={styles.input}
            placeholder="Nome da empresa"
            value={form.companyName}
            onChange={(e) => set("companyName", e.target.value)}
          />

          <label style={styles.label}>CNPJ *</label>
          <input
            style={styles.input}
            placeholder="00.000.000/0000-00"
            value={form.cnpj}
            onChange={(e) => set("cnpj", maskCNPJ(e.target.value))}
            inputMode="numeric"
          />

          <label style={styles.label}>Segmento / Ramo de atividade *</label>
          <select
            style={{ ...styles.input, cursor: "pointer" }}
            value={form.segment}
            onChange={(e) => set("segment", e.target.value)}
          >
            <option value="">Selecione...</option>
            {[
              "Construção civil", "Reformas e manutenção", "Tecnologia",
              "Saúde e bem-estar", "Educação", "Alimentação",
              "Transporte e logística", "Limpeza e conservação",
              "Serviços domésticos", "Jurídico e contábil",
              "Marketing e comunicação", "Outro",
            ].map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <label style={styles.label}>Descrição da empresa *</label>
          <textarea
            style={{ ...styles.input, minHeight: 90, resize: "vertical" }}
            placeholder="Descreva os serviços e diferenciais da sua empresa..."
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
          />

          <label style={styles.label}>Site / Rede social</label>
          <input
            style={styles.input}
            placeholder="https://suaempresa.com.br"
            value={form.website}
            onChange={(e) => set("website", e.target.value)}
          />

          <label style={styles.label}>Número de funcionários</label>
          <select
            style={{ ...styles.input, cursor: "pointer" }}
            value={form.employees}
            onChange={(e) => set("employees", e.target.value)}
          >
            <option value="">Selecione...</option>
            <option>Somente eu (MEI)</option>
            <option>2-5 funcionários</option>
            <option>6-20 funcionários</option>
            <option>21-50 funcionários</option>
            <option>Mais de 50</option>
          </select>
        </div>

        <button style={styles.btn} onClick={() => onSave(form)}>
          Cadastrar empresa →
        </button>
      </div>
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────

export default function App() {
  const [screen, setScreen] = useState<Screen>("splash");
  const [user, setUser] = useState<UserProfile | null>(null);

  function handleLogin() {
    // Demo: auto-login with a mock user if not registered
    if (!user) {
      setUser({
        fullName: "Usuário Demo",
        email: "demo@tanamaoprofissionais.app",
        cpf: "",
        phone: "",
        birthDate: "",
        address: { street: "", number: "", complement: "", neighborhood: "", city: "", state: "", cep: "" },
        photoUrl: "",
        isProfessional: false,
        isCompany: false,
      });
    }
    setScreen("home");
  }

  function handleRegister(profile: UserProfile) {
    setUser(profile);
    setScreen("home");
  }

  function handleSavePro() {
    if (user) {
      setUser({ ...user, isProfessional: true });
      setScreen("home");
    }
  }

  function handleSaveCompany() {
    if (user) {
      setUser({ ...user, isCompany: true });
      setScreen("home");
    }
  }

  if (screen === "splash") {
    return <SplashScreen onContinue={() => setScreen("login")} />;
  }

  if (screen === "login") {
    return (
      <LoginScreen
        onLogin={handleLogin}
        onGoRegister={() => setScreen("register")}
      />
    );
  }

  if (screen === "register") {
    return (
      <RegisterScreen
        onRegister={handleRegister}
        onBack={() => setScreen("login")}
      />
    );
  }

  if (screen === "home" && user) {
    return (
      <HomeScreen
        user={user}
        onGoProfile={() => setScreen("profile")}
        onBecomePro={() => setScreen("becomePro")}
      />
    );
  }

  if (screen === "profile" && user) {
    return (
      <ProfileScreen
        user={user}
        onUpdate={(u) => setUser(u)}
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
    return (
      <ProFormScreen
        onSave={handleSavePro}
        onBack={() => setScreen("becomePro")}
      />
    );
  }

  if (screen === "companyForm") {
    return (
      <CompanyFormScreen
        onSave={handleSaveCompany}
        onBack={() => setScreen("becomePro")}
      />
    );
  }

  return null;
}
