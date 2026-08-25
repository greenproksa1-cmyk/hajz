/**
 * Helper to safely view or download files across all formats:
 * - data: URLs (Base64)
 * - Remote https:// URLs
 * - Relative /uploads/... URLs
 */
export function openOrDownloadFile(
  filePath: string | null | undefined,
  fileName: string = 'document.pdf',
  forceDownload: boolean = false
) {
  if (!filePath) return;

  try {
    // 1. Handle Base64 data: URLs
    if (filePath.startsWith('data:')) {
      const parts = filePath.split(';base64,');
      const contentType = parts[0].replace('data:', '') || 'application/pdf';
      const base64Data = parts[1];
      
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: contentType });
      const blobUrl = URL.createObjectURL(blob);

      if (forceDownload) {
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        setTimeout(() => URL.revokeObjectURL(blobUrl), 10000);
      } else {
        const win = window.open(blobUrl, '_blank');
        if (!win || win.closed || typeof win.closed === 'undefined') {
          // If popup is blocked by browser, trigger direct download
          const link = document.createElement('a');
          link.href = blobUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
        setTimeout(() => URL.revokeObjectURL(blobUrl), 30000);
      }
      return;
    }

    // 2. Handle HTTP/HTTPS or local paths
    const url = filePath.startsWith('http://') || filePath.startsWith('https://') || filePath.startsWith('/')
      ? filePath
      : `/${filePath}`;

    if (forceDownload) {
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      link.target = '_blank';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  } catch (error) {
    console.error('Error opening file:', error);
    // Fallback: simple window.open
    if (!filePath.startsWith('data:')) {
      window.open(filePath, '_blank');
    }
  }
}
