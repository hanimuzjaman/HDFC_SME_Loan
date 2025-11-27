import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import {
  FiSearch,
  FiUserPlus,
  FiArrowRightCircle,
  FiShield,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";

const RESEND_SECONDS = 60;

const CheckClient = () => {
  const [toggle, setToggle] = useState("existing");

  const [applicantID, setApplicantID] = useState("");

  
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [companyType, setCompanyType] = useState("");
  

  const [generatedOTP, setGeneratedOTP] = useState("");
  const [enteredOTP, setEnteredOTP] = useState("");
  const [otpStatus, setOtpStatus] = useState(null); // null | "correct" | "wrong"

  const [sendingOtp, setSendingOtp] = useState(false);
  const [resendTimer, setResendTimer] = useState(0);
  const otpInputRef = useRef(null);

  const [creating, setCreating] = useState(false);

  const navigate = useNavigate();

  // FETCH EXISTING APPLICANT
  const fetchApplicant = async () => {
    if (!applicantID.trim()) {
      alert("Please enter an Applicant ID");
      return;
    }
    try {
      const res = await axios.get(
        `http://localhost:8000/api/applicant/${encodeURIComponent(applicantID)}`
      );
      navigate("/dashboard", { state: res.data });
    } catch (err) {
      console.error(err);
      alert("Applicant not found!");
    }
  };

  // GET APPLICANT ID FROM BACKEND
  const generateApplicantID = async (companyType) => {
    try {
      const res = await axios.get(
        `http://localhost:8000/api/generate-id/${encodeURIComponent(
          companyType
        )}`
      );
      return res.data.applicantID;
    } catch (err) {
      console.error("Error generating applicant ID:", err);
      // fallback simple local generation (non-unique)
      const fallback = `SME${companyType.charAt(0).toUpperCase()}${
        Date.now() % 10000
      }`;
      return fallback;
    }
  };

  // SEND OTP VIA FAST2SMS 
  const sendOTP = async () => {
    // basic phone validation (adjust as needed)
    const digits = phone.replace(/\D/g, "");
    if (digits.length < 10) {
      alert("Enter a valid phone number (at least 10 digits).");
      return;
    }

    setSendingOtp(true);
    try {
      const res = await axios.post("http://localhost:8000/api/send-otp", {
        phone: digits,
      });

      if (res.data && res.data.otp) {
        setGeneratedOTP(res.data.otp);
        setOtpStatus(null);
        setEnteredOTP("");
        // start resend timer
        setResendTimer(RESEND_SECONDS);
        // focus OTP input after tiny delay so user sees it
        setTimeout(() => otpInputRef.current?.focus(), 300);
        alert("OTP has been sent to the given phone number.");
      } else {
        throw new Error("No OTP returned from server");
      }
    } catch (err) {
      console.error("Send OTP error:", err);
      alert("Failed to send OTP. Please try again.");
    } finally {
      setSendingOtp(false);
    }
  };

  // OTP VALIDATION
  const verifyOTP = (value) => {
    // only digits allowed
    const digitsOnly = value.replace(/\D/g, "");
    setEnteredOTP(digitsOnly);

    if (digitsOnly.length === 6) {
      setOtpStatus(digitsOnly === generatedOTP ? "correct" : "wrong");
    } else {
      setOtpStatus(null);
    }
  };

  // countdown effect for resend timer
  useEffect(() => {
    if (resendTimer <= 0) return;
    const t = setInterval(() => {
      setResendTimer((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [resendTimer]);

  // CREATE NEW APPLICANT
  const createApplicant = async () => {
    if (otpStatus !== "correct") {
      alert("Please enter the correct OTP before proceeding.");
      return;
    }

    if (!fullName.trim()) {
      alert("Please enter Full Name.");
      return;
    }

    if (!phone.replace(/\D/g, "")) {
      alert("Please enter a valid phone number.");
      return;
    }

    //  Check if companyType is selected 
    if (!companyType) {
      alert("Please select a Company Type.");
      return;
    }

    setCreating(true);
    try {
      const generatedID = await generateApplicantID(companyType);

      const res = await axios.post("http://localhost:8000/api/applicant/new", {
        fullName: fullName.trim(),
        phone: phone.replace(/\D/g, ""),
        companyType,
        applicantID: generatedID,
      });

      if (res.data && res.data.applicant) {
        navigate("/dashboard", { state: res.data.applicant });
      } else {
        throw new Error("Unexpected response creating applicant");
      }
    } catch (err) {
      console.error("Create applicant error:", err);
      alert("Failed to create applicant. Try again.");
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="px-8 py-12 max-w-xl mx-auto font-sans">
      {/* TOGGLE WITHOUT MOTION */}
      <div className="flex gap-4 mb-10">
        <button
          onClick={() => setToggle("existing")}
          className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition ${
            toggle === "existing"
              ? "bg-[#003366] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FiSearch />
          Existing Applicant
        </button>

        <button
          onClick={() => setToggle("new")}
          className={`px-4 py-2 rounded-md font-medium flex items-center gap-2 transition ${
            toggle === "new"
              ? "bg-[#002244] text-white"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          <FiUserPlus />
          New Applicant
        </button>
      </div>

      {/* EXISTING APPLICANT */}
      {toggle === "existing" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-blue-800">Search Applicant</h2>

          <input
            type="text"
            placeholder="Enter Applicant ID"
            className="w-full px-4 py-2 border rounded-md"
            value={applicantID}
            onChange={(e) => setApplicantID(e.target.value)}
          />

          <button
            onClick={fetchApplicant}
            disabled={!applicantID.trim()}
            className={`w-full py-2 rounded-md flex items-center justify-center gap-2 transition ${
              !applicantID.trim()
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-[#003366] text-white hover:bg-[#002244]"
            }`}
          >
            Proceed <FiArrowRightCircle />
          </button>
        </div>
      )}

      {/* NEW APPLICANT */}
      {toggle === "new" && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-blue-900">New Applicant</h2>

          <input
            type="text"
            placeholder="Full Name"
            className="w-full px-4 py-2 border rounded-md"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />

          <input
            type="tel"
            placeholder="Phone Number"
            className="w-full px-4 py-2 border rounded-md"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          {/* Send OTP area */}
          <div className="flex gap-3 items-center">
            <button
              onClick={sendOTP}
              disabled={sendingOtp || resendTimer > 0}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-md font-medium transition ${
                sendingOtp || resendTimer > 0
                  ? "bg-gray-300 text-gray-700 cursor-not-allowed"
                  : "bg-gray-200 hover:bg-gray-300 text-gray-800"
              }`}
            >
              <FiShield />
              {sendingOtp
                ? "Sending..."
                : resendTimer > 0
                ? `Resend in ${resendTimer}s`
                : "Send OTP"}
            </button>

            <div className="text-sm text-gray-500">
              OTP will be sent to the phone
            </div>
          </div>

          {/* OTP Input */}
          <input
            ref={otpInputRef}
            type="text"
            inputMode="numeric"
            maxLength="6"
            placeholder="Enter OTP"
            value={enteredOTP}
            onChange={(e) => verifyOTP(e.target.value)}
            className={`w-full px-4 py-2 rounded-md border-2 outline-none ${
              otpStatus === "correct"
                ? "border-green-500"
                : otpStatus === "wrong"
                ? "border-red-500"
                : "border-gray-300"
            }`}
          />

          <select
            // Apply gray color if companyType is empty, otherwise use text-gray-800 (or black)
            className={`w-full px-4 py-2 border rounded-md ${
              companyType === "" ? "text-gray-400" : "text-gray-800"
            }`}
            value={companyType}
            onChange={(e) => setCompanyType(e.target.value)}
          >
            <option value="" disabled>
              ---Select---
            </option>
            <option value="Services">Services</option>
            <option value="Trading">Trading</option>
            <option value="Manufacturing">Manufacturing</option>
          </select>

          <button
            onClick={createApplicant}
            // Button is disabled if OTP is wrong OR if companyType is the default empty string
            disabled={creating || otpStatus !== "correct" || !companyType}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-md text-white transition ${
              creating || otpStatus !== "correct" || !companyType
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-[#002244] hover:bg-[#002244]"
            }`}
          >
            {creating ? "Creating..." : "Proceed"} <FiArrowRightCircle />
          </button>
        </div>
      )}
    </div>
  );
};

export default CheckClient;
