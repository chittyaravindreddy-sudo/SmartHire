import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import api from "../services/api";

interface Job {
  _id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary?: string;
  jobType: string;
  status: string;
}

const emptyForm = {
  title: "",
  company: "",
  location: "",
  description: "",
  salary: "",
  jobType: "Full-time",
};

export default function Jobs() {
  const [jobSearch, setJobSearch] = useState("");

  const [jobs, setJobs] = useState<Job[]>([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/jobs");
      setJobs(data.jobs);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to load jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const submitJob = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setSaving(true);

      if (editingId) {
        await api.put(`/jobs/${editingId}`, form);
      } else {
        await api.post("/jobs", form);
      }

      setForm(emptyForm);
      setEditingId(null);
      await loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to save job");
    } finally {
      setSaving(false);
    }
  };

  const editJob = (job: Job) => {
    setEditingId(job._id);
    setForm({
      title: job.title,
      company: job.company,
      location: job.location,
      description: job.description,
      salary: job.salary || "",
      jobType: job.jobType,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Delete this job?")) return;

    try {
      await api.delete(`/jobs/${id}`);
      await loadJobs();
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to delete job");
    }
  };

  return (
    <main className="page">
      <div className="applicant-toolbar">
        <input
          placeholder="Search jobs by title, company or location..."
          value={jobSearch}
          onChange={(e) => setJobSearch(e.target.value)}
        />
      </div>

      <div className="page-header">
        <div>
          <h1>Jobs</h1>
          <p>Manage your job openings.</p>
        </div>
        <div className="page-count">{jobs.length} Jobs</div>
      </div>

      <form className="form-card" onSubmit={submitJob}>
        <h2>{editingId ? "Edit Job" : "Create New Job"}</h2>

        <input
          placeholder="Job title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
          required
        />

        <input
          placeholder="Company"
          value={form.company}
          onChange={(e) => setForm({ ...form, company: e.target.value })}
          required
        />

        <input
          placeholder="Location"
          value={form.location}
          onChange={(e) => setForm({ ...form, location: e.target.value })}
          required
        />

        <input
          placeholder="Salary"
          value={form.salary}
          onChange={(e) => setForm({ ...form, salary: e.target.value })}
        />

        <select
          value={form.jobType}
          onChange={(e) => setForm({ ...form, jobType: e.target.value })}
        >
          <option>Full-time</option>
          <option>Part-time</option>
          <option>Internship</option>
          <option>Contract</option>
        </select>

        <textarea
          placeholder="Job description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          required
        />

        <div className="form-actions">
          <button type="submit" disabled={saving}>
            {saving ? "Saving..." : editingId ? "Update Job" : "Create Job"}
          </button>

          {editingId && (
            <button
              type="button"
              className="secondary-button"
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
              }}
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      {loading ? (
        <div className="empty-state">Loading jobs...</div>
      ) : jobs.length === 0 ? (
        <div className="empty-state">
          <h2>No jobs yet</h2>
          <p>Create your first job above.</p>
        </div>
      ) : (
        <div className="cards">
          {jobs.filter((job) =>
              `${job.title} ${job.company} ${job.location}`
                .toLowerCase()
                .includes(jobSearch.toLowerCase())
            ).map((job) => (
            <div className="job-card" key={job._id}>
              <div className="job-top">
                <span className="status-badge">{job.status}</span>
              </div>

              <h2>{job.title}</h2>
              <p className="company-name">{job.company}</p>
              <p>Location: {job.location}</p>
              <p>
                {job.jobType}
                {job.salary ? ` - ${job.salary}` : ""}
              </p>
              <p className="description">{job.description}</p>

              <div className="card-actions">
                <button onClick={() => editJob(job)}>Edit</button>
                <button
                  className="danger-button"
                  onClick={() => deleteJob(job._id)}
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

