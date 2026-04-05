import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    
    // Support both single file upload ('file' field) and multi-file ('contract'/'receipt')
    const file = formData.get('file') as File | null;
    const contract = formData.get('contract') as File | null;
    const receipt = formData.get('receipt') as File | null;

    // Single file upload mode
    if (file) {
      const uploadDir = path.join(process.cwd(), 'public', 'uploads', 'contracts');
      await mkdir(uploadDir, { recursive: true });

      const buffer = Buffer.from(await file.arrayBuffer());
      const filename = `${Date.now()}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const filepath = path.join(uploadDir, filename);
      await writeFile(filepath, buffer);

      return NextResponse.json({
        success: true,
        path: `/uploads/contracts/${filename}`,
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
      const contractDir = path.join(process.cwd(), 'public', 'uploads', 'contracts');
      await mkdir(contractDir, { recursive: true });

      const contractBuffer = Buffer.from(await contract.arrayBuffer());
      const contractFilename = `${Date.now()}-${contract.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const contractPath = path.join(contractDir, contractFilename);
      await writeFile(contractPath, contractBuffer);
      result.contractPath = `/uploads/contracts/${contractFilename}`;
    }

    if (receipt) {
      const receiptDir = path.join(process.cwd(), 'public', 'uploads', 'receipts');
      await mkdir(receiptDir, { recursive: true });

      const receiptBuffer = Buffer.from(await receipt.arrayBuffer());
      const receiptFilename = `${Date.now()}-${receipt.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const receiptPath = path.join(receiptDir, receiptFilename);
      await writeFile(receiptPath, receiptBuffer);
      result.receiptPath = `/uploads/receipts/${receiptFilename}`;
    }

    return NextResponse.json({
      success: true,
      message: 'Files uploaded successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error uploading files:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to upload files' },
      { status: 500 }
    );
  }
}
