import * as htmlToImage from 'html-to-image';
import jsPDF from 'jspdf';
import { toast } from 'sonner';

/**
 * Utility to wait for all images in an element to load
 */
const waitForImages = async (element: HTMLElement) => {
  const images = Array.from(element.getElementsByTagName('img'));
  const promises = images.map(img => {
    if (img.complete) return Promise.resolve();
    return new Promise((resolve) => {
      img.onload = resolve;
      img.onerror = resolve; // Continue even if one image fails
    });
  });
  await Promise.all(promises);
};

export const generateContractPDF = async (elementId: string, filename: string = 'Contract.pdf') => {
  const originalElement = document.getElementById(elementId);
  if (!originalElement) {
    console.error(`generateContractPDF: Element with id ${elementId} not found`);
    toast.error('Failed to generate PDF. Template missing.');
    return false;
  }

  // Ensure fonts are ready
  if (document.fonts) {
    await document.fonts.ready;
  }

  // Create a high-fidelity clone for capture
  // This avoids issues with parent display:none or off-screen pruning
  const clone = originalElement.cloneNode(true) as HTMLElement;
  
  // Set explicit styles for the clone to ensure it's "captured" correctly
  clone.style.display = 'block';
  clone.style.visibility = 'visible';
  clone.style.position = 'relative';
  clone.style.left = '0';
  clone.style.top = '0';
  clone.style.margin = '0';
  
  // Create a sandbox container that is in the DOM but hidden from view
  const sandbox = document.createElement('div');
  sandbox.style.position = 'fixed';
  sandbox.style.left = '-10000px';
  sandbox.style.top = '0';
  sandbox.style.width = '210mm'; // Fixed A4 width
  sandbox.style.height = 'auto';
  sandbox.style.zIndex = '-9999';
  sandbox.appendChild(clone);
  document.body.appendChild(sandbox);

  try {
    // Wait for images inside the clone to be fully loaded
    await waitForImages(clone);
    
    // Slight delay for layout engine to stabilize the clone
    await new Promise(resolve => setTimeout(resolve, 500));

    const width = clone.offsetWidth || 800;
    const height = clone.offsetHeight || 1122;

    // Capture using html-to-image
    const dataUrl = await htmlToImage.toPng(clone, { 
      quality: 1, 
      backgroundColor: '#ffffff',
      pixelRatio: 2, 
      width,
      height,
      cacheBust: true,
      // Ensure specific styles are included
      style: {
        display: 'block',
        visibility: 'visible',
      }
    });

    if (!dataUrl || dataUrl.length < 500) {
      throw new Error("Captured image is too small or empty.");
    }

    const margin = 10; // 10mm margin
    const pdfWidth = 210 - (margin * 2); // Effective width for content
    const pdfHeight = 297 - (margin * 2); // Effective height for one page
    
    const pdf = new jsPDF('p', 'mm', 'a4');

    const canvasRatio = height / width;
    const imgHeight = pdfWidth * canvasRatio;

    let heightLeft = imgHeight;
    let position = margin; // Start at top margin

    // Add first page with safe margins
    pdf.addImage(dataUrl, 'PNG', margin, position, pdfWidth, imgHeight);
    heightLeft -= (297 - (margin * 2));

    // Add subsequent pages if it overflows
    while (heightLeft > 0) {
      pdf.addPage();
      position = margin - (imgHeight - heightLeft);
      pdf.addImage(dataUrl, 'PNG', margin, position, pdfWidth, imgHeight);
      heightLeft -= (297 - (margin * 2));
    }


    pdf.save(filename);
    return true;
  } catch (error) {
    console.error('CRITICAL Error generating PDF:', error);
    toast.error('Failed to generate high-quality PDF. Please try again.');
    return false;
  } finally {
    // Cleanup sandbox
    if (sandbox.parentNode) {
      sandbox.parentNode.removeChild(sandbox);
    }
  }
};
