import { Job } from './types';

export async function fetchJobs(): Promise<Job[]> {
  try {
    const response = await fetch('https://api.airyvibe.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: `query {
          listJobs {
            id
            company
            job_title
            job_location
            job_family
            degree_fields
            degree_preferred
            degree_required
            min_years_preferred
            max_years_preferred
            min_years_required
            max_years_required
            skills_preferred
            skills_required
            title
            url
            info_extract_date
            extracted
          }
        }`,
      }),
      cache: 'no-store',
    });

    if (!response.ok) {
      throw new Error('Failed to fetch jobs');
    }

    const data = await response.json();
    return data.data.listJobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export function getUniqueValues(jobs: Job[], field: keyof Job): string[] {
  const values = new Set<string>();
  
  jobs.forEach(job => {
    const value = job[field];
    if (typeof value === 'string' && value) {
      values.add(value);
    }
  });
  
  return Array.from(values).sort();
}

export function getUniqueSkills(jobs: Job[]): string[] {
  const skills = new Set<string>();
  
  jobs.forEach(job => {
    if (Array.isArray(job.skills_required)) {
      job.skills_required.forEach(skill => {
        if (skill) skills.add(skill);
      });
    }
    
    if (Array.isArray(job.skills_preferred)) {
      job.skills_preferred.forEach(skill => {
        if (skill) skills.add(skill);
      });
    }
  });
  
  return Array.from(skills).sort();
} 