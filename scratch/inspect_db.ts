import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseKey)

async function inspect() {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .limit(1)

  if (error) {
    console.error('Error fetching employees:', error)
    // If it's a column mismatch, the error might give details
    return
  }

  if (data && data.length > 0) {
    console.log('Columns in employees:', Object.keys(data[0]))
  } else {
    console.log('No employees found, using RPC or looking for another way.')
  }
}

inspect()
