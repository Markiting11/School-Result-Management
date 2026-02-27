
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ProcessedResult, SchoolConfig } from '../types';

/**
 * Utility to ensure a value is a valid number for jsPDF coordinates.
 * Prevents the common 'Invalid argument passed to jsPDF.f3' error.
 */
const safeNum = (val: unknown, fallback: number = 0): number => {
  const n = Number(val);
  return isNaN(n) ? fallback : n;
};

export const generateSinglePDF = async (result: ProcessedResult, config: SchoolConfig, shouldPrint: boolean = false) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  addResultCardToDoc(doc, result, config);
  
  if (shouldPrint) {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${result.student.rollNo}_${result.student.name.replace(/\s+/g, '_')}_Result.pdf`);
  }
};

export const generateBulkPDF = async (results: ProcessedResult[], config: SchoolConfig, shouldPrint: boolean = false) => {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  results.forEach((result, index) => {
    if (index > 0) doc.addPage();
    addResultCardToDoc(doc, result, config);
  });

  if (shouldPrint) {
    doc.autoPrint();
    window.open(doc.output('bloburl'), '_blank');
  } else {
    doc.save(`${config.name.replace(/\s+/g, '_')}_Full_Results.pdf`);
  }
};

const addResultCardToDoc = (doc: jsPDF, result: ProcessedResult, config: SchoolConfig) => {
  const pageWidth = safeNum(doc.internal.pageSize.getWidth(), 210);
  
  // -- Modern Brand Palette --
  const colors = {
    primary: [49, 46, 129],    // Indigo 900
    secondary: [79, 70, 229],  // Indigo 600
    accent: [245, 158, 11],    // Amber 500
    success: [5, 150, 105],    // Emerald 600
    danger: [225, 29, 72],     // Rose 600
    slate: [71, 85, 105],      // Slate 600
    bg: [248, 250, 252],       // Slate 50
    border: [226, 232, 240],   // Slate 200
    textMain: [30, 41, 59],    // Slate 900
    textMuted: [148, 163, 184] // Slate 400
  };

  // -- Top Header Accent --
  doc.setFillColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // -- Header Section --
  doc.setFillColor(colors.bg[0], colors.bg[1], colors.bg[2]);
  doc.rect(0, 4, pageWidth, 42, 'F');
  
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(26);
  doc.text(String(config.name || '').toUpperCase(), pageWidth / 2, 20, { align: 'center' });
  
  doc.setTextColor(colors.slate[0], colors.slate[1], colors.slate[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(String(config.address || ''), pageWidth / 2, 26, { align: 'center' });
  doc.text(`Contact: ${String(config.contact || '')}`, pageWidth / 2, 31, { align: 'center' });
  
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text(String(config.examType || '').toUpperCase(), pageWidth / 2, 40, { align: 'center' });
  
  // -- Student Information Grid --
  let currentY = 58;
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(20, currentY - 5, pageWidth - 20, currentY - 5);

  const leftCol = 22;
  const rightCol = 112;

  const drawLabelValue = (label: string, value: string, x: number, y: number) => {
    // Label
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
    doc.text(label.toUpperCase(), x, y);
    
    // Value
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(colors.textMain[0], colors.textMain[1], colors.textMain[2]);
    doc.text(String(value || '-'), x, y + 6);
  };

  // Grid layout for info
  drawLabelValue('Roll Number', result.student.rollNo, leftCol, currentY);
  drawLabelValue('Class / Section', `${result.student.class} - ${result.student.section}`, rightCol, currentY);
  
  currentY += 16;
  drawLabelValue('Student Name', result.student.name, leftCol, currentY);
  drawLabelValue('Father Name', result.student.fatherName, rightCol, currentY);
  
  currentY += 16;
  drawLabelValue('Date of Birth', result.student.dob, leftCol, currentY);
  drawLabelValue('Academic Session', config.academicYear, rightCol, currentY);

  // -- Performance Table --
  autoTable(doc, {
    startY: currentY + 12,
    margin: { left: 20, right: 20 },
    head: [['SUBJECT', 'MAX MARKS', 'PASSING', 'OBTAINED', 'REMARKS']],
    body: result.scores.map(s => [
      String(s.subjectName || '').toUpperCase(),
      String(s.totalMarks || '0'),
      String(s.passingMarks || '0'),
      String(s.obtainedMarks || '0'),
      Number(s.obtainedMarks) >= Number(s.passingMarks) ? 'PASS' : 'FAIL'
    ]),
    theme: 'grid',
    headStyles: { 
      fillColor: colors.primary, 
      textColor: 255, 
      halign: 'center', 
      fontStyle: 'bold',
      fontSize: 9,
      cellPadding: 4
    },
    columnStyles: {
      0: { halign: 'left', fontStyle: 'bold' },
      1: { halign: 'center' },
      2: { halign: 'center' },
      3: { halign: 'center' },
      4: { halign: 'center' }
    },
    bodyStyles: { 
      textColor: colors.textMain,
      fontSize: 9,
      cellPadding: 4
    },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index === 4) {
        if (data.cell.text[0] === 'FAIL') {
          data.cell.styles.textColor = colors.danger;
          data.cell.styles.fontStyle = 'bold';
        } else {
          data.cell.styles.textColor = colors.success;
          data.cell.styles.fontStyle = 'bold';
        }
      }
    }
  });

  const autoTableResults = (doc as jsPDF & { lastAutoTable?: { finalY: number } }).lastAutoTable;
  const finalY = safeNum(autoTableResults?.finalY, currentY + 60) + 12;

  // -- Result Summary Card --
  const cardWidth = pageWidth - 40;
  const cardHeight = 42;
  
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.setFillColor(255, 255, 255);
  try {
    (doc as jsPDF & { roundedRect: (x: number, y: number, w: number, h: number, rx: number, ry: number, style: string) => void }).roundedRect(20, finalY, cardWidth, cardHeight, 2, 2, 'FD');
  } catch {
    doc.rect(20, finalY, cardWidth, cardHeight, 'FD');
  }

  // Vertical Separator
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(pageWidth / 2, finalY + 6, pageWidth / 2, finalY + cardHeight - 6);

  // Left Section
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFont('helvetica', 'bold');
  doc.text('AGGREGATE SCORE', 28, finalY + 10);
  
  doc.setFontSize(16);
  doc.setTextColor(colors.textMain[0], colors.textMain[1], colors.textMain[2]);
  doc.text(`${result.summary.totalObtainedMarks} / ${result.summary.totalMaxMarks}`, 28, finalY + 19);
  
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('PERCENTAGE', 28, finalY + 28);
  
  doc.setFontSize(16);
  doc.setTextColor(colors.secondary[0], colors.secondary[1], colors.secondary[2]);
  doc.text(`${result.summary.percentage}%`, 28, finalY + 37);

  // Right Section
  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('FINAL GRADE', pageWidth / 2 + 10, finalY + 10);
  
  doc.setFontSize(24);
  doc.setTextColor(colors.primary[0], colors.primary[1], colors.primary[2]);
  doc.text(String(result.summary.grade || '-'), pageWidth / 2 + 10, finalY + 22);

  doc.setFontSize(8);
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.text('STATUS', pageWidth / 2 + 10, finalY + 31);
  
  const isPass = result.summary.status === 'Pass';
  doc.setTextColor(isPass ? colors.success[0] : colors.danger[0], isPass ? colors.success[1] : colors.danger[1], isPass ? colors.success[2] : colors.danger[2]);
  doc.setFontSize(12);
  doc.text(String(result.summary.status || '').toUpperCase(), pageWidth / 2 + 10, finalY + 38);

  // -- Footer Branding --
  const footerY = 275;
  doc.setDrawColor(colors.border[0], colors.border[1], colors.border[2]);
  doc.line(20, footerY, pageWidth - 20, footerY);
  
  doc.setTextColor(colors.textMuted[0], colors.textMuted[1], colors.textMuted[2]);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text(`Doc Ref: EPS-ID-${result.student.rollNo}-${new Date().getFullYear()}`, 20, footerY + 5);
  doc.text(`Generated: ${new Date().toLocaleString()}`, pageWidth - 20, footerY + 5, { align: 'right' });
  
  // -- Signature Block --
  const sigY = 252;
  doc.setTextColor(colors.textMain[0], colors.textMain[1], colors.textMain[2]);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.text('Principal Signature', pageWidth - 55, sigY + 10);
  doc.setDrawColor(colors.textMain[0], colors.textMain[1], colors.textMain[2]);
  doc.line(pageWidth - 60, sigY + 5, pageWidth - 15, sigY + 5);
};
