"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation"

const MATERIAL_TYPES = [
  { value: "syllabus", label: "Syllabus" },
  { value: "notes", label: "Notes" },
  { value: "study-guide", label: "Study Guide" },
  { value: "past-exam", label: "Past Exam" },
  { value: "project-spec", label: "Project Spec" },
  { value: "other", label: "Other" },
];

const QUARTERS = ["Fall", "Winter", "Spring", "Summer"];
const YEARS = ["2026", "2025", "2024", "2023"];

export default function ContributePage() {
  return (
    <Suspense fallback={null}>
      <ContributeForm />
    </Suspense>
  );
}

function ContributeForm() {
  const searchParams = useSearchParams()
  const [department,setDepartment] = useState(searchParams.get("dept") ?? "")
  const [courseNumber, setCourseNumber] = useState(searchParams.get("courseNumber") ?? "")
  const [materialType, setMaterialType] = useState("syllabus");
  const [quarter, setQuarter] = useState("Winter");
  const [year, setYear] = useState("2026");
  const [professor, setProfessor] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    // For MVP, show a placeholder success state
    // Full GitHub API integration will be added when the GitHub App is set up
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSubmitted(true);
    setSubmitting(false);
  };

  if (submitted) {
    return (
      <div className="mx-auto max-w-xl px-6 py-16 text-center">
        <div className="mb-4 text-4xl">&#x2705;</div>
        <h1 className="mb-2 text-2xl font-bold text-gray-900">Contribution Submitted!</h1>
        <p className="mb-6 text-sm text-gray-500">
          Thank you for helping your fellow Bruins. Your contribution will be reviewed by a
          maintainer and merged shortly.
        </p>
        <a
          href="/"
          className="inline-block rounded-lg bg-[#2774AE] px-5 py-2 text-sm font-semibold text-white hover:bg-[#1e5f8f]"
        >
          Back to Home
        </a>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-6 py-10">
      <h1 className="mb-2 text-2xl font-bold text-gray-900">Upload Course Material</h1>
      <p className="mb-8 text-xs text-gray-500">
        Your upload creates a pull request on GitHub. A maintainer will review and merge it.
      </p>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="contrib-dept" className="mb-1 block text-sm font-semibold text-gray-700">Department</label>
          <input
            id="contrib-dept"
            type="text"
            required
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
            placeholder="e.g. Computer Science, Mathematics"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
          />
        </div>

        <div>
          <label htmlFor="contrib-course" className="mb-1 block text-sm font-semibold text-gray-700">Course Number</label>
          <input
            id="contrib-course"
            type="text"
            required
            value={courseNumber}
            onChange={(e) => setCourseNumber(e.target.value)}
            placeholder="e.g. 31, 131, 180"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
          />
        </div>

        <div>
          <label htmlFor="contrib-type" className="mb-1 block text-sm font-semibold text-gray-700">Material Type</label>
          <select
            id="contrib-type"
            value={materialType}
            onChange={(e) => setMaterialType(e.target.value)}
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
          >
            {MATERIAL_TYPES.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="contrib-quarter" className="mb-1 block text-sm font-semibold text-gray-700">Quarter & Year</label>
          <div className="flex gap-2">
            <select
              id="contrib-quarter"
              value={quarter}
              onChange={(e) => setQuarter(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
            >
              {QUARTERS.map((q) => (
                <option key={q} value={q}>{q}</option>
              ))}
            </select>
            <select
              id="contrib-year"
              aria-label="Year"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label htmlFor="contrib-professor" className="mb-1 block text-sm font-semibold text-gray-700">
            Professor <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <input
            id="contrib-professor"
            type="text"
            value={professor}
            onChange={(e) => setProfessor(e.target.value)}
            placeholder="e.g. Smallberg, Nachenberg"
            className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
          />
        </div>

        <div>
          <label htmlFor="contrib-file" className="mb-1 block text-sm font-semibold text-gray-700">File</label>
          <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center">
            <input
              id="contrib-file"
              type="file"
              required
              accept=".pdf,.docx,.png,.jpg,.jpeg,.md,.txt"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="text-sm text-gray-500"
            />
            <p className="mt-2 text-xs text-gray-400">
              PDF, DOCX, PNG, JPG, MD — max 10MB
            </p>
          </div>
          {file && file.size > 10 * 1024 * 1024 && (
            <p className="mt-1 text-xs text-red-500">File is too large (max 10MB)</p>
          )}
        </div>

        <div>
          <label htmlFor="contrib-desc" className="mb-1 block text-sm font-semibold text-gray-700">
            Description <span className="font-normal text-gray-400">(optional)</span>
          </label>
          <textarea
            id="contrib-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Any notes about this material..."
            className="h-20 w-full resize-y rounded-lg border border-gray-200 px-3 py-2 text-sm outline-none focus:border-[#2774AE]"
          />
        </div>

        <button
          type="submit"
          disabled={submitting || (file !== null && file.size > 10 * 1024 * 1024)}
          className="w-full rounded-lg bg-[#2774AE] py-3 text-sm font-semibold text-white hover:bg-[#1e5f8f] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Submitting..." : "Submit Contribution"}
        </button>

        <p className="text-center text-xs text-gray-400">
          By uploading, you confirm this material doesn&apos;t violate copyright.{" "}
          <a href="/takedown" className="text-[#2774AE] hover:underline">Takedown policy</a>
        </p>
      </form>
    </div>
  );
}
