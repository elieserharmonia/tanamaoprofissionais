/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Avaliacao {
  autor: string;
  autorEmail?: string;
  estrelas: number;
  comentario: string;
  data: string; // ISO format or YYYY-MM-DD
  resposta?: string; // professional reply
  utilCount?: number; // 👍 helpful counters
  utilUsers?: string[]; // email of users who liked
  fotoUrl?: string; // custom upload
}

export interface PortfolioItem {
  antes: string;
  depois: string;
  titulo: string;
  descricao: string;
}

export interface Certificado {
  curso: string;
  instituicao: string;
  ano: number;
  imagem?: string;
}

export interface Denuncia {
  motivo: string;
  descricao: string;
  timestamp: string;
}

export interface Profissional {
  id: number;
  nome: string;
  empresa: string;
  categoria: string;
  emoji: string;
  cidade: string;
  avatar: string;
  bio: string;
  telefone: string;
  celular: string;
  email: string;
  endereco: string;
  destaque: 'none' | 'solo' | 'linha' | 'categoria' | 'patrocinado';
  visitas: number;
  dataCadastro: string; // ISO date string
  galeria: string[];
  avaliacoes: Avaliacao[];
  atende24h: boolean;
  comGaleriaAmpliada?: boolean;
  lat?: number;
  lon?: number;
  verificado?: boolean;
  verificadoCPF?: boolean;
  verificadoCNPJ?: boolean;
  documento?: string; // original generic document
  tipoVerificacao?: 'cpf' | 'cnpj' | 'none';
  dadosReceita?: {
    razaoSocial?: string;
    nomeFantasia?: string;
    situacao?: string;
    abertura?: string;
    cnae?: string;
    nomeCompleto?: string;
    situacaoCPF?: string;
    nascimento?: string;
  };
  destaqueCidade?: string;
  destaqueCategoriaNome?: string;
  planoTipo?: 'solo' | 'linha' | 'categoria' | 'patrocinado' | 'lead' | 'none';
  planoPeriodo?: 'semanal' | 'mensal' | 'unico' | 'none';
  planoTermino?: string; // YYYY-MM-DD
  saldoLeads?: number;
  historicoLeads?: { data: string; tipo: string; valor: number }[];
  leadsRecebidosSemana?: number;
  portfolio?: PortfolioItem[];
  certificados?: Certificado[];
  isTanamaoCertificado?: boolean;
  denuncias?: Denuncia[];
  slug?: string;
  whatsappMsgDefault?: string;
  scoreQualidade?: number;
  postsFeed?: {
    id: string;
    text: string;
    data: string;
    image?: string;
    tipo: 'Promoção' | 'Trabalho Concluído' | 'Aviso' | 'Geral';
    expiraEm?: string;
  }[];
}

export interface ClientReview {
  id: string;
  bookingId: string;
  clientId: string; // email matching UserSession
  clientName: string;
  proId: number;
  proNome: string;
  estrelas: number;
  comentario: string;
  data: string;
}

export interface WeeklyAd {
  id: number;
  profissionalId: number;
  nome: string; // Ad title / display name
  slogan: string;
  imagem: string;
}

export interface UserSession {
  nome: string;
  email: string;
  avatar: string;
  logado: boolean;
  tipo: 'client' | 'pro';
  profissionalId?: number;
  isPremium?: boolean;
}

export interface Message {
  sender: 'client' | 'pro';
  text: string;
  timestamp: string; // ISO format
}

export interface ChatSession {
  clientId: string; // e.g. email or "anon-user"
  proId: number;
  messages: Message[];
  unlockedPhone?: boolean; // toggle to unlock phone number after first chat
}

export interface Booking {
  id: string;
  clientId: string; // email or "anon-user"
  clientName: string;
  proId: number;
  proNome: string;
  proCategoria: string;
  data: string; // YYYY-MM-DD
  hora: string; // HH:MM
  status: 'Pendente' | 'Confirmado' | 'Concluído' | 'Cancelado';
  avaliado?: boolean;
}

export interface AppNotification {
  id: string;
  text: string;
  timestamp: string; // ISO format
  read: boolean;
  type?: 'visitas' | 'avaliacao' | 'mensagem' | 'agendamento' | 'plano' | 'conquista';
}

export interface Oferta {
  id: number;
  profissionalId: number;
  profissionalNome: string;
  titulo: string;
  descricao: string;
  desconto: string; // Ex: "30% OFF"
  precoOriginal: number;
  precoPromocional: number;
  imagem: string;
}
