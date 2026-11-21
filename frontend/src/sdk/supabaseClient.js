// ============================================================================
// ARCHIVO: src/sdk/supabaseClient.js
// DESCRIPCIÓN: Cliente de Supabase conectado correctamente para Medusa Granizados.
// ============================================================================

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// URL base limpia (sin /rest/v1/)
const urlFinal = supabaseUrl || "https://frqeuftidngtqyvzrpjl.supabase.co";
const keyFinal = supabaseAnonKey || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZycWV1ZnRpZG5ndHF5dnpycGpsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTUwMTQ5MzQsImV4cCI6MjExMDU5MDkzNH0.WTonsg_LnC8puENdP0xB2UyeU7OmAytJqFmJw0AYYTE";

export const supabase = createClient(urlFinal, keyFinal);