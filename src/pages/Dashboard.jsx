import { useState, useEffect } from "react";
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

export default function Dashboard() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [previewResume, setPreviewResume] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

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
