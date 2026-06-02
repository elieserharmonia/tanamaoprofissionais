import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  Eye, 
  Phone, 
  Star, 
  MapPin, 
  Check, 
  X, 
  Trash2, 
  Plus, 
  Camera, 
  Save, 
  Award, 
  Clock, 
  Settings, 
  FileText, 
  MessageSquare, 
  Calendar, 
  ChevronRight, 
  CheckCheck,
  AlertCircle,
  Sparkles,
  Search,
  Gift,
  Target,
  Newspaper
} from 'lucide-react';
import { Profissional, Booking, ChatSession, AppNotification, ClientReview } from '../types';
import { CATEGORIES_LIST } from '../data';

interface ProfessionalPanelProps {
  userSession: any;
  professionals: Profissional[];
  syncDB: (updated: Profissional[]) => void;
  bookings: Booking[];
  syncBookings: (updated: Booking[]) => void;
  chatSessions: ChatSession[];
  syncChats: (updated: ChatSession[]) => void;
  notifications: AppNotification[];
  syncNotifications: (updated: AppNotification[]) => void;
  addToast: (msg: string) => void;
  activePainelTab: 'dashboard' | 'estatisticas' | 'agendamentos' | 'mensagem' | 'planos' | 'perfil';
  setActivePainelTab: (tab: 'dashboard' | 'estatisticas' | 'agendamentos' | 'mensagem' | 'planos' | 'perfil') => void;
  setSelectedContractPlan: (plan: any) => void;
  setContractCity: (city: string) => void;
  setContractStep: (step: 1 | 2) => void;
  setContractModalOpen: (open: boolean) => void;
}

