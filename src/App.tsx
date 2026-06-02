import React, { useState, useEffect, useMemo, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  MapPin, 
  Star, 
  Eye, 
  PlusCircle, 
  Calendar, 
  ArrowLeft, 
  Phone, 
  Mail, 
  User, 
  CheckCircle, 
  Grid, 
  ChevronRight, 
  Image as ImageIcon, 
  X, 
  Sparkles, 
  PhoneCall, 
  Check, 
  ChevronLeft, 
  Heart, 
  Briefcase, 
  Bell, 
  Hammer, 
  Scissors, 
  GraduationCap, 
  Laptop, 
  Home as HomeIcon, 
  MessageSquare,
  Filter,
  Share2,
  AlertCircle,
  Trash2,
  Camera,
  Save,
  Plus,
  Award,
  TrendingUp,
  Clock,
  Settings,
  FileText,
  CheckCheck,
  Megaphone
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
  { code: "SP", name: "São Paulo" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "MG", name: "Minas Gerais" },
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" }
];

interface ClientAdvertiser {
  id: number;
  nome: string;
  slogan: string;
  cidade: string;
  estado: string;
  foto: string;
  whatsapp: string;
  plano: string;
  validade: string;
}

const MOCK_CLIENT_ADVERTISERS: ClientAdvertiser[] = [
  {
    id: 1,
    nome: "Reformas Silva",
    slogan: "Qualidade e pontualidade garantidas",
    cidade: "Bauru",
    estado: "SP",
    foto: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&q=80&w=1200",
    whatsapp: "14999990001",
    plano: "destaque_solo",
    validade: "2025-12-31"
  },
  {
    id: 2,
    nome: "Elétrica Costa",
    slogan: "24h para sua emergência elétrica",
    cidade: "Bauru",
    estado: "SP",
    foto: "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200",
    whatsapp: "14999990002",
    plano: "destaque_solo",
    validade: "2025-12-31"
  },
  {
    id: 3,
    nome: "TecnoFix",
    slogan: "Assistência técnica rápida e confiável",
    cidade: "Bauru",
    estado: "SP",
    foto: "https://images.unsplash.com/photo-1588508065123-287b28e013da?auto=format&fit=crop&q=80&w=1200",
    whatsapp: "14999990003",
    plano: "destaque_solo",
    validade: "2025-12-31"
  }
];

