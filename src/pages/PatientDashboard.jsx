import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { QRCodeSVG } from "qrcode.react";
import "../css/PatientDashboard.css";

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

/* QR payload — encodes patient ID so doctor/pharmacist scanner resolves it */
const QR_PAYLOAD = JSON.stringify({ type: "MEDICARD_PATIENT", id: PATIENT.id, name: PATIENT.name });

const REPORTS = [
  {
    id: 1, name: "Blood Test Report", date: "10 Feb 2025", type: "Lab",
    doctor: "Dr. Priya Mehta", hospital: "Apollo Diagnostics, Mumbai", status: "Normal",
    summary: "Complete Blood Count (CBC) performed. All major parameters within normal range. Mild Vitamin D deficiency noted.",
    findings: [
      { label: "Haemoglobin",       value: "13.8 g/dL",   range: "13.0 – 17.0",   flag: ""    },
      { label: "WBC Count",         value: "7,200 /µL",   range: "4,000 – 11,000",flag: ""    },
      { label: "Platelet Count",    value: "2.1 L /µL",   range: "1.5 – 4.0 L",   flag: ""    },
      { label: "Fasting Glucose",   value: "92 mg/dL",    range: "70 – 100",       flag: ""    },
      { label: "Vitamin D",         value: "18 ng/mL",    range: "> 30",           flag: "Low" },
      { label: "Total Cholesterol", value: "174 mg/dL",   range: "< 200",          flag: ""    },
    ],
    advice: "Supplement with Vitamin D3 60,000 IU weekly for 8 weeks. Repeat test after 3 months.",
  },
  {
    id: 2, name: "Chest X-Ray", date: "28 Jan 2025", type: "Radiology",
    doctor: "Dr. Sandeep Kulkarni", hospital: "Fortis Radiology Centre, Pune", status: "Normal",
    summary: "PA view chest X-ray performed. Lungs appear clear. No active lesions or pleural effusion detected.",
    findings: [
      { label: "Lung Fields",   value: "Clear",         range: "Clear",  flag: "" },
      { label: "Heart Size",    value: "Normal",        range: "Normal", flag: "" },
      { label: "Diaphragm",     value: "Normal",        range: "Normal", flag: "" },
      { label: "Pleural Space", value: "No effusion",   range: "None",   flag: "" },
      { label: "Mediastinum",   value: "Not widened",   range: "Normal", flag: "" },
      { label: "Bony Thorax",   value: "Intact",        range: "Intact", flag: "" },
    ],
    advice: "No immediate follow-up required. Annual screening recommended.",
  },
  {
    id: 3, name: "ECG Report", date: "15 Jan 2025", type: "Cardiology",
    doctor: "Dr. Ravi Kumar", hospital: "Narayana Heart Centre, Bengaluru", status: "Borderline",
    summary: "12-lead ECG recorded at rest. Sinus rhythm present. Mild ST-segment changes noted in V3–V4.",
    findings: [
      { label: "Heart Rate",       value: "78 bpm",         range: "60 – 100",    flag: ""        },
      { label: "Rhythm",           value: "Sinus Rhythm",   range: "Sinus",       flag: ""        },
      { label: "PR Interval",      value: "162 ms",         range: "120 – 200",   flag: ""        },
      { label: "QRS Duration",     value: "94 ms",          range: "< 120",       flag: ""        },
      { label: "QT / QTc",         value: "388 / 443 ms",   range: "< 460 ms",    flag: ""        },
      { label: "ST Segment V3–V4", value: "Mild elevation", range: "Isoelectric", flag: "Monitor" },
    ],
    advice: "Benign early repolarisation variant likely. Follow-up Echo recommended in 4 weeks.",
  },
];

const PRESCRIPTIONS = [
  { id: "RX-8821", doctor: "Dr. Priya Mehta", date: "12 Feb 2025", diagnosis: "Viral Fever",
    medicines: ["Paracetamol 500mg", "Cetirizine 10mg", "Vitamin C"] },
  { id: "RX-7734", doctor: "Dr. Ravi Kumar",  date: "15 Jan 2025", diagnosis: "Hypertension",
    medicines: ["Amlodipine 5mg", "Losartan 50mg"] },
];

const MEDICINES = [
  { name: "Paracetamol 500mg", rx: "RX-8821", date: "12 Feb 2025", status: "Dispensed" },
  { name: "Cetirizine 10mg",   rx: "RX-8821", date: "12 Feb 2025", status: "Dispensed" },
  { name: "Amlodipine 5mg",    rx: "RX-7734", date: "15 Jan 2025", status: "Pending"   },
  { name: "Losartan 50mg",     rx: "RX-7734", date: "15 Jan 2025", status: "Pending"   },
];

