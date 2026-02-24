import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import "./PatientDashboard.css";

const PATIENT = {
  id: "MED-2024-04821",
  name: "Arjun Sharma",
  age: 28,
  blood: "B+",
  weight: "72 kg",
  height: "5'10\"",
  allergies: "Penicillin",
  lastVisit: "12 Feb 2025",
};

const REPORTS = [
  { id: 1, name: "Blood Test Report", date: "10 Feb 2025", type: "Lab" },
  { id: 2, name: "Chest X-Ray",       date: "28 Jan 2025", type: "Radiology" },
  { id: 3, name: "ECG Report",        date: "15 Jan 2025", type: "Cardiology" },
];

const PRESCRIPTIONS = [
  { id: "RX-8821", doctor: "Dr. Priya Mehta", date: "12 Feb 2025", diagnosis: "Viral Fever",   medicines: ["Paracetamol 500mg", "Cetirizine 10mg", "Vitamin C"] },
  { id: "RX-7734", doctor: "Dr. Ravi Kumar",  date: "15 Jan 2025", diagnosis: "Hypertension",  medicines: ["Amlodipine 5mg", "Losartan 50mg"] },
];

const MEDICINES = [
  { name: "Paracetamol 500mg", rx: "RX-8821", date: "12 Feb 2025", status: "Dispensed" },
  { name: "Cetirizine 10mg",   rx: "RX-8821", date: "12 Feb 2025", status: "Dispensed" },
  { name: "Amlodipine 5mg",    rx: "RX-7734", date: "15 Jan 2025", status: "Pending"   },
  { name: "Losartan 50mg",     rx: "RX-7734", date: "15 Jan 2025", status: "Pending"   },
];

const NAV_ITEMS = [
  { key: "overview",       label: "Overview"        },
  { key: "reports",        label: "My Reports"      },
  { key: "prescriptions",  label: "Prescriptions"   },
  { key: "medicines",      label: "Medicine History" },
  { key: "profile",        label: "Profile"         },
];

