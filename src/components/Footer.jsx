import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="bg-gray-900/80 backdrop-blur-sm border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <Link to="/" className="text-lg font-bold bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
              ResumeBuilder
            </Link>
            <p className="text-sm text-gray-500 mt-2">
              Build professional resumes in minutes with beautiful templates.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Quick Links
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/dashboard" className="text-sm text-gray-500 hover:text-indigo-400 transition">
                  Dashboard
                </Link>
              </li>
              <li>
                <Link to="/login" className="text-sm text-gray-500 hover:text-indigo-400 transition">
                  Login
                </Link>
              </li>
              <li>
                <Link to="/signup" className="text-sm text-gray-500 hover:text-indigo-400 transition">
                  Sign Up
                </Link>
              </li>
            </ul>
          </div>

          {/* Templates */}
          <div>
            <h3 className="text-sm font-semibold text-gray-300 uppercase tracking-wider mb-3">
              Templates
            </h3>
            <ul className="space-y-2">
              <li>
                <Link to="/editor/basic" className="text-sm text-gray-500 hover:text-indigo-400 transition">
                  Basic Template
                </Link>
              </li>
              <li>
                <Link to="/editor/standard" className="text-sm text-gray-500 hover:text-indigo-400 transition">
                  Standard Template
                </Link>
              </li>
              <li>
                <Link to="/editor/pro" className="text-sm text-gray-500 hover:text-indigo-400 transition">
                  Pro Template
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-gray-600">
            &copy; {new Date().getFullYear()} ResumeBuilder. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <span className="text-xs text-gray-600">
              Built with React + Firebase
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
