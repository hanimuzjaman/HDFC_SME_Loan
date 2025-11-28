import React from "react";
import { useLocation } from "react-router-dom";
import axios from "axios";
import {
  FiUser,
  FiPhone,
  FiBriefcase,
  FiUploadCloud,
  FiDollarSign,
  FiTag,
  FiHash,
  FiZap,
  FiCheckCircle,
} from "react-icons/fi";

// The updateField function remains the same (omitted for brevity)
const updateField = async (applicantId, field) => {
  try {
    await axios.patch(
      `http://localhost:8000/api/applicant/update/${applicantId}`,
      { [field]: "Yes" }
    );
    alert(`${field} updated successfully`);
    window.location.reload(); 
  } catch (error) {
    alert("Failed to update");
  }
};

// Custom component for a high-level KPI card (omitted for brevity)
const KpiCard = ({ icon: Icon, label, value, colorClass }) => (
    <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 flex-1 min-w-0">
        <div className={`text-2xl mb-1 ${colorClass}`}>
            <Icon size={24} />
        </div>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
        <p className="text-xl font-extrabold text-gray-900 mt-0.5 truncate">{value}</p>
    </div>
);

// 🛑 MODIFIED COMPONENT: DocumentStatusItem (omitted for brevity)
const DocumentStatusItem = ({ label, status, applicantId, field }) => {
  const isSubmitted = status === "Yes";
  const StatusIcon = isSubmitted ? FiCheckCircle : FiUploadCloud;
  const statusColor = isSubmitted ? "text-green-600" : "text-red-600";
  
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
      <div className="flex items-center space-x-3">
        {/* Icon based on status */}
        <StatusIcon size={16} className={`${statusColor} `} />
        {/* Document Label */}
        <p className="text-sm font-medium text-gray-700">{label}</p>
      </div>

      <div className="flex items-center space-x-3">
        {/* 1. If Submitted: Display only the status text ("Yes") */}
        {isSubmitted && (
             <p className={`text-xs font-bold ${statusColor}`}>{status}</p>
        )}
        
        {/* 2. If NOT Submitted: Display only the Update button */}
        {!isSubmitted && (
          <button
            onClick={() => updateField(applicantId, field)}
            className="text-[#003366] text-xs px-2 py-1 rounded-full border border-[#003366] hover:bg-[#003366] hover:text-white transition duration-150"
          >
            Update
          </button>
        )}
      </div>
    </div>
  );
};


