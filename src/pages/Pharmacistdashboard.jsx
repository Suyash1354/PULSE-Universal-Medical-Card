import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap";
import { QRCodeSVG } from "qrcode.react";
import QRScanner from "./QRScanner";
import "../css/PharmacistDashboard.css";

const PHARMACIST = {
  name: "Rajesh Nair",
  id: "PH-2023-00389",
  pharmacy: "MedPlus Pharmacy, Andheri West, Mumbai",
  license: "MH-PH-44921",
  experience: "6 years",
  email: "rajesh.nair@medplus.in",
  phone: "+91 96500 33217",
};

const PRESCRIPTION_DB = {
  "RX-8821": {
    id: "RX-8821", date: "12 Feb 2025", diagnosis: "Viral Fever", status: "Pending",
    doctor:  { name: "Dr. Priya Mehta",  id: "DOC-2023-00142", hospital: "Apollo Diagnostics, Mumbai",       specialisation: "General Physician" },
    patient: { name: "Arjun Sharma",     id: "MED-2024-04821", age: 28, blood: "B+", allergies: "Penicillin" },
    medicines: [
      { name: "Paracetamol 500mg", dose: "1 tab × 3/day", duration: "5 days",  dispensed: false },
      { name: "Cetirizine 10mg",   dose: "1 tab × 1/day", duration: "5 days",  dispensed: false },
      { name: "Vitamin C 500mg",   dose: "1 tab × 2/day", duration: "7 days",  dispensed: false },
    ],
  },
  "RX-7901": {
    id: "RX-7901", date: "20 Jan 2025", diagnosis: "Hypothyroidism", status: "Dispensed",
    doctor:  { name: "Dr. Priya Mehta",  id: "DOC-2023-00142", hospital: "Apollo Diagnostics, Mumbai",       specialisation: "General Physician" },
    patient: { name: "Sneha Patel",      id: "MED-2024-07334", age: 34, blood: "O+", allergies: "None"      },
    medicines: [
      { name: "Levothyroxine 50mcg", dose: "1 tab × 1/day", duration: "30 days", dispensed: true },
    ],
  },
  "RX-7734": {
    id: "RX-7734", date: "15 Jan 2025", diagnosis: "Hypertension", status: "Pending",
    doctor:  { name: "Dr. Ravi Kumar",   id: "DOC-2023-00198", hospital: "Narayana Heart Centre, Bengaluru", specialisation: "Cardiologist"      },
    patient: { name: "Arjun Sharma",     id: "MED-2024-04821", age: 28, blood: "B+", allergies: "Penicillin" },
    medicines: [
      { name: "Amlodipine 5mg",  dose: "1 tab × 1/day", duration: "30 days", dispensed: false },
      { name: "Losartan 50mg",   dose: "1 tab × 1/day", duration: "30 days", dispensed: false },
    ],
  },
};

const INITIAL_HISTORY = [
  { rxId: "RX-7901", patient: "Sneha Patel", diagnosis: "Hypothyroidism", dispensedOn: "20 Jan 2025", medicines: 1 },
];

const NAV_ITEMS = [
  { key: "verify",   label: "Verify Prescription" },
  { key: "dispense", label: "Dispense Medicine"   },
  { key: "history",  label: "History"             },
  { key: "profile",  label: "Profile"             },
];