export default function PatientDashboard() {
  const [active, setActive]     = useState("overview");
  const [expandRx, setExpandRx] = useState(null);

  const navRef      = useRef(null);
  const mainRef     = useRef(null);
  const cardsRef    = useRef([]);
  cardsRef.current  = [];

  const addCard = (el) => { if (el) cardsRef.current.push(el); };

  // ── Navbar entrance ──
  useEffect(() => {
    gsap.fromTo(navRef.current,
      { y: -50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" }
    );
  }, []);

  // ── Page content transition ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Fade + slide the whole section
      gsap.fromTo(mainRef.current,
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" }
      );

      // Stagger individual cards
      if (cardsRef.current.length) {
        gsap.fromTo(cardsRef.current,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: 0.15 }
        );
      }
    });
    return () => ctx.revert();
  }, [active]);

  return (
    <div className="pd-root">
      <div className="dot-grid" aria-hidden="true" />

      {/* ── Navbar ── */}
      <nav className="pd-navbar" ref={navRef}>
        {/* Brand */}
        <div className="pd-brand">
          <span className="pd-brand-name">Pulse</span>
          <span className="pd-brand-tag">Patient</span>
        </div>

        {/* Nav Links */}
        <div className="pd-nav-links">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              className={`pd-nav-link ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}
            >
              {item.label}
              {active === item.key && <span className="pd-nav-dot" />}
            </button>
          ))}
        </div>

        {/* Logout */}
        <button className="pd-logout-btn">Logout</button>
      </nav>

      {/* ── Main ── */}
      <main className="pd-main" ref={mainRef}>

        {/* ══ OVERVIEW ══ */}
        {active === "overview" && (
          <section className="pd-section">
            <h1 className="pd-page-title">Overview</h1>

            <div className="pd-id-card" ref={addCard}>
              <div className="pd-id-left">
                <div className="pd-avatar">{PATIENT.name.charAt(0)}</div>
                <div>
                  <p className="pd-id-name">{PATIENT.name}</p>
                  <p className="pd-id-sub">{PATIENT.id}</p>
                </div>
              </div>
              <span className="pd-active-badge">Active</span>
            </div>

            <div className="pd-stats-grid">
              {[
                { label: "Blood Group", value: PATIENT.blood },
                { label: "Age",         value: PATIENT.age + " yrs" },
                { label: "Weight",      value: PATIENT.weight },
                { label: "Height",      value: PATIENT.height },
                { label: "Allergies",   value: PATIENT.allergies },
                { label: "Last Visit",  value: PATIENT.lastVisit },
              ].map((s) => (
                <div className="pd-stat-card" ref={addCard} key={s.label}>
                  <p className="pd-stat-label">{s.label}</p>
                  <p className="pd-stat-value">{s.value}</p>
                </div>
              ))}
            </div>

            <h2 className="pd-sub-title">Recent Prescription</h2>
            <div className="pd-rx-card-plain" ref={addCard}>
              <div className="pd-rx-top">
                <span className="pd-rx-id">{PRESCRIPTIONS[0].id}</span>
                <span className="pd-rx-date">{PRESCRIPTIONS[0].date}</span>
              </div>
              <p className="pd-rx-doctor">by {PRESCRIPTIONS[0].doctor}</p>
              <p className="pd-rx-diagnosis">{PRESCRIPTIONS[0].diagnosis}</p>
              <div className="pd-pills-row">
                {PRESCRIPTIONS[0].medicines.map((m) => (
                  <span className="pd-pill" key={m}>{m}</span>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ══ MY REPORTS ══ */}
        {active === "reports" && (
          <section className="pd-section">
            <div className="pd-section-top">
              <h1 className="pd-page-title">My Reports</h1>
              <label className="pd-upload-btn">
                ↑ Upload Report
                <input type="file" hidden accept=".pdf,.jpg,.png" />
              </label>
            </div>

            {REPORTS.map((r) => (
              <div className="pd-report-card" ref={addCard} key={r.id}>
                <div className="pd-report-icon">📄</div>
                <div className="pd-report-info">
                  <p className="pd-report-name">{r.name}</p>
                  <p className="pd-report-meta">{r.type} · {r.date}</p>
                </div>
                <div className="pd-report-actions">
                  <button className="pd-action-btn view">View</button>
                  <button className="pd-action-btn delete">Delete</button>
                </div>
              </div>
            ))}
          </section>
        )}

        {/* ══ PRESCRIPTIONS ══ */}
        {active === "prescriptions" && (
          <section className="pd-section">
            <h1 className="pd-page-title">Prescriptions</h1>

            {PRESCRIPTIONS.map((rx) => (
              <div className="pd-rx-accordion" ref={addCard} key={rx.id}>
                <div
                  className="pd-rx-acc-header"
                  onClick={() => setExpandRx(expandRx === rx.id ? null : rx.id)}
                >
                  <div>
                    <span className="pd-rx-id">{rx.id}</span>
                    <p className="pd-rx-diagnosis">{rx.diagnosis}</p>
                    <p className="pd-rx-doctor">by {rx.doctor} · {rx.date}</p>
                  </div>
                  <span className="pd-toggle">{expandRx === rx.id ? "▲" : "▼"}</span>
                </div>

                {expandRx === rx.id && (
                  <div className="pd-rx-acc-body">
                    <p className="pd-rx-detail-label">Medicines</p>
                    <div className="pd-pills-row">
                      {rx.medicines.map((m) => <span className="pd-pill" key={m}>{m}</span>)}
                    </div>
                    <button className="pd-download-btn" disabled>⬇ Download PDF  <span className="pd-soon">Soon</span></button>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ══ MEDICINE HISTORY ══ */}
        {active === "medicines" && (
          <section className="pd-section">
            <h1 className="pd-page-title">Medicine History</h1>

            <div className="pd-table" ref={addCard}>
              <div className="pd-table-head">
                <span>Medicine</span>
                <span>Prescription</span>
                <span>Date</span>
                <span>Status</span>
              </div>
              {MEDICINES.map((m, i) => (
                <div className="pd-table-row" key={i}>
                  <span className="pd-med-name">{m.name}</span>
                  <span className="pd-med-rx">{m.rx}</span>
                  <span className="pd-med-date">{m.date}</span>
                  <span className={`pd-badge ${m.status === "Dispensed" ? "dispensed" : "pending"}`}>
                    {m.status}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ══ PROFILE ══ */}
        {active === "profile" && (
          <section className="pd-section">
            <h1 className="pd-page-title">Profile</h1>

            <div className="pd-profile-card" ref={addCard}>
              <div className="pd-profile-avatar">{PATIENT.name.charAt(0)}</div>
              <div className="pd-profile-fields">
                {[
                  { label: "Full Name",   value: PATIENT.name },
                  { label: "Patient ID",  value: PATIENT.id },
                  { label: "Age",         value: PATIENT.age + " years" },
                  { label: "Blood Group", value: PATIENT.blood },
                  { label: "Weight",      value: PATIENT.weight },
                  { label: "Height",      value: PATIENT.height },
                  { label: "Allergies",   value: PATIENT.allergies },
                ].map((f) => (
                  <div className="pd-field" key={f.label}>
                    <label className="pd-field-label">{f.label}</label>
                    <input className="pd-field-input" defaultValue={f.value} readOnly />
                  </div>
                ))}
                <button className="pd-edit-btn">Edit Profile</button>
              </div>
            </div>
          </section>
        )}

      </main>
    </div>
  );
}