const Dashboard = () => {
  const location = useLocation();
  
  // 🛑 DEFINE DEFAULT EMPTY STATE
  const emptyState = {
    "Applicant ID": "N/A",
    "Full Name": "Applicant Data Not Found",
    "Phone": "—",
    "Loan Amount Requested": "0",
    "Company Type": "N/A",
    "Loan Category": "N/A",
    "Applicant's Industry": "—",
    "Applicant's Category": "—",
    "Income Document Submitted": "No",
    "KYC Submitted": "No",
    "Business Proof Submitted": "No",
  };
  
  // 🛑 USE DEFAULT STATE IF location.state IS NULL
  const state = location.state || emptyState;
  const applicantId = state["Applicant ID"];


  // Calculate Document Completion Status for KPI
  const docs = [
    state["Income Document Submitted"],
    state["KYC Submitted"],
    state["Business Proof Submitted"]
  ];
  const submittedCount = docs.filter(s => s === "Yes").length;
  const docStatus = `${submittedCount}/${docs.length} Completed`;


  return (
    // Max-w-full and h-screen (or max-h-screen) enforce the no-scroll requirement
    <div className="px-6 md:px-8 py-6 max-w-full mx-auto font-sans h-screen overflow-hidden flex flex-col">
      
      {/* DASHBOARD HEADER / TITLE */}
      <header className="pb-4 mb-4 border-b border-gray-200">
        <h1 className="text-3xl mb-10 font-extrabold text-[#003366] tracking-tight">
          Dashboard
        </h1>
        <div className="flex text-sm text-gray-500 mt-1 space-x-4">
            <span className="flex items-center"><FiHash size={14} className="mr-1" /> ID: <span className="font-semibold text-gray-700 ml-1">{applicantId}</span></span>
            <span className="flex items-center"><FiPhone size={14} className="mr-1" /> {state["Phone"]}</span>
        </div>
      </header>

      {/* KPI SCORECARD ROW (Always visible, very condensed) */}
      <div className="flex flex-wrap gap-4 mb-6">
        <KpiCard 
            icon={FiDollarSign} 
            label="Loan Requested" 
            // Handle display logic for 0 vs N/A based on emptyState
            value={state["Loan Amount Requested"] !== "0" ? `₹${state["Loan Amount Requested"]}` : "N/A"} 
            colorClass="text-green-600"
        />
        <KpiCard 
            icon={FiBriefcase} 
            label="Company Type" 
            value={state["Company Type"]} 
            colorClass="text-blue-600"
        />
        <KpiCard 
            icon={FiTag} 
            label="Loan Category" 
            value={state["Loan Category"]} 
            colorClass="text-purple-600"
        />
        <KpiCard 
            icon={FiZap} 
            label="Doc Status" 
            value={applicantId !== "N/A" ? docStatus : "0/3 Completed"} // Display 0/3 if applicant not found
            colorClass={applicantId !== "N/A" ? (submittedCount === docs.length ? "text-green-600" : "text-yellow-600") : "text-gray-500"}
        />
      </div>

      {/* MAIN CONTENT (Flexible height to fit remaining space) */}
      <div className="flex flex-1 flex-col md:flex-row gap-6 min-h-0">
        
        {/* LEFT COLUMN: Applicant & Loan Details */}
        <section className="md:w-1/3 bg-white p-5 rounded-xl border border-gray-100 shadow-lg flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center space-x-2">
                <FiUser /><span>Applicant Profile</span>
            </h2>
            {/* The content here is limited to ensure no overflow */}
            <div className="space-y-3 flex-1 overflow-y-auto pr-2"> 
                <div className="p-2 border rounded bg-gray-50">
                    <p className="text-xs text-gray-500">Industry</p>
                    <p className="font-medium text-sm">{state["Applicant's Industry"] || "—"}</p>
                </div>
                <div className="p-2 border rounded bg-gray-50">
                    <p className="text-xs text-gray-500">Applicant Type</p>
                    <p className="font-medium text-sm">{state["Applicant's Category"] || "—"}</p>
                </div>
                {/* Placeholder for stability, removed actual auto-generated content */}
                <div className="p-2 border rounded bg-gray-50">
                    <p className="text-xs text-gray-500">Current Status</p>
                    <p className="font-medium text-sm">{applicantId !== "N/A" ? "Review Pending" : "No Data"}</p>
                </div>
            </div>
        </section>

        {/* RIGHT COLUMN: Document Verification (Highest Priority) */}
        <section className="md:w-2/3 bg-white p-5 rounded-xl border border-gray-100 shadow-lg flex flex-col min-h-0">
            <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center space-x-2">
                <FiUploadCloud /><span>Required Documents</span>
            </h2>
            
            {/* Document Status List */}
            <div className="space-y-1 pb-4">
                <DocumentStatusItem
                    label="Income Document"
                    status={state["Income Document Submitted"]}
                    applicantId={applicantId}
                    field="Income Document Submitted"
                />
                <DocumentStatusItem
                    label="KYC"
                    status={state["KYC Submitted"]}
                    applicantId={applicantId}
                    field="KYC Submitted"
                />
                <DocumentStatusItem
                    label="Business Proof"
                    status={state["Business Proof Submitted"]}
                    applicantId={applicantId}
                    field="Business Proof Submitted"
                />
            </div>
            
        </section>

      </div>
    </div>
  );
};

