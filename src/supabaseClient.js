// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js'

// Essas variáveis vão vir do seu ambiente (arquivo .env)
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
