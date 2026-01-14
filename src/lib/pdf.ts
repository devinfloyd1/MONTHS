import jsPDF from 'jspdf';
import { format, parseISO } from 'date-fns';
import type { Question } from './types';

interface EntryForPDF {
  entry_date: string;
  question_1: Pick<Question, 'text'> | null;
  question_1_answer: string | null;
  question_2: Pick<Question, 'text'> | null;
  question_2_answer: string | null;
  question_3: Pick<Question, 'text'> | null;
  question_3_answer: string | null;
}

interface GeneratePDFOptions {
  userName: string;
  monthYear: string; // Format: 'YYYY-MM'
  entries: EntryForPDF[];
}

// 5x7 inches in points (72 points per inch)
const PAGE_WIDTH = 360;
const PAGE_HEIGHT = 504;
const MARGIN = 36; // 0.5 inch margin
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2);

export function generateMonthlyPDF({ userName, monthYear, entries }: GeneratePDFOptions): jsPDF {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'pt',
    format: [PAGE_WIDTH, PAGE_HEIGHT],
  });

  // Font settings
  const FONT_SERIF = 'times';
  const FONT_SANS = 'helvetica';

  // Parse month/year for display
  const [year, month] = monthYear.split('-');
  const monthDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const monthName = format(monthDate, 'MMMM yyyy');

  // ============ COVER PAGE ============
  doc.setFillColor(254, 253, 251); // #FEFDFB
  doc.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, 'F');

  // Cover title
  doc.setFont(FONT_SERIF, 'bold');
  doc.setFontSize(24);
  doc.setTextColor(44, 44, 44); // #2C2C2C

  const titleY = PAGE_HEIGHT / 2 - 40;
  doc.text(userName, PAGE_WIDTH / 2, titleY, { align: 'center' });

  // Decorative line
  doc.setDrawColor(139, 115, 85); // #8B7355
  doc.setLineWidth(1);
  doc.line(MARGIN + 60, titleY + 20, PAGE_WIDTH - MARGIN - 60, titleY + 20);

  // Month/Year
  doc.setFont(FONT_SERIF, 'normal');
  doc.setFontSize(18);
  doc.text(monthName, PAGE_WIDTH / 2, titleY + 50, { align: 'center' });

  // Small footer text
  doc.setFont(FONT_SANS, 'normal');
  doc.setFontSize(8);
  doc.setTextColor(107, 107, 107); // #6B6B6B
  doc.text('Created with MONTHS', PAGE_WIDTH / 2, PAGE_HEIGHT - MARGIN, { align: 'center' });

  // ============ ENTRY PAGES ============
  let pageNumber = 1;

  // Sort entries by date
  const sortedEntries = [...entries].sort((a, b) =>
    a.entry_date.localeCompare(b.entry_date)
  );

  for (const entry of sortedEntries) {
    doc.addPage();
    pageNumber++;

    let y = MARGIN;

    // Date header
    const entryDate = parseISO(entry.entry_date);
    const dateStr = format(entryDate, 'EEEE, MMMM d');

    doc.setFont(FONT_SERIF, 'bold');
    doc.setFontSize(14);
    doc.setTextColor(44, 44, 44);
    doc.text(dateStr, MARGIN, y + 12);

    y += 30;

    // Decorative line under date
    doc.setDrawColor(232, 230, 227); // #E8E6E3
    doc.setLineWidth(0.5);
    doc.line(MARGIN, y, PAGE_WIDTH - MARGIN, y);

    y += 20;

    // Questions and answers
    const qaItems = [
      { q: entry.question_1?.text, a: entry.question_1_answer },
      { q: entry.question_2?.text, a: entry.question_2_answer },
      { q: entry.question_3?.text, a: entry.question_3_answer },
    ];

    for (let i = 0; i < qaItems.length; i++) {
      const item = qaItems[i];
      if (!item.q) continue;

      // Check if we need a new page
      if (y > PAGE_HEIGHT - 100) {
        doc.addPage();
        pageNumber++;
        y = MARGIN;
      }

      // Question
      doc.setFont(FONT_SERIF, 'italic');
      doc.setFontSize(10);
      doc.setTextColor(139, 115, 85); // #8B7355
      const questionLines = doc.splitTextToSize(`Q${i + 1}: ${item.q}`, CONTENT_WIDTH);
      doc.text(questionLines, MARGIN, y);
      y += questionLines.length * 12 + 8;

      // Answer
      doc.setFont(FONT_SANS, 'normal');
      doc.setFontSize(10);
      doc.setTextColor(44, 44, 44);

      if (item.a) {
        const answerLines = doc.splitTextToSize(item.a, CONTENT_WIDTH);
        // Double spacing
        for (const line of answerLines) {
          if (y > PAGE_HEIGHT - 60) {
            doc.addPage();
            pageNumber++;
            y = MARGIN;
          }
          doc.text(line, MARGIN, y);
          y += 20; // Double-spaced
        }
      } else {
        doc.setTextColor(107, 107, 107);
        doc.text('[No answer provided]', MARGIN, y);
        y += 20;
      }

      y += 20; // Space between questions
    }

    // Add page number at bottom
    doc.setFont(FONT_SANS, 'normal');
    doc.setFontSize(8);
    doc.setTextColor(107, 107, 107);
    doc.text(String(pageNumber), PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: 'center' });
  }

  // Add blank pages for handwriting at the end (if entries exist)
  if (sortedEntries.length > 0) {
    for (let i = 0; i < 3; i++) {
      doc.addPage();
      pageNumber++;

      // Light lines for writing
      doc.setDrawColor(232, 230, 227);
      doc.setLineWidth(0.25);

      for (let lineY = MARGIN + 30; lineY < PAGE_HEIGHT - MARGIN; lineY += 24) {
        doc.line(MARGIN, lineY, PAGE_WIDTH - MARGIN, lineY);
      }

      // Header
      doc.setFont(FONT_SERIF, 'italic');
      doc.setFontSize(10);
      doc.setTextColor(139, 115, 85);
      doc.text('Notes', MARGIN, MARGIN + 12);

      // Page number
      doc.setFont(FONT_SANS, 'normal');
      doc.setFontSize(8);
      doc.setTextColor(107, 107, 107);
      doc.text(String(pageNumber), PAGE_WIDTH / 2, PAGE_HEIGHT - 20, { align: 'center' });
    }
  }

  return doc;
}

export function downloadPDF(doc: jsPDF, fileName: string): void {
  doc.save(fileName);
}

export function getPDFDataUrl(doc: jsPDF): string {
  return doc.output('datauristring');
}
