"use client";

import React, { useState } from "react";
import { ChevronDown, HelpCircle } from "lucide-react";

interface FaqItem {
  question: string;
  answer: string;
}

const FAQS: FaqItem[] = [
  {
    question: "How does SlothAuth guarantee that zero patient PHI leaves the hospital network?",
    answer:
      "Unlike generic AI solutions that send medical charts to external cloud endpoints, SlothAuth is architected to run entirely on-premise. Language inference executes via local Gemma 3 models on Ollama or local Docker inference containers, and vector embeddings are stored in your private PostgreSQL pgvector database. Zero bytes of Protected Health Information (PHI) ever egress over the public Internet.",
  },
  {
    question: "Why did you build this on LangGraph rather than a single prompt?",
    answer:
      "Healthcare prior-authorization cannot tolerate LLM hallucinations. A single prompt often invents dates or glosses over payer rules. SlothAuth uses LangGraph's deterministic 4-node StateGraph (Ingest -> Vector Retrieve -> Clinical Audit -> Synthesis). Each node executes sequential verification with hard assertions, requiring verifiable evidence quotes from the EHR before any criterion can be declared MET.",
  },
  {
    question: "What happens when an EHR chart is missing a required clinical lab or imaging test?",
    answer:
      "The agent flags the patient as MISSING_INFO and lists the precise missing requirement (e.g. 'Missing pre-operative HbA1c test within past 90 days'). The clinical staff can see this immediately upon opening the dashboard and resolve the missing item in 1-click once the lab is received, instantly upgrading the packet to READY_TO_SUBMIT without restarting paperwork from scratch.",
  },
  {
    question: "Does the SlothAuth agent submit prior-authorization requests autonomously without human review?",
    answer:
      "No. SlothAuth is designed as a Human-In-The-Loop clinical copilot. The agent performs all the tedious overnight heavy lifting (extracting notes, auditing guidelines, drafting medical necessity appeal letters), but the final electronic signature and submission authority always remains with the licensed physician or designated prior-auth specialist.",
  },
  {
    question: "How are different payer policies (Humana, UnitedHealthcare, Aetna) managed?",
    answer:
      "Clinical policies are chunked by CPT procedure code and payer guidelines and embedded into a local PostgreSQL pgvector table with HNSW indexing. When a patient request arrives, hybrid SQL filtering queries the specific payer and procedure code while calculating cosine similarity to pull only the binding guidelines.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-24 bg-slate-900/30 relative border-t border-slate-800/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Got Questions?</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Frequently Asked Questions
          </h2>
          <p className="mt-3 text-sm sm:text-base text-slate-400">
            Everything you need to know about SlothAuth&apos;s privacy, determinism, and clinical architecture.
          </p>
        </div>

        <div className="space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden transition-all shadow-md"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-5 text-left flex items-center justify-between gap-4 hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  <span className="font-bold text-sm sm:text-base text-slate-200">
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-emerald-400 shrink-0 transition-transform duration-200 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-400 leading-relaxed border-t border-slate-800/50 bg-slate-950/40">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
