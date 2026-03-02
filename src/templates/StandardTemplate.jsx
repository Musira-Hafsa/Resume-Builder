export default function StandardTemplate({ data }) {
  const { personal, education, experience, skills } = data;

  return (
    <div className="bg-white max-w-[800px] mx-auto shadow-lg" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
      {/* Header */}
      <div className="bg-emerald-600 text-white p-8">
        <h1 className="text-3xl font-bold">
          {personal.fullName || "Your Name"}
        </h1>
        {personal.summary && (
          <p className="mt-2 text-emerald-100 text-sm leading-relaxed whitespace-pre-wrap">
            {personal.summary}
          </p>
        )}
        <div className="flex flex-wrap gap-x-6 gap-y-2 mt-4 text-sm text-emerald-100">
          {personal.email && (
            <span className="flex items-center gap-1 min-w-0">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <span className="truncate">{personal.email}</span>
            </span>
          )}
          {personal.phone && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
              </svg>
              {personal.phone}
            </span>
          )}
          {personal.address && (
            <span className="flex items-center gap-1">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              {personal.address}
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-0">
        {/* Sidebar */}
        <div className="col-span-1 bg-gray-50 p-6 min-w-0">
          {/* Skills */}
          {skills.length > 0 && skills[0] && (
            <div className="mb-6">
              <h2 className="text-sm font-bold uppercase text-emerald-700 tracking-wider mb-3">
                Skills
              </h2>
              <div className="space-y-2">
                {skills.filter(Boolean).map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 min-w-0">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-sm text-gray-700">{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Education */}
          {education.length > 0 && education[0].institution && (
            <div>
              <h2 className="text-sm font-bold uppercase text-emerald-700 tracking-wider mb-3">
                Education
              </h2>
              {education.map((edu, i) => (
                <div key={i} className="mb-3">
                  <h3 className="font-semibold text-sm text-gray-900">
                    {edu.degree}
                  </h3>
                  <p className="text-xs text-gray-600">{edu.institution}</p>
                  <p className="text-xs text-gray-500">{edu.year}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Main Content */}
        <div className="col-span-2 p-6 min-w-0">
          {experience.length > 0 && experience[0].company && (
            <div>
              <h2 className="text-sm font-bold uppercase text-emerald-700 tracking-wider mb-4">
                Work Experience
              </h2>
              {experience.map((exp, i) => (
                <div
                  key={i}
                  className="mb-5 pl-4 border-l-2 border-emerald-200"
                >
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-gray-900 min-w-0">{exp.title}</h3>
                    <span className="text-xs text-gray-500 shrink-0">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-sm text-emerald-600">{exp.company}</p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
