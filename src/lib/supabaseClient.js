import { createClient } from '@supabase/supabase-js'

const supabaseUrl = "https://bompwqeaxdqiynkanhdk.supabase.co"
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJvbXB3cWVheGRxaXlua2FuaGRrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg3NjI2NTQsImV4cCI6MjA1NDMzODY1NH0.haDRXM8VJggTYKJXtPyN-vtBx4TPG_M6KZiphQRRkkE"


export const supabase = createClient(supabaseUrl, supabaseAnonKey)