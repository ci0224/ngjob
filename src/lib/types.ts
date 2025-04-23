export interface Job {
  id: string;
  company: string;
  job_title: string;
  job_location: string;
  job_family: string;
  degree_fields: string[];
  degree_preferred: string;
  degree_required: string;
  min_years_preferred: number;
  max_years_preferred: number;
  min_years_required: number;
  max_years_required: number;
  skills_preferred: string[];
  skills_required: string[];
  title: string;
  url: string;
  info_extract_date: string;
  extracted: string;
}

export interface JobFilters {
  search: string;
  company: string;
  location: string;
  jobFamily: string;
  minExp: string;
  skills: string[];
} 