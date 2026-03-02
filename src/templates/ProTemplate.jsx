export default function ProTemplate({ data }) {
  const { personal, education, experience, skills } = data;

  return (
    <div className="bg-white max-w-[800px] mx-auto shadow-lg flex min-h-[600px]" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
      {/* Left Sidebar */}
      <div className="w-1/3 bg-gray-900 text-white p-6 min-w-0">
        {/* Avatar placeholder */}
        <div className="w-24 h-24 rounded-full bg-purple-500 mx-auto flex items-center justify-center text-3xl font-bold mb-4">
          {(personal.fullName || "?")
            .split(" ")
            .map((n) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)}
        </div>
        <h1 className="text-xl font-bold text-center mb-1">
          {personal.fullName || "Your Name"}
        </h1>

        {/* Contact */}
        <div className="mt-6">
          <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
            Contact
          </h2>
          <div className="space-y-2 text-sm text-gray-300">
            {personal.email && (
              <p className="break-all">{personal.email}</p>
            )}
            {personal.phone && <p>{personal.phone}</p>}
            {personal.address && <p>{personal.address}</p>}
          </div>
        </div>

        {/* Skills */}
        {skills.length > 0 && skills[0] && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
              Skills
            </h2>
            <div className="space-y-2">
              {skills.filter(Boolean).map((skill, i) => (
                <div key={i}>
                  <span className="text-sm text-gray-300">{skill}</span>
                  <div className="w-full bg-gray-700 rounded-full h-1.5 mt-1">
                    <div
                      className="bg-purple-500 h-1.5 rounded-full"
                      style={{ width: `${75 + ((i * 17) % 25)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Education */}
        {education.length > 0 && education[0].institution && (
          <div className="mt-6">
            <h2 className="text-xs font-bold uppercase tracking-widest text-purple-400 mb-3">
              Education
            </h2>
            {education.map((edu, i) => (
              <div key={i} className="mb-3">
                <h3 className="text-sm font-semibold text-white">
                  {edu.degree}
                </h3>
                <p className="text-xs text-gray-400">{edu.institution}</p>
                <p className="text-xs text-gray-500">{edu.year}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right Content */}
      <div className="w-2/3 p-6 min-w-0">
        {/* Summary */}
        {personal.summary && (
          <div className="mb-6">
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-600 mb-2">
              About Me
            </h2>
            <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
              {personal.summary}
            </p>
          </div>
        )}

        {/* Experience */}
        {experience.length > 0 && experience[0].company && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-widest text-purple-600 mb-4">
              Experience
            </h2>
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-[5px] top-2 bottom-2 w-0.5 bg-purple-200" />
              {experience.map((exp, i) => (
                <div key={i} className="relative pl-6 mb-6">
                  {/* Timeline dot */}
                  <div className="absolute left-0 top-1.5 w-[11px] h-[11px] rounded-full bg-purple-500 border-2 border-white" />
                  <div className="flex justify-between items-baseline gap-2">
                    <h3 className="font-semibold text-gray-900 min-w-0">{exp.title}</h3>
                    <span className="text-xs text-gray-400 shrink-0">
                      {exp.duration}
                    </span>
                  </div>
                  <p className="text-sm text-purple-600 font-medium">
                    {exp.company}
                  </p>
                  {exp.description && (
                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                      {exp.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
