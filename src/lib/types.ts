export interface Residence {
  id: string
  user_id: string
  name: string
  level: number
  reputation: number
  money: number
  jr_energy: number
  jr_experience: number
  last_tick: string
  created_at: string
}

export interface Resident {
  id: string
  residence_id: string
  name: string
  age: number
  tagline: string
  backstory: string
  personality: string
  mood: string
  hunger: number
  hygiene: number
  medication: number
  entertainment: number
  companionship: number
  happiness: number
  created_at: string
}

export interface GameEvent {
  id: string
  residence_id: string
  resident_id: string
  type: string
  urgency: string
  resolved_at: string | null
  created_at: string
  residents?: { name: string }
}

export interface Room {
  id: string
  residence_id: string
  type: string
  level: number
  built_at: string
}

export interface Toast {
  id: number
  message: string
  type: 'xp' | 'money' | 'warning' | 'success' | 'new'
}
