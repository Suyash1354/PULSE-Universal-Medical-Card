import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { QRCodeSVG } from "qrcode.react";
import QRScanner from "./QRScanner";
import "../css/DoctorDashboard.css";

const DOCTOR = {
  name: "Dr. Priya Mehta",
  id: "DOC-2023-00142",
  specialisation: "General Physician",
  hospital: "Apollo Diagnostics, Mumbai",
  experience: "9 years",
  email: "priya.mehta@apollo.in",
  phone: "+91 98200 11234",
};

const PATIENT_DB = {
  "MED-2024-04821": {
    id: "MED-2024-04821",
    name: "Arjun Sharma",
    age: 28, blood: "B+", weight: "72 kg", height: "5'10\"",
    allergies: "Penicillin", lastVisit: "12 Feb 2025",
    reports: [
      { name: "Blood Test Report", date: "10 Feb 2025", type: "Lab",       status: "Normal"     },
      { name: "ECG Report",        date: "15 Jan 2025", type: "Cardiology", status: "Borderline" },
    ],
    prescriptions: [
      { id: "RX-8821", date: "12 Feb 2025", diagnosis: "Viral Fever",
        medicines: ["Paracetamol 500mg", "Cetirizine 10mg", "Vitamin C"] },
    ],
  },
  "MED-2024-07334": {
    id: "MED-2024-07334",
    name: "Sneha Patel",
    age: 34, blood: "O+", weight: "58 kg", height: "5'4\"",
    allergies: "None", lastVisit: "20 Jan 2025",
    reports: [
      { name: "Thyroid Panel", date: "19 Jan 2025", type: "Lab", status: "Borderline" },
    ],
    prescriptions: [
      { id: "RX-7901", date: "20 Jan 2025", diagnosis: "Hypothyroidism",
        medicines: ["Levothyroxine 50mcg"] },
    ],
  },
};

const MY_DIAGNOSES = [
  { id: "RX-8821", patient: "Arjun Sharma",  patientId: "MED-2024-04821",
    date: "12 Feb 2025", diagnosis: "Viral Fever",
    medicines: ["Paracetamol 500mg", "Cetirizine 10mg", "Vitamin C"] },
  { id: "RX-7901", patient: "Sneha Patel",   patientId: "MED-2024-07334",
    date: "20 Jan 2025", diagnosis: "Hypothyroidism",
    medicines: ["Levothyroxine 50mcg"] },
  { id: "RX-7734", patient: "Arjun Sharma",  patientId: "MED-2024-04821",
    date: "15 Jan 2025", diagnosis: "Hypertension",
    medicines: ["Amlodipine 5mg", "Losartan 50mg"] },
];

const NAV_ITEMS = [
  { key: "search",       label: "Search Patient"       },
  { key: "diagnoses",    label: "My Diagnoses"         },
  { key: "prescription", label: "Create Prescription"  },
  { key: "profile",      label: "Profile"              },
];

