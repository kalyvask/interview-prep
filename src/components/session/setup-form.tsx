"use client";

import { useCallback, useRef, useState } from "react";
import { parsePdfToText } from "@/lib/pdf-parse";

interface SetupFormProps {
  initialCvText?: string;
  initialJdText?: string;
  onStart: (input: { cvText: string; jdText: string; cvFileName?: string }) => void;
  isLoading?: boolean;
  error?: string | null;
}

export default function SetupForm({
  initialCvText = "",
  initialJdText = "",
  onStart,
  isLoading,
  error,
}: SetupFormProps) {
  const [cvText, setCvText] = useState(initialCvText);
  const [cvFileName, setCvFileName] = useState<string | undefined>();
  const [jdText, setJdText] = useState(initialJdText);
  const [parseError, setParseError] = useState<string | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [showCvAsText, setShowCvAsText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (file: File) => {
    setParseError(null);
    if (file.type !== "application/pdf" && !file.name.endsWith(".pdf")) {
      setParseError("File must be a PDF. Or paste your CV as text instead.");
      return;
    }
    setIsParsing(true);
    try {
      const text = await parsePdfToText(file);
      if (text.length < 100) {
        setParseError(
          "The PDF parsed to less than 100 characters. Try pasting the text manually.",
        );
        setShowCvAsText(true);
        return;
      }
      setCvText(text);
      setCvFileName(file.name);
    } catch (err) {
      const message = err instanceof Error ? err.message : "PDF parsing failed";
      setParseError(`${message}. Try pasting the text manually.`);
      setShowCvAsText(true);
    } finally {
      setIsParsing(false);
    }
  }, []);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onStart({ cvText: cvText.trim(), jdText: jdText.trim(), cvFileName });
  };

  const cvWordCount = cvText.trim().split(/\s+/).filter(Boolean).length;
  const jdWordCount = jdText.trim().split(/\s+/).filter(Boolean).length;
  const canSubmit =
    cvText.trim().length >= 100 && jdText.trim().length >= 100 && !isLoading;

  return (
    <form onSubmit={onSubmit} className="space-y-10">
      {/* CV upload */}
      <section>
        <div className="flex items-baseline justify-between mb-3">
          <h2 className="font-display text-2xl text-[color:var(--color-ink)]">
            Your CV
          </h2>
          <button
            type="button"
            onClick={() => setShowCvAsText((v) => !v)}
            className="text-sm text-[color:var(--color-ink-3)] hover:text-[color:var(--color-ink-2)] underline-offset-4 hover:underline ease-standard transition-colors"
          >
            {showCvAsText ? "Use PDF upload" : "Paste as text"}
          </button>
        </div>

        {!showCvAsText && (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = "copy";
            }}
            onDrop={(e) => {
              e.preventDefault();
              const file = e.dataTransfer.files[0];
              if (file) handleFile(file);
            }}
            onClick={() => fileInputRef.current?.click()}
            className="hairline rounded-2xl p-10 text-center cursor-pointer hover:bg-[color:var(--color-paper-2)] ease-standard transition-colors"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFile(file);
              }}
            />
            {isParsing ? (
              <p className="text-[color:var(--color-ink-2)]">Parsing PDF…</p>
            ) : cvText.length > 0 ? (
              <div className="space-y-2">
                <p className="text-[color:var(--color-ink)] font-medium">
                  {cvFileName || "CV loaded"}
                </p>
                <p className="text-sm text-[color:var(--color-ink-3)]">
                  {cvWordCount.toLocaleString()} words parsed. Click to replace.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-[color:var(--color-ink)] font-medium">
                  Drop your CV here, or click to select.
                </p>
                <p className="text-sm text-[color:var(--color-ink-3)]">
                  PDF only. Parsed in the browser; never leaves your machine.
                </p>
              </div>
            )}
          </div>
        )}

        {showCvAsText && (
          <textarea
            value={cvText}
            onChange={(e) => setCvText(e.target.value)}
            placeholder="Paste your CV here…"
            rows={10}
            className="w-full rounded-2xl hairline p-4 bg-[color:var(--color-paper-2)] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-4)] focus:outline-none focus:ring-0 focus:border-[color:var(--color-accent)]"
          />
        )}

        {parseError && (
          <p className="mt-3 text-sm text-[color:var(--color-danger)]">{parseError}</p>
        )}
        {cvText.length > 0 && (
          <p className="mt-2 text-xs text-[color:var(--color-ink-3)]">
            {cvWordCount.toLocaleString()} words ·{" "}
            {cvText.length.toLocaleString()} characters
          </p>
        )}
      </section>

      {/* JD paste */}
      <section>
        <h2 className="font-display text-2xl text-[color:var(--color-ink)] mb-3">
          The job description
        </h2>
        <textarea
          value={jdText}
          onChange={(e) => setJdText(e.target.value)}
          placeholder="Paste the full JD. The role's stated requirements drive which questions get generated."
          rows={10}
          className="w-full rounded-2xl hairline p-4 bg-[color:var(--color-paper-2)] text-[color:var(--color-ink)] placeholder-[color:var(--color-ink-4)] focus:outline-none focus:border-[color:var(--color-accent)]"
        />
        {jdText.length > 0 && (
          <p className="mt-2 text-xs text-[color:var(--color-ink-3)]">
            {jdWordCount.toLocaleString()} words ·{" "}
            {jdText.length.toLocaleString()} characters
          </p>
        )}
      </section>

      {/* Submit */}
      {error && (
        <div className="tint-paper rounded-2xl p-4">
          <p className="text-sm text-[color:var(--color-danger)]">{error}</p>
        </div>
      )}

      <div className="flex items-center gap-4 pt-2">
        <button
          type="submit"
          disabled={!canSubmit}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[color:var(--color-ink)] text-[color:var(--color-paper)] text-[15px] font-medium ease-standard transition-colors hover:bg-[color:var(--color-accent-2)] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isLoading ? "Generating questions…" : "Start the interview"}
          <span aria-hidden>→</span>
        </button>
        {!canSubmit && !isLoading && (
          <p className="text-sm text-[color:var(--color-ink-3)]">
            CV and JD both need at least 100 characters.
          </p>
        )}
      </div>
    </form>
  );
}
