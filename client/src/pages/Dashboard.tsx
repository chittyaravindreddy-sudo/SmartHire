import { useEffect, useState } from "react";
import api from "../services/api";

interface Stats {
  totalJobs: number;
  openJobs: number;
  totalApplicants: number;
  selectedApplicants: number;
  rejectedApplicants: number;
  interviewApplicants: number;
  screeningApplicants: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.get("/dashboard/stats")
      .then((res) => setStats(res.data.stats))
      .catch(console.error);
  }, []);

  if (!stats) return <main className="page"><p>Loading dashboard...</p></main>;

  return (
    <main className="page">
      <h1>Recruiter Dashboard</h1>
      <p>Overview of your hiring activity.</p>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Jobs</h3>
          <strong>{stats.totalJobs}</strong>
        </div>

        <div className="stat-card">
          <h3>Open Jobs</h3>
          <strong>{stats.openJobs}</strong>
        </div>

        <div className="stat-card">
          <h3>Applicants</h3>
          <strong>{stats.totalApplicants}</strong>
        </div>

        <div className="stat-card">
          <h3>Interviews</h3>
          <strong>{stats.interviewApplicants}</strong>
        </div>

        <div className="stat-card">
          <h3>Selected</h3>
          <strong>{stats.selectedApplicants}</strong>
        </div>

        <div className="stat-card">
          <h3>Rejected</h3>
          <strong>{stats.rejectedApplicants}</strong>
        </div>
      </div>
    </main>
  );
}