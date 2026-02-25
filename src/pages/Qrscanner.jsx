import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { gsap } from "gsap";
import "../css/QRScanner.css";

/**
 * QRScanner
 * Props:
 *   onScan(decodedText)  — called when QR is successfully decoded
 *   onClose()            — called when user dismisses
 *   title                — modal header title  (default "Scan QR Code")
 *   subtitle             — modal header sub    (default "Point camera at QR")
 */
export default function QRScanner({ onScan, onClose, title = "Scan QR Code", subtitle = "Point camera at patient's MediCard QR" }) {
  const [status, setStatus]     = useState("idle");   // idle | starting | scanning | success | error
  const [errorMsg, setErrorMsg] = useState("");
  const [cameras, setCameras]   = useState([]);
  const [camId, setCamId]       = useState(null);

  const overlayRef  = useRef(null);
  const boxRef      = useRef(null);
  const scannerRef  = useRef(null);   // Html5Qrcode instance
  const regionId   = "qr-region";

  /* ── Animate in ── */
  useEffect(() => {
    gsap.fromTo(overlayRef.current, { opacity: 0 },        { opacity: 1, duration: 0.25 });
    gsap.fromTo(boxRef.current,     { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: 0.4, ease: "back.out(1.3)" });

    /* get available cameras */
    Html5Qrcode.getCameras()
      .then((devices) => {
        if (!devices || devices.length === 0) {
          setStatus("error");
          setErrorMsg("No camera found on this device.");
          return;
        }
        setCameras(devices);
        /* prefer back camera on mobile */
        const back = devices.find((d) =>
          d.label.toLowerCase().includes("back") ||
          d.label.toLowerCase().includes("rear") ||
          d.label.toLowerCase().includes("environment")
        );
        setCamId((back || devices[0]).id);
        setStatus("idle");
      })
      .catch(() => {
        setStatus("error");
        setErrorMsg("Camera permission denied. Please allow camera access and try again.");
      });

    return () => { stopScanner(); };
  }, []);

  /* ── Start scanner when camId is ready ── */
  useEffect(() => {
    if (camId && status === "idle") {
      startScanner(camId);
    }
  }, [camId]);

  const startScanner = async (id) => {
    setStatus("starting");
    try {
      const html5QrCode = new Html5Qrcode(regionId);
      scannerRef.current = html5QrCode;

      await html5QrCode.start(
        { deviceId: { exact: id } },
        {
          fps: 12,
          qrbox: { width: 220, height: 220 },
          aspectRatio: 1.0,
          disableFlip: false,
        },
        (decodedText) => {
          /* success */
          stopScanner();
          setStatus("success");
          setTimeout(() => {
            handleClose();
            onScan(decodedText);
          }, 700);
        },
        () => { /* scan frame error — ignore */ }
      );

      setStatus("scanning");
    } catch (err) {
      setStatus("error");
      setErrorMsg(err?.message || "Could not start camera. Try a different camera or browser.");
    }
  };

  const stopScanner = async () => {
    if (scannerRef.current) {
      try {
        if (scannerRef.current.isScanning) {
          await scannerRef.current.stop();
        }
        scannerRef.current.clear();
      } catch (_) { /* ignore cleanup errors */ }
      scannerRef.current = null;
    }
  };

  const handleClose = () => {
    stopScanner();
    gsap.to(boxRef.current,     { y: 30, opacity: 0, duration: 0.25, ease: "power2.in" });
    gsap.to(overlayRef.current, { opacity: 0, duration: 0.25, onComplete: onClose });
  };

  const switchCamera = async (newId) => {
    await stopScanner();
    setCamId(newId);
    setStatus("idle");
    setErrorMsg("");
  };

  return (
    <div className="qrs-overlay" ref={overlayRef} onClick={(e) => e.target === overlayRef.current && handleClose()}>
      <div className="qrs-modal" ref={boxRef}>

        {/* Header */}
        <div className="qrs-header">
          <div>
            <p className="qrs-title">{title}</p>
            <p className="qrs-subtitle">{subtitle}</p>
          </div>
          <button className="qrs-close" onClick={handleClose}>✕</button>
        </div>

        {/* Camera selector */}
        {cameras.length > 1 && (
          <div className="qrs-cam-select">
            {cameras.map((cam) => (
              <button
                key={cam.id}
                className={`qrs-cam-btn ${camId === cam.id ? "active" : ""}`}
                onClick={() => switchCamera(cam.id)}
              >
                {cam.label.length > 28 ? cam.label.slice(0, 28) + "…" : cam.label}
              </button>
            ))}
          </div>
        )}

        {/* Scanner viewport */}
        <div className="qrs-viewport">
          {/* html5-qrcode mounts into this div */}
          <div id={regionId} className="qrs-region" />

          {/* Overlay states on top of viewport */}
          {status === "starting" && (
            <div className="qrs-state-overlay">
              <div className="qrs-spinner" />
              <p>Starting camera…</p>
            </div>
          )}

          {status === "success" && (
            <div className="qrs-state-overlay success">
              <div className="qrs-success-ring">✓</div>
              <p>QR Detected!</p>
            </div>
          )}

          {status === "error" && (
            <div className="qrs-state-overlay error">
              <span className="qrs-error-icon">⚠</span>
              <p>{errorMsg}</p>
              <button className="qrs-retry-btn"
                onClick={() => { setStatus("idle"); setErrorMsg(""); startScanner(camId); }}>
                Retry
              </button>
            </div>
          )}

          {/* Scanning frame corners */}
          {status === "scanning" && (
            <div className="qrs-frame" aria-hidden="true">
              <span className="qrs-corner tl" /><span className="qrs-corner tr" />
              <span className="qrs-corner bl" /><span className="qrs-corner br" />
              <div className="qrs-scan-line" />
            </div>
          )}
        </div>

        {status === "scanning" && (
          <p className="qrs-hint">Hold steady · QR will auto-detect</p>
        )}

      </div>
    </div>
  );
}