import React, { useState, useRef, useEffect } from "react";
import { uploadElectricityData } from "../api";

export default function ElectricityUploadModal({ open, onClose }) {
  const [month, setMonth] = useState('');
  const [baseline, setBaseline] = useState('');
  const [consumption, setConsumption] = useState('');
  const [files, setFiles] = useState([]);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [previewFile, setPreviewFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errors, setErrors] = useState({});
  const fileInputRef = useRef();

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleBaselineChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setBaseline(value);
    }
  };

  const handleConsumptionChange = (e) => {
    const value = e.target.value;
    if (value === '' || (/^\d*\.?\d*$/.test(value) && parseFloat(value) >= 0)) {
      setConsumption(value);
    }
  };

  // Only allow images and PDFs
  const allowedTypes = [
    "image/png", "image/jpeg", "image/jpg", "image/gif", "image/bmp", "image/webp", "application/pdf"
  ];
  const handleFilesChange = (e) => {
    const newFiles = Array.from(e.target.files).filter(
      (file) => allowedTypes.includes(file.type)
    );
    setFiles(prev =>
      [...prev, ...newFiles].filter(
        (file, idx, arr) =>
          arr.findIndex(f => f.name === file.name && f.size === file.size) === idx
      )
    );
    e.target.value = '';
    if (Array.from(e.target.files).some(file => !allowedTypes.includes(file.type))) {
      setMessage("Only images and PDFs are allowed.");
    }
  };

  const handleRemoveFile = (idx) => {
    setFiles(files => files.filter((_, i) => i !== idx));
  };

  const handlePreview = (file) => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setPreviewFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleClosePreview = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setPreviewFile(null);
  };

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const getFileIcon = (file) => {
    if (file.type.startsWith("image/")) {
      return (
        <svg className="inline-block w-5 h-5 text-blue-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect width="20" height="16" x="2" y="4" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/>
          <circle cx="8" cy="10" r="2" strokeWidth="2" stroke="currentColor" fill="none"/>
          <path stroke="currentColor" strokeWidth="2" d="M21 15l-5-5L5 21"/>
        </svg>
      );
    }
    if (file.type === "application/pdf") {
      return (
        <svg className="inline-block w-5 h-5 text-red-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <rect width="16" height="20" x="4" y="2" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/>
          <path stroke="currentColor" strokeWidth="2" d="M8 6h8M8 10h8M8 14h6"/>
        </svg>
      );
    }
    return (
      <svg className="inline-block w-5 h-5 text-gray-500 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <rect width="16" height="20" x="4" y="2" rx="2" strokeWidth="2" stroke="currentColor" fill="none"/>
        <path stroke="currentColor" strokeWidth="2" d="M8 6h8M8 10h8M8 14h6"/>
      </svg>
    );
  };

  const validateFields = () => {
    const errs = {};
    if (!month) errs.month = "Month is required.";
    if (!baseline || isNaN(baseline) || Number(baseline) < 0) errs.baseline = "Baseline must be a positive number.";
    if (!consumption || isNaN(consumption) || Number(consumption) < 0) errs.consumption = "Consumption must be a positive number.";
    if (!files.length) errs.files = "Please attach at least one file.";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const resetForm = () => {
    setMonth('');
    setBaseline('');
    setConsumption('');
    setFiles([]);
    setMessage('');
    setErrors({});
    setPreviewFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!validateFields()) return;

    setSaving(true);
    const formData = new FormData();
    formData.append('month', month);
    formData.append('baseline', baseline);
    formData.append('consumption_kwh', consumption);
    files.forEach((file) => {
      formData.append('attachments', file);
    });

    try {
      const token = localStorage.getItem("token");
      let data = await uploadElectricityData(formData, token);

      if (data.exists) {
        if (window.confirm("Data for this month and year already exists. Update instead?")) {
          formData.append('forceUpdate', 'true');
          data = await uploadElectricityData(formData, token);
          if (data.success) {
            setMessage("Updated successfully!");
            setTimeout(() => {
              setMessage('');
              handleClose();
            }, 1000);
          } else {
            setMessage(data.message || "Error updating data");
          }
        }
      } else if (data.success) {
        setMessage("Saved successfully!");
        setTimeout(() => {
          setMessage('');
          handleClose();
        }, 1000);
      } else {
        setMessage(data.message || "Error saving data");
      }
    } catch (err) {
      setMessage("Error saving data");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 relative animate-fadeIn my-4 max-h-[90vh] overflow-y-auto">
        <h3 className="text-xl font-bold mb-6 text-blue-900 sticky top-0 bg-white pt-2 z-10">
          Upload Monthly Electricity Consumption
        </h3>
        <form onSubmit={handleSave} autoComplete="off">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
            <select
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              value={month}
              onChange={e => setMonth(e.target.value)}
              required
            >
              <option value="">Select Month</option>
              {months.map(m => (
                <option key={m} value={m}>{m}</option>
              ))}
            </select>
            {errors.month && <div className="text-red-600 text-xs mt-1">{errors.month}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Consumption Baseline (Peso)</label>
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              min="0"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 no-spinner"
              value={baseline}
              onChange={handleBaselineChange}
              placeholder="Enter Peso"
              required
              autoComplete="off"
            />
            {errors.baseline && <div className="text-red-600 text-xs mt-1">{errors.baseline}</div>}
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Consumption (kWh)</label>
            <input
              type="text"
              inputMode="decimal"
              pattern="^\d*\.?\d*$"
              min="0"
              className="w-full border border-gray-300 px-3 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400 no-spinner"
              value={consumption}
              onChange={handleConsumptionChange}
              placeholder="Enter kWh"
              required
              autoComplete="off"
            />
            {errors.consumption && <div className="text-red-600 text-xs mt-1">{errors.consumption}</div>}
          </div>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">Attach File(s)</label>
            <input
              ref={fileInputRef}
              type="file"
              className="w-full"
              multiple
              onChange={handleFilesChange}
              accept={allowedTypes.join(",")}
              style={{ color: "transparent" }}
            />
            {errors.files && <div className="text-red-600 text-xs mt-1">{errors.files}</div>}
            <div
              className="mt-2 flex flex-col gap-2 bg-gray-50 rounded border border-gray-200 max-h-40 overflow-y-auto p-2"
              style={{ minHeight: files.length ? "48px" : undefined }}
            >
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center bg-gray-100 rounded px-3 py-1 mb-1">
                  <button
                    type="button"
                    className="flex items-center flex-1 hover:bg-blue-100 rounded text-left focus:outline-none"
                    onClick={() => handlePreview(file)}
                    tabIndex={0}
                  >
                    {getFileIcon(file)}
                    <span className="truncate">{file.name}</span>
                  </button>
                  <button
                    type="button"
                    className="ml-2 text-red-500 hover:text-red-700 font-bold text-lg px-2 focus:outline-none"
                    onClick={() => handleRemoveFile(idx)}
                    aria-label="Remove file"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
          {message && (
            <div className={`mb-4 ${message.includes("success") ? "bg-green-50 border-l-4 border-green-500" : "bg-red-50 border-l-4 border-red-500"} p-4 rounded-md animate-fadeIn`}>
              <p className="text-sm">{message}</p>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <button
              type="button"
              className="px-5 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 font-semibold transition-colors"
              onClick={handleClose}
              disabled={saving}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-semibold transition-colors flex items-center"
              disabled={saving}
            >
              {saving ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : (
                "Save"
              )}
            </button>
          </div>
        </form>
        <button
          className="fixed top-3 right-3 text-gray-400 hover:text-gray-700 text-2xl font-bold focus:outline-none bg-white rounded-full w-8 h-8 flex items-center justify-center shadow-md z-20"
          onClick={handleClose}
          aria-label="Close"
        >
          ×
        </button>
        {/* Preview Modal */}
        {previewFile && previewUrl && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50">
            <div className="bg-white rounded-lg p-4 max-w-2xl w-full relative">
              <button
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 text-2xl font-bold"
                onClick={handleClosePreview}
                aria-label="Close Preview"
              >
                ×
              </button>
              <div className="flex flex-col items-center">
                <h4 className="mb-4 font-semibold">{previewFile.name}</h4>
                {previewFile.type.startsWith("image/") ? (
                  <img
                    src={previewUrl}
                    alt={previewFile.name}
                    className="max-h-96 max-w-full rounded shadow"
                  />
                ) : previewFile.type === "application/pdf" ? (
                  <iframe
                    src={previewUrl}
                    title={previewFile.name}
                    className="w-full h-96 rounded shadow"
                  />
                ) : (
                  <p>Preview not available for this file type.</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}