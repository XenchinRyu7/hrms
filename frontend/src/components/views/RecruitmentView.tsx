import React, { useEffect, useState } from 'react';
import {
  Briefcase,
  UserPlus,
  Star,
  ChevronRight,
  Mail,
  Phone,
  FileText,
  MapPin,
  Clock,
  Plus,
  CheckCircle,
  X,
} from 'lucide-react';
import {
  Button,
  Badge,
  Input,
} from '@etherealui/react';
import { api } from '../../lib/api';
import { useAuth } from '../../lib/auth-context';
import type { JobPosting, Applicant } from '../../lib/types';

const STAGES = [
  { id: 'applied', label: 'Applied', color: 'border-blue-500/30 bg-blue-500/5' },
  { id: 'screening', label: 'Screening', color: 'border-amber-500/30 bg-amber-500/5' },
  { id: 'interview', label: 'Interview', color: 'border-purple-500/30 bg-purple-500/5' },
  { id: 'offer', label: 'Offer Stage', color: 'border-emerald-500/30 bg-emerald-500/5' },
  { id: 'hired', label: 'Hired', color: 'border-primary/40 bg-primary/10' },
];

export function RecruitmentView() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<JobPosting[]>([]);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedJob, setSelectedJob] = useState<string>('');
  const [loading, setLoading] = useState(true);

  // New Candidate Modal
  const [isCandidateModalOpen, setIsCandidateModalOpen] = useState(false);
  const [newCandidate, setNewCandidate] = useState({
    job_id: '',
    full_name: '',
    email: '',
    phone: '',
    rating: 5,
    notes: '',
  });

  // New Job Modal
  const [isJobModalOpen, setIsJobModalOpen] = useState(false);
  const [newJob, setNewJob] = useState({
    title: '',
    location: 'Hybrid (Jakarta)',
    employment_type: 'Full-time',
    experience_level: 'Senior',
    salary_range: 'Rp 20.000.000 - Rp 35.000.000',
    description: '',
    requirements: '',
  });

  const loadData = async () => {
    try {
      const [jobList, appList] = await Promise.all([
        api.getJobPostings(),
        api.getApplicants({ job_id: selectedJob || undefined }),
      ]);
      setJobs(jobList);
      setApplicants(appList);
      if (jobList.length > 0 && !newCandidate.job_id) {
        setNewCandidate((prev) => ({ ...prev, job_id: jobList[0].id }));
      }
    } catch (err) {
      console.error('Failed to load recruitment data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedJob]);

  const handleStageChange = async (applicantId: string, nextStage: string) => {
    try {
      await api.updateApplicantStage(applicantId, nextStage);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to move candidate');
    }
  };

  const handleCreateCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createApplicant({
        ...newCandidate,
        stage: 'applied',
      });
      setIsCandidateModalOpen(false);
      setNewCandidate({
        job_id: jobs[0]?.id || '',
        full_name: '',
        email: '',
        phone: '',
        rating: 5,
        notes: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to add applicant');
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createJobPosting({
        ...newJob,
        status: 'published',
      });
      setIsJobModalOpen(false);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create job');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs uppercase tracking-wider font-semibold text-primary">Talent Acquisition</span>
            <span className="text-muted-foreground">&bull;</span>
            <span className="text-xs text-muted-foreground">{applicants.length} Active Candidates</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Recruitment & Hiring Pipeline
          </h1>
          <p className="text-xs text-muted-foreground">
            End-to-end ATS workflow, candidate stage tracking, and requisition management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsJobModalOpen(true)}
            className="text-xs flex items-center gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Post Opening</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCandidateModalOpen(true)}
            className="text-xs flex items-center gap-1.5 shadow-md shadow-primary/20"
          >
            <UserPlus className="h-3.5 w-3.5" />
            <span>Add Candidate</span>
          </Button>
        </div>
      </div>

      {/* Active Job Postings Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {jobs.map((job) => (
          <div
            key={job.id}
            onClick={() => setSelectedJob(selectedJob === job.id ? '' : job.id)}
            className={`p-4 rounded-2xl border transition cursor-pointer ${
              selectedJob === job.id
                ? 'border-primary bg-primary/5 shadow-md'
                : 'border-border bg-card hover:bg-muted/20 shadow-sm'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-foreground text-sm">{job.title}</span>
              <Badge variant="primary" className="text-[10px]">
                {job.applicant_count || 0} Candidates
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1 line-clamp-1">{job.description}</p>
            <div className="flex items-center gap-3 text-[11px] text-muted-foreground mt-3 pt-2 border-t border-border">
              <span className="flex items-center gap-1">
                <MapPin className="h-3 w-3" />
                <span>{job.location}</span>
              </span>
              <span className="flex items-center gap-1">
                <Briefcase className="h-3 w-3" />
                <span>{job.experience_level}</span>
              </span>
              <span className="font-mono text-foreground font-medium">{job.salary_range}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Kanban Pipeline Board */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div>
            <h2 className="text-base font-bold text-card-foreground">Applicant Stage Pipeline</h2>
            <p className="text-xs text-muted-foreground">Click arrow buttons to advance candidates through stages</p>
          </div>
          {selectedJob && (
            <Button size="sm" variant="outline" onClick={() => setSelectedJob('')} className="text-xs h-7">
              Clear Filter
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
          {STAGES.map((col, colIdx) => {
            const stageApplicants = applicants.filter((a) => a.stage === col.id);
            return (
              <div key={col.id} className="rounded-xl border border-border bg-muted/20 p-3 space-y-3 flex flex-col">
                <div className="flex items-center justify-between pb-2 border-b border-border">
                  <span className="font-bold text-xs text-foreground">{col.label}</span>
                  <span className="h-5 w-5 rounded-full bg-card border border-border flex items-center justify-center font-mono text-[10px] text-muted-foreground">
                    {stageApplicants.length}
                  </span>
                </div>

                <div className="space-y-2.5 flex-1">
                  {stageApplicants.map((app) => (
                    <div
                      key={app.id}
                      className="p-3 rounded-xl border border-border bg-card shadow-xs space-y-2 hover:border-primary/40 transition"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-xs text-foreground">{app.full_name}</span>
                        <div className="flex items-center text-amber-400 text-[10px]">
                          <Star className="h-3 w-3 fill-current" />
                          <span className="ml-0.5">{app.rating}</span>
                        </div>
                      </div>

                      <p className="text-[11px] text-muted-foreground truncate">{app.job_title || 'Software Engineering'}</p>

                      <div className="space-y-0.5 text-[10px] text-muted-foreground font-mono">
                        <div className="flex items-center gap-1">
                          <Mail className="h-2.5 w-2.5" />
                          <span className="truncate">{app.email}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Phone className="h-2.5 w-2.5" />
                          <span>{app.phone || 'N/A'}</span>
                        </div>
                      </div>

                      {app.notes && (
                        <p className="text-[10px] text-muted-foreground bg-muted/40 p-1.5 rounded-lg line-clamp-2">
                          "{app.notes}"
                        </p>
                      )}

                      {/* Advance Stage Control */}
                      <div className="pt-2 border-t border-border flex items-center justify-between">
                        {colIdx > 0 ? (
                          <button
                            onClick={() => handleStageChange(app.id, STAGES[colIdx - 1].id)}
                            className="text-[10px] text-muted-foreground hover:text-foreground cursor-pointer"
                          >
                            &larr; Back
                          </button>
                        ) : <span />}

                        {colIdx < STAGES.length - 1 && (
                          <Button
                            size="sm"
                            variant="primary"
                            onClick={() => handleStageChange(app.id, STAGES[colIdx + 1].id)}
                            className="h-6 px-2 text-[10px] flex items-center gap-1"
                          >
                            <span>Next</span>
                            <ChevronRight className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageApplicants.length === 0 && (
                    <div className="py-6 text-center text-[11px] text-muted-foreground">
                      No candidates in {col.label}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Candidate Modal */}
      {isCandidateModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-card-foreground">Add New Applicant</h2>
              <button onClick={() => setIsCandidateModalOpen(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateCandidate} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Target Requisition *</label>
                <select
                  required
                  value={newCandidate.job_id}
                  onChange={(e) => setNewCandidate({ ...newCandidate, job_id: e.target.value })}
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2.5 text-foreground"
                >
                  {jobs.map((j) => (
                    <option key={j.id} value={j.id}>{j.title}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Candidate Full Name *</label>
                <Input
                  required
                  value={newCandidate.full_name}
                  onChange={(e) => setNewCandidate({ ...newCandidate, full_name: e.target.value })}
                  placeholder="e.g. Raditya Dika"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Email Address *</label>
                  <Input
                    type="email"
                    required
                    value={newCandidate.email}
                    onChange={(e) => setNewCandidate({ ...newCandidate, email: e.target.value })}
                    placeholder="candidate@gmail.com"
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Phone</label>
                  <Input
                    value={newCandidate.phone}
                    onChange={(e) => setNewCandidate({ ...newCandidate, phone: e.target.value })}
                    placeholder="+62 8..."
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Interviewer Evaluation Notes</label>
                <textarea
                  rows={2}
                  value={newCandidate.notes}
                  onChange={(e) => setNewCandidate({ ...newCandidate, notes: e.target.value })}
                  placeholder="Key technical proficiencies, culture add..."
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2 text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsCandidateModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Save Candidate</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Job Requisition Modal */}
      {isJobModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <h2 className="text-base font-bold text-card-foreground">Post Job Opening</h2>
              <button onClick={() => setIsJobModalOpen(false)}>
                <X className="h-4 w-4 text-muted-foreground" />
              </button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Job Title *</label>
                <Input
                  required
                  value={newJob.title}
                  onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                  placeholder="e.g. Lead Security Architect"
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Location</label>
                  <Input
                    value={newJob.location}
                    onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">Salary Range</label>
                  <Input
                    value={newJob.salary_range}
                    onChange={(e) => setNewJob({ ...newJob, salary_range: e.target.value })}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground">Role Description</label>
                <textarea
                  rows={2}
                  value={newJob.description}
                  onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                  placeholder="Key responsibilities and goals..."
                  className="w-full text-xs rounded-xl border border-border bg-muted/40 p-2 text-foreground"
                />
              </div>

              <div className="pt-3 border-t border-border flex justify-end gap-2">
                <Button type="button" variant="outline" size="sm" onClick={() => setIsJobModalOpen(false)}>Cancel</Button>
                <Button type="submit" variant="primary" size="sm">Publish Opening</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
