/**
 * Base metadata shared by most entities
 */
interface BaseMetadata {
  id: string | number
  created_at: Date
  updated_at?: Date
  created_by?: string | number
  updated_by?: string | number
}

// --- User & Access Management ---

export interface User extends BaseMetadata {
  role?: string
  role_id: number
  department_id: number
  name: string
  email: string
  password_hash: string
  position?: string
  profile_url?: string
}

export interface Role extends BaseMetadata {
  name: string
  description?: string
}

export interface Permission extends BaseMetadata {
  name: string
  description?: string
  parent_permission_id?: number
}

export interface RoleHasPermission extends BaseMetadata {
  role_id: number
  permission_id: number
}

export interface Department extends BaseMetadata {
  name: string
  description?: string
}

// --- Content & Academic Management ---

export interface AcademicYear extends BaseMetadata {
  name: string
  code: string
  description?: string
  from_date: Date
  to_date: Date
  submission_deadline: Date
  feedback_cut_off_deadline: Date
}

export interface Idea extends BaseMetadata {
  user_id: number
  academic_year_id: number
  title: string
  content: string
  file_url?: string
  is_anonymous: boolean
}

export interface IdeaCategory extends BaseMetadata {
  name: string
  description?: string
}

export interface IdeaHasCategory extends BaseMetadata {
  idea_id: number
  idea_category_id: number
}

// --- Interactions ---

export interface Reaction {
  id: number
  user_id: number
  idea_id: number
  reaction_type: 'upvote' | 'downvote' | string
  created_at: Date
}

export interface Comment extends BaseMetadata {
  user_id: number
  idea_id: number
  replied_comment_id?: number
  content: string
  file_image_url?: string
  is_anonymous: boolean
}

// --- Reporting System (New) ---

export interface ReportCategory extends BaseMetadata {
  name: string
  description?: string
}

export interface Report extends BaseMetadata {
  user_id: number // The reporter
  // Polymorphic-style IDs to support Idea, User, or Comment reporting
  target_id: number
  target_type: 'idea' | 'comment' | 'user'
  reason_details: string
  status: 'pending' | 'resolved' | 'dismissed'
}

/**
 * Pivot table to support "Report can have many report categories"
 */
export interface ReportHasCategory extends BaseMetadata {
  report_id: number
  report_category_id: number
}
