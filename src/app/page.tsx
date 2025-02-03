"use client";  // Required for React state usage

import { useState } from "react";
import { useEffect } from "react";

const companies = [
  { id: 1, name: "Cosy BV", jobs: ["Full stack developer", "Community facillitator"], password: "cosybv" },
  { id: 2, name: "company2", jobs: ["Data Scientist", "UX Designer"], password: "microsoft456" },
  { id: 3, name: "company3", jobs: ["Cloud Engineer", "Business Analyst"], password: "amazon789" },
];

export default function JobManagementApp() {
  const [selectedCompany, setSelectedCompany] = useState<{ id: number; name: string; jobs: string[]; password: string } | null>(null);
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [passwordInput, setPasswordInput] = useState(""); // Store entered password
  const [passwordError, setPasswordError] = useState(false); // Track incorrect password
  const [cvUploads, setCvUploads] = useState<{ [job: string]: File[] }>(() => {
      try {
        return JSON.parse(localStorage.getItem("cvUploads") || "{}") || {};
      } catch (error) {
        console.error("Error parsing CV uploads from localStorage:", error);
        return {};
      }
    });
    
    // ✅ Move useEffect OUTSIDE of useState (Line ~24)
    useEffect(() => {
      localStorage.setItem("cvUploads", JSON.stringify(cvUploads));
    }, [cvUploads]);

  const handleCompanySelection = (company: { id: number; name: string; jobs: string[]; password: string }) => {
    const enteredPassword = prompt(`Enter the password for ${company.name}:`);
    if (enteredPassword === company.password) {
      setSelectedCompany(company);
      setPasswordError(false);
    } else {
      setPasswordError(true);
      alert("Incorrect password! Please try again.");
    }
  };


  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedJob) return;
    const files = event.target.files;
    if (files) {
      setCvUploads((prev) => {
        const updatedUploads = {
          ...prev,
          [selectedJob]: [...(prev[selectedJob] || []), ...Array.from(files)],
        };
        localStorage.setItem("cvUploads", JSON.stringify(updatedUploads)); // Save to localStorage
        return updatedUploads;
      });
    }
  };

  const handleRemoveCV = (job: string, index: number) => {
    setCvUploads((prev) => {
      const updatedUploads = { ...prev };
      updatedUploads[job] = updatedUploads[job].filter((_, i) => i !== index);
      localStorage.setItem("cvUploads", JSON.stringify(updatedUploads)); // Update localStorage
      return updatedUploads;
    });
  };
  

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {!selectedCompany ? (
        <div>
          <h1 className="text-xl font-bold mb-4">Select a Company</h1>
          {passwordError && <p className="text-red-500">Incorrect password! Please try again.</p>}
          <div className="grid grid-cols-1 gap-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="p-4 cursor-pointer hover:shadow-lg border rounded-md"
                onClick={() => handleCompanySelection(company)}
              >
                {company.name}
              </div>
            ))}
          </div>
        </div>
      ) : !selectedJob ? (
        <div>
          <h1 className="text-xl font-bold mb-4">Select a Job at {selectedCompany.name}</h1>
          <button 
            onClick={() => setSelectedCompany(null)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>
          <div className="grid grid-cols-1 gap-4 mt-4">
            {selectedCompany.jobs.map((job) => (
              <div
                key={job}
                className="p-4 cursor-pointer hover:shadow-lg border rounded-md"
                onClick={() => setSelectedJob(job)}
              >
                {job}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>
          <h1 className="text-xl font-bold mb-4">Shortlisted CVs for {selectedJob}</h1>
          <button 
            onClick={() => setSelectedJob(null)} 
            className="bg-blue-500 text-white px-4 py-2 rounded-md"
          >
            Back
          </button>

          {/* CV Upload Section */}
          <div className="mt-4">
            <h2 className="text-lg font-semibold">Upload CVs (PDF)</h2>
            <input 
              type="file" 
              accept=".pdf" 
              multiple 
              onChange={handleFileUpload} 
              className="mt-2 border rounded-md p-2"
            />
          </div>

          {/* Display Uploaded CVs */}
          {Array.isArray(cvUploads[selectedJob]) && cvUploads[selectedJob].length > 0 ? (

  <ul className="mt-4 space-y-2">
    {cvUploads[selectedJob].map((cv, index) => (
      <li key={index} className="p-2 border rounded-md flex justify-between items-center">
        <span>{cv.name}</span>
        <div>
          <a 
            href={URL.createObjectURL(cv)} 
            download={cv.name} 
            className="text-blue-500 underline ml-2"
          >
            Download
          </a>
          <button 
            onClick={() => handleRemoveCV(selectedJob, index)}
            className="ml-4 text-red-500 hover:text-red-700"
          >
            Remove
          </button>
        </div>
      </li>
    ))}
  </ul>
) : (
  <p className="text-gray-500">No CVs uploaded yet.</p>
)}
        </div>
      )}
    </div>
  );
}
