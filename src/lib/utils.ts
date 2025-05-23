import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { Job, JobFilters } from "./types"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function filterJobs(jobs: Job[], filters: JobFilters): Job[] {
  return jobs.filter(job => {
    // Search text (search across multiple fields)
    if (filters.search) {
      const searchText = filters.search.toLowerCase()
      const searchableText = `${job.job_title} ${job.company} ${job.job_location} ${job.job_family}`.toLowerCase()
      
      if (!searchableText.includes(searchText)) {
        return false
      }
    }

    // Country filter
    if (filters.country && filters.country !== 'all' && job.job_country !== filters.country) {
      return false
    }

    // Job family filter (now supports multiple selections and case-insensitive matching)
    if (filters.jobFamily && filters.jobFamily.length > 0) {
      const jobFamilyLower = job.job_family?.toLowerCase() || '';
      const hasMatchingFamily = filters.jobFamily.some(family => 
        jobFamilyLower.includes(family.toLowerCase())
      );
      if (!hasMatchingFamily) {
        return false;
      }
    }

    // Experience filter (now shows maximum years)
    if (filters.minExp && filters.minExp !== 'all') {
      const maxYears = parseInt(filters.minExp)
      const jobMinYears = job.min_years_required ?? job.min_years_preferred ?? 0
      if (jobMinYears > maxYears) {
        return false
      }
    }

    // Skills filter
    if (filters.skills && filters.skills.length > 0) {
      const jobSkills = [
        ...(job.skills_required || []),
        ...(job.skills_preferred || [])
      ]
      
      // Job must have at least one of the selected skills
      if (!filters.skills.some(skill => jobSkills.includes(skill))) {
        return false
      }
    }

    // Degree filter
    if (filters.degree && filters.degree !== 'any') {
      const jobDegree = job.degree_required || job.degree_preferred;
      if (!jobDegree) {
        return true; // If no degree is specified, show the job
      }

      // Define degree hierarchy
      const degreeHierarchy = {
        'none': 0,
        'Bachelor': 1,
        'Master': 2,
        'PhD': 3
      };

      const selectedDegreeLevel = degreeHierarchy[filters.degree as keyof typeof degreeHierarchy];
      const jobDegreeLevel = degreeHierarchy[jobDegree as keyof typeof degreeHierarchy] || 0;

      // Show job if its required degree level is less than or equal to the selected degree level
      if (jobDegreeLevel > selectedDegreeLevel) {
        return false;
      }
    }

    return true
  })
}

export function formatDate(dateString: string): string {
  if (!dateString) return 'N/A'
  
  try {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  } catch {
    return 'Invalid date'
  }
}