export default function App() {
  // --- CORE STATE PERSISTENCE ---
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [activeRegion, setActiveRegion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]); // list of favorited professional IDs
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [currentAdIdx, setCurrentAdIdx] = useState<number>(0);

  // --- ADDITIONAL EXTENSION STATES ---
  const [only24h, setOnly24h] = useState<boolean>(false);
  const [toasts, setToasts] = useState<{ id: number; message: string }[]>([]);
  const [activeLoginTab, setActiveLoginTab] = useState<'login' | 'register'>('login');
  const [userEmail, setUserEmail] = useState<string>("");
  const [userType, setUserType] = useState<'client' | 'pro'>('client');
  const [registerPassword, setRegisterPassword] = useState<string>("123456");

  // --- MONETIZATION ADDITIONAL STATES ---
  const [monetizationTab, setMonetizationTab] = useState<'publish' | 'boost'>('publish');
  const [boostProId, setBoostProId] = useState<number | "">("");
  const [selectedPlanId, setSelectedPlanId] = useState<'solo' | 'linha' | 'galeria'>('solo');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'cartao'>('pix');
  const [pixFeedback, setPixFeedback] = useState<string>("");
  const [copiedPix, setCopiedPix] = useState<boolean>(false);
  const [receiptFileSimulated, setReceiptFileSimulated] = useState<boolean>(false);

  // Simple Notification triggers inside UI
  const addToast = (msg: string) => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message: msg }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3500);
  };

  // Safe navigation with hash updates (SPA)
  const updateProfileIdWithHash = (id: number | null) => {
    setSelectedProfileId(id);
    if (id !== null) {
      window.location.hash = `#perfil-${id}`;
    } else {
      window.location.hash = '#home';
    }
  };

  // --- GEOLOCATION ADDITIONAL STATES ---
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
        setUserLat(latitude);
        setUserLon(longitude);
        setGeoFeedback("Localização obtida! Identificando cidade...");

        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          if (!response.ok) {
            throw new Error("Erro na geocodificação reversa");
          }
          const data = await response.json();
          const address = data.address || {};
          
          // Try to get city Name
          const rawCity = address.city || address.town || address.village || address.municipality || address.suburb;
          const rawState = address.state || "";
          
          if (!rawCity) {
            throw new Error("Nome da cidade não reconhecido.");
          }

          const stateInitials = stateAbbreviations[rawState] || rawState || "SP";
          const resolvedRegion = `${rawCity} - ${stateInitials}`;

          // Update active region & Save metadata
          setActiveRegion(resolvedRegion);
          localStorage.setItem('tanamao_region', resolvedRegion);
          
          const geoData = {
            cidade: rawCity,
            estado: stateInitials,
            lat: latitude,
            lon: longitude
          };
          localStorage.setItem('tanamao_geolocation', JSON.stringify(geoData));

          setGeoFeedback(`Sucesso! Localizado em ${resolvedRegion}`);
          addToast(`Localização atualizada para ${resolvedRegion}! 🗺️`);
          setGeoLoading(false);
          setShowLocationFallback(false);
          
          // Auto close region selection modal after success
          setTimeout(() => {
            setRegionModalOpen(false);
            setGeoFeedback("");
          }, 1500);

        } catch (err) {
          console.error(err);
          setGeoFeedback("Não foi possível identificar sua cidade automaticamente. Selecione manualmente.");
          setGeoLoading(false);
          setShowLocationFallback(true);
          setRegionModalOpen(true);
        }
      },
      (error) => {
        console.error(error);
        let errorMsg = "Permissão negada.";
        if (error.code === error.PERMISSION_DENIED) {
          errorMsg = "Permissão de localização negada pelo navegador.";
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          errorMsg = "Sinal de localização indisponível.";
        } else if (error.code === error.TIMEOUT) {
          errorMsg = "Tempo esgotado ao obter localização.";
        }
        setGeoFeedback(errorMsg);
        setGeoLoading(false);
        setShowLocationFallback(true);
        setRegionModalOpen(true);
      },
      { timeout: 10000 }
    );
  };

  const handleManualRegionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCity.trim()) return;
    
    // Capitalize city name nicely
    const formattedCity = manualCity.trim().split(' ').map(word => {
      if (word.length <= 2 && /^(de|da|do|dos|das)$/i.test(word)) return word.toLowerCase();
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }).join(' ');
    const resolvedRegion = `${formattedCity} - ${manualState}`;
    
    setActiveRegion(resolvedRegion);
    localStorage.setItem('tanamao_region', resolvedRegion);
    
    const geoData = {
      cidade: formattedCity,
      estado: manualState,
      lat: 0,
      lon: 0
    };
    localStorage.setItem('tanamao_geolocation', JSON.stringify(geoData));
    
    setGeoFeedback(`Escolhido manualmente: ${resolvedRegion}`);
    setTimeout(() => {
      setRegionModalOpen(false);
      setGeoFeedback("");
      setManualCity("");
    }, 1200);
  };

  // Filter States inside List View
  const [ratingFilter, setRatingFilter] = useState<string>("all"); // 'all' | '4.5+' | '4.0+'
  const [sortOrder, setSortOrder] = useState<string>("visitas"); // 'visitas' | 'nota' | 'recentes' | 'alfabetica'

  // Slider State (Hero Banner)
  const [currentSlide, setCurrentSlide] = useState<number>(0);

  // Authentication Mock State (now Supabase)
  const [userSession, setUserSession] = useState<UserSession>({
    nome: "Convidado",
    email: "convidado@tanamao.com.br",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    logado: false,
    tipo: 'client'
  });

  // --- SUPABASE AUTH FUNCTIONS ---
  const cadastrar = async (email: string, senha: string, nome: string, tipo: 'client' | 'pro') => {
    // @ts-ignore
    const { data: { user }, error } = await window.supabaseClient.auth.signUp({
      email, password: senha,
      options: { data: { nome, tipo } }
    });
    if (error) throw error;

    // @ts-ignore
    await window.supabaseClient.from('usuarios').insert({
      id: user?.id,
      nome, email, tipo,
      codigo_indicacao: `TN-${nome.substring(0,3).toUpperCase()}${Math.floor(Math.random()*1000)}`
    });
  };

  const login = async (email: string, senha: string) => {
    // @ts-ignore
    const { data, error } = await window.supabaseClient.auth.signInWithPassword({
      email, password: senha
    });
    if (error) throw error;
    return data.user;
  };

  const logout = async () => {
    // @ts-ignore
    await window.supabaseClient.auth.signOut();
  };

  useEffect(() => {
    // @ts-ignore
    const { data: { subscription } } = window.supabaseClient.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        setUserSession({
          nome: session.user.user_metadata.nome || 'Usuário',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar || '',
          logado: true,
          tipo: session.user.user_metadata.tipo || 'client'
        });
      } else {
        setUserSession({
          nome: "Convidado",
          email: "convidado@tanamao.com.br",
          avatar: "...",
          logado: false,
          tipo: 'client'
        });
      }
    });
    return () => subscription.unsubscribe();
  }, []);

  // --- NEW UX FEATURE STATES ---
  // Distance Filter States
  const [distanceStepIdx, setDistanceStepIdx] = useState<number>(4); // default: 4 (Qualquer distância)
  const [userLat, setUserLat] = useState<number | null>(null);
  const [userLon, setUserLon] = useState<number | null>(null);

  // Autocomplete UI States
  const [autocompleteOpen, setAutocompleteOpen] = useState<boolean>(false);

  // Chat Internal States
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([]);
  const [activeChatProId, setActiveChatProId] = useState<number | null>(null);
  const [chatModalOpen, setChatModalOpen] = useState<boolean>(false);
  const [chatMessageText, setChatMessageText] = useState<string>("");

  // Scheduling & Booking States
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [bookingModalOpen, setBookingModalOpen] = useState<boolean>(false);
  const [bookingProId, setBookingProId] = useState<number | null>(null);
  const [selectedBookingDate, setSelectedBookingDate] = useState<string>("");
  const [selectedBookingTime, setSelectedBookingTime] = useState<string>("");

  // User Dashboard Drawer Panel States
  const [userPanelOpen, setUserPanelOpen] = useState<boolean>(false);
  const [activeUserPanelTab, setActiveUserPanelTab] = useState<'agendamentos' | 'conversas' | 'dados' | 'planos'>('agendamentos');

  // Professional Central Panel States
  const [viewPainel, setViewPainel] = useState<boolean>(false);
  const [activePainelTab, setActivePainelTab] = useState<'dashboard' | 'estatisticas' | 'agendamentos' | 'mensagem' | 'planos' | 'perfil'>('dashboard');

  // Notifications
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [notificationsOpen, setNotificationsOpen] = useState<boolean>(false);

  // --- PWA AND NOTIFICATION MOCKS STATES ---
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showPwaBanner, setShowPwaBanner] = useState<boolean>(false);
  const [notificationsPermissionState, setNotificationsPermissionState] = useState<'prompt' | 'granted' | 'denied'>('prompt');
  const [showNotificationPromptModal, setShowNotificationPromptModal] = useState<boolean>(false);
  const [recommendationSeed, setRecommendationSeed] = useState<number>(0);

  // --- EXPANDED MONETIZATION SYSTEM STATES ---
  const [viewPlanos, setViewPlanos] = useState<boolean>(false);
  const [activePlanPeriod, setActivePlanPeriod] = useState<'semanal' | 'mensal'>('mensal');
  const [contractModalOpen, setContractModalOpen] = useState<boolean>(false);
  const [selectedContractPlan, setSelectedContractPlan] = useState<{
    id: string;
    nome: string;
    desc: string;
    precoSemana: number;
    precoMes: number;
    recorrente: boolean;
    features: string[];
  } | null>(null);
  const [contractStep, setContractStep] = useState<1 | 2>(1);
  const [contractCity, setContractCity] = useState<string>("");
  const [contractCategory, setContractCategory] = useState<string>("");
  const [paymentPixCountdown, setPaymentPixCountdown] = useState<number>(900); // 15 minutes countdown
  const [creditCardName, setCreditCardName] = useState<string>("");
  const [creditCardNumber, setCreditCardNumber] = useState<string>("");
  const [creditCardExpiry, setCreditCardExpiry] = useState<string>("08/30");
  const [creditCardCvv, setCreditCardCvv] = useState<string>("123");

  // CPF or CNPJ verification states inside forms
  const [newProDocumento, setNewProDocumento] = useState<string>("");
  const [registerEmail, setRegisterEmail] = useState<string>("");
  const [registerDocumento, setRegisterDocumento] = useState<string>("");

  // UI Modal controllers
  const [regionModalOpen, setRegionModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [announceModalOpen, setAnnounceModalOpen] = useState<boolean>(false);
  const [storiesModalOpen, setStoriesModalOpen] = useState<boolean>(false);
  const [storyBg, setStoryBg] = useState<'navy' | 'dark' | 'yellow' | 'gradient'>('navy');
  
  // Custom login inputs
  const [usernameInput, setUsernameInput] = useState<string>("");
  const [loginFeedback, setLoginFeedback] = useState<string>("");

  // Announcement Form states
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


  // --- MELHORIA 3: TRUST AND SAFETY STATES ---
  const [verificationLoading, setVerificationLoading] = useState<boolean>(false);
  const [verificationError, setVerificationError] = useState<string>("");

  // Denuncia (Report Profile) States
  const [reportModalOpen, setReportModalOpen] = useState<boolean>(false);
  const [reportProId, setReportProId] = useState<number | null>(null);
  const [reportReason, setReportReason] = useState<string>("Perfil falso ou duplicado");
  const [reportDescription, setReportDescription] = useState<string>("");
  const [reportDescError, setReportDescError] = useState<string>("");

  // Portfolio addition states
  const [portfolioModalOpen, setPortfolioModalOpen] = useState<boolean>(false);
  const [portfolioTitleInput, setPortfolioTitleInput] = useState<string>("");
  const [portfolioDescInput, setPortfolioDescInput] = useState<string>("");
  const [portfolioAntesInput, setPortfolioAntesInput] = useState<string>("");
  const [portfolioDepoisInput, setPortfolioDepoisInput] = useState<string>("");

  // Certificates addition states
  const [certModalOpen, setCertModalOpen] = useState<boolean>(false);
  const [certCourseInput, setCertCourseInput] = useState<string>("");
  const [certInstInput, setCertInstInput] = useState<string>("");
  const [certYearInput, setCertYearInput] = useState<string>("");

  // Evaluation extra controls/filters
  const [reviewsFilter, setReviewsFilter] = useState<'recência' | 'fotos' | 'úteis'>('recência');

  // Professional Reply to Evaluation states
  const [replyOpenIndex, setReplyOpenIndex] = useState<number | null>(null);
  const [replyTextInput, setReplyTextInput] = useState<string>("");

  // Client Evaluation modal States (Pro evaluates Client)
  const [clientReviewModalOpen, setClientReviewModalOpen] = useState<boolean>(false);
  const [clientReviewBookingId, setClientReviewBookingId] = useState<string>("");
  const [clientReviewStars, setClientReviewStars] = useState<number>(5);
  const [clientReviewComentario, setClientReviewComentario] = useState<string>("");

  // Filter Grid for TáNaMão-certified pros only
  const [filterOnlyCertified, setFilterOnlyCertified] = useState<boolean>(false);
  
  // Shared Clients reviews collection
  const [clientReviews, setClientReviews] = useState<ClientReview[]>([]);

  // Review Form States
  const [reviewAuthor, setReviewAuthor] = useState<string>("");
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");


  // Active picture preview inside professional gallery
  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState<string>("");

  const [showNotificationCount, setShowNotificationCount] = useState<boolean>(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);

  // --- SPLASH SCREEN AUTO-CLOSE ---
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  // --- INITIAL COMPONENT HYDRATION ---
  useEffect(() => {
    // 1. Regions Selection checklist
    const storedRegion = localStorage.getItem('tanamao_region');
    if (storedRegion) {
      setActiveRegion(storedRegion);
    } else {
      // Default fallback is Bauru - SP as requested
      setActiveRegion("Bauru - SP");
      setRegionModalOpen(true);
    }

    const storedGeo = localStorage.getItem('tanamao_geolocation');
    if (storedGeo) {
      try {
        const parsedGeo = JSON.parse(storedGeo);
        if (parsedGeo.lat && parsedGeo.lon) {
          setUserLat(parsedGeo.lat);
          setUserLon(parsedGeo.lon);
        }
      } catch (e) {}
    }

    // 2. Hydrate Professionals DB
    const storedDB = localStorage.getItem('tanamao_db');
    let dbToHydrate: Profissional[] = INITIAL_PROFESSIONALS;
    if (storedDB) {
      try {
        dbToHydrate = JSON.parse(storedDB);
      } catch (e) {}
    }
    // Deep map to ensure everyone has a slug and default values
    const processedDBSlugs = dbToHydrate.map(p => {
      const slugVal = p.slug || generateSlug(p.nome, p.categoria);
      // Give some default post feed to a few pros
      let feed = p.postsFeed;
      if (p.id === 6 && !feed) {
        // Ricardo Abreu Junior
        feed = [
          {
            id: 'post-1',
            text: '⚡ Super Promoção de inverno: Instalação de servidores Linux locais com 20% de desconto essa semana!',
            data: new Date(2026, 5, 1).toISOString(),
            tipo: 'Promoção' as const,
            expiraEm: '2026-06-10'
          },
          {
            id: 'post-2',
            text: '✅ Projeto concluído com sucesso: Cabeamento estruturado e roteamento de 24 switches corporativos.',
            data: new Date(2026, 4, 25).toISOString(),
            tipo: 'Trabalho Concluído' as const
          }
        ];
      } else if (p.id === 1 && !feed) {
        // Carlos Eduardo Oliveira
        feed = [
          {
            id: 'post-3',
            text: '📢 Aviso importante: Atendimento normal no feriado de Corpus Christi! Agende com antecedência.',
            data: new Date(2026, 5, 1, 10, 0).toISOString(),
            tipo: 'Aviso' as const
          },
          {
            id: 'post-4',
            text: '✅ Reforma concluída: Banheiro social com nicho em porcelanato e iluminação embutida. Ficou fantástico!',
            data: new Date(2026, 4, 28).toISOString(),
            tipo: 'Trabalho Concluído' as const
          }
        ];
      }
      return {
        ...p,
        slug: slugVal,
        postsFeed: feed,
        whatsappMsgDefault: p.whatsappMsgDefault || "Olá! Vi seu perfil no TáNaMão e gostaria de um orçamento."
      };
    });
    setProfessionals(processedDBSlugs);
    localStorage.setItem('tanamao_db', JSON.stringify(processedDBSlugs));

    // Hydrate default PWA, simulated notification preferences, default referral and mock credits
    if (!localStorage.getItem('tanamao_is_pwa_installed')) {
      localStorage.setItem('tanamao_is_pwa_installed', 'false');
    }
    if (!localStorage.getItem('tanamao_indicacao_codigo')) {
      localStorage.setItem('tanamao_indicacao_codigo', 'DEMO2024');
    }
    if (!localStorage.getItem('tanamao_indicacao_creditos')) {
      localStorage.setItem('tanamao_indicacao_creditos', '25.00');
    }
    if (!localStorage.getItem('tanamao_notifications_accepted')) {
      localStorage.setItem('tanamao_notifications_accepted', 'prompt'); // prompt, accepted, denied
    }

    // 3. Hydrate Favorites list
    const storedFavs = localStorage.getItem('tanamao_favs');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {}
    }

    // 4. Hydrate user session
    // Supabase auth is handled in the auth state change listener.

    // Hydrate notifications
    const storedNotifications = localStorage.getItem('tanamao_notifications');
    if (storedNotifications) {
      try {
        setNotifications(JSON.parse(storedNotifications));
      } catch (e) {}
    } else {
      const initialNotifications: AppNotification[] = [
        {
          id: 'notif-1',
          text: '👁 Seu perfil foi visitado 50 vezes hoje',
          timestamp: new Date(2026, 5, 2, 10, 30).toISOString(),
          read: false,
          type: 'visitas'
        },
        {
          id: 'notif-2',
          text: '⭐ Você recebeu uma nova avaliação 5★',
          timestamp: new Date(2026, 5, 2, 8, 15).toISOString(),
          read: false,
          type: 'avaliacao'
        },
        {
          id: 'notif-3',
          text: '💬 Nova mensagem de Maria Lima',
          timestamp: new Date(2026, 5, 1, 19, 45).toISOString(),
          read: true,
          type: 'mensagem'
        },
        {
          id: 'notif-4',
          text: '📅 Agendamento confirmado — Quinta 10h',
          timestamp: new Date(2026, 5, 1, 15, 0).toISOString(),
          read: true,
          type: 'agendamento'
        },
        {
          id: 'notif-5',
          text: '⚠️ Seu plano Destaque vence em 2 dias',
          timestamp: new Date(2026, 4, 30, 9, 0).toISOString(),
          read: true,
          type: 'plano'
        },
        {
          id: 'notif-6',
          text: '🎉 Você atingiu 1.000 visitas no perfil!',
          timestamp: new Date(2026, 4, 28, 12, 0).toISOString(),
          read: true,
          type: 'conquista'
        }
      ];
      setNotifications(initialNotifications);
      localStorage.setItem('tanamao_notifications', JSON.stringify(initialNotifications));
    }

    // 5. Hydrate chats and bookings
    const storedChats = localStorage.getItem('tanamao_chats');
    if (storedChats) {
      try {
        setChatSessions(JSON.parse(storedChats));
      } catch (e) {}
    }

    const storedBookings = localStorage.getItem('tanamao_bookings');
    if (storedBookings) {
      try {
        setBookings(JSON.parse(storedBookings));
      } catch (e) {}
    } else {
      const initialBookings: Booking[] = [
        {
          id: "booking-mock-1",
          clientId: "eliesermusicoccb@gmail.com",
          clientName: "Elieser Músico",
          proId: 6,
          proNome: "Ricardo Abreu",
          proCategoria: "Tecnologia",
          data: "2026-05-20",
          hora: "10:00",
          status: "Concluído",
          avaliado: true
        },
        {
          id: "booking-mock-2",
          clientId: "eliesermusicoccb@gmail.com",
          clientName: "Elieser Músico",
          proId: 1,
          proNome: "Carlos Eduardo",
          proCategoria: "Reformas",
          data: "2026-05-22",
          hora: "14:00",
          status: "Concluído",
          avaliado: false
        },
        {
          id: "booking-mock-3",
          clientId: "eliesermusicoccb@gmail.com",
          clientName: "Elieser Músico",
          proId: 4,
          proNome: "Sofia Nogueira",
          proCategoria: "Beleza",
          data: "2026-06-05",
          hora: "09:30",
          status: "Confirmado",
          avaliado: false
        }
      ];
      setBookings(initialBookings);
      localStorage.setItem('tanamao_bookings', JSON.stringify(initialBookings));
    }

    const storedClientReviews = localStorage.getItem('tanamao_client_reviews');
    if (storedClientReviews) {
      try {
        setClientReviews(JSON.parse(storedClientReviews));
      } catch (e) {}
    } else {
      const initialClientReviews: ClientReview[] = [
        {
          id: "review-mock-c1",
          bookingId: "booking-mock-1",
          clientId: "eliesermusicoccb@gmail.com",
          clientName: "Elieser Músico",
          proId: 6,
          proNome: "Ricardo Abreu Junior",
          estrelas: 5,
          comentario: "Cliente nota dez, explicou detalhadamente a demanda de rede no escritório e fez o PIX total do serviço imediato.",
          data: "2026-05-20"
        },
        {
          id: "review-mock-c2",
          bookingId: "booking-mock-2",
          clientId: "eliesermusicoccb@gmail.com",
          clientName: "Elieser Músico",
          proId: 1,
          proNome: "Carlos Eduardo Oliveira",
          estrelas: 5,
          comentario: "Excelente cliente. Ofereceu café fresquinho e acompanhou com muita educação a instalação do revestimento do banheiro.",
          data: "2026-05-22"
        }
      ];
      setClientReviews(initialClientReviews);
      localStorage.setItem('tanamao_client_reviews', JSON.stringify(initialClientReviews));
    }

    // Hash routing dynamic synchronization
    const handleHashChange = () => {
      const hash = window.location.hash;
      const stored = localStorage.getItem('tanamao_db');
      let list: Profissional[] = INITIAL_PROFESSIONALS;
      if (stored) {
        try {
          list = JSON.parse(stored);
        } catch (e) {}
      }

      if (hash.startsWith('#/perfil/')) {
        const slug = hash.replace('#/perfil/', '');
        const found = list.find(p => p.slug === slug || generateSlug(p.nome, p.categoria) === slug);
        if (found) {
          setSelectedProfileId(found.id);
          setViewPlanos(false);
          setViewPainel(false);
        } else {
          setSelectedProfileId(null);
          setViewPlanos(false);
          setViewPainel(false);
        }
      } else if (hash.startsWith('#perfil-')) {
        const id = parseInt(hash.replace('#perfil-', ''), 10);
        if (!isNaN(id)) {
          setSelectedProfileId(id);
          setViewPlanos(false);
          setViewPainel(false);
        }
      } else if (hash === '#planos' || hash === '#/planos') {
        setSelectedProfileId(null);
        setViewPlanos(true);
        setViewPainel(false);
      } else if (hash === '#/painel' || hash === '#painel') {
        setSelectedProfileId(null);
        setViewPlanos(false);
        setViewPainel(true);
      } else if (hash.startsWith('#/cadastro') || hash.startsWith('#cadastro')) {
        const refMatch = hash.match(/[?&]ref=([^&?]+)/);
        const ref = refMatch ? refMatch[1] : '';
        if (ref) {
          localStorage.setItem('tanamao_referral_code_applied', ref);
          addToast(`🎉 Convite de indicação aplicado: código "${ref}"!`);
        }
        setSelectedProfileId(null);
        setViewPlanos(false);
        setViewPainel(false);
        setLoginModalOpen(true);
      } else if (hash === '' || hash === '#home' || hash === '#catalog' || hash === '#/') {
        setSelectedProfileId(null);
        setViewPlanos(false);
        setViewPainel(false);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run immediately on startup

    // PWA listen beforeinstallprompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      const hideUntil = localStorage.getItem('tanamao_pwa_banner_hidden_until');
      if (!hideUntil || Date.now() > parseInt(hideUntil, 10)) {
        setShowPwaBanner(true);
      }
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    // Fallback: show banner for simulation if not installed and not suppressed
    const isInstalledStr = localStorage.getItem('tanamao_is_pwa_installed');
    const hideUntilVal = localStorage.getItem('tanamao_pwa_banner_hidden_until');
    const isMuffled = hideUntilVal && Date.now() < parseInt(hideUntilVal, 10);
    if (isInstalledStr !== 'true' && !isMuffled) {
      setTimeout(() => {
        setShowPwaBanner(true);
      }, 3000);
    }

    // Read stored notification state
    const storedNotifPerm = localStorage.getItem('tanamao_notifications_accepted') as any;
    if (storedNotifPerm) {
      setNotificationsPermissionState(storedNotifPerm);
    }

    // Try service worker registration with Blob
    try {
      if ('serviceWorker' in navigator) {
        const swCode = `
          self.addEventListener('install', (e) => {
            self.skipWaiting();
          });
          self.addEventListener('activate', (e) => {
            e.waitUntil(self.clients.claim());
          });
          self.addEventListener('fetch', (e) => {
            // Offline fallback simulation
            e.respondWith(fetch(e.request).catch(() => new Response("Você está offline no TáNaMão. Cache First funcionando!")));
          });
        `;
        const blob = new Blob([swCode], { type: 'application/javascript' });
        const blobSWUrl = URL.createObjectURL(blob);
        navigator.serviceWorker.register(blobSWUrl).catch(() => {});
      }
    } catch (e) {}

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // Sync Database util
  const syncDB = (updatedList: Profissional[]) => {
    setProfessionals(updatedList);
    localStorage.setItem('tanamao_db', JSON.stringify(updatedList));
  };

  // Sync Chat Sessions util
  const syncChats = (updatedChats: ChatSession[]) => {
    setChatSessions(updatedChats);
    localStorage.setItem('tanamao_chats', JSON.stringify(updatedChats));
  };

  // Sync Bookings util
  const syncBookings = (updatedBookings: Booking[]) => {
    setBookings(updatedBookings);
    localStorage.setItem('tanamao_bookings', JSON.stringify(updatedBookings));
  };

  // Sync Notifications util
  const syncNotifications = (updatedNotifs: AppNotification[]) => {
    setNotifications(updatedNotifs);
    localStorage.setItem('tanamao_notifications', JSON.stringify(updatedNotifs));
  };

  // --- PIX PAYMENT TIMER EFFECT ---
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (contractModalOpen && contractStep === 2 && paymentPixCountdown > 0) {
      timer = setInterval(() => {
        setPaymentPixCountdown(prev => prev - 1);
      }, 1000);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [contractModalOpen, contractStep, paymentPixCountdown]);

  // Sync Favorites util
  const toggleFavorite = (proId: number) => {
    let nextFavs;
    if (favorites.includes(proId)) {
      nextFavs = favorites.filter(id => id !== proId);
      addToast("Removido dos favoritos 💔");
    } else {
      nextFavs = [...favorites, proId];
      addToast("Adicionado aos favoritos! ❤️");
    }
    setFavorites(nextFavs);
    localStorage.setItem('tanamao_favs', JSON.stringify(nextFavs));
  };

  // Switch region selection
  const handleSelectRegion = (regionName: string) => {
    setActiveRegion(regionName);
    localStorage.setItem('tanamao_region', regionName);
    setRegionModalOpen(false);
  };

  // Auto slide Hero Banner effect
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % INITIAL_HERO_AD_SLIDES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  // Compute stats helper
  const getAverageRating = (p: Profissional) => {
    if (!p.avaliacoes || p.avaliacoes.length === 0) return 5.0; // Default note if no metrics yet
    const sum = p.avaliacoes.reduce((acc, currentObj) => acc + currentObj.estrelas, 0);
    return Number((sum / p.avaliacoes.length).toFixed(1));
  };

  // Sum of ratings length helper
  const getRatingCount = (p: Profissional) => {
    return p.avaliacoes ? p.avaliacoes.length : 0;
  };

  // Profile quality score dynamic calculation
  const getProQualityScore = (p: Profissional) => {
    let score = 0;
    if (p.bio && p.bio.length > 50) score += 20;
    else if (p.bio) score += 10;

    const avatarUrl = p.avatar || "";
    if (avatarUrl && !avatarUrl.includes('ui-avatars.com')) score += 15;
    
    if (p.galeria && p.galeria.length >= 3) score += 20;
    else if (p.galeria && p.galeria.length > 0) score += 10;

    if (p.verificado || p.verificadoCPF || p.verificadoCNPJ) score += 25;
    if (p.celular && p.celular.length > 8) score += 10;
    if (p.portfolio && p.portfolio.length > 0) score += 10;

    return Math.min(score, 100);
  };

  // Save selectedCategory in localStorage as history for recommendation
  useEffect(() => {
    if (selectedCategory) {
      localStorage.setItem('tanamao_last_category', selectedCategory);
    }
  }, [selectedCategory]);

  // Increment profile views & pre-fill image viewer
  useEffect(() => {
    if (selectedProfileId !== null) {
      const p = professionals.find(item => item.id === selectedProfileId);
      if (p) {
        if (p.galeria && p.galeria.length > 0) {
          setActiveGalleryPhoto(p.galeria[0]);
        } else {
          setActiveGalleryPhoto(p.avatar);
        }
        
        // Counter increase local state & storage
        const updatedList = professionals.map(item => {
          if (item.id === selectedProfileId) {
            return { ...item, visitas: item.visitas + 1 };
          }
          return item;
        });
        syncDB(updatedList);
      }
    }
  }, [selectedProfileId]);

  // CATEGORY DECORATIVE ASSIGNATION (Lucide Dynamic Render)
  const renderCategoryIcon = (catName: string, cssClass: string = "w-6 h-6") => {
    switch (catName) {
      case "Reformas":
        return <Hammer className={cssClass} />;
      case "Beleza":
        return <Scissors className={cssClass} />;
      case "Aulas":
        return <GraduationCap className={cssClass} />;
      case "Tecnologia":
        return <Laptop className={cssClass} />;
      case "Casa":
        return <HomeIcon className={cssClass} />;
      case "Consultoria":
        return <MessageSquare className={cssClass} />;
      default:
        return <Briefcase className={cssClass} />;
    }
  };

  // --- FILTERED COMPUTATIONS ---

  // 1. Highlights (linha geral, horizontal scroll): visible globally in all regions
  const highlightedPros = useMemo(() => {
    return professionals.filter(p => p.destaque === 'linha');
  }, [professionals]);

  // 1.1 Destaque Solo (Destaque da Semana): premium city-exclusive (R$97/sem)
  const soloHighlightedPros = useMemo(() => {
    return professionals.filter(p => p.destaque === 'solo' && p.cidade === activeRegion);
  }, [professionals, activeRegion]);

  const regionAdvertisers = useMemo(() => {
    const cityName = activeRegion ? activeRegion.split(' - ')[0].trim() : "Bauru";
    
    // Filter mock advertisers
    const mockFiltered = MOCK_CLIENT_ADVERTISERS.filter(
      ad => ad.cidade.toLowerCase() === cityName.toLowerCase()
    );
    
    // Map any real professional with 'solo' highlight in activeRegion as advertiser
    const realFiltered = professionals
      .filter(p => p.destaque === 'solo' && p.cidade === activeRegion)
      .map(p => ({
        id: p.id,
        nome: p.nome,
        slogan: p.bio,
        cidade: p.cidade.split(' - ')[0],
        estado: p.cidade.split(' - ')[1] || "SP",
        foto: p.galeria && p.galeria.length > 0 ? p.galeria[0] : p.avatar,
        whatsapp: p.celular.replace(/\D/g, ''),
        plano: "destaque_solo",
        validade: "2025-12-31",
        isReal: true
      }));

    return [...mockFiltered, ...realFiltered];
  }, [activeRegion, professionals]);

  useEffect(() => {
    setCurrentAdIdx(0);
  }, [activeRegion]);

  useEffect(() => {
    if (regionAdvertisers.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentAdIdx(prev => (prev + 1) % regionAdvertisers.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [regionAdvertisers]);

  const [soloHighlightIdx, setSoloHighlightIdx] = useState<number>(0);

  useEffect(() => {
    setSoloHighlightIdx(0);
  }, [activeRegion]);

  useEffect(() => {
    if (soloHighlightedPros.length <= 1) return;
    const interval = setInterval(() => {
      setSoloHighlightIdx(prev => (prev + 1) % soloHighlightedPros.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [soloHighlightedPros]);

  // 1.5 computedSlides: customized text for region
  const computedSlides = useMemo(() => {
    const cityName = activeRegion ? activeRegion.split(' - ')[0] : "sua região";
    return INITIAL_HERO_AD_SLIDES.map(slide => {
      let title = slide.title;
      let subtitle = slide.subtitle;
      
      title = title.replace("locais", `locais em ${cityName}`)
                   .replace("Páginas Amarelas", `Páginas Amarelas em ${cityName}`)
                   .replace("na sua região", `em ${cityName}`);
      subtitle = subtitle.replace("pertinho de você", `pertinho de você em ${cityName}`);
      
      return { ...slide, title, subtitle };
    });
  }, [activeRegion]);

  // 1.6 computedOffers: filtered by matching active region professional
  const computedOffers = useMemo(() => {
    return INITIAL_OFFERS.filter(of => {
      const pro = professionals.find(p => p.id === of.profissionalId);
      return pro ? pro.cidade === activeRegion : false;
    });
  }, [professionals, activeRegion]);

  // Get active coordinate reference for the current user
  const currentUserLat = userLat !== null ? userLat : (CITY_CENTERS[activeRegion]?.lat ?? -22.3147);
  const currentUserLon = userLon !== null ? userLon : (CITY_CENTERS[activeRegion]?.lon ?? -49.0606);

  // Helper to calculate distance for a professional
  const getProDistance = (p: Profissional) => {
    const proCoords = getProCoords(p);
    return calculateHaversineDistance(currentUserLat, currentUserLon, proCoords.lat, proCoords.lon);
  };

  // Autocomplete suggestions based on searchTerm
  const autocompleteSuggestions = useMemo(() => {
    if (searchTerm.trim().length < 2) {
      return { pros: [], cats: [], cities: [], totalCount: 0 };
    }

    const term = searchTerm.toLowerCase();

    // 1. Professionals matching name, company, bio or category
    const matchedPros = professionals.filter(p => 
      p.nome.toLowerCase().includes(term) || 
      p.empresa.toLowerCase().includes(term) ||
      p.categoria.toLowerCase().includes(term)
    ).slice(0, 4);

    // 2. Categories matching name
    const matchedCats = CATEGORIES_LIST.filter(c => 
      c.name.toLowerCase().includes(term)
    ).slice(0, 3);

    // 3. Cities matching name
    const allCities = ["São Paulo - SP", "Campinas - SP", "Bauru - SP"];
    const matchedCities = allCities.filter(city => 
      city.toLowerCase().includes(term)
    );

    return {
      pros: matchedPros,
      cats: matchedCats,
      cities: matchedCities,
      totalCount: matchedPros.length + matchedCats.length + matchedCities.length
    };
  }, [professionals, searchTerm]);

  // Personalized Recommendation Memo (Algorithm)
  const recommendedPros = useMemo(() => {
    const currentHour = new Date().getHours();
    const isNight = currentHour >= 19 || currentHour < 6;
    const lastCategory = localStorage.getItem('tanamao_last_category') || selectedCategory || '';

    // Filter by same region
    const candidates = professionals.filter(p => p.cidade === activeRegion);
    if (candidates.length === 0) return [];

    const scored = candidates.map(p => {
      const avgRating = getAverageRating(p);
      const visits = p.visitas || 0;

      const ratingScore = avgRating * 20 * 0.4; // Weight 0.4 (Normalize: 5★ = 100 * 0.4 = 40 points)
      const visitsScore = Math.min(visits / 100, 10) * 3; // Weight 0.3 (up to 30 points)
      
      const categoryMatch = lastCategory && p.categoria.toLowerCase() === lastCategory.toLowerCase();
      const categoryScore = categoryMatch ? 30 : 0; // Weight 0.3 (up to 30 points)

      let score = ratingScore + visitsScore + categoryScore;

      // Prioritize 24h service during night (ex: noite -> priorizar 24h with bonus)
      if (isNight && p.atende24h) {
        score += 20;
      }

      // Small bonus if favorite list matches
      if (favorites.includes(p.id)) {
        score += 15;
      }

      // Pseudo-random seed offset to satisfy "reprocessa algoritmo com variação"
      const randomOffset = Math.sin(p.id * (recommendationSeed + 1.25)) * 8; // offset range [-8, 8]
      score += randomOffset;

      return { pro: p, score };
    });

    // Sort descending by score
    scored.sort((a, b) => b.score - a.score);

    // Return top 3 candidates for sleek recommendations display carousel
    return scored.map(s => s.pro).slice(0, 3);
  }, [professionals, activeRegion, selectedCategory, favorites, recommendationSeed]);

  // 2. Core Catalog: matching inputs, categories, rating filters, distance radius, and sorted
  const computedCatalog = useMemo(() => {
    const maxDistance = [5, 10, 25, 50, 99999][distanceStepIdx];
    
    let result = professionals.filter(p => {
      // Suspension filter (>= 4 Reports)
      const isSuspended = (p.denuncias?.length || 0) >= 4;
      if (isSuspended) return false;

      // Certified badge only filter
      if (filterOnlyCertified && !(p.isTanamaoCertificado || p.verificado || p.verificadoCPF || p.verificadoCNPJ)) {
        return false;
      }

      // Must match selected region
      const matchRegion = p.cidade === activeRegion;
      
      // Category filter match
      const matchCategory = !selectedCategory || p.categoria.toLowerCase() === selectedCategory.toLowerCase();

      // Search term text check
      const textMatch = !searchTerm.trim() || 
        p.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.empresa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.bio.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.categoria.toLowerCase().includes(searchTerm.toLowerCase());

      // Average rating validation
      const avg = getAverageRating(p);
      let matchRating = true;
      if (ratingFilter === '4.5+') {
        matchRating = avg >= 4.5;
      } else if (ratingFilter === '4.0+') {
        matchRating = avg >= 4.0;
      }

      // ONLY 24h filter
      const match24h = !only24h || p.atende24h;

      // Distance range match
      const proCoords = getProCoords(p);
      const dist = calculateHaversineDistance(currentUserLat, currentUserLon, proCoords.lat, proCoords.lon);
      const matchDistance = maxDistance >= 99999 || dist <= maxDistance;

      return matchRegion && matchCategory && textMatch && matchRating && match24h && matchDistance;
    });

    // Sort evaluation with Priority monetization tiers
    result.sort((a, b) => {
      const getRank = (p: any) => {
        // 1. Destaque Solo por Cidade
        if (p.destaque === 'solo' && p.cidade === activeRegion) {
          return 1;
        }
        // 2. Destaque por Categoria (top of filtered category)
        if (p.destaque === 'categoria' && selectedCategory && p.categoria.toLowerCase() === selectedCategory.toLowerCase()) {
          return 2;
        }
        // 3. Anúncio Patrocinado na Busca (visible during search query matching)
        if (p.destaque === 'patrocinado' && searchTerm.trim().length > 0) {
          return 3;
        }
        // 4. Destaque em Linha Geral
        if (p.destaque === 'linha') {
          return 4;
        }
        return 5;
      };

      const rankA = getRank(a);
      const rankB = getRank(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // Tie breaker using sortOrder
      if (sortOrder === "visitas") {
        return b.visitas - a.visitas;
      } else if (sortOrder === "nota") {
        return getAverageRating(b) - getAverageRating(a);
      } else if (sortOrder === "recentes") {
        return new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime();
      } else if (sortOrder === "alfabetica") {
        return a.nome.localeCompare(b.nome);
      }
      return b.visitas - a.visitas;
    });

    return result;
  }, [professionals, activeRegion, selectedCategory, searchTerm, ratingFilter, sortOrder, only24h, distanceStepIdx, userLat, userLon, filterOnlyCertified]);

  // Active selected profile
  const activeProfile = useMemo(() => {
    return professionals.find(p => p.id === selectedProfileId) || null;
  }, [professionals, selectedProfileId]);

  // --- CHAT & SCHEDULING ACTION HANDLERS ---

  // Contact Tracking & Lead Charge handler
  const handleContactCountAndCharge = (proId: number, type: 'whatsapp' | 'telefone' | 'chat') => {
    const proIndex = professionals.findIndex(p => p.id === proId);
    if (proIndex === -1) return;
    const pro = professionals[proIndex];
    
    // Only charge R$ 5,00 if the professional has an active 'lead' commissions plan
    if (pro.planoTipo === 'lead') {
      const currentBalance = pro.saldoLeads ?? 0;
      const chargeAmount = 5.00;
      const nextBalance = Math.max(0, Number((currentBalance - chargeAmount).toFixed(2)));
      
      const descMap = {
        whatsapp: 'Contato via WhatsApp',
        telefone: 'Contato via Ligação de Telefone',
        chat: 'Primeiro Contato via Chat de Conversa'
      };
      
      const newRecord = {
        data: new Date().toISOString().split('T')[0],
        tipo: descMap[type],
        valor: -chargeAmount
      };
      
      const updatedPro = {
        ...pro,
        saldoLeads: nextBalance,
        historicoLeads: [newRecord, ...(pro.historicoLeads || [])],
        leadsRecebidosSemana: (pro.leadsRecebidosSemana ?? 0) + 1
      };
      
      const nextList = professionals.map(p => p.id === proId ? updatedPro : p);
      syncDB(nextList);
      
      if (nextBalance < 5.00) {
        addToast(`⚠️ Saldo de leads de ${pro.nome} está baixo: R$ ${nextBalance.toFixed(2)}. Recarregue em breve.`);
      } else {
        addToast(`💼 Lead registrado! Saldo do profissional debitado em R$ 5,00.`);
      }
    }
  };
  
  // Start chat with a professional
  const handleStartChat = (proId: number) => {
    if (!userSession.logado) {
      addToast("Para iniciar uma conversa, por favor conecte sua conta ou registre-se! 🔑");
      setLoginModalOpen(true);
      return;
    }
    const existingSession = chatSessions.find(s => s.clientId === userSession.email && s.proId === proId);
    if (!existingSession) {
      // Deduct from pro's lead balance since it's a first chat creation
      handleContactCountAndCharge(proId, 'chat');

      const newSession: ChatSession = {
        clientId: userSession.email,
        proId: proId,
        messages: [],
        unlockedPhone: false
      };
      const updated = [...chatSessions, newSession];
      syncChats(updated);
    }
    setActiveChatProId(proId);
    setChatModalOpen(true);
  };

  // Send message in active chat
  const handleSendChatMessage = (text: string) => {
    if (!text.trim() || activeChatProId === null) return;
    const pro = professionals.find(p => p.id === activeChatProId);
    if (!pro) return;

    let updatedSessions = chatSessions.map(session => {
      if (session.clientId === userSession.email && session.proId === activeChatProId) {
        const newMessage: Message = {
          sender: 'client',
          text: text,
          timestamp: new Date().toISOString()
        };
        return {
          ...session,
          messages: [...session.messages, newMessage],
          unlockedPhone: true // Unlock contact access on first contact message
        };
      }
      return session;
    });

    syncChats(updatedSessions);
    setChatMessageText("");
    addToast("Mensagem enviada com sucesso! 💬");

    // Pro simulated replies: check if autoResponseActive is enabled and consult server AI
    setTimeout(async () => {
      const isAutoRespActive = localStorage.getItem('tanamao_auto_resp_active') !== 'false';
      const customAutoText = localStorage.getItem('tanamao_auto_resp_text') || 'Olá! Recebi sua mensagem e retorno em breve. 😊';
      const guarantee = localStorage.getItem('tanamao_response_guarantee') || '2h';

      let replyText = `🤖 [IA Assistente de ${pro.nome}]: Olá, ${userSession.nome}! Recebi sua mensagem: "${text}". Retornarei com seu orçamento em no máximo ${guarantee}. Se preferir, meus canais de contato e portfólio foram liberados em meu perfil!`;

      if (isAutoRespActive) {
        try {
          const response = await fetch('/api/auto-reply', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              msgText: text,
              proNome: pro.nome,
              proBio: pro.bio,
              clientNome: userSession.nome
            })
          });
          const data = await response.json();
          if (response.ok && data.reply) {
            replyText = `🤖 [Assistente IA de ${pro.nome}]: ` + data.reply;
          } else {
            replyText = `🤖 [Assistente IA de ${pro.nome}]: ` + customAutoText;
          }
        } catch (e) {
          replyText = `🤖 [Assistente IA de ${pro.nome}]: ` + customAutoText;
        }
      }

      const replyMsg: Message = {
        sender: 'pro',
        text: replyText,
        timestamp: new Date().toISOString()
      };

      // Since we are async, get fresh chatSessions from localStorage to prevent overwriting intermediate states
      let freshSessions: ChatSession[] = [];
      const stored = localStorage.getItem('tanamao_chats');
      if (stored) {
        try { freshSessions = JSON.parse(stored); } catch (e) {}
      } else {
        freshSessions = chatSessions;
      }

      const sessionsWithReply = freshSessions.map(sess => {
        if (sess.clientId === userSession.email && sess.proId === activeChatProId) {
          return {
            ...sess,
            messages: [...sess.messages, replyMsg],
            unlockedPhone: true
          };
        }
        return sess;
      });

      syncChats(sessionsWithReply);
      addToast(`Resposta automática de ${pro.nome} 💬`);
    }, 1500);
  };

  // Start booking schedule
  const handleStartBooking = (proId: number) => {
    if (!userSession.logado) {
      addToast("Para agendar um horário com o profissional, faça login ou registre-se primeiro! 📅");
      setLoginModalOpen(true);
      return;
    }
    setBookingProId(proId);
    setSelectedBookingDate("");
    setSelectedBookingTime("");
    setBookingModalOpen(true);
  };

  // Confirm booking
  const handleConfirmBooking = () => {
    if (!bookingProId || !selectedBookingDate || !selectedBookingTime) {
      addToast("Erro: Selecione uma data e hora válidas para agendar. ⚠️");
      return;
    }
    const pro = professionals.find(p => p.id === bookingProId);
    if (!pro) return;

    const newBooking: Booking = {
      id: Math.random().toString(36).substring(2, 9).toUpperCase(),
      clientId: userSession.email,
      clientName: userSession.nome,
      proId: pro.id,
      proNome: pro.nome,
      proCategoria: pro.categoria,
      data: selectedBookingDate,
      hora: selectedBookingTime,
      status: 'Confirmado'
    };

    const updatedBookings = [newBooking, ...bookings];
    syncBookings(updatedBookings);
    setBookingModalOpen(false);
    addToast(`📅 Agendamento com ${pro.nome} CONFIRMADO com sucesso!`);
  };

  // Change status of a booking (Pendente/Confirmado/Concluído)
  const handleUpdateBookingStatus = (bookingId: string, status: 'Confirmado' | 'Concluído' | 'Cancelado') => {
    const updated = bookings.map(b => b.id === bookingId ? { ...b, status } : b);
    syncBookings(updated);
    addToast(`Agendamento atualizado para status: ${status}! ✅`);
  };

  // Active review reference inside booking modal after completion
  const [activeReviewBooking, setActiveReviewBooking] = useState<Booking | null>(null);
  const [reviewModalOpen, setReviewModalOpen] = useState<boolean>(false);
  const [bookingReviewStars, setBookingReviewStars] = useState<number>(5);
  const [bookingReviewComment, setBookingReviewComment] = useState<string>("");

  const handleSubmitBookingReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeReviewBooking) return;
    if (!bookingReviewComment.trim()) {
      alert("Por favor, preencha o comentário para enviar a avaliação.");
      return;
    }

    const newRev = {
      autor: activeReviewBooking.clientName,
      estrelas: bookingReviewStars,
      comentario: bookingReviewComment.trim(),
      data: new Date().toISOString().split('T')[0]
    };

    const updatedPros = professionals.map(p => {
      if (p.id === activeReviewBooking.proId) {
        return {
          ...p,
          avaliacoes: [newRev, ...(p.avaliacoes || [])]
        };
      }
      return p;
    });

    syncDB(updatedPros);

    // Update booking to set avaliado to true so they can't review twice!
    const updatedBookings = bookings.map(b => b.id === activeReviewBooking.id ? { ...b, avaliado: true } : b);
    syncBookings(updatedBookings);

    addToast("Avaliação do serviço enviada com sucesso! ⭐");
    setReviewModalOpen(false);
    setActiveReviewBooking(null);
    setBookingReviewComment("");
    setBookingReviewStars(5);
  };

  // --- MONETIZATION CONTRACT FLOW METHODS ---
  const handleInitiateContract = (plan: any) => {
    if (!userSession.logado) {
      addToast("Prezado anunciante/cliente: É necessário entrar em uma conta ou registrar-se antes de contratar planos de destaque! 🔑");
      setLoginModalOpen(true);
      return;
    }

    // Role-based authorization warning
    if (plan.id === 'premium' && userSession.tipo === 'pro') {
      addToast("👑 O 'Plano Premium' é exclusivo para contas de Clientes. Conecte-se como Cliente!");
      return;
    }
    if (plan.id !== 'premium' && userSession.tipo === 'client') {
      addToast("🚀 Os planos de visibilidade são exclusivos para contas de Profissionais técnicos. Por favor, conecte-se como Profissional!");
      return;
    }

    setSelectedContractPlan(plan);
    setContractStep(1);
    setContractCity(activeRegion || "Bauru - SP");
    setContractCategory(selectedCategory || "Reformas");
    setCopiedPix(false);
    setReceiptFileSimulated(false);
    setContractModalOpen(true);
  };

  const handleConfirmContractStep1 = () => {
    if (!selectedContractPlan) return;
    
    // Check city-specific solo highlight availability
    if (selectedContractPlan.id === 'solo') {
      // Ensure only 1 pro per city is solo marked as business constraint
      const existingSolo = professionals.find(p => p.destaque === 'solo' && p.cidade === contractCity && p.id !== userSession.profissionalId);
      if (existingSolo) {
        addToast(`⚠️ O Destaque Solo nesta cidade já está ocupado por ${existingSolo.nome}. Favor selecionar outro município ou categoria.`);
        return;
      }
    }

    setContractStep(2);
    setPaymentPixCountdown(900); // 15 minutes countdown
  };

  const handleExecuteContractPurchase = (method: 'pix' | 'card') => {
    if (!selectedContractPlan) return;

    if (method === 'card') {
      if (!creditCardNumber.trim() || !creditCardName.trim()) {
        addToast("⚠️ Preencha os dados do cartão de crédito corretamente!");
        return;
      }
    } else {
      if (!receiptFileSimulated) {
        addToast("⚠️ Anexe o comprovante do PIX ou imagem para concluir a liberação!");
        return;
      }
    }

    // Update state based on purchased plan
    if (selectedContractPlan.id === 'premium') {
      const updatedSess = { ...userSession, isPremium: true };
      setUserSession(updatedSess);
      localStorage.setItem('tanamao_session_user', JSON.stringify(updatedSess));
      addToast("👑 Assinatura Premium de Cliente ativada com sucesso!");
    } else if (selectedContractPlan.id === 'galeria') {
      const proId = userSession.profissionalId;
      if (proId) {
        const nextList = professionals.map(p => {
          if (p.id === proId) {
            return { ...p, comGaleriaAmpliada: true };
          }
          return p;
        });
        syncDB(nextList);
        addToast("📸 Upgrade de Galeria Ampliada (até 15 fotos) ativado!");
      }
    } else if (selectedContractPlan.id.startsWith('lead-')) {
      const proId = userSession.profissionalId;
      if (proId) {
        const rechargeAmt = selectedContractPlan.id === 'lead-20' ? 20 : selectedContractPlan.id === 'lead-50' ? 50 : 100;
        const bonusAmt = selectedContractPlan.id === 'lead-20' ? 5 : selectedContractPlan.id === 'lead-50' ? 15 : 35;
        const totalCredited = rechargeAmt + bonusAmt;

        const nextList = professionals.map(p => {
          if (p.id === proId) {
            const curBal = p.saldoLeads ?? 0;
            const newRecord = {
              data: new Date().toISOString().split('T')[0],
              tipo: `Recarga de Créditos (${selectedContractPlan.nome})`,
              valor: totalCredited
            };
            return {
              ...p,
              planoTipo: 'lead',
              saldoLeads: Number((curBal + totalCredited).toFixed(2)),
              historicoLeads: [newRecord, ...(p.historicoLeads || [])]
            };
          }
          return p;
        });
        syncDB(nextList);
        addToast(`💡 Recarga efetuada! R$ ${totalCredited.toFixed(2)} adicionados ao seu saldo.`);
      }
    } else {
      // Standard highlight plans: solo, categoria, patrocinado, linha
      const proId = userSession.profissionalId;
      if (proId) {
        const pType = selectedContractPlan.id; // solo | categoria | patrocinado | linha
        const durationDays = activePlanPeriod === 'semanal' ? 7 : 30;
        const nextDate = new Date();
        nextDate.setDate(nextDate.getDate() + durationDays);

        const nextList = professionals.map(p => {
          if (p.id === proId) {
            return {
              ...p,
              destaque: pType,
              planoTipo: pType,
              planoPeriodo: activePlanPeriod,
              planoTermino: nextDate.toISOString().split('T')[0],
              destaqueCidade: pType === 'solo' ? contractCity : undefined,
              destaqueCategoriaNome: pType === 'categoria' ? contractCategory : undefined
            };
          }
          return p;
        });
        syncDB(nextList);
        addToast(`🚀 Plano ${selectedContractPlan.nome} impulsionado com sucesso!`);
      }
    }

    setContractModalOpen(false);
    setViewPlanos(false);
    window.location.hash = '#home';
  };

  // --- SUBMISSION ACTIONS ---

  // Mock authentication login form
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const emailStr = `${usernameInput.trim().toLowerCase().replace(/\s+/g, '')}@tanamao.com.br`;
    const session: UserSession = {
      nome: usernameInput.trim(),
      email: emailStr,
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(usernameInput.trim())}&background=1B2A6B&color=F5C800&bold=true`,
      logado: true,
      tipo: 'client'
    };

    setUserSession(session);
    localStorage.setItem('tanamao_session_user', JSON.stringify(session));
    setLoginFeedback(`Bem-vindo, ${session.nome}!`);
    setTimeout(() => {
      setLoginModalOpen(false);
      setLoginFeedback("");
      setUsernameInput("");
      
      // Request permission of browser geolocation
      triggerGeolocation();
    }, 1200);
  };

  const handleLogout = async () => {
    await logout();
  };

  // --- PWA HANDLERS ---
  const handlePwaInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      try {
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          localStorage.setItem('tanamao_is_pwa_installed', 'true');
          setShowPwaBanner(false);
          addToast("🎉 Aplicativo TáNaMão instalado com sucesso!");
        }
      } catch (e) {}
      setDeferredPrompt(null);
    } else {
      // Manual desktop/mock simulator fallback selection
      localStorage.setItem('tanamao_is_pwa_installed', 'true');
      setShowPwaBanner(false);
      addToast("🎉 PWA instalado na sua área de trabalho! (Simulado)");
    }
  };

  const handlePwaDismiss = () => {
    const hiddenUntil = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    localStorage.setItem('tanamao_pwa_banner_hidden_until', hiddenUntil.toString());
    setShowPwaBanner(false);
    addToast("Banner ocultado por 7 dias. ⏳");
  };

  // --- NOTIFICATION PERMISSION HANDLERS ---
  const triggerNotificationPermissionPrompt = () => {
    setShowNotificationPromptModal(true);
  };

  const handleNotificationPermissionResponse = (granted: boolean) => {
    const result = granted ? 'granted' : 'denied';
    setNotificationsPermissionState(result);
    localStorage.setItem('tanamao_notifications_accepted', result);
    setShowNotificationPromptModal(false);
    if (granted) {
      addToast("🔔 Notificações ativas! Você receberá alertas de mensagens e orçamentos.");
      // Trigger a direct test welcome push!
      setTimeout(() => {
        showSimulatedPushNotification("Bem-vindo ao TáNaMão!", "Você receberá uma notificação a cada novo contato ou agendamento.");
      }, 1500);
    } else {
      addToast("❌ Permissão negada. Você pode reativar nas configurações de seu perfil a qualquer momento.");
    }
  };

  const showSimulatedPushNotification = (title: string, body: string) => {
    const isGranted = localStorage.getItem('tanamao_notifications_accepted') === 'granted';
    if (!isGranted) return;

    // 1. Try real browser Notification API
    try {
      if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, { body, icon: 'https://ui-avatars.com/api/?name=TNM' });
      }
    } catch (e) {}

    // 2. Add to in-app notifications
    const newNotif: AppNotification = {
      id: `push-sim-${Date.now()}`,
      text: `🔔 ${title}: ${body}`,
      timestamp: new Date().toISOString(),
      read: false,
      type: 'mensagem'
    };
    const updatedNotifs = [newNotif, ...notifications];
    syncNotifications(updatedNotifs);
    addToast(`📢 NOTIFICAÇÃO: ${title} - ${body}`);
  };

  // Add temporary photo to self announcement list
  const handleAddPhotoUrl = () => {
    if (tempImageUrl.trim()) {
      setNewProImages(prev => [...prev, tempImageUrl.trim()]);
      setTempImageUrl("");
    }
  };

  const handleCreateAnnouncement = (e: FormEvent) => {
    e.preventDefault();
    if (!newProNome.trim() || !newProEmpresa.trim() || !newProCelular.trim() || !newProBio.trim()) {
      alert("Por favor, preencha os dados básicos obrigatórios (*) para divulgar.");
      return;
    }

    const nextId = professionals.length > 0 ? Math.max(...professionals.map(p => p.id)) + 1 : 1;
    
    // Fallback beautiful photos
    const proAvatars = [
      "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=200",
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=200",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200",
      "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=200"
    ];

    const finalAvatar = newProAvatar.trim() || proAvatars[nextId % proAvatars.length];
    const finalGallery = newProImages.length > 0 ? newProImages : [
      "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=600"
    ];

    const isDocValid = validateDocumento(newProDocumento);

    const newlyBuilt: Profissional = {
      id: nextId,
      nome: newProNome.trim(),
      empresa: newProEmpresa.trim(),
      categoria: newProCategoria,
      emoji: newProCategoria === "Reformas" ? "🔨" :
             newProCategoria === "Beleza" ? "💅" :
             newProCategoria === "Aulas" ? "📚" :
             newProCategoria === "Tecnologia" ? "💻" :
             newProCategoria === "Casa" ? "🏠" : "🤝",
      cidade: newProCidade,
      avatar: finalAvatar,
      bio: newProBio.trim(),
      telefone: newProTelefone.trim() || "(00) 0000-0000",
      celular: newProCelular.trim(),
      email: newProEmail.trim() || "contato@profissional.com.br",
      endereco: newProEndereco.trim() || "Atendimento presencial e domiciliar",
      destaque: 'none',
      atende24h: newPro24h,
      comGaleriaAmpliada: false,
      visitas: 1,
      dataCadastro: new Date().toISOString(),
      galeria: finalGallery,
      avaliacoes: [],
      verificado: isDocValid,
      documento: newProDocumento.trim() ? newProDocumento.trim() : undefined
    };

    const updatedCol = [newlyBuilt, ...professionals];
    syncDB(updatedCol);

    if (newProDocumento.trim() && !isDocValid) {
      addToast("Aviso: CPF ou CNPJ inválido! Cadastro publicado sem selo Verificado ⚠️");
    } else if (isDocValid) {
      addToast("Perfil verificado com sucesso pelo TáNaMão! Selo ATIVO ✅");
    }

    setAnnounceSuccess("Seu serviço foi publicado com sucesso no TáNaMão! Redirecionando...");
    addToast("Seu serviço está no ar! Anúncio criado com sucesso 🚀");

    setTimeout(() => {
      // Clear inputs
      setNewProNome("");
      setNewProEmpresa("");
      setNewProAvatar("");
      setNewProBio("");
      setNewProTelefone("");
      setNewProCelular("");
      setNewProEmail("");
      setNewProEndereco("");
      setNewProImages([]);
      setNewPro24h(false);
      setNewProDocumento("");
      setAnnounceSuccess("");
      setAnnounceModalOpen(false);

      // Instantly browse their new profile!
      setActiveRegion(newProCidade);
      updateProfileIdWithHash(newlyBuilt.id);
    }, 2000);
  };

  // Submit formal review
  const handlePostReview = (e: FormEvent, targetProId: number) => {
    e.preventDefault();
    if (!reviewAuthor.trim() || !reviewComment.trim()) {
      alert("Preencha o seu nome e seu comentário para avaliar.");
      return;
    }

    const newRev = {
      autor: reviewAuthor.trim(),
      estrelas: reviewStars,
      comentario: reviewComment.trim(),
      data: new Date().toISOString().split('T')[0]
    };

    const updated = professionals.map(p => {
      if (p.id === targetProId) {
        return {
          ...p,
          avaliacoes: [newRev, ...(p.avaliacoes || [])]
        };
      }
      return p;
    });

    syncDB(updated);
    addToast("Avaliação enviada com sucesso! Obrigado pelo feedback ⭐");
    setReviewAuthor("");
    setReviewComment("");
    setReviewStars(5);
  };

  // Submit monetization / profile boosting plan simulated flow
  const handleBoostSelectSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!boostProId) {
      addToast("Por favor, selecione um profissional para receber o impulsionamento!");
      return;
    }

    if (paymentMethod === 'pix') {
      if (!receiptFileSimulated) {
        addToast("Por favor, marque que o comprovante foi anexado!");
        return;
      }
      setPixFeedback("Processando e checando transação...");
      setTimeout(() => {
        const updated = professionals.map(p => {
          if (p.id === Number(boostProId)) {
            if (selectedPlanId === 'solo') {
              return { ...p, destaque: 'solo' as const };
            } else if (selectedPlanId === 'linha') {
              return { ...p, destaque: 'linha' as const };
            } else if (selectedPlanId === 'galeria') {
              return { ...p, comGaleriaAmpliada: true };
            }
          }
          return p;
        });
        syncDB(updated);
        addToast("Pagamento aprovado! Plano de destaque ativo com sucesso! 🚀");
        setPixFeedback("Confirmado com sucesso ✅");
        setTimeout(() => {
          setAnnounceModalOpen(false);
          setPixFeedback("");
          setReceiptFileSimulated(false);
          setCopiedPix(false);
          updateProfileIdWithHash(Number(boostProId));
        }, 1500);
      }, 2000);
    } else {
      // Cartão
      addToast("Autorizando pagamento...");
      setTimeout(() => {
        const updated = professionals.map(p => {
          if (p.id === Number(boostProId)) {
            if (selectedPlanId === 'solo') {
              return { ...p, destaque: 'solo' as const };
            } else if (selectedPlanId === 'linha') {
              return { ...p, destaque: 'linha' as const };
            } else if (selectedPlanId === 'galeria') {
              return { ...p, comGaleriaAmpliada: true };
            }
          }
          return p;
        });
        syncDB(updated);
        addToast("Transação de Cartão autorizada! Plano habilitado com sucesso.");
        setAnnounceModalOpen(false);
        updateProfileIdWithHash(Number(boostProId));
      }, 1500);
    }
  };

  return (
    <div className="pb-20 md:pb-0 min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-brand-blue selection:text-brand-yellow">
      
      {/* Splash Screen */}
      <AnimatePresence>
        {showSplash && (
          <motion.div
            id="splash-screen"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="fixed inset-0 z-50 bg-[#F5C800] flex flex-col items-center justify-center select-none"
          >
            <div className="flex flex-col items-center text-center px-6">
              <Logo size={120} mode="original" className="animate-pulse shadow-md rounded-2xl" />
              <h1 className="text-[#1A1A1A] font-black text-[28px] mt-4 font-display tracking-tight leading-none">
                TáNaMão
              </h1>
              <p className="text-[#1A1A1A] font-extrabold text-[14px] mt-1.5 opacity-90 leading-none">
                Conecte-se com os melhores
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. HEADER FIXO */}
      <header className="sticky top-0 z-40 bg-brand-blue text-white shadow-md border-b border-brand-blue-dark">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo with clean Yellow Pages handshake layout */}
          <div 
            onClick={() => { updateProfileIdWithHash(null); setSelectedCategory(""); setSearchTerm(""); }}
            className="flex items-center gap-3 cursor-pointer select-none group"
          >
            <Logo size={40} mode="header" className="transition-transform group-hover:scale-110 active:scale-95 duration-150" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-[#F5C800] font-display">
                  TáNaMão
                </span>
                <span className="hidden sm:inline bg-white/20 text-[10px] text-white px-2 py-0.5 rounded-full font-mono uppercase font-bold tracking-tight">
                  Oficial
                </span>
              </div>
              <p className="text-[10px] text-white/70 font-display font-medium tracking-wide uppercase leading-none mt-0.5">
                Páginas Amarelas Digitais
              </p>
            </div>
          </div>

          {/* Search bar centerpiece */}
          <div className="flex-1 max-w-lg relative group">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4 text-slate-500" />
            </div>
            <input 
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setAutocompleteOpen(true);
              }}
              onFocus={() => setAutocompleteOpen(true)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') {
                  setAutocompleteOpen(false);
                } else if (e.key === 'Enter') {
                  setAutocompleteOpen(false);
                }
              }}
              placeholder="Buscar serviços e profissionais..."
              className="w-full bg-white text-slate-800 pl-10 pr-10 py-2.5 rounded-full text-xs md:text-sm font-medium border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => {
                  setSearchTerm("");
                  setAutocompleteOpen(false);
                }}
                className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
            )}

            {/* AUTOCOMPLETE SUGGESTIONS DROPDOWN */}
            {autocompleteOpen && autocompleteSuggestions.totalCount > 0 && (
              <>
                <div 
                  className="fixed inset-0 z-10" 
                  onClick={() => setAutocompleteOpen(false)} 
                />
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 overflow-hidden text-slate-800 font-display">
                  
                  {/* Category matches */}
                  {autocompleteSuggestions.cats.length > 0 && (
                    <div className="p-3 border-b border-slate-100 bg-slate-50/50">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1.5 px-2">Categorias Relacionadas</p>
                      <div className="flex flex-wrap gap-1.5 px-2">
                        {autocompleteSuggestions.cats.map(cat => (
                          <button
                            key={cat.id}
                            onClick={() => {
                              setSelectedCategory(cat.name);
                              setSearchTerm("");
                              setAutocompleteOpen(false);
                              updateProfileIdWithHash(null); // Return to list view
                            }}
                            className="bg-brand-blue-dark/5 hover:bg-brand-blue-dark/10 text-brand-blue-dark rounded-full px-3 py-1 text-xs font-semibold flex items-center gap-1 transition-all cursor-pointer"
                          >
                            <span>{cat.emoji}</span>
                            <span>{cat.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Professional matches */}
                  {autocompleteSuggestions.pros.length > 0 && (
                    <div className="p-2">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1 px-2">Profissionais</p>
                      {autocompleteSuggestions.pros.map(pro => {
                        const hlTerm = (text: string) => {
                          const idx = text.toLowerCase().indexOf(searchTerm.toLowerCase());
                          if (idx === -1) return <span>{text}</span>;
                          const before = text.substring(0, idx);
                          const match = text.substring(idx, idx + searchTerm.length);
                          const after = text.substring(idx + searchTerm.length);
                          return (
                            <span>
                              {before}
                              <mark className="bg-brand-yellow/30 text-brand-blue-dark px-0.5 rounded font-bold underline">{match}</mark>
                              {after}
                            </span>
                          );
                        };

                        return (
                          <button
                            key={pro.id}
                            onClick={() => {
                              updateProfileIdWithHash(pro.id);
                              setSearchTerm("");
                              setAutocompleteOpen(false);
                            }}
                            className="w-full flex items-center justify-between text-left p-2 hover:bg-slate-50 rounded-xl transition-all cursor-pointer"
                          >
                            <div className="flex items-center gap-2.5">
                              <img src={pro.avatar} alt={pro.nome} className="w-8 h-8 rounded-full object-cover border border-slate-100" />
                              <div>
                                <h4 className="text-xs font-bold text-slate-800 leading-tight">
                                  {hlTerm(pro.nome)}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-medium">
                                  {hlTerm(pro.empresa)} • <span className="bg-brand-blue-dark/5 text-brand-blue-dark px-1.5 py-0.2 rounded text-[9px] font-bold">{pro.categoria}</span>
                                </p>
                              </div>
                            </div>
                            <span className="text-[10px] text-slate-400 font-display font-medium bg-slate-100 rounded px-1.5 py-0.5">{pro.cidade.split(' - ')[0]}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* City matches */}
                  {autocompleteSuggestions.cities.length > 0 && (
                    <div className="p-2 border-t border-slate-100 bg-slate-50/20">
                      <p className="text-[10px] font-bold text-slate-400 tracking-wider uppercase mb-1 px-2">Cidades Recomendadas</p>
                      {autocompleteSuggestions.cities.map(city => (
                        <button
                          key={city}
                          onClick={() => {
                            setActiveRegion(city);
                            localStorage.setItem('tanamao_region', city);
                            setSearchTerm("");
                            setAutocompleteOpen(false);
                            addToast(`Cidade alterada para ${city.split(' - ')[0]} 📍`);
                            updateProfileIdWithHash(null); // return to home/list
                          }}
                          className="w-full text-left p-2 hover:bg-slate-50 rounded-xl text-xs font-semibold text-slate-700 flex items-center gap-2 transition-all cursor-pointer"
                        >
                          <span className="text-brand-yellow">📍</span>
                          <span>{city}</span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </>
            )}

          </div>

          {/* User operations & location badge */}
          <div className="flex items-center gap-2 md:gap-4 shrink-0">
            
            {/* Active Region Display Button */}
            <button 
              onClick={() => setRegionModalOpen(true)}
              className="hidden md:flex items-center gap-1.5 bg-brand-blue-dark hover:bg-slate-900 border border-white/25 px-3.5 py-2 rounded-full text-xs font-bold font-display text-white transition-all active:scale-95"
            >
              <MapPin className="w-3.5 h-3.5 text-brand-yellow animate-bounce" />
              <span>{activeRegion ? activeRegion.split(' - ')[0] : "Onde você está?"}</span>
            </button>

            {/* Notification system with bell and count */}
            <div className="relative">
              <button 
                onClick={() => {
                  setNotificationDrawerOpen(!notificationDrawerOpen);
                }}
                className="relative p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition focus:outline-none"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold tracking-tight animate-pulse">
                    {notifications.filter(n => !n.read).length}
                  </span>
                )}
              </button>

              {/* Notification dropdown drawer */}
              {notificationDrawerOpen && (
                <div className="absolute right-0 mt-3.5 w-72 md:w-80 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-200 py-3.5 px-4 text-xs z-50 animate-fadein">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-bold text-slate-900 font-display">Central de Alertas 🔔</span>
                    {notifications.some(n => !n.read) && (
                      <button
                        onClick={() => {
                          const updated = notifications.map(n => ({ ...n, read: true }));
                          syncNotifications(updated);
                          addToast("Todas as notificações marcadas como lidas! ✓");
                        }}
                        className="text-[10px] text-brand-blue font-bold hover:underline"
                      >
                        Lidas ✓
                      </button>
                    )}
                  </div>
                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {notifications.length === 0 ? (
                      <p className="text-center text-slate-400 py-4">Nenhum alerta recente.</p>
                    ) : (
                      notifications.map((not) => {
                        const icon = not.type === 'visitas' ? '👁' :
                                      not.type === 'avaliacao' ? '⭐' :
                                      not.type === 'mensagem' ? '💬' :
                                      not.type === 'agendamento' ? '📅' :
                                      not.type === 'plano' ? '⚠️' : '🎉';
                        return (
                          <div 
                            key={not.id} 
                            onClick={() => {
                              // If user is pro, we can route directly to the tab!
                              if (userSession.logado && userSession.tipo === 'pro') {
                                window.location.hash = '#/painel';
                                if (not.type === 'mensagem') {
                                  setActivePainelTab('mensagem');
                                } else if (not.type === 'agendamento') {
                                  setActivePainelTab('agendamentos');
                                } else if (not.type === 'plano') {
                                  setActivePainelTab('planos');
                                } else {
                                  setActivePainelTab('dashboard');
                                }
                              }
                              // Mark this single notification as read
                              const updated = notifications.map(n => n.id === not.id ? { ...n, read: true } : n);
                              syncNotifications(updated);
                              setNotificationDrawerOpen(false);
                            }}
                            className={`p-2 rounded-xl transition-all border cursor-pointer text-left ${not.read ? 'bg-white border-transparent hover:bg-slate-50' : 'bg-blue-50/60 border-blue-100 hover:bg-blue-50/95 font-semibold'}`}
                          >
                            <div className="flex gap-2 items-start">
                              <span className="text-sm shrink-0">{icon}</span>
                              <div className="space-y-0.5">
                                <p className="leading-snug text-slate-705">{not.text}</p>
                                <span className="text-[9px] text-slate-400 font-mono">
                                  {new Date(not.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })} • {new Date(not.timestamp).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Heart Quick Counter */}
            <div className="relative hidden hover:scale-105 transition-transform scroll-smooth">
              <button 
                onClick={() => {
                  alert(`Você favoritou ${favorites.length} profissionais técnicos para consulta rápida!`);
                }}
                className="p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition focus:outline-none relative"
                title="Favoritos"
              >
                <Heart className={`w-4 h-4 ${favorites.length > 0 ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                {favorites.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold">
                    {favorites.length}
                  </span>
                )}
              </button>
            </div>

            {/* Profile handler */}
            {userSession.logado ? (
              <div className="flex items-center gap-3 animate-fadein">
                {userSession.tipo === 'pro' && (
                  <button
                    onClick={() => {
                      window.location.hash = '#/painel';
                    }}
                    className="flex items-center gap-1.5 bg-brand-yellow hover:bg-brand-accent text-brand-blue font-black text-[11px] uppercase px-3 py-1.5 rounded-xl transition shadow active:scale-95"
                  >
                    <span>📊 Meu Painel</span>
                  </button>
                )}
                <button
                  onClick={() => {
                    setActiveUserPanelTab("agendamentos");
                    setUserPanelOpen(true);
                  }}
                  className="flex items-center gap-2 hover:opacity-90 transition cursor-pointer"
                >
                  <img 
                    src={userSession.avatar} 
                    alt="Profile logo" 
                    className="w-8 h-8 rounded-full border-2 border-[#F5C800] object-cover shadow bg-white" 
                  />
                  <div className="hidden md:block text-left">
                    <p className="text-[9px] text-white/50 uppercase font-black tracking-wider leading-none">Minha Conta</p>
                    <p className="text-xs font-black text-[#F5C800] leading-tight mt-0.5 max-w-[100px] truncate">{userSession.nome}</p>
                  </div>
                </button>
                <button 
                  onClick={handleLogout}
                  className="text-[10px] bg-white/10 hover:bg-white/20 text-white/90 hover:text-white rounded-lg px-2 py-1 transition font-black uppercase border border-white/5"
                >
                  Sair
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setLoginModalOpen(true)}
                className="flex items-center gap-1 bg-brand-yellow hover:bg-brand-accent text-brand-blue px-3.5 py-1.5 rounded-full text-xs font-bold transition active:scale-95 shadow-sm"
              >
                <User className="w-3.5 h-3.5 font-bold" />
                <span>Entrar</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* PWA INSTALLATION INLINE TOP BANNER */}
      {showPwaBanner && (
        <div id="pwa-install-banner" className="bg-gradient-to-r from-indigo-700 via-indigo-800 to-brand-blue text-white py-3 px-4 shadow-md border-b border-indigo-900 transition-all z-35 animate-slideup">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs md:text-sm font-semibold">
            <div className="flex items-center gap-2.5 text-center sm:text-left">
              <span className="text-xl animate-bounce">📱</span>
              <p className="leading-snug">
                <strong>Instale o TáNaMão no seu celular como aplicativo</strong> — É grátis, rápido e funciona offline!
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePwaInstall}
                className="bg-brand-yellow hover:bg-brand-accent text-brand-blue text-xs font-black uppercase tracking-wide px-4 py-2 rounded-xl shadow-sm hover:scale-105 active:scale-95 transition-all text-center cursor-pointer"
              >
                Instalar agora
              </button>
              <button
                onClick={handlePwaDismiss}
                className="bg-white/10 hover:bg-white/20 text-white/90 text-xs font-bold px-3 py-2 rounded-xl transition-all cursor-pointer"
              >
                Agora não
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REGIONAL HEADER BAR */}
      <div className="bg-brand-yellow text-brand-blue py-2.5 px-4 shadow-sm border-b border-brand-yellow-dark">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-xs md:text-sm font-bold flex-wrap gap-3">
          <div className="flex items-center gap-2 cursor-pointer group select-none" onClick={() => setRegionModalOpen(true)}>
            <MapPin className="w-4 h-4 text-brand-blue shrink-0 animate-bounce" />
            <span className="group-hover:underline">📍 Mostrando resultados para: <strong className="text-brand-blue font-black font-mono">{activeRegion || "Nenhuma região"}</strong></span>
          </div>

          <div className="flex items-center gap-3 shrink-0 flex-wrap">
            {/* 24h Filter Toggle */}
            <button
              onClick={() => {
                setOnly24h(!only24h);
                addToast(!only24h ? "Filtro 24 horas ATIVADO! Moatradores 24h ativos." : "Filtro 24h desativado.");
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-extrabold tracking-wide transition-all active:scale-95 border shadow-sm cursor-pointer ${only24h ? 'bg-red-650 border-red-750 text-white animate-pulse' : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'}`}
            >
              <span>🕐 24h</span>
              <span>{only24h ? "Ativo" : "Atendimento 24h"}</span>
            </button>

            <button
              onClick={triggerGeolocation}
              disabled={geoLoading}
              className="flex items-center gap-1.5 bg-brand-blue hover:bg-slate-900 border border-white/20 text-brand-yellow px-3.5 py-1.5 rounded-full text-[11px] font-extrabold tracking-wide transition-all active:scale-95 disabled:opacity-50 shadow-sm cursor-pointer"
            >
              <MapPin className="w-3 h-3 animate-pulse text-brand-yellow" />
              <span>{geoLoading ? "Obtendo..." : "Usar minha localização"}</span>
            </button>

            <button 
              onClick={() => setRegionModalOpen(true)}
              className="underline underline-offset-2 hover:text-slate-900 transition-colors text-xs shrink-0 font-extrabold"
            >
              Mudar de Região 🌎
            </button>
          </div>
        </div>
      </div>

      {/* CORE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-10">

        {viewPainel ? (
          <ProfessionalPanel 
            userSession={userSession}
            professionals={professionals}
            syncDB={syncDB}
            bookings={bookings}
            syncBookings={syncBookings}
            chatSessions={chatSessions}
            syncChats={syncChats}
            notifications={notifications}
            syncNotifications={syncNotifications}
            addToast={addToast}
            activePainelTab={activePainelTab}
            setActivePainelTab={setActivePainelTab}
            setSelectedContractPlan={setSelectedContractPlan}
            setContractCity={setContractCity}
            setContractStep={setContractStep}
            setContractModalOpen={setContractModalOpen}
          />
        ) : selectedProfileId !== null && activeProfile ? (
          <section className="space-y-6 animate-slideup">
            
            {/* Back to Catalogue */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button 
                onClick={() => updateProfileIdWithHash(null)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold shadow transition-all hover:-translate-x-0.5 active:translate-y-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para o catálogo completo</span>
              </button>

              <div className="flex gap-2 justify-end">
                <button 
                  onClick={() => {
                    setStoriesModalOpen(true);
                    addToast("🎨 Card de Stories preparado! Você já pode compartilhar.");
                  }}
                  className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-full text-xs font-bold shadow transition-transform hover:-translate-y-0.5 active:scale-95"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Gerar Stories</span>
                </button>

                <button 
                  onClick={() => toggleFavorite(activeProfile.id)}
                  className={`inline-flex items-center justify-center gap-1 px-4 py-2 rounded-full text-xs font-bold shadow border transition ${favorites.includes(activeProfile.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                >
                  <Heart className={`w-4 h-4 ${favorites.includes(activeProfile.id) ? 'fill-red-500 text-red-500' : ''}`} />
                  <span>{favorites.includes(activeProfile.id) ? "Favoritado" : "Favoritar profissional"}</span>
                </button>
              </div>
            </div>

            {/* Profile Identity Hero */}
            <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 shadow-sm relative">
              
              {/* Cover Banner Cover */}
              <div className="h-44 md:h-60 bg-gradient-to-r from-brand-blue to-brand-blue-dark relative">
                <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#C5C5C5_1px,transparent_1px)] [background-size:16px_16px]"></div>
                <div className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 text-white text-[11px] font-mono px-3 py-1.5 rounded-lg">
                  📍 Atendimento Nacional Credenciado
                </div>
              </div>

              {/* Identity body */}
              <div className="p-6 md:p-8 pt-0 relative flex flex-col md:flex-row items-center md:items-end gap-5 -mt-16 md:-mt-20">
                <img 
                  src={activeProfile.avatar} 
                  alt={activeProfile.nome} 
                  className="w-28 h-28 md:w-36 md:h-36 rounded-full object-cover border-4 border-white shadow-md bg-white shrink-0"
                />

                <div className="text-center md:text-left flex-1 space-y-1.5 md:pb-3">
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-1.5">
                    <span className="bg-brand-yellow text-brand-blue font-bold text-xs uppercase px-2.5 py-0.5 rounded-full flex items-center gap-1">
                      <span>{activeProfile.emoji}</span>
                      <span>{activeProfile.categoria}</span>
                    </span>
                    <span className="bg-slate-100 text-slate-700 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      {activeProfile.cidade}
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-2.5">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 leading-tight">
                      {activeProfile.nome}
                    </h1>
                    {activeProfile.verificado && (
                      <span 
                        className="inline-flex items-center gap-1 bg-brand-blue text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm cursor-help"
                        title="Dados verificados pelo TáNaMão"
                      >
                        ✅ VERIFICADO
                      </span>
                    )}
                    {activeProfile.atende24h && (
                      <span className="inline-flex items-center gap-1 bg-red-650 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm animate-pulse">
                        🕐 ATENDE 24 HORAS
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-slate-500 font-semibold font-display">
                    💼 {activeProfile.empresa}
                  </p>

                  {/* Profile metrics */}
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-3.5 pt-3 text-xs font-bold text-slate-600">
                    <span className="flex items-center gap-1 text-brand-blue">
                      <Star className="w-4 h-4 fill-brand-yellow text-brand-yellow" />
                      <strong className="text-slate-900">{getAverageRating(activeProfile).toFixed(1)}</strong> 
                      <span>({getRatingCount(activeProfile)} avaliações)</span>
                    </span>

                    <span className="h-4 w-px bg-slate-300"></span>

                    <span className="flex items-center gap-1">
                      <Eye className="w-4 h-4 text-slate-400" />
                      <strong className="text-slate-900">{activeProfile.visitas}</strong> visitas de perfil
                    </span>

                    <span className="h-4 w-px bg-slate-300"></span>

                    <span className="text-slate-400 font-mono text-[11px] font-medium">
                      Publicado em {new Date(activeProfile.dataCadastro).toLocaleDateString()}
                    </span>
                  </div>

                </div>
              </div>

            </div>

            {/* Profile grid content layout */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              
              {/* Left central card context */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* 1. Bio descriptive detail */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <h3 className="text-lg font-bold text-slate-950 font-display flex items-center gap-2 border-b pb-3 border-slate-100">
                    <Briefcase className="w-5 h-5 text-brand-blue" />
                    Apresentação Profissional
                  </h3>
                  <p className="text-slate-600 text-sm md:text-base leading-relaxed whitespace-pre-line font-medium bg-slate-50 p-4 rounded-2xl">
                    {activeProfile.bio}
                  </p>
                </div>

                {/* 2. Portfolio Gallery */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-5">
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950 font-display flex items-center gap-2">
                      <ImageIcon className="w-5 h-5 text-brand-blue" />
                      Galeria de Projetos & Portfólio
                    </h3>
                    <span className="text-xs text-slate-400 font-bold font-mono">
                      {activeProfile.galeria ? activeProfile.galeria.length : 0} fotos cadastradas
                    </span>
                  </div>

                  {/* Active enlarged photo preview */}
                  {activeGalleryPhoto && (
                    <div className="relative rounded-2xl overflow-hidden border border-slate-300 bg-slate-100 h-64 sm:h-96 flex items-center justify-center">
                      <img 
                        src={activeGalleryPhoto} 
                        alt="Portfólio ampliado" 
                        className="max-w-full max-h-full object-contain"
                      />
                      <div className="absolute min-h-6 bottom-3 left-3 bg-brand-blue text-brand-yellow text-[11px] font-bold px-3 py-1.5 rounded-lg border border-brand-blue-dark shadow">
                        Amostra Real de Trabalho Concluído
                      </div>
                    </div>
                  )}

                  {/* Thumbnail selection list */}
                  {activeProfile.galeria && activeProfile.galeria.length > 0 && (
                    <div className="grid grid-cols-5 gap-3.5">
                      {(activeProfile.comGaleriaAmpliada ? activeProfile.galeria : activeProfile.galeria.slice(0, 5)).map((pic, idx) => (
                        <button 
                          key={idx}
                          onClick={() => setActiveGalleryPhoto(pic)}
                          className={`relative rounded-xl overflow-hidden h-14 md:h-20 border-2 transition focus:outline-none cursor-pointer ${activeGalleryPhoto === pic ? 'border-brand-blue scale-95 ring-4 ring-brand-yellow/30' : 'border-slate-200 opacity-80 hover:opacity-100'}`}
                        >
                          <img 
                            src={pic} 
                            alt={`Slide ${idx + 1}`} 
                            className="w-full h-full object-cover"
                          />
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Dynamic monetization upgrade button (R$9 check) */}
                  {!activeProfile.comGaleriaAmpliada && (
                    <div className="bg-gradient-to-r from-yellow-50 to-amber-50 border border-yellow-200 rounded-2xl p-4.5 flex flex-col md:flex-row items-center justify-between gap-3 text-center md:text-left mt-2">
                      <div>
                        <h4 className="text-xs md:text-sm font-extrabold text-slate-800 uppercase tracking-wider flex items-center justify-center md:justify-start gap-1">
                          📸 Plano Galeria Ampliada
                        </h4>
                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">
                          Seu plano atual exibe apenas 5 fotos do portfólio. Expanda e mostre até 15 fotos de alta definição dos seus melhores serviços realizados por apenas R$9 taxa única!
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setBoostProId(activeProfile.id);
                          setSelectedPlanId('galeria');
                          setMonetizationTab('boost');
                          setAnnounceModalOpen(true);
                          addToast("Redirecionando para Upgrades...");
                        }}
                        className="bg-brand-yellow hover:bg-[#E6A800] text-brand-blue font-black text-xs uppercase px-4 py-2.5 rounded-xl transition shadow active:scale-95 shrink-0 cursor-pointer"
                      >
                        ➕ Liberar 15 fotos — R$9
                      </button>
                    </div>
                  )}

                </div>

                {/* 3. Customer evaluations */}
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
                  
                  <div className="flex items-center justify-between border-b pb-3 border-slate-100">
                    <h3 className="text-lg font-bold text-slate-950 flex items-center gap-2">
                      <Star className="w-5 h-5 fill-brand-yellow text-brand-yellow" />
                      Avaliações sinceras dos Clientes
                    </h3>
                    <span className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-xs font-bold border border-amber-200">
                      Média {getAverageRating(activeProfile).toFixed(1)} / 5.0
                    </span>
                  </div>

                  {/* Comments loop feedback stack */}
                  <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
                    {activeProfile.avaliacoes && activeProfile.avaliacoes.length > 0 ? (
                      activeProfile.avaliacoes.map((av, index) => (
                        <div key={index} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 hover:bg-slate-100/50 transition">
                          <div className="flex items-start justify-between">
                            <div>
                              <h5 className="text-xs font-extrabold text-slate-900">{av.autor}</h5>
                              <p className="text-[10px] text-slate-400 font-semibold">{av.data}</p>
                            </div>

                            <div className="flex gap-0.5">
                              {[...Array(5)].map((_, stIdx) => (
                                <Star 
                                  key={stIdx} 
                                  className={`w-3.5 h-3.5 ${stIdx < av.estrelas ? 'fill-brand-yellow text-brand-yellow' : 'text-slate-300'}`} 
                                />
                              ))}
                            </div>
                          </div>
                          
                          <p className="text-xs text-slate-600 italic">
                            💬 "{av.comentario}"
                          </p>
                        </div>
                      ))
                    ) : (
                      <div className="text-center py-6 text-slate-400 text-xs font-medium">
                        Ainda não há opiniões enviadas para este profissional. Seja o primeiro a apoiar ou auditar o trabalho!
                      </div>
                    )}
                  </div>

                  {/* Submission form to write custom review on real-time */}
                  <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 space-y-4">
                    <div>
                      <h4 className="text-xs md:text-sm font-bold text-slate-900 uppercase tracking-wide">
                        ✍️ Avaliar e comentar sobre o profissional
                      </h4>
                      <p className="text-[11px] text-slate-400">Seu feedback ajuda a melhorar as contratações na comunidade do TáNaMão.</p>
                    </div>

                    <form 
                      onSubmit={(e) => handlePostReview(e, activeProfile.id)}
                      className="space-y-4"
                    >
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                            Meu Nome Completo:
                          </label>
                          <input 
                            type="text" 
                            required
                            value={reviewAuthor}
                            onChange={(e) => setReviewAuthor(e.target.value)}
                            placeholder="Ex: Amanda Lima"
                            className="bg-white text-slate-800 text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                            Avaliação em estrelas:
                          </label>
                          <div className="flex items-center gap-1.5 mt-1.5">
                            {[1, 2, 3, 4, 5].map((stValue) => (
                              <button
                                type="button"
                                key={stValue}
                                onClick={() => setReviewStars(stValue)}
                                className="focus:outline-none hover:scale-110 active:scale-95 transition"
                              >
                                <Star 
                                  className={`w-6 h-6 cursor-pointer ${stValue <= reviewStars ? 'fill-brand-yellow text-brand-yellow' : 'text-slate-300'}`} 
                                />
                              </button>
                            ))}
                            <span className="text-xs font-bold text-slate-500 ml-2 font-mono">
                              ({reviewStars} de 5)
                            </span>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">
                          Meu Comentário Sincero:
                        </label>
                        <textarea 
                          rows={3} 
                          required
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          placeholder="Fale brevemente sobre o serviço prestado, compromisso, honestidade, qualidade técnica..."
                          className="bg-white text-slate-800 text-xs w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-blue placeholder:text-slate-400"
                        />
                      </div>

                      <div className="flex justify-end">
                        <button 
                          type="submit"
                          className="bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] px-4 py-2 rounded-xl text-xs font-bold transition duration-150"
                        >
                          Publicar Avaliação
                        </button>
                      </div>

                    </form>
                  </div>

                </div>

              </div>

              {/* Sidebar direct contact tools details */}
              <div className="lg:col-span-4 space-y-6">
                
                {/* Main Instant Contact buttons */}
                <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
                  <div className="text-slate-950 font-display font-black text-xs md:text-sm uppercase tracking-wide border-b pb-2">
                    📱 Canais de Contato Direto
                  </div>

                  <div className="space-y-3 pt-2">
                    {/* ENVIAR MENSAGEM & AGENDAR ACTIONS */}
                    <div className="grid grid-cols-2 gap-2 pb-2">
                      <button
                        onClick={() => handleStartChat(activeProfile.id)}
                        className="flex items-center justify-center gap-1.5 p-3 bg-[#1B2A6B] hover:bg-[#0F173A] text-white hover:text-[#F5C800] rounded-2xl font-black text-xs uppercase shadow transition active:scale-95 cursor-pointer"
                      >
                        <MessageSquare className="w-4 h-4 text-[#F5C800] shrink-0" />
                        <span>Chat Interno</span>
                      </button>

                      <button
                        onClick={() => handleStartBooking(activeProfile.id)}
                        className="flex items-center justify-center gap-1.5 p-3 bg-[#F5C800] text-[#1B2A6B] hover:bg-yellow-400 rounded-2xl font-black text-xs uppercase shadow transition active:scale-95 cursor-pointer"
                      >
                        <Calendar className="w-4 h-4 shrink-0" />
                        <span>Agendar</span>
                      </button>
                    </div>

                    {/* Masked vs Unmasked Contacts */}
                    {!chatSessions.some(c => c.proId === activeProfile.id && c.clientId === userSession.email && c.messages.length > 0) ? (
                      // LOCKED CONTACTS STATE
                      <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                        <p className="text-[10px] uppercase font-bold text-slate-400 font-mono text-center">🔐 Contatos Privados</p>
                        
                        <div className="flex flex-col items-center gap-1 text-xs font-semibold text-slate-500 text-center">
                          <span>Telefone e WhatsApp ocultados para visitantes</span>
                          <span className="text-[10px] text-slate-400 font-normal">Faça o primeiro contato via chat para liberar!</span>
                        </div>
                        
                        <button
                          onClick={() => handleStartChat(activeProfile.id)}
                          className="w-full py-2.5 bg-[#1B2A6B] hover:bg-[#0F173A] text-white hover:text-[#F5C800] rounded-xl text-xs font-black uppercase tracking-wide transition active:scale-95 cursor-pointer text-center flex items-center justify-center gap-1.5"
                        >
                          <span>💬 Começar Conversação</span>
                        </button>
                      </div>
                    ) : (
                      // UNLOCKED CONTACTS STATE
                      <>
                        {/* Primary Call button */}
                        {activeProfile.telefone && (
                          <a 
                            href={`tel:${activeProfile.telefone.replace(/\D/g, '')}`}
                            onClick={() => handleContactCountAndCharge(activeProfile.id, 'telefone')}
                            className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl group transition"
                          >
                            <div className="p-2.5 bg-[#1B2A6B] text-[#F5C800] rounded-xl group-hover:scale-105 transition-transform">
                              <Phone className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tight uppercase">Telefone Residencial/Comercial</p>
                              <p className="text-xs md:text-sm font-extrabold text-slate-800">{activeProfile.telefone}</p>
                            </div>
                          </a>
                        )}

                        {/* Highly requested WhatsApp direct trigger link */}
                        {activeProfile.celular && (
                          <a 
                            href={`https://api.whatsapp.com/send?phone=55${activeProfile.celular.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá ${activeProfile.nome}, encontrei seu anúncio no diretório digital TáNaMão e gostaria de fazer orçamento!`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            onClick={() => handleContactCountAndCharge(activeProfile.id, 'whatsapp')}
                            className="flex items-center justify-center gap-2 w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold font-display text-xs uppercase shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
                          >
                            <PhoneCall className="w-4 h-4 fill-white text-white shrink-0" />
                            <span>Conversar no WhatsApp</span>
                          </a>
                        )}
                      </>
                    )}

                    {/* Email Mailto address */}
                    {activeProfile.email && (
                      <a 
                        href={`mailto:${activeProfile.email}`} 
                        className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl group transition"
                      >
                        <div className="p-2.5 bg-brand-blue text-brand-yellow rounded-xl group-hover:scale-105 transition-transform animate-fadein">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] font-bold text-slate-400 font-mono tracking-tight uppercase">Enviar Correio Eletrônico</p>
                          <p className="text-xs md:text-sm font-extrabold text-slate-800 truncate">{activeProfile.email}</p>
                        </div>
                      </a>
                    )}

                    {/* Core Address localization Display */}
                    <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-1.5 animate-fadein">
                      <div className="flex items-center gap-1.5 font-bold">
                        <MapPin className="w-4 h-4 text-brand-blue shrink-0 animate-bounce" />
                        <span>Sede de Atendimento</span>
                      </div>
                      <p className="font-semibold leading-relaxed">
                        {activeProfile.endereco}
                      </p>
                      <p className="text-[10px] font-bold font-mono uppercase bg-brand-blue text-brand-yellow px-2 py-0.5 rounded inline-block">
                        📍 {activeProfile.cidade}
                      </p>

                      {/* Interactive OpenStreetMap Embed */}
                      {(() => {
                        const getCityCoords = (fullCity: string) => {
                          const low = (fullCity || "").toLowerCase();
                          if (low.includes("bauru")) return { lat: -22.3147, lon: -49.0606 };
                          if (low.includes("campinas")) return { lat: -22.9064, lon: -47.0616 };
                          return { lat: -23.5505, lon: -46.6333 }; // fallback São Paulo
                        };
                        const coords = getCityCoords(activeProfile.cidade);
                        return (
                          <div className="rounded-xl overflow-hidden border border-amber-200 h-36 mt-2 shadow-inner">
                            <iframe 
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              title="Mapa de Localização OSM"
                              src={`https://www.openstreetmap.org/export/embed.html?bbox=${coords.lon - 0.01}%2C${coords.lat - 0.01}%2C${coords.lon + 0.01}%2C${coords.lat + 0.01}&layer=mapnik&marker=${coords.lat}%2C${coords.lon}`}
                            ></iframe>
                          </div>
                        );
                      })()}
                    </div>

                  </div>
                </div>

                {/* Disclaimer / Public Utility Note */}
                <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm text-xs text-slate-500 space-y-2.5">
                  <h4 className="font-extrabold text-slate-800 uppercase flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-emerald-600" />
                    Utilidade Pública
                  </h4>
                  <p className="leading-relaxed">
                    O <strong>TáNaMão</strong> é um ambiente exclusivamente de listagem e mapeamento inteligente.
                  </p>
                  <p className="leading-relaxed">
                    Não cobramos taxas de corretagem sobre orçamentos efetuados. Sempre solicite comprovações técnicas, orçamentos estruturados por escrito e negocie com segurança.
                  </p>
                </div>

              </div>

            </div>

          </section>
        ) : (
          /* OTHERWISE SCREEN: DECORATED DIRECTORY HOME PAGE CATALOG */
          <div className="space-y-10 animate-fadein">

            {/* 1. BANNER PROPAGANDA DO CLIENTE */}
            {regionAdvertisers.length > 0 ? (
              <section id="banner-cliente" className="space-y-2 select-none animate-fadein">
                <div className="relative h-[140px] md:h-[180px] bg-slate-900 rounded-2xl md:rounded-3xl overflow-hidden border border-brand-blue-dark/25 shadow-md flex items-center">
                  
                  {/* Carousel Loop */}
                  {regionAdvertisers.map((ad, idx) => {
                    const isActive = idx === currentAdIdx;
                    return (
                      <div
                        key={ad.id + '-' + idx}
                        className={`absolute inset-0 transition-opacity duration-700 ease-in-out flex flex-col justify-center px-6 md:px-10 py-4 ${
                          isActive ? 'opacity-100 z-10 pointer-events-auto' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                        style={{
                          backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(15, 23, 42, 0.6) 60%, rgba(15, 23, 42, 0.25) 100%), url(${ad.foto})`,
                          backgroundSize: 'cover',
                          backgroundPosition: 'center'
                        }}
                      >
                        {/* Inner details */}
                        <div className="max-w-2xl text-left space-y-1.5 md:space-y-2.5">
                          <div>
                            <span className="inline-flex items-center gap-1.5 bg-[#F5C800] text-brand-blue text-[9px] md:text-[10px] font-extrabold uppercase py-0.5 px-2.5 rounded-full shadow border border-white leading-none">
                              ⭐ Destaque da Semana — {ad.cidade}
                            </span>
                          </div>

                          <h2 className="text-lg md:text-2xl font-black tracking-tight leading-none text-white font-display uppercase truncate max-w-lg">
                            {ad.nome}
                          </h2>

                          <p className="text-[10px] md:text-xs text-slate-200 font-medium leading-relaxed font-display max-w-sm md:max-w-xl line-clamp-1 md:line-clamp-2">
                            {ad.slogan}
                          </p>

                          <div className="pt-1 select-none">
                            {ad.isReal ? (
                              <button
                                onClick={() => {
                                  updateProfileIdWithHash(ad.id);
                                  addToast(`Acessando perfil de ${ad.nome}...`);
                                }}
                                className="bg-[#F5C800] hover:bg-[#E6A800] text-brand-blue px-3.5 md:px-5 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wide transition shadow active:scale-95 cursor-pointer inline-flex items-center gap-1"
                              >
                                Ver perfil
                              </button>
                            ) : (
                              <a
                                href={`https://api.whatsapp.com/send?phone=55${ad.whatsapp}&text=${encodeURIComponent(
                                  `Olá ${ad.nome}, vi seu destaque especial no TáNaMão de ${ad.cidade} e gostaria de falar sobre um orçamento!`
                                )}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 md:px-5 py-2 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-wide transition shadow active:scale-95 inline-flex items-center gap-1.5"
                              >
                                <PhoneCall className="w-3.5 h-3.5 fill-white text-white" />
                                <span>Falar no WhatsApp</span>
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {/* Dots of navigation below inside back to bottom-margin overlay banner */}
                  {regionAdvertisers.length > 1 && (
                    <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-20 bg-black/40 p-1.5 rounded-full backdrop-blur-sm shadow border border-white/5">
                      {regionAdvertisers.map((_, dotIndex) => (
                        <button
                          key={dotIndex}
                          onClick={() => setCurrentAdIdx(dotIndex)}
                          className={`w-2 h-2 rounded-full focus:outline-none transition-all ${
                            dotIndex === currentAdIdx ? 'bg-[#F5C800] w-4.5' : 'bg-white/40 hover:bg-white'
                          }`}
                          title={`Slide ${dotIndex + 1}`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </section>
            ) : (
              <section id="banner-cliente" className="space-y-2 select-none animate-fadein">
                <div 
                  className="relative h-[140px] md:h-[180px] rounded-2xl md:rounded-3xl overflow-hidden border border-[#E6A800] shadow-md flex items-center px-6 md:px-10 py-4"
                  style={{
                    backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.95) 0%, rgba(27, 42, 107, 0.7) 100%), url(https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=1200)`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  }}
                >
                  <div className="max-w-2xl text-left space-y-2">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-yellow-400/20 text-[#F5C800] text-[9px] md:text-[10px] font-black uppercase py-1 px-3 rounded-md">
                        👑 ESPAÇO DISPONÍVEL
                      </span>
                    </div>

                    <h2 className="text-base md:text-xl font-black text-white font-display uppercase tracking-tight leading-none">
                      Seja o Destaque da Semana em {activeRegion ? activeRegion.split(' - ')[0] : "Sua Cidade"}!
                    </h2>

                    <p className="text-[10px] md:text-xs text-slate-200 font-medium font-display leading-tight max-w-sm md:max-w-lg">
                      Ocupe este banner exclusivo no topo do catálogo e atraia até 10x mais clientes locais por apenas R$97/semana.
                    </p>

                    <div className="pt-1">
                      <button
                        onClick={() => {
                          setSelectedPlanId('solo');
                          setMonetizationTab('boost');
                          setAnnounceModalOpen(true);
                          addToast("Direcionando para plano de Destaque Solo!");
                        }}
                        className="bg-[#F5C800] hover:bg-[#E6A800] text-brand-blue-dark font-extrabold text-[10px] md:text-xs uppercase tracking-wide px-4 py-2 rounded-xl transition shadow active:scale-95 cursor-pointer"
                      >
                        Anuncie aqui por R$97 →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            )}

            {/* 3. CATEGORIAS (Grid 3x2 exactly as specified: Reformas, Beleza, Aulas, Tecnologia, Casa, Aconselha) */}
            <section id="categorias" className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <Grid className="w-5 h-5 text-brand-blue" />
                  Navegar por Ramos e Categorias
                </h3>
                {selectedCategory && (
                  <button 
                    onClick={() => setSelectedCategory("")}
                    className="text-xs text-red-600 hover:underline flex items-center gap-1 font-bold"
                  >
                    💡 Limpar Filtro {`(${selectedCategory})`}
                  </button>
                )}
              </div>

              {/* Grid 3x2 on tablet/desktop, 2x3 on mobile */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {CATEGORIES_LIST.map((cat) => {
                  const isCurActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();
                  return (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(isCurActive ? "" : cat.name)}
                      className={`p-4 rounded-2xl border transition-all flex flex-col items-center justify-center text-center gap-2 select-none cursor-pointer group ${isCurActive ? 'bg-brand-blue text-white border-brand-blue shadow-md' : 'bg-white text-slate-700 border-slate-200 hover:border-brand-blue hover:shadow-sm'}`}
                    >
                      <div className={`p-3 rounded-full transition-transform ${isCurActive ? 'bg-brand-yellow text-brand-blue' : 'bg-slate-50 text-brand-blue group-hover:scale-105'}`}>
                        {renderCategoryIcon(cat.name, "w-6 h-6 stroke-[2.2]")}
                      </div>

                      <div className="space-y-0.5">
                        <span className="block text-xs font-black tracking-tight uppercase">
                          {cat.name}
                        </span>
                        <span className={`block text-[9px] ${isCurActive ? 'text-slate-200' : 'text-slate-400'} leading-none font-medium truncate max-w-[120px]`}>
                          {cat.description}
                        </span>
                      </div>

                    </button>
                  );
                })}
              </div>

            </section>

            {/* 3.1 BANNER TáNaMão — DIVULGAÇÃO INTERNA (reduzido) */}
            <section 
              id="banner-tanamao" 
              className="bg-[#1B2A6B] rounded-2xl text-white overflow-hidden shadow-md border border-brand-blue-dark flex items-center px-4 md:px-6 h-[75px] md:h-[90px] select-none"
            >
              <div className="w-full flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Logo size={40} mode="header" className="shrink-0" />
                  <p className="text-xs md:text-sm font-extrabold leading-snug truncate">
                    <span className="text-[#F5C800]">Anuncie aqui</span> e seja encontrado por milhares de clientes
                  </p>
                </div>
                <button 
                  onClick={() => setAnnounceModalOpen(true)}
                  className="bg-[#F5C800] hover:bg-[#E6A800] text-brand-blue font-extrabold text-[10px] md:text-xs uppercase tracking-wider px-3 md:px-4 py-2 rounded-xl transition hover:scale-105 active:scale-95 whitespace-nowrap cursor-pointer shadow-sm shrink-0"
                >
                  Quero anunciar →
                </button>
              </div>
            </section>

            {/* 4. OFERTAS DO DIA (scroll horizontal) */}
            <section className="space-y-4">
              
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-brand-blue animate-bounce" />
                  Ofertas Imperdíveis do Dia
                </h3>
                
                <button 
                  onClick={() => {
                    alert("As ofertas do dia são rotacionadas de 24h em 24h pelos próprios provedores credenciados.");
                  }}
                  className="text-xs text-brand-blue hover:underline font-extrabold"
                >
                  Ver termos ↗
                </button>
              </div>

              {/* Swiper list horizontal scroll container */}
              <div className="flex gap-4.5 overflow-x-auto pb-4 pt-1 snap-x scrollbar-thin scrollbar-thumb-brand-yellow select-none">
                {computedOffers.length > 0 ? (
                  computedOffers.map((of) => (
                    <div
                      key={of.id}
                      className="flex-shrink-0 w-72 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition snap-center relative group flex flex-col justify-between"
                    >
                      
                      {/* Discount Green badge top card overlay */}
                      <div className="absolute top-3 left-3 bg-[#10B981] text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-sm z-10 animate-pulse tracking-wide font-mono uppercase">
                        {of.desconto}
                      </div>

                      {/* Image space */}
                      <div className="h-32 w-full bg-slate-900 overflow-hidden relative">
                        <img 
                          src={of.imagem} 
                          alt={of.titulo} 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                        <div className="absolute bottom-2 left-3 text-white text-[11px] font-bold font-display">
                          Por {of.profissionalNome}
                        </div>
                      </div>

                      {/* Details content body */}
                      <div className="p-4 space-y-2 flex-grow flex flex-col justify-between">
                        <div className="space-y-1">
                          <h4 className="text-xs md:text-sm font-black text-slate-900 leading-tight">
                            {of.titulo}
                          </h4>
                          <p className="text-[11px] text-slate-500 leading-normal line-clamp-2">
                            {of.descricao}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] text-slate-400 line-through block font-medium">
                              R$ {of.precoOriginal.toFixed(2)}
                            </span>
                            <span className="text-sm font-extrabold text-[#1B2A6B] block">
                              R$ {of.precoPromocional.toFixed(2)}
                            </span>
                          </div>

                          <button 
                            onClick={() => {
                              updateProfileIdWithHash(of.profissionalId);
                            }}
                            className="bg-brand-blue hover:bg-brand-blue-dark text-white text-[10px] uppercase font-bold py-1.5 px-3 rounded-lg transition"
                          >
                            Garantir Vaga
                          </button>
                        </div>

                      </div>

                    </div>
                  ))
                ) : (
                  <div className="w-full bg-slate-100/50 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold py-8 border border-dashed border-slate-200">
                    Nenhuma oferta especial cadastrada para {activeRegion || "sua região"} no momento.
                  </div>
                )}
              </div>

            </section>

            {/* 5. PROFISSIONAIS EM DESTAQUE (scroll horizontal) */}
            <section className="space-y-4">
              
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
                  <Star className="w-5 h-5 fill-brand-yellow text-brand-yellow animate-spin-slow" />
                  Profissionais em Destaque Recomendados
                </h3>
                <span className="text-xs text-slate-400 font-bold">
                  Selo TOP credenciado ⭐
                </span>
              </div>

              {/* Highlights stack carousel */}
              {highlightedPros.length > 0 ? (
                <div className="flex gap-4 overflow-x-auto pb-4 snap-x select-none">
                  {highlightedPros.map((p) => (
                    <div 
                      key={p.id}
                      className="flex-shrink-0 w-64 bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition snap-center overflow-hidden flex flex-col"
                    >
                      {/* Image section containing heart favorite */}
                      <div className="relative h-36 bg-slate-100">
                        <img 
                          src={p.galeria && p.galeria.length > 0 ? p.galeria[0] : p.avatar} 
                          alt="Cover" 
                          className="w-full h-full object-cover"
                        />
                        <button 
                          onClick={() => toggleFavorite(p.id)}
                          className="absolute top-2.5 right-2.5 p-2 bg-white/80 hover:bg-white rounded-full transition shadow-sm"
                          title="Favoritar"
                        >
                          <Heart className={`w-4 h-4 ${favorites.includes(p.id) ? 'fill-red-500 text-red-500' : 'text-slate-400'}`} />
                        </button>

                        <div className="absolute bottom-2.5 left-2.5 bg-brand-blue/90 text-brand-yellow text-[10px] font-black uppercase px-2 py-0.5 rounded-full border border-brand-blue">
                          ⭐ TOP MÚLTIPLO
                        </div>

                        {/* Circular Avatar overlay */}
                        <div className="absolute -bottom-5 right-4">
                          <img 
                            src={p.avatar} 
                            alt={p.nome} 
                            className="w-10 h-10 rounded-full border-2 border-white object-cover shadow bg-white"
                          />
                        </div>
                      </div>

                      {/* Info details */}
                      <div className="p-4 pt-6 space-y-1.5 flex-1 flex flex-col justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-brand-blue uppercase bg-brand-yellow/10 px-2 py-0.5 rounded-md">
                            {p.emoji} {p.categoria}
                          </span>
                          
                          <h4 
                            onClick={() => updateProfileIdWithHash(p.id)}
                            className="text-xs md:text-sm font-extrabold text-slate-800 leading-snug cursor-pointer hover:text-brand-blue transition mt-1.5"
                          >
                            {p.nome}
                          </h4>
                          <p className="text-[10px] text-slate-400 italic font-medium">
                            {p.empresa}
                          </p>
                        </div>

                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-0.5 text-slate-800 font-bold text-[11px]">
                            <Star className="w-3.5 h-3.5 fill-brand-yellow text-brand-yellow" />
                            <span>{getAverageRating(p).toFixed(1)}</span>
                          </span>

                          <button 
                            onClick={() => updateProfileIdWithHash(p.id)}
                            className="text-xs text-[#1B2A6B] hover:text-[#0F173A] font-extrabold flex items-center"
                          >
                            <span>Ver Perfil</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        </div>

                      </div>

                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-slate-100/50 rounded-2xl p-6 text-center text-slate-400 text-xs font-semibold">
                  Nenhum profissional possui o selo Destaque ativo para {activeRegion} no dia de hoje.
                </div>
              )}

            </section>

            {/* Catalog Head Anchor */}
            <hr id="catalog-anchor" className="border-slate-200" />

            {/* 6. TODOS OS PROFISSIONAIS (grid with rich filter dropdown selectors) */}
            <section className="space-y-6">
              
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b pb-3 border-slate-250">
                <div>
                  <h3 className="text-sm md:text-base font-extrabold text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                    <Filter className="w-5 h-5 text-brand-blue" />
                    Catálogo de Profissionais Credenciados
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Mostrando <strong className="text-slate-800">{computedCatalog.length}</strong> prestadores em {activeRegion}
                  </p>
                </div>

                {/* FILTROS INTERATIVOS CONTROLLER */}
                <div className="flex flex-wrap items-center gap-2.5">
                  
                  {/* Category Pill selector quick access */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-250">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1.5">Ramo:</span>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="bg-white text-slate-700 text-xs font-bold border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                      <option value="">Todos</option>
                      {CATEGORIES_LIST.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  {/* Rating filter selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-250">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide px-1.5">Nota:</span>
                    <select
                      value={ratingFilter}
                      onChange={(e) => setRatingFilter(e.target.value)}
                      className="bg-white text-slate-700 text-xs font-bold border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                      <option value="all">Todas</option>
                      <option value="4.5+">Média 4.5+ ⭐</option>
                      <option value="4.0+">Média 4.0+ ⭐</option>
                    </select>
                  </div>

                  {/* Distance (KM Radius) filter slide */}
                  <div className="flex items-center gap-2 bg-slate-100 p-1.5 px-3 rounded-xl border border-slate-250 shrink-0 select-none">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide">Raio Máx:</span>
                    <input 
                      type="range"
                      min="0"
                      max="4"
                      step="1"
                      className="w-24 accent-brand-blue cursor-pointer h-1.5 rounded-lg bg-slate-200"
                      value={distanceStepIdx}
                      onChange={(e) => {
                        const nextStep = parseInt(e.target.value, 10);
                        setDistanceStepIdx(nextStep);
                        const labels = ["5km", "10km", "25km", "50km", "qualquer"];
                        addToast(`Raio de busca: ${labels[nextStep]} 🗺️`);
                      }}
                    />
                    <span className="text-xs font-black text-brand-blue-dark min-w-[40px] text-right">
                      {["5km", "10km", "25km", "50km", "∞ km"][distanceStepIdx]}
                    </span>
                  </div>

                  {/* Sorting / Price order selector */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-250">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide px-1.5">Filtrar:</span>
                    <select
                      value={sortOrder}
                      onChange={(e) => setSortOrder(e.target.value)}
                      className="bg-white text-slate-700 text-xs font-bold border border-slate-200 rounded-lg p-1.5 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                    >
                      <option value="visitas">Mais visitados 👁</option>
                      <option value="nota">Melhor avaliados ⭐</option>
                      <option value="recentes">Mais recentes 📈</option>
                      <option value="alfabetica">Ordem alfabética A-Z</option>
                    </select>
                  </div>

                  {/* Clear button if any active */}
                  {(selectedCategory || searchTerm || ratingFilter !== 'all' || distanceStepIdx !== 4) && (
                    <button 
                      onClick={() => {
                        setSelectedCategory("");
                        setSearchTerm("");
                        setRatingFilter("all");
                        setDistanceStepIdx(4);
                        setSortOrder("visitas");
                      }}
                      className="px-3.5 py-2 bg-slate-950 text-white rounded-xl text-xs font-bold hover:bg-slate-800 cursor-pointer"
                    >
                      Limpar Filtros
                    </button>
                  )}

                </div>
              </div>

              {/* Grid 2 cols on mobile, 4 cols on desktop */}
              {computedCatalog.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {computedCatalog.map((p) => {
                    const avgNote = getAverageRating(p);
                    return (
                      <div 
                        key={p.id}
                        className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition overflow-hidden flex flex-col justify-between group"
                      >
                        <div>
                          {/* Capa */}
                          <div className="h-24 bg-gradient-to-r from-slate-100 to-slate-200 relative">
                            <div className="absolute top-2 left-2 flex flex-col gap-1 z-10">
                              {p.destaque && (
                                <span className="bg-brand-yellow text-brand-blue-dark text-[9px] font-black px-2 py-0.5 rounded shadow">
                                  RECOMENDADO
                                </span>
                              )}
                              {p.atende24h && (
                                <span className="bg-red-600 text-white text-[9px] font-black px-2 py-0.5 rounded shadow animate-pulse">
                                  🕐 24h
                                </span>
                              )}
                            </div>
                            
                            {/* Favoritar */}
                            <button
                              onClick={() => toggleFavorite(p.id)}
                              className="absolute top-2 right-2 p-1.5 bg-white/85 hover:bg-white rounded-full transition z-10 shadow-sm shadow-black/10 text-slate-400 hover:text-red-500 cursor-pointer"
                            >
                              <Heart className={`w-3.5 h-3.5 ${favorites.includes(p.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            {/* Small city tag overlay */}
                            <span className="absolute bottom-2 left-2 bg-slate-900/40 text-white text-[9px] px-1.5 py-0.5 rounded backdrop-blur-sm">
                              📍 {p.cidade.split(' - ')[0]}
                            </span>
                          </div>

                          {/* Avatar Circle centered partially on border */}
                          <div className="px-3 -mt-6 flex items-end justify-between relative z-10">
                            <img 
                              src={p.avatar} 
                              alt={p.nome} 
                              className="w-12 h-12 rounded-full object-cover border-2 border-white shadow bg-white"
                            />
                            
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                              Disponível
                            </span>
                          </div>

                          {/* Content text */}
                          <div className="p-3.5 pt-2.5 space-y-1.5">
                            <div className="flex items-center gap-1.5 justify-between">
                              <span className="text-[9px] font-black uppercase text-slate-400">
                                {p.emoji} {p.categoria}
                              </span>

                              {/* Distance indicator */}
                              <span className="text-[9px] font-bold text-brand-blue-dark bg-brand-blue-dark/5 px-2 py-0.5 rounded-full">
                                📍 {getProDistance(p).toFixed(1)} km
                              </span>
                            </div>
                            
                            <div className="flex items-center gap-1 min-w-0">
                              <h4 
                                onClick={() => updateProfileIdWithHash(p.id)}
                                className="text-xs md:text-sm font-extrabold text-slate-800 leading-tight line-clamp-1 cursor-pointer hover:text-brand-blue hover:underline flex-1"
                              >
                                {p.nome}
                              </h4>
                              {p.verificado && (
                                <span 
                                  className="text-brand-blue text-xs cursor-help shrink-0" 
                                  title="Dados verificados pelo TáNaMão"
                                >
                                  ✅
                                </span>
                              )}
                            </div>
                            
                            <p className="text-[10px] text-slate-400 font-bold line-clamp-1">
                              {p.empresa}
                            </p>
                            
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-0.5 font-medium font-display">
                              {p.bio}
                            </p>
                          </div>
                        </div>

                        {/* Footer ratings and access profiles button */}
                        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs">
                          <span className="flex items-center gap-0.5 text-slate-700 font-extrabold text-[11px]">
                            <Star className="w-3.5 h-3.5 text-brand-yellow fill-brand-yellow" />
                            <span>{avgNote.toFixed(1)}</span>
                          </span>

                          <button 
                            onClick={() => updateProfileIdWithHash(p.id)}
                            className="bg-brand-blue uppercase hover:bg-brand-blue-dark text-white text-[9px] py-1 px-3.5 rounded-lg font-black transition"
                          >
                            Ver Perfil
                          </button>
                        </div>

                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
                  <div className="max-w-xs mx-auto space-y-2">
                    <p className="text-xl">🔍</p>
                    <h4 className="font-bold text-slate-800">Nenhum profissional encontrado</h4>
                    <p className="text-xs text-slate-400">Tente limpar os filtros de categoria ou ajustar sua pesquisa para obter resultados.</p>
                    <button 
                      onClick={() => {
                        setSelectedCategory("");
                        setSearchTerm("");
                        setRatingFilter("all");
                      }}
                      className="mt-2 text-xs bg-brand-blue text-white px-4 py-2 rounded-full font-bold shadow"
                    >
                      Resetar Pesquisa
                    </button>
                  </div>
                </div>
              )}

            </section>

          </div>
        )}

      </main>

      {/* FOOTER */}
      <footer className="bg-[#0F173A] text-slate-400 text-xs py-8 border-t border-slate-900 mt-12">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="space-y-2.5">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">TáNaMão Páginas Amarelas</h4>
            <p className="leading-relaxed text-slate-400">
              O maior diretório digital com o legítimo estilo clássico das páginas amarelas impressas. Buscando aproximar você das melhores consultorias e serviços autônomos locais.
            </p>
          </div>

          <div className="space-y-2.5 md:pl-6">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">Territórios Atendidos</h4>
            <ul className="space-y-1.5 font-medium">
              <li>• São Paulo - SP (Central Consolação, Paulista, Jardins)</li>
              <li>• Rio de Janeiro - RJ (Copacabana, Barra, Leblon)</li>
              <li>• Belo Horizonte - MG (Savassi, Sagrada Família, Centro)</li>
            </ul>
          </div>

          <div className="space-y-2.5">
            <h4 className="text-white font-extrabold uppercase text-xs tracking-wider">Suporte & Negócios</h4>
            <p className="leading-relaxed">
              Deseja credenciar um plano de destaque avançado ou auditar dados de perfil? Fale conosco!
            </p>
            <p className="text-white font-bold font-mono text-[11px]">
              ✉️ contato@tanamao-amarelas.org
            </p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto px-4 pt-6 mt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 mx-auto md:mx-0">
            <Logo size={32} mode="dark" className="opacity-80 text-slate-400" />
            <span className="text-sm font-extrabold text-[#E2E8F0] tracking-tight">TáNaMão</span>
          </div>
          <div className="mx-auto md:mx-0 font-medium">
            © 2025 TáNaMão — Todos os direitos reservados
          </div>
        </div>
      </footer>

      {/* MOBILE FIXED BOTTOM NAVIGATION BAR (< 768px) */}
      <nav id="mobile-bottom-menu" className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 z-40 flex justify-around items-center px-2 shadow-[0_-4px_12px_rgba(0,0,0,0.05)] pb-safe font-display">
        {/* Tab 1: Início */}
        <button
          onClick={() => {
            window.location.hash = '#home';
            setSelectedCategory("");
            setSearchTerm("");
            updateProfileIdWithHash(null);
          }}
          className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold tracking-tight ${
            (!viewPainel && selectedProfileId === null) ? 'text-brand-blue font-black' : 'text-slate-400'
          }`}
        >
          <HomeIcon className="w-5 h-5 mb-0.5" />
          <span>Início</span>
        </button>

        {/* Tab 2: Buscar */}
        <button
          onClick={() => {
            window.location.hash = '#home';
            const inputEl = document.querySelector('input[placeholder*="Buscar serviços"]') as HTMLInputElement;
            if (inputEl) {
              inputEl.focus();
            }
            addToast("Digite o que deseja buscar! 🔍");
          }}
          className="flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold tracking-tight text-slate-400"
        >
          <Search className="w-5 h-5 mb-0.5" />
          <span>Buscar</span>
        </button>

        {/* Tab 3: Agenda */}
        <button
          onClick={() => {
            if (!userSession.logado) {
              addToast("Faça login para gerenciar sua agenda! 📅");
              setLoginModalOpen(true);
            } else if (userSession.tipo === 'pro') {
              window.location.hash = '#/painel';
              setActivePainelTab('agendamentos');
            } else {
              setActiveUserPanelTab('agendamentos');
              setUserPanelOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold tracking-tight ${
            (viewPainel && activePainelTab === 'agendamentos') ? 'text-brand-blue font-black' : 'text-slate-400'
          }`}
        >
          <Calendar className="w-5 h-5 mb-0.5" />
          <span>Agenda</span>
        </button>

        {/* Tab 4: Mensagens */}
        <button
          onClick={() => {
            if (!userSession.logado) {
              addToast("Faça login para ler suas mensagens! 💬");
              setLoginModalOpen(true);
            } else if (userSession.tipo === 'pro') {
              window.location.hash = '#/painel';
              setActivePainelTab('mensagem');
            } else {
              setActiveUserPanelTab('mensagens');
              setUserPanelOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold tracking-tight ${
            (viewPainel && activePainelTab === 'mensagem') ? 'text-brand-blue font-black' : 'text-slate-400'
          }`}
        >
          <MessageSquare className="w-5 h-5 mb-0.5" />
          <span>Mensagens</span>
        </button>

        {/* Tab 5: Painel */}
        <button
          onClick={() => {
            if (!userSession.logado) {
              setLoginModalOpen(true);
            } else if (userSession.tipo === 'pro') {
              window.location.hash = '#/painel';
              setActivePainelTab('dashboard');
            } else {
              setUserPanelOpen(true);
            }
          }}
          className={`flex flex-col items-center justify-center flex-grow h-full py-1 text-[10px] font-extrabold tracking-tight ${
            (viewPainel) ? 'text-brand-blue font-black' : 'text-slate-400'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{userSession.logado ? (userSession.tipo === 'pro' ? 'Painel' : 'Meus Dados') : 'Entrar'}</span>
        </button>
      </nav>

      {/* --- FLOATING FIX BUTTON: ANUNCIE SEU SERVIÇO --- */}
      <button 
        onClick={() => setAnnounceModalOpen(true)}
        className="fixed bottom-24 md:bottom-6 right-6 z-35 bg-brand-yellow hover:bg-brand-accent text-brand-blue p-4 rounded-full shadow-lg border-2 border-brand-blue-dark flex items-center justify-center gap-2 font-black font-display text-xs md:text-sm uppercase tracking-wide transition-all hover:-translate-y-1 active:translate-y-0.5 cursor-pointer animate-bounce hover:animate-none"
        title="Divulgue seu serviço"
      >
        <PlusCircle className="w-5 h-5 shrink-0" />
        <span>Anuncie seu serviço</span>
      </button>

      {/* --- MODAL 1: REGION SELECT (Onboard or user selection) --- */}
      {regionModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-xl p-6 space-y-5 animate-slideup my-8">
            
            <div className="text-center space-y-2">
              <span className="text-3.5xl">🌎</span>
              <h3 className="text-lg font-black text-slate-900 leading-tight font-display">
                Mapeamento Smart & Região
              </h3>
              <p className="text-xs text-slate-400 font-medium">
                Conecte-se com especialistas credenciados e ofertas perto de você.
              </p>
            </div>

            {/* Warning when standard location request fails/gets denied */}
            {showLocationFallback && (
              <div className="bg-amber-50 text-amber-900 p-4 rounded-2xl border border-amber-200 text-xs font-semibold leading-relaxed flex items-start gap-2.5 animate-fadein">
                <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                <p>
                  Ative a localização para ver profissionais perto de você, ou selecione sua região manualmente abaixo.
                </p>
              </div>
            )}

            {/* Geolocation feedback & auto trigger */}
            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Geolocalização Automática</span>
                {geoLoading && (
                  <span className="inline-flex items-center gap-1.5 text-xs text-brand-blue font-bold">
                    <span className="w-2 h-2 rounded-full bg-brand-blue animate-ping" />
                    Buscando...
                  </span>
                )}
              </div>

              {geoFeedback && (
                <p className="text-xs font-bold text-brand-blue-dark bg-yellow-105/50 px-3 py-2 rounded-xl border border-yellow-200 animate-fadein leading-snug">
                  🤖 {geoFeedback}
                </p>
              )}

              <button
                type="button"
                onClick={triggerGeolocation}
                disabled={geoLoading}
                className="w-full py-2.5 bg-brand-blue hover:bg-slate-900 text-brand-yellow font-black text-xs uppercase tracking-wider rounded-xl transition shadow active:scale-[0.98] disabled:opacity-50 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <MapPin className="w-3.5 h-3.5 animate-pulse" />
                <span>Usar minha localização do navegador</span>
              </button>
            </div>

            {/* Capital shortcuts selection stack */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Capitais Clássicas:</span>
              <div className="grid grid-cols-3 gap-2">
                <button 
                  onClick={() => handleSelectRegion("São Paulo - SP")}
                  className="p-2.5 bg-slate-50 hover:bg-brand-yellow/15 border border-slate-200 hover:border-brand-yellow text-center rounded-xl transition text-xs font-bold text-slate-800"
                >
                  🏢 São Paulo
                </button>
                <button 
                  onClick={() => handleSelectRegion("Rio de Janeiro - RJ")}
                  className="p-2.5 bg-slate-50 hover:bg-brand-yellow/15 border border-slate-200 hover:border-brand-yellow text-center rounded-xl transition text-xs font-bold text-slate-800"
                >
                  🌊 Rio de Jan.
                </button>
                <button 
                  onClick={() => handleSelectRegion("Belo Horizonte - MG")}
                  className="p-2.5 bg-slate-50 hover:bg-brand-yellow/15 border border-slate-200 hover:border-brand-yellow text-center rounded-xl transition text-xs font-bold text-slate-800"
                >
                  ⛰️ BH - MG
                </button>
              </div>
            </div>

            {/* Manual Form Selectors */}
            <form onSubmit={handleManualRegionSubmit} className="space-y-3 pt-3 border-t border-slate-100">
              <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest pl-1">Ou defina outra região:</span>
              
              <div className="grid grid-cols-12 gap-2">
                {/* States Selection Dropdown */}
                <div className="col-span-4">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Estado (UF)</label>
                  <select
                    value={manualState}
                    onChange={(e) => setManualState(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  >
                    {BRAZILIAN_STATES.map(st => (
                      <option key={st.code} value={st.code}>{st.code} - {st.name}</option>
                    ))}
                  </select>
                </div>

                {/* City manual field input */}
                <div className="col-span-8">
                  <label className="block text-[9px] font-bold text-slate-400 uppercase mb-0.5">Cidade (Município)</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Campinas"
                    value={manualCity}
                    onChange={(e) => setManualCity(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:outline-none focus:ring-1 focus:ring-brand-blue placeholder:text-slate-450"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-xl transition shadow cursor-pointer"
              >
                Confirmar Escolha Manual 🚀
              </button>
            </form>

            {activeRegion && (
              <button 
                onClick={() => setRegionModalOpen(false)}
                className="w-full pt-1 text-center text-slate-400 hover:text-slate-600 text-xs font-bold font-mono uppercase tracking-wider"
              >
                Voltar ao Catálogo ({activeRegion})
              </button>
            )}

          </div>
        </div>
      )}

      {/* --- EXPANDED MODAL: PAYMENT CONTRACT FLOW FOR MONETIZATION --- */}
      {contractModalOpen && selectedContractPlan && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-md w-full rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-5 animate-slideup my-8 max-h-[95vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3 border-slate-100">
              <div className="space-y-0.5">
                <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">Contratando Destaque</span>
                <h3 className="text-sm md:text-base font-black text-slate-900 leading-tight">
                  {selectedContractPlan.nome}
                </h3>
              </div>
              <button 
                onClick={() => setContractModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Step 1: Configuration Selection (City or Category selection if needed) */}
            {contractStep === 1 ? (
              <div className="space-y-4">
                <div className="bg-[#1B2A6B]/5 p-4 rounded-2xl border border-[#1B2A6B]/10 space-y-1">
                  <p className="text-[10px] font-bold text-[#1B2A6B] font-mono uppercase">Resumo do Plano Selecionado</p>
                  <p className="text-xs font-semibold text-slate-700 leading-relaxed">{selectedContractPlan.desc}</p>
                  <div className="pt-2 flex items-baseline gap-1">
                    <span className="text-base font-black text-slate-950">
                      R$ {activePlanPeriod === 'semanal' ? selectedContractPlan.precoSemana : selectedContractPlan.precoMes}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">/{activePlanPeriod}</span>
                  </div>
                </div>

                {/* City selection (Only for Solo highlight or lead) */}
                {selectedContractPlan.id === 'solo' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">
                      Selecione a cidade do destaque solo exclusivo:
                    </label>
                    <select
                      value={contractCity}
                      onChange={(e) => setContractCity(e.target.value)}
                      className="bg-white text-slate-800 text-xs w-full p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none font-bold"
                    >
                      <option value="Bauru - SP">Bauru - SP</option>
                      <option value="Campinas - SP">Campinas - SP</option>
                      <option value="São Paulo - SP">São Paulo - SP</option>
                    </select>
                    <span className="text-[9px] text-amber-600 font-semibold leading-relaxed block italic">
                      * Atenção: Apenas um profissional do diretório pode ocupar a posição solo por cidade simultaneamente!
                    </span>
                  </div>
                )}

                {/* Category selection (Only for category highlight) */}
                {selectedContractPlan.id === 'categoria' && (
                  <div className="space-y-1">
                    <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">
                      Selecione a categoria do destaque:
                    </label>
                    <select
                      value={contractCategory}
                      onChange={(e) => setContractCategory(e.target.value)}
                      className="bg-white text-slate-800 text-xs w-full p-3 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none font-bold"
                    >
                      <option value="Reformas">Reformas</option>
                      <option value="Beleza">Beleza</option>
                      <option value="Consultoria">Consultoria</option>
                      <option value="Aulas">Aulas</option>
                      <option value="Tecnologia">Tecnologia</option>
                    </select>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleConfirmContractStep1}
                  className="w-full py-3 bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] rounded-2xl text-xs font-black uppercase tracking-wider shadow transition duration-150 cursor-pointer"
                >
                  Avançar para Pagamento
                </button>
              </div>
            ) : (
              /* Step 2: Payment options (PIX or Credit Card) */
              <div className="space-y-5">
                
                {/* Switcher tabs */}
                <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('pix'); }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${paymentMethod === 'pix' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    🔹 PIX Instantâneo
                  </button>
                  <button
                    type="button"
                    onClick={() => { setPaymentMethod('card'); }}
                    className={`flex-1 py-1.5 text-center text-[10px] font-black uppercase rounded-lg transition-all cursor-pointer ${paymentMethod === 'card' ? 'bg-[#1B2A6B] text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                  >
                    💳 Cartão Crédito
                  </button>
                </div>

                {/* Sub-view: PIX Pay */}
                {paymentMethod === 'pix' ? (
                  <div className="space-y-4 animate-fadein">
                    <p className="text-[11px] text-slate-500 leading-relaxed font-semibold">
                      Use o aplicativo do seu banco para ler o QR Code ou cole a chave PIX copia-e-cola gerada abaixo.
                    </p>

                    {/* QR Code Graphic Mock */}
                    <div className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                      <div className="w-28 h-28 bg-slate-100 border border-slate-200 flex items-center justify-center relative shadow-inner">
                        <span className="text-3xl">📱</span>
                        {/* Fake QR code borders */}
                        <div className="absolute top-1 left-1 w-3 h-3 border-t-2 border-l-2 border-slate-800"></div>
                        <div className="absolute top-1 right-1 w-3 h-3 border-t-2 border-r-2 border-slate-800"></div>
                        <div className="absolute bottom-1 left-1 w-3 h-3 border-b-2 border-l-2 border-slate-800"></div>
                        <div className="absolute bottom-1 right-1 w-3 h-3 border-b-2 border-r-2 border-slate-800"></div>
                        <span className="absolute bottom-1 text-[6px] font-black text-slate-400 font-mono tracking-widest text-center">PIX SEGURO</span>
                      </div>
                      
                      {/* Countdown timer */}
                      <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-mono font-black uppercase bg-indigo-50 border border-indigo-100 px-3 py-1 rounded-full">
                        <span>⌛ EXPIRA EM:</span>
                        <span>
                          {Math.floor(paymentPixCountdown / 60)}:
                          {String(paymentPixCountdown % 60).padStart(2, '0')}
                        </span>
                      </div>
                    </div>

                    {/* Copiador de String PIX */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">PIX Copia e Cola:</label>
                      <div className="flex gap-2">
                        <input
                          type="text"
                          readOnly
                          value="00020101021226870014br.gov.pix0125tanamao.pix.payment.prod023"
                          className="bg-slate-50 text-slate-500 text-[9px] font-mono p-2 rounded-xl border border-slate-200 flex-1 overflow-x-auto whitespace-nowrap focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setCopiedPix(true);
                            addToast("Chave PIX copiada com sucesso!");
                            setTimeout(() => setCopiedPix(false), 2000);
                          }}
                          className="px-3 bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] rounded-xl text-[10px] font-black uppercase transition shrink-0 cursor-pointer"
                        >
                          {copiedPix ? "Copiado!" : "Copiar"}
                        </button>
                      </div>
                    </div>

                    {/* File Uploader Sim */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-500 uppercase tracking-wide">
                        Anexe o comprovante ou imagem (Simulação):
                      </label>
                      <div className="p-4 border-2 border-dashed border-slate-250 hover:border-[#1B2A6B] rounded-2xl text-center transition bg-slate-50 relative cursor-pointer">
                        <input 
                          type="file" 
                          id="comprovante-sim"
                          onChange={() => {
                            setReceiptFileSimulated(true);
                            addToast("Comprovante anexado para a simulação com sucesso! 📄");
                          }}
                          className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                        />
                        {receiptFileSimulated ? (
                          <div className="space-y-1 text-emerald-600">
                            <span className="text-xl">📄</span>
                            <p className="text-[10px] font-black uppercase leading-none">Comprovante Carregada</p>
                            <p className="text-[8px] text-slate-400 font-medium">comprovante_pix_tanamao.png (Simulado)</p>
                          </div>
                        ) : (
                          <div className="space-y-1 text-slate-400">
                            <span className="text-xl">📤</span>
                            <p className="text-[10px] font-black uppercase leading-none">Arraste ou clique para selecionar</p>
                            <p className="text-[8px] font-medium leading-tight">Escolha qualquer arquivo de imagem para simular o recebimento</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteContractPurchase('pix')}
                      className="w-full py-3 bg-[#1B2A6B] hover:bg-[#0F173A] text-white font-black hover:text-[#F5C800] rounded-2xl text-xs uppercase tracking-wider shadow transition cursor-pointer"
                    >
                      Liberar Destaque Via PIX
                    </button>
                  </div>
                ) : (
                  /* Sub-view: Credit Card Pay */
                  <div className="space-y-4 animate-fadein">
                    
                    {/* Card form fields */}
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">NÚMERO DO CARTÃO DE CRÉDITO:</label>
                        <input
                          type="text"
                          required
                          value={creditCardNumber}
                          onChange={(e) => setCreditCardNumber(e.target.value)}
                          placeholder="4444 5555 6666 7777"
                          className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none font-bold"
                        />
                      </div>
                      <div>
                        <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">NOME COMPLETO DO TITULAR:</label>
                        <input
                          type="text"
                          required
                          value={creditCardName}
                          onChange={(e) => setCreditCardName(e.target.value)}
                          placeholder="TITULAR DO CARTÃO"
                          className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none font-bold"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5 font-sans">DATA EXPIRAÇÃO:</label>
                          <input
                            type="text"
                            required
                            value={creditCardExpiry}
                            onChange={(e) => setCreditCardExpiry(e.target.value)}
                            placeholder="MM/AA"
                            maxLength={5}
                            className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none font-bold font-mono"
                          />
                        </div>
                        <div>
                          <label className="block text-[9px] font-black text-slate-400 uppercase tracking-wide mb-0.5">CÓDIGO (CVV):</label>
                          <input
                            type="text"
                            required
                            value={creditCardCvv}
                            onChange={(e) => setCreditCardCvv(e.target.value)}
                            placeholder="123"
                            maxLength={3}
                            className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none font-bold font-mono"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="pt-1">
                       <p className="text-[9px] text-slate-400 font-semibold leading-tight">
                         * Assinatura simulada imediata via sandbox bônus TáNaMão.
                       </p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleExecuteContractPurchase('card')}
                      className="w-full py-3 bg-[#1B2A6B] hover:bg-[#0F173A] text-white font-black hover:text-[#F5C800] rounded-2xl text-xs uppercase tracking-wider shadow transition cursor-pointer"
                    >
                      Pagar e Ativar de Imediato
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

      {/* --- MODAL 2: LOGIN / REGISTER --- */}
      {loginModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white max-w-sm w-full rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-5 animate-slideup">
            
            <div className="flex items-center justify-between">
              <h3 className="text-sm md:text-base font-bold text-slate-900 uppercase">
                Acesso de Cliente / Anunciante
              </h3>
              <button onClick={() => setLoginModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Logo colorido centralizado 80x80px */}
            <div className="flex justify-center transition-transform hover:scale-105 duration-200">
              <Logo size={80} mode="original" className="shadow-lg rounded-2xl" />
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Seu nome ou apelido:
                </label>
                <input 
                  type="text" 
                  required
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  placeholder="EX: Marcos Aurélio"
                  className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:ring-1 focus:ring-brand-blue focus:outline-none placeholder:text-slate-400 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-1">
                  Senha provisória:
                </label>
                <input 
                  type="password" 
                  value="123456"
                  disabled
                  title="Apenas demonstração"
                  className="bg-slate-100 text-slate-400 text-xs w-full p-2.5 border border-slate-200 rounded-xl cursor-not-allowed font-mono"
                />
                <span className="text-[10px] text-slate-400 leading-relaxed block mt-1.5 italic">
                  * Este é um acesso piloto. Digite apenas o nome para salvar preferências locais do usuário.
                </span>
              </div>

              {loginFeedback && (
                <p className="text-xs text-brand-blue font-bold text-center bg-brand-yellow/10 py-1 rounded">
                  {loginFeedback}
                </p>
              )}

              <button 
                type="submit"
                className="w-full py-3 bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] rounded-xl text-xs font-bold transition duration-150"
              >
                Conectar Conta
              </button>
            </form>

            <hr className="border-slate-100" />
            
            <div className="space-y-2.5">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">🎯 SIMULAÇÃO DE CONTAS RÁPIDAS</p>
              
              <div className="space-y-1.5 max-h-[190px] overflow-y-auto pr-1">
                {[
                  {
                    nome: "Carlos Eduardo (Pro - Reformas)",
                    sub: "Destaque por Categoria",
                    tipo: "pro", proId: 1,
                    avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
                    isPremium: false,
                    email: "carlos.reformas@goldmail.com"
                  },
                  {
                    nome: "Dra. Clarice Mendes (Pro - Nutri)",
                    sub: "Destaque em Linha Geral",
                    tipo: "pro", proId: 2,
                    avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&facepad=2&w=256&h=256&q=80",
                    isPremium: false,
                    email: "contato@claricemendesnutri.com.br"
                  },
                  {
                    nome: "Fernando Silva (Pro - Pintor)",
                    sub: "Destaque Solo (Bauru/SP)",
                    tipo: "pro", proId: 3,
                    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=facepad&facepad=2&w=256&h=256&q=80",
                    isPremium: false,
                    email: "fernandopinturas@gmail.com"
                  },
                  {
                    nome: "Ricardo Abreu Jr (Pro - TI Leads)",
                    sub: "Comissão Leads (Pre-pago: R$ 35,00)",
                    tipo: "pro", proId: 6,
                    avatar: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=facepad&facepad=2&w=256&h=256&q=80",
                    isPremium: false,
                    email: "suporte@ricardotech.com.br"
                  },
                  {
                    nome: "Clara Mendes (Cliente Premium)",
                    sub: "Assinatura Premium de Consumidor",
                    tipo: "client",
                    avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=facepad&facepad=2&w=256&h=256&q=80",
                    isPremium: true,
                    email: "clara@premium.com"
                  }
                ].map((account, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={async () => {
    try {
      await login(account.email, 'password123'); // Password dummy
      addToast(`Conectado como ${account.nome.split(" (")[0]}!`);
      setLoginModalOpen(false);
    } catch (e) {
      addToast('Erro ao logar com conta de teste.');
    }
}}
                    className="flex items-center gap-3 w-full p-2 text-left bg-slate-50 hover:bg-slate-100 border border-slate-250 hover:border-[#1B2A6B] rounded-xl transition cursor-pointer"
                  >
                    <img src={account.avatar} alt={account.nome} className="w-8 h-8 rounded-full border border-slate-200 shrink-0" />
                    <div>
                      <p className="text-[10px] font-black text-slate-800 leading-none">{account.nome}</p>
                      <p className="text-[8px] font-bold text-slate-400 font-mono mt-0.5">{account.sub}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL FOR INSTAGRAM STORIES --- */}
      {storiesModalOpen && activeProfile && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-sm w-full rounded-2xl border border-slate-200 shadow-2xl p-6 space-y-4 animate-slideup my-6 select-none">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-xs md:text-sm font-black text-slate-900 uppercase tracking-tight flex items-center gap-1.5">
                  <span>📸 Gerador de Stories PWA</span>
                </h3>
                <p className="text-[10px] text-slate-400 font-semibold leading-tight">Gere materiais de divulgação para suas redes sociais.</p>
              </div>
              <button 
                onClick={() => setStoriesModalOpen(false)} 
                className="text-slate-400 hover:text-slate-600 bg-slate-100 p-1.5 rounded-full cursor-pointer transition shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Layout Options Selector */}
            <div className="flex items-center justify-between gap-2 border-b pb-2">
              <span className="text-[9px] font-black text-slate-500 uppercase font-mono">Layout:</span>
              <div className="flex gap-1 overflow-x-auto pb-0.5 max-w-[240px]">
                {[
                  { id: 'navy', label: 'Azul Escuro' },
                  { id: 'dark', label: 'Escuro' },
                  { id: 'gradient', label: 'Degradê' },
                  { id: 'yellow', label: 'Amarelo' }
                ].map(bg => (
                  <button
                    key={bg.id}
                    type="button"
                    onClick={() => setStoryBg(bg.id as any)}
                    className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border transition whitespace-nowrap cursor-pointer ${
                      storyBg === bg.id ? 'bg-brand-blue border-brand-blue text-[#F5C800]' : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {bg.label}
                  </button>
                ))}
              </div>
            </div>

            {/* 9:16 Canvas Simulation Area */}
            <div className="flex justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 border-dashed">
              <div 
                id="stories-instagram-canvas" 
                className={`w-[260px] h-[460px] rounded-xl relative shadow-lg overflow-hidden p-4 flex flex-col justify-between transition-all duration-300 ${
                  storyBg === 'navy' ? 'bg-[#1B2A6B] text-white' :
                  storyBg === 'dark' ? 'bg-slate-900 text-white' :
                  storyBg === 'gradient' ? 'bg-gradient-to-tr from-pink-600 via-purple-600 to-indigo-600 text-white' :
                  'bg-[#F5C800] text-slate-900'
                }`}
              >
                {/* 1. TOP HEADER OF STORIES INLINE LOGO */}
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-1.5">
                    {/* SVG logo exactly 60x60px */}
                    <Logo size={60} mode={storyBg === 'yellow' ? 'original' : 'header'} className="drop-shadow-md rounded-lg shrink-0" />
                    <div>
                      <span className={`text-[13px] font-black tracking-tighter block leading-none font-display ${storyBg === 'yellow' ? 'text-slate-900' : 'text-[#F5C800]'}`}>
                        TáNaMão
                      </span>
                      <span className={`text-[8px] font-mono tracking-widest block uppercase font-bold ${storyBg === 'yellow' ? 'text-slate-800' : 'text-white/70'}`}>
                        PRESTADORES
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase font-mono tracking-widest ${
                      storyBg === 'yellow' ? 'bg-slate-900 text-brand-yellow' : 'bg-brand-yellow text-brand-blue'
                    }`}>
                      OFICIAL
                    </span>
                  </div>
                </div>

                {/* 2. CENTER PROFILE CONTENT CARD BOX */}
                <div className="flex-1 flex flex-col items-center justify-center space-y-3 my-2 text-center">
                  
                  {/* Photo with beautiful ring indicator */}
                  <div className="relative inline-block">
                    <div className="absolute inset-0 bg-gradient-to-tr from-brand-yellow via-pink-500 to-rose-500 rounded-full blur-[4px] animate-pulse"></div>
                    <img 
                      src={activeProfile.avatar} 
                      alt={activeProfile.nome} 
                      className="relative w-20 h-20 rounded-full border-2 border-white object-cover shadow-md bg-white mx-auto shrink-0"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-brand-yellow text-brand-blue text-[9px] font-black p-1 rounded-full shadow border border-white leading-none">
                      {activeProfile.emoji}
                    </div>
                  </div>

                  {/* Profile info text alignment */}
                  <div className="space-y-0.5 max-w-[220px] mx-auto">
                    <p className={`text-[9px] font-black uppercase tracking-wider font-mono ${storyBg === 'yellow' ? 'text-slate-600' : 'text-[#F5C800]'}`}>
                      {activeProfile.categoria}
                    </p>
                    <h4 className="text-sm font-black tracking-tight leading-tight uppercase font-display max-w-[190px] mx-auto truncate">
                      {activeProfile.nome}
                    </h4>
                    {activeProfile.empresa && (
                      <p className="text-[10px] font-semibold opacity-90 leading-tight italic truncate max-w-[180px] mx-auto">
                        🏢 {activeProfile.empresa}
                      </p>
                    )}
                    
                    {/* Stars ratings layout */}
                    <div className="flex items-center justify-center gap-1">
                      <div className="flex text-amber-400">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current text-amber-400" />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono font-black">5.0 / 5.0</span>
                    </div>
                  </div>

                  {/* Aesthetic yellow highlighted slogan of pages */}
                  <div className={`p-2 rounded-xl border leading-tight ${
                    storyBg === 'yellow' ? 'border-slate-400 bg-slate-900/5 text-slate-800 font-semibold' : 'border-white/10 bg-white/5 text-slate-100'
                  } w-full text-center max-w-[210px]`}>
                    <p className="text-[9.5px] leading-snug font-medium italic">
                      "Destaque certificado de excelência técnica local. Faça contato rápido pelo WhatsApp!"
                    </p>
                  </div>
                </div>

                {/* 3. STORIES FOOTER CONTACT DETAILS */}
                <div className="space-y-1.5 pt-1.5 border-t border-dashed border-white/20">
                  <div className="flex items-center justify-between text-[8px] font-mono tracking-wider opacity-90 font-bold uppercase">
                    <span>📍 Local: {activeProfile.cidade}</span>
                    <span>📞 {activeProfile.telefone}</span>
                  </div>
                  
                  {/* Big Call to action element */}
                  <div className={`py-1.5 rounded-lg text-center font-black text-[10px] uppercase tracking-wider shadow-sm ${
                    storyBg === 'yellow' ? 'bg-slate-900 text-[#F5C800]' : 'bg-[#F5C800] text-brand-blue'
                  }`}>
                    🚀 AGENDE SEU SERVIÇO AGORA
                  </div>
                </div>
              </div>
            </div>

            {/* Simulated Action buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => {
                  addToast("📥 Card pronto! Salvando imagem na sua galeria...");
                  setTimeout(() => {
                    addToast(`💾 Sucesso! 'tanam_stories_${activeProfile.id}.png' baixada.`);
                  }, 1200);
                }}
                className="w-full py-2 bg-slate-900 text-white hover:bg-slate-800 rounded-xl text-[10px] font-bold font-display uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 hover:shadow-md transition-all active:translate-y-0.5"
              >
                <span>💾 Salvar</span>
              </button>
              
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(`${window.location.origin}/#/perfil/${activeProfile.id}`);
                  addToast("📋 Link especial copiado! Agora cole nas suas redes.");
                }}
                className="w-full py-2 bg-[#1B2A6B] text-white hover:bg-[#0F173A] rounded-xl text-[10px] font-bold font-display uppercase tracking-wide cursor-pointer flex items-center justify-center gap-1 hover:shadow-md transition-all active:translate-y-0.5"
              >
                <span>📋 Link</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- MODAL 3: ANNOUNCEMENT (CREATE NEW SERVICE) --- */}
      {announceModalOpen && (
        <div className="fixed inset-0 z-55 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white max-w-2xl w-full rounded-2xl border border-slate-200 shadow-xl overflow-hidden p-6 space-y-5 animate-slideup my-8 max-h-[90vh] overflow-y-auto">
            
            <div className="flex items-center justify-between border-b pb-3 mb-2">
              <div>
                <h3 className="text-sm md:text-base font-bold text-slate-900 uppercase">
                  📋 Publicar Anúncio de Serviço
                </h3>
                <p className="text-[11px] text-slate-400">Atração de milhares de ligações e orçamentos na sua cidade natal.</p>
              </div>
              <button onClick={() => setAnnounceModalOpen(false)} className="text-slate-400 hover:text-slate-600 focus:outline-none">
                <X className="w-5 h-5 pointer-events-auto" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-4">
              
              {/* Box 1: Básico */}
              <div className="space-y-3.5">
                <span className="block text-xs font-black text-brand-blue uppercase border-l-2 border-brand-yellow pl-2">
                  Dados Técnicos do Profissional
                </span>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Completo do Pro: *</label>
                    <input 
                      type="text" 
                      required
                      value={newProNome} 
                      onChange={(e) => setNewProNome(e.target.value)} 
                      placeholder="Ex: Carlos Eduardo de Oliveira"
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Nome Técnico da Empresa: *</label>
                    <input 
                      type="text" 
                      required
                      value={newProEmpresa} 
                      onChange={(e) => setNewProEmpresa(e.target.value)} 
                      placeholder="Ex: Oliveira Instalações Gerais"
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Ramo de Categoria: *</label>
                    <select
                      value={newProCategoria}
                      onChange={(e) => setNewProCategoria(e.target.value)}
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none font-bold"
                    >
                      {CATEGORIES_LIST.map(c => (
                        <option key={c.name} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Cidade Metropolitana: *</label>
                    <select
                      value={newProCidade}
                      onChange={(e) => setNewProCidade(e.target.value)}
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none font-bold"
                    >
                      <option value="São Paulo - SP">São Paulo - SP</option>
                      <option value="Rio de Janeiro - RJ">Rio de Janeiro - RJ</option>
                      <option value="Belo Horizonte - MG">Belo Horizonte - MG</option>
                    </select>
                  </div>
                </div>

              </div>

              {/* Box 2: Endereço & Contatos */}
              <div className="space-y-3.5">
                <span className="block text-xs font-black text-brand-blue uppercase border-l-2 border-brand-yellow pl-2">
                  Localização & Canais de Ligação
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Celular / WhatsApp: *</label>
                    <input 
                      type="text" 
                      required
                      value={newProCelular} 
                      onChange={(e) => setNewProCelular(e.target.value)} 
                      placeholder="(11) 94821-3322"
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Fixo Comercial: (opcional)</label>
                    <input 
                      type="text" 
                      value={newProTelefone} 
                      onChange={(e) => setNewProTelefone(e.target.value)} 
                      placeholder="(11) 3649-1122"
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Correio Eletrônico / Email: (opcional)</label>
                    <input 
                      type="email" 
                      value={newProEmail} 
                      onChange={(e) => setNewProEmail(e.target.value)} 
                      placeholder="seu.email@provedor.com"
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Localização física do Estabelecimento: *</label>
                  <input 
                    type="text" 
                    required
                    value={newProEndereco} 
                    onChange={(e) => setNewProEndereco(e.target.value)} 
                    placeholder="Ex: Rua Augusta, 1020 - Consolação"
                    className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>
              </div>

              {/* Box 3: Biografia */}
              <div className="space-y-3.5">
                <span className="block text-xs font-black text-brand-blue uppercase border-l-2 border-brand-yellow pl-2">
                  Atração & Divulgação de Competências
                </span>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Biografia e Detalhamento Técnico do Serviço: *</label>
                  <textarea 
                    rows={4} 
                    required
                    value={newProBio} 
                    onChange={(e) => setNewProBio(e.target.value)} 
                    placeholder="Descreva detalhadamente seus serviços, qualificações técnicas, maquinário, garantias dadas de forma a destacar seu anúncio para as dezenas de clientes!"
                    className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                  />
                </div>

                {/* Imagens de Galeria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Foto Principal de Perfil (URL):</label>
                    <input 
                      type="text" 
                      value={newProAvatar} 
                      onChange={(e) => setNewProAvatar(e.target.value)} 
                      placeholder="https://images.unsplash.com/photo-..."
                      className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none placeholder:text-slate-300"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase mb-1">Anexar Amostra de Trabalho (URL):</label>
                    <div className="flex gap-2">
                      <input 
                        type="text" 
                        value={tempImageUrl} 
                        onChange={(e) => setTempImageUrl(e.target.value)} 
                        placeholder="Insira URL de foto concluída..."
                        className="bg-white text-slate-800 text-xs flex-1 p-2.5 border border-slate-300 rounded-xl focus:outline-none placeholder:text-slate-300"
                      />
                      <button 
                        type="button" 
                        onClick={handleAddPhotoUrl}
                        className="p-2.5 bg-brand-blue text-[#F5C800] text-xs font-bold rounded-xl"
                      >
                        Anexar
                      </button>
                    </div>
                  </div>
                </div>

                {/* List of images attached preview */}
                {newProImages.length > 0 && (
                  <div className="space-y-1.5 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                    <span className="block text-[10px] uppercase font-bold text-[#1B2A6B]">Imagens Prontas para Galeria de Projetos:</span>
                    <div className="flex flex-wrap gap-2">
                      {newProImages.map((p, inx) => (
                        <div key={inx} className="relative w-12 h-12 rounded border border-slate-300 overflow-hidden">
                          <img src={p} alt="Amostra" className="w-full h-full object-cover" />
                          <button 
                            type="button" 
                            onClick={() => setNewProImages(prev => prev.filter((_, i) => i !== inx))}
                            className="absolute inset-0 bg-red-600/75 flex items-center justify-center opacity-0 hover:opacity-100 text-white text-[10px] font-bold"
                          >
                            X
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>

              {announceSuccess && (
                <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-bold rounded-xl text-center border border-emerald-250 animate-pulse">
                  {announceSuccess}
                </div>
              )}

              {/* Actions footer */}
              <div className="flex items-center justify-end gap-3 border-t pt-4">
                <button 
                  type="button" 
                  onClick={() => setAnnounceModalOpen(false)}
                  className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-xs font-bold"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] px-6 py-2.5 rounded-xl text-xs font-bold transition shadow"
                >
                  Divulgar Meu Trabalho Now 🚀
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

      {/* 1. CHAT MODAL INTERNO */}
      {chatModalOpen && activeChatProId !== null && (() => {
        const pro = professionals.find(p => p.id === activeChatProId);
        if (!pro) return null;
        const session = chatSessions.find(s => s.clientId === userSession.email && s.proId === activeChatProId) || {
          messages: []
        };
        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col h-[500px] border border-slate-200 overflow-hidden animate-scaleup">
              
              {/* Header */}
              <div className="bg-[#1B2A6B] text-white p-4 flex items-center justify-between border-b border-[#0F173A]">
                <div className="flex items-center gap-3">
                  <img src={pro.avatar} alt={pro.nome} className="w-10 h-10 rounded-full object-cover border-2 border-[#F5C800] bg-white" />
                  <div>
                    <h4 className="text-sm font-black text-[#F5C800] truncate max-w-[180px]">{pro.nome}</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase">{pro.categoria}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setChatModalOpen(false)}
                  className="p-1 px-2.5 bg-white/15 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs transition cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Message List */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3.5 bg-slate-50">
                {session.messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
                    <span className="text-2xl">💬</span>
                    <h5 className="text-xs font-bold text-slate-700">Inicie sua conversa com o profissional</h5>
                    <p className="text-[10px] text-slate-400 max-w-[240px] leading-relaxed">
                      Envie uma mensagem de orçamento ou dúvida técnica abaixo. Na primeira resposta, os telefones de contato e link direto serão desbloqueados no perfil!
                    </p>
                  </div>
                ) : (
                  session.messages.map((m, idx) => {
                    const isClient = m.sender === 'client';
                    return (
                      <div key={idx} className={`flex ${isClient ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl p-3 text-xs shadow-sm leading-relaxed ${isClient ? 'bg-[#1B2A6B] text-white rounded-br-none' : 'bg-white text-slate-800 border rounded-bl-none border-slate-200'}`}>
                          <p className="font-medium whitespace-pre-wrap">{m.text}</p>
                          <span className={`block text-[8px] font-bold text-right mt-1.5 ${isClient ? 'text-white/60' : 'text-slate-400'}`}>
                            {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {/* Chat Send Form */}
              <div className="p-3 border-t border-slate-100 bg-white">
                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!chatMessageText.trim()) return;
                    handleSendChatMessage(chatMessageText);
                  }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={chatMessageText}
                    onChange={(e) => setChatMessageText(e.target.value)}
                    placeholder="Pergunte sobre preços, prazos ou materiais..."
                    className="flex-1 text-xs p-2.5 bg-slate-50 text-slate-800 border border-slate-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-blue"
                  />
                  <button
                    type="submit"
                    className="bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] px-4 rounded-xl text-xs font-black uppercase transition shrink-0 cursor-pointer"
                  >
                    Enviar
                  </button>
                </form>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 2. AGENDAMENTO ONLINE CALENDÁRIO */}
      {bookingModalOpen && bookingProId !== null && (() => {
        const pro = professionals.find(p => p.id === bookingProId);
        if (!pro) return null;

        // Generate next 10 days for scheduling from current local date (2026-06-02)
        const daysToShow: { dateString: string; label: string; weekday: string }[] = [];
        const baseDate = new Date(2026, 5, 2); // Jun 2, 2026
        const weekdays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
        for (let i = 0; i < 11; i++) {
          const d = new Date(baseDate);
          d.setDate(baseDate.getDate() + i);
          const dateString = d.toISOString().split('T')[0];
          const label = `${d.getDate()}/${d.getMonth() + 1}`;
          const weekday = weekdays[d.getDay()];
          daysToShow.push({ dateString, label, weekday });
        }

        const timesMock = ["08:00", "09:30", "11:00", "13:30", "15:00", "16:30", "18:00"];

        return (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh] border border-slate-200 overflow-hidden animate-scaleup">
              
              {/* Header */}
              <div className="bg-[#1B2A6B] text-white p-4 flex items-center justify-between border-b border-[#0F173A]">
                <div className="flex items-center gap-3">
                  <span className="text-xl">📅</span>
                  <div>
                    <h4 className="text-sm font-black text-[#F5C800]">Solicitar Agendamento</h4>
                    <p className="text-[10px] text-slate-300 font-bold uppercase">{pro.nome}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setBookingModalOpen(false)}
                  className="p-1 px-2.5 bg-white/15 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs transition cursor-pointer"
                >
                  X
                </button>
              </div>

              {/* Scrollable Body info */}
              <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-slate-50">
                
                {/* Visual date picker */}
                <div className="space-y-2">
                  <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                    1. Selecione a Data Disponível:
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2.5 shrink-0 scrollbar-thin">
                    {daysToShow.map(day => {
                      const isSelected = selectedBookingDate === day.dateString;
                      return (
                        <button
                          key={day.dateString}
                          type="button"
                          onClick={() => setSelectedBookingDate(day.dateString)}
                          className={`flex flex-col items-center p-2.5 rounded-xl border min-w-[64px] transition active:scale-95 cursor-pointer text-center ${isSelected ? 'bg-[#1B2A6B] border-[#1B2A6B] text-white shadow-md shadow-brand-blue/10' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                        >
                          <span className="text-[10px] font-black uppercase tracking-wider opacity-60">{day.weekday}</span>
                          <span className="text-sm font-extrabold mt-0.5">{day.label.split('/')[0]}</span>
                          <span className="text-[9px] font-bold opacity-80">{day.label.split('/')[1] === '6' ? 'Jun' : 'Jul'}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Hours picker */}
                {selectedBookingDate && (
                  <div className="space-y-2 animate-fadein">
                    <label className="block text-[11px] font-extrabold text-slate-500 uppercase tracking-wider">
                      2. Selecione o Horário Disponível:
                    </label>
                    <div className="grid grid-cols-4 gap-2">
                      {timesMock.map(time => {
                        const isSelected = selectedBookingTime === time;
                        return (
                          <button
                            key={time}
                            type="button"
                            onClick={() => setSelectedBookingTime(time)}
                            className={`p-2 rounded-xl text-center text-xs font-bold border transition active:scale-95 cursor-pointer ${isSelected ? 'bg-[#F5C800] border-[#F5C800] text-[#1B2A6B] font-black shadow' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'}`}
                          >
                            {time}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Final Confirmation fields list */}
                {selectedBookingDate && selectedBookingTime && (
                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-200 text-xs text-amber-900 space-y-2 animate-slideup">
                    <h5 className="font-black uppercase tracking-wide text-amber-950 flex items-center gap-1.5 border-b pb-1">
                      <span>✓</span>
                      <span>Resumo da Solicitação</span>
                    </h5>
                    <p className="font-semibold leading-relaxed">
                      Você está solicitando atendimento para a categoria <strong>{pro.categoria}</strong>.
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-xs pt-1">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-amber-700/80">Data:</span>
                        <strong className="text-amber-950">{new Date(selectedBookingDate + 'T00:00:00').toLocaleDateString('pt-BR', { dateStyle: 'long' })}</strong>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-amber-700/80">Horário:</span>
                        <strong className="text-amber-950">{selectedBookingTime} h</strong>
                      </div>
                    </div>
                  </div>
                )}

              </div>

              {/* Actions footer */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setBookingModalOpen(false)}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={!selectedBookingDate || !selectedBookingTime}
                  onClick={handleConfirmBooking}
                  className="bg-[#1B2A6B] hover:bg-[#0F173A] disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed text-[#F5C800] px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow cursor-pointer transition active:scale-95"
                >
                  Confirmar Agendamento 📅
                </button>
              </div>

            </div>
          </div>
        );
      })()}

      {/* 3. MODAL DE AVALIAÇÃO DE SERVIÇO CONCLUÍDO */}
      {reviewModalOpen && activeReviewBooking !== null && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-[100] p-4">
          <form 
            onSubmit={handleSubmitBookingReview}
            className="bg-white rounded-3xl w-full max-w-md shadow-2xl flex flex-col border border-slate-200 overflow-hidden animate-scaleup"
          >
            
            {/* Header */}
            <div className="bg-[#1B2A6B] text-white p-4 flex items-center justify-between border-b border-[#0F173A]">
              <div className="flex items-center gap-2">
                <span className="text-lg">⭐</span>
                <h4 className="text-sm font-black text-[#F5C800]">Avaliar Serviço Concluído</h4>
              </div>
              <button 
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="p-1 px-2.5 bg-white/15 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs"
              >
                X
              </button>
            </div>

            {/* Body */}
            <div className="p-5 bg-slate-50 space-y-4 text-xs">
              
              <div className="p-3 bg-white border border-slate-150 rounded-xl space-y-1">
                <p className="text-[10px] text-slate-400 font-bold uppercase">Prestador:</p>
                <strong className="text-slate-850 text-sm">{activeReviewBooking.proNome}</strong>
                <p className="text-slate-500 font-semibold">{activeReviewBooking.proCategoria}</p>
              </div>

              {/* Stars rating selection bar */}
              <div className="space-y-1.5 text-center py-2 bg-white rounded-xl border border-slate-150">
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-wider">Qualidade do Atendimento:</label>
                <div className="flex items-center justify-center gap-1.5">
                  {[1, 2, 3, 4, 5].map(st => {
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => setBookingReviewStars(st)}
                        className="p-1 text-xl hover:scale-110 active:scale-95 transition cursor-pointer"
                      >
                        <span className={st <= bookingReviewStars ? "text-amber-400" : "text-slate-200"}>★</span>
                      </button>
                    );
                  })}
                </div>
                <span className="text-[10px] text-amber-600 font-extrabold">
                  {["", "Ruim 😠", "Regular 😐", "Bom 🙂", "Muito Bom 😀", "Excelente! 😍"][bookingReviewStars]}
                </span>
              </div>

              {/* Comment text area */}
              <div className="space-y-1">
                <label className="block text-[10px] uppercase font-bold text-slate-500">Deixe seu depoimento / comentário sobre o serviço: *</label>
                <textarea
                  rows={3}
                  required
                  value={bookingReviewComment}
                  onChange={(e) => setBookingReviewComment(e.target.value)}
                  placeholder="Por favor, escreva suas impressões técnicas sobre o cumprimento de horários, custo/benefício e educação do prestador..."
                  className="bg-white text-slate-800 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                />
              </div>

            </div>

            {/* Actions footer */}
            <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewModalOpen(false)}
                className="bg-slate-100 hover:bg-slate-200 text-slate-600 px-4 py-2 rounded-xl text-xs font-black uppercase"
              >
                Voltar
              </button>
              <button
                type="submit"
                className="bg-[#1B2A6B] hover:bg-[#0F173A] text-[#F5C800] px-5 py-2.5 rounded-xl text-xs font-black uppercase shadow cursor-pointer transition"
              >
                Enviar Avaliação ⭐
              </button>
            </div>

          </form>
        </div>
      )}

      {/* 4. PAINEL DE CONTROLE / DRAWER DIALOG DO USUÁRIO LOGADO */}
      {userPanelOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-end z-[90] p-0 md:p-4">
          <div className="bg-white w-full max-w-xl h-full md:h-[95vh] md:rounded-3xl shadow-2xl flex flex-col border-l border-slate-200 overflow-hidden animate-slideright">
            
            {/* Header info bar */}
            <div className="bg-[#1B2A6B] text-white p-5 flex items-center justify-between border-b border-[#0F173A]">
              <div className="flex items-center gap-3">
                <img src={userSession.avatar} alt="User Avatar" className="w-12 h-12 rounded-full border-2 border-[#F5C800] bg-white object-cover" />
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-sm font-black text-[#F5C800]">{userSession.nome}</h4>
                    {userSession.tipo === 'client' && (
                      userSession.isPremium ? (
                        <span className="text-[8px] bg-yellow-400 text-[#1B2A6B] font-black uppercase tracking-wider p-0.5 px-1.5 rounded-md leading-none select-none">
                          👑 PREMIUM
                        </span>
                      ) : (
                        <span className="text-[8px] bg-slate-700 text-slate-300 font-extrabold uppercase tracking-wider p-0.5 px-1.5 rounded-md leading-none select-none">
                          STANDARD
                        </span>
                      )
                    )}
                    {userSession.tipo === 'pro' && (
                      <span className="text-[8px] bg-indigo-550 text-indigo-100 font-black uppercase tracking-wider p-0.5 px-1.5 rounded-md leading-none select-none">
                        🛠️ PRESTADOR
                      </span>
                    )}
                  </div>
                  <p className="text-[10px] font-mono font-medium text-slate-300 mt-0.5">{userSession.email}</p>
                </div>
              </div>
              <button
                onClick={() => setUserPanelOpen(false)}
                className="p-1.5 px-3 bg-white/10 hover:bg-white/20 text-white font-extrabold rounded-lg text-xs transition active:scale-95 cursor-pointer"
              >
                Fechar X
              </button>
            </div>

            {/* Dashboard ribbon category tabs switcher */}
            <div className="flex border-b border-slate-200 bg-slate-50 select-none overflow-x-auto shrink-0">
              {userSession.tipo === 'pro' ? (
                [
                  { id: "agendamentos", label: "📅 Agendamentos" },
                  { id: "conversas", label: "💬 Mensagens" },
                  { id: "planos", label: "🔑 Meus Planos" }
                ].map(tab => {
                  const isActive = activeUserPanelTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveUserPanelTab(tab.id as any)}
                      className={`flex-1 min-w-[100px] py-3 text-center text-[11px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${isActive ? 'bg-white border-[#1B2A6B] text-[#1B2A6B]' : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                      {tab.label}
                    </button>
                  );
                })
              ) : (
                [
                  { id: "agendamentos", label: "📅 Meus Agendamentos" },
                  { id: "conversas", label: "💬 Minhas Conversas" },
                  { id: "dados", label: "✅ Emitir Selo Verificado" }
                ].map(tab => {
                  const isActive = activeUserPanelTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveUserPanelTab(tab.id as any)}
                      className={`flex-1 min-w-[100px] py-3 text-center text-[11px] font-black uppercase tracking-wider transition-all border-b-2 cursor-pointer ${isActive ? 'bg-white border-[#1B2A6B] text-[#1B2A6B]' : 'bg-slate-50 border-transparent text-slate-500 hover:text-slate-800'}`}
                    >
                      {tab.label}
                    </button>
                  );
                })
              )}
            </div>

            {/* Drawer interior scroll body */}
            <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50">
              
              {/* TAB 1: MEUS AGENDAMENTOS */}
              {activeUserPanelTab === "agendamentos" && (() => {
                const isPro = userSession.tipo === 'pro';
                const myBookings = isPro 
                  ? bookings.filter(b => b.proId === userSession.profissionalId)
                  : bookings.filter(b => b.clientId === userSession.email);
                return (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                        {isPro ? "Agenda de Solicitações Recebidas" : "Histórico de Serviços"}
                      </h4>
                      <span className="text-[10px] font-bold text-[#1B2A6B] bg-brand-yellow/35 px-2 py-0.5 rounded-full">{myBookings.length} agendamentos</span>
                    </div>

                    {myBookings.length === 0 ? (
                      <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-xl">📅</span>
                        <h5 className="text-xs font-bold text-slate-800">Nenhum compromisso agendado</h5>
                        <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                          {isPro 
                            ? "Quando os clientes reservarem seus horários de atendimento, as solicitações surgirão listadas aqui!"
                            : "Os horários solicitados com encanadores, diaristas, técnicos ou médicos aparecerão listados aqui em tempo real."}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {myBookings.map(bk => {
                          return (
                            <div key={bk.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm space-y-3 animate-slideup">
                              
                              <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-2.5">
                                <div>
                                  <span className="text-[9px] uppercase font-bold text-slate-400">{isPro ? "Identificação de Cliente" : bk.proCategoria}</span>
                                  <strong className="block text-slate-850 text-xs">{isPro ? bk.clientName : bk.proNome}</strong>
                                </div>
                                <div className="text-right">
                                  <span className="text-[10px] font-black font-mono bg-slate-100 text-slate-800 p-1 px-2 rounded-lg">ID: #{bk.id}</span>
                                </div>
                              </div>

                              <div className="grid grid-cols-2 gap-2 text-xs">
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">Data marcada:</span>
                                  <strong className="text-slate-800 font-mono text-[11px]">{new Date(bk.data + 'T00:00:00').toLocaleDateString('pt-BR')}</strong>
                                </div>
                                <div>
                                  <span className="block text-[8px] uppercase font-bold text-slate-400">Hora marcada:</span>
                                  <strong className="text-slate-800 font-mono text-[11px]">{bk.hora} h</strong>
                                </div>
                              </div>

                              {/* Progress Status and Actions bar */}
                              <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-2.5">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[9.5px] font-bold text-slate-400 uppercase">Status:</span>
                                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase ${bk.status === 'Concluído' ? 'bg-emerald-50 text-emerald-700' : bk.status === 'Confirmado' ? 'bg-[#1B2A6B]/10 text-[#1B2A6B]' : bk.status === 'Cancelado' ? 'bg-rose-50 text-rose-750' : 'bg-amber-50 text-amber-700'}`}>
                                    ● {bk.status}
                                  </span>
                                </div>

                                <div className="flex gap-1.5">
                                  {/* Actions for client */}
                                  {!isPro && bk.status === 'Confirmado' && (
                                    <button
                                      type="button"
                                      onClick={() => handleUpdateBookingStatus(bk.id, 'Concluído')}
                                      className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer"
                                    >
                                      Concluir Serviço ✓
                                    </button>
                                  )}

                                  {/* Actions for pro */}
                                  {isPro && bk.status === 'Confirmado' && (
                                    <div className="flex gap-1">
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateBookingStatus(bk.id, 'Concluído')}
                                        className="p-1 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer font-sans"
                                      >
                                        Concluir ✓
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => handleUpdateBookingStatus(bk.id, 'Cancelado')}
                                        className="p-1 px-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[9px] font-extrabold uppercase transition cursor-pointer font-sans"
                                      >
                                        Rejeitar ✗
                                      </button>
                                    </div>
                                  )}

                                  {!isPro && bk.status === 'Concluído' && !bk.avaliado && (
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setActiveReviewBooking(bk);
                                        setBookingReviewStars(5);
                                        setBookingReviewComment("");
                                        setReviewModalOpen(true);
                                      }}
                                      className="p-1 px-2.5 bg-[#F5C800] text-[#1B2A6B] hover:bg-yellow-400 rounded-lg text-[9px] font-black uppercase transition shadow-sm animate-pulse cursor-pointer"
                                    >
                                      ⭐ Avaliar Serviço
                                    </button>
                                  )}

                                  {!isPro && bk.status === 'Concluído' && bk.avaliado && (
                                    <span className="text-[10px] font-bold text-gray-400">✓ Já avaliado</span>
                                  )}
                                </div>
                              </div>

                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 2: MINHAS CONVERSAS */}
              {activeUserPanelTab === "conversas" && (() => {
                const isPro = userSession.tipo === 'pro';
                const myChats = isPro
                  ? chatSessions.filter(c => c.proId === userSession.profissionalId)
                  : chatSessions.filter(c => c.clientId === userSession.email);
                return (
                  <div className="space-y-4 animate-fadein">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h4 className="text-xs font-black uppercase text-slate-500 tracking-wider">
                        {isPro ? "Mensagens de Clientes Interessados" : "Histórico de Mensagens"}
                      </h4>
                      <span className="text-[10px] font-bold text-[#1B2A6B] bg-brand-yellow/35 px-2 py-0.5 rounded-full">{myChats.length} conversas</span>
                    </div>

                    {myChats.length === 0 ? (
                      <div className="bg-white p-10 text-center rounded-2xl border border-slate-200 space-y-2">
                        <span className="text-2xl">💬</span>
                        <h5 className="text-xs font-bold text-slate-800">Nenhuma conversa ativa</h5>
                        <p className="text-[10px] text-slate-400 max-w-sm mx-auto leading-relaxed">
                          {isPro
                            ? "Quando os clientes ativos iniciarem conversas com você, as mensagens instantâneas surgirão listadas aqui!"
                            : "Quando você clica em \"💬 Enviar mensagem\" no perfil de qualquer profissional credenciado, a conversa será carregada aqui em tempo real!"}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-2.5">
                        {myChats.map((sess, index) => {
                          const lastMsg = sess.messages[sess.messages.length - 1];
                          const proObj = professionals.find(p => p.id === sess.proId);
                          
                          // Decide display name and avatar
                          const displayName = isPro ? (sess.clientName || sess.clientId.split('@')[0]) : (proObj?.nome || "Profissional");
                          const displayAvatar = isPro 
                            ? "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80" 
                            : (proObj?.avatar || "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150&h=150&q=80");
                          
                          return (
                            <button
                              key={index}
                              type="button"
                              onClick={() => {
                                setActiveChatProId(sess.proId);
                                setChatModalOpen(true);
                              }}
                              className="w-full text-left bg-white p-3 rounded-2xl border border-slate-200 hover:border-[#1B2A6B] transition shadow-sm flex items-center justify-between gap-3 cursor-pointer"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <img src={displayAvatar} alt={displayName} className="w-10 h-10 rounded-full object-cover border" />
                                <div className="min-w-0">
                                  <h5 className="text-xs font-black text-slate-900 truncate">{displayName}</h5>
                                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none mb-1">
                                    {isPro ? "Cliente Ativo" : (proObj?.categoria || "Profissional")}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate">
                                    {lastMsg ? lastMsg.text : "Mensagem pendente de preenchimento..."}
                                  </p>
                                </div>
                              </div>
                              <span className="text-[10px] font-bold text-brand-blue shrink-0 uppercase bg-[#1B2A6B]/5 p-1 px-2.5 rounded-lg">
                                Responder 💬
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {/* TAB 3: DADOS & VERIFICAÇÃO */}
              {activeUserPanelTab === "dados" && (() => {
                const myPro = professionals.find(p => p.email === userSession.email || p.id === userSession.profissionalId || p.nome.toLowerCase().includes(userSession.nome.toLowerCase()));

                return (
                  <div className="space-y-4 font-sans text-xs">
                    {/* DOC VERIFICATION BLOCK */}
                    <div className="space-y-3.5 bg-white p-5 rounded-2xl border border-slate-200">
                      <span className="block text-xs font-black text-[#1B2A6B] uppercase border-l-2 border-brand-yellow pl-2">
                        Selo Oficial de Verificado ✅
                      </span>

                      <p className="text-slate-600 leading-relaxed font-semibold">
                        O selo <strong>✅ Verificado</strong> eleva o nível técnico dos profissionais em até 67% segundo nossas análises locais do diretório digital <strong>TáNaMão</strong>.
                      </p>

                      {myPro?.verificado ? (
                        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl space-y-3">
                          <div className="flex items-center gap-2">
                            {myPro.tipoVerificacao === 'cnpj' ? (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                                🏢 CNPJ Verificado — Ativo
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 bg-emerald-600 text-white font-black text-[10px] px-2.5 py-1 rounded-full uppercase tracking-wider shadow">
                                ✅ CPF Verificado
                              </span>
                            )}
                          </div>

                          <div className="space-y-2 text-slate-700 bg-white/60 p-3 rounded-xl border border-emerald-100 font-mono text-[11px]">
                            <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Documento cadastrado</strong> {myPro.documento}</p>
                            
                            {myPro.tipoVerificacao === 'cnpj' ? (
                              <>
                                <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Razão Social</strong> {myPro.dadosReceita?.razaoSocial || "N/A"}</p>
                                <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Nome Fantasia</strong> {myPro.dadosReceita?.nomeFantasia || "N/A"}</p>
                                <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Situação Cadastral</strong> <span className="bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded text-[10px]">ACTIVE / {myPro.dadosReceita?.situacao || "ATIVA"}</span></p>
                                <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Data de Abertura</strong> {myPro.dadosReceita?.abertura || "N/A"}</p>
                                <p><strong className="text-slate-500 uppercase text-[9px] block">CNAE Principal</strong> {myPro.dadosReceita?.cnae || "N/A"}</p>
                              </>
                            ) : (
                              <>
                                <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Nome Completo</strong> {myPro.dadosReceita?.nomeCompleto || "N/A"}</p>
                                <p className="border-b border-emerald-50 pb-1"><strong className="text-slate-500 uppercase text-[9px] block">Situação CPF</strong> <span className="bg-emerald-100 text-emerald-800 font-black px-1.5 py-0.2 rounded text-[10px]">{myPro.dadosReceita?.situacaoCPF || "REGULAR"}</span></p>
                                <p><strong className="text-slate-500 uppercase text-[9px] block">Data de Nascimento</strong> {myPro.dadosReceita?.nascimento || "N/A"}</p>
                              </>
                            )}
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const updated = professionals.map(p => {
                                if (p.id === myPro.id) {
                                  return { 
                                    ...p, 
                                    verificado: false, 
                                    verificadoCPF: false, 
                                    verificadoCNPJ: false, 
                                    tipoVerificacao: 'none' as const, 
                                    documento: undefined, 
                                    dadosReceita: undefined 
                                  };
                                }
                                return p;
                              });
                              syncDB(updated);
                              setRegisterDocumento("");
                              addToast("Selo de verificação removido para simulação!");
                            }}
                            className="w-full text-center py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-lg border text-[10px] uppercase font-mono transition cursor-pointer"
                          >
                            🔄 Simular Outro Documento
                          </button>
                        </div>
                      ) : (
                        <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 font-bold text-slate-700 text-xs">
                          <p className="text-[10px] font-black text-[#1B2A6B] uppercase font-mono">Simular Validação Fiscal Local:</p>
                          <input 
                            type="text"
                            value={registerDocumento}
                            onChange={(e) => {
                              const val = e.target.value;
                              setRegisterDocumento(formatCPFOrCNPJ(val));
                            }}
                            placeholder="Insira CPF ou CNPJ..."
                            disabled={verificationLoading}
                            className="bg-white text-slate-850 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none disabled:opacity-50"
                          />

                          {verificationLoading ? (
                            <div className="flex items-center justify-center gap-2 py-3 text-[#1B2A6B] font-bold text-xs animate-pulse">
                              <span className="w-4 h-4 border-2 border-[#1B2A6B] border-t-transparent rounded-full animate-spin"></span>
                              <span>Verificando Receita Federal...</span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={async () => {
                                if (!registerDocumento) {
                                  addToast("Erro: Informe o CPF/CNPJ para verificação! ⚠️");
                                  return;
                                }
                                const cleanDoc = registerDocumento.replace(/\D/g, '');
                                const isCPF = cleanDoc.length === 11;
                                const isCNPJ = cleanDoc.length === 14;

                                if (!isCPF && !isCNPJ) {
                                  addToast("Erro: Documento deve ter 11 (CPF) ou 14 (CNPJ) dígitos! ⚠️");
                                  return;
                                }

                                const isOk = validateDocumento(registerDocumento);
                                if (!isOk) {
                                  addToast(`CPF ou CNPJ inválido — verifique os números ❌`);
                                  return;
                                }

                                setVerificationLoading(true);
                                setVerificationError("");

                                try {
                                  if (isCPF) {
                                    await new Promise(resolve => setTimeout(resolve, 1500));
                                    
                                    const mockCPFData = {
                                      nomeCompleto: myPro?.nome || userSession.nome || "Prestador TáNaMão",
                                      situacaoCPF: "REGULAR",
                                      nascimento: "1988-11-20"
                                    };

                                    const updated = professionals.map(p => {
                                      if (p.email === userSession.email || p.id === userSession.profissionalId || (myPro && p.id === myPro.id)) {
                                        return {
                                          ...p,
                                          verificado: true,
                                          verificadoCPF: true,
                                          verificadoCNPJ: false,
                                          tipoVerificacao: 'cpf' as const,
                                          documento: registerDocumento,
                                          dadosReceita: mockCPFData
                                        };
                                      }
                                      return p;
                                    });

                                    syncDB(updated);
                                    addToast(`✅ CPF Verificado: Nome: ${mockCPFData.nomeCompleto} - Regular`);
                                  } else {
                                    let dadosCnpj: any = null;
                                    try {
                                      const res = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanDoc}`);
                                      if (res.ok) {
                                        const data = await res.json();
                                        dadosCnpj = {
                                          razaoSocial: data.razao_social || "",
                                          nomeFantasia: data.nome_fantasia || data.razao_social || "",
                                          situacao: data.descricao_situacao_cadastral || "ATIVA",
                                          abertura: data.data_inicio_atividade || "",
                                          cnae: data.cnae_fiscal_descricao || ""
                                        };
                                      }
                                    } catch (apiErr) {
                                      console.warn("BrasilAPI call error fallback", apiErr);
                                    }

                                    if (!dadosCnpj) {
                                      dadosCnpj = {
                                        razaoSocial: `${myPro?.empresa || userSession.nome || "Empresa"} LTDA`,
                                        nomeFantasia: myPro?.empresa || userSession.nome || "Prestador TáNaMão",
                                        situacao: "ATIVA",
                                        abertura: "2018-04-12",
                                        cnae: "Serviços de Manutenção e Telecomunicações Especializados"
                                      };
                                    }

                                    if (dadosCnpj.situacao.toUpperCase() !== "ATIVA") {
                                      addToast(`Aviso: CNPJ SUSPENSO ou BAIXADA na Receita. Verificação negada! ⚠️`);
                                      setVerificationLoading(false);
                                      return;
                                    }

                                    const updated = professionals.map(p => {
                                      if (p.email === userSession.email || p.id === userSession.profissionalId || (myPro && p.id === myPro.id)) {
                                        return {
                                          ...p,
                                          verificado: true,
                                          verificadoCPF: false,
                                          verificadoCNPJ: true,
                                          tipoVerificacao: 'cnpj' as const,
                                          documento: registerDocumento,
                                          dadosReceita: dadosCnpj
                                        };
                                      }
                                      return p;
                                    });

                                    syncDB(updated);
                                    addToast(`🏢 CNPJ Verificado — Ativo! Nome Fantasia: ${dadosCnpj.nomeFantasia}`);
                                  }
                                } catch (err) {
                                  addToast("Erro ao contatar Receita Federal.");
                                } finally {
                                  setVerificationLoading(false);
                                }
                              }}
                              className="mt-2 w-full py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-black font-mono select-none cursor-pointer"
                            >
                              ✓ Simular Validação Digital
                            </button>
                          )}
                        </div>
                      )}

                      <div className="bg-slate-50 p-3 rounded-xl border space-y-1.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                        <p className="font-bold text-slate-755">Regras de Formato da Máscara:</p>
                        <p>• <strong>CPF</strong>: 11 dígitos, ex <code>123.456.789-09</code> (Testado por algoritmos reais de dígito verificador)</p>
                        <p>• <strong>CNPJ</strong>: 14 dígitos, ex <code>12.345.678/0001-95</code> (Validação de dígitos estruturais matemáticos)</p>
                      </div>
                    </div>

                    {/* CLIENT PREMIUM UPGRADE */}
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-3 bg-white p-5 rounded-2xl border border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest font-mono">Clube de Vantagens</span>
                        <span className="text-[10px] font-extrabold uppercase bg-yellow-400 text-[#1B2A6B] px-2 py-0.5 rounded-full">★ R$ 19/mês</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900">👑 Assinatura Clube TáNaMão Premium</h4>
                      
                      {userSession.isPremium ? (
                        <div className="space-y-1.5 pt-1 text-[11px] font-semibold text-slate-600 leading-relaxed">
                          <p className="text-emerald-700 font-extrabold">✓ Sua assinatura está ATIVA e protegida!</p>
                          <p>Você possui garantia de reembolso integral para serviços qualificados e suporte chat prioritário de 24h.</p>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSession = { ...userSession, isPremium: false };
                              setUserSession(updatedSession);
                              localStorage.setItem("userSession", JSON.stringify(updatedSession));
                              addToast("Sua assinatura prêmio foi cancelada. Sentiremos saudades! 💔");
                            }}
                            className="text-[9.5px] font-black text-slate-500 hover:text-rose-600 transition uppercase cursor-pointer"
                          >
                            ✕ Cancelar Assinatura Clube Premium
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1 text-[11px] text-slate-600 font-semibold leading-relaxed">
                          <p>Garanta prioridade exclusiva nos agendamentos, chat com tradução automática opcional e suporte dedicado 24/7 contra fraudes.</p>
                          <button
                            type="button"
                            onClick={() => {
                              const checkoutPlan = {
                                id: 'premium-client',
                                nome: 'Clube TáNaMão Premium',
                                desc: 'Assinatura mensal para clientes do TáNaMão com suporte prioritário e proteção jurídica.',
                                precoSemana: '19',
                                precoMes: '19'
                              };
                              setUserPanelOpen(false); // Close user panel
                              setSelectedContractPlan(checkoutPlan);
                              setContractCity("Todos");
                              setContractStep(1);
                              setContractModalOpen(true);
                              addToast("Iniciando assinatura do Clube Premium! 👑");
                            }}
                            className="w-full py-2 bg-[#1B2A6B] hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center"
                          >
                            ⭐ Assinar Agora por R$ 19,00
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })() && false && (
                <div className="space-y-4 animate-fadein bg-white p-5 rounded-2xl border border-slate-200">
                  <span className="block text-xs font-black text-brand-blue uppercase border-l-2 border-brand-yellow pl-2">
                    Selo Oficial de Verificado ✅
                  </span>
                  
                  <div className="space-y-3.5 text-xs text-slate-600 leading-relaxed font-semibold">
                    <p>
                      O selo <strong>✅ Verificado</strong> eleva o nível técnico dos profissionais em até 67% segundo nossas análises locais do diretório digital <strong>TáNaMão</strong>.
                    </p>
                    <p>
                      Para receber o badge verificado, o TáNaMão simula a validação fiscal exigindo que os prestadores informem o seu número de <strong>CPF</strong> ou <strong>CNPJ</strong> válido.
                    </p>
                    
                    <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-xl space-y-1.5 font-bold text-slate-700 text-xs">
                      <p className="text-[10px] font-black text-[#1B2A6B] uppercase font-mono">Simular Validação Fiscal Local:</p>
                      <input 
                        type="text"
                        value={registerDocumento}
                        onChange={(e) => {
                          const val = e.target.value;
                          setRegisterDocumento(formatCPFOrCNPJ(val));
                        }}
                        placeholder="Insira CPF ou CNPJ..."
                        className="bg-white text-slate-850 text-xs w-full p-2.5 border border-slate-300 rounded-xl focus:outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          if (!registerDocumento) {
                            addToast("Erro: Informe o CPF/CNPJ para verificação! ⚠️");
                            return;
                          }
                          const isOk = validateDocumento(registerDocumento);
                          if (isOk) {
                            addToast(`Documento ${registerDocumento} VALIDADO com sucesso pelo TáNaMão! ✅`);
                            const updated = professionals.map(p => {
                              if (p.nome.toLowerCase().includes(userSession.nome.toLowerCase()) || p.email === userSession.email) {
                                return { ...p, verificado: true, documento: registerDocumento };
                              }
                              return p;
                            });
                            syncDB(updated);
                            addToast(`Selo VERIFICADO atribuído para o perfil de ${userSession.nome}! 🎉`);
                          } else {
                            addToast(`Erro: CPF ou CNPJ ${registerDocumento} tem dígito verificador INVÁLIDO! ❌`);
                          }
                        }}
                        className="mt-2 w-full py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-lg text-xs font-black font-mono select-none cursor-pointer"
                      >
                        ✓ Simular Validação Digital
                      </button>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-xl border space-y-1.5 text-[11px] text-slate-500 font-medium leading-relaxed">
                      <p className="font-bold text-slate-750">Regras de Formato da Máscara:</p>
                      <p>• <strong>CPF</strong>: 11 dígitos, ex <code>123.456.789-09</code> (Testado por algoritmos reais de dígito verificador)</p>
                      <p>• <strong>CNPJ</strong>: 14 dígitos, ex <code>12.345.678/0001-95</code> (Validação de dígitos estruturais matemáticos)</p>
                    </div>

                    {/* CLIENT PREMIUM UPGRADE */}
                    <div className="bg-indigo-50 border border-indigo-200 p-4 rounded-xl space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-indigo-700 uppercase tracking-widest font-mono">Clube de Vantagens</span>
                        <span className="text-[10px] font-extrabold uppercase bg-yellow-400 text-[#1B2A6B] px-2 py-0.5 rounded-full">★ R$ 19/mês</span>
                      </div>
                      <h4 className="text-xs font-black text-slate-900">👑 Assinatura Clube TáNaMão Premium</h4>
                      
                      {userSession.isPremium ? (
                        <div className="space-y-1.5 pt-1 text-[11px] font-semibold text-slate-600 leading-relaxed">
                          <p className="text-emerald-700 font-extrabold">✓ Sua assinatura está ATIVA e protegida!</p>
                          <p>Você possui garantia de reembolso integral para serviços qualificados e suporte chat prioritário de 24h.</p>
                          <button
                            type="button"
                            onClick={() => {
                              const updatedSession = { ...userSession, isPremium: false };
                              setUserSession(updatedSession);
                              localStorage.setItem("userSession", JSON.stringify(updatedSession));
                              addToast("Sua assinatura prêmio foi cancelada. Sentiremos saudades! 💔");
                            }}
                            className="text-[9.5px] font-black text-slate-500 hover:text-rose-600 transition uppercase"
                          >
                            ✕ Cancelar Assinatura Clube Premium
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3 pt-1 text-[11px] text-slate-600 font-semibold leading-relaxed">
                          <p>Garanta prioridade exclusiva nos agendamentos, chat com tradução automática opcional e suporte dedicado 24/7 contra fraudes.</p>
                          <button
                            type="button"
                            onClick={() => {
                              const checkoutPlan = {
                                id: 'premium-client',
                                nome: 'Clube TáNaMão Premium',
                                desc: 'Assinatura mensal para clientes do TáNaMão com suporte prioritário e proteção jurídica.',
                                precoSemana: '19',
                                precoMes: '19'
                              };
                              setUserPanelOpen(false); // Close user panel
                              setSelectedContractPlan(checkoutPlan);
                              setContractCity("Todos");
                              setContractStep(1);
                              setContractModalOpen(true);
                              addToast("Iniciando assinatura do Clube Premium! 👑");
                            }}
                            className="w-full py-2 bg-[#1B2A6B] hover:bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-wider transition cursor-pointer text-center"
                          >
                            ⭐ Assinar Agora por R$ 19,00
                          </button>
                        </div>
                      )}
                    </div>

                  </div>

                </div>
              )}

              {/* TAB 3.5: PLANOS E DESTAQUES (ONLY FOR PRO) */}
              {activeUserPanelTab === "planos" && (() => {
                const myPro = professionals.find(p => p.id === userSession.profissionalId);
                if (!myPro) {
                  return (
                    <div className="bg-white p-6 rounded-2xl border text-center text-slate-400 font-semibold space-y-2">
                       <p>Não encontramos seu perfil técnico de anunciante ativo no banco.</p>
                    </div>
                  );
                }

                const today = new Date(2026, 5, 2); // default mockup date
                const ends = myPro.planoTermino ? new Date(myPro.planoTermino) : null;
                const daysLeft = ends ? Math.ceil((ends.getTime() - today.getTime()) / (1000 * 3600 * 24)) : 0;

                return (
                  <div className="space-y-4 animate-fadein">
                    
                    {/* Active highlight details */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-black text-slate-450 uppercase tracking-widest font-mono">Status do Anunciante</span>
                        <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">✓ Perfil Ativo</span>
                      </div>

                      <h4 className="text-sm font-black text-slate-900 border-b pb-2">
                        Seu Impulsionamento de Visibilidade
                      </h4>

                      {myPro.planoTipo && myPro.planoTipo !== 'none' ? (
                        <div className="space-y-4 pt-1">
                          <div className="flex items-start justify-between">
                            <div className="space-y-1">
                              <span className="inline-flex items-center gap-1.5 text-xs font-black text-[#1B2A6B] bg-brand-yellow/30 p-1 px-2.5 rounded-lg border border-brand-yellow">
                                🚀 Destaque: {myPro.planoTipo.toUpperCase()}
                              </span>
                              <p className="text-[11px] text-slate-450 font-bold">
                                Renovação contratada: <span className="text-slate-700 font-extrabold font-mono uppercase">{myPro.planoPeriodo || 'único'}</span>
                              </p>
                              {myPro.destaqueCidade && (
                                <p className="text-[10px] text-slate-500 font-semibold">📍 Território Solo fixado: <strong className="text-slate-800">{myPro.destaqueCidade}</strong></p>
                              )}
                              {myPro.destaqueCategoriaNome && (
                                <p className="text-[10px] text-slate-500 font-semibold">🎯 Filtro de busca fixado: <strong className="text-slate-800">{myPro.destaqueCategoriaNome}</strong></p>
                              )}
                            </div>
                            
                            <div className="text-right">
                              <span className="block text-[9px] font-black text-slate-405 uppercase leading-none">Termina em:</span>
                              <strong className="text-xs text-slate-800 font-mono">{myPro.planoTermino}</strong>
                            </div>
                          </div>

                          {/* Renewal Warning logic (3 days) */}
                          {daysLeft > 0 && daysLeft <= 3 ? (
                            <div className="bg-amber-50 text-amber-900 border border-amber-250 p-3 rounded-xl space-y-1.5 font-bold text-xs animate-pulse">
                              <p>⚠️ Alerta de Renovação: Restam apenas {daysLeft} dias de visualização destacada!</p>
                              <button
                                type="button"
                                onClick={() => {
                                  setUserPanelOpen(false);
                                  setViewPlanos(true);
                                  window.location.hash = '#planos';
                                }}
                                className="w-full py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-xs font-black uppercase tracking-wide transition cursor-pointer"
                              >
                                Recontratar / Prorrogar Período
                              </button>
                            </div>
                          ) : (
                            <div className="text-xs font-semibold text-slate-500 bg-slate-50 px-3 py-1.5 rounded-xl flex items-center justify-between">
                              <span>Período Ativo Restante:</span>
                              <strong className="text-slate-800 font-mono">{daysLeft > 0 ? daysLeft : "Perpétuo"} dias</strong>
                            </div>
                          )}

                          {/* Cancellation Actions */}
                          <div className="pt-2 border-t flex justify-end">
                            <button
                              type="button"
                              onClick={() => {
                                const confirmCancel = window.confirm("Atenção Prestador: Deseja de fato programar o CANCELAMENTO automático da sua assinatura nas Amarelas? Seus destaques serão mantidos até o vencimento programado.");
                                if (confirmCancel) {
                                  const updated = professionals.map(p => {
                                    if (p.id === myPro.id) {
                                      return { ...p, planoPeriodo: 'cancelado/unico' };
                                    }
                                    return p;
                                  });
                                  syncDB(updated);
                                  addToast("Sua renovação automática foi cancelada com sucesso. Seu destaque continuará até o término do prazo programado!");
                                }
                              }}
                              className="text-[10px] font-bold text-rose-500 hover:text-rose-750 transition font-mono uppercase shrink-0 bg-rose-50 hover:bg-rose-100/50 p-1.5 px-3 rounded-lg border border-rose-200 cursor-pointer"
                            >
                              ✕ Cancelar Renovação Aut.
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="bg-slate-50 p-6 text-center border-2 border-dashed border-slate-200 rounded-2xl space-y-3.5">
                          <span className="text-2xl block">📈</span>
                          <div>
                            <h5 className="text-xs font-bold text-slate-900">Seu perfil técnico está orgânico</h5>
                            <p className="text-[10px] text-slate-400 font-semibold max-w-sm mx-auto leading-relaxed mt-1">
                              Profissionais credenciados que anunciam com os planos de destaque recebem até 7.5x mais ligações no WhatsApp.
                            </p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setUserPanelOpen(false);
                              setViewPlanos(true);
                              window.location.hash = '#planos';
                            }}
                            className="inline-flex py-2 px-4 bg-[#1B2A6B] hover:bg-[#0F173A] text-white hover:text-[#F5C800] rounded-xl text-xs font-black uppercase tracking-wider transition shadow cursor-pointer text-center"
                          >
                            ⭐ Conhecer Planos de Destaque
                          </button>
                        </div>
                      )}
                    </div>

                    {/* LEAD MANAGEMENT INTEGRATED SECTION */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-200 space-y-3 shadow-sm">
                      <div className="border-b pb-2 flex items-center justify-between">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-black text-indigo-505 uppercase tracking-widest font-mono">Plano Pré-Pago</span>
                          <h4 className="text-sm font-black text-slate-900">
                            💡 Gestão de Créditos por Lead
                          </h4>
                        </div>
                        <div className="text-right">
                          <span className="text-[8px] block font-black text-slate-404 uppercase">Saldo Estimado:</span>
                          <span className={`text-[13px] font-mono font-black ${myPro.saldoLeads !== undefined && myPro.saldoLeads < 8 ? 'text-rose-600 font-bold' : 'text-[#1B2A6B]'}`}>
                            R$ {(myPro.saldoLeads ?? 0.00).toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Low balance alert block */}
                      {myPro.saldoLeads !== undefined && myPro.saldoLeads < 8 && (
                        <div className="bg-red-50 text-rose-800 border-l-4 border-rose-500 p-3 rounded-r-xl space-y-1 font-bold text-xs animate-pulse">
                          <p>⚠️ Saldo Crítico para Contatos!</p>
                          <p className="text-[9.5px] text-slate-500 font-semibold leading-relaxed">
                            Seu saldo atual está abaixo de R$ 8,00. Adicione créditos agora para continuar recebendo chats, telefones abertos ou solicitações de orçamentos pelo WhatsApp.
                          </p>
                        </div>
                      )}

                      {/* Quick Top-Up recharging packages */}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-1">Adicionar Créditos Rápidos:</p>
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { id: 'lead-20', nome: 'Leads Inicial', preco: '20', val: 20, bonus: 5, bg: 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border-indigo-200' },
                          { id: 'lead-50', nome: 'Leads Pro', preco: '50', val: 50, bonus: 15, bg: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-205' },
                          { id: 'lead-100', nome: 'Leads Gold', preco: '100', val: 100, bonus: 35, bg: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-250' }
                        ].map((pkg) => (
                          <button
                            key={pkg.id}
                            type="button"
                            onClick={() => {
                              const checkoutPlan = {
                                id: pkg.id,
                                nome: `Recarga Pré-Paga R$ ${pkg.preco}`,
                                desc: `Pacote de créditos para lead no valor de R$ ${pkg.preco}. Ganhe + R$ ${pkg.bonus} de saldo bônus para contatos gratuitos.`,
                                precoSemana: pkg.preco,
                                precoMes: pkg.preco
                              };
                              setUserPanelOpen(false); // Close user panel
                              setSelectedContractPlan(checkoutPlan);
                              setContractCity(myPro.cidade);
                              setContractStep(1);
                              setContractModalOpen(true);
                              addToast(`Redirecionando para o pagamento da recarga de R$ ${pkg.preco}!`);
                            }}
                            className={`p-2 rounded-xl border flex flex-col items-center justify-center text-center transition scale-100 hover:scale-102 cursor-pointer ${pkg.bg}`}
                          >
                            <span className="text-[8px] font-black uppercase leading-tight font-sans text-slate-500 mb-1 leading-none">{pkg.nome}</span>
                            <span className="text-xs font-black font-mono">R$ {pkg.preco}</span>
                            <span className="text-[8px] font-bold opacity-80 mt-1 font-mono tracking-wide leading-none">Ganhe + R$ {pkg.bonus} bônus</span>
                          </button>
                        ))}
                      </div>

                      {/* Lead conversion history */}
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest pt-2">Histórico de Consumos & Leads:</p>
                      {myPro.historicoLeads && myPro.historicoLeads.length > 0 ? (
                        <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                          {myPro.historicoLeads.map((item, idx) => {
                            const isDebit = item.valor < 0 || item.tipo.toLowerCase().includes('whatsapp') || item.text?.toLowerCase().includes('contato') || item.tipo.toLowerCase().includes('contato') || item.tipo.toLowerCase().includes('ligação') || item.tipo.toLowerCase().includes('chat');
                            return (
                              <div key={idx} className="bg-slate-50 p-2 rounded-xl border border-slate-150 flex items-center justify-between text-[10px] font-bold text-slate-700 font-mono leading-none">
                                <div className="space-y-0.5">
                                  <p className="text-[9px] font-black text-slate-800 leading-none truncate max-w-[200px]">{item.tipo}</p>
                                  <span className="text-[8px] font-bold text-slate-400 leading-none">{item.data}</span>
                                </div>
                                <span className={isDebit ? "text-rose-600 font-extrabold" : "text-emerald-600 font-extrabold"}>
                                  {isDebit ? `- R$ 5.00` : `+ R$ ${Math.abs(item.valor).toFixed(2)}`}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="p-4 bg-slate-50 border border-slate-150 rounded-xl text-center text-slate-400 text-[10px] font-semibold">
                          Nenhum consumo de lead registrado até o momento.
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
