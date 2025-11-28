import React, { useState, useRef, useEffect } from "react"; // Consolidated React imports
import { Link } from "react-router-dom";
// import axios from "axios"; // Keeping axios import style for consistency, though fetch is used

/**
 * KYC_Upload.jsx
 * - React component for KYC form submission (multipart/form-data).
 * - Includes state management, input validation (PAN, Aadhaar), and file preview components.
 */

const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
const aadhaarRegex = /^\d{12}$/;

// --- FileInput Component ---
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
        {file ? (
          <FilePreview file={file} />
        ) : (
          <span className="text-xs text-gray-400">No file chosen</span>
        )}
      </div>
    </div>
  );
}

// --- FilePreview Component ---
function FilePreview({ file }) {
  // show thumbnail for images; otherwise show filename
  const isImage = file.type && file.type.startsWith("image");
  const [blobUrl, setBlobUrl] = useState(null);

  // Use useEffect for managing object URLs
  useEffect(() => {
    if (!file) return;
    if (isImage) {
      const url = URL.createObjectURL(file);
      setBlobUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setBlobUrl(null);
    }
  }, [file, isImage]);

  return (
    <div className="flex items-center gap-2">
      {isImage && blobUrl ? (
        <img src={blobUrl} alt="preview" className="w-16 h-12 object-cover rounded border" />
      ) : (
        <div className="px-2 py-1 text-xs bg-gray-100 rounded border text-gray-600">
          {file.name}
        </div>
      )}
    </div>
  );
}

