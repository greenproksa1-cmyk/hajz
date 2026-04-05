import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import fontkit from '@pdf-lib/fontkit';
import fs from 'fs';
import path from 'path';
import reshape from 'arabic-reshaper';

export interface ContractData {
  entityName: string;
  unifiedNumber: string;
  address: string;
  contactName: string;
  jobTitle: string;
  mobile: string;
  phone: string;
  email: string;
  boothIds: string[];
  boothLabels: string[];
  boothAreas: number[];
  totalPrice: number;
  bookingId: string;
  createdAt: string;
}

export async function generateContract(bookingData: ContractData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  pdfDoc.registerFontkit(fontkit);

  let fontRegular, fontBold;
  try {
    const fontPath = path.join(process.cwd(), 'public', 'fonts', 'Amiri-Regular.ttf');
    const fontBytes = fs.readFileSync(fontPath);
    fontRegular = await pdfDoc.embedFont(fontBytes);
    fontBold = await pdfDoc.embedFont(fontBytes);
  } catch (err) {
    fontRegular = await pdfDoc.embedFont(StandardFonts.Helvetica);
    fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  }

  const pageWidth = 595.28; // A4 width
  const pageHeight = 841.89; // A4 height
  const margin = 40;
  const contentWidth = pageWidth - margin * 2;

  let page = pdfDoc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  // Colors
  const darkNavy = rgb(0.08, 0.12, 0.2); // Extremely dark blue for premium feel
  const primaryOrange = rgb(0.976, 0.451, 0.086); // Main Orange Theme
  const secondaryGrey = rgb(0.96, 0.96, 0.97); // Very light grey for backgrounds
  const strokeColor = rgb(0.85, 0.85, 0.85); // Light borders

  // Helper function to draw text
  const drawText = (text: string, x: number, yPos: number, options: { font?: any; size?: number; color?: any; maxWidth?: number; align?: 'left' | 'center' | 'right' } = {}) => {
    const font = options.font || fontRegular;
    const size = options.size || 10;
    const color = options.color || rgb(0, 0, 0);

    const safeText = text == null ? '' : String(text);
    if (!safeText) return yPos;

    // Process Arabic text
    let processedText = safeText;
    try {
      if (/[\u0600-\u06FF]/.test(safeText)) {
        processedText = reshape(safeText).split('').reverse().join('');
      } else {
        if (!options.font && font === fontRegular) {
          processedText = safeText.replace(/[^\x00-\x7F]/g, '');
        }
      }
    } catch {
      processedText = safeText.replace(/[^\x00-\x7F]/g, '');
    }

    let textX = x;
    if (options.align === 'center') {
      textX = x - font.widthOfTextAtSize(processedText, size) / 2;
    } else if (options.align === 'right') {
      textX = x - font.widthOfTextAtSize(processedText, size);
    }

    if (options.maxWidth) {
      const words = processedText.replace(/\n/g, ' ').split(' ');
      let line = '';
      const lineHeight = size * 1.5;
      for (const word of words) {
        const testLine = line + (line ? ' ' : '') + word;
        const testWidth = font.widthOfTextAtSize(testLine, size);
        if (testWidth > options.maxWidth && line) {
          const alignX = options.align === 'center' ? x - font.widthOfTextAtSize(line, size)/2 : x;
          const alignRightX = options.align === 'right' ? x - font.widthOfTextAtSize(line, size) : alignX;
          page.drawText(line, { x: alignRightX, y: yPos, size, font, color });
          yPos -= lineHeight;
          line = word;
        } else {
          line = testLine;
        }
      }
      if (line) {
        const alignX = options.align === 'center' ? x - font.widthOfTextAtSize(line, size)/2 : x;
        const alignRightX = options.align === 'right' ? x - font.widthOfTextAtSize(line, size) : alignX;
        page.drawText(line, { x: alignRightX, y: yPos, size, font, color });
        yPos -= lineHeight;
      }
      return yPos; 
    }

    page.drawText(processedText, { x: textX, y: yPos, size, font, color });
    return yPos - size * 1.5; 
  };

  const drawWatermark = () => {
    page.drawText('RIYADH EXHIBITION 2026', {
      x: 100,
      y: pageHeight / 2 - 150,
      size: 55,
      font: fontBold,
      color: rgb(0.1, 0.1, 0.1),
      opacity: 0.04,
      rotate: degrees(45),
    });
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < margin + 40) {
      page = pdfDoc.addPage([pageWidth, pageHeight]);
      drawWatermark();
      y = pageHeight - margin;
      return true;
    }
    return false;
  };

  drawWatermark();

  // ─── 1. HEADER ───
  page.drawRectangle({ x: 0, y: pageHeight - 90, width: pageWidth, height: 90, color: darkNavy });
  page.drawRectangle({ x: 0, y: pageHeight - 95, width: pageWidth, height: 5, color: primaryOrange });

  y = pageHeight - 45;
  drawText('RIYADH CONTRACTORS EXHIBITION 2026', pageWidth / 2, y, { font: fontBold, size: 18, color: rgb(1,1,1), align: 'center' });
  y -= 25;
  drawText('BOOTH RENTAL CONTRACT / AGENDA DE LOCACAO DE ESTANDE', pageWidth / 2, y, { size: 10, color: rgb(0.7, 0.8, 0.9), align: 'center' });

  y = pageHeight - 120;
  
  // Document Meta Top Right
  drawText('Ref: ' + bookingData.bookingId.substring(0, 8).toUpperCase(), pageWidth - margin, y + 5, { font: fontBold, size: 9, align: 'right', color: darkNavy });
  drawText('Date: ' + new Date(bookingData.createdAt).toLocaleDateString(), pageWidth - margin, y - 8, { size: 9, align: 'right', color: rgb(0.4, 0.4, 0.4) });

  y = drawText('EXHIBITION CONTRACT AGREEMENT', margin, y, { font: fontBold, size: 14, color: darkNavy });
  y -= 15;

  // ─── 2. SECTION 1: TWO COLUMN LAYOUT ───
  page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 26, color: darkNavy });
  y = drawText('1. EXHIBITOR INFORMATION', margin + 10, y - 5, { font: fontBold, size: 11, color: rgb(1,1,1) });
  y -= 15;

  page.drawRectangle({
    x: margin, y: y - 100, width: contentWidth, height: 110,
    borderColor: strokeColor, borderWidth: 1, color: secondaryGrey,
  });
  
  y -= 15;
  const col1X = margin + 10;
  const val1X = margin + 90;
  const col2X = margin + contentWidth / 2 + 10;
  const val2X = margin + contentWidth / 2 + 75;
  const maxW = contentWidth / 2 - 100;

  const leftFields = [
    ['Entity Name:', bookingData.entityName],
    ['Contact Person:', bookingData.contactName],
    ['Mobile:', bookingData.mobile],
    ['Email:', bookingData.email],
  ];
  const rightFields = [
    ['Unified No:', bookingData.unifiedNumber],
    ['Job Title:', bookingData.jobTitle],
    ['Phone:', bookingData.phone],
    ['Address:', bookingData.address],
  ];

  const section1StartY = y;
  for (let i = 0; i < 4; i++) {
    drawText(leftFields[i][0], col1X, y, { font: fontBold, size: 9, color: darkNavy });
    drawText(leftFields[i][1], val1X, y, { size: 9, maxWidth: maxW });
    drawText(rightFields[i][0], col2X, y, { font: fontBold, size: 9, color: darkNavy });
    drawText(rightFields[i][1], val2X, y, { size: 9, maxWidth: maxW });
    y -= 22; // strict row drop
  }
  y = section1StartY - 100;
  y -= 25;

  // ─── 3. SECTION 2: TABLE ───
  ensureSpace(200);
  page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 26, color: darkNavy });
  y = drawText('2. SELECTED BOOTHS & PRICING', margin + 10, y - 5, { font: fontBold, size: 11, color: rgb(1,1,1) });
  y -= 15;

  const thX = [margin + 10, margin + 60, margin + 180, margin + 300, margin + 400];
  const tableHeaderY = y;
  page.drawRectangle({ x: margin, y: tableHeaderY - 15, width: contentWidth, height: 25, color: rgb(0.2, 0.2, 0.2) });
  
  drawText('#', thX[0], tableHeaderY - 2, { font: fontBold, size: 9, color: rgb(1, 1, 1) });
  drawText('ID', thX[1], tableHeaderY - 2, { font: fontBold, size: 9, color: rgb(1, 1, 1) });
  drawText('Label', thX[2], tableHeaderY - 2, { font: fontBold, size: 9, color: rgb(1, 1, 1) });
  drawText('Area (sqm)', thX[3], tableHeaderY - 2, { font: fontBold, size: 9, color: rgb(1, 1, 1) });
  drawText('Price (SAR)', thX[4], tableHeaderY - 2, { font: fontBold, size: 9, color: rgb(1, 1, 1) });
  
  let runningY = tableHeaderY - 30;
  const rowHeight = 22;
  const pricePerSqm = 1700;

  for (let i = 0; i < bookingData.boothLabels.length; i++) {
    const rowColor = i % 2 === 0 ? secondaryGrey : rgb(1, 1, 1);
    page.drawRectangle({ x: margin, y: runningY - 15, width: contentWidth, height: rowHeight, color: rowColor });
    
    drawText(String(i + 1), thX[0], runningY - 2, { size: 9 });
    drawText(bookingData.boothIds[i]?.substring(0, 8) || '-', thX[1], runningY - 2, { size: 9 });
    drawText(bookingData.boothLabels[i] || '-', thX[2], runningY - 2, { size: 9 });
    drawText(String(bookingData.boothAreas[i] || 0), thX[3], runningY - 2, { size: 9 });
    drawText(String((bookingData.boothAreas[i] || 0) * pricePerSqm).toLocaleString(), thX[4], runningY - 2, { size: 9 });
    runningY -= rowHeight;
  }

  const numRows = bookingData.boothLabels.length;
  page.drawRectangle({
    x: margin, y: tableHeaderY - 15 - (numRows * rowHeight), width: contentWidth, height: (numRows * rowHeight) + 25,
    borderColor: strokeColor, borderWidth: 1,
  });

  runningY -= 15;
  
  // Subtotal and Total Section
  const boxW = 220;
  page.drawRectangle({
    x: pageWidth - margin - boxW, y: runningY - 60, width: boxW, height: 75,
    borderColor: strokeColor, borderWidth: 1, color: secondaryGrey
  });
  
  const subtotal = bookingData.totalPrice; 
  drawText('Subtotal:', pageWidth - margin - boxW + 15, runningY - 10, { font: fontBold, size: 9, color: darkNavy });
  drawText(subtotal.toLocaleString() + ' SAR', pageWidth - margin - 15, runningY - 10, { size: 9, align: 'right' });
  
  drawText('VAT (15%):', pageWidth - margin - boxW + 15, runningY - 25, { font: fontBold, size: 9, color: darkNavy });
  drawText('INCLUDED', pageWidth - margin - 15, runningY - 25, { size: 9, align: 'right', color: rgb(0.4, 0.4, 0.4) });

  page.drawRectangle({ x: pageWidth - margin - boxW, y: runningY - 60, width: boxW, height: 26, color: primaryOrange });
  drawText('GRAND TOTAL', pageWidth - margin - boxW + 15, runningY - 50, { font: fontBold, size: 10, color: rgb(1,1,1) });
  drawText(bookingData.totalPrice.toLocaleString() + ' SAR', pageWidth - margin - 15, runningY - 50, { font: fontBold, size: 10, color: rgb(1,1,1), align: 'right' });
  
  y = runningY - 95;

  // ─── 4. SECTION 3: TERMS ───
  ensureSpace(200);
  page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 26, color: darkNavy });
  y = drawText('3. TERMS & CONDITIONS', margin + 10, y - 5, { font: fontBold, size: 11, color: rgb(1,1,1) });
  y -= 15;

  const terms = [
    '1. The exhibitor agrees to rent the specified booth(s) for the duration of the Riyadh Contractors Exhibition 2026.',
    '2. Payment must be completed within 7 business days of contract signing to confirm the reservation.',
    '3. Cancellation policy: Full refund if cancelled 30+ days before the event. 50% refund if 15-29 days.',
    '4. The exhibitor is responsible for booth setup, decoration, and compliance with exhibition guidelines.',
    '5. All electrical and internet connections must be arranged through the official provider.',
  ];

  for (const term of terms) {
    y = drawText(term, margin + 5, y, { size: 9, maxWidth: contentWidth - 10, color: rgb(0.3, 0.3, 0.3) });
    y -= 5;
  }
  y -= 15;

  // ─── 5. SECTION 4: SIGNATURES ───
  ensureSpace(200);
  page.drawRectangle({ x: margin, y: y - 20, width: contentWidth, height: 26, color: darkNavy });
  y = drawText('4. AUTHORIZATION & AGREEMENT', margin + 10, y - 5, { font: fontBold, size: 11, color: rgb(1,1,1) });
  y -= 25;

  const box1X = margin;
  const box2X = margin + contentWidth / 2 + 10;
  const boxWidth = contentWidth / 2 - 10;

  // Exhibitor Box
  page.drawRectangle({ x: box1X, y: y - 110, width: boxWidth, height: 110, borderColor: strokeColor, borderWidth: 1, color: secondaryGrey });
  page.drawRectangle({ x: box1X, y: y - 20, width: boxWidth, height: 25, color: strokeColor });
  drawText('EXHIBITOR / REPRESENTATIVE', box1X + 10, y - 10, { font: fontBold, size: 10, color: darkNavy });
  
  drawText('Name:', box1X + 10, y - 40, { font: fontBold, size: 9 });
  drawText(bookingData.contactName || '________________________', box1X + 60, y - 40, { size: 9 });
  
  drawText('Date:', box1X + 10, y - 65, { font: fontBold, size: 9 });
  drawText('________________________', box1X + 60, y - 65, { size: 9 });
  
  drawText('Signature:', box1X + 10, y - 90, { font: fontBold, size: 9 });
  drawText('________________________', box1X + 60, y - 90, { size: 9, color: rgb(0.6,0.6,0.6) });

  // Organizer Box
  page.drawRectangle({ x: box2X, y: y - 110, width: boxWidth, height: 110, borderColor: strokeColor, borderWidth: 1, color: secondaryGrey });
  page.drawRectangle({ x: box2X, y: y - 20, width: boxWidth, height: 25, color: strokeColor });
  drawText('EXHIBITION ORGANIZER', box2X + 10, y - 10, { font: fontBold, size: 10, color: darkNavy });
  
  drawText('Name:', box2X + 10, y - 40, { font: fontBold, size: 9 });
  drawText('Riyadh Exhibition Admin', box2X + 60, y - 40, { size: 9 });
  
  drawText('Date:', box2X + 10, y - 65, { font: fontBold, size: 9 });
  drawText('________________________', box2X + 60, y - 65, { size: 9 });
  
  drawText('Signature:', box2X + 10, y - 90, { font: fontBold, size: 9 });
  drawText('________________________', box2X + 60, y - 90, { size: 9, color: rgb(0.6,0.6,0.6) });

  // ─── FOOTER ───
  const pages = pdfDoc.getPages();
  for (let i = 0; i < pages.length; i++) {
    const currentPage = pages[i];
    const footerY = 25;
    
    currentPage.drawLine({
      start: { x: margin, y: footerY + 15 },
      end: { x: pageWidth - margin, y: footerY + 15 },
      thickness: 1,
      color: primaryOrange,
    });

    currentPage.drawText('Riyadh Contractors Exhibition 2026', { x: margin, y: footerY, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
    const text = `Page ${i + 1} of ${pages.length}`;
    const tw = fontRegular.widthOfTextAtSize(text, 8);
    currentPage.drawText(text, { x: pageWidth/2 - tw/2, y: footerY, size: 8, font: fontRegular, color: rgb(0.5, 0.5, 0.5) });
    
    const confText = 'Confidential';
    const cw = fontRegular.widthOfTextAtSize(confText, 8);
    currentPage.drawText(confText, { x: pageWidth - margin - cw, y: footerY, size: 8, font: fontRegular, color: rgb(0.8, 0.3, 0.3) });
  }

  return pdfDoc.save();
}
