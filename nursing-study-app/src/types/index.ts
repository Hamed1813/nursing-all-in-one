export interface Domain {
  id: number;
  slug: string;
  name: string;
  color: string;
  sort_order: number;
}

export interface Page {
  id: number;
  domain_id: number;
  title: string;
  body: string;
  sort_order: number;
}

export interface PageWithDomain extends Page {
  domain_name: string;
  domain_color: string;
  domain_slug: string;
}

export type ChoiceKey = 'a' | 'b' | 'c' | 'd';

export interface Question {
  id: number;
  page_id: number;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  correct_choice: ChoiceKey;
  explanation: string;
  sort_order: number;
}

export interface Progress {
  page_id: number;
  is_read: number;
  first_read_at: string | null;
  last_read_at: string | null;
  times_read: number;
}

export interface LeitnerCard {
  page_id: number;
  box: number;
  next_review_at: string;
  last_reviewed_at: string | null;
  correct_in_a_row: number;
}

export interface ExamRecord {
  id: number;
  domain_filter: string;
  streak: number;
  achieved_at: string;
}

export interface DomainStat {
  domain_id: number;
  domain_name: string;
  domain_color: string;
  total_pages: number;
  read_pages: number;
  total_answers: number;
  correct_answers: number;
}

export interface LeitnerIntervals {
  box1: number;
  box2: number;
  box3: number;
  box4: number;
  box5: number;
}

export interface AppSettings {
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  randomDomainFilter: string; // 'all' | JSON.stringify(string[] of domain slugs)
  passThreshold: number; // 0..5, min correct out of 5 to advance leitner box
  intervals: LeitnerIntervals;
  reminderEnabled: boolean;
  reminderHour: number;
  reminderMinute: number;
}