export default Dashboard;







// import React from "react";
// import { useLocation } from "react-router-dom";
// import axios from "axios";
// import {
//   FiUser,
//   FiPhone,
//   FiBriefcase,
//   FiUploadCloud,
//   FiDollarSign,
//   FiTag,
//   FiHash,
//   FiZap,
//   FiCheckCircle,
// } from "react-icons/fi";

// // The updateField function remains the same
// const updateField = async (applicantId, field) => {
//   try {
//     await axios.patch(
//       `http://localhost:8000/api/applicant/update/${applicantId}`,
//       { [field]: "Yes" }
//     );
//     alert(`${field} updated successfully`);
//     window.location.reload(); 
//   } catch (error) {
//     alert("Failed to update");
//   }
// };

// // Custom component for a high-level KPI card
// const KpiCard = ({ icon: Icon, label, value, colorClass }) => (
//     <div className="p-4 bg-white rounded-xl shadow-md border border-gray-100 flex-1 min-w-0">
//         <div className={`text-2xl mb-1 ${colorClass}`}>
//             <Icon size={24} />
//         </div>
//         <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
//         <p className="text-xl font-extrabold text-gray-900 mt-0.5 truncate">{value}</p>
//     </div>
// );

// // 🛑 MODIFIED COMPONENT: DocumentStatusItem
// const DocumentStatusItem = ({ label, status, applicantId, field }) => {
//   const isSubmitted = status === "Yes";
//   // Use FiCheckCircle for submitted, and FiUploadCloud for pending
//   const StatusIcon = isSubmitted ? FiCheckCircle : FiUploadCloud;
//   const statusColor = isSubmitted ? "text-green-600" : "text-red-600";
  
//   return (
//     <div className="flex justify-between items-center py-2.5 border-b border-gray-100 last:border-b-0">
//       <div className="flex items-center space-x-3">
//         {/* Icon based on status */}
//         <StatusIcon size={16} className={`${statusColor} `} />
//         {/* Document Label */}
//         <p className="text-sm font-medium text-gray-700">{label}</p>
//       </div>

//       <div className="flex items-center space-x-3">
//         {/* 1. If Submitted: Display only the status text ("Yes") */}
//         {isSubmitted && (
//              <p className={`text-xs font-bold ${statusColor}`}>{status}</p>
//         )}
        
//         {/* 2. If NOT Submitted: Display only the Update button */}
//         {!isSubmitted && (
//           <button
//             onClick={() => updateField(applicantId, field)}
//             className="text-[#003366] text-xs px-2 py-1 rounded-full border border-[#003366] hover:bg-[#003366] hover:text-white transition duration-150"
//           >
//             Update
//           </button>
//         )}
//       </div>
//     </div>
//   );
// };


// const Dashboard = () => {
//   const { state } = useLocation();
//   const applicantId = state?.["Applicant ID"];

//   if (!state) {
//     return <div className="p-8 text-center text-red-500">Applicant data not found.</div>;
//   }

//   // Calculate Document Completion Status for KPI
//   const docs = [
//     state["Income Document Submitted"],
//     state["KYC Submitted"],
//     state["Business Proof Submitted"]
//   ];
//   const submittedCount = docs.filter(s => s === "Yes").length;
//   const docStatus = `${submittedCount}/${docs.length} Completed`;


//   return (
//     // Max-w-full and h-screen (or max-h-screen) enforce the no-scroll requirement
//     <div className="px-6 md:px-8 py-6 max-w-full mx-auto font-sans h-screen overflow-hidden flex flex-col">
      
