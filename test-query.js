const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://ojhszyyznrxfpddsxwob.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9qaHN6eXl6bnJ4ZnBkZHN4d29iIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk5NjI4NDMsImV4cCI6MjA5NTUzODg0M30.EmPXIZpC2mTp0-eZCOybPWMYdeTzdTRuH9TEJepKS50'

const supabase = createClient(supabaseUrl, supabaseKey)

async function test() {
  console.log('Testing query: select vehicle_purchase_id from claims')
  const { data, error } = await supabase
    .from('claims')
    .select('vehicle_purchase_id')
    .limit(1)
  
  if (error) {
    console.error('Query failed:', error.message)
  } else {
    console.log('Query success! Column vehicle_purchase_id exists!')
  }
}

test()
