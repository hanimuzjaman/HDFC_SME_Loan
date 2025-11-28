import React, { useState } from "react";
import { Link } from "react-router-dom";
import { 
  FiUploadCloud, 
  FiFileText, 
  FiAlertTriangle, 
  FiCheckCircle,
  FiArrowRight,
  FiTrendingUp, 
  FiDollarSign 
} from "react-icons/fi";



// --- FileInput Component (Reusable) ---
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
                     file:rounded-xl file:border-0
                     file:text-sm file:font-semibold
                     file:bg-blue-50 hover:file:bg-blue-100"
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
export default function IncomeProofPage() {
  // State for 3 sets of documents (P&L, BS, ITR)
  const [plFiles, setPlFiles] = useState([null, null, null]);
  const [bsFiles, setBsFiles] = useState([null, null, null]);
  const [itrFiles, setItrFiles] = useState([null, null, null]);
  
  // State for Bank Statements
  const [bankStatementFile, setBankStatementFile] = useState(null);
  
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  // Helper to update state array for multi-year documents
  const updateFileArray = (setter, index, file) => {
    setter(s => s.map((f, i) => (i === index ? file : f)));
  };

  function validateAll() {
    const e = {};
    
    // Validate 3 years of P&L, BS, ITR
    for (let i = 0; i < 3; i++) {
      if (!plFiles[i]) {
        e[`plFile_${i}`] = `P&L for FY${i + 1} is required.`;
      }
      if (!bsFiles[i]) {
        e[`bsFile_${i}`] = `Balance Sheet for FY${i + 1} is required.`;
      }
      if (!itrFiles[i]) {
        e[`itrFile_${i}`] = `ITR for FY${i + 1} is required.`;
      }
    }
    
    // Validate Bank Statement
    if (!bankStatementFile) {
        e.bankStatementFile = "Last 6-12 months Bank Statement is mandatory.";
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setSuccessMsg("");

    if (!validateAll()) {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    setSubmitting(true);

    try {
      const formData = new FormData();
      
      // Append multi-year files
      plFiles.forEach((f, i) => formData.append(`pl_fy${i+1}`, f));
      bsFiles.forEach((f, i) => formData.append(`bs_fy${i+1}`, f));
      itrFiles.forEach((f, i) => formData.append(`itr_fy${i+1}`, f));
      
      // Append bank statement
      formData.append("bankStatementFile", bankStatementFile);
      
      // Replace with your actual backend endpoint
      // const res = await fetch("/api/income-proof", { method: "POST", body: formData });
      
      // Simulate success delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      // throw new Error("Simulated Server Error");

      setSuccessMsg("Income Proof submitted successfully!");
      // On success, you would typically navigate to the final submission page
      // navigate('/final-submission'); 
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  }


  return (
    <div className="max-w-4xl mx-auto p-0 mt-8 font-sans overflow-hidden ">
      
      {/* 🛑 Stepped Header */}
      <header className={`py-6 text-blue-950 flex items-center justify-between`}>
          <div className="flex items-center gap-3">
              <FiTrendingUp size={30} className="text-white" />
              <div>
                  <p className="text-sm font-light uppercase tracking-widest">Step 3 of 4</p>
                  <h2 className="text-xl font-bold">Income & Financial Proof</h2>
              </div>
          </div>
      </header>


      <div className="p-8">

        {/* --- Alerts --- */}
        {Object.keys(errors).length > 0 && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded text-sm text-red-700 flex items-center gap-2">
            <FiAlertTriangle size={18} />
            Please fix all mandatory errors (3 consecutive years required).
          </div>
        )}
        {successMsg && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded text-sm text-green-800 flex items-center gap-2">
            <FiCheckCircle size={18} />
            {successMsg}
          </div>
        )}


        <form onSubmit={handleSubmit} noValidate>
          
          {/* 1. Financial Statements (3 Years) */}
          <div className="mb-8 p-6 border-2 rounded-xl border-blue-100 bg-blue-50">
            <h3 className={`font-bold text-xl text-blue-900 mb-4 flex items-center gap-2 border-b border-blue-200 pb-2`}>
                <FiFileText size={22} /> Financial Statements (3 Consecutive Years)
            </h3>
            
            <div className="grid grid-cols-3 gap-4 text-center mb-4 text-sm font-semibold text-gray-700">
                <span>P&L Statement</span>
                <span>Balance Sheet</span>
                <span>Income Tax Return (ITR)</span>
            </div>

            {/* Loop for 3 Financial Years (FY) */}
            {[1, 2, 3].map(fy => (
                <div key={fy} className="grid grid-cols-3 gap-4 mb-4 items-start p-3 border-t border-gray-200">
                    
                    {/* P&L */}
                    <div>
                        <FileInput
                            label={`P&L - FY ${fy}`}
                            name={`pl_fy${fy}`}
                            file={plFiles[fy - 1]}
                            onChange={(f) => updateFileArray(setPlFiles, fy - 1, f)}
                        />
                        {errors[`plFile_${fy - 1}`] && <p className="text-2xs text-red-600 mt-1">{errors[`plFile_${fy - 1}`]}</p>}
                    </div>
                    
                    {/* Balance Sheet */}
                    <div>
                        <FileInput
                            label={`Balance Sheet - FY ${fy}`}
                            name={`bs_fy${fy}`}
                            file={bsFiles[fy - 1]}
                            onChange={(f) => updateFileArray(setBsFiles, fy - 1, f)}
                        />
                        {errors[`bsFile_${fy - 1}`] && <p className="text-2xs text-red-600 mt-1">{errors[`bsFile_${fy - 1}`]}</p>}
                    </div>

                    {/* ITR */}
                    <div>
                        <FileInput
                            label={`ITR - FY ${fy}`}
                            name={`itr_fy${fy}`}
                            file={itrFiles[fy - 1]}
                            onChange={(f) => updateFileArray(setItrFiles, fy - 1, f)}
                        />
                        {errors[`itrFile_${fy - 1}`] && <p className="text-2xs text-red-600 mt-1">{errors[`itrFile_${fy - 1}`]}</p>}
                    </div>
                </div>
            ))}
          </div>

          {/* 2. Bank Statement Proof */}
          <div className="mb-8 p-6 border rounded-xl bg-gray-50">
            <h3 className="font-bold text-xl text-gray-800 mb-4 flex items-center gap-2 border-b border-gray-300 pb-2">
                <FiDollarSign size={22} /> Business Bank Statement
            </h3>
            <div className="md:w-1/2">
                <FileInput
                    label="Upload Last 6 to 12 Months Bank Statement"
                    name="bankStatementFile"
                    file={bankStatementFile}
                    onChange={setBankStatementFile}
                    accept="image/*,application/pdf"
                />
            </div>
            <p className="text-xs text-gray-500 mt-1">
                Statement must be comprehensive, covering the latest 6-12 months of business transactions.
            </p>
            {errors.bankStatementFile && <p className="text-xs text-red-600 mt-1">{errors.bankStatementFile}</p>}
          </div>


          {errors.submit && <p className="text-sm text-red-600 mb-4">{errors.submit}</p>}

          <div className="flex justify-end gap-3 mt-8">
            {/* <button
              type="submit"
              disabled={submitting}
              className={`px-6 py-3 rounded-xl text-white font-semibold transition flex items-center gap-2 shadow-md ${
                submitting ? "bg-gray-400 cursor-not-allowed" : `bg-blue-950 hover:bg-[#002244]`
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
            <Link to="/dashboard" style={{ textDecoration: 'none' }}>
              <button
                type="button" // Use type="button" to prevent accidental form submission
                className="px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1"
              >
                Proceed to Dashboard <FiArrowRight size={16} />
              </button>
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}