const SUPABASE_URL = 'http://127.0.0.1:54321'
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0'

class SupabaseClient {
  constructor() {
    this.url = SUPABASE_URL
    this.key = SUPABASE_ANON_KEY
    this.headers = {
      'apikey': this.key,
      'Authorization': `Bearer ${this.key}`,
      'Content-Type': 'application/json'
    }
  }

  async signUp(email, password) {
    try {
      const response = await fetch(`${this.url}/auth/v1/signup`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.user) {
        await this.saveSession(data.session || data)
      }
      return data
    } catch (error) {
      console.error('SignUp error:', error)
      return { 
        user: null, 
        error: { 
          message: error.message || 'Network error occurred' 
        } 
      }
    }
  }

  async signIn(email, password) {
    try {
      const response = await fetch(`${this.url}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify({
          email: email,
          password: password
        })
      })
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const data = await response.json()
      if (data.user) {
        await this.saveSession(data)
      }
      return data
    } catch (error) {
      console.error('SignIn error:', error)
      return { 
        user: null, 
        error: { 
          message: error.message || 'Network error occurred' 
        } 
      }
    }
  }

  async signOut() {
    const session = await this.getSession()
    if (session?.access_token) {
      await fetch(`${this.url}/auth/v1/logout`, {
        method: 'POST',
        headers: {
          ...this.headers,
          'Authorization': `Bearer ${session.access_token}`
        }
      })
    }
    
    if (typeof chrome !== 'undefined' && chrome.storage) {
      await chrome.storage.local.remove(['supabase_session'])
    } else {
      localStorage.removeItem('supabase_session')
    }
    return { error: null }
  }

  async getUser() {
    const session = await this.getSession()
    if (!session?.access_token) {
      return { user: null, error: { message: 'No session found' } }
    }

    const response = await fetch(`${this.url}/auth/v1/user`, {
      method: 'GET',
      headers: {
        ...this.headers,
        'Authorization': `Bearer ${session.access_token}`
      }
    })

    const data = await response.json()
    return { user: data, error: null }
  }

  async saveSession(session) {
    if (session) {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ supabase_session: session })
      } else {
        localStorage.setItem('supabase_session', JSON.stringify(session))
      }
    }
  }

  async getSession() {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const result = await chrome.storage.local.get(['supabase_session'])
      return result.supabase_session || null
    } else {
      const session = localStorage.getItem('supabase_session')
      return session ? JSON.parse(session) : null
    }
  }

  async refreshSession() {
    const session = await this.getSession()
    if (!session?.refresh_token) {
      return { session: null, error: { message: 'No refresh token' } }
    }

    const response = await fetch(`${this.url}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify({
        refresh_token: session.refresh_token
      })
    })

    const data = await response.json()
    if (data.access_token) {
      await this.saveSession(data)
    }
    return data
  }
}

const supabase = new SupabaseClient()