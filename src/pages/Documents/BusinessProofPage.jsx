import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  FiUploadCloud, 
  FiFileText, 
  FiUsers, 
  FiClipboard, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiArrowRight // <--- ADD THIS ICON
} from "react-icons/fi";

// Regex for CIN: L/U + 5 digits + 2 letters + 4 digits + 3 letters + 6 digits
// A simpler, commonly accepted check for structure: 21 alphanumeric characters.
const cinRegex = /^[LUu][0-9]{5}[A-Za-z]{2}[0-9]{4}[A-Za-z]{3}[0-9]{6}$/;

// --- FileInput Component (Reused from KYC) ---
function FileInput({ label, name, file, onChange, accept = "image/*,application/pdf" }) {
  return (
    <div className="mb-4">
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex items-center gap-3">
        <input
          type="file"
          name={name}
          accept={accept}
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
          className="block w-full text-sm text-gray-600
                     file:mr-4 file:py-2 file:px-4
                     file:rounded file:border-0
                     file:text-sm file:font-semibold
                     file:bg-gray-100 hover:file:bg-gray-200"
          aria-label={label}
        />
      </div>
      {file && (
        <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
          <FiCheckCircle size={14} className="text-green-500" /> {file.name}
        </p>
      )}
    </div>
  );
}

// --- Main Component ---
const  BusinessProofPage = () => {
  const [isPvtLtd, setIsPvtLtd] = useState(false); // Assume status based on company type state from parent
  const [regDocFile, setRegDocFile] = useState(null);
  const [cinNumber, setCinNumber] = useState("");
  const [directorsListFile, setDirectorsListFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Placeholder function for form validation
  function validateAll() {
    const e = {};
    
    if (!regDocFile) e.regDocFile = "Registration Document upload is mandatory.";
    
    if (cinNumber && !cinRegex.test(cinNumber.trim())) {
      e.cinNumber = "Invalid CIN format. (e.g., L12345DL2000PTC123456)";
    }
    
    // Conditional validation for Pvt Ltd
    if (isPvtLtd && !directorsListFile) {
      e.directorsListFile = "List of Directors is mandatory for Pvt Ltd companies.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  // Placeholder submission function
  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");

    // NOTE: In a real app, you would determine 'isPvtLtd' from the user's initial application state.
    // For this demonstration, we'll manually set it for testing the validation logic.
    // For example:
    // setIsPvtLtd(true);

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append("regDocFile", regDocFile);
      formData.append("cinNumber", cinNumber.trim());
      if (isPvtLtd && directorsListFile) {
        formData.append("directorsListFile", directorsListFile);
      }
      
      // Replace with your actual backend endpoint
      // const res = await fetch("/api/business-proof", { method: "POST", body: formData });
      
      // Simulate success delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // throw new Error("Simulated Server Error");

      setSuccessMsg("Business Proof submitted successfully!");
      // On success, you would typically navigate to the next form stage.
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  }

  // Function to simulate dynamic company type change
  const handleCompanyTypeToggle = () => {
    setIsPvtLtd(prev => !prev);
    // Clear conditional field when toggling
    setDirectorsListFile(null);
    setErrors({});
  };


  return (
    <div className="max-w-3xl mx-auto p-8  rounded-xl  mt-8 font-sans">
      <h2 className="text-2xl font-bold text-[#003366] mb-6 flex items-center gap-2 border-b pb-2">
        <FiFileText size={24} /> Business Registration & Ownership Proof
      </h2>

      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
          <FiAlertTriangle size={18} />
          Please review the highlighted errors.
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex items-center gap-2">
          <FiCheckCircle size={18} />
          {successMsg}
        </div>
      )}

      {/* Manual toggle for demonstration purposes */}
      <div className="mb-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
        <p className="text-sm font-semibold text-yellow-800 mb-2">
          <FiClipboard size={16} className="inline mr-1" />
          Simulate Company Type:
        </p>
        <button 
          onClick={handleCompanyTypeToggle}
          type="button"
          className={`px-3 py-1 rounded-full text-xs font-medium transition ${
            isPvtLtd ? 'bg-[#D50032] text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          {isPvtLtd ? 'Current: PRIVATE LTD (Directors Required)' : 'Current: OTHER (Directors Optional)'}
        </button>
      </div>


      <form onSubmit={handleSubmit} noValidate>
        
        {/* 1. Government Issued Registration Document */}
        <div className="mb-6 p-5 border rounded-lg bg-gray-50">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiFileText size={18} /> 1. Registration Document
            </h3>
            <FileInput
              label="Upload Government Issued Registration Proof (e.g., Udyam, Partnership Deed, MOA/AOA)"
              name="regDocFile"
              file={regDocFile}
              onChange={setRegDocFile}
              accept="image/*,application/pdf"
            />
            {errors.regDocFile && <p className="text-xs text-red-600 mt-1">{errors.regDocFile}</p>}
        </div>

        {/* 2. Corporate Identification Number (CIN) */}
        <div className="mb-6 p-5 border rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiClipboard size={18} /> 2. Corporate Identification Number (CIN)
            </h3>
            <input
              type="text"
              value={cinNumber}
              onChange={(e) => setCinNumber(e.target.value.toUpperCase())}
              placeholder="Enter CIN (e.g., L12345DL2000PTC123456)"
              className={`p-3 border rounded-lg w-full text-sm ${errors.cinNumber ? "border-red-500" : "border-gray-300"}`}
              aria-invalid={!!errors.cinNumber}
            />
            <p className="text-xs text-gray-500 mt-1">
                Required for Pvt/Public Ltd companies. Leave blank if not applicable.
            </p>
            {errors.cinNumber && <p className="text-xs text-red-600 mt-1">{errors.cinNumber}</p>}
        </div>

        {/* 3. List of Board of Directors (Conditional) */}
        <div className={`mb-6 p-5 border rounded-lg ${isPvtLtd ? 'bg-red-50 border-red-200' : 'bg-gray-50'}`}>
            <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <FiUsers size={18} /> 3. List of Board of Directors 
                {isPvtLtd && <span className="text-red-600 text-xs font-bold ml-2">(MANDATORY)</span>}
            </h3>
            <FileInput
              label="Upload List of Directors (Board Resolution/Statutory Filing)"
              name="directorsListFile"
              file={directorsListFile}
              onChange={setDirectorsListFile}
              accept="image/*,application/pdf"
            />
            <p className="text-xs text-gray-500 mt-1">
                Only required for Private Limited and Public Limited companies.
            </p>
            {errors.directorsListFile && <p className="text-xs text-red-600 mt-1">{errors.directorsListFile}</p>}
        </div>


        {errors.submit && <p className="text-sm text-red-600 mb-4">{errors.submit}</p>}

        <div className="flex justify-end gap-3 mt-8">
          {/* <button
            type="submit"
            disabled={submitting}
            className={`px-6 py-3 rounded-xl text-white font-semibold transition flex items-center gap-2 ${
              submitting ? "bg-gray-400 cursor-not-allowed" : "bg-[#003366] hover:bg-[#002244]"
            }`}
          >
            {submitting ? (
              <>
                <FiUploadCloud className="animate-spin" /> Submitting...
              </>
            ) : (
              <>
                Save & Continue <FiArrowRight size={18} />
              </>
            )}
          </button> */}

          <Link to="/income-proof-upload" style={{ textDecoration: 'none' }}>
            <button
              type="button" // Use type="button" to prevent accidental form submission
              className="px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1"
            >
              Submit & Proceed <FiArrowRight size={16} />
            </button>
          </Link>
        </div>
      </form>
    </div>
  );
}

export default BusinessProofPage;