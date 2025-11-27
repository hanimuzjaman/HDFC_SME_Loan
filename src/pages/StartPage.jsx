import React from "react";
import { Link } from "react-router-dom";
import { FiBriefcase, FiTrendingUp, FiShield, FiCheckCircle, FiArrowRight } from "react-icons/fi";

const StartPage = () => {
  return (
    <div className="px-8 py-12 max-w-3xl mx-auto font-sans">
      
      {/* Heading */}
      <h1 className="text-4xl font-bold text-blue-700 mt-20 mb-6 flex items-center gap-2">
        <FiBriefcase className="text-[#003366]" size={30} />
        SME Business Loan Pre-Screening
      </h1>

      

      {/* Why HDFC Bank */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold text-[#003366] mb-3 flex items-center gap-2">
          <FiShield className="text-[#003366]" size={22} />
          Why Choose HDFC Bank for SME Loans?
        </h2>

        <ul className="text-gray-700 space-y-3 leading-relaxed">
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-[#D50032]" size={20} />
            Fast and transparent loan processing
          </li>
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-[#D50032]" size={20} />
            Competitive interest rates for SMEs
          </li>
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-[#D50032]" size={20} />
            Minimal documentation and smooth digital journey
          </li>
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-[#D50032]" size={20} />
            Flexible repayment plans based on cash flow
          </li>
          <li className="flex items-center gap-2">
            <FiCheckCircle className="text-[#D50032]" size={20} />
            Dedicated business loan support team
          </li>
        </ul>
      </section>

      
      <Link to="/check-client">
        <button className="px-6 py-3 bg-blue-900 hover:bg-[#002244] text-white rounded-md font-medium transition flex items-center gap-2">
          Proceed
          <FiArrowRight size={18} />
        </button>
      </Link>
    </div>
  );
};

export default StartPage;