"use client";

import { useEffect, useState } from "react";
import { Job, JobFilters } from "@/lib/types";
import { fetchJobs, getUniqueSkills, getUniqueValues } from "@/lib/api";
import { filterJobs, formatDate } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [jobFamilies, setJobFamilies] = useState<string[]>([]);
  const [skills, setSkills] = useState<string[]>([]);
  
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [selectedJobFamilies, setSelectedJobFamilies] = useState<string[]>([]);
  
  const [filters, setFilters] = useState<JobFilters>({
    search: "",
    country: "all",
    jobFamily: [],
    minExp: "all",
    skills: [],
  });

  // Fetch jobs data
  useEffect(() => {
    const getJobs = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();
        setJobs(data);
        setFilteredJobs(data);
        
        // Set filter options
        setJobFamilies(getUniqueValues(data, 'job_family'));
        setSkills(getUniqueSkills(data));
        
        setError(null);
      } catch (err) {
        setError("Failed to fetch jobs. Please try again later.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getJobs();
  }, []);

  // Apply filters when filters state changes
  useEffect(() => {
    const filtered = filterJobs(jobs, filters);
    // Sort by date (newer first)
    const sorted = [...filtered].sort((a, b) => 
      new Date(b.info_extract_date).getTime() - new Date(a.info_extract_date).getTime()
    );
    setFilteredJobs(sorted);
  }, [jobs, filters]);

  // Handle filter changes
  const handleFilterChange = (field: keyof JobFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  // Handle job family filter
  const toggleJobFamily = (family: string) => {
    setSelectedJobFamilies(prev => {
      const isSelected = prev.includes(family);
      const newFamilies = isSelected
        ? prev.filter(f => f !== family)
        : [...prev, family];
      
      // Update filters with the new job families
      setFilters(prevFilters => ({
        ...prevFilters,
        jobFamily: newFamilies,
      }));
      
      return newFamilies;
    });
  };

  // Handle skills filter
  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev => {
      const isSelected = prev.includes(skill);
      const newSkills = isSelected
        ? prev.filter(s => s !== skill)
        : [...prev, skill];
      
      // Update filters with the new skills
      setFilters(prevFilters => ({
        ...prevFilters,
        skills: newSkills,
      }));
      
      return newSkills;
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      country: "all",
      jobFamily: [],
      minExp: "all",
      skills: [],
    });
    setSelectedSkills([]);
    setSelectedJobFamilies([]);
  };

  // Used for skill selection display
  const getSkillsText = () => {
    if (selectedSkills.length === 0) return "Select skills";
    if (selectedSkills.length === 1) return selectedSkills[0];
    return `${selectedSkills.length} skills selected`;
  };

  // Used for job family selection display
  const getJobFamilyText = () => {
    if (selectedJobFamilies.length === 0) return "Select job families";
    if (selectedJobFamilies.length === 1) return selectedJobFamilies[0];
    return `${selectedJobFamilies.length} job families selected`;
  };

  return (
    <main className="container mx-auto py-8 px-4">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-primary">Job Listings</CardTitle>
          <CardDescription>
            Filter and browse available job listings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="col-span-1 md:col-span-2 lg:col-span-4">
              <Input
                placeholder="Search jobs..."
                value={filters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="w-full"
              />
            </div>
            
            <div>
              <Select
                value={filters.country}
                onValueChange={(value) => handleFilterChange("country", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Countries</SelectItem>
                  <SelectItem value="US">United States</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select
                value={filters.minExp}
                onValueChange={(value) => handleFilterChange("minExp", value)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Min. experience" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Any Experience</SelectItem>
                  <SelectItem value="0">Entry Level</SelectItem>
                  <SelectItem value="1">1+ Years</SelectItem>
                  <SelectItem value="3">3+ Years</SelectItem>
                  <SelectItem value="5">5+ Years</SelectItem>
                  <SelectItem value="7">7+ Years</SelectItem>
                  <SelectItem value="10">10+ Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  {getJobFamilyText()}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Job Families</DialogTitle>
                  <DialogDescription>
                    Choose job families to filter job listings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  {jobFamilies.map((family) => (
                    <div key={family} className="flex items-center space-x-2">
                      <Checkbox
                        id={`family-${family}`}
                        checked={selectedJobFamilies.includes(family)}
                        onCheckedChange={() => toggleJobFamily(family)}
                      />
                      <label
                        htmlFor={`family-${family}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {family}
                      </label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>

            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">
                  {getSkillsText()}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select Skills</DialogTitle>
                  <DialogDescription>
                    Choose skills to filter job listings
                  </DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-4">
                  {skills.map((skill) => (
                    <div key={skill} className="flex items-center space-x-2">
                      <Checkbox
                        id={`skill-${skill}`}
                        checked={selectedSkills.includes(skill)}
                        onCheckedChange={() => toggleSkill(skill)}
                      />
                      <label
                        htmlFor={`skill-${skill}`}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {skill}
                      </label>
                    </div>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
            
            {(filters.search || 
              filters.country !== "all" ||
              selectedJobFamilies.length > 0 ||
              filters.minExp !== "all" || 
              selectedSkills.length > 0) && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="text-center p-8">Loading job listings...</div>
      ) : error ? (
        <div className="text-center text-destructive p-8">{error}</div>
      ) : (
        <div>
          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="text-center py-2">
                No job listings found matching your criteria
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredJobs.map((job) => (
                <Card key={job.id} className="h-full">
                  <CardContent className="">
                    <div className="flex flex-col space-y-2">
                      <div>
                        <h3 className="text-base font-semibold line-clamp-2">{job.job_title}</h3>
                        <p className="text-xs text-muted-foreground">{job.company}</p>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="font-medium">Location</span>
                          <span className="text-muted-foreground line-clamp-1">{job.job_location}</span>
                        </div>
                        <div className="flex flex-col">
                          <span className="font-medium">Experience</span>
                          <span className="text-muted-foreground line-clamp-1">
                            {job.min_years_required ? 
                              `${job.min_years_required}+ years` : 
                              job.min_years_preferred ? 
                                `${job.min_years_preferred}+ years` : 
                                "Not specified"}
                          </span>
                        </div>
                      </div>
                      
                      <div>
                        <p className="font-medium text-xs mb-1">Skills</p>
                        <div className="flex flex-wrap gap-1">
                          {job.skills_required && job.skills_required.slice(0, 3).map((skill, idx) => (
                            <span key={idx} className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-primary/10 text-primary">
                              {skill}
                            </span>
                          ))}
                          {job.skills_required && job.skills_required.length > 3 && (
                            <span className="inline-flex items-center px-1.5 py-0.5 text-xs font-medium rounded-full bg-secondary text-secondary-foreground">
                              +{job.skills_required.length - 3}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center mt-1">
                        <div className="text-xs text-muted-foreground">
                          {formatDate(job.info_extract_date)}
                        </div>
                        <div className="flex space-x-1">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                                Details
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>{job.job_title}</DialogTitle>
                                <DialogDescription>
                                  {job.company} • {job.job_location}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div>
                                  <h3 className="text-lg font-medium">Job Details</h3>
                                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                    <div>
                                      <p className="text-sm font-medium">Job Family</p>
                                      <p className="text-sm">{job.job_family || "Not specified"}</p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Experience Required</p>
                                      <p className="text-sm">
                                        {job.min_years_required ? 
                                          `${job.min_years_required} - ${job.max_years_required || 'any'} years` : 
                                          "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Experience Preferred</p>
                                      <p className="text-sm">
                                        {job.min_years_preferred ? 
                                          `${job.min_years_preferred} - ${job.max_years_preferred || 'any'} years` : 
                                          "Not specified"}
                                      </p>
                                    </div>
                                    <div>
                                      <p className="text-sm font-medium">Degree</p>
                                      <p className="text-sm">
                                        {job.degree_required ? 
                                          `Required: ${job.degree_required}` : 
                                          job.degree_preferred ? 
                                            `Preferred: ${job.degree_preferred}` : 
                                            "Not specified"}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-lg font-medium">Skills</h3>
                                  <div className="mt-2">
                                    <p className="text-sm font-medium">Required Skills</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {job.skills_required && job.skills_required.length > 0 ? (
                                        job.skills_required.map((skill, idx) => (
                                          <span 
                                            key={idx} 
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-primary/10 text-primary"
                                          >
                                            {skill}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-sm text-muted-foreground">None specified</span>
                                      )}
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <p className="text-sm font-medium">Preferred Skills</p>
                                    <div className="flex flex-wrap gap-1 mt-1">
                                      {job.skills_preferred && job.skills_preferred.length > 0 ? (
                                        job.skills_preferred.map((skill, idx) => (
                                          <span 
                                            key={idx} 
                                            className="inline-flex items-center px-2 py-1 text-xs font-medium rounded-full bg-secondary text-secondary-foreground"
                                          >
                                            {skill}
                                          </span>
                                        ))
                                      ) : (
                                        <span className="text-sm text-muted-foreground">None specified</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                <div>
                                  <h3 className="text-lg font-medium">Additional Information</h3>
                                  <div className="mt-2">
                                    <p className="text-sm">
                                      Listed: {formatDate(job.info_extract_date)}
                                    </p>
                                    {job.extracted && (
                                      <div className="mt-4 p-4 bg-muted rounded-md">
                                        <p className="text-sm whitespace-pre-line">{job.extracted}</p>
                                      </div>
                                    )}
                                  </div>
                                </div>
                                
                                <div className="mt-2 flex justify-end">
                                  <a 
                                    href={job.url} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                                  >
                                    Apply on Company Website
                                  </a>
                                </div>
                              </div>
                            </DialogContent>
                          </Dialog>
                          <a 
                            href={job.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <Button size="sm" variant="default" className="h-7 px-2 text-xs">
                              Apply
                            </Button>
                          </a>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
          
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredJobs.length} of {jobs.length} job listings
          </div>
        </div>
      )}
    </main>
  );
}