// 🛑 Main Component: Using const declaration with required logic fixes
const KYC_Upload = () => { 
  const [businessPAN, setBusinessPAN] = useState("");
  const [ownerPANs, setOwnerPANs] = useState([""]); 
  const [ownerAadhaars, setOwnerAadhaars] = useState([""]);
  const [officeAddressProof, setOfficeAddressProof] = useState(null);
  const [businessPANFile, setBusinessPANFile] = useState(null);
  const [ownerPANFiles, setOwnerPANFiles] = useState([null]);
  const [ownerAadharFiles, setOwnerAadharFiles] = useState([null]);
  const [mailAddress, setMailAddress] = useState("");
  const [permanentAddress, setPermanentAddress] = useState("");
  const [sameAsMail, setSameAsMail] = useState(false);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  // const fileInputRef = useRef(); // Removed unused ref

  function addOwner() {
    setOwnerPANs((s) => [...s, ""]);
    setOwnerAadhaars((s) => [...s, ""]);
    setOwnerPANFiles((s) => [...s, null]);
    setOwnerAadharFiles((s) => [...s, null]);
  }
  function removeOwner(idx) {
    if (idx === 0 && ownerPANs.length === 1) return;
    setOwnerPANs((s) => s.filter((_, i) => i !== idx));
    setOwnerAadhaars((s) => s.filter((_, i) => i !== idx));
    setOwnerPANFiles((s) => s.filter((_, i) => i !== idx));
    setOwnerAadharFiles((s) => s.filter((_, i) => i !== idx));
  }

  useEffect(() => {
    if (sameAsMail) setPermanentAddress(mailAddress);
  }, [sameAsMail, mailAddress]);

  function validateAll() {
    const e = {};
    if (!businessPAN) e.businessPAN = "Business PAN is required.";
    else if (!panRegex.test(businessPAN.trim())) e.businessPAN = "Invalid PAN format.";

    ownerPANs.forEach((p, i) => {
      if (!p) e[`ownerPAN_${i}`] = "Owner PAN required.";
      else if (!panRegex.test(p.trim())) e[`ownerPAN_${i}`] = "Invalid PAN format.";
    });

    ownerAadhaars.forEach((a, i) => {
      if (!a) e[`ownerAadhaar_${i}`] = "Owner Aadhaar required.";
      else if (!aadhaarRegex.test(a.trim())) e[`ownerAadhaar_${i}`] = "Aadhaar must be 12 digits.";
    });

    if (!mailAddress) e.mailAddress = "Mail address is required.";
    if (!permanentAddress) e.permanentAddress = "Permanent address is required.";

    if (!businessPANFile) e.businessPANFile = "Upload business PAN copy.";
    ownerPANFiles.forEach((f, i) => {
      if (!f) e[`ownerPANFile_${i}`] = "Upload owner's PAN.";
    });
    ownerAadharFiles.forEach((f, i) => {
      if (!f) e[`ownerAadhaarFile_${i}`] = "Upload owner's Aadhaar.";
    });
    if (!officeAddressProof) e.officeAddressProof = "Upload office address proof.";

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
      formData.append("businessPAN", businessPAN.trim());
      formData.append("businessPANFile", businessPANFile);
      ownerPANs.forEach((p, i) => {
        formData.append(`owners[${i}][pan]`, p.trim());
        if (ownerPANFiles[i]) formData.append(`owners[${i}][panFile]`, ownerPANFiles[i]);
        formData.append(`owners[${i}][aadhaar]`, ownerAadhaars[i].trim());
        if (ownerAadharFiles[i]) formData.append(`owners[${i}][aadhaarFile]`, ownerAadharFiles[i]);
      });
      formData.append("officeAddressProof", officeAddressProof);
      formData.append("mailAddress", mailAddress);
      formData.append("permanentAddress", permanentAddress);

      // Example fetch — ensure the URL is correct for your backend
      const res = await fetch("/api/kyc", { 
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || "Server error");
      }

      setSuccessMsg("KYC submitted successfully.");
      // resetAll();
    } catch (err) {
      console.error(err);
      setErrors({ submit: err.message || "Submission failed" });
    } finally {
      setSubmitting(false);
    }
  }

  function resetAll() {
    setBusinessPAN("");
    setOwnerPANs([""]);
    setOwnerAadhaars([""]);
    setBusinessPANFile(null);
    setOwnerPANFiles([null]);
    setOwnerAadharFiles([null]);
    setOfficeAddressProof(null);
    setMailAddress("");
    setPermanentAddress("");
    setErrors({});
    setSuccessMsg("");
  }

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
      <h2 className="text-2xl font-semibold mb-4">KYC Verification — Business</h2>

      {Object.keys(errors).length > 0 && (
        <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
          Please fix the highlighted errors before submitting.
        </div>
      )}
      {successMsg && (
        <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded text-sm text-green-800">
          {successMsg}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        {/* Business PAN */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">PAN Card of the Business</label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            <input
              type="text"
              value={businessPAN}
              onChange={(e) => setBusinessPAN(e.target.value.toUpperCase())}
              placeholder="AAAAA0000A"
              className={`p-3 border rounded w-full text-sm ${errors.businessPAN ? "border-red-500" : "border-gray-200"}`}
              aria-invalid={!!errors.businessPAN}
            />
            <div>
              <FileInput
                label="Upload Business PAN (image/pdf)"
                name="businessPANFile"
                file={businessPANFile}
                onChange={(f) => setBusinessPANFile(f)}
              />
              {errors.businessPANFile && <p className="text-xs text-red-600 mt-1">{errors.businessPANFile}</p>}
            </div>
          </div>
          {errors.businessPAN && <p className="text-xs text-red-600 mt-1">{errors.businessPAN}</p>}
        </div>

        {/* Owners - dynamic */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium">PAN & Aadhaar of Business Owner(s)</h3>
            <button
              type="button"
              onClick={addOwner}
              className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              + Add Owner
            </button>
          </div>

          {ownerPANs.map((_, idx) => (
            <div key={idx} className="mt-4 p-4 border rounded bg-gray-50">
              <div className="flex justify-between items-start">
                <h4 className="font-medium">Owner #{idx + 1}</h4>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => removeOwner(idx)}
                    className="text-xs text-red-600 hover:underline"
                    aria-label={`Remove owner ${idx + 1}`}
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
                <div>
                  <label className="block text-sm text-gray-700">Owner PAN</label>
                  <input
                    type="text"
                    value={ownerPANs[idx]}
                    onChange={(e) => {
                      const val = e.target.value.toUpperCase();
                      setOwnerPANs((s) => s.map((x, i) => (i === idx ? val : x)));
                    }}
                    placeholder="AAAAA0000A"
                    className={`p-2 border rounded w-full text-sm ${errors[`ownerPAN_${idx}`] ? "border-red-500" : "border-gray-200"}`}
                    aria-invalid={!!errors[`ownerPAN_${idx}`]}
                  />
                  {errors[`ownerPAN_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerPAN_${idx}`]}</p>}
                </div>

                <div>
                  <FileInput
                    label="Upload Owner PAN (image/pdf)"
                    name={`ownerPANFile_${idx}`}
                    file={ownerPANFiles[idx]}
                    onChange={(f) => setOwnerPANFiles((s) => s.map((x, i) => (i === idx ? f : x)))}
                  />
                  {errors[`ownerPANFile_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerPANFile_${idx}`]}</p>}
                </div>

                <div>
                  <label className="block text-sm text-gray-700">Owner Aadhaar (12 digits)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    value={ownerAadhaars[idx]}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "");
                      setOwnerAadhaars((s) => s.map((x, i) => (i === idx ? val : x)));
                    }}
                    placeholder="123412341234"
                    className={`p-2 border rounded w-full text-sm ${errors[`ownerAadhaar_${idx}`] ? "border-red-500" : "border-gray-200"}`}
                    aria-invalid={!!errors[`ownerAadhaar_${idx}`]}
                    maxLength={12}
                  />
                  {errors[`ownerAadhaar_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerAadhaar_${idx}`]}</p>}
                </div>

                <div>
                  <FileInput
                    label="Upload Owner Aadhaar (image/pdf)"
                    name={`ownerAadharFile_${idx}`}
                    file={ownerAadharFiles[idx]}
                    onChange={(f) => setOwnerAadharFiles((s) => s.map((x, i) => (i === idx ? f : x)))}
                  />
                  {errors[`ownerAadhaarFile_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerAadhaarFile_${idx}`]}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Office Address Proof */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700">Address Proof of the Business Office</label>
          <div className="mt-2">
            <FileInput
              label="Upload office address proof (rent agreement / utility bill)"
              name="officeAddressProof"
              file={officeAddressProof}
              onChange={(f) => setOfficeAddressProof(f)}
              accept="image/*,application/pdf"
            />
            {errors.officeAddressProof && <p className="text-xs text-red-600">{errors.officeAddressProof}</p>}
          </div>
        </div>

        {/* Mail & Permanent Address */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Mail Address</label>
            <textarea
              value={mailAddress}
              onChange={(e) => setMailAddress(e.target.value)}
              rows={4}
              className={`mt-2 p-3 border rounded w-full text-sm ${errors.mailAddress ? "border-red-500" : "border-gray-200"}`}
            />
            {errors.mailAddress && <p className="text-xs text-red-600">{errors.mailAddress}</p>}
          </div>

          <div>
            <div className="flex items-center justify-between">
              <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
              <div className="flex items-center gap-2">
                <input id="same" type="checkbox" checked={sameAsMail} onChange={(e) => setSameAsMail(e.target.checked)} />
                <label htmlFor="same" className="text-xs text-gray-600">Same as mail</label>
              </div>
            </div>

            <textarea
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              rows={4}
              className={`mt-2 p-3 border rounded w-full text-sm ${errors.permanentAddress ? "border-red-500" : "border-gray-200"}`}
              disabled={sameAsMail}
            />
            {errors.permanentAddress && <p className="text-xs text-red-600">{errors.permanentAddress}</p>}
          </div>
        </div>

        {errors.submit && <p className="text-sm text-red-600 mb-4">{errors.submit}</p>}

        <div className="flex items-center justify-end gap-3">
          <Link to="/business-proof-upload" style={{ textDecoration: 'none' }}>
            <button
              type="button" // Use type="button" to prevent accidental form submission
              className="px-4 py-2 rounded text-white bg-indigo-600 hover:bg-indigo-700 transition flex items-center gap-1"
            >
              Submit & Proceed to Business Proof
            </button>
          </Link>

          <button
            type="button"
            onClick={resetAll}
            className="px-3 py-2 border rounded text-sm text-gray-700"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
}

export default KYC_Upload;



// import React, { useState, useRef, useEffect } from "react"; // Consolidated React imports
// // import axios from "axios"; // Keeping axios import style for consistency, though fetch is used

// /**
//  * KYC_Upload.jsx
//  * - React component for KYC form submission (multipart/form-data).
//  * - Includes state management, input validation (PAN, Aadhaar), and file preview components.
//  */

// const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]$/i;
// const aadhaarRegex = /^\d{12}$/;

// // --- FileInput Component ---
// function FileInput({ label, name, file, onChange, accept = "image/*,application/pdf" }) {
//   return (
//     <div className="mb-4">
//       <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
//       <div className="flex items-center gap-3">
//         <input
//           type="file"
//           name={name}
//           accept={accept}
//           onChange={(e) => onChange(e.target.files?.[0] ?? null)}
//           className="block w-full text-sm text-gray-600
//                      file:mr-4 file:py-2 file:px-4
//                      file:rounded file:border-0
//                      file:text-sm file:font-semibold
//                      file:bg-gray-100 hover:file:bg-gray-200"
//           aria-label={label}
//         />
//         {file ? (
//           <FilePreview file={file} />
//         ) : (
//           <span className="text-xs text-gray-400">No file chosen</span>
//         )}
//       </div>
//     </div>
//   );
// }

// // --- FilePreview Component ---
// function FilePreview({ file }) {
//   // show thumbnail for images; otherwise show filename
//   const isImage = file.type && file.type.startsWith("image");
//   const [blobUrl, setBlobUrl] = useState(null);

//   // Use useEffect for managing object URLs
//   useEffect(() => {
//     if (!file) return;
//     if (isImage) {
//       const url = URL.createObjectURL(file);
//       setBlobUrl(url);
//       return () => URL.revokeObjectURL(url);
//     } else {
//       setBlobUrl(null);
//     }
//   }, [file, isImage]);

//   return (
//     <div className="flex items-center gap-2">
//       {isImage && blobUrl ? (
//         <img src={blobUrl} alt="preview" className="w-16 h-12 object-cover rounded border" />
//       ) : (
//         <div className="px-2 py-1 text-xs bg-gray-100 rounded border text-gray-600">
//           {file.name}
//         </div>
//       )}
//     </div>
//   );
// }

// // 🛑 Main Component: Exported as KYC_Upload
// const  KYC_Upload = () => { 
//   const [businessPAN, setBusinessPAN] = useState("");
//   const [ownerPANs, setOwnerPANs] = useState([""]); 
//   const [ownerAadhaars, setOwnerAadhaars] = useState([""]);
//   const [officeAddressProof, setOfficeAddressProof] = useState(null);
//   const [businessPANFile, setBusinessPANFile] = useState(null);
//   const [ownerPANFiles, setOwnerPANFiles] = useState([null]);
//   const [ownerAadharFiles, setOwnerAadharFiles] = useState([null]);
//   const [mailAddress, setMailAddress] = useState("");
//   const [permanentAddress, setPermanentAddress] = useState("");
//   const [sameAsMail, setSameAsMail] = useState(false);
//   const [errors, setErrors] = useState({});
//   const [submitting, setSubmitting] = useState(false);
//   const [successMsg, setSuccessMsg] = useState("");
//   // const fileInputRef = useRef(); // Removed unused ref

//   function addOwner() {
//     setOwnerPANs((s) => [...s, ""]);
//     setOwnerAadhaars((s) => [...s, ""]);
//     setOwnerPANFiles((s) => [...s, null]);
//     setOwnerAadharFiles((s) => [...s, null]);
//   }
//   function removeOwner(idx) {
//     if (idx === 0 && ownerPANs.length === 1) return;
//     setOwnerPANs((s) => s.filter((_, i) => i !== idx));
//     setOwnerAadhaars((s) => s.filter((_, i) => i !== idx));
//     setOwnerPANFiles((s) => s.filter((_, i) => i !== idx));
//     setOwnerAadharFiles((s) => s.filter((_, i) => i !== idx));
//   }

//   useEffect(() => {
//     if (sameAsMail) setPermanentAddress(mailAddress);
//   }, [sameAsMail, mailAddress]);

//   function validateAll() {
//     const e = {};
//     if (!businessPAN) e.businessPAN = "Business PAN is required.";
//     else if (!panRegex.test(businessPAN.trim())) e.businessPAN = "Invalid PAN format.";

//     ownerPANs.forEach((p, i) => {
//       if (!p) e[`ownerPAN_${i}`] = "Owner PAN required.";
//       else if (!panRegex.test(p.trim())) e[`ownerPAN_${i}`] = "Invalid PAN format.";
//     });

//     ownerAadhaars.forEach((a, i) => {
//       if (!a) e[`ownerAadhaar_${i}`] = "Owner Aadhaar required.";
//       else if (!aadhaarRegex.test(a.trim())) e[`ownerAadhaar_${i}`] = "Aadhaar must be 12 digits.";
//     });

//     if (!mailAddress) e.mailAddress = "Mail address is required.";
//     if (!permanentAddress) e.permanentAddress = "Permanent address is required.";

//     if (!businessPANFile) e.businessPANFile = "Upload business PAN copy.";
//     ownerPANFiles.forEach((f, i) => {
//       if (!f) e[`ownerPANFile_${i}`] = "Upload owner's PAN.";
//     });
//     ownerAadharFiles.forEach((f, i) => {
//       if (!f) e[`ownerAadhaarFile_${i}`] = "Upload owner's Aadhaar.";
//     });
//     if (!officeAddressProof) e.officeAddressProof = "Upload office address proof.";

//     setErrors(e);
//     return Object.keys(e).length === 0;
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     setSuccessMsg("");
//     if (!validateAll()) {
//       window.scrollTo({ top: 0, behavior: "smooth" });
//       return;
//     }
//     setSubmitting(true);

//     try {
//       const formData = new FormData();
//       formData.append("businessPAN", businessPAN.trim());
//       formData.append("businessPANFile", businessPANFile);
//       ownerPANs.forEach((p, i) => {
//         formData.append(`owners[${i}][pan]`, p.trim());
//         if (ownerPANFiles[i]) formData.append(`owners[${i}][panFile]`, ownerPANFiles[i]);
//         formData.append(`owners[${i}][aadhaar]`, ownerAadhaars[i].trim());
//         if (ownerAadharFiles[i]) formData.append(`owners[${i}][aadhaarFile]`, ownerAadharFiles[i]);
//       });
//       formData.append("officeAddressProof", officeAddressProof);
//       formData.append("mailAddress", mailAddress);
//       formData.append("permanentAddress", permanentAddress);

//       // Example fetch — ensure the URL is correct for your backend
//       const res = await fetch("/api/kyc", { 
//         method: "POST",
//         body: formData,
//       });

//       if (!res.ok) {
//         const text = await res.text();
//         throw new Error(text || "Server error");
//       }

//       setSuccessMsg("KYC submitted successfully.");
//       // resetAll();
//     } catch (err) {
//       console.error(err);
//       setErrors({ submit: err.message || "Submission failed" });
//     } finally {
//       setSubmitting(false);
//     }
//   }

//   function resetAll() {
//     setBusinessPAN("");
//     setOwnerPANs([""]);
//     setOwnerAadhaars([""]);
//     setBusinessPANFile(null);
//     setOwnerPANFiles([null]);
//     setOwnerAadharFiles([null]);
//     setOfficeAddressProof(null);
//     setMailAddress("");
//     setPermanentAddress("");
//     setErrors({});
//     setSuccessMsg("");
//   }

//   return (
//     <div className="max-w-3xl mx-auto p-6 bg-white rounded shadow mt-8">
//       <h2 className="text-2xl font-semibold mb-4">KYC Verification — Business</h2>

//       {Object.keys(errors).length > 0 && (
//         <div className="mb-4 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
//           Please fix the highlighted errors before submitting.
//         </div>
//       )}
//       {successMsg && (
//         <div className="mb-4 p-3 bg-green-50 border border-green-100 rounded text-sm text-green-800">
//           {successMsg}
//         </div>
//       )}

//       <form onSubmit={handleSubmit} noValidate>
//         {/* Business PAN */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700">PAN Card of the Business</label>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
//             <input
//               type="text"
//               value={businessPAN}
//               onChange={(e) => setBusinessPAN(e.target.value.toUpperCase())}
//               placeholder="AAAAA0000A"
//               className={`p-3 border rounded w-full text-sm ${errors.businessPAN ? "border-red-500" : "border-gray-200"}`}
//               aria-invalid={!!errors.businessPAN}
//             />
//             <div>
//               <FileInput
//                 label="Upload Business PAN (image/pdf)"
//                 name="businessPANFile"
//                 file={businessPANFile}
//                 onChange={(f) => setBusinessPANFile(f)}
//               />
//               {errors.businessPANFile && <p className="text-xs text-red-600 mt-1">{errors.businessPANFile}</p>}
//             </div>
//           </div>
//           {errors.businessPAN && <p className="text-xs text-red-600 mt-1">{errors.businessPAN}</p>}
//         </div>

//         {/* Owners - dynamic */}
//         <div className="mb-6">
//           <div className="flex items-center justify-between">
//             <h3 className="text-lg font-medium">PAN & Aadhaar of Business Owner(s)</h3>
//             <button
//               type="button"
//               onClick={addOwner}
//               className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700"
//             >
//               + Add Owner
//             </button>
//           </div>

//           {ownerPANs.map((_, idx) => (
//             <div key={idx} className="mt-4 p-4 border rounded bg-gray-50">
//               <div className="flex justify-between items-start">
//                 <h4 className="font-medium">Owner #{idx + 1}</h4>
//                 <div className="flex gap-2">
//                   <button
//                     type="button"
//                     onClick={() => removeOwner(idx)}
//                     className="text-xs text-red-600 hover:underline"
//                     aria-label={`Remove owner ${idx + 1}`}
//                   >
//                     Remove
//                   </button>
//                 </div>
//               </div>

//               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
//                 <div>
//                   <label className="block text-sm text-gray-700">Owner PAN</label>
//                   <input
//                     type="text"
//                     value={ownerPANs[idx]}
//                     onChange={(e) => {
//                       const val = e.target.value.toUpperCase();
//                       setOwnerPANs((s) => s.map((x, i) => (i === idx ? val : x)));
//                     }}
//                     placeholder="AAAAA0000A"
//                     className={`p-2 border rounded w-full text-sm ${errors[`ownerPAN_${idx}`] ? "border-red-500" : "border-gray-200"}`}
//                     aria-invalid={!!errors[`ownerPAN_${idx}`]}
//                   />
//                   {errors[`ownerPAN_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerPAN_${idx}`]}</p>}
//                 </div>

//                 <div>
//                   <FileInput
//                     label="Upload Owner PAN (image/pdf)"
//                     name={`ownerPANFile_${idx}`}
//                     file={ownerPANFiles[idx]}
//                     onChange={(f) => setOwnerPANFiles((s) => s.map((x, i) => (i === idx ? f : x)))}
//                   />
//                   {errors[`ownerPANFile_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerPANFile_${idx}`]}</p>}
//                 </div>

//                 <div>
//                   <label className="block text-sm text-gray-700">Owner Aadhaar (12 digits)</label>
//                   <input
//                     type="text"
//                     inputMode="numeric"
//                     value={ownerAadhaars[idx]}
//                     onChange={(e) => {
//                       const val = e.target.value.replace(/\D/g, "");
//                       setOwnerAadhaars((s) => s.map((x, i) => (i === idx ? val : x)));
//                     }}
//                     placeholder="123412341234"
//                     className={`p-2 border rounded w-full text-sm ${errors[`ownerAadhaar_${idx}`] ? "border-red-500" : "border-gray-200"}`}
//                     aria-invalid={!!errors[`ownerAadhaar_${idx}`]}
//                     maxLength={12}
//                   />
//                   {errors[`ownerAadhaar_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerAadhaar_${idx}`]}</p>}
//                 </div>

//                 <div>
//                   <FileInput
//                     label="Upload Owner Aadhaar (image/pdf)"
//                     name={`ownerAadharFile_${idx}`}
//                     file={ownerAadharFiles[idx]}
//                     onChange={(f) => setOwnerAadharFiles((s) => s.map((x, i) => (i === idx ? f : x)))}
//                   />
//                   {errors[`ownerAadhaarFile_${idx}`] && <p className="text-xs text-red-600">{errors[`ownerAadhaarFile_${idx}`]}</p>}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>

//         {/* Office Address Proof */}
//         <div className="mb-6">
//           <label className="block text-sm font-medium text-gray-700">Address Proof of the Business Office</label>
//           <div className="mt-2">
//             <FileInput
//               label="Upload office address proof (rent agreement / utility bill)"
//               name="officeAddressProof"
//               file={officeAddressProof}
//               onChange={(f) => setOfficeAddressProof(f)}
//               accept="image/*,application/pdf"
//             />
//             {errors.officeAddressProof && <p className="text-xs text-red-600">{errors.officeAddressProof}</p>}
//           </div>
//         </div>

//         {/* Mail & Permanent Address */}
//         <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
//           <div>
//             <label className="block text-sm font-medium text-gray-700">Mail Address</label>
//             <textarea
//               value={mailAddress}
//               onChange={(e) => setMailAddress(e.target.value)}
//               rows={4}
//               className={`mt-2 p-3 border rounded w-full text-sm ${errors.mailAddress ? "border-red-500" : "border-gray-200"}`}
//             />
//             {errors.mailAddress && <p className="text-xs text-red-600">{errors.mailAddress}</p>}
//           </div>

//           <div>
//             <div className="flex items-center justify-between">
//               <label className="block text-sm font-medium text-gray-700">Permanent Address</label>
//               <div className="flex items-center gap-2">
//                 <input id="same" type="checkbox" checked={sameAsMail} onChange={(e) => setSameAsMail(e.target.checked)} />
//                 <label htmlFor="same" className="text-xs text-gray-600">Same as mail</label>
//               </div>
//             </div>

//             <textarea
//               value={permanentAddress}
//               onChange={(e) => setPermanentAddress(e.target.value)}
//               rows={4}
//               className={`mt-2 p-3 border rounded w-full text-sm ${errors.permanentAddress ? "border-red-500" : "border-gray-200"}`}
//               disabled={sameAsMail}
//             />
//             {errors.permanentAddress && <p className="text-xs text-red-600">{errors.permanentAddress}</p>}
//           </div>
//         </div>

//         {errors.submit && <p className="text-sm text-red-600 mb-4">{errors.submit}</p>}

//         <div className="flex items-center justify-end gap-3">
//           <button
//             type="submit"
//             disabled={submitting}
//             className={`px-4 py-2 rounded text-white ${submitting ? "bg-gray-400" : "bg-indigo-600 hover:bg-indigo-700"}`}
//           >
//             {submitting ? "Submitting..." : "Submit KYC"}
//           </button>

//           <button
//             type="button"
//             onClick={resetAll}
//             className="px-3 py-2 border rounded text-sm text-gray-700"
//           >
//             Reset
//           </button>
//         </div>
//       </form>
//     </div>
//   );
// }

// export default KYC_Upload;