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
  total_events_resolved: number
  seasonal_event: string | null
  overnight_summary: OvernightSummary | null
  last_morning_check: string
  streak_days: number
  best_streak: number
  onboarding_done: boolean
  supply_food: number
  supply_medicine: number
  supply_soap: number
  supply_entertainment: number
  created_at: string
}

export interface OvernightSummary {
  income: number
  events: number
  escalated: number
  hospitalized: number
  date: string
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
  current_room_type: string
  activity: string
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
  unresolved_ticks: number
  hospitalized: boolean
  residents?: { name: string }
}

export interface Room {
  id: string
  residence_id: string
  type: string
  level: number
  built_at: string
  broken: boolean
  broken_since: string | null
}

export interface Toast {
  id: number
  message: string
  type: 'xp' | 'money' | 'warning' | 'success' | 'new' | 'story' | 'mission'
}

export interface StaffMember {
  id: string
  residence_id: string
  type: 'nurse' | 'cook' | 'cleaner' | 'entertainer'
  name: string
  level: number
  salary_per_hour: number
  hired_at: string
  assigned_room_type: string | null
}

export interface ScheduledActivity {
  id: string
  residence_id: string
  type: string
  label: string
  icon: string
  affects_need: string | null
  affects_boost: number
  reward_money: number
  reward_xp: number
  completed_at: string | null
  created_at: string
}

export interface DailyMission {
  id: string
  residence_id: string
  type: string
  description: string
  icon: string
  target_count: number
  current_count: number
  reward_money: number
  reward_xp: number
  completed_at: string | null
  claimed_at: string | null
  mission_date: string
}

export interface ResidentRelationship {
  id: string
  residence_id: string
  resident_a_id: string
  resident_b_id: string
  type: 'rival' | 'friend' | 'crush' | 'neutral'
  intensity: number
}

export interface Story {
  id: string
  residence_id: string
  resident_id: string | null
  chapter: number
  title: string
  content: string
  trigger_type: string
  unlocked_at: string
}

export interface Achievement {
  id: string
  residence_id: string
  type: string
  unlocked_at: string
}