export default function DoctorDashboard() {
  const [active, setActive]             = useState("search");
  const [searchInput, setSearchInput]   = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [searchError, setSearchError]   = useState("");
  const [expandRx, setExpandRx]         = useState(null);
  const [expandDx, setExpandDx]         = useState(null);

  /* QR scan modal */
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanTarget, setScanTarget]       = useState("search"); // "search" | "prescription"

  /* create prescription */
  const [rxPatientId, setRxPatientId]   = useState("");
  const [rxPatient, setRxPatient]       = useState(null);
  const [rxPatientErr, setRxPatientErr] = useState("");
  const [rxDiagnosis, setRxDiagnosis]   = useState("");
  const [rxMedicines, setRxMedicines]   = useState([{ name: "", dose: "", duration: "" }]);
  const [rxSaved, setRxSaved]           = useState(false);

  const navRef     = useRef(null);
  const mainRef    = useRef(null);
  const cardsRef   = useRef([]);
  const resultRef  = useRef(null);
  cardsRef.current = [];
  const addCard = (el) => { if (el) cardsRef.current.push(el); };

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
    if (searchResult && resultRef.current) {
      gsap.fromTo(resultRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    }
  }, [searchResult]);

  const handleSearch = () => {
    const id = searchInput.trim().toUpperCase();
    if (!id) { setSearchError("Please enter a Patient ID."); return; }
    const found = PATIENT_DB[id];
    if (found) { setSearchResult(found); setSearchError(""); }
    else       { setSearchResult(null); setSearchError(`No patient found with ID "${id}".`); }
  };

  const openScanModal  = (target) => { setScanTarget(target); setShowScanModal(true); };
  const closeScanModal = () => setShowScanModal(false);

  const lookupRxPatient = () => {
    const id = rxPatientId.trim().toUpperCase();
    const found = PATIENT_DB[id];
    if (found) { setRxPatient(found); setRxPatientErr(""); }
    else       { setRxPatient(null); setRxPatientErr(`Patient "${id}" not found.`); }
  };

  const addMedicineRow    = () => setRxMedicines([...rxMedicines, { name: "", dose: "", duration: "" }]);
  const removeMedicineRow = (i) => setRxMedicines(rxMedicines.filter((_, idx) => idx !== i));
  const updateMedicine    = (i, field, val) => {
    const updated = [...rxMedicines]; updated[i][field] = val; setRxMedicines(updated);
  };

  const handleSavePrescription = () => {
    if (!rxPatient || !rxDiagnosis.trim()) return;
    setRxSaved(true);
    setTimeout(() => {
      setRxSaved(false);
      setRxPatient(null); setRxPatientId(""); setRxDiagnosis("");
      setRxMedicines([{ name: "", dose: "", duration: "" }]);
    }, 2500);
  };

  return (
    <div className="dd-root">
      <div className="dot-grid" aria-hidden="true" />

      <nav className="dd-navbar" ref={navRef}>
        <div className="dd-brand">
          <span className="dd-brand-name">Pulse</span>
          <span className="dd-brand-tag">Doctor</span>
        </div>
        <div className="dd-nav-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.key}
              className={`dd-nav-link ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}>
              {item.label}
              {active === item.key && <span className="dd-nav-dot" />}
            </button>
          ))}
        </div>
        <button className="dd-logout-btn">Logout</button>
      </nav>

      <main className="dd-main" ref={mainRef}>

        {/* ════════════ SEARCH PATIENT ════════════ */}
        {active === "search" && (
          <section className="dd-section">
            <h1 className="dd-page-title">Search Patient</h1>

            <div className="dd-search-box" ref={addCard}>
              <input
                className="dd-search-input"
                placeholder="Enter Patient ID  e.g. MED-2024-04821"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              />
              {/* QR scan button */}
              <button className="dd-scan-btn" onClick={() => openScanModal("search")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                </svg>
                Scan QR
              </button>
              <button className="dd-search-btn" onClick={handleSearch}>Search</button>
            </div>

            {searchError && <p className="dd-error-msg">{searchError}</p>}

            {searchResult && (
              <div ref={resultRef}>
                <div className="dd-patient-id-card">
                  <div className="dd-pid-left">
                    <div className="dd-avatar">{searchResult.name.charAt(0)}</div>
                    <div>
                      <p className="dd-pid-name">{searchResult.name}</p>
                      <p className="dd-pid-sub">{searchResult.id}</p>
                    </div>
                  </div>
                  <div className="dd-pid-meta">
                    <span className="dd-meta-chip">{searchResult.blood}</span>
                    <span className="dd-meta-chip">Age {searchResult.age}</span>
                    <span className="dd-meta-chip">{searchResult.weight}</span>
                  </div>
                </div>
                <div className="dd-stats-grid">
                  {[
                    { label: "Height",     value: searchResult.height },
                    { label: "Allergies",  value: searchResult.allergies },
                    { label: "Last Visit", value: searchResult.lastVisit },
                  ].map((s) => (
                    <div className="dd-stat-card" key={s.label}>
                      <p className="dd-stat-label">{s.label}</p>
                      <p className="dd-stat-value">{s.value}</p>
                    </div>
                  ))}
                </div>
                <p className="dd-sub-title">Reports</p>
                {searchResult.reports.map((r, i) => (
                  <div className="dd-report-row" key={i}>
                    <div className="dd-report-icon">📄</div>
                    <div className="dd-report-info">
                      <span className="dd-report-name">{r.name}</span>
                      <span className="dd-report-meta">{r.type} · {r.date}</span>
                    </div>
                    <span className={`dd-status-chip ${r.status === "Normal" ? "normal" : "border"}`}>{r.status}</span>
                  </div>
                ))}
                <p className="dd-sub-title">Prescription History</p>
                {searchResult.prescriptions.map((rx) => (
                  <div className="dd-rx-card" key={rx.id}
                    onClick={() => setExpandRx(expandRx === rx.id ? null : rx.id)}>
                    <div className="dd-rx-top">
                      <span className="dd-rx-id">{rx.id}</span>
                      <span className="dd-rx-date">{rx.date}</span>
                      <span className="dd-toggle">{expandRx === rx.id ? "▲" : "▼"}</span>
                    </div>
                    <p className="dd-rx-diagnosis">{rx.diagnosis}</p>
                    {expandRx === rx.id && (
                      <div className="dd-rx-body">
                        <p className="dd-rx-detail-label">Medicines</p>
                        <div className="dd-pills-row">
                          {rx.medicines.map((m) => <span className="dd-pill" key={m}>{m}</span>)}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ════════════ MY DIAGNOSES ════════════ */}
        {active === "diagnoses" && (
          <section className="dd-section">
            <h1 className="dd-page-title">My Diagnoses</h1>
            {MY_DIAGNOSES.map((dx) => (
              <div className="dd-dx-card" ref={addCard} key={dx.id}
                onClick={() => setExpandDx(expandDx === dx.id ? null : dx.id)}>
                <div className="dd-dx-top">
                  <div className="dd-dx-left">
                    <span className="dd-rx-id">{dx.id}</span>
                    <p className="dd-dx-patient">{dx.patient}<span className="dd-dx-pid"> · {dx.patientId}</span></p>
                    <p className="dd-rx-diagnosis">{dx.diagnosis}</p>
                  </div>
                  <div className="dd-dx-right">
                    <span className="dd-rx-date">{dx.date}</span>
                    <span className="dd-toggle">{expandDx === dx.id ? "▲" : "▼"}</span>
                  </div>
                </div>
                {expandDx === dx.id && (
                  <div className="dd-rx-body">
                    <p className="dd-rx-detail-label">Medicines Prescribed</p>
                    <div className="dd-pills-row">
                      {dx.medicines.map((m) => <span className="dd-pill" key={m}>{m}</span>)}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </section>
        )}

        {/* ════════════ CREATE PRESCRIPTION ════════════ */}
        {active === "prescription" && (
          <section className="dd-section">
            <h1 className="dd-page-title">Create Prescription</h1>
            {rxSaved ? (
              <div className="dd-success-card" ref={addCard}>
                <span className="dd-success-icon">✓</span>
                <div>
                  <p className="dd-success-title">Prescription Saved!</p>
                  <p className="dd-success-sub">
                    Prescription for <strong>{rxPatient?.name}</strong> — {rxDiagnosis} has been created.
                  </p>
                </div>
              </div>
            ) : (
              <div className="dd-rx-form" ref={addCard}>
                <div className="dd-form-section">
                  <p className="dd-form-label">Step 1 — Select Patient</p>
                  <div className="dd-form-row">
                    <input
                      className="dd-form-input"
                      placeholder="Enter Patient ID  e.g. MED-2024-04821"
                      value={rxPatientId}
                      onChange={(e) => setRxPatientId(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && lookupRxPatient()}
                    />
                    {/* QR scan for prescription too */}
                    <button className="dd-scan-btn" onClick={() => openScanModal("prescription")}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                        <rect x="3" y="14" width="7" height="7"/>
                        <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                      </svg>
                      Scan QR
                    </button>
                    <button className="dd-form-lookup-btn" onClick={lookupRxPatient}>Find</button>
                  </div>
                  {rxPatientErr && <p className="dd-error-msg">{rxPatientErr}</p>}
                  {rxPatient && (
                    <div className="dd-rx-patient-chip">
                      <div className="dd-rpc-avatar">{rxPatient.name.charAt(0)}</div>
                      <div>
                        <p className="dd-rpc-name">{rxPatient.name}</p>
                        <p className="dd-rpc-sub">{rxPatient.id} · Age {rxPatient.age} · {rxPatient.blood}</p>
                      </div>
                      <span className="dd-rpc-clear" onClick={() => { setRxPatient(null); setRxPatientId(""); }}>✕</span>
                    </div>
                  )}
                </div>
                <div className="dd-form-section">
                  <p className="dd-form-label">Step 2 — Diagnosis Notes</p>
                  <textarea className="dd-form-textarea" placeholder="e.g. Acute viral pharyngitis with mild fever..." rows={4}
                    value={rxDiagnosis} onChange={(e) => setRxDiagnosis(e.target.value)} />
                </div>
                <div className="dd-form-section">
                  <div className="dd-form-section-top">
                    <p className="dd-form-label">Step 3 — Add Medicines</p>
                    <button className="dd-add-med-btn" onClick={addMedicineRow}>+ Add</button>
                  </div>
                  <div className="dd-med-table-head">
                    <span>Medicine Name</span><span>Dosage</span><span>Duration</span><span></span>
                  </div>
                  {rxMedicines.map((med, i) => (
                    <div className="dd-med-row" key={i}>
                      <input className="dd-med-input" placeholder="e.g. Paracetamol" value={med.name}
                        onChange={(e) => updateMedicine(i, "name", e.target.value)} />
                      <input className="dd-med-input" placeholder="500mg × 2" value={med.dose}
                        onChange={(e) => updateMedicine(i, "dose", e.target.value)} />
                      <input className="dd-med-input" placeholder="5 days" value={med.duration}
                        onChange={(e) => updateMedicine(i, "duration", e.target.value)} />
                      <button className="dd-remove-med" onClick={() => removeMedicineRow(i)}
                        disabled={rxMedicines.length === 1}>✕</button>
                    </div>
                  ))}
                </div>
                <div className="dd-form-footer">
                  <button
                    className={`dd-save-btn ${(!rxPatient || !rxDiagnosis.trim()) ? "disabled" : ""}`}
                    onClick={handleSavePrescription} disabled={!rxPatient || !rxDiagnosis.trim()}>
                    Save Prescription
                  </button>
                  {(!rxPatient || !rxDiagnosis.trim()) && <p className="dd-save-hint">Fill patient + diagnosis to save</p>}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ════════════ PROFILE ════════════ */}
        {active === "profile" && (
          <section className="dd-section">
            <h1 className="dd-page-title">Profile</h1>
            <div className="dd-profile-card" ref={addCard}>
              <div className="dd-profile-avatar">{DOCTOR.name.charAt(2)}</div>
              <div className="dd-profile-fields">
                {[
                  { label: "Full Name",      value: DOCTOR.name           },
                  { label: "Doctor ID",      value: DOCTOR.id             },
                  { label: "Specialisation", value: DOCTOR.specialisation },
                  { label: "Hospital",       value: DOCTOR.hospital       },
                  { label: "Experience",     value: DOCTOR.experience     },
                  { label: "Email",          value: DOCTOR.email          },
                  { label: "Phone",          value: DOCTOR.phone          },
                ].map((f) => (
                  <div className="dd-field" key={f.label}>
                    <label className="dd-field-label">{f.label}</label>
                    <input className="dd-field-input" defaultValue={f.value} readOnly />
                  </div>
                ))}
                <button className="dd-edit-btn">Edit Profile</button>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ══ QR CAMERA SCANNER ══ */}
      {showScanModal && (
        <QRScanner
          title="Scan Patient QR"
          subtitle="Point camera at patient's MediCard QR code"
          onClose={closeScanModal}
          onScan={(text) => {
            try {
              const data = JSON.parse(text);
              if (data.type === "MEDICARD_PATIENT" && data.id) {
                const found = PATIENT_DB[data.id];
                if (found) {
                  if (scanTarget === "search") {
                    setSearchInput(data.id);
                    setSearchResult(found);
                    setSearchError("");
                  } else {
                    setRxPatientId(data.id);
                    setRxPatient(found);
                    setRxPatientErr("");
                  }
                } else {
                  if (scanTarget === "search") setSearchError(`Patient ID "${data.id}" not found.`);
                  else setRxPatientErr(`Patient ID "${data.id}" not found.`);
                }
              } else {
                if (scanTarget === "search") setSearchError("Invalid QR — not a MediCard patient QR.");
                else setRxPatientErr("Invalid QR — not a MediCard patient QR.");
              }
            } catch {
              if (scanTarget === "search") setSearchError("Could not read QR code. Please try again.");
              else setRxPatientErr("Could not read QR code. Please try again.");
            }
          }}
        />
      )}

    </div>
  );
}