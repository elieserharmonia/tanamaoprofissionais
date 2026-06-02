import React, { useState, useEffect, useMemo, FormEvent } from 'react';
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
  AlertCircle
} from 'lucide-react';

import { Profissional, Oferta, UserSession } from './types';
import { 
  INITIAL_PROFESSIONALS, 
  CATEGORIES_LIST, 
  INITIAL_OFFERS, 
  INITIAL_HERO_AD_SLIDES 
} from './data';

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

export default function App() {
  // --- CORE STATE PERSISTENCE ---
  const [professionals, setProfessionals] = useState<Profissional[]>([]);
  const [activeRegion, setActiveRegion] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedProfileId, setSelectedProfileId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<number[]>([]); // list of favorited professional IDs

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

  // Authentication Mock State
  const [userSession, setUserSession] = useState<UserSession>({
    nome: "Convidado",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
    logado: false
  });

  // UI Modal controllers
  const [regionModalOpen, setRegionModalOpen] = useState<boolean>(false);
  const [loginModalOpen, setLoginModalOpen] = useState<boolean>(false);
  const [announceModalOpen, setAnnounceModalOpen] = useState<boolean>(false);
  
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

  // Review Form States
  const [reviewAuthor, setReviewAuthor] = useState<string>("");
  const [reviewStars, setReviewStars] = useState<number>(5);
  const [reviewComment, setReviewComment] = useState<string>("");

  // Active picture preview inside professional gallery
  const [activeGalleryPhoto, setActiveGalleryPhoto] = useState<string>("");

  // Simple Notification triggers inside UI
  const [notifications, setNotifications] = useState<string[]>([
    "Boas-vindas ao TáNaMão! Encontre o profissional exemplar perto de você.",
    "Bandeira de desconto ativa: Veja as ofertas do dia com até 40% OFF!"
  ]);
  const [showNotificationCount, setShowNotificationCount] = useState<boolean>(true);
  const [notificationDrawerOpen, setNotificationDrawerOpen] = useState<boolean>(false);

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

    // 2. Hydrate Professionals DB
    const storedDB = localStorage.getItem('tanamao_db');
    if (storedDB) {
      try {
        setProfessionals(JSON.parse(storedDB));
      } catch (e) {
        setProfessionals(INITIAL_PROFESSIONALS);
      }
    } else {
      setProfessionals(INITIAL_PROFESSIONALS);
      localStorage.setItem('tanamao_db', JSON.stringify(INITIAL_PROFESSIONALS));
    }

    // 3. Hydrate Favorites list
    const storedFavs = localStorage.getItem('tanamao_favs');
    if (storedFavs) {
      try {
        setFavorites(JSON.parse(storedFavs));
      } catch (e) {}
    }

    // 4. Hydrate user session
    const storedSession = localStorage.getItem('tanamao_session_user');
    if (storedSession) {
      try {
        setUserSession(JSON.parse(storedSession));
      } catch (e) {}
    }

    // Hash routing dynamic synchronization
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#perfil-')) {
        const id = parseInt(hash.replace('#perfil-', ''), 10);
        if (!isNaN(id)) {
          setSelectedProfileId(id);
        }
      } else if (hash === '' || hash === '#home' || hash === '#catalog') {
        setSelectedProfileId(null);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // run immediately on startup

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Sync Database util
  const syncDB = (updatedList: Profissional[]) => {
    setProfessionals(updatedList);
    localStorage.setItem('tanamao_db', JSON.stringify(updatedList));
  };

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

  // 2. Core Catalog: matching inputs, categories, rating filters, and sorted
  const computedCatalog = useMemo(() => {
    let result = professionals.filter(p => {
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

      return matchRegion && matchCategory && textMatch && matchRating && match24h;
    });

    // Sort evaluation
    if (sortOrder === "visitas") {
      result.sort((a, b) => b.visitas - a.visitas);
    } else if (sortOrder === "nota") {
      result.sort((a, b) => getAverageRating(b) - getAverageRating(a));
    } else if (sortOrder === "recentes") {
      result.sort((a, b) => new Date(b.dataCadastro).getTime() - new Date(a.dataCadastro).getTime());
    } else if (sortOrder === "alfabetica") {
      result.sort((a, b) => a.nome.localeCompare(b.nome));
    }

    return result;
  }, [professionals, activeRegion, selectedCategory, searchTerm, ratingFilter, sortOrder, only24h]);

  // Active selected profile
  const activeProfile = useMemo(() => {
    return professionals.find(p => p.id === selectedProfileId) || null;
  }, [professionals, selectedProfileId]);

  // --- SUBMISSION ACTIONS ---

  // Mock authentication login form
  const handleLoginSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!usernameInput.trim()) return;

    const session: UserSession = {
      nome: usernameInput.trim(),
      avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(usernameInput.trim())}&background=1B2A6B&color=F5C800&bold=true`,
      logado: true
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

  const handleLogout = () => {
    const defaultSession = {
      nome: "Convidado",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120",
      logado: false
    };
    setUserSession(defaultSession);
    localStorage.removeItem('tanamao_session_user');
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
      avaliacoes: []
    };

    const updatedCol = [newlyBuilt, ...professionals];
    syncDB(updatedCol);

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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans flex flex-col antialiased selection:bg-brand-blue selection:text-brand-yellow">
      
      {/* 1. HEADER FIXO */}
      <header className="sticky top-0 z-40 bg-brand-blue text-white shadow-md border-b border-brand-blue-dark">
        <div className="max-w-7xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          
          {/* Logo with clean Yellow Pages handshake layout */}
          <div 
            onClick={() => { updateProfileIdWithHash(null); setSelectedCategory(""); setSearchTerm(""); }}
            className="flex items-center gap-2 cursor-pointer select-none group"
          >
            <div className="bg-brand-yellow text-brand-blue p-2 rounded-xl border-2 border-white shadow-sm font-retro text-xl flex items-center justify-center transition-transform group-hover:scale-105 active:scale-95 duration-150">
              🤝
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xl md:text-2xl font-black tracking-tighter text-brand-yellow font-display">
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
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar serviços e profissionais..."
              className="w-full bg-white text-slate-800 pl-10 pr-10 py-2.5 rounded-full text-xs md:text-sm font-medium border border-transparent shadow-inner focus:outline-none focus:ring-2 focus:ring-brand-yellow focus:border-transparent transition-all placeholder:text-slate-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm("")}
                className="absolute inset-y-0 right-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
              >
                <X className="w-4 h-4" />
              </button>
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
                  setShowNotificationCount(false);
                }}
                className="relative p-2.5 bg-white/10 hover:bg-white/20 text-white rounded-full transition focus:outline-none"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {showNotificationCount && notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold tracking-tight">
                    {notifications.length}
                  </span>
                )}
              </button>

              {/* Notification dropdown drawer */}
              {notificationDrawerOpen && (
                <div className="absolute right-0 mt-3.5 w-72 md:w-80 bg-white text-slate-800 rounded-2xl shadow-xl border border-slate-100 py-3 px-4 text-xs z-50 animate-fadein">
                  <div className="flex items-center justify-between border-b pb-2 mb-2">
                    <span className="font-bold text-slate-900 font-display">Avisos do TáNaMão</span>
                    <button 
                      onClick={() => setNotificationDrawerOpen(false)}
                      className="text-slate-400 hover:text-slate-600"
                    >
                      <X className="w-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5 max-h-48 overflow-y-auto">
                    {notifications.map((not, inx) => (
                      <div key={inx} className="flex gap-2 items-start py-1.5 border-b last:border-0 last:pb-0 border-slate-50">
                        <span className="text-brand-blue text-xs mt-0.5">🔹</span>
                        <p className="leading-snug text-slate-600">{not}</p>
                      </div>
                    ))}
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
              <div className="flex items-center gap-2">
                <img 
                  src={userSession.avatar} 
                  alt="Profile logo" 
                  className="w-8 h-8 rounded-full border border-brand-yellow object-cover" 
                />
                <button 
                  onClick={handleLogout}
                  className="hidden md:inline text-xs text-white/80 hover:text-white hover:underline transition font-bold"
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

        {/* PROFILE SHEET: ACTIVE ROUTE */}
        {selectedProfileId !== null && activeProfile ? (
          <section className="space-y-6 animate-slideup">
            
            {/* Back to Catalogue */}
            <div className="flex items-center justify-between">
              <button 
                onClick={() => updateProfileIdWithHash(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-brand-blue hover:bg-brand-blue-dark text-white rounded-full text-xs font-bold shadow transition-all hover:-translate-x-0.5 active:translate-y-0"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Voltar para o catálogo completo</span>
              </button>

              <button 
                onClick={() => toggleFavorite(activeProfile.id)}
                className={`inline-flex items-center gap-1 px-4 py-2 rounded-full text-xs font-bold shadow border transition ${favorites.includes(activeProfile.id) ? 'bg-red-50 text-red-600 border-red-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
              >
                <Heart className={`w-4 h-4 ${favorites.includes(activeProfile.id) ? 'fill-red-500 text-red-500' : ''}`} />
                <span>{favorites.includes(activeProfile.id) ? "Favoritado" : "Favoritar profissional"}</span>
              </button>
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

                  <div className="space-y-3.5 pt-2">
                    
                    {/* Primary Call button */}
                    {activeProfile.telefone && (
                      <a 
                        href={`tel:${activeProfile.telefone.replace(/\D/g, '')}`}
                        className="flex items-center gap-3 p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-2xl group transition"
                      >
                        <div className="p-2.5 bg-brand-blue text-brand-yellow rounded-xl group-hover:scale-105 transition-transform">
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
                        className="flex items-center justify-center gap-2 w-full p-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold font-display text-xs uppercase shadow transition-all hover:-translate-y-0.5 active:translate-y-0"
                      >
                        <PhoneCall className="w-4 h-4 fill-white text-white shrink-0" />
                        <span>Conversar no WhatsApp</span>
                      </a>
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

            {/* 2. BANNER HERO (with rotation, text slide, beautiful picture slide) */}
            <section className="bg-brand-blue text-white rounded-3xl overflow-hidden border border-brand-blue-dark shadow-md pt-6 md:pt-0 relative">
              
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900/60 to-transparent pointer-events-none z-10"></div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                
                {/* Slogan details and info button */}
                <div className="p-6 md:p-10 md:col-span-12 lg:col-span-7 space-y-4 text-left relative z-20">
                  <div className="inline-flex items-center gap-2 bg-brand-yellow text-brand-blue text-[10px] font-bold uppercase py-1 px-3 rounded-full border border-white">
                    ⭐ {computedSlides[currentSlide].badge}
                  </div>

                  <h2 className="text-3xl md:text-4.5xl font-black tracking-tight leading-none text-white font-display">
                    Connecte-se hoje mesmo!
                    <span className="block text-brand-yellow mt-1.5 font-display">
                      {computedSlides[currentSlide].title}
                    </span>
                  </h2>

                  <p className="text-xs md:text-sm text-slate-200 max-w-lg font-medium leading-relaxed font-display">
                    {computedSlides[currentSlide].subtitle}
                  </p>

                  <div className="flex flex-wrap gap-3 pt-3">
                    <button 
                      onClick={() => {
                        // Locate target categories or switch to catalog search
                        setSearchTerm("Carlos");
                        const element = document.getElementById('catalog-anchor');
                        if (element) element.scrollIntoView({ behavior: 'smooth' });
                      }}
                      className="bg-brand-yellow hover:bg-brand-accent text-brand-blue px-6 py-3 rounded-full text-xs md:text-sm font-extrabold transition shadow-md active:scale-95"
                    >
                      Encontrar Já!
                    </button>
                    
                    <button 
                      onClick={() => setAnnounceModalOpen(true)}
                      className="bg-white/10 hover:bg-white/20 text-white border border-white/20 px-4 md:px-5 py-3 rounded-full text-xs md:text-sm font-extrabold transition"
                    >
                      Anunciar Serviço Grátis
                    </button>
                  </div>

                  {/* Navigation dots below slide */}
                  <div className="flex items-center gap-1.5 pt-4">
                    {computedSlides.map((_, dotIndex) => (
                      <button
                        key={dotIndex}
                        onClick={() => setCurrentSlide(dotIndex)}
                        className={`w-2.5 h-2.5 rounded-full border-2 border-brand-yellow focus:outline-none transition-all ${dotIndex === currentSlide ? 'bg-brand-yellow w-6' : 'bg-transparent hover:bg-brand-yellow/50'}`}
                        title={`Slide ${dotIndex + 1}`}
                      />
                    ))}
                  </div>

                </div>

                {/* Professional illustration picture right column */}
                <div className="md:col-span-12 lg:col-span-5 h-48 md:h-80 relative select-none overflow-hidden shrink-0 border-t lg:border-t-0 lg:border-l border-brand-blue-dark">
                  <img 
                    src={computedSlides[currentSlide].image} 
                    alt="Profissionais no local de trabalho" 
                    className="w-full h-full object-cover grayscale-0 transition-opacity duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-brand-blue to-transparent lg:bg-gradient-to-r lg:from-brand-blue lg:to-transparent"></div>
                </div>

              </div>

            </section>

            {/* 3. CATEGORIAS (Grid 3x2 exactly as specified: Reformas, Beleza, Aulas, Tecnologia, Casa, Aconselha) */}
            <section className="space-y-4">
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

            {/* 3.1 DESTAQUE DA SEMANA (Solo Region Highlights - R$97/sem) */}
            <section className="space-y-4">
              <div className="flex items-center justify-between border-b pb-2 border-slate-200">
                <h3 className="text-sm md:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5 uppercase font-display">
                  <span className="text-[#F5C800]">⭐</span> DESTAQUE DA SEMANA — {activeRegion ? activeRegion.split(' - ')[0] : "Sua Cidade"}
                </h3>
                <span className="text-[10px] bg-[#1B2A6B] text-[#F5C800] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wide border border-[#F5C800]/50 animate-pulse">
                  Exclusivo
                </span>
              </div>

              {soloHighlightedPros.length > 0 ? (
                (() => {
                  const p = soloHighlightedPros[soloHighlightIdx];
                  if (!p) return null;
                  const avg = getAverageRating(p);
                  return (
                    <div 
                      key={p.id}
                      className="bg-white rounded-3xl overflow-hidden border border-[#E6A800] shadow-md hover:shadow-lg transition-all duration-300 grid grid-cols-1 md:grid-cols-12 gap-0 relative group"
                    >
                      {/* Big image container */}
                      <div className="md:col-span-5 h-56 md:h-72 bg-slate-100 relative overflow-hidden">
                        <img 
                          src={p.galeria && p.galeria.length > 0 ? p.galeria[0] : p.avatar} 
                          alt="Destaque da semana" 
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute top-3 left-3 bg-[#F5C800] text-[#1B2A6B] text-[9px] font-black uppercase px-2.5 py-1 rounded-full shadow-md border border-amber-500">
                          👑 ANUNCIANTE PREMIUM
                        </div>
                      </div>

                      {/* Info body container */}
                      <div className="md:col-span-7 p-6 md:p-8 flex flex-col justify-between space-y-4">
                        <div className="space-y-2">
                          <span className="text-[10px] font-extrabold text-[#1B2A6B] uppercase bg-yellow-400/20 px-2.5 py-1 rounded-md">
                            {p.emoji} {p.categoria}
                          </span>
                          <h4 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight leading-tight">
                            {p.nome}
                          </h4>
                          <p className="text-xs text-slate-400 italic font-bold">
                            {p.empresa}
                          </p>
                          <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed font-display line-clamp-3">
                            {p.bio}
                          </p>
                        </div>

                        {/* Interactive operations */}
                        <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <span className="flex items-center gap-0.5 text-slate-800 font-black text-sm">
                              <Star className="w-4 h-4 fill-[#F5C800] text-[#F5C800]" />
                              <span>{avg.toFixed(1)}</span>
                            </span>
                            <span className="text-xs text-slate-400 font-bold font-mono">({getRatingCount(p)} opiniões)</span>
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Ver Perfil */}
                            <button 
                              onClick={() => {
                                updateProfileIdWithHash(p.id);
                                addToast(`Acessando perfil de ${p.nome}...`);
                              }}
                              className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-black text-xs uppercase px-4 py-2.5 rounded-xl transition cursor-pointer"
                            >
                              Ver Perfil
                            </button>
                            {/* WhatsApp Direct button */}
                            <a 
                              href={`https://api.whatsapp.com/send?phone=55${p.celular.replace(/\D/g, '')}&text=${encodeURIComponent(`Olá ${p.nome}, vi seu destaque exclusivo em ${p.cidade} e gostaria de falar sobre segurança/orçamentos!`)}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase px-4 py-2.5 rounded-xl flex items-center gap-1.5 transition shadow"
                            >
                              <PhoneCall className="w-3.5 h-3.5 fill-white text-white" />
                              <span>WhatsApp</span>
                            </a>
                          </div>
                        </div>
                      </div>

                      {/* Rotator Dot Indicators (if multiple) */}
                      {soloHighlightedPros.length > 1 && (
                        <div className="absolute bottom-3 right-4 flex gap-1 z-10 bg-slate-900/60 p-1.5 rounded-full">
                          {soloHighlightedPros.map((_, dotIdx) => (
                            <button
                              key={dotIdx}
                              onClick={() => setSoloHighlightIdx(dotIdx)}
                              className={`w-2 h-2 rounded-full transition-all ${dotIdx === soloHighlightIdx ? 'bg-[#F5C800] w-4' : 'bg-white/50 hover:bg-white'}`}
                              title={`Destaque ${dotIdx + 1}`}
                            ></button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })()
              ) : (
                <div className="bg-gradient-to-br from-slate-900 to-brand-blue text-white rounded-3xl p-6.5 border border-white/10 shadow-md text-center space-y-4 py-8 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-36 h-36 bg-gradient-to-br from-brand-yellow/10 to-transparent rounded-full filter blur-xl"></div>
                  <div className="max-w-xl mx-auto space-y-3 relative z-10">
                    <span className="text-[#F5C800] text-2xl">✨</span>
                    <h4 className="text-base md:text-lg font-black text-brand-yellow leading-tight uppercase font-display">
                      Seja o Destaque Exclusivo da sua Cidade!
                    </h4>
                    <p className="text-xs md:text-sm text-slate-300 font-medium">
                      O espaço <strong>Solo Regional</strong> tem apenas 1 vaga semanal disponível em {activeRegion || "sua localidade"}. Atraia até 10x mais contratações locais diretas!
                    </p>
                    <button
                      onClick={() => {
                        setSelectedPlanId('solo');
                        setMonetizationTab('boost');
                        setAnnounceModalOpen(true);
                        addToast("Direcionando para plano de Destaque Solo!");
                      }}
                      className="bg-brand-yellow hover:bg-[#E6A800] text-brand-blue font-black text-xs uppercase px-5 py-3 rounded-full transition shadow-lg inline-block hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                    >
                      👑 Reservar Espaço Exclusivo — R$97
                    </button>
                  </div>
                </div>
              )}
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
                  {(selectedCategory || searchTerm || ratingFilter !== 'all') && (
                    <button 
                      onClick={() => {
                        setSelectedCategory("");
                        setSearchTerm("");
                        setRatingFilter("all");
                        setSortOrder("visitas");
                      }}
                      className="px-3.5 py-2 bg-slate-900 text-white rounded-xl text-xs font-bold hover:bg-slate-800"
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
                            {p.destaque && (
                              <span className="absolute top-2 left-2 bg-brand-yellow text-brand-blue text-[9px] font-black px-2 py-0.5 rounded">
                                RECOMENDADO
                              </span>
                            )}
                            
                            {/* Favoritar */}
                            <button
                              onClick={() => toggleFavorite(p.id)}
                              className="absolute top-2 right-2 p-1.5 bg-white/85 hover:bg-white rounded-full transition z-10 shadow-sm shadow-black/10 text-slate-400 hover:text-red-500"
                            >
                              <Heart className={`w-3.5 h-3.5 ${favorites.includes(p.id) ? 'fill-red-500 text-red-500' : ''}`} />
                            </button>

                            {/* Small category tag overlay */}
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
                          <div className="p-3.5 pt-2.5 space-y-1">
                            <span className="text-[9px] font-black uppercase text-slate-400">
                              {p.emoji} {p.categoria}
                            </span>
                            
                            <h4 
                              onClick={() => updateProfileIdWithHash(p.id)}
                              className="text-xs md:text-sm font-extrabold text-slate-800 leading-tight line-clamp-1 cursor-pointer hover:text-brand-blue hover:underline"
                            >
                              {p.nome}
                            </h4>
                            
                            <p className="text-[10px] text-slate-400 font-bold line-clamp-1">
                              {p.empresa}
                            </p>
                            
                            <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed pt-1 font-medium font-display">
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

        <div className="max-w-7xl mx-auto px-4 pt-6 mt-6 border-t border-slate-800 text-center text-[11px] text-slate-500 font-mono">
          TáNaMão S.A. © {new Date().getFullYear()} - Todos os Direitos Reservados. Licença de Utilidade Digital Autônoma.
        </div>
      </footer>

      {/* --- FLOATING FIX BUTTOn: ANUNCIE SEU SERVIÇO --- */}
      <button 
        onClick={() => setAnnounceModalOpen(true)}
        className="fixed bottom-6 right-6 z-35 bg-brand-yellow hover:bg-brand-accent text-brand-blue p-4 rounded-full shadow-lg border-2 border-brand-blue-dark flex items-center justify-center gap-2 font-black font-display text-xs md:text-sm uppercase tracking-wide transition-all hover:-translate-y-1 active:translate-y-0.5 cursor-pointer animate-bounce hover:animate-none"
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

    </div>
  );
}