//       {/* DASHBOARD HEADER / TITLE */}
//       <header className="pb-4 mb-4 border-b border-gray-200">
//         <h1 className="text-3xl mb-10 font-extrabold text-[#003366] tracking-tight">
//           Dashboard
//         </h1>
//         <div className="flex text-sm text-gray-500 mt-1 space-x-4">
//             <span className="flex items-center"><FiHash size={14} className="mr-1" /> ID: <span className="font-semibold text-gray-700 ml-1">{applicantId}</span></span>
//             <span className="flex items-center"><FiPhone size={14} className="mr-1" /> {state["Phone"]}</span>
//         </div>
//       </header>

//       {/* KPI SCORECARD ROW (Always visible, very condensed) */}
//       <div className="flex flex-wrap gap-4 mb-6">
//         <KpiCard 
//             icon={FiDollarSign} 
//             label="Loan Requested" 
//             value={`₹${state["Loan Amount Requested"] || "N/A"}`} 
//             colorClass="text-green-600"
//         />
//         <KpiCard 
//             icon={FiBriefcase} 
//             label="Company Type" 
//             value={state["Company Type"] || "N/A"} 
//             colorClass="text-blue-600"
//         />
//         <KpiCard 
//             icon={FiTag} 
//             label="Loan Category" 
//             value={state["Loan Category"] || "N/A"} 
//             colorClass="text-purple-600"
//         />
//         <KpiCard 
//             icon={FiZap} 
//             label="Doc Status" 
//             value={docStatus} 
//             colorClass={submittedCount === docs.length ? "text-green-600" : "text-yellow-600"}
//         />
//       </div>

//       {/* MAIN CONTENT (Flexible height to fit remaining space) */}
//       <div className="flex flex-1 flex-col md:flex-row gap-6 min-h-0">
        
//         {/* LEFT COLUMN: Applicant & Loan Details */}
//         <section className="md:w-1/3 bg-white p-5 rounded-xl border border-gray-100 shadow-lg flex flex-col min-h-0">
//             <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center space-x-2">
//                 <FiUser /><span>Applicant Profile</span>
//             </h2>
//             {/* The content here is limited to ensure no overflow */}
//             <div className="space-y-3 flex-1 overflow-y-auto pr-2"> 
//                 <div className="p-2 border rounded bg-gray-50">
//                     <p className="text-xs text-gray-500">Industry</p>
//                     <p className="font-medium text-sm">{state["Applicant's Industry"] || "—"}</p>
//                 </div>
//                 <div className="p-2 border rounded bg-gray-50">
//                     <p className="text-xs text-gray-500">Applicant Type</p>
//                     <p className="font-medium text-sm">{state["Applicant's Category"] || "—"}</p>
//                 </div>
//                 {/* Placeholder for stability, removed actual auto-generated content */}
//                 <div className="p-2 border rounded bg-gray-50">
//                     <p className="text-xs text-gray-500">Current Status</p>
//                     <p className="font-medium text-sm">Review Pending</p>
//                 </div>
//             </div>
//         </section>

//         {/* RIGHT COLUMN: Document Verification (Highest Priority) */}
//         <section className="md:w-2/3 bg-white p-5 rounded-xl border border-gray-100 shadow-lg flex flex-col min-h-0">
//             <h2 className="text-lg font-bold text-[#003366] mb-4 flex items-center space-x-2">
//                 <FiUploadCloud /><span>Required Documents</span>
//             </h2>
            
//             {/* Document Status List */}
//             <div className="space-y-1 pb-4">
//                 <DocumentStatusItem
//                     label="Income Document"
//                     status={state["Income Document Submitted"]}
//                     applicantId={applicantId}
//                     field="Income Document Submitted"
//                 />
//                 <DocumentStatusItem
//                     label="KYC"
//                     status={state["KYC Submitted"]}
//                     applicantId={applicantId}
//                     field="KYC Submitted"
//                 />
//                 <DocumentStatusItem
//                     label="Business Proof"
//                     status={state["Business Proof Submitted"]}
//                     applicantId={applicantId}
//                     field="Business Proof Submitted"
//                 />
//             </div>
            
//         </section>

//       </div>
//     </div>
//   );
// };

// export default Dashboard;