export default function ProfessionalPanel({
  userSession,
  professionals,
  syncDB,
  bookings,
  syncBookings,
  chatSessions,
  syncChats,
  notifications,
  syncNotifications,
  addToast,
  activePainelTab,
  setActivePainelTab,
  setSelectedContractPlan,
  setContractCity,
  setContractStep,
  setContractModalOpen
}: ProfessionalPanelProps) {
  // Find current professional associated with user session
  const currentPro = professionals.find(
    p => p.id === userSession.profissionalId || p.email === userSession.email
  );

  // Stats Period toggle inside TAB 2
  const [statsPeriod, setStatsPeriod] = useState<'7d' | '30d' | '3m'>('7d');

  // Interactive Hover Visits state for SVG Graph
  const [hoveredVisit, setHoveredVisit] = useState<{ day: string; val: number } | null>(null);

  // Client Review Modal triggers (inside TAB 3)
  const [reviewingBooking, setReviewingBooking] = useState<Booking | null>(null);
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // Availability form state
  const [availability, setAvailability] = useState<{
    [key: string]: { disponivel: boolean; inicio: string; fim: string }
  }>(() => {
    const saved = localStorage.getItem('tanamao_availability');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      'Segunda': { disponivel: true, inicio: '08:00', fim: '18:00' },
      'Terça': { disponivel: true, inicio: '08:00', fim: '18:00' },
      'Quarta': { disponivel: true, inicio: '08:00', fim: '18:00' },
      'Quinta': { disponivel: true, inicio: '08:00', fim: '18:00' },
      'Sexta': { disponivel: true, inicio: '08:00', fim: '18:00' },
      'Sábado': { disponivel: false, inicio: '09:00', fim: '13:00' },
      'Domingo': { disponivel: false, inicio: '09:00', fim: '12:00' },
    };
  });

  // Especial Toggle Atendo 24h state
  const [atende24h, setAtende24h] = useState<boolean>(currentPro?.atende24h || false);
  const [intervaloAlmoco, setIntervaloAlmoco] = useState<{ inicio: string; fim: string }>({ inicio: '12:00', fim: '13:30' });

  // Chat window state
  const [activeChatId, setActiveChatId] = useState<string>("");
  const [chatInputText, setChatInputText] = useState<string>("");

  // Auto response state
  const [autoResponseActive, setAutoResponseActive] = useState<boolean>(() => {
    return localStorage.getItem('tanamao_auto_resp_active') === 'true';
  });
  const [autoResponseText, setAutoResponseText] = useState<string>(() => {
    return localStorage.getItem('tanamao_auto_resp_text') || 'Olá! Recebi sua mensagem e retorno em até 2h. 😊';
  });
  const [responseGuarantee, setResponseGuarantee] = useState<string>(() => {
    return localStorage.getItem('tanamao_response_guarantee') || '2h';
  });

  // Profile forms fields state
  const [editNome, setEditNome] = useState(currentPro?.nome || "");
  const [editEmpresa, setEditEmpresa] = useState(currentPro?.empresa || "");
  const [editBio, setEditBio] = useState(currentPro?.bio || "");
  const [editTelefone, setEditTelefone] = useState(currentPro?.telefone || "");
  const [editCelular, setEditCelular] = useState(currentPro?.celular || "");
  const [editEmail, setEditEmail] = useState(currentPro?.email || "");
  const [editEndereco, setEditEndereco] = useState(currentPro?.endereco || "");
  const [editCidade, setEditCidade] = useState(currentPro?.cidade || "Bauru - SP");
  const [editCategoria, setEditCategoria] = useState(currentPro?.categoria || "Reformas");
  const [editAvatar, setEditAvatar] = useState(currentPro?.avatar || "");
  const [whatsappMsg, setWhatsappMsg] = useState(currentPro?.whatsappMsgDefault || "Olá! Vim do TáNaMão Amarelas e gostaria de solicitar um orçamento para seus serviços.");

  // AI BIO Generator states
  const [aiExpanded, setAiExpanded] = useState(false);
  const [aiExp, setAiExp] = useState("5");
  const [aiFocus, setAiFocus] = useState("");
  const [aiGenerating, setAiGenerating] = useState(false);

  // Profile gallery state
  const [gallery, setGallery] = useState<string[]>(currentPro?.galeria || []);
  const [newPhotoUrl, setNewPhotoUrl] = useState("");

  // Before & After portfolio
  const [portfolio, setPortfolio] = useState<any[]>(currentPro?.portfolio || []);
  const [newPortfolioBefore, setNewPortfolioBefore] = useState("");
  const [newPortfolioAfter, setNewPortfolioAfter] = useState("");
  const [newPortfolioTitle, setNewPortfolioTitle] = useState("");
  const [newPortfolioDesc, setNewPortfolioDesc] = useState("");

  // Certificates
  const [certificates, setCertificates] = useState<any[]>(currentPro?.certificados || []);
  const [newCertCourse, setNewCertCourse] = useState("");
  const [newCertInstitution, setNewCertInstitution] = useState("");
  const [newCertYear, setNewCertYear] = useState<number>(new Date().getFullYear());

  // Filter for Bookings
  const [bookingFilter, setBookingFilter] = useState<'Todos' | 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado'>('Todos');

  // Sync state if currentPro changes
  useEffect(() => {
    if (currentPro) {
      setEditNome(currentPro.nome);
      setEditEmpresa(currentPro.empresa);
      setEditBio(currentPro.bio);
      setEditTelefone(currentPro.telefone);
      setEditCelular(currentPro.celular);
      setEditEmail(currentPro.email);
      setEditEndereco(currentPro.endereco);
      setEditCidade(currentPro.cidade);
      setEditCategoria(currentPro.categoria);
      setEditAvatar(currentPro.avatar);
      setGallery(currentPro.galeria);
      setPortfolio(currentPro.portfolio || []);
      setCertificates(currentPro.certificados || []);
      setAtende24h(currentPro.atende24h || false);
      setWhatsappMsg(currentPro.whatsappMsgDefault || "Olá! Vim do TáNaMão Amarelas e gostaria de solicitar um orçamento para seus serviços.");
    }
  }, [currentPro]);

  if (!userSession.logado || userSession.tipo !== 'pro') {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-6 max-w-lg mx-auto">
        <span className="text-5xl block animate-bounce">⚠️</span>
        <div>
          <h3 className="text-lg font-black text-[#1B2A6B]">Área Restrita do Profissional</h3>
          <p className="text-xs text-slate-500 font-semibold p-1 mt-1 leading-relaxed">
            Faça login como Prestador Técnico ou anuncie gratuitamente os seus serviços nas Amarelas Digitais para acessar seu Painel Gerencial.
          </p>
        </div>
        <button
          onClick={() => {
            window.location.hash = '#home';
            addToast("Abra o menu 'Entrar' no topo para autenticar como prestador! 🔑");
          }}
          className="px-6 py-3 bg-[#1B2A6B] hover:bg-slate-900 text-[#F5C800] rounded-xl text-xs font-black uppercase shadow-sm transition"
        >
          Voltar para o Início
        </button>
      </div>
    );
  }

  if (!currentPro) {
    return (
      <div className="bg-white p-12 text-center rounded-3xl border border-slate-200 space-y-6 max-w-lg mx-auto">
        <span className="text-5xl block">🛠️</span>
        <div>
          <h3 className="text-lg font-black text-[#1B2A6B]">Perfil Técnico não Encontrado</h3>
          <p className="text-xs text-slate-500 font-semibold p-1 mt-1 leading-relaxed">
            Identificamos sua conta cadastrada, mas seu anúncio de perfil profissional ainda não foi configurado. Deseja publicar seus serviços agora?
          </p>
        </div>
        <button
          onClick={() => {
            window.location.hash = '#home';
            addToast("Clique em 'Anunciar Grátis' no banner principal para criar seu cartão de visitas! 🚀");
          }}
          className="px-6 py-3 bg-brand-yellow hover:bg-[#1B2A6B] hover:text-white text-brand-blue rounded-xl text-xs font-black uppercase shadow transition"
        >
          Configurar Meu Trabalho Grátis
        </button>
      </div>
    );
  }

  // --- DADOS MOCKADOS adicionais para o Prestador ---
  // Visits numbers inside stats period
  const visitsMock = {
    '7d': [
      { day: 'Seg', visits: 120 },
      { day: 'Ter', visits: 187 },
      { day: 'Qua', visits: 145 },
      { day: 'Qui', visits: 201 },
      { day: 'Sex', visits: 178 },
      { day: 'Sáb', visits: 98 },
      { day: 'Dom', visits: 72 }
    ],
    '30d': [
      { day: 'Semana 1', visits: 850 },
      { day: 'Semana 2', visits: 920 },
      { day: 'Semana 3', visits: 1100 },
      { day: 'Semana 4', visits: 1234 }
    ],
    '3m': [
      { day: 'Março', visits: 3900 },
      { day: 'Abril', visits: 4120 },
      { day: 'Maio', visits: 4890 }
    ]
  };

  const getActiveVisitsArray = () => {
    return visitsMock[statsPeriod];
  };

  // Contacts distribution mock
  const contactsOrigin = [
    { label: 'WhatsApp', pct: 45, color: '#10B981' },
    { label: 'Contato Fone', pct: 30, color: '#3B82F6' },
    { label: 'Chat Interno', pct: 15, color: '#6366F1' },
    { label: 'Mensagem E-mail', pct: 10, color: '#F59E0B' }
  ];

  // Search terms list mock
  const searchKeywords = [
    { term: `${currentPro.categoria.toLowerCase()} em ${currentPro.cidade.split(' - ')[0]}`, count: 74 },
    { term: `orçamento ${currentPro.categoria.toLowerCase()}`, count: 42 },
    { term: currentPro.nome.toLowerCase(), count: 18 },
    { term: 'assistência urgente 24h', count: 12 }
  ];

  // Activities feed
  const proActivities = [
    { text: "👁 Alguém visitou seu perfil", time: "há 5 min", type: "visita", tab: "dashboard" as const },
    { text: "⭐ Nova avaliação recebida: 5 estrelas", time: "há 2h", type: "review", tab: "dashboard" as const },
    { text: "💬 Nova mensagem de Elieser Músico", time: "há 3h", type: "chat", tab: "mensagem" as const },
    { text: "❤️ Elieser favoritou seu perfil de destaque", time: "há 1 dia", type: "fav", tab: "dashboard" as const },
    { text: "📅 Solicitação de agendamento recebida", time: "Sexta às 14h", type: "booking", tab: "agendamentos" as const }
  ];

  // Profile completeness elements
  const scoreItems = [
    { label: "Apresentação BIO preenchida (>150 caracteres)", done: currentPro.bio.length >= 150, action: "perfil" as const, txt: "Editar BIO" },
    { label: "Galeria de imagens ativa (>3 fotos)", done: (currentPro.galeria && currentPro.galeria.length >= 3), action: "perfil" as const, txt: "Gerenciar Galeria" },
    { label: "Verificar Identidade (CPF/CNPJ ativo)", done: !!currentPro.verificado, action: "perfil" as const, txt: "Verificar" },
    { label: "Configurar Auto-Reply / Resposta Rápida", done: !!autoResponseActive, action: "perfil" as const, txt: "Configurar" },
    { label: "Cadastrar Portfólio de Antes e Depois", done: (currentPro.portfolio && currentPro.portfolio.length >= 1), action: "perfil" as const, txt: "Ver Portfólio" },
    { label: "Inserir Certificados acadêmicos/técnicos", done: (currentPro.certificados && currentPro.certificados.length >= 1), action: "perfil" as const, txt: "Ver Certificados" },
    { label: "WhatsApp: Mensagem inicial customizada", done: !!currentPro.whatsappMsgDefault && currentPro.whatsappMsgDefault.length > 20, action: "perfil" as const, txt: "Customizar" }
  ];

  const totalScoreItems = scoreItems.length;
  const completedScoreItems = scoreItems.filter(item => item.done).length;
  const completenessPct = Math.round((completedScoreItems / totalScoreItems) * 100);

  // Time-left calculations for plan
  const todayVal = new Date(2026, 5, 2); // locked context clock date
  const planEnds = currentPro.planoTermino ? new Date(currentPro.planoTermino) : null;
  const planDaysLeft = planEnds ? Math.ceil((planEnds.getTime() - todayVal.getTime()) / (1000 * 3600 * 24)) : 0;

  // Filter Bookings
  const proBookings = bookings.filter(b => b.proId === currentPro.id);
  const filteredBookings = proBookings.filter(b => {
    if (bookingFilter === 'Todos') return true;
    return b.status === bookingFilter;
  });

  // Chat sessions related to this professional
  const proChats = chatSessions.filter(c => c.proId === currentPro.id);
  const activeChatSession = proChats.find(c => c.clientId === activeChatId);

  // Auto-respond first message check
  const handleSendMessage = () => {
    if (!chatInputText.trim()) return;

    if (!activeChatId) {
      addToast("Selecione um contato para responder.");
      return;
    }

    const updatedChats = chatSessions.map(sess => {
      if (sess.proId === currentPro.id && sess.clientId === activeChatId) {
        return {
          ...sess,
          messages: [
            ...sess.messages,
            {
              sender: 'pro' as const,
              text: chatInputText,
              timestamp: new Date().toISOString()
            }
          ]
        };
      }
      return sess;
    });

    syncChats(updatedChats);
    setChatInputText("");
    addToast("Mensagem enviada com sucesso! 💬");
  };

  // Trigger auto response setup
  const saveAutoResponseOptions = () => {
    localStorage.setItem('tanamao_auto_resp_active', autoResponseActive ? 'true' : 'false');
    localStorage.setItem('tanamao_auto_resp_text', autoResponseText);
    localStorage.setItem('tanamao_response_guarantee', responseGuarantee);
    addToast("Configurações de resposta rápida gravadas! ⚡");
  };

  // Save Availability settings
  const saveAvailabilitySettings = () => {
    localStorage.setItem('tanamao_availability', JSON.stringify(availability));
    
    // Update professional 24h badge
    const updated = professionals.map(p => {
      if (p.id === currentPro.id) {
        return { ...p, atende24h: atende24h };
      }
      return p;
    });
    syncDB(updated);
    addToast("Status de disponibilidade e grade salvos com sucesso! 📅");
  };

  // Submit client review
  const handleClientReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewingBooking) return;

    const newReview: ClientReview = {
      id: `review-c-${Date.now()}`,
      bookingId: reviewingBooking.id,
      clientId: reviewingBooking.clientId,
      clientName: reviewingBooking.clientName,
      proId: currentPro.id,
      proNome: currentPro.nome,
      estrelas: reviewStars,
      comentario: reviewComment,
      data: "2026-06-02"
    };

    // Store in LocalStorage reviews list
    const stored = localStorage.getItem('tanamao_client_reviews');
    let currentReviews: ClientReview[] = [];
    if (stored) {
      try { currentReviews = JSON.parse(stored); } catch (e) {}
    }
    const updatedReviews = [...currentReviews, newReview];
    localStorage.setItem('tanamao_client_reviews', JSON.stringify(updatedReviews));

    // Update booking status
    const updatedBookings = bookings.map(b => {
      if (b.id === reviewingBooking.id) {
        return { ...b, status: 'Concluído' as const, avaliado: true };
      }
      return b;
    });
    syncBookings(updatedBookings);

    setReviewingBooking(null);
    setReviewComment("");
    addToast(`Obrigado pelo feedback de avaliação do cliente! 👍`);
  };

  const generateBioWithAI = async () => {
    if (aiGenerating) return;
    setAiGenerating(true);
    try {
      const response = await fetch('/api/generate-bio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editNome,
          category: editCategoria,
          yearsExp: aiExp,
          focus: aiFocus,
          city: editCidade
        })
      });
      const data = await response.json();
      if (response.ok && data.bio) {
        setEditBio(data.bio.slice(0, 500));
        addToast("✨ BIO profissional otimizada por IA aplicada com sucesso!");
        setAiExpanded(false);
      } else {
        addToast("⚠️ Não foi possível usar a IA no momento. Tente novamente em alguns segundos.");
      }
    } catch (e) {
      addToast("❌ Erro de conexão com o servidor de IA. Utilizando perfil de contingência...");
      // Simulate quick fallback to guarantee delightful experience
      const fallbackBio = `Olá! Sou o(a) ${editNome}, especialista em ${editCategoria} em ${editCidade}. Com mais de ${aiExp} anos de história, busco entregar trabalhos primorosos com alto nível de acabamento, responsabilidade absoluta ${aiFocus ? `e foco centralizado em ${aiFocus}` : ''}. Solicite um orçamento sem compromisso!`;
      setEditBio(fallbackBio.slice(0, 500));
      setAiExpanded(false);
    } finally {
      setAiGenerating(false);
    }
  };

  // Save main profile details
  const saveProfileChanges = () => {
    if (editBio.length > 500) {
      addToast("Erro: A BIO ultrapassou o limite máximo de 500 caracteres! ⚠️");
      return;
    }

    const updated = professionals.map(p => {
      if (p.id === currentPro.id) {
        return {
          ...p,
          nome: editNome,
          empresa: editEmpresa,
          bio: editBio,
          telefone: editTelefone,
          celular: editCelular,
          email: editEmail,
          endereco: editEndereco,
          cidade: editCidade,
          categoria: editCategoria,
          avatar: editAvatar,
          galeria: gallery,
          portfolio: portfolio,
          certificados: certificates,
          atende24h: atende24h,
          whatsappMsgDefault: whatsappMsg
        };
      }
      return p;
    });

    syncDB(updated);
    addToast("✅ Perfil geral atualizado com sucesso nas Amarelas!");
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 font-sans text-xs min-h-[75vh]">
      {/* FIXED SIDEBAR DESKTOP / TOP BANNER MOBILE RESPONSIVE */}
      <aside className="w-full lg:w-64 bg-white rounded-2xl border border-slate-200 p-4 shrink-0 flex flex-row lg:flex-col justify-start overflow-x-auto gap-2 lg:space-y-1.5 shadow-sm scrollbar-none">
        <div className="hidden lg:block border-b pb-4 mb-4 text-center">
          <div className="relative inline-block">
            <img 
              src={editAvatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&h=120&q=80"} 
              alt="Avatar" 
              className="w-16 h-16 rounded-full border-4 border-[#F5C800] mx-auto object-cover bg-white"
            />
            {currentPro.verificado && (
              <span className="absolute bottom-0 right-0 bg-emerald-600 text-white rounded-full p-1 border-2 border-white shadow text-[8px] flex items-center justify-center font-black">
                ✓
              </span>
            )}
          </div>
          <h4 className="text-xs font-black text-[#1B2A6B] mt-2 truncate">{editNome}</h4>
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wide block">{editCategoria}</span>
        </div>

        {[
          { id: 'dashboard', label: '🏠 Visão Geral' },
          { id: 'estatisticas', label: '📈 Estatísticas' },
          { id: 'agendamentos', label: '📅 Agendamentos' },
          { id: 'mensagem', label: '💬 Mensagens' },
          { id: 'planos', label: '💰 Planos & Saldo' },
          { id: 'perfil', label: '⚙️ Meu Perfil' }
        ].map((tab) => {
          const isActive = activePainelTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActivePainelTab(tab.id as any)}
              className={`whitespace-nowrap px-4 py-2.5 rounded-xl font-bold transition-all text-left flex items-center gap-2 cursor-pointer ${
                isActive 
                  ? 'bg-[#1B2A6B] text-[#F5C800] font-black shadow-sm' 
                  : 'bg-white hover:bg-slate-50 text-slate-600 border border-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}

        <button
          onClick={() => { window.location.hash = '#home'; }}
          className="lg:mt-auto py-2.5 px-4 bg-slate-105 hover:bg-rose-50 text-slate-600 hover:text-rose-700 font-bold rounded-xl border border-dashed flex items-center gap-2 whitespace-nowrap"
        >
          <span>🚪 Sair do Painel</span>
        </button>
      </aside>

      {/* TABS INNER WORKBENCH CONTROLLER */}
      <main className="flex-1 bg-slate-50/50 rounded-2xl border border-slate-100 p-3 md:p-6 shadow-xs max-w-full overflow-hidden">
        
        {/* TAB 1: VISÃO GERAL */}
        {activePainelTab === 'dashboard' && (
          <div className="space-y-6 animate-fadein">
            {/* Metric widgets row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">👁 Visitas</span>
                  <TrendingUp className="w-4 h-4 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900">1.234</h3>
                <span className="text-[10px] text-emerald-600 font-extrabold block">↑ +12% semana</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">📞 Contatos</span>
                  <Phone className="w-4 h-4 text-blue-500" />
                </div>
                <h3 className="text-xl font-black text-slate-900">48</h3>
                <span className="text-[10px] text-emerald-600 font-extrabold block">↑ +5 hoje</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">⭐ Avaliação</span>
                  <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
                </div>
                <h3 className="text-xl font-black text-slate-900">{currentPro.avaliacoes.length > 0 ? (currentPro.avaliacoes.reduce((acc, cr) => acc + cr.estrelas, 0) / currentPro.avaliacoes.length).toFixed(1) : "5.0"}/5</h3>
                <span className="text-[10px] text-slate-400 font-bold block">{currentPro.avaliacoes.length} avaliações</span>
              </div>

              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-1">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-bold uppercase tracking-wider text-[10px]">📍 Ranking</span>
                  <MapPin className="w-4 h-4 text-[#brand-yellow]" />
                </div>
                <h3 className="text-xl font-black text-slate-900">#3</h3>
                <span className="text-[10px] text-slate-500 font-bold block truncate">{currentPro.cidade.split(' - ')[0]} • {currentPro.categoria}</span>
              </div>
            </div>

            {/* SVG Interactive visits graph & Recent Activities row */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Graphic area */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-8 space-y-4">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Volume de Visitas (últimos 7 dias)</h4>
                  <span className="text-[10px] text-slate-400 font-semibold">Atualizado recentemente</span>
                </div>

                <div className="relative pt-6">
                  {hoveredVisit && (
                    <div className="absolute top-0 left-1/2 transform -translate-x-1/2 bg-[#1B2A6B] text-white py-1 px-3 rounded-full text-[10px] font-mono shadow-md flex items-center gap-1">
                      <strong>{hoveredVisit.day}:</strong>
                      <span>{hoveredVisit.val} visitas</span>
                    </div>
                  )}

                  {/* Flexible SVG Graph bars */}
                  <div className="flex items-end justify-between h-48 pt-6 border-b border-l border-slate-100 px-2 lg:px-4">
                    {visitsMock['7d'].map((item, index) => {
                      const maxVisits = 220;
                      const heightPct = (item.visits / maxVisits) * 100;
                      // Sunday is index 6, but current day mock is Ter (index 1) or let's highlight index 4 (Friday/day active)
                      // Highlight terrestrial today (Tuesday/Ter)
                      const isToday = item.day === 'Ter';

                      return (
                        <div 
                          key={index} 
                          className="flex flex-col items-center flex-1 group"
                          onMouseEnter={() => setHoveredVisit({ day: item.day, val: item.visits })}
                          onMouseLeave={() => setHoveredVisit(null)}
                        >
                          <div 
                            style={{ height: `${heightPct}%` }}
                            className={`w-5 md:w-8 rounded-t-md transition-all duration-300 relative cursor-pointer ${
                              isToday 
                                ? 'bg-amber-400 shadow-sm border border-amber-500 group-hover:bg-brand-yellow' 
                                : 'bg-brand-blue/80 hover:bg-brand-blue group-hover:opacity-100 opacity-90'
                            }`}
                          >
                            <span className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-[9px] font-mono font-bold text-slate-700 opacity-0 group-hover:opacity-100 transition-opacity bg-white px-1 border rounded shadow-xs">
                              {item.visits}
                            </span>
                          </div>
                          <span className="text-[10px] font-bold text-slate-500 mt-2">{item.day}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Feed segment */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-4 space-y-4 flex flex-col">
                <div className="border-b pb-2 flex items-center justify-between">
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Atividade Recente</h4>
                  <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
                </div>

                <div className="space-y-3.5 flex-1 max-h-[16.5rem] overflow-y-auto pr-1">
                  {proActivities.map((act, id) => {
                    return (
                      <div 
                        key={id}
                        onClick={() => {
                          setActivePainelTab(act.tab);
                          addToast(`Navegando para aba correspondente!`);
                        }}
                        className="p-2 hover:bg-slate-50 border-b border-slate-100 last:border-0 rounded-lg transition-all text-left flex items-start gap-2.5 cursor-pointer"
                      >
                        <span className="text-sm">
                          {act.type === 'visita' ? '👁' :
                           act.type === 'review' ? '⭐' :
                           act.type === 'chat' ? '💬' :
                           act.type === 'fav' ? '❤️' : '📅'}
                        </span>
                        <div className="space-y-0.5">
                          <p className="font-semibold text-slate-700 leading-snug">{act.text}</p>
                          <span className="text-[9px] text-slate-400 font-medium block">{act.time}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>

            {/* Completeness bar & Tips card */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              
              {/* Circular completeness slider graph */}
              <div className="md:col-span-4 flex flex-col items-center justify-center border-r-0 md:border-r pr-0 md:pr-6">
                <h5 className="font-black text-[#1B2A6B] uppercase tracking-wide text-[10px] text-center mb-3">
                  Aproveitamento do Perfil
                </h5>
                <div className="relative w-28 h-28 flex items-center justify-center">
                  {/* Outer circle SVG */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="56" cy="56" r="48" stroke="#F1F5F9" strokeWidth="8" fill="transparent" />
                    <circle 
                      cx="56" 
                      cy="56" 
                      r="48" 
                      stroke="#1B2A6B" 
                      strokeWidth="8" 
                      fill="transparent" 
                      strokeDasharray="301.6" 
                      strokeDashoffset={301.6 - (301.6 * completenessPct) / 100}
                    />
                  </svg>
                  <div className="absolute text-center bg-white rounded-full w-22 h-22 flex flex-col items-center justify-center">
                    <span className="text-xl font-black text-[#1B2A6B] font-mono leading-none">{completenessPct}%</span>
                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Completo</span>
                  </div>
                </div>
              </div>

              {/* Tasks checklist with quick redirect buttons */}
              <div className="md:col-span-8 space-y-3">
                <div className="bg-indigo-50/50 p-2.5 px-3 rounded-xl border border-indigo-150 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-700 animate-pulse shrink-0" />
                  <p className="text-[11px] text-slate-600 font-bold leading-normal">
                    <strong>Ganhe visibilidade técnica:</strong> Perfis completos geram em média até 3x mais contatos no WhatsApp e chamados de visitas!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-700 font-medium">
                  {scoreItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <div className="flex items-center gap-2">
                        <span>{item.done ? '✅' : '⬜'}</span>
                        <span className={item.done ? "text-slate-400 line-through font-semibold" : "font-semibold"}>{item.label}</span>
                      </div>
                      {!item.done && (
                        <button
                          onClick={() => {
                            setActivePainelTab(item.action);
                            addToast(`Navegando para configurar: ${item.txt}`);
                          }}
                          className="bg-[#1B2A6B]/15 hover:bg-[#1B2A6B] text-[#1B2A6B] hover:text-white px-2 py-1 rounded font-bold text-[9px] uppercase transition cursor-pointer"
                        >
                          {item.txt}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

            </div>

            {/* COMPONENTES DE ENGAJAMENTO E RETENÇÃO — MELHORIA 7 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* CARD 1: SISTEMA DE BADGES / CONQUISTAS & FEED DE NOTÍCIAS */}
              <div className="space-y-6">
                
                {/* 1.1 Badges de Medalhas / Conquistas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Award className="w-5 h-5 text-amber-500 fill-amber-300" />
                    <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">🏆 Suas Medalhas & Conquistas</h4>
                  </div>
                  
                  <div className="grid grid-cols-3 gap-3.5 text-center">
                    {/* Badge 1: Pioneiro */}
                    <div className="p-2 bg-slate-50 border rounded-xl hover:bg-amber-50/50 transition-colors">
                      <span className="text-2xl block animate-pulse">🚀</span>
                      <strong className="block text-[10px] text-slate-800 tracking-tight mt-1">Pioneiro Amarelo</strong>
                      <span className="text-[8px] bg-slate-200 text-slate-600 px-1.5 py-0.2 rounded-full font-bold">Inscrito #2026</span>
                    </div>

                    {/* Badge 2: Auto-Reply Pro */}
                    <div className={`p-2 border rounded-xl transition-colors ${autoResponseActive ? 'bg-indigo-50/50 border-indigo-200' : 'bg-slate-50 opacity-60'}`}>
                      <span className="text-2xl block">🤖</span>
                      <strong className="block text-[10px] text-slate-800 tracking-tight mt-1">Super Resposta IA</strong>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold ${autoResponseActive ? 'bg-indigo-300 text-indigo-700 font-extrabold' : 'bg-slate-200 text-slate-500'}`}>
                        {autoResponseActive ? 'ATIVADO' : 'BLOQUEADO'}
                      </span>
                    </div>

                    {/* Badge 3: Identidade Verificada */}
                    <div className={`p-2 border rounded-xl transition-colors ${currentPro.verificado ? 'bg-emerald-50/50 border-emerald-200' : 'bg-slate-50 opacity-60'}`}>
                      <span className="text-2xl block">✅</span>
                      <strong className="block text-[10px] text-slate-800 tracking-tight mt-1">Fisco Verificado</strong>
                      <span className={`text-[8px] px-1.5 py-0.2 rounded-full font-bold ${currentPro.verificado ? 'bg-emerald-300 text-emerald-700 font-extrabold' : 'bg-slate-200 text-slate-500'}`}>
                        {currentPro.verificado ? 'ID ATIVO' : 'CPF MOCK'}
                      </span>
                    </div>
                  </div>
                  <p className="text-[10px] font-semibold text-slate-400 leading-normal text-center pt-1 border-t border-dashed">
                    🎯 Ajuste os campos do seu perfil para desbloquear novos distintivos e melhorar seu posicionamento no ranking!
                  </p>
                </div>

                {/* 1.2 Feed de Notícias Internas / Dicas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3.5">
                  <div className="flex items-center gap-2 border-b pb-2">
                    <Newspaper className="w-5 h-5 text-indigo-600" />
                    <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">📰 Portal de Notícias & Dicas MEI</h4>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="p-3 bg-indigo-50/30 rounded-xl space-y-1">
                      <span className="text-[8.5px] font-bold text-indigo-700 uppercase tracking-widest block font-mono">DICAS DE CONVERSÃO — HÁ 2 DIAS</span>
                      <strong className="block text-[11px] text-slate-800 leading-tight">Como responder contatos em até 5 minutos no WhatsApp para converter ate 80% mais orçamentos</strong>
                      <p className="text-[10px] text-slate-500 leading-relaxed font-semibold">Mostre profissionalismo de imediato utilizando nosso assistente IA de respostas rápidas nos horários em que estiver fazendo serviços externos.</p>
                    </div>

                    <div className="p-3 bg-slate-50 rounded-xl space-y-1">
                      <span className="text-[8.5px] font-bold text-slate-550 uppercase tracking-widest block font-mono">SALA DE REGULAMENTAÇÃO — HÁ 1 SEMANA</span>
                      <strong className="block text-[11px] text-slate-800 leading-tight">Isenção de taxas municipais MEI 2026: saiba como requerer o benefício fiscal na sua prefeitura</strong>
                      <p className="text-[10px] text-slate-500 leading-relaxed">Técnicos credenciados no TáNaMão possuem direito a assessoria jurídica gratuita parceira.</p>
                    </div>
                  </div>
                </div>

              </div>

              {/* CARD 2: PROGRAMA DE INDICAÇÃO & DESAFIOS SEMANAIS */}
              <div className="space-y-6">
                
                {/* 2.1 Programa de Indicação (Referral Widget) */}
                <div className="bg-gradient-to-r from-[#1B2A6B] to-slate-900 text-white p-5 rounded-2xl border border-slate-800 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-brand-yellow shrink-0" />
                      <h4 className="text-xs font-black uppercase tracking-wide text-white">🎁 Indique outros Profissionais</h4>
                    </div>
                    <span className="bg-brand-yellow text-brand-blue font-black text-[9px] uppercase px-2 py-0.5 rounded-full font-mono animate-pulse">
                      Promo Ativa!
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed font-semibold">
                    Divulgue seu link especial. Para cada profissional indicado que publicar um anúncio, <strong>ambos ganham R$ 50,00 de saldo</strong> para abater em assinaturas Premium!
                  </p>

                  <div className="bg-white/10 p-3 rounded-xl border border-white/10 space-y-1">
                    <span className="block text-[8px] text-brand-yellow font-black uppercase tracking-wider font-mono">Seu Link de Convite Único:</span>
                    <div className="flex items-center justify-between gap-2.5">
                      <span className="text-[10px] font-mono text-slate-200 select-all truncate">
                        {`${window.location.origin}/#/cadastro?ref=${currentPro.slug || 'DEMO'}`}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/#/cadastro?ref=${currentPro.slug || 'DEMO'}`);
                          addToast("📋 Link especial copiado com sucesso! Divulgue no WhatsApp de amigos profissionais.");
                        }}
                        className="bg-brand-yellow hover:bg-amber-400 text-brand-blue font-black text-[9px] uppercase px-3 py-1.5 rounded-lg shrink-0 transition"
                      >
                        Copiar Link
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs border-t border-white/10 font-semibold">
                    <span className="text-slate-300">Créditos Acumulados:</span>
                    <strong className="text-brand-yellow font-black font-mono text-sm">
                      R$ {parseFloat(localStorage.getItem('tanamao_indicacao_creditos') || '100.00').toFixed(2)}
                    </strong>
                  </div>
                </div>

                {/* 2.2 Desafios Semanais & Recompensas */}
                <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <div className="flex items-center gap-2">
                      <Target className="w-5 h-5 text-emerald-600 animate-bounce shrink-0" />
                      <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">🎯 Desafio de Visibilidade</h4>
                    </div>
                    <span className="text-[9.5px] font-black text-rose-500 font-mono">RESTA 1 DIA!</span>
                  </div>

                  <div className="space-y-3 font-semibold">
                    <div>
                      <div className="flex justify-between text-[11px] text-slate-700">
                        <span>Receber 5 contatos de orçamento nas Amarelas</span>
                        <span className="font-mono text-slate-500">2 / 5 contatos</span>
                      </div>
                      <div className="w-full bg-slate-150 h-2 rounded mt-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all" style={{ width: '40%' }}></div>
                      </div>
                    </div>

                    <div className="bg-emerald-50/50 p-3 rounded-xl border border-emerald-150 text-[10.5px] text-emerald-950 flex items-start gap-2 leading-relaxed">
                      <Sparkles className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <p>
                        <strong>Recompensa ativa:</strong> Complete este desafio e garanta <strong>3 dias grátis de Destaque Amarelas Max</strong> na listagem da sua categoria!
                      </p>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ESTATÍSTICAS DETALHADAS */}
        {activePainelTab === 'estatisticas' && (
          <div className="space-y-6 animate-fadein">
            {/* Period toggler controller */}
            <div className="flex items-center justify-between border-b pb-3">
              <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wider">Estatísticas Operacionais do Perfil</h4>
              <div className="inline-flex gap-1 bg-white border p-1 rounded-xl shadow-xs select-none">
                {[
                  { id: '7d', label: '7 Dias' },
                  { id: '30d', label: '30 Dias' },
                  { id: 'm', label: '3 Meses' }
                ].map(p => (
                  <button
                    key={p.id}
                    onClick={() => {
                      const mockPeriodMap: Record<string, '7d' | '30d' | '3m'> = { '7d': '7d', '30d': '30d', 'm': '3m' };
                      setStatsPeriod(mockPeriodMap[p.id]);
                      addToast(`Gráficos atualizados para o período de ${p.label}! 📊`);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition ${statsPeriod === (p.id === 'm' ? '3m' : p.id) ? 'bg-[#1B2A6B] text-[#F5C800]' : 'text-slate-500 hover:bg-slate-50'}`}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Dual columns for Graphics grids */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Graph 1: Filled temporal line vector (SVG representation) */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-black text-[#1B2A6B] uppercase text-[10px] tracking-wide">Visitas ao longo do tempo (Atual vs Anterior)</h5>
                <div className="h-44 relative bg-slate-50 rounded-xl border border-slate-100 p-2 overflow-hidden flex flex-col justify-end">
                  {/* Simple SVG diagram representing a vector flow */}
                  <svg className="w-full h-full absolute inset-0 pt-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                    {/* Shadow filler bottom path */}
                    <path d="M 0 100 Q 25 35 50 65 T 100 25 L 100 100 Z" fill="#1B2A6B" fillOpacity="0.08" />
                    {/* Active period line */}
                    <path d="M 0 100 Q 25 35 50 65 T 100 25" fill="none" stroke="#1B2A6B" strokeWidth="2" />
                    {/* Compare trace line */}
                    <path d="M 0 95 Q 25 55 50 75 T 100 45" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeDasharray="3 3" />
                  </svg>
                  <div className="flex justify-between text-[8px] font-mono font-bold text-slate-400 p-1 relative z-15 mt-auto">
                    <span>Semana Anterior (Tracejada)</span>
                    <span className="text-[#1B2A6B]">Período Atual (Cheia)</span>
                  </div>
                </div>
              </div>

              {/* Graph 2: Donut of origins */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 flex flex-col justify-between">
                <h5 className="font-black text-[#1B2A6B] uppercase text-[10px] tracking-wide">Origem dos Contatos Diretos</h5>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center flex-1">
                  {/* SVG Donut Circle */}
                  <div className="sm:col-span-5 flex justify-center">
                    <div className="relative w-28 h-28">
                      <svg className="w-full h-full transform -rotate-90">
                        <circle cx="56" cy="56" r="38" stroke="#10B981" strokeWidth="14" strokeDasharray="238.7" strokeDashoffset="0" fill="transparent" />
                        <circle cx="56" cy="56" r="38" stroke="#3B82F6" strokeWidth="14" strokeDasharray="238.7" strokeDashoffset="107" fill="transparent" strokeDashoffset-style="107" />
                        <circle cx="56" cy="56" r="38" stroke="#6366F1" strokeWidth="14" strokeDasharray="238.7" strokeDashoffset="179" fill="transparent" />
                        <circle cx="56" cy="56" r="38" stroke="#F59E0B" strokeWidth="14" strokeDasharray="238.7" strokeDashoffset="214" fill="transparent" />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center font-black text-slate-700 text-xs font-mono">
                        100%
                      </div>
                    </div>
                  </div>

                  {/* Legend lists */}
                  <div className="sm:col-span-7 space-y-1.5 text-[10px]">
                    {contactsOrigin.map((c, i) => (
                      <div key={i} className="flex items-center justify-between font-bold text-slate-650 p-1 py-1 px-2 border border-slate-100 rounded-lg">
                        <div className="flex items-center gap-1.5">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: c.color }} />
                          <span>{c.label}</span>
                        </div>
                        <span className="font-mono text-slate-800">{c.pct}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Graph 3: Access heatmap matrix */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-black text-[#1B2A6B] uppercase text-[10px] tracking-wide">Horários de Maior Fluxo (Calor)</h5>
                <div className="space-y-1.5">
                  <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-450 uppercase font-mono">
                    {['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'].map(d => <span key={d}>{d}</span>)}
                  </div>
                  {/* Heat rows representation (Manhã, Tarde, Noite) */}
                  {['08h - 12h', '13h - 18h', '19h - 23h'].map((period, pIndex) => {
                    return (
                      <div key={period} className="space-y-1">
                        <div className="grid grid-cols-7 gap-1">
                          {Array.from({ length: 7 }).map((_, dIndex) => {
                            // Assign mock density color: opacity levels based on days & hours
                            const densityList = [
                              [200, 300, 400, 300, 500, 600, 200], // Manhã
                              [500, 800, 900, 800, 950, 400, 100], // Tarde
                              [700, 950, 850, 900, 800, 300, 150]  // Noite
                            ];
                            const density = densityList[pIndex][dIndex];
                            let bg = 'bg-indigo-50';
                            if (density > 800) bg = 'bg-indigo-950 text-white';
                            else if (density > 600) bg = 'bg-indigo-700 text-slate-100';
                            else if (density > 400) bg = 'bg-indigo-500 text-slate-105';
                            else if (density > 200) bg = 'bg-indigo-305 text-slate-700';
                            else bg = 'bg-indigo-50 text-slate-500';

                            return (
                              <div 
                                key={dIndex} 
                                title={`${period} — ${density} visitas estimadas`}
                                className={`${bg} h-7 rounded flex items-center justify-center font-mono font-black text-[9px] transition cursor-pointer hover:ring-2 hover:ring-brand-yellow select-none`}
                              >
                                {density}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                  <div className="flex justify-between text-[8px] text-slate-400 font-bold pt-1 uppercase">
                    <span>◆ Células mais escuras indicam picos de busca nas Amarelas</span>
                  </div>
                </div>
              </div>

              {/* Graph 4: Evaluation rating evolution */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3">
                <h5 className="font-black text-[#1B2A6B] uppercase text-[10px] tracking-wide">Evolução do Nível de Avaliação</h5>
                <div className="h-44 relative bg-slate-50 border border-slate-150 rounded-xl p-3 flex flex-col justify-end">
                  {/* Curve rating */}
                  <svg className="w-full h-full absolute inset-0 pt-8" viewBox="0 0 100 100" preserveAspectRatio="none">
                    <path d="M 0 50 Q 30 40 60 15 T 100 10" fill="none" stroke="#F5C800" strokeWidth="2.5" />
                    {/* Circle indicators */}
                    <circle cx="30" cy="43" r="3" fill="#1B2A6B" />
                    <circle cx="60" cy="18" r="3" fill="#1B2A6B" />
                    <circle cx="100" cy="10" r="3" fill="#1B2A6B" />
                  </svg>
                  
                  <div className="absolute top-4 left-4 bg-emerald-50 text-emerald-800 border border-emerald-100 px-2 py-1 rounded text-[8.5px] font-bold font-mono">
                    📈 Pico de Estrelas: Resposta rápida ativa!
                  </div>

                  <div className="flex justify-between text-[8.5px] font-mono font-bold text-slate-405 relative z-10">
                    <span>Mês 1 (4.2★)</span>
                    <span>Mês 2 (4.5★)</span>
                    <span>Hoje ({currentPro.avaliacoes.length > 0 ? (currentPro.avaliacoes.reduce((acc, cr) => acc + cr.estrelas, 0) / currentPro.avaliacoes.length).toFixed(1) : "5.0"}★)</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Keyword search table and tips list */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="pb-1">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Palavras-chave que levaram até você</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Termos buscados nas redondezas locais da sua região</p>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-wide text-[9px] border-b">
                      <th className="p-3">Termo de Pesquisa</th>
                      <th className="p-3 text-right">Frequência (Buscas)</th>
                      <th className="p-3 text-center">Status no Perfil</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 divide-dashed">
                    {searchKeywords.map((kw, i) => {
                      const containsBio = currentPro.bio.toLowerCase().includes(kw.term.split(' ')[0]);
                      return (
                        <tr key={i} className="hover:bg-slate-50/50">
                          <td className="p-3 font-bold text-slate-700">" {kw.term} "</td>
                          <td className="p-3 text-right text-slate-500 font-black">{kw.count}</td>
                          <td className="p-3 text-center">
                            {containsBio ? (
                              <span className="text-emerald-700 font-bold bg-emerald-50 py-0.5 px-2 rounded-full uppercase text-[8.5px]">✓ Presente</span>
                            ) : (
                              <span className="text-amber-700 font-bold bg-amber-50 py-0.5 px-2 rounded-full uppercase text-[8.5px]">⚠ Ausente</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-amber-50/60 p-3.5 rounded-xl border border-amber-100 flex items-center justify-between text-amber-900 gap-3">
                <p className="font-bold text-[10.5px] leading-relaxed">
                  💡 <strong>Recomendação de SEO local:</strong> Adicione os termos descritos acima como principais na sua BIO para indexar melhor nos buscadores do TáNaMão.
                </p>
                <button
                  onClick={() => setActivePainelTab('perfil')}
                  className="bg-brand-blue text-white px-3.5 py-1.5 rounded-lg text-[9.5px] font-black uppercase tracking-wide shrink-0 transition"
                >
                  Editar Bio
                </button>
              </div>
            </div>

          </div>
        )}

        {/* TAB 3: AGENDAMENTOS */}
        {activePainelTab === 'agendamentos' && (
          <div className="space-y-6 animate-fadein">
            {/* Visual Calendar Grid matrix representation */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Calendário Semanal de Slots</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Visão condensada de compromissos programados</p>
              </div>

              <div className="grid grid-cols-5 gap-1.5 text-center text-[10px] font-bold">
                {['Período', 'Confirmados', 'Pendentes', 'Concluídos', 'Disponibilidade'].map(c => (
                  <div key={c} className="bg-slate-50 py-2 border rounded-lg text-slate-500 uppercase tracking-widest text-[8.5px]">
                    {c}
                  </div>
                ))}

                {[
                  { timer: 'Manhã (08h-12h)', c: '1 comprometido', p: '0', d: 'Concluido ✓', f: 'Grade Aberta' },
                  { timer: 'Tarde (13h-18h)', c: '2 confirmados', p: '1 pendente', d: 'Concluido ✓', f: 'Grade Aberta' },
                  { timer: 'Noite (19h-22h)', c: '0', p: '0', d: '0', f: 'Fechado/Extra' }
                ].map((row, index) => {
                  return (
                    <React.Fragment key={index}>
                      <div className="p-2 border rounded-lg flex items-center justify-center font-bold text-slate-500 bg-slate-50/50">{row.timer}</div>
                      <div className="p-2 border rounded-lg text-white bg-[#1B2A6B] font-bold flex items-center justify-center">{row.c}</div>
                      <div className="p-2 border rounded-lg text-slate-[#1B2A6B] bg-brand-yellow/80 font-bold flex items-center justify-center">{row.p}</div>
                      <div className="p-2 border rounded-lg text-slate-500 bg-slate-100 font-semibold flex items-center justify-center">{row.d}</div>
                      <div className="p-2 border rounded-lg text-emerald-800 bg-emerald-50 font-bold flex items-center justify-center border-emerald-100">{row.f}</div>
                    </React.Fragment>
                  );
                })}
              </div>
            </div>

            {/* List and Filters section of Bookings */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-left">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b pb-3">
                <div className="space-y-0.5">
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Lista de Compromissos Recebidos</h4>
                  <p className="text-[10px] text-slate-400 font-semibold">Consulte detalhes e gerencie status de solicitações</p>
                </div>
                {/* Filters */}
                <div className="flex flex-wrap gap-1">
                  {(['Todos', 'Pendente', 'Confirmado', 'Concluído', 'Cancelado'] as const).map(f => (
                    <button
                      key={f}
                      type="button"
                      onClick={() => setBookingFilter(f)}
                      className={`px-2.5 py-1.5 rounded-lg border text-[9.5px] font-black uppercase transition cursor-pointer ${bookingFilter === f ? 'bg-[#1B2A6B] text-white' : 'bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800'}`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking List Container */}
              <div className="space-y-3">
                {filteredBookings.length === 0 ? (
                  <div className="bg-slate-50 p-8 rounded-xl border border-dashed border-slate-200 text-center text-slate-400 font-semibold">
                    Compromissos não programados para o filtro selecionado.
                  </div>
                ) : (
                  filteredBookings.map(b => {
                    let badgeBg = 'bg-slate-100 text-slate-700';
                    if (b.status === 'Confirmado') badgeBg = 'bg-blue-100 text-blue-900 border border-blue-200';
                    else if (b.status === 'Pendente') badgeBg = 'bg-amber-100 text-amber-900 border border-amber-200';
                    else if (b.status === 'Concluído') badgeBg = 'bg-emerald-100 text-emerald-900 border border-emerald-250';

                    return (
                      <div key={b.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 font-sans hover:border-slate-350 transition-all">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-black text-sm uppercase border">
                            {b.clientName.charAt(0)}
                          </div>
                          <div>
                            <h5 className="font-extrabold text-slate-800">{b.clientName}</h5>
                            <p className="text-[10px] text-slate-450 font-bold">{b.proCategoria}</p>
                            <span className="text-[9.5px] text-indigo-700 font-mono font-black border-r pr-2 uppercase">{b.data}</span>
                            <span className="text-[9.5px] text-slate-400 font-mono font-medium pl-2">{b.hora}</span>
                          </div>
                        </div>

                        {/* Badges/Tools control */}
                        <div className="flex items-center justify-end gap-2 flex-wrap">
                          <span className={`text-[9.5px] font-black uppercase px-2.5 py-1 rounded-full ${badgeBg}`}>
                            {b.status}
                          </span>

                          <div className="inline-flex gap-1.5">
                            {b.status === 'Pendente' && (
                              <>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = bookings.map(item => item.id === b.id ? { ...item, status: 'Confirmado' as const } : item);
                                    syncBookings(updated);
                                    addToast("✅ Agendamento CONFIRMADO com sucesso!");
                                  }}
                                  className="px-2.5 py-1 bg-blue-650 hover:bg-blue-800 text-white font-bold rounded-lg text-[10px] uppercase transition shadow-sm cursor-pointer"
                                >
                                  ✓ Confirmar
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    const updated = bookings.map(item => item.id === b.id ? { ...item, status: 'Cancelado' as const } : item);
                                    syncBookings(updated);
                                    addToast("Compromisso cancelado pelo prestador. ❌");
                                  }}
                                  className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold rounded-lg text-[10px] uppercase border cursor-pointer"
                                >
                                  Cancelar
                                </button>
                              </>
                            )}

                            {b.status === 'Confirmado' && (
                              <button
                                type="button"
                                onClick={() => {
                                  // Open review rating dialog
                                  setReviewingBooking(b);
                                }}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] uppercase transition shadow-sm cursor-pointer flex items-center gap-1"
                              >
                                ✓ Concluir
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Availability scheduling configuration drawer layout */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Configuração de Grade e Disponibilidade</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Determine os limites de agendamento por dia da semana</p>
              </div>

              {/* Fast 24-hours toggle indicator badge */}
              <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex flex-col sm:flex-row items-center justify-between gap-3">
                <div className="space-y-0.5 text-left">
                  <span className="text-[9.5px] font-black text-amber-700 uppercase tracking-wider block font-mono">Disponibilidade Especial</span>
                  <h5 className="font-extrabold text-slate-800 text-xs">🕐 Atendimento Emergencial 24 Horas</h5>
                  <p className="text-[10px] text-slate-500 font-semibold max-w-lg leading-normal pt-0.5">
                    Se habilitado, seu selo de "24h" ficará destacado imediatamente no catálogo geral de busca para motivar cliques diretos do WhatsApp.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const nextMode = !atende24h;
                    setAtende24h(nextMode);
                    addToast(`Emergencial 24h modificado para ${nextMode ? 'ATIVO' : 'DESATIVADO'}. Lembre-se de salvar!`);
                  }}
                  className={`px-4 py-2 font-black rounded-lg text-[10px] uppercase transition shadow-xs cursor-pointer ${
                    atende24h 
                      ? 'bg-amber-500 hover:bg-amber-600 text-white' 
                      : 'bg-white hover:bg-slate-100 text-slate-600 border'
                  }`}
                >
                  {atende24h ? '✓ Ativado 24h' : 'Desativado'}
                </button>
              </div>

              {/* Grid with each day settings */}
              {!atende24h && (
                <div className="space-y-3 pt-1 text-left">
                  {Object.keys(availability).map(day => {
                    const settings = availability[day];
                    return (
                      <div key={day} className="flex flex-col sm:flex-row sm:items-center sm:justify-between bg-slate-50 p-3 rounded-lg border gap-3 font-mono text-[11px]">
                        <span className="font-bold text-slate-800 w-24 block shrink-0">{day}</span>
                        <div className="inline-flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setAvailability({
                                ...availability,
                                [day]: { ...settings, disponivel: !settings.disponivel }
                              });
                            }}
                            className={`px-3 py-1 font-bold text-[9px] uppercase rounded border transition ${settings.disponivel ? 'bg-emerald-600 border-emerald-650 text-white' : 'bg-slate-200 text-slate-500'}`}
                          >
                            {settings.disponivel ? 'Disponível' : 'Indisponível'}
                          </button>
                        </div>

                        {settings.disponivel && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] text-slate-400">Das</span>
                            <input 
                              type="text" 
                              value={settings.inicio} 
                              onChange={(e) => {
                                setAvailability({
                                  ...availability,
                                  [day]: { ...settings, inicio: e.target.value }
                                });
                              }}
                              className="bg-white text-center w-14 border rounded p-1 text-[11px]" 
                            />
                            <span className="text-[10px] text-slate-400">às</span>
                            <input 
                              type="text" 
                              value={settings.fim} 
                              onChange={(e) => {
                                setAvailability({
                                  ...availability,
                                  [day]: { ...settings, fim: e.target.value }
                                });
                              }}
                              className="bg-white text-center w-14 border rounded p-1 text-[11px]" 
                            />
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Lunch break setup */}
                  <div className="bg-slate-50 p-3 rounded-lg border flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 text-[11px]">
                    <div className="text-left">
                      <span className="font-bold text-slate-800 block">☕ Intervalo de Almoço</span>
                      <p className="text-[9.5px] text-slate-450">Sua grade de contratação automática pulará este horário.</p>
                    </div>
                    <div className="flex items-center gap-1.5 font-mono">
                      <input 
                        type="text" 
                        value={intervaloAlmoco.inicio} 
                        onChange={(e) => setIntervaloAlmoco({ ...intervaloAlmoco, inicio: e.target.value })}
                        className="bg-white text-center w-14 border rounded p-1 text-[11px]" 
                      />
                      <span>até</span>
                      <input 
                        type="text" 
                        value={intervaloAlmoco.fim} 
                        onChange={(e) => setIntervaloAlmoco({ ...intervaloAlmoco, fim: e.target.value })}
                        className="bg-white text-center w-14 border rounded p-1 text-[11px]" 
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={saveAvailabilitySettings}
                  className="px-6 py-2.5 bg-[#1B2A6B] hover:bg-slate-900 text-white font-extrabold uppercase rounded-xl tracking-wide flex items-center gap-1 cursor-pointer transition"
                >
                  <Save className="w-4 h-4 text-[#F5C800] shrink-0" />
                  <span>Salvar Disponibilidade</span>
                </button>
              </div>

            </div>

            {/* RATING PROMPT CLIENT REVIEW DIALOG IF ACTIVE */}
            {reviewingBooking && (
              <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[130] p-4 animate-fadein">
                <div className="bg-white w-full max-w-md rounded-2xl border border-slate-300 p-6 shadow-2xl relative text-left">
                  <button 
                    onClick={() => setReviewingBooking(null)}
                    className="absolute top-4 right-4 text-slate-4CC hover:text-slate-800 p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>

                  <h4 className="text-sm font-black text-[#1B2A6B] uppercase border-l-2 border-brand-yellow pl-2 mb-2">
                    Avaliar o Cliente — TáNaMão 👑
                  </h4>
                  <p className="text-[10px] text-slate-500 font-bold mb-4">
                    Seu feedback sobre <strong>{reviewingBooking.clientName}</strong> ajuda a manter de forma protegida nosso Clube de Confiança local.
                  </p>

                  <form onSubmit={handleClientReviewSubmit} className="space-y-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <span className="block font-bold">Quantas estrelas dar para o cliente?</span>
                      <div className="flex gap-1.5 mt-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setReviewStars(star)}
                            className="bg-transparent border-0 outline-none p-1 cursor-pointer"
                          >
                            <Star 
                              className={`w-6 h-6 border-transparent ${
                                star <= reviewStars ? 'fill-amber-400 text-amber-500' : 'text-slate-205'
                              }`} 
                            />
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-1">
                      <span className="block font-bold">Comentário Técnico / Conduta do Cliente</span>
                      <textarea
                        rows={3}
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        placeholder="Ex: Cliente nota 10, pagou imediato e explicou o problema de forma clara..."
                        required
                        className="w-full bg-white text-slate-805 p-3 border border-slate-250 rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t text-[10px]">
                      <button
                        type="button"
                        onClick={() => setReviewingBooking(null)}
                        className="bg-slate-100 text-slate-600 px-4 py-2.5 rounded-lg border uppercase hover:bg-slate-200"
                      >
                        Desistir
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 bg-[#1B2A6B] text-[#F5C800] rounded-lg uppercase tracking-wide font-black hover:bg-slate-900 transition"
                      >
                        ✓ Gravar Avaliação
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 4: MENSAGENS / COMUNICAÇÃO */}
        {activePainelTab === 'mensagem' && (
          <div className="space-y-6 animate-fadein">
            
            {/* Split layout for communication dashboard */}
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs grid grid-cols-1 md:grid-cols-12 min-h-[450px]">
              
              {/* Sidebar: conversation clients list */}
              <div className="md:col-span-4 border-r border-slate-100 flex flex-col bg-slate-50/10">
                <div className="p-4 border-b bg-slate-50/50 flex items-center justify-between">
                  <span className="font-black text-[#1B2A6B] uppercase tracking-wider text-[10px]">Contatos Recentes</span>
                  <span className="text-[9px] bg-[#1B2A6B] text-white p-0.5 px-1.5 rounded-full font-bold font-mono">{proChats.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
                  {proChats.length === 0 ? (
                    <p className="text-center text-slate-400 py-10 font-semibold">Nenhuma conversa recente registrada.</p>
                  ) : (
                    proChats.map(session => {
                      const isActive = activeChatId === session.clientId;
                      const lastMsg = session.messages[session.messages.length - 1];

                      return (
                        <div
                          key={session.clientId}
                          onClick={() => {
                            setActiveChatId(session.clientId);
                            addToast(`Carregando chat de ${session.clientId.split('@')[0]}...`);
                          }}
                          className={`p-3 text-left transition cursor-pointer ${
                            isActive ? 'bg-[#1B2A6B]/10 border-l-4 border-[#1B2A6B]' : 'hover:bg-slate-50'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-[#1B2A6B]/15 text-[#1B2A6B] flex items-center justify-center font-black text-xs uppercase shrink-0">
                              {session.clientId.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h5 className="font-black text-slate-800 text-[11px] truncate md:max-w-[100px]">
                                  {session.clientId.split('@')[0]}
                                </h5>
                                <span className="inline-flex w-2 h-2 bg-green-500 rounded-full" title="Online Agora" />
                              </div>
                              <p className="text-[10px] text-slate-400 truncate mt-0.5 font-medium leading-none">
                                {lastMsg ? lastMsg.text : "Nenhuma mensagem..."}
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Chat window logic */}
              <div className="md:col-span-8 flex flex-col justify-between">
                
                {activeChatId && activeChatSession ? (
                  <>
                    {/* Header operations area */}
                    <div className="bg-slate-50/50 p-4 border-b flex items-center justify-between">
                      <div className="flex items-center gap-2 text-left">
                        <div className="w-7 h-7 rounded-full bg-emerald-100 flex items-center justify-center font-bold text-[#1B2A6B] text-xs">
                          {activeChatId.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-extrabold text-slate-800 text-xs">{activeChatId}</h4>
                          <span className="text-[9px] text-[#10B981] font-bold block leading-none select-none">● Ativo agora</span>
                        </div>
                      </div>

                      <div className="inline-flex gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => {
                            alert(`Chamada de Voz de Emergência simulada para o número do cliente! 📞`);
                          }}
                          className="bg-brand-blue text-white p-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 border hover:opacity-90 active:scale-95 transition"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>Ligar</span>
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            const inlineDate = prompt("Insira a data do orçamento sugerido (Ex: 2026-06-15):", "2026-06-10");
                            const inlineHour = prompt("Insira o horário sugerido (Ex: 14:30):", "14:30");
                            if (inlineDate && inlineHour) {
                              // Send text proposing
                              const propText = `📅 PROPOSTA DE COMPROMISSO ENVIADA nas Amarelas:\nData: ${inlineDate}\nHorário: ${inlineHour}\nPor favor, confirme se está de acordo!`;
                              
                              const updatedChats = chatSessions.map(sess => {
                                if (sess.proId === currentPro.id && sess.clientId === activeChatId) {
                                  return {
                                    ...sess,
                                    messages: [
                                      ...sess.messages,
                                      {
                                        sender: 'pro' as const,
                                        text: propText,
                                        timestamp: new Date().toISOString()
                                      }
                                    ]
                                  };
                                }
                                return sess;
                              });
                              syncChats(updatedChats);
                              addToast("Proposta de Compromisso inserida no chat! 📅");
                            }
                          }}
                          className="bg-brand-yellow text-brand-blue p-2 rounded-lg text-[10px] font-black uppercase flex items-center gap-1.5 border hover:opacity-90 active:scale-95 transition"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Propor Data</span>
                        </button>
                      </div>
                    </div>

                    {/* Messages list body */}
                    <div className="flex-1 p-4 overflow-y-auto space-y-3.5 max-h-[300px]">
                      {activeChatSession.messages.map((m, inx) => {
                        const isPro = m.sender === 'pro';
                        return (
                          <div key={inx} className={`flex ${isPro ? 'justify-end' : 'justify-start'}`}>
                            <div className={`p-3 rounded-2xl max-w-[80%] text-left ${isPro ? 'bg-[#1B2A6B] text-white rounded-tr-none' : 'bg-slate-100 text-slate-800 rounded-tl-none'} space-y-1 shadow-xs`}>
                              <p className="leading-relaxed font-medium">{m.text}</p>
                              <span className={`text-[8px] font-mono block text-right mt-1 ${isPro ? 'text-slate-300' : 'text-slate-400'}`}>
                                {new Date(m.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Footer text composer inputs */}
                    <div className="p-3 bg-slate-50 border-t flex gap-2">
                      <input 
                        type="text" 
                        value={chatInputText}
                        onChange={(e) => setChatInputText(e.target.value)}
                        placeholder="Escreva sua resposta para o cliente..."
                        onKeyDown={(e) => { if (e.key === 'Enter') handleSendMessage(); }}
                        className="flex-1 bg-white border rounded-xl px-3 py-2 text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#1B2A6B]"
                      />
                      <button
                        type="button"
                        onClick={handleSendMessage}
                        className="bg-[#1B2A6B] hover:bg-slate-900 text-white font-black uppercase px-4 py-2 rounded-xl transition cursor-pointer"
                      >
                        Enviar
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="p-8 text-center text-slate-400 space-y-3 flex flex-col justify-center items-center flex-1">
                    <span className="text-4xl block">💬</span>
                    <h5 className="text-xs font-bold text-slate-700">Seletor de Comunicação Ativo</h5>
                    <p className="text-[10.5px] max-w-xs mx-auto leading-relaxed">
                      Clique em um dos contatos na barra lateral esquerda para abrir a janela de chat com o cliente.
                    </p>
                  </div>
                )}

              </div>

            </div>

            {/* Auto response template editing block */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4 text-left">
              <div className="border-b pb-2">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Automação de Resposta Rápida (Robô)</h4>
                <p className="text-[10px] text-slate-400 font-semibold">Responda automaticamente o primeiro contato e evite perder leads</p>
              </div>

              <div className="space-y-4 font-semibold text-xs text-slate-705">
                <div className="flex items-center justify-between p-3 bg-indigo-50/50 rounded-xl border border-indigo-100">
                  <div className="space-y-0.5 text-left">
                    <strong className="block text-[#1B2A6B]">Ativar Secretária Eletrônica</strong>
                    <span className="text-[10px] text-slate-500 font-normal">Envia um texto assim que o cliente iniciar o primeiro chat</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setAutoResponseActive(!autoResponseActive)}
                    className={`px-4 py-2 rounded-lg font-black font-mono text-[9.5px] uppercase transition cursor-pointer shadow-xs ${autoResponseActive ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-500'}`}
                  >
                    {autoResponseActive ? 'Ativo ✓' : 'Desativado'}
                  </button>
                </div>

                {autoResponseActive && (
                  <>
                    <div className="space-y-1">
                      <span className="block font-bold">Mensagem de Resposta Automática</span>
                      <textarea
                        rows={2}
                        value={autoResponseText}
                        onChange={(e) => setAutoResponseText(e.target.value)}
                        className="w-full bg-white text-slate-800 p-2.5 border rounded-xl focus:outline-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <span className="block font-bold">Garantia máxima de feedback no perfil</span>
                        <select
                          value={responseGuarantee}
                          onChange={(e) => setResponseGuarantee(e.target.value)}
                          className="bg-white text-xs w-full p-2.5 border rounded-xl focus:outline-none"
                        >
                          <option value="1h">Responde em até 1 hora ⚡</option>
                          <option value="2h">Responde em até 2 horas</option>
                          <option value="4h">Responde em até 4 horas</option>
                          <option value="24h">Responde em até 24 horas</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <div className="flex justify-end pt-3">
                  <button
                    type="button"
                    onClick={saveAutoResponseOptions}
                    className="px-5 py-2.5 bg-[#1B2A6B] hover:bg-slate-900 text-white font-extrabold uppercase rounded-xl transition tracking-wide flex items-center gap-1 cursor-pointer"
                  >
                    <Save className="w-4 h-4 text-[#F5C800]" />
                    <span>Gravar Robô</span>
                  </button>
                </div>
              </div>
            </div>

          </div>
        )}

        {/* TAB 5: PLANOS E FINANCEIRO */}
        {activePainelTab === 'planos' && (
          <div className="space-y-6 animate-fadein text-left">
            
            {/* Active highlight details & Lead balances container */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Plan card details */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-7 space-y-3 shadow-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Meus Planos de Impulsionamento</h4>
                  <span className="text-[10px] font-black uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full leading-none">✓ Ativo</span>
                </div>

                <div className="space-y-4 pt-1 text-xs">
                  {currentPro.planoTipo && currentPro.planoTipo !== 'none' ? (
                    <>
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 bg-yellow-400 text-brand-blue font-black p-1 px-2.5 rounded-lg border uppercase text-[10px] tracking-wide">
                            🚀 Destaque: {currentPro.planoTipo.toUpperCase()}
                          </span>
                          <p className="text-[10.5px] text-slate-450 font-bold block pt-1">
                            Tipo de período: <strong className="uppercase font-mono font-extrabold text-[#1B2A6B]">{currentPro.planoPeriodo || 'único'}</strong>
                          </p>
                          {currentPro.destaqueCidade && (
                            <p className="text-[10px] text-slate-550 font-semibold">📍 Território Solo fixado: <strong className="text-slate-800">{currentPro.destaqueCidade}</strong></p>
                          )}
                          {currentPro.destaqueCategoriaNome && (
                            <p className="text-[10px] text-slate-550 font-semibold">🎯 Filtro de busca fixado: <strong className="text-slate-800">{currentPro.destaqueCategoriaNome}</strong></p>
                          )}
                        </div>
                        <div className="text-right">
                          <span className="block text-[8.5px] font-black text-slate-400 uppercase leading-none">Termina em:</span>
                          <strong className="text-[11.5px] text-slate-700 font-mono font-black">{currentPro.planoTermino || "Sem Limite"}</strong>
                        </div>
                      </div>

                      {/* Renewal Warning logic (3 days) */}
                      {planDaysLeft > 0 && planDaysLeft <= 3 ? (
                        <div className="bg-amber-50 text-amber-900 border border-amber-200 p-3 rounded-xl space-y-1.5 font-bold animate-pulse">
                          <p>⚠️ Restam apenas {planDaysLeft} dias de visualização destacada!</p>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedContractPlan({
                                id: currentPro.planoTipo,
                                nome: `Assinatura Renovação ${currentPro.planoTipo}`,
                                desc: 'Prorrogação de destaque das Amarelas nas buscas locais.',
                                precoSemana: '25',
                                precoMes: '79'
                              });
                              setContractCity(currentPro.cidade);
                              setContractStep(1);
                              setContractModalOpen(true);
                            }}
                            className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wide transition cursor-pointer"
                          >
                            Renovar período agora
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl flex items-center justify-between">
                            <span>Período Ativo Restante:</span>
                            <strong className="text-slate-800 font-mono">{planDaysLeft > 0 ? planDaysLeft : "Perpétuo / Créditos"} dias de destaque</strong>
                          </div>

                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div className="bg-[#1B2A6B] h-2 rounded-full" style={{ width: `${Math.min(100, Math.max(10, (planDaysLeft / 30) * 100))}%` }}></div>
                          </div>
                        </div>
                      )}

                      <div className="pt-2 border-t flex justify-end gap-2 text-[10px]">
                        <button
                          type="button"
                          onClick={() => {
                            const conf = window.confirm("Deseja realmente solicitar o cancelamento e desativação programada de seus destaques nas Amarelas?");
                            if (conf) {
                              addToast("Sua renovação automática foi cancelada! Seu destaque se manterá até a data programada.");
                            }
                          }}
                          className="text-[9.5px] font-bold text-rose-600 hover:text-rose-800 bg-rose-50 border p-1.5 px-3 rounded-lg"
                        >
                          ✕ Cancelar Plano Ativo
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="bg-slate-50/60 p-6 text-center border-2 border-dashed border-slate-200 rounded-xl space-y-3">
                      <span className="text-4xl block animate-bounce">📈</span>
                      <div>
                        <h5 className="text-xs font-extrabold text-slate-800">Seu cartão trabalha de forma orgânica</h5>
                        <p className="text-[10px] text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mt-1">
                          Consiga até 7.5x mais contatos contratando nossos planos de Destaque regional.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          const pubPlan = {
                            id: 'solo',
                            nome: 'Plano Território Solo',
                            desc: 'Fixe seu cartão no topo de buscas de sua cidade!',
                            precoSemana: '25',
                            precoMes: '79',
                            recorrente: true,
                            features: ['Selo Dourado', 'Destaque de Borda', 'Galeria de fotos ampliada']
                          };
                          setSelectedContractPlan(pubPlan);
                          setContractCity(currentPro.cidade);
                          setContractStep(1);
                          setContractModalOpen(true);
                          addToast("Escolha seu plano de destaque para faturar mais! 💰");
                        }}
                        className="p-2 py-2.5 px-4 bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] hover:text-white rounded-xl text-xs font-black uppercase transition shadow cursor-pointer text-center"
                      >
                        🌟 Ativar Destaques
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Lead charges widget */}
              <div className="bg-white p-5 rounded-2xl border border-slate-200 md:col-span-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b pb-2">
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Saldo Pré-Pago de Leads</h4>
                  <span className="text-[9.5px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-120 p-1 rounded-md leading-none select-none">
                    Leads ativos
                  </span>
                </div>

                <div className="space-y-4 text-xs font-semibold">
                  <div className="flex items-center justify-between p-3.5 bg-slate-50 rounded-xl border">
                    <span className="text-slate-450 uppercase text-[9px] font-black block">Créditos de Contatos:</span>
                    <strong className="text-xl font-mono text-[#1B2A6B] font-black">
                      R$ {(currentPro.saldoLeads ?? 15.00).toFixed(2)}
                    </strong>
                  </div>

                  {/* Red Alert warning if balance < 10.00 */}
                  {(currentPro.saldoLeads !== undefined && currentPro.saldoLeads < 10) && (
                    <div className="bg-red-50 text-rose-800 border-l-4 border-rose-500 p-3 rounded-r-xl space-y-1 animate-pulse">
                      <p className="font-bold">⚠️ Recarga Recomendada!</p>
                      <p className="text-[9.5px] text-slate-500 leading-normal">
                        Seu saldo está abaixo de R$ 10,00. Adicione mais créditos para continuar desbloqueando novos chats e contatos de ligações.
                      </p>
                    </div>
                  )}

                  {/* Packages items selection */}
                  <span className="text-[9px] font-black text-slate-400 block uppercase tracking-wider mb-2">Comprar pacote de leads:</span>
                  <div className="grid grid-cols-3 gap-2 text-[10px] font-black">
                    {[
                      { val: 20, bonus: '25', bg: 'bg-indigo-50 outline-none text-indigo-700 hover:bg-indigo-100 border-indigo-200' },
                      { val: 50, bonus: '65', bg: 'bg-emerald-50 outline-none text-emerald-700 hover:bg-emerald-100 border-emerald-250' },
                      { val: 100, bonus: '135', bg: 'bg-amber-50 outline-none text-amber-700 hover:bg-amber-100 border-amber-250 font-bold' }
                    ].map(pkg => (
                      <button
                        key={pkg.val}
                        onClick={() => {
                          const planRec = {
                            id: `leads-${pkg.val}`,
                            nome: `Moeda Leads R$ ${pkg.val}`,
                            desc: `Pacote de recarga no valor de R$ ${pkg.val}. Adiciona R$ ${pkg.bonus} de saldo técnico.`,
                            precoSemana: `${pkg.val}`,
                            precoMes: `${pkg.val}`
                          };
                          setSelectedContractPlan(planRec);
                          setContractCity(currentPro.cidade);
                          setContractStep(1);
                          setContractModalOpen(true);
                        }}
                        className={`p-2 py-3 rounded-xl border flex flex-col items-center justify-center gap-1 cursor-pointer transition ${pkg.bg}`}
                      >
                        <span className="text-xs text-slate-805">R$ {pkg.val}</span>
                        <span className="text-[8.5px] uppercase font-bold tracking-tight">Recarrega R$ {pkg.bonus}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

            </div>

            {/* Invoices logs table */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="pb-1">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Histórico de Cobrança e Faturamento</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Comprovantes e faturas registradas do seu anúncio</p>
              </div>

              <div className="overflow-x-auto border rounded-xl">
                <table className="w-full text-left font-mono text-[11px]">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 uppercase tracking-widest text-[8px] border-b">
                      <th className="p-3">Data Cobrança</th>
                      <th className="p-3">Serviço/Plano</th>
                      <th className="p-3">Faturamento</th>
                      <th className="p-3">Valor Cobrado</th>
                      <th className="p-3">Status Fatura</th>
                      <th className="p-3 text-center">Ações</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {[
                      { data: '2026-05-12', plan: 'Destaque Categoria', period: 'Mensal', valor: 'R$ 79,00', status: '✅ Aprovado' },
                      { data: '2026-04-12', plan: 'Destaque Categoria', period: 'Mensal', valor: 'R$ 79,00', status: '✅ Aprovado' },
                      { data: '2026-03-24', plan: 'Recarga Crédito Leads', period: 'Avulso', valor: 'R$ 50,00', status: '✅ Aprovado' },
                      { data: '2026-02-12', plan: 'Destaque Bairro Solo', period: 'Apenas Cadastro', valor: 'R$ 25,00', status: '❌ Rejeitado' }
                    ].map((row, i) => (
                      <tr key={i} className="hover:bg-slate-50/50">
                        <td className="p-3 text-slate-500 font-bold">{row.data}</td>
                        <td className="p-3 font-semibold text-slate-800">{row.plan}</td>
                        <td className="p-3 text-slate-450">{row.period}</td>
                        <td className="p-3 font-black text-[#1B2A6B] font-mono">{row.valor}</td>
                        <td className="p-3 font-black text-[10px]">{row.status}</td>
                        <td className="p-3 text-center">
                          <button
                            onClick={() => {
                              alert(`Simulando abertura do comprovante em PDF da fatura ${row.data}! 📄`);
                            }}
                            className="text-[#1B2A6B] hover:underline font-bold text-[9px] uppercase"
                          >
                            📄 Comprovante
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 6: MEU PERFIL (COMPLETE INLINE EDITOR WITH PREVIEW) */}
        {activePainelTab === 'perfil' && (
          <div className="space-y-6 animate-fadein text-left">
            <div className="bg-white p-5 rounded-2xl border border-slate-200">
              <div className="border-b pb-2 mb-4 flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Editar Perfil das Amarelas Digitais</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">As alterações serão exibidas em tempo real para os clientes do catálogo</p>
                </div>
                <button
                  type="button"
                  onClick={saveProfileChanges}
                  className="bg-[#1B2A6B] hover:bg-slate-900 text-white font-black uppercase text-[10.5px] px-4 py-2 rounded-xl transition shadow cursor-pointer text-center inline-flex items-center gap-1"
                >
                  <Save className="w-4 h-4 text-[#F5C800]" />
                  <span>Salvar Alterações</span>
                </button>
              </div>

              {/* Form container */}
              <div className="space-y-4 text-xs font-semibold">
                
                {/* Visual Identity Row: Avatar simulated crop */}
                <div className="flex flex-col sm:flex-row items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <div className="relative group cursor-pointer shrink-0">
                    <img 
                      src={editAvatar || "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&facepad=2&w=256&h=256&q=80"} 
                      alt="Profile" 
                      className="w-20 h-20 rounded-full border-4 border-[#F5C800] object-cover bg-white"
                    />
                    <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <Camera className="w-5 h-5 text-white" />
                    </div>
                  </div>
                  <div className="space-y-1.5 flex-1 w-full">
                    <span className="block font-bold">Link da Foto de Perfil (Avatar)</span>
                    <input 
                      type="text" 
                      value={editAvatar} 
                      onChange={(e) => setEditAvatar(e.target.value)}
                      placeholder="Insira URL da foto/avatar..."
                      className="bg-white w-full p-2.5 border rounded-xl font-mono text-[11px]" 
                    />
                    <span className="text-[9.5px] text-slate-400 block font-medium">Recomendamos fotos de meio corpo focadas com fundo claro.</span>
                  </div>
                </div>

                {/* Inline texts fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <span className="block font-bold">Seu Nome Completo</span>
                    <input 
                      type="text" 
                      value={editNome} 
                      onChange={(e) => setEditNome(e.target.value)}
                      className="bg-white w-full p-2.5 border rounded-xl" 
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">Nome da Empresa / Fantasia</span>
                    <input 
                      type="text" 
                      value={editEmpresa} 
                      onChange={(e) => setEditEmpresa(e.target.value)}
                      className="bg-white w-full p-2.5 border rounded-xl" 
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">Categoria de Atuação</span>
                    <select
                      value={editCategoria}
                      onChange={(e) => setEditCategoria(e.target.value)}
                      className="bg-white text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                    >
                      {CATEGORIES_LIST.map(cat => (
                        <option key={cat.name} value={cat.name}>{cat.emoji} {cat.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">Cidade com Estado</span>
                    <input 
                      type="text" 
                      value={editCidade} 
                      onChange={(e) => setEditCidade(e.target.value)}
                      placeholder="Ex: Bauru - SP"
                      className="bg-white w-full p-2.5 border rounded-xl font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">Telefone Principal</span>
                    <input 
                      type="text" 
                      value={editTelefone} 
                      onChange={(e) => setEditTelefone(e.target.value)}
                      placeholder="(14) XXXXX-XXXX"
                      className="bg-white w-full p-2.5 border rounded-xl" 
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">Celular / WhatsApp</span>
                    <input 
                      type="text" 
                      value={editCelular} 
                      onChange={(e) => setEditCelular(e.target.value)}
                      placeholder="(14) XXXXX-XXXX"
                      className="bg-white w-full p-2.5 border rounded-xl font-mono" 
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">E-mail Cadastrado</span>
                    <input 
                      type="email" 
                      value={editEmail} 
                      onChange={(e) => setEditEmail(e.target.value)}
                      className="bg-white w-full p-2.5 border rounded-xl" 
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="block font-bold">Endereço com Número</span>
                    <input 
                      type="text" 
                      value={editEndereco} 
                      onChange={(e) => setEditEndereco(e.target.value)}
                      className="bg-white w-full p-2.5 border rounded-xl" 
                    />
                  </div>
                </div>

                {/* BIO box text with character counter */}
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between">
                    <span className="block font-bold">Apresentação BIO (Breve Resumo dos Serviços)</span>
                    <span className={`text-[9.5px] font-mono ${editBio.length > 500 ? 'text-red-500 font-bold' : 'text-slate-450'}`}>
                      {editBio.length}/500 caracteres
                    </span>
                  </div>
                  <textarea
                    rows={4}
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value.slice(0, 500))}
                    placeholder="Conte sobre sua experiência, especialidades, termos de atendimento..."
                    className="w-full bg-white text-slate-800 p-3 border rounded-xl focus:outline-none"
                  />

                  {/* AI Bio Generator component block */}
                  <div className="mt-2.5">
                    {!aiExpanded ? (
                      <button
                        type="button"
                        onClick={() => setAiExpanded(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-extrabold rounded-lg text-[9.5px] uppercase tracking-wide shadow-sm hover:opacity-90 active:scale-95 transition-all text-left"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                        <span>Gerar Bio de Alta Conversão com IA Gemini (Oficial)</span>
                      </button>
                    ) : (
                      <div className="bg-indigo-50/70 p-4 rounded-xl border border-indigo-200 mt-2 space-y-3.5">
                        <div className="flex items-center justify-between border-b border-indigo-200/50 pb-1.5">
                          <div className="flex items-center gap-1">
                            <Sparkles className="w-4 h-4 text-indigo-600" />
                            <h5 className="font-extrabold text-indigo-900 text-[11px] uppercase tracking-wide animate-pulse">🧠 Assistente de Redação do TáNaMão Amarelas</h5>
                          </div>
                          <button
                            type="button"
                            onClick={() => setAiExpanded(false)}
                            className="text-slate-400 hover:text-slate-600 font-bold"
                          >
                            Cancelar
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 font-semibold">
                          <div className="space-y-1">
                            <span className="block text-[10px] text-indigo-900">Anos de Experiência</span>
                            <select
                              value={aiExp}
                              onChange={(e) => setAiExp(e.target.value)}
                              className="w-full bg-white p-2 border border-slate-300 rounded-lg text-[11px]"
                            >
                              <option value="1">1 ano de experiência</option>
                              <option value="3">3 anos de experiência</option>
                              <option value="5">5 anos de experiência</option>
                              <option value="10">10 anos de experiência</option>
                              <option value="15">Mais de 15 anos</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <span className="block text-[10px] text-indigo-900">Diferenciais e Especialidades Principais</span>
                            <input
                              type="text"
                              value={aiFocus}
                              onChange={(e) => setAiFocus(e.target.value)}
                              placeholder="Ex: porcelanato, rapidez, garantia, nota fiscal..."
                              className="w-full bg-white p-2 border border-slate-300 rounded-lg text-[11px]"
                            />
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={generateBioWithAI}
                          disabled={aiGenerating}
                          className="w-full py-2.5 bg-[#1B2A6B] hover:bg-slate-900 text-[#F5C800] font-black rounded-xl text-xs uppercase tracking-wider transition-all disabled:opacity-50"
                        >
                          {aiGenerating ? "⏳ Analisando dados & Redigindo..." : "🚀 Otimizar BIO com Inteligência Artificial"}
                        </button>
                      </div>
                    )}
                  </div>

                  {editBio && (
                    <div className="bg-slate-50 p-3 rounded-xl border border-dashed mt-2 space-y-1">
                      <span className="block text-[8.5px] text-slate-400 font-black uppercase tracking-wider font-mono">Visualização em Tempo Real (Preview):</span>
                      <p className="text-[11px] text-slate-650 italic font-medium leading-relaxed leading-normal">
                        "{editBio}"
                      </p>
                    </div>
                  )}
                </div>

                {/* WHATSAPP CUSTOMIZED DIRECT CONTACT MESSAGE DEFAULT */}
                <div className="space-y-1.5 pt-3.5 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="block font-bold text-slate-800">Mensagem Inicial Personalizada no WhatsApp</span>
                    <span className="text-[9.5px] font-medium text-slate-400">Exibida quando o cliente clica para falar no WhatsApp</span>
                  </div>
                  <input
                    type="text"
                    value={whatsappMsg}
                    onChange={(e) => setWhatsappMsg(e.target.value)}
                    placeholder="Olá! Vi seu perfil no TáNaMão Amarelas e gostaria de falar com você."
                    className="w-full bg-white border border-slate-300 p-2.5 rounded-xl font-medium"
                  />
                  <p className="text-[9.5px] font-semibold text-indigo-600 leading-normal">
                    💡 <strong>Vantagem mobile:</strong> Personalize a mensagem padrão que o seu cliente enviará ao iniciar a conversa no celular. Economiza tempo e qualifica melhor o lead!
                  </p>
                </div>

              </div>
            </div>

            {/* MEU PORTFÓLIO: ANTES E DEPOIS SUB-FORM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Gerenciar Portfólio de Trabalhos (Antes & Depois)</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Mostre faturas fotográficas detalhadas de frentes de obras concluídas</p>
              </div>

              {/* Pair lists */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {portfolio.map((item, inx) => (
                  <div key={inx} className="bg-slate-50 p-3 rounded-xl border border-slate-200 space-y-2 relative">
                    <button
                      type="button"
                      onClick={() => {
                        const updated = portfolio.filter((_, idx) => idx !== inx);
                        setPortfolio(updated);
                        addToast("Trabalho removido do portfólio. Lembre de Salvar!");
                      }}
                      className="absolute top-2 right-2 bg-rose-50 text-rose-600 border border-rose-200 rounded-full p-1.5 hover:bg-rose-100 text-[10px]"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <h5 className="font-extrabold text-slate-800 pr-5 truncate">{item.titulo}</h5>
                    <p className="text-[10px] text-slate-550 leading-relaxed truncate">{item.descricao}</p>
                    <div className="grid grid-cols-2 gap-2 mt-1">
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-mono text-slate-400 uppercase tracking-widest block text-center">Antes</span>
                        <img src={item.antes} alt="Antes" className="w-full h-16 rounded border bg-white object-cover" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[8.5px] font-mono text-[#1B2A6B] uppercase tracking-widest block text-center">Depois</span>
                        <img src={item.depois} alt="Depois" className="w-full h-16 rounded border bg-white object-cover" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Sub-form creator inline */}
              <div className="bg-slate-50/50 p-4 border border-dashed rounded-xl space-y-3 font-semibold text-slate-705">
                <span className="block text-[9.5px] font-black text-[#1B2A6B] uppercase tracking-wide font-mono">➕ Adicionar novo trabalho de portfólio:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="block text-[10px]">Título do Trabalho</span>
                    <input 
                      type="text" 
                      value={newPortfolioTitle}
                      onChange={(e) => setNewPortfolioTitle(e.target.value)}
                      placeholder="Ex: Reforma de banheiro completo..."
                      className="bg-white w-full p-2 border rounded-lg text-[11px]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px]">Descrição Simples</span>
                    <input 
                      type="text" 
                      value={newPortfolioDesc}
                      onChange={(e) => setNewPortfolioDesc(e.target.value)}
                      placeholder="Ex: porcelanato colocado e tubulações..."
                      className="bg-white w-full p-2 border rounded-lg text-[11px]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px]">URL da Foto ANTES</span>
                    <input 
                      type="text" 
                      value={newPortfolioBefore}
                      onChange={(e) => setNewPortfolioBefore(e.target.value)}
                      placeholder="Link da imagem antes..."
                      className="bg-white w-full p-2 border rounded-lg font-mono text-[10.5px]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px]">URL da Foto DEPOIS</span>
                    <input 
                      type="text" 
                      value={newPortfolioAfter}
                      onChange={(e) => setNewPortfolioAfter(e.target.value)}
                      placeholder="Link da imagem depois..."
                      className="bg-white w-full p-2 border rounded-lg font-mono text-[10.5px]" 
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newPortfolioTitle || !newPortfolioBefore || !newPortfolioAfter) {
                      addToast("Preencha título, imagem antes e imagem depois! 🛟");
                      return;
                    }
                    const newItem = {
                      antes: newPortfolioBefore,
                      depois: newPortfolioAfter,
                      titulo: newPortfolioTitle,
                      descricao: newPortfolioDesc
                    };
                    setPortfolio([...portfolio, newItem]);
                    setNewPortfolioTitle("");
                    setNewPortfolioDesc("");
                    setNewPortfolioBefore("");
                    setNewPortfolioAfter("");
                    addToast("Trabalho inserido no portfólio temporário!");
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-brand-blue text-white rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Inserir no Portfólio</span>
                </button>
              </div>
            </div>

            {/* GALLERIES IMAGES GRIDS */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b pb-2 flex items-center justify-between flex-wrap gap-2">
                <div>
                  <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Gerenciar Fotos da Galeria Principal</h4>
                  <p className="text-[10px] text-slate-400 font-semibold mt-0.5">O limite gratuito permite até 5 fotos faturadas</p>
                </div>
                <span className="text-[10px] bg-slate-50 border p-1 px-2.5 rounded-full font-bold">
                  {gallery.length}/5 fotos gratuitas utilizadas
                </span>
              </div>

              {/* Photos grid */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                {gallery.map((p, inx) => (
                  <div key={inx} className="relative group border rounded-xl overflow-hidden bg-slate-100 aspect-square">
                    <img src={p} alt="Gallery" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => {
                        const updated = gallery.filter((_, i) => i !== inx);
                        setGallery(updated);
                        addToast("Imagem removida! Clique em Salvar para consolidar.");
                      }}
                      className="absolute top-1.5 right-1.5 bg-rose-600/95 text-white p-1 rounded-full border border-white hover:bg-rose-700 shadow max-w-[24px] max-h-[24px] flex items-center justify-center transition"
                    >
                      X
                    </button>
                  </div>
                ))}

                {gallery.length < 5 ? (
                  <div className="border-2 border-dashed rounded-xl flex flex-col items-center justify-center p-4 aspect-square bg-slate-50/20 text-slate-400">
                    <span className="text-lg">➕</span>
                    <span className="text-[9px] block text-center mt-1">Disponível</span>
                  </div>
                ) : (
                  <div className="border-2 border-dashed border-indigo-200 rounded-xl flex flex-col items-center justify-[#center] p-3 text-center aspect-square bg-indigo-50/10 text-indigo-800">
                    <span className="text-sm">👑</span>
                    <span className="text-[8.5px] block leading-relaxed font-black uppercase tracking-tight mt-1">Plano Pago</span>
                    <button
                      type="button"
                      onClick={() => {
                        addToast("Ativando assinatura de Fotos Extra no plano Destaque!");
                        setActivePainelTab('planos');
                      }}
                      className="text-[7.5px] bg-indigo-650 text-white rounded p-1 px-1.5 uppercase font-bold tracking-widest mt-1.5"
                    >
                      Liberar +10 fotos
                    </button>
                  </div>
                )}
              </div>

              {/* Photo Input adder */}
              {gallery.length < 5 && (
                <div className="bg-slate-50/50 p-3 rounded-xl border flex gap-2 font-semibold">
                  <input
                    type="text"
                    value={newPhotoUrl}
                    onChange={(e) => setNewPhotoUrl(e.target.value)}
                    placeholder="Cole a URL da imagem aqui para adicionar à galeria residencial..."
                    className="flex-1 bg-white border rounded-lg px-2.5 py-1.5 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (!newPhotoUrl.trim()) return;
                      setGallery([...gallery, newPhotoUrl.trim()]);
                      setNewPhotoUrl("");
                      addToast("Fotos inseridas na lista provisória!");
                    }}
                    className="px-4 py-1.5 bg-[#1B2A6B] hover:bg-slate-900 text-white rounded-lg text-[10.5px] font-black uppercase transition shrink-0"
                  >
                    Adicionar
                  </button>
                </div>
              )}
            </div>

            {/* MEU CERTIFICADOS: SUB-FORM */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-4">
              <div className="border-b pb-2">
                <h4 className="text-xs font-black text-[#1B2A6B] uppercase tracking-wide">Meus Certificados de Especialidade</h4>
                <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Certificações e capacitações técnicas que agregam autoridade técnica</p>
              </div>

              <div className="space-y-2.5">
                {certificates.map((cert, inx) => (
                  <div key={inx} className="bg-slate-50 p-3 rounded-xl border flex items-center justify-between gap-3 font-mono text-[11px]">
                    <div className="flex items-center gap-2">
                      <Award className="w-4 h-4 text-[#F5C800] shrink-0" />
                      <div>
                        <strong className="text-slate-805 leading-normal">{cert.curso}</strong>
                        <span className="text-slate-450 text-[10px] block font-semibold">{cert.instituicao} • Ano {cert.ano}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const updated = certificates.filter((_, idx) => idx !== inx);
                        setCertificates(updated);
                        addToast("Certificado removido. Lembre de Salvar!");
                      }}
                      className="bg-rose-50 text-rose-600 hover:bg-rose-100 p-1 rounded-lg border border-rose-200 text-[10px] font-bold shrink-0 uppercase cursor-pointer"
                    >
                      Remover
                    </button>
                  </div>
                ))}
              </div>

              {/* Subform adding certified */}
              <div className="bg-slate-50/50 p-4 border border-dashed rounded-xl space-y-3 font-semibold text-slate-705">
                <span className="block text-[9.5px] font-black text-[#1B2A6B] uppercase tracking-wide font-mono">➕ Cadastrar novo certificado / curso realizado:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="space-y-1">
                    <span className="block text-[10px]">Curso Técnico</span>
                    <input 
                      type="text" 
                      value={newCertCourse}
                      onChange={(e) => setNewCertCourse(e.target.value)}
                      placeholder="Ex: Trabalho em Altura NR35..."
                      className="bg-white w-full p-2 border rounded-lg text-[11px]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px]">Instituição Emissora</span>
                    <input 
                      type="text" 
                      value={newCertInstitution}
                      onChange={(e) => setNewCertInstitution(e.target.value)}
                      placeholder="Ex: SENAI, Escola Segura..."
                      className="bg-white w-full p-2 border rounded-lg text-[11px]" 
                    />
                  </div>
                  <div className="space-y-1">
                    <span className="block text-[10px]">Ano da Emissão</span>
                    <input 
                      type="number" 
                      value={newCertYear}
                      onChange={(e) => setNewCertYear(parseInt(e.target.value) || new Date().getFullYear())}
                      className="bg-white w-full p-2 border rounded-lg font-mono text-[11px]" 
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    if (!newCertCourse || !newCertInstitution) {
                      addToast("Preencha curso e instituição de emissão!");
                      return;
                    }
                    const newC = {
                      curso: newCertCourse,
                      instituicao: newCertInstitution,
                      ano: newCertYear
                    };
                    setCertificates([...certificates, newC]);
                    setNewCertCourse("");
                    setNewCertInstitution("");
                    setNewCertYear(new Date().getFullYear());
                    addToast("Certificado incluído na listagem provisória!");
                  }}
                  className="px-4 py-2 bg-indigo-650 hover:bg-brand-blue text-white rounded-lg text-[10px] font-black uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 mx-auto"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Cadastrar Certificado</span>
                </button>
              </div>
            </div>

            {/* FIXED BOTTOM SAVE FLOATER */}
            <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between border-t shadow-lg">
              <div className="text-left">
                <h5 className="text-xs font-black text-[#F5C800] uppercase tracking-wide">Modificações Pendentes</h5>
                <p className="text-[10px] text-slate-300">Não esqueça de carimbar as faturas nas Amarelas Digitais</p>
              </div>
              <button
                type="button"
                onClick={saveProfileChanges}
                className="bg-brand-yellow hover:bg-brand-accent text-[#1B2A6B] font-black uppercase text-xs py-2.5 px-6 rounded-xl hover:-translate-y-0.5 active:translate-y-0 transition cursor-pointer flex items-center gap-1.5 shadow"
              >
                <Save className="w-4 h-4 shrink-0" />
                <span>Salvar Todas Alterações ✓</span>
              </button>
            </div>

          </div>
        )}

      </main>
    </div>
  );
}
