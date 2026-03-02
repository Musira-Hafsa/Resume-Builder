export default function BasicTemplate({ data }) {
  const { personal, education, experience, skills } = data;

  return (
    <div className="bg-white p-8 max-w-[800px] mx-auto shadow-lg" style={{ overflowWrap: "anywhere", wordBreak: "break-word" }}>
      {/* Header */}
      <div className="text-center border-b-2 border-gray-800 pb-4 mb-6">
        <h1 className="text-3xl font-bold uppercase tracking-wide text-gray-900">
          {personal.fullName || "Your Name"}
        </h1>
        <div className="flex flex-wrap justify-center gap-4 mt-2 text-sm text-gray-600">
          {personal.email && <span>{personal.email}</span>}
          {personal.phone && <span>{personal.phone}</span>}
          {personal.address && <span>{personal.address}</span>}
        </div>
      </div>

      {/* Summary */}
      {personal.summary && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-2">
            Summary
          </h2>
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {personal.summary}
          </p>
        </div>
      )}

      {/* Experience */}
      {experience.length > 0 && experience[0].company && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">
            Experience
          </h2>
          {experience.map((exp, i) => (
            <div key={i} className="mb-4">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="font-semibold text-gray-900 min-w-0">{exp.title}</h3>
                <span className="text-sm text-gray-500 shrink-0">{exp.duration}</span>
              </div>
              <p className="text-sm text-gray-600 italic">{exp.company}</p>
              {exp.description && (
                <p className="text-sm text-gray-700 mt-1 whitespace-pre-wrap">{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education.length > 0 && education[0].institution && (
        <div className="mb-6">
          <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">
            Education
          </h2>
          {education.map((edu, i) => (
            <div key={i} className="mb-3">
              <div className="flex justify-between items-baseline gap-2">
                <h3 className="font-semibold text-gray-900 min-w-0">{edu.degree}</h3>
                <span className="text-sm text-gray-500 shrink-0">{edu.year}</span>
              </div>
              <p className="text-sm text-gray-600">{edu.institution}</p>
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills.length > 0 && skills[0] && (
        <div>
          <h2 className="text-lg font-bold uppercase text-gray-800 border-b border-gray-300 pb-1 mb-3">
            Skills
          </h2>
          <div className="flex flex-wrap gap-2">
            {skills.filter(Boolean).map((skill, i) => (
              <span
                key={i}
                className="bg-gray-100 text-gray-800 px-3 py-1 rounded text-sm"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
