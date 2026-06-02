/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Avaliacao {
  autor: string;
  estrelas: number;
  comentario: string;
  data: string; // ISO format or YYYY-MM-DD
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
  destaque: 'none' | 'solo' | 'linha';
  visitas: number;
  dataCadastro: string; // ISO date string
  galeria: string[];
  avaliacoes: Avaliacao[];
  atende24h: boolean;
  comGaleriaAmpliada?: boolean;
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
  avatar: string;
  logado: boolean;
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
