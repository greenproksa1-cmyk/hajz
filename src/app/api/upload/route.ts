import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support both single file upload ('file' field) and multi-file ('contract'/'receipt')
    const file = formData.get('file') as File | null;
    const contract = formData.get('contract') as File | null;
    const receipt = formData.get('receipt') as File | null;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return NextResponse.json(
        { success: false, error: 'Database environment variables are missing' },
        { status: 500 }
      );
    }

    const uploadToSupabase = async (fileObj: File, type: string) => {
      const buffer = await fileObj.arrayBuffer();
      const filename = `${Date.now()}-${fileObj.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const pathUrl = `${supabaseUrl}/storage/v1/object/uploads/${type}/${filename}`;

      let response = await fetch(pathUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': fileObj.type,
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
          });

          // Retry upload
          response = await fetch(pathUrl, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${supabaseKey}`,
              'Content-Type': fileObj.type,
            },
            body: buffer,
          });
        }
      }

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      return `${supabaseUrl}/storage/v1/object/public/uploads/${type}/${filename}`;
    };

    // Single file upload mode
    if (file) {
      const path = await uploadToSupabase(file, 'general');
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
      result.contractPath = await uploadToSupabase(contract, 'contracts');
    }

    if (receipt) {
      result.receiptPath = await uploadToSupabase(receipt, 'receipts');
    }

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully to cloud',
      data: result,
    });
  } catch (error) {
    console.error('Error uploading files to Supabase:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload files to cloud storage' },
      { status: 500 }
    );
  }
}
