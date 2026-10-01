import { memo, useEffect, useMemo, useState } from "react";
import api from "../services/api";

type Applicant = {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  resume?: string;
  coverLetter?: string;
  status: "Applied" | "Screening" | "Interview" | "Selected" | "Rejected";
  job?: {
    _id: string;
    title: string;
    company: string;
  };
  createdAt?: string;
};

type Job = {
  _id: string;
  title: string;
  company: string;
};

const STATUS_OPTIONS = [
  "Applied",
  "Screening",
  "Interview",
  "Selected",
  "Rejected",
];

function Applicants() {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [job, setJob] = useState("");

  const [sort, setSort] = useState("createdAt");
  const [order, setOrder] = useState("desc");

  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    coverLetter: "",
    job: "",
  });

  const [resume, setResume] = useState<File | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const loadJobs = async () => {
    try {
      const { data } = await api.get("/jobs");
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    }
  };

  const loadApplicants = async () => {
    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }

      if (status) {
        params.set("status", status);
      }

      if (job) {
        params.set("job", job);
      }

      params.set("page", String(page));
      params.set("limit", "8");
      params.set("sort", sort);
      params.set("order", order);

      const { data } = await api.get(`/applicants?${params.toString()}`);

      setApplicants(data.applicants || []);
      setTotal(data.total || 0);
      setPages(data.pages || 1);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        "Failed to load applicants"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    loadApplicants();
  }, [debouncedSearch, status, job, page, sort, order]);

  const updateStatus = async (
    applicantId: string,
    newStatus: string
  ) => {
    try {
      await api.put(`/applicants/${applicantId}/status`, {
        status: newStatus,
      });

      await loadApplicants();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
        "Failed to update applicant status"
      );
    }
  };

  const deleteApplicant = async (applicantId: string) => {
    if (!window.confirm("Delete this applicant?")) {
      return;
    }

    try {
      await api.delete(`/applicants/${applicantId}`);
      await loadApplicants();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
        "Failed to delete applicant"
      );
    }
  };

  const submitApplicant = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!form.job) {
      alert("Please select a job");
      return;
    }

    try {
      setSaving(true);

      const { data } = await api.post("/applicants", {
        name: form.name,
        email: form.email,
        phone: form.phone,
        coverLetter: form.coverLetter,
        job: form.job,
      });

      const applicantId = data.applicant?._id;

      if (resume && applicantId) {
        if (resume.type !== "application/pdf") {
          alert("Only PDF resumes are allowed.");
          setSaving(false);
          return;
        }

        if (resume.size > 5 * 1024 * 1024) {
          alert("Resume must be smaller than 5 MB.");
          setSaving(false);
          return;
        }

        const formData = new FormData();
        formData.append("resume", resume);

        await api.post(
          `/applicants/${applicantId}/resume`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          }
        );
      }

      setForm({
        name: "",
        email: "",
        phone: "",
        coverLetter: "",
        job: "",
      });

      setResume(null);
      setShowForm(false);
      setPage(1);

      await loadApplicants();
    } catch (err: any) {
      alert(
        err.response?.data?.message ||
        "Failed to add applicant"
      );
    } finally {
      setSaving(false);
    }
  };

  const exportCSV = () => {
    if (!applicants.length) {
      alert("No applicants to export.");
      return;
    }

    const headers = [
      "Name",
      "Email",
      "Phone",
      "Job",
      "Company",
      "Status",
      "Applied Date",
    ];

    const rows = applicants.map((applicant) => [
      applicant.name,
      applicant.email,
      applicant.phone || "",
      applicant.job?.title || "",
      applicant.job?.company || "",
      applicant.status,
      applicant.createdAt
        ? new Date(applicant.createdAt).toLocaleDateString()
        : "",
    ]);

    const csv = [
      headers,
      ...rows,
    ]
      .map((row) =>
        row
          .map((value) =>
            `"${String(value).replace(/"/g, '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "smarthire-applicants.csv";
    link.click();

    URL.revokeObjectURL(url);
  };

  const showingText = useMemo(() => {
    if (!total) return "0 applicants";

    const start = (page - 1) * 8 + 1;
    const end = Math.min(page * 8, total);

    return `Showing ${start}-${end} of ${total}`;
  }, [page, total]);

  return (
    <main className="page">

      <div className="page-header">
        <div>
          <h1>Applicants</h1>
          <p>Manage candidates and track hiring progress.</p>
        </div>

        <div className="applicant-header-actions">
          <button
            className="secondary-button"
            onClick={exportCSV}
          >
            Export CSV
          </button>

          <button
            onClick={() => setShowForm(!showForm)}
          >
            {showForm ? "Close Form" : "+ Add Applicant"}
          </button>
        </div>
      </div>

      {showForm && (
        <form
          className="form-card applicant-form"
          onSubmit={submitApplicant}
        >
          <h2>Add Applicant</h2>

          <div className="form-grid">
            <input
              placeholder="Full Name"
              value={form.name}
              onChange={(e) =>
                setForm({
                  ...form,
                  name: e.target.value,
                })
              }
              required
            />

            <input
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) =>
                setForm({
                  ...form,
                  email: e.target.value,
                })
              }
              required
            />

            <input
              placeholder="Phone"
              value={form.phone}
              onChange={(e) =>
                setForm({
                  ...form,
                  phone: e.target.value,
                })
              }
            />

            <select
              value={form.job}
              onChange={(e) =>
                setForm({
                  ...form,
                  job: e.target.value,
                })
              }
              required
            >
              <option value="">Select Job</option>

              {jobs.map((item) => (
                <option
                  key={item._id}
                  value={item._id}
                >
                  {item.title} — {item.company}
                </option>
              ))}
            </select>
          </div>

          <textarea
            placeholder="Cover Letter"
            value={form.coverLetter}
            onChange={(e) =>
              setForm({
                ...form,
                coverLetter: e.target.value,
              })
            }
            rows={5}
          />

          <label className="file-upload">
            <strong>Resume PDF</strong>
            <span>Maximum 5 MB</span>

            <input
              type="file"
              accept="application/pdf,.pdf"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;

                if (!file) {
                  setResume(null);
                  return;
                }

                if (file.type !== "application/pdf") {
                  alert("Only PDF files are allowed.");
                  e.target.value = "";
                  setResume(null);
                  return;
                }

                if (file.size > 5 * 1024 * 1024) {
                  alert("Resume must be smaller than 5 MB.");
                  e.target.value = "";
                  setResume(null);
                  return;
                }

                setResume(file);
              }}
            />
          </label>

          {resume && (
            <p className="file-name">
              Selected: {resume.name}
            </p>
          )}

          <div className="form-actions">
            <button
              type="submit"
              disabled={saving}
            >
              {saving ? "Saving..." : "Add Applicant"}
            </button>

            <button
              type="button"
              className="secondary-button"
              onClick={() => setShowForm(false)}
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="applicant-toolbar">

        <input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
        />

        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Statuses</option>

          {STATUS_OPTIONS.map((item) => (
            <option
              key={item}
              value={item}
            >
              {item}
            </option>
          ))}
        </select>

        <select
          value={job}
          onChange={(e) => {
            setJob(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Jobs</option>

          {jobs.map((item) => (
            <option
              key={item._id}
              value={item._id}
            >
              {item.title}
            </option>
          ))}
        </select>

        <select
          value={`${sort}-${order}`}
          onChange={(e) => {
            const [newSort, newOrder] =
              e.target.value.split("-");

            setSort(newSort);
            setOrder(newOrder);
            setPage(1);
          }}
        >
          <option value="createdAt-desc">
            Newest First
          </option>

          <option value="createdAt-asc">
            Oldest First
          </option>

          <option value="name-asc">
            Name A-Z
          </option>

          <option value="name-desc">
            Name Z-A
          </option>

          <option value="email-asc">
            Email A-Z
          </option>
        </select>

      </div>

      {error && (
        <div className="error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="empty-state">
          <h3>Loading applicants...</h3>
          <p>Please wait.</p>
        </div>
      ) : applicants.length === 0 ? (
        <div className="empty-state">
          <h3>No applicants found</h3>
          <p>
            Add an applicant or change your filters.
          </p>
        </div>
      ) : (
        <>
          <div className="applicant-grid">
            {applicants.map((applicant) => (
              <article
                className="card applicant-card"
                key={applicant._id}
              >
                <div className="applicant-header">

                  <div>
                    <h2>{applicant.name}</h2>

                    <p>{applicant.email}</p>

                    {applicant.phone && (
                      <p>{applicant.phone}</p>
                    )}
                  </div>

                  <span
                    className={`applicant-status ${applicant.status.toLowerCase()}`}
                  >
                    {applicant.status}
                  </span>

                </div>

                <hr />

                <p>
                  <strong>Job:</strong>{" "}
                  {applicant.job?.title || "N/A"}
                </p>

                <p>
                  <strong>Company:</strong>{" "}
                  {applicant.job?.company || "N/A"}
                </p>

                {applicant.createdAt && (
                  <p>
                    <strong>Applied:</strong>{" "}
                    {new Date(
                      applicant.createdAt
                    ).toLocaleDateString()}
                  </p>
                )}

                {applicant.resume && (
                  <a
                    className="resume-link"
                    href={
                      applicant.resume.startsWith("http")
                        ? applicant.resume
                        : `http://localhost:5000${applicant.resume}`
                    }
                    target="_blank"
                    rel="noreferrer"
                  >
                    View Resume PDF
                  </a>
                )}

                <label>
                  Update Status
                </label>

                <select
                  value={applicant.status}
                  onChange={(e) =>
                    updateStatus(
                      applicant._id,
                      e.target.value
                    )
                  }
                >
                  {STATUS_OPTIONS.map((item) => (
                    <option
                      key={item}
                      value={item}
                    >
                      {item}
                    </option>
                  ))}
                </select>

                <div className="card-actions">
                  <button
                    className="danger-button"
                    onClick={() =>
                      deleteApplicant(
                        applicant._id
                      )
                    }
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>

          <div className="pagination">

            <button
              className="secondary-button"
              disabled={page <= 1}
              onClick={() =>
                setPage((value) => value - 1)
              }
            >
              ← Previous
            </button>

            <span>
              Page {page} of {pages}
            </span>

            <button
              className="secondary-button"
              disabled={page >= pages}
              onClick={() =>
                setPage((value) => value + 1)
              }
            >
              Next →
            </button>

          </div>

          <p className="page-count-text">
            {showingText}
          </p>
        </>
      )}
    </main>
  );
}

export default memo(Applicants);
