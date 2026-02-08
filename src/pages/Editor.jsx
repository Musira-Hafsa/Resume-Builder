import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, addDoc, collection } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import { useReactToPrint } from "react-to-print";
import toast from "react-hot-toast";
import BasicTemplate from "../templates/BasicTemplate";
import StandardTemplate from "../templates/StandardTemplate";
import ProTemplate from "../templates/ProTemplate";

const emptyResume = {
  personal: {
    fullName: "",
    email: "",
    phone: "",
    address: "",
    summary: "",
  },
  education: [{ degree: "", institution: "", year: "" }],
  experience: [{ title: "", company: "", duration: "", description: "" }],
  skills: [""],
};

const templateComponents = {
  basic: BasicTemplate,
  standard: StandardTemplate,
  pro: ProTemplate,
};

export default function Editor() {
  const { templateId, resumeId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const printRef = useRef();

  const [resumeData, setResumeData] = useState(emptyResume);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [currentResumeId, setCurrentResumeId] = useState(resumeId || null);

  const TemplateComponent = templateComponents[templateId] || BasicTemplate;

  // Load existing data from Firestore
  useEffect(() => {
    if (!resumeId) return;
    async function loadResume() {
      try {
        const docRef = doc(db, "users", currentUser.uid, "resumes", resumeId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const saved = docSnap.data();
          setResumeData({
            personal: { ...emptyResume.personal, ...saved.personal },
            education:
              saved.education?.length > 0
                ? saved.education
                : emptyResume.education,
            experience:
              saved.experience?.length > 0
                ? saved.experience
                : emptyResume.experience,
            skills:
              saved.skills?.length > 0 ? saved.skills : emptyResume.skills,
          });
        }
      } catch (err) {
        console.error("Error loading resume:", err);
        toast.error("Failed to load resume");
      }
    }
    loadResume();
  }, [currentUser.uid, resumeId]);

  // Save to Firestore
  async function handleSave() {
    try {
      setSaving(true);
      const payload = {
        ...resumeData,
        templateId,
        updatedAt: new Date().toISOString(),
      };

      if (currentResumeId) {
        // Update existing
        await setDoc(
          doc(db, "users", currentUser.uid, "resumes", currentResumeId),
          payload
        );
      } else {
        // Create new
        const colRef = collection(db, "users", currentUser.uid, "resumes");
        const newDoc = await addDoc(colRef, payload);
        setCurrentResumeId(newDoc.id);
        // Update URL to include the new resumeId without a full reload
        window.history.replaceState(null, "", `/editor/${templateId}/${newDoc.id}`);
      }
      toast.success("Resume saved!");
    } catch (err) {
      toast.error("Failed to save: " + err.message);
    } finally {
      setSaving(false);
    }
  }

  const handlePrint = useReactToPrint({ contentRef: printRef });

  // Form update helpers
  function updatePersonal(field, value) {
    setResumeData((prev) => ({
      ...prev,
      personal: { ...prev.personal, [field]: value },
    }));
  }

  function updateEducation(index, field, value) {
    setResumeData((prev) => {
      const updated = [...prev.education];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, education: updated };
    });
  }

  function addEducation() {
    setResumeData((prev) => ({
      ...prev,
      education: [...prev.education, { degree: "", institution: "", year: "" }],
    }));
  }

  function removeEducation(index) {
    setResumeData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  }

  function updateExperience(index, field, value) {
    setResumeData((prev) => {
      const updated = [...prev.experience];
      updated[index] = { ...updated[index], [field]: value };
      return { ...prev, experience: updated };
    });
  }

  function addExperience() {
    setResumeData((prev) => ({
      ...prev,
      experience: [
        ...prev.experience,
        { title: "", company: "", duration: "", description: "" },
      ],
    }));
  }

  function removeExperience(index) {
    setResumeData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  }

  function updateSkill(index, value) {
    setResumeData((prev) => {
      const updated = [...prev.skills];
      updated[index] = value;
      return { ...prev, skills: updated };
    });
  }

  function addSkill() {
    setResumeData((prev) => ({ ...prev, skills: [...prev.skills, ""] }));
  }

  function removeSkill(index) {
    setResumeData((prev) => ({
      ...prev,
      skills: prev.skills.filter((_, i) => i !== index),
    }));
  }

  const tabs = [
    { id: "personal", label: "Personal" },
    { id: "experience", label: "Experience" },
    { id: "education", label: "Education" },
    { id: "skills", label: "Skills" },
  ];

  const inputClass =
    "w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-sm text-white placeholder-gray-400 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition";
  const labelClass = "block text-sm font-medium text-gray-300 mb-1";

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-[1400px] mx-auto px-4 py-6">
        {/* Top Bar */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => navigate("/dashboard")}
            className="text-sm text-gray-400 hover:text-white flex items-center gap-1 cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          <div className="flex gap-3">
            <button
              onClick={handlePrint}
              className="px-4 py-2 text-sm border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-800 transition cursor-pointer"
            >
              Print / PDF
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-5 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-500 hover:to-purple-500 transition-all disabled:opacity-50 cursor-pointer"
            >
              {saving ? "Saving..." : "Save Resume"}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Panel */}
          <div className="bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 p-6 h-fit">
            {/* Tabs */}
            <div className="flex gap-1 bg-gray-900/60 rounded-lg p-1 mb-6">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 py-2 text-sm font-medium rounded-md transition cursor-pointer ${
                    activeTab === tab.id
                      ? "bg-gray-700 text-indigo-400 shadow-sm"
                      : "text-gray-400 hover:text-gray-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Personal Info Tab */}
            {activeTab === "personal" && (
              <div className="space-y-4">
                <div>
                  <label className={labelClass}>Full Name</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={resumeData.personal.fullName}
                    onChange={(e) => updatePersonal("fullName", e.target.value)}
                    placeholder="John Doe"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Email</label>
                    <input
                      type="email"
                      className={inputClass}
                      value={resumeData.personal.email}
                      onChange={(e) => updatePersonal("email", e.target.value)}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone</label>
                    <input
                      type="tel"
                      className={inputClass}
                      value={resumeData.personal.phone}
                      onChange={(e) => updatePersonal("phone", e.target.value)}
                      placeholder="+1 234 567 890"
                    />
                  </div>
                </div>
                <div>
                  <label className={labelClass}>Address</label>
                  <input
                    type="text"
                    className={inputClass}
                    value={resumeData.personal.address}
                    onChange={(e) => updatePersonal("address", e.target.value)}
                    placeholder="City, State"
                  />
                </div>
                <div>
                  <label className={labelClass}>Professional Summary</label>
                  <textarea
                    rows={4}
                    className={inputClass}
                    value={resumeData.personal.summary}
                    onChange={(e) => updatePersonal("summary", e.target.value)}
                    placeholder="A brief summary of your professional background..."
                  />
                </div>
              </div>
            )}

            {/* Experience Tab */}
            {activeTab === "experience" && (
              <div className="space-y-6">
                {resumeData.experience.map((exp, i) => (
                  <div key={i} className="p-4 bg-gray-900/40 rounded-xl relative border border-gray-700/30">
                    {resumeData.experience.length > 1 && (
                      <button
                        onClick={() => removeExperience(i)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <div className="grid grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className={labelClass}>Job Title</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={exp.title}
                          onChange={(e) =>
                            updateExperience(i, "title", e.target.value)
                          }
                          placeholder="Software Engineer"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Company</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={exp.company}
                          onChange={(e) =>
                            updateExperience(i, "company", e.target.value)
                          }
                          placeholder="Google"
                        />
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className={labelClass}>Duration</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={exp.duration}
                        onChange={(e) =>
                          updateExperience(i, "duration", e.target.value)
                        }
                        placeholder="Jan 2022 - Present"
                      />
                    </div>
                    <div>
                      <label className={labelClass}>Description</label>
                      <textarea
                        rows={2}
                        className={inputClass}
                        value={exp.description}
                        onChange={(e) =>
                          updateExperience(i, "description", e.target.value)
                        }
                        placeholder="Key responsibilities and achievements..."
                      />
                    </div>
                  </div>
                ))}
                <button
                  onClick={addExperience}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition cursor-pointer"
                >
                  + Add Experience
                </button>
              </div>
            )}

            {/* Education Tab */}
            {activeTab === "education" && (
              <div className="space-y-6">
                {resumeData.education.map((edu, i) => (
                  <div key={i} className="p-4 bg-gray-900/40 rounded-xl relative border border-gray-700/30">
                    {resumeData.education.length > 1 && (
                      <button
                        onClick={() => removeEducation(i)}
                        className="absolute top-2 right-2 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                    <div className="mb-3">
                      <label className={labelClass}>Degree</label>
                      <input
                        type="text"
                        className={inputClass}
                        value={edu.degree}
                        onChange={(e) =>
                          updateEducation(i, "degree", e.target.value)
                        }
                        placeholder="B.S. Computer Science"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={labelClass}>Institution</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={edu.institution}
                          onChange={(e) =>
                            updateEducation(i, "institution", e.target.value)
                          }
                          placeholder="MIT"
                        />
                      </div>
                      <div>
                        <label className={labelClass}>Year</label>
                        <input
                          type="text"
                          className={inputClass}
                          value={edu.year}
                          onChange={(e) =>
                            updateEducation(i, "year", e.target.value)
                          }
                          placeholder="2020 - 2024"
                        />
                      </div>
                    </div>
                  </div>
                ))}
                <button
                  onClick={addEducation}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition cursor-pointer"
                >
                  + Add Education
                </button>
              </div>
            )}

            {/* Skills Tab */}
            {activeTab === "skills" && (
              <div className="space-y-3">
                {resumeData.skills.map((skill, i) => (
                  <div key={i} className="flex gap-2">
                    <input
                      type="text"
                      className={inputClass}
                      value={skill}
                      onChange={(e) => updateSkill(i, e.target.value)}
                      placeholder="e.g. React, Python, Leadership..."
                    />
                    {resumeData.skills.length > 1 && (
                      <button
                        onClick={() => removeSkill(i)}
                        className="px-2 text-red-400 hover:text-red-300 cursor-pointer"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
                <button
                  onClick={addSkill}
                  className="w-full py-2 border-2 border-dashed border-gray-600 rounded-xl text-sm text-gray-400 hover:border-indigo-400 hover:text-indigo-400 transition cursor-pointer"
                >
                  + Add Skill
                </button>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="overflow-auto">
            <h3 className="text-sm font-medium text-gray-400 mb-3 uppercase tracking-wider">
              Live Preview
            </h3>
            <div
              ref={printRef}
              id="resume-print-area"
              className="transform origin-top scale-[0.85] lg:scale-100"
            >
              <TemplateComponent data={resumeData} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
