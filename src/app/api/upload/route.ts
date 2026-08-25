import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support both single file upload ('file' field) and multi-file ('contract'/'receipt')
    const file = formData.get('file') as File | null;
    const contract = formData.get('contract') as File | null;
    const receipt = formData.get('receipt') as File | null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    const convertToBase64DataUrl = async (fileObj: File): Promise<string> => {
      const buffer = await fileObj.arrayBuffer();
      const base64 = Buffer.from(buffer).toString('base64');
      const mimeType = fileObj.type || 'application/octet-stream';
      return `data:${mimeType};base64,${base64}`;
    };

    const uploadFileSafely = async (fileObj: File, type: string): Promise<string> => {
      // 1. Try Supabase Storage if credentials exist
      if (supabaseUrl && supabaseKey) {
        try {
          const buffer = await fileObj.arrayBuffer();
          const filename = `${Date.now()}-${fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
          const pathUrl = `${supabaseUrl}/storage/v1/object/uploads/${type}/${filename}`;

          let response = await fetch(pathUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': fileObj.type || 'application/octet-stream',
            },
            body: buffer,
          });

          // If bucket "uploads" doesn't exist, create it and retry
          if (response.status === 404 || response.status === 400) {
            const errorData = await response.json().catch(() => ({}));
            if (errorData?.error === 'Bucket not found' || errorData?.message?.includes('bucket')) {
              await fetch(`${supabaseUrl}/storage/v1/bucket`, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  id: "uploads",
                  name: "uploads",
                  public: true
                }),
              }).catch(() => {});

              // Retry upload
              response = await fetch(pathUrl, {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${supabaseKey}`,
                  'Content-Type': fileObj.type || 'application/octet-stream',
                },
                body: buffer,
              });
            }
          }

          if (response.ok) {
            return `${supabaseUrl}/storage/v1/object/public/uploads/${type}/${filename}`;
          }
        } catch (supabaseError) {
          console.warn('[Upload] Supabase storage upload failed, falling back to base64:', supabaseError);
        }
      }

      // 2. Fallback: Base64 data URI (guaranteed to work in all environments without external bucket dependencies)
      return await convertToBase64DataUrl(fileObj);
    };

    // Single file upload mode
    if (file) {
      const path = await uploadFileSafely(file, 'general');
      return NextResponse.json({
        success: true,
        path,
      });
    }

    // Multi-file upload mode (contract + receipt)
    if (!contract && !receipt) {
      return NextResponse.json(
        { success: false, error: 'At least one file (file, contract, or receipt) is required' },
        { status: 400 }
      );
    }

    const result: { contractPath?: string; receiptPath?: string } = {};

    if (contract) {
      result.contractPath = await uploadFileSafely(contract, 'contracts');
    }

    if (receipt) {
      result.receiptPath = await uploadFileSafely(receipt, 'receipts');
    }

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Error in upload route:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to upload files' },
      { status: 500 }
    );
  }
}