export default function PharmacistDashboard() {
  const [active, setActive]               = useState("verify");
  const [searchInput, setSearchInput]     = useState("");
  const [verified, setVerified]           = useState(null);
  const [verifyError, setVerifyError]     = useState("");
  const [dispenseInput, setDispenseInput] = useState("");
  const [dispenseRx, setDispenseRx]       = useState(null);
  const [dispenseError, setDispenseError] = useState("");
  const [medState, setMedState]           = useState({});
  const [saved, setSaved]                 = useState(false);
  const [history, setHistory]             = useState(INITIAL_HISTORY);

  /* QR scan */
  const [showScanModal, setShowScanModal] = useState(false);
  const [scanTarget, setScanTarget]       = useState("verify");

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
    if ((verified || dispenseRx) && resultRef.current) {
      gsap.fromTo(resultRef.current, { opacity: 0, y: 28 }, { opacity: 1, y: 0, duration: 0.5, ease: "power3.out" });
    }
  }, [verified, dispenseRx]);

  const handleVerify = () => {
    const id = searchInput.trim().toUpperCase();
    if (!id) { setVerifyError("Please enter a Prescription ID."); return; }
    const rx = PRESCRIPTION_DB[id];
    if (rx) { setVerified(rx); setVerifyError(""); }
    else    { setVerified(null); setVerifyError(`No prescription found with ID "${id}".`); }
  };

  const handleDispenseLookup = () => {
    const id = dispenseInput.trim().toUpperCase();
    if (!id) { setDispenseError("Please enter a Prescription ID."); return; }
    const rx = PRESCRIPTION_DB[id];
    if (rx) {
      setDispenseRx(rx); setDispenseError(""); setSaved(false);
      setMedState({ [rx.id]: rx.medicines.map((m) => m.dispensed) });
    } else {
      setDispenseRx(null); setDispenseError(`No prescription found with ID "${id}".`);
    }
  };

  const openScanModal  = (target) => { setScanTarget(target); setShowScanModal(true); };
  const closeScanModal = () => setShowScanModal(false);

  const toggleMed = (rxId, idx) => {
    setMedState((prev) => {
      const arr = [...(prev[rxId] || [])]; arr[idx] = !arr[idx];
      return { ...prev, [rxId]: arr };
    });
  };

  const markAllDispensed = () => {
    if (!dispenseRx) return;
    setMedState({ [dispenseRx.id]: dispenseRx.medicines.map(() => true) });
  };

  const handleSaveDispense = () => {
    if (!dispenseRx) return;
    const count = (medState[dispenseRx.id] || []).filter(Boolean).length;
    if (count === 0) return;
    setHistory((prev) => [{
      rxId: dispenseRx.id, patient: dispenseRx.patient.name, diagnosis: dispenseRx.diagnosis,
      dispensedOn: new Date().toLocaleDateString("en-IN", { day:"2-digit", month:"short", year:"numeric" }),
      medicines: count,
    }, ...prev]);
    setSaved(true);
    setTimeout(() => {
      setSaved(false); setDispenseRx(null); setDispenseInput(""); setMedState({});
    }, 2500);
  };

  return (
    <div className="phd-root">
      <div className="dot-grid" aria-hidden="true" />

      <nav className="phd-navbar" ref={navRef}>
        <div className="phd-brand">
          <span className="phd-brand-name">Pulse</span>
          <span className="phd-brand-tag">Pharmacist</span>
        </div>
        <div className="phd-nav-links">
          {NAV_ITEMS.map((item) => (
            <button key={item.key}
              className={`phd-nav-link ${active === item.key ? "active" : ""}`}
              onClick={() => setActive(item.key)}>
              {item.label}
              {active === item.key && <span className="phd-nav-dot" />}
            </button>
          ))}
        </div>
        <button className="phd-logout-btn">Logout</button>
      </nav>

      <main className="phd-main" ref={mainRef}>

        {/* ════════════ VERIFY ════════════ */}
        {active === "verify" && (
          <section className="phd-section">
            <h1 className="phd-page-title">Verify Prescription</h1>
            <div className="phd-search-box" ref={addCard}>
              <input className="phd-search-input" placeholder="Enter Prescription ID  e.g. RX-8821"
                value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleVerify()} />
              <button className="phd-scan-btn" onClick={() => openScanModal("verify")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                </svg>
                Scan QR
              </button>
              <button className="phd-search-btn" onClick={handleVerify}>Verify</button>
            </div>
            {verifyError && <p className="phd-error-msg">{verifyError}</p>}
            {verified && (
              <div ref={resultRef}>
                <div className={`phd-status-banner ${verified.status === "Dispensed" ? "dispensed" : "pending"}`}>
                  <span className="phd-status-dot" />
                  <span>Prescription <strong>{verified.id}</strong> — Status: <strong>{verified.status}</strong></span>
                  <span className="phd-banner-date">{verified.date}</span>
                </div>
                <p className="phd-sub-title">Doctor Details</p>
                <div className="phd-detail-card" ref={addCard}>
                  <div className="phd-detail-icon doctor-icon">🩺</div>
                  <div className="phd-detail-body">
                    <p className="phd-detail-name">{verified.doctor.name}</p>
                    <p className="phd-detail-sub">{verified.doctor.specialisation}</p>
                    <p className="phd-detail-meta">{verified.doctor.hospital}</p>
                    <span className="phd-id-chip">{verified.doctor.id}</span>
                  </div>
                </div>
                <p className="phd-sub-title">Patient Details</p>
                <div className="phd-detail-card" ref={addCard}>
                  <div className="phd-detail-icon patient-icon">🧑‍⚕️</div>
                  <div className="phd-detail-body">
                    <p className="phd-detail-name">{verified.patient.name}</p>
                    <p className="phd-detail-meta">Age {verified.patient.age} · Blood {verified.patient.blood}</p>
                    <p className="phd-allergy-row">
                      <span className="phd-allergy-label">Allergies:</span>
                      <span className={`phd-allergy-val ${verified.patient.allergies !== "None" ? "has-allergy" : ""}`}>
                        {verified.patient.allergies}
                      </span>
                    </p>
                    <span className="phd-id-chip">{verified.patient.id}</span>
                  </div>
                </div>
                <p className="phd-sub-title">Prescribed Medicines</p>
                <div className="phd-diagnosis-row" ref={addCard}>
                  <span className="phd-diag-label">Diagnosis</span>
                  <span className="phd-diag-value">{verified.diagnosis}</span>
                </div>
                <div className="phd-med-table" ref={addCard}>
                  <div className="phd-med-head">
                    <span>Medicine</span><span>Dosage</span><span>Duration</span><span>Status</span>
                  </div>
                  {verified.medicines.map((m, i) => (
                    <div className="phd-med-row" key={i}>
                      <span className="phd-med-name">{m.name}</span>
                      <span className="phd-med-dose">{m.dose}</span>
                      <span className="phd-med-dur">{m.duration}</span>
                      <span className={`phd-med-badge ${m.dispensed ? "dispensed" : "pending"}`}>
                        {m.dispensed ? "Dispensed" : "Pending"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        )}

        {/* ════════════ DISPENSE ════════════ */}
        {active === "dispense" && (
          <section className="phd-section">
            <h1 className="phd-page-title">Dispense Medicine</h1>
            <div className="phd-search-box" ref={addCard}>
              <input className="phd-search-input" placeholder="Enter Prescription ID  e.g. RX-7734"
                value={dispenseInput} onChange={(e) => setDispenseInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleDispenseLookup()} />
              <button className="phd-scan-btn" onClick={() => openScanModal("dispense")}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
                  <rect x="3" y="14" width="7" height="7"/>
                  <path d="M14 14h3v3h-3zM17 17h3v3h-3zM14 20h3"/>
                </svg>
                Scan QR
              </button>
              <button className="phd-search-btn" onClick={handleDispenseLookup}>Load</button>
            </div>
            {dispenseError && <p className="phd-error-msg">{dispenseError}</p>}
            {saved && (
              <div className="phd-success-card" ref={addCard}>
                <span className="phd-success-icon">✓</span>
                <div>
                  <p className="phd-success-title">Dispensed Successfully!</p>
                  <p className="phd-success-sub">Medicines for <strong>{dispenseRx?.patient.name}</strong> — {dispenseRx?.diagnosis} have been marked as dispensed.</p>
                </div>
              </div>
            )}
            {dispenseRx && !saved && (
              <div ref={resultRef}>
                <div className="phd-dispense-header" ref={addCard}>
                  <div className="phd-dh-left">
                    <div className="phd-dh-avatar">{dispenseRx.patient.name.charAt(0)}</div>
                    <div>
                      <p className="phd-dh-name">{dispenseRx.patient.name}</p>
                      <p className="phd-dh-sub">{dispenseRx.patient.id}</p>
                    </div>
                  </div>
                  <div className="phd-dh-right">
                    <span className="phd-id-chip">{dispenseRx.id}</span>
                    <p className="phd-dh-diag">{dispenseRx.diagnosis}</p>
                    <p className="phd-dh-doc">by {dispenseRx.doctor.name}</p>
                  </div>
                </div>
                {dispenseRx.status === "Dispensed" && (
                  <div className="phd-already-banner">⚠️ This prescription has already been fully dispensed.</div>
                )}
                <div className="phd-checklist-card" ref={addCard}>
                  <div className="phd-checklist-top">
                    <p className="phd-checklist-label">Mark Medicines as Dispensed</p>
                    <button className="phd-mark-all-btn" onClick={markAllDispensed}>Mark All</button>
                  </div>
                  {dispenseRx.medicines.map((m, i) => {
                    const checked = (medState[dispenseRx.id] || [])[i] ?? m.dispensed;
                    return (
                      <label className={`phd-check-row ${checked ? "checked" : ""}`} key={i}>
                        <input type="checkbox" className="phd-checkbox" checked={checked}
                          onChange={() => toggleMed(dispenseRx.id, i)} />
                        <div className="phd-check-info">
                          <span className="phd-check-name">{m.name}</span>
                          <span className="phd-check-dose">{m.dose} · {m.duration}</span>
                        </div>
                        <span className={`phd-check-badge ${checked ? "dispensed" : "pending"}`}>
                          {checked ? "Dispensed" : "Pending"}
                        </span>
                      </label>
                    );
                  })}
                </div>
                <div className="phd-dispense-footer" ref={addCard}>
                  <button
                    className={`phd-save-btn ${!(medState[dispenseRx.id] || []).some(Boolean) ? "disabled" : ""}`}
                    onClick={handleSaveDispense} disabled={!(medState[dispenseRx.id] || []).some(Boolean)}>
                    Update Status
                  </button>
                  <p className="phd-save-hint">
                    {(medState[dispenseRx.id] || []).filter(Boolean).length} of {dispenseRx.medicines.length} medicines selected
                  </p>
                </div>
              </div>
            )}
          </section>
        )}

        {/* ════════════ HISTORY ════════════ */}
        {active === "history" && (
          <section className="phd-section">
            <h1 className="phd-page-title">History</h1>
            {history.length === 0 ? (
              <div className="phd-empty-state" ref={addCard}><p>No dispensing history yet.</p></div>
            ) : (
              history.map((h, i) => (
                <div className="phd-history-card" ref={addCard} key={i}>
                  <div className="phd-hist-left">
                    <span className="phd-id-chip">{h.rxId}</span>
                    <p className="phd-hist-patient">{h.patient}</p>
                    <p className="phd-hist-diag">{h.diagnosis}</p>
                  </div>
                  <div className="phd-hist-right">
                    <span className="phd-hist-date">{h.dispensedOn}</span>
                    <span className="phd-hist-count">{h.medicines} medicine{h.medicines > 1 ? "s" : ""}</span>
                    <span className="phd-med-badge dispensed">Dispensed</span>
                  </div>
                </div>
              ))
            )}
          </section>
        )}

        {/* ════════════ PROFILE ════════════ */}
        {active === "profile" && (
          <section className="phd-section">
            <h1 className="phd-page-title">Profile</h1>
            <div className="phd-profile-card" ref={addCard}>
              <div className="phd-profile-avatar">{PHARMACIST.name.charAt(0)}</div>
              <div className="phd-profile-fields">
                {[
                  { label: "Full Name",      value: PHARMACIST.name       },
                  { label: "Pharmacist ID",  value: PHARMACIST.id         },
                  { label: "Pharmacy",       value: PHARMACIST.pharmacy   },
                  { label: "License No.",    value: PHARMACIST.license    },
                  { label: "Experience",     value: PHARMACIST.experience },
                  { label: "Email",          value: PHARMACIST.email      },
                  { label: "Phone",          value: PHARMACIST.phone      },
                ].map((f) => (
                  <div className="phd-field" key={f.label}>
                    <label className="phd-field-label">{f.label}</label>
                    <input className="phd-field-input" defaultValue={f.value} readOnly />
                  </div>
                ))}
                <button className="phd-edit-btn">Edit Profile</button>
              </div>
            </div>
          </section>
        )}

      </main>

      {/* ══ QR CAMERA SCANNER ══ */}
      {showScanModal && (
        <QRScanner
          title="Scan Prescription QR"
          subtitle="Point camera at the prescription QR code"
          onClose={closeScanModal}
          onScan={(text) => {
            try {
              const data = JSON.parse(text);
              if (data.type === "MEDICARD_RX" && data.id) {
                const rx = PRESCRIPTION_DB[data.id];
                if (rx) {
                  if (scanTarget === "verify") {
                    setSearchInput(data.id);
                    setVerified(rx);
                    setVerifyError("");
                  } else {
                    setDispenseInput(data.id);
                    setDispenseRx(rx);
                    setDispenseError("");
                    setSaved(false);
                    setMedState({ [rx.id]: rx.medicines.map((m) => m.dispensed) });
                  }
                } else {
                  if (scanTarget === "verify") setVerifyError(`Prescription "${data.id}" not found.`);
                  else setDispenseError(`Prescription "${data.id}" not found.`);
                }
              } else if (data.type === "MEDICARD_PATIENT" && data.id) {
                // Patient QR scanned in pharmacist — look up pending prescriptions
                const pending = Object.values(PRESCRIPTION_DB).find(
                  (rx) => rx.patient.id === data.id && rx.status === "Pending"
                );
                if (pending) {
                  if (scanTarget === "verify") {
                    setSearchInput(pending.id);
                    setVerified(pending);
                    setVerifyError("");
                  } else {
                    setDispenseInput(pending.id);
                    setDispenseRx(pending);
                    setDispenseError("");
                    setSaved(false);
                    setMedState({ [pending.id]: pending.medicines.map((m) => m.dispensed) });
                  }
                } else {
                  const msg = `No pending prescriptions found for this patient.`;
                  if (scanTarget === "verify") setVerifyError(msg);
                  else setDispenseError(msg);
                }
              } else {
                const msg = "Invalid QR — not a MediCard QR code.";
                if (scanTarget === "verify") setVerifyError(msg);
                else setDispenseError(msg);
              }
            } catch {
              const msg = "Could not read QR code. Please try again.";
              if (scanTarget === "verify") setVerifyError(msg);
              else setDispenseError(msg);
            }
          }}
        />
      )}

    </div>
  );
}