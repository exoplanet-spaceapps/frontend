import React, { useRef, useState } from "react";
import PlanetDialog from "../Planet/PlanetDialog";

const simulateBackendUpload = (file, fileType) => {
  console.info(`Simulating ${fileType.toUpperCase()} upload for`, file.name);

  return new Promise((resolve) => {
    setTimeout(resolve, 1200);
  });
};

const DataPortal = ({ onBack }) => {
  const csvInputRef = useRef(null);
  const datInputRef = useRef(null);
  const [uploadState, setUploadState] = useState({ status: "idle" });
  const isProcessing =
    uploadState.status === "reading" || uploadState.status === "uploading";
  const loadingMessage =
    uploadState.status === "reading"
      ? "Loading..."
      : "Loading...";

  const handleUploadClick = (ref) => {
    if (!ref.current) {
      return;
    }

    ref.current.value = "";
    ref.current.click();
  };

  const handleFileChange = (event, fileType) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    const lowerName = file.name.toLowerCase();

    if (fileType === "csv") {
      if (file.type !== "text/csv" && !lowerName.endsWith(".csv")) {
        setUploadState({
          status: "error",
          message: "Please choose a .csv file.",
        });
        return;
      }
    } else if (!lowerName.endsWith(".dat")) {
      setUploadState({
        status: "error",
        message: "Please choose a .dat file.",
      });
      return;
    }

    setUploadState({
      status: "reading",
      fileType,
      fileName: file.name,
    });

    const reader = new FileReader();

    reader.onerror = () => {
      setUploadState({
        status: "error",
        message: "We could not read that file. Please try again.",
      });
    };

    reader.onload = (loadEvent) => {
      const text = loadEvent.target?.result ?? "";
      const rows = text
        .split(/\r?\n/)
        .map((row) => row.trim())
        .filter((row) => row.length > 0);
      const preview = rows.slice(0, 5).join("\n");

      const baseState = {
        status: "uploading",
        fileType,
        fileName: file.name,
        rowCount: rows.length,
        preview,
      };

      setUploadState(baseState);

      simulateBackendUpload(file, fileType)
        .then(() => {
          setUploadState({
            ...baseState,
            status: "success",
          });
        })
        .catch(() => {
          setUploadState({
            status: "error",
            message: "Our simulated upload failed. Please try again.",
          });
        });
    };

    reader.readAsText(file);
  };

  return (
    <section className="h-[700px] flex items-center justify-center px-6 py-24 text-white relative">
      <input
        ref={csvInputRef}
        type="file"
        accept=".csv,text/csv"
        onChange={(event) => handleFileChange(event, "csv")}
        className="sr-only"
      />
      <input
        ref={datInputRef}
        type="file"
        accept=".dat,text/plain"
        onChange={(event) => handleFileChange(event, "dat")}
        className="sr-only"
      />
      <div className="bg-black/50 border border-white/10 rounded-2xl max-w-3xl w-full p-8 backdrop-blur-md space-y-6 relative">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-3xl font-semibold" data-aos="fade-up">
            Bring Your Own Data
          </h2>
          <button
            onClick={onBack}
            className="rounded-md border border-white/40 px-4 py-2 text-sm font-medium text-white/80 hover:text-white hover:border-white/70 transition"
            data-aos="fade-up"
            data-aos-delay="100"
          >
            Back to Overview
          </button>
        </div>
        <p className="text-white/80 max-w-2xl" data-aos="fade-up" data-aos-delay="150">
          Upload a CSV or .dat file from your own observations to explore orbital patterns and transit signals.
        </p>
        <div className="grid gap-4 sm:grid-cols-2" data-aos="fade-up" data-aos-delay="200">
          <button
            onClick={() => handleUploadClick(csvInputRef)}
            disabled={isProcessing}
            className={`bg-blue-400 text-white px-4 py-3 rounded-lg font-semibold transition ${
              isProcessing
                ? "opacity-60 cursor-wait"
                : "hover:bg-blue-500"
            }`}
          >
            Upload CSV
          </button>
          <button
            onClick={() => handleUploadClick(datInputRef)}
            disabled={isProcessing}
            className={`bg-indigo-400 text-white px-4 py-3 rounded-lg font-semibold transition ${
              isProcessing
                ? "opacity-60 cursor-wait"
                : "hover:bg-indigo-500"
            }`}
          >
            Upload .dat
          </button>
          <button
            disabled
            className="bg-white/10 text-white/80 px-4 py-3 rounded-lg font-semibold border border-white/20 cursor-not-allowed"
          >
            Try Sample Data (Coming Soon)
          </button>
        </div>
        {uploadState.status === "reading" && (
          <div
            className="bg-blue-500/10 border border-blue-400/30 text-blue-100 rounded-lg p-4"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            Reading your file...
          </div>
        )}
        {uploadState.status === "uploading" && (
          <div
            className="bg-indigo-500/10 border border-indigo-400/30 text-indigo-100 rounded-lg p-4"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            Simulating a backend upload for your {uploadState.fileType?.toUpperCase()} file...
          </div>
        )}
        {uploadState.status === "error" && (
          <div
            className="bg-red-500/10 border border-red-400/40 text-red-100 rounded-lg p-4"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            {uploadState.message}
          </div>
        )}
        {uploadState.status === "success" && (
          <div
            className="bg-emerald-500/10 border border-emerald-400/40 text-emerald-100 rounded-lg p-4 space-y-3"
            data-aos="fade-up"
            data-aos-delay="250"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <p className="font-semibold">Loaded {uploadState.fileName}</p>
              <span className="text-sm text-emerald-200/80">
                {uploadState.rowCount} data rows detected in your simulated upload
              </span>
            </div>
            <p className="text-sm text-emerald-200/70">
              Simulated {uploadState.fileType?.toUpperCase()} file upload complete.
            </p>
            <div>
              <p className="text-sm text-emerald-200/70 mb-2">
                Preview (first rows):
              </p>
              <pre className="bg-black/40 text-white/90 text-xs rounded-md p-3 overflow-x-auto whitespace-pre-wrap">
                {uploadState.preview || "No preview available."}
              </pre>
            </div>
          </div>
        )}
        <div
          className="border-t border-white/10 pt-6 space-y-4"
          data-aos="fade-up"
          data-aos-delay="280"
        >
          <div className="space-y-1 text-white/80">
            <h3 className="text-lg font-semibold text-white">Sample Planet Insight</h3>
            <p className="text-sm">
              This preview pulls the first confirmed planet from the included NASA Kepler catalogue snapshot.
            </p>
          </div>
          <div className="flex justify-center">
            <PlanetDialog />
          </div>
        </div>
        {isProcessing && (
          <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center gap-4 rounded-2xl">
            <div className="w-12 h-12 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            <p className="text-white/90 text-sm tracking-wide uppercase">
              {loadingMessage}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default DataPortal;
