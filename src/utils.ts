/**
 * Utility functions for TáNaMão.
 * Splitting code to prevent excessive token growth in App.tsx.
 */

import { Profissional } from './types';

export const CITY_CENTERS: Record<string, { lat: number; lon: number }> = {
  "Bauru - SP": { lat: -22.3147, lon: -49.0606 },
  "Campinas - SP": { lat: -22.9064, lon: -47.0616 },
  "São Paulo - SP": { lat: -23.5505, lon: -46.6333 },
};

/**
 * Returns deterministic latitude and longitude near the city center.
 * This guarantees even newly created professionals get correct coordinates.
 */
export const getProCoords = (pro: Profissional): { lat: number; lon: number } => {
  if (pro.lat !== undefined && pro.lon !== undefined) {
    return { lat: pro.lat, lon: pro.lon };
  }
  const center = CITY_CENTERS[pro.cidade] || { lat: -22.3147, lon: -49.0606 };
  // Deterministic pseudo-random offset based on professional ID
  const offsetLat = (((pro.id * 17) % 50) - 25) / 600; // -0.04 to 0.04 degrees (~4.4km)
  const offsetLon = (((pro.id * 31) % 50) - 25) / 600;
  return {
    lat: Number((center.lat + offsetLat).toFixed(6)),
    lon: Number((center.lon + offsetLon).toFixed(6)),
  };
};

/**
 * Calculates the great-circle distance between two points on the Earth
 * using the Haversine formula. Returns distance in kilometers (km).
 */
export const calculateHaversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number((R * c).toFixed(1)); // Rounded to 1 decimal place
};

/**
 * Strips all non-digit characters.
 */
export const cleanDigits = (val: string): string => val.replace(/\D/g, "");

/**
 * Formats a raw input string into CPF or CNPJ mask format.
 */
export const formatCPFOrCNPJ = (val: string): string => {
  const digits = cleanDigits(val);
  if (digits.length <= 11) {
    // CPF: 000.000.000-00
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } else {
    // CNPJ: 00.000.000/0000-00
    return digits
      .substring(0, 14)
      .replace(/(\d{2})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1/$2")
      .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
  }
};

/**
 * Validates a CPF format & digit verifier.
 */
export const validateCPF = (cpf: string): boolean => {
  const clean = cleanDigits(cpf);
  if (clean.length !== 11) return false;
  if (/^(\d)\1+$/.test(clean)) return false; // Fail 111.111.111-11, etc.

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean[9])) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean[10])) return false;

  return true;
};

/**
 * Validates a CNPJ format & digit verifier.
 */
export const validateCNPJ = (cnpj: string): boolean => {
  const clean = cleanDigits(cnpj);
  if (clean.length !== 14) return false;
  if (/^(\d)\1+$/.test(clean)) return false;

  let size = clean.length - 2;
  let numbers = clean.substring(0, size);
  const digits = clean.substring(size);
  let sum = 0;
  let pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) return false;

  size = size + 1;
  numbers = clean.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }
  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) return false;

  return true;
};

/**
 * Performs formatting validation for CPF or CNPJ.
 */
export const validateDocumento = (doc: string): boolean => {
  const clean = cleanDigits(doc);
  if (clean.length === 11) return validateCPF(clean);
  if (clean.length === 14) return validateCNPJ(clean);
  return false;
};

/**
 * Generates a clean URL slug for a professional based on their name.
 */
export const generateSlug = (nome: string, categoria: string): string => {
  return `${nome}-${categoria}`
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove accents
    .replace(/[^a-z0-9]+/g, '-') // replace non-alphanumeric with hyphen
    .replace(/(^-|-$)+/g, ''); // remove leading/trailing hyphens
};

