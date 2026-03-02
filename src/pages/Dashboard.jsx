import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../config/firebase";
import { useAuth } from "../contexts/AuthContext";
import toast from "react-hot-toast";
import BasicTemplate from "../templates/BasicTemplate";
import StandardTemplate from "../templates/StandardTemplate";
import ProTemplate from "../templates/ProTemplate";

const templates = [
  {
    id: "basic",
    name: "Basic",
    description: "Clean and minimal. Great for entry-level positions.",
    color: "from-blue-500 to-cyan-400",
    icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z",
  },
  {
    id: "standard",
    name: "Standard",
    description: "Professional two-column layout with accent colors.",
    color: "from-emerald-500 to-teal-400",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
  },
  {
    id: "pro",
    name: "Pro",
    description: "Modern design with sidebar and timeline layout.",
    color: "from-purple-500 to-pink-400",
    icon: "M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01",
  },
];

const templateComponents = {
  basic: BasicTemplate,
  standard: StandardTemplate,
  pro: ProTemplate,
};

const templateNames = {
  basic: "Basic",
  standard: "Standard",
  pro: "Pro",
};

const testimonials = [
  {
    name: "Sarah K.",
    role: "Marketing Manager",
    text: "I landed my dream job within two weeks of using this resume builder. The templates are stunning and so easy to customize!",
    gradient: "from-blue-500 to-cyan-400",
  },
  {
    name: "James R.",
    role: "Software Engineer",
    text: "Clean, professional results every time. I love that I can save multiple versions and switch between templates effortlessly.",
    gradient: "from-emerald-500 to-teal-400",
  },
  {
    name: "Priya M.",
    role: "Recent Graduate",
    text: "As a fresh graduate, I had no idea how to format a resume. This tool made it incredibly simple and my resume looks amazing.",
    gradient: "from-purple-500 to-pink-400",
  },
];

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [direction, setDirection] = useState("next");
  const autoSlideRef = useRef(null);
  const isHoveringRef = useRef(false);

  const goToSlide = useCallback((index, dir = "next") => {
    if (isAnimating) return;
    setDirection(dir);
    setIsAnimating(true);
    setTimeout(() => {
      setActiveSlide(index);
      setIsAnimating(false);
    }, 300);
  }, [isAnimating]);

  const goPrev = useCallback(() => {
    const prev = (activeSlide - 1 + testimonials.length) % testimonials.length;
    goToSlide(prev, "prev");
  }, [activeSlide, goToSlide]);

  const goNext = useCallback(() => {
    const next = (activeSlide + 1) % testimonials.length;
    goToSlide(next, "next");
  }, [activeSlide, goToSlide]);

  useEffect(() => {
    autoSlideRef.current = setInterval(() => {
      if (!isHoveringRef.current) {
        setActiveSlide((prev) => (prev + 1) % testimonials.length);
      }
    }, 4000);
    return () => clearInterval(autoSlideRef.current);
  }, []);

  useEffect(() => {
    loadResumes();
  }, [currentUser.uid]);

  async function loadResumes() {
    try {
      setLoading(true);
      const colRef = collection(db, "users", currentUser.uid, "resumes");
      const snapshot = await getDocs(colRef);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (b.updatedAt || "").localeCompare(a.updatedAt || ""));
      setResumes(list);
    } catch (err) {
      console.error("Error loading resumes:", err);
      toast.error("Failed to load resumes");
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    try {
      setDeleting(true);
      await deleteDoc(doc(db, "users", currentUser.uid, "resumes", deleteTarget));
      setResumes((prev) => prev.filter((r) => r.id !== deleteTarget));
      toast.success("Resume deleted");
    } catch (err) {
      toast.error("Failed to delete: " + err.message);
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function handleSelectTemplate(templateId) {
    navigate(`/editor/${templateId}`);
  }

  function handleEditResume(resume) {
    navigate(`/editor/${resume.templateId}/${resume.id}`);
  }

  function formatDate(iso) {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-white">
            Welcome, {currentUser.email.split("@")[0]} 😊
          </h1>
          <p className="text-gray-400 mt-2">
            Manage your resumes or create a new one
          </p>
        </div>

        {/* Saved Resumes Section */}
        <div className="mb-12">
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Your Resumes
          </h2>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-gray-800/50 rounded-2xl h-48 animate-pulse border border-gray-700/50" />
              ))}
            </div>
          ) : resumes.length === 0 ? (
            <div className="bg-gray-800/30 border border-gray-700/50 rounded-2xl p-10 text-center">
              <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500 text-sm">No resumes yet. Pick a template below to get started!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {resumes.map((resume) => {
                const tpl = templates.find((t) => t.id === resume.templateId) || templates[0];
                return (
                  <div
                    key={resume.id}
                    className="group bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-600 transition-all duration-300 overflow-hidden"
                  >
                    {/* Color strip */}
                    <div className={`h-2 bg-gradient-to-r ${tpl.color}`} />

                    <div className="p-5">
                      {/* Resume info */}
                      <div className="mb-4">
                        <h3 className="text-white font-semibold text-lg truncate">
                          {resume.personal?.fullName || "Untitled Resume"}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full bg-gradient-to-r ${tpl.color} text-white font-medium`}>
                            {templateNames[resume.templateId] || "Basic"}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(resume.updatedAt)}
                          </span>
                        </div>
                        {resume.personal?.email && (
                          <p className="text-sm text-gray-400 mt-2 truncate">
                            {resume.personal.email}
                          </p>
                        )}
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditResume(resume)}
                          className="flex-1 px-3 py-2 text-sm bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-lg transition-all cursor-pointer font-medium"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => setPreviewResume(resume)}
                          className="px-3 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition cursor-pointer"
                          title="Preview"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteTarget(resume.id)}
                          className="px-3 py-2 text-sm bg-gray-700 hover:bg-red-600 text-gray-400 hover:text-white rounded-lg transition cursor-pointer"
                          title="Delete"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Create New Resume Section */}
        <div>
          <h2 className="text-lg font-semibold text-gray-200 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            Create New Resume
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {templates.map((tpl) => (
              <button
                key={tpl.id}
                onClick={() => handleSelectTemplate(tpl.id)}
                className="group bg-gray-800/60 backdrop-blur-sm rounded-2xl border border-gray-700/50 hover:border-gray-500 transition-all duration-300 overflow-hidden text-left cursor-pointer"
              >
                <div
                  className={`h-32 bg-gradient-to-br ${tpl.color} flex items-center justify-center opacity-90 group-hover:opacity-100 transition-opacity`}
                >
                  <svg
                    className="w-14 h-14 text-white/80 group-hover:scale-110 transition-transform"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d={tpl.icon}
                    />
                  </svg>
                </div>
                <div className="p-5">
                  <h3 className="text-base font-semibold text-white mb-1">
                    {tpl.name}
                  </h3>
                  <p className="text-sm text-gray-400">{tpl.description}</p>
                  <span className="inline-block mt-3 text-sm font-medium text-indigo-400 group-hover:translate-x-1 transition-transform">
                    Use Template &rarr;
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* How It Works Section */}
        <div className="mt-16">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-1">
              <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <h2 className="text-lg font-semibold text-gray-200">How It Works</h2>
            </div>
            <p className="text-gray-500 text-sm ml-7">Create your perfect resume in three simple steps</p>
          </div>

          {/* Stepper */}
          <div className="relative">
            {/* Connecting line (desktop only) */}
            <div className="hidden md:block absolute top-8 left-0 right-0 h-px border-t-2 border-dashed border-gray-700/80 mx-[10%]" />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  step: "01",
                  label: "Choose a Design",
                  desc: "Pick a professionally crafted template that suits your style and industry.",
                  accent: "text-blue-400",
                  iconPath: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z",
                },
                {
                  step: "02",
                  label: "Fill In Your Details",
                  desc: "Add your experience, skills, and education with our intuitive guided editor.",
                  accent: "text-emerald-400",
                  iconPath: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z",
                },
                {
                  step: "03",
                  label: "Save & Download",
                  desc: "Export your polished resume as a PDF, ready to send to employers instantly.",
                  accent: "text-purple-400",
                  iconPath: "M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4",
                },
              ].map(({ step, label, desc, accent, iconPath }) => (
                <div key={step} className="flex flex-col items-center md:items-start text-center md:text-left">
                  {/* Step badge + icon row */}
                  <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-gray-800/80 border border-gray-700/60 mb-4 relative z-10 shadow-lg">
                    <svg className={`w-7 h-7 ${accent}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={iconPath} />
                    </svg>
                    {/* Step number badge */}
                    <span className="absolute -top-2 -right-2 text-[10px] font-bold text-gray-500 bg-gray-900 border border-gray-700 rounded-md px-1.5 py-0.5 leading-none tracking-wide">
                      {step}
                    </span>
                  </div>
                  <h3 className="text-white font-semibold text-[15px] mb-1">{label}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed max-w-[220px]">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* What People Say About Us — Carousel */}
        <div className="mt-16 mb-6">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-pink-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-200">What People Say About Us</h2>
          </div>
          <p className="text-gray-500 text-sm mb-6 ml-7">Trusted by job seekers around the world</p>

          {/* Carousel wrapper */}
          <div
            className="relative"
            onMouseEnter={() => { isHoveringRef.current = true; }}
            onMouseLeave={() => { isHoveringRef.current = false; }}
          >
            {/* Card area */}
            <div className="overflow-hidden rounded-2xl">
              <div
                className="transition-all duration-300"
                style={{
                  opacity: isAnimating ? 0 : 1,
                  transform: isAnimating
                    ? `translateX(${direction === "next" ? "24px" : "-24px"})`
                    : "translateX(0)",
                }}
              >
                {(() => {
                  const t = testimonials[activeSlide];
                  return (
                    <div className="bg-gray-800/60 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-8 flex flex-col gap-5">
                      {/* Quote + text */}
                      <div className="flex gap-4">
                        <svg
                          className="w-8 h-8 shrink-0 text-indigo-500/50 mt-0.5"
                          fill="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11H10v10H0z" />
                        </svg>
                        <p className="text-gray-200 text-base leading-relaxed italic">
                          &ldquo;{t.text}&rdquo;
                        </p>
                      </div>
                      {/* Author */}
                      <div className="flex items-center gap-3 pt-4 border-t border-gray-700/50">
                        <div
                          className={`w-10 h-10 rounded-full bg-gradient-to-br ${t.gradient} flex items-center justify-center text-white font-bold text-sm shrink-0`}
                        >
                          {t.name.charAt(0)}
                        </div>
                        <div>
                          <p className="text-white font-semibold text-sm">{t.name}</p>
                          <p className="text-gray-500 text-xs">{t.role}</p>
                        </div>
                        {/* Stars */}
                        <div className="ml-auto flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <svg key={i} className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Prev arrow */}
            <button
              onClick={goPrev}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-9 h-9 rounded-full bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer"
              aria-label="Previous testimonial"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Next arrow */}
            <button
              onClick={goNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-9 h-9 rounded-full bg-gray-800 border border-gray-700 hover:border-gray-500 hover:bg-gray-700 text-gray-300 hover:text-white flex items-center justify-center transition-all duration-200 shadow-lg cursor-pointer"
              aria-label="Next testimonial"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Dots */}
            <div className="flex items-center justify-center gap-2 mt-5">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  onClick={() => goToSlide(i, i > activeSlide ? "next" : "prev")}
                  className={`transition-all duration-300 rounded-full cursor-pointer ${i === activeSlide
                      ? "w-6 h-2 bg-indigo-500"
                      : "w-2 h-2 bg-gray-600 hover:bg-gray-400"
                    }`}
                  aria-label={`Go to testimonial ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {previewResume && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-10 px-4"
          onClick={() => setPreviewResume(null)}
        >
          <div
            className="relative w-full max-w-[850px]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setPreviewResume(null)}
              className="absolute -top-3 -right-3 z-10 w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center shadow-lg cursor-pointer border border-gray-600"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="transform origin-top scale-[0.75] sm:scale-90 lg:scale-100">
              {(() => {
                const Tpl = templateComponents[previewResume.templateId] || BasicTemplate;
                return <Tpl data={previewResume} />;
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            className="bg-gray-800 border border-gray-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-500/20 flex items-center justify-center">
                <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-semibold">Delete Resume</h3>
                <p className="text-sm text-gray-400">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-lg transition cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="flex-1 px-4 py-2 text-sm bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white rounded-lg transition-all cursor-pointer disabled:opacity-50"
              >
                {deleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
