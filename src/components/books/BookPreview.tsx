'use client';

import { useState } from 'react';
import { generateMonthlyPDF, downloadPDF } from '@/lib/pdf';
import Button from '@/components/ui/Button';
import type { Question } from '@/lib/types';

interface Entry {
  id: string;
  entry_date: string;
  question_1_answer: string | null;
  question_2_answer: string | null;
  question_3_answer: string | null;
  question_1: Pick<Question, 'id' | 'text'> | null;
  question_2: Pick<Question, 'id' | 'text'> | null;
  question_3: Pick<Question, 'id' | 'text'> | null;
}

interface BookPreviewProps {
  userName: string;
  monthYear: string;
  monthName: string;
  entries: Entry[];
}

export default function BookPreview({ userName, monthYear, monthName, entries }: BookPreviewProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownload = async () => {
    setIsGenerating(true);

    try {
      const doc = generateMonthlyPDF({
        userName,
        monthYear,
        entries: entries.map((e) => ({
          entry_date: e.entry_date,
          question_1: e.question_1,
          question_1_answer: e.question_1_answer,
          question_2: e.question_2,
          question_2_answer: e.question_2_answer,
          question_3: e.question_3,
          question_3_answer: e.question_3_answer,
        })),
      });

      const fileName = `${userName.replace(/\s+/g, '_')}_${monthYear}.pdf`;
      downloadPDF(doc, fileName);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  if (entries.length === 0) {
    return (
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] p-8 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#8B7355]/10 flex items-center justify-center">
          <BookIcon className="w-8 h-8 text-[#8B7355]" />
        </div>
        <h3 className="text-lg font-serif font-semibold text-[#2C2C2C] mb-2">
          No entries yet
        </h3>
        <p className="text-[#6B6B6B]">
          Start journaling to create your monthly book!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Book Cover Preview */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="aspect-[5/7] max-w-[200px] mx-auto my-8 bg-[#FEFDFB] border border-[#E8E6E3] rounded shadow-lg flex flex-col items-center justify-center p-4">
          <span className="font-serif font-bold text-[#2C2C2C] text-center text-sm">
            {userName}
          </span>
          <div className="w-8 h-px bg-[#8B7355] my-2" />
          <span className="font-serif text-[#2C2C2C] text-xs text-center">
            {monthName}
          </span>
        </div>

        <div className="p-6 border-t border-[#E8E6E3] flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-serif font-semibold text-[#2C2C2C]">
              Your Monthly Book
            </h3>
            <p className="text-sm text-[#6B6B6B]">
              5×7 inch PDF format, ready to print
            </p>
          </div>
          <Button onClick={handleDownload} isLoading={isGenerating}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* Entry Summary */}
      <div className="bg-white rounded-2xl shadow-sm border border-[#E8E6E3] overflow-hidden">
        <div className="p-6">
          <h3 className="font-serif font-semibold text-[#2C2C2C]">
            Book Contents
          </h3>
          <p className="text-sm text-[#6B6B6B] mt-1">
            {entries.length} days of reflections
          </p>
          <p className="text-sm text-[#6B6B6B] mt-4">
            Your journal entries are private. Download the PDF to revisit your reflections.
          </p>
        </div>
      </div>

      {/* Info */}
      <p className="text-center text-sm text-[#6B6B6B]">
        The PDF includes a cover page, all your entries, and blank pages for additional notes.
      </p>
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
    </svg>
  );
}

function DownloadIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

