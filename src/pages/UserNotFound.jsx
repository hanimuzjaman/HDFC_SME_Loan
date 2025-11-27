import React from 'react';
import { Link } from 'react-router-dom';
import { FiUserX, FiArrowLeft } from 'react-icons/fi';

const UserNotFound = () => {
  const ACCENT_COLOR = "#D50032";
  const PRIMARY_COLOR = "#003366";

  return (
    <div className="px-6 py-20 max-w-lg mx-auto font-sans min-h-screen flex flex-col justify-center items-center text-center">
      
      <FiUserX className={`text-[${ACCENT_COLOR}] mb-6`} size={60} />
      
      <h1 className="text-3xl font-extrabold text-gray-900 mb-4">
        Applicant Not Found
      </h1>
      
      <p className="text-lg text-gray-600 mb-8">
        The **Applicant ID** you entered does not match any existing file in our system.
      </p>

      {/* Navigation Link back to CheckClient page */}
      <Link to="/check-client">
        <button 
          className={`px-6 py-3 bg-[${PRIMARY_COLOR}] hover:bg-[#002244] text-white rounded-lg font-semibold transition duration-200 shadow-md flex items-center gap-2`}
        >
          <FiArrowLeft size={18} />
          Back to check applicant page
        </button>
      </Link>
      

    </div>
  );
}

export default UserNotFound;