const NAV_ITEMS = [
  { key: "overview",      label: "Overview"         },
  { key: "reports",       label: "My Reports"       },
  { key: "prescriptions", label: "Prescriptions"    },
  { key: "medicines",     label: "Medicine History" },
  { key: "profile",       label: "Profile"          },
];

export default function PatientDashboard() {
  const [active, setActive]       = useState("overview");
  const [expandRx, setExpandRx]   = useState(null);
  const [viewingReport, setViewing] = useState(null);
  const [showQR, setShowQR]       = useState(false);

  const navRef      = useRef(null);
  const mainRef     = useRef(null);
  const cardsRef    = useRef([]);
  const modalRef    = useRef(null);
  const modalBoxRef = useRef(null);
  const qrModalRef  = useRef(null);
  const qrBoxRef    = useRef(null);
  cardsRef.current  = [];

  const addCard = (el) => { if (el) cardsRef.current.push(el); };

  const openReport = (report) => setViewing(report);
  const closeReport = () => {
    gsap.to(modalBoxRef.current, { y: 40, opacity: 0, duration: 0.3, ease: "power2.in", onComplete: () => setViewing(null) });
    gsap.to(modalRef.current,    { opacity: 0, duration: 0.3, ease: "power2.in" });
  };

  const openQR = () => setShowQR(true);
  const closeQR = () => {
    gsap.to(qrBoxRef.current,   { y: 30, opacity: 0, duration: 0.25, ease: "power2.in", onComplete: () => setShowQR(false) });
    gsap.to(qrModalRef.current, { opacity: 0, duration: 0.25 });
  };

  useEffect(() => {
    gsap.fromTo(navRef.current, { y: -50, opacity: 0 }, { y: 0, opacity: 1, duration: 0.9, ease: "power3.out" });
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(mainRef.current, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: 0.5, ease: "power2.out" });
      if (cardsRef.current.length) {
        gsap.fromTo(cardsRef.current,
          { opacity: 0, y: 30, scale: 0.97 },
          { opacity: 1, y: 0, scale: 1, duration: 0.45, stagger: 0.08, ease: "power2.out", delay: 0.15 }
        );
      }
    });
    return () => ctx.revert();
  }, [active]);

  useEffect(() => {
    if (viewingReport && modalRef.current && modalBoxRef.current) {
      gsap.fromTo(modalRef.current,    { opacity: 0 },         { opacity: 1, duration: 0.3 });
      gsap.fromTo(modalBoxRef.current, { y: 60, opacity: 0 },  { y: 0, opacity: 1, duration: 0.45, ease: "power3.out" });
    }
  }, [viewingReport]);

  useEffect(() => {
    if (showQR && qrModalRef.current && qrBoxRef.current) {
      gsap.fromTo(qrModalRef.current, { opacity: 0 },        { opacity: 1, duration: 0.25 });
      gsap.fromTo(qrBoxRef.current,   { y: 40, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.4)" });
    }
  }, [showQR]);

  return (
    <div className="pd-root">
      <div className="dot-grid" aria-hidden="true" />

      <nav className="pd-navbar" ref={navRef}>
        <div className="pd-brand">
          <span className="pd-brand-name">Pulse</span>
          <span className="pd-brand-tag">Patient</span>
        </div>
        <div className="pd-nav-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.key}
              className={`pd-nav-link ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}>
              {item.label}
              {active === item.key && <span className="pd-nav-dot" />}
            </button>
          ))}
        </div>
        <button className="pd-logout-btn">Logout</button>
      </nav>

      <main className="pd-main" ref={mainRef}>

        {/* ══ OVERVIEW ══ */}
        {active === "overview" && (
          <section className="pd-section">
            <h1 className="pd-page-title">Overview</h1>

            {/* ID card with QR trigger */}
            <div className="pd-id-card" ref={addCard}>
              <div className="pd-id-left">
                <div className="pd-avatar">{PATIENT.name.charAt(0)}</div>
                <div>
                  <p className="pd-id-name">{PATIENT.name}</p>
                  <p className="pd-id-sub">{PATIENT.id}</p>
                </div>
              </div>
              <div className="pd-id-right">
                <span className="pd-active-badge">Active</span>
                {/* QR button */}
                <button className="pd-qr-btn" onClick={openQR}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                    <rect x="3" y="14" width="7" height="7"/>
                    <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                  </svg>
                  My QR
                </button>
              </div>
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
            </div>
            {REPORTS.map((r) => (
              <div className="pd-report-card" ref={addCard} key={r.id}>
                <div className="pd-report-icon">📄</div>
                <div className="pd-report-info">
                  <p className="pd-report-name">{r.name}</p>
                  <p className="pd-report-meta">{r.type} · {r.date}</p>
                </div>
                <div className="pd-report-actions">
                  <button className="pd-action-btn view" onClick={() => openReport(r)}>View</button>
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
                <div className="pd-rx-acc-header"
                  onClick={() => setExpandRx(expandRx === rx.id ? null : rx.id)}>
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
                    <button className="pd-download-btn" disabled>
                      ⬇ Download PDF <span className="pd-soon">Soon</span>
                    </button>
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
                <span>Medicine</span><span>Prescription</span>
                <span>Date</span><span>Status</span>
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

      {/* ══ QR MODAL ══ */}
      {showQR && (
        <div className="qr-overlay" ref={qrModalRef}
          onClick={(e) => e.target === qrModalRef.current && closeQR()}>
          <div className="qr-modal" ref={qrBoxRef}>

            <div className="qr-modal-header">
              <div>
                <p className="qr-modal-label">MediCard QR</p>
                <p className="qr-modal-name">{PATIENT.name}</p>
                <p className="qr-modal-id">{PATIENT.id}</p>
              </div>
              <button className="qr-close-btn" onClick={closeQR}>✕</button>
            </div>

            {/* The actual QR code */}
            <div className="qr-code-wrap">
              <QRCodeSVG
                value={QR_PAYLOAD}
                size={200}
                bgColor="#ffffff"
                fgColor="#111111"
                level="H"
                includeMargin={true}
              />
            </div>

            <div className="qr-modal-footer">
              <p className="qr-scan-hint">
                Show this QR to your <strong>Doctor</strong> or <strong>Pharmacist</strong>.<br/>
                They can scan it to instantly access your medical profile.
              </p>
              <div className="qr-tags-row">
                <span className="qr-tag">🩺 Doctor Access</span>
                <span className="qr-tag">💊 Pharmacist Access</span>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ══ REPORT DETAIL MODAL ══ */}
      {viewingReport && (
        <div className="report-overlay" ref={modalRef}
          onClick={(e) => e.target === modalRef.current && closeReport()}>
          <div className="report-modal" ref={modalBoxRef}>
            <div className="rm-header">
              <div className="rm-header-left">
                <span className="rm-type-badge">{viewingReport.type}</span>
                <h2 className="rm-title">{viewingReport.name}</h2>
                <p className="rm-meta">{viewingReport.hospital} · {viewingReport.date}</p>
                <p className="rm-doctor">Reported by <strong>{viewingReport.doctor}</strong></p>
              </div>
              <div className="rm-header-right">
                <span className={`rm-status-badge ${viewingReport.status === "Normal" ? "normal" : "borderline"}`}>
                  {viewingReport.status}
                </span>
                <button className="rm-close" onClick={closeReport}>✕</button>
              </div>
            </div>
            <div className="rm-summary">
              <p className="rm-summary-label">Clinical Summary</p>
              <p className="rm-summary-text">{viewingReport.summary}</p>
            </div>
            <div className="rm-findings">
              <p className="rm-findings-label">Test Findings</p>
              <div className="rm-table">
                <div className="rm-table-head">
                  <span>Parameter</span><span>Result</span>
                  <span>Normal Range</span><span>Flag</span>
                </div>
                {viewingReport.findings.map((f, i) => (
                  <div className={`rm-table-row ${f.flag ? "flagged" : ""}`} key={i}>
                    <span className="rm-param">{f.label}</span>
                    <span className="rm-value">{f.value}</span>
                    <span className="rm-range">{f.range}</span>
                    <span className={`rm-flag ${f.flag ? "has-flag" : ""}`}>{f.flag || "—"}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="rm-advice">
              <p className="rm-advice-label">Doctor's Advice</p>
              <p className="rm-advice-text">{viewingReport.advice}</p>
            </div>
            <div className="rm-footer">
              <p className="rm-footer-note">Patient ID: {PATIENT.id} · Pulse MediCard System</p>
              <button className="rm-close-btn" onClick={closeReport}>Close Report</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}