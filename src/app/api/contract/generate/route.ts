import { NextRequest, NextResponse } from 'next/server';
import { generateContract } from '@/lib/contract-pdf';

export async function GET() {
  return NextResponse.json(
    {
      success: false,
      error: 'Method not allowed. Use POST to generate a contract.',
      hint: 'POST /api/contract/generate with JSON body containing: entityName, unifiedNumber, address, contactName, jobTitle, mobile, email, boothLabels, totalPrice',
    },
    { status: 405 }
  );
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const requiredFields = [
      'entityName', 'unifiedNumber', 'address', 'contactName',
      'jobTitle', 'mobile', 'email', 'boothLabels', 'totalPrice',
    ];

    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { success: false, error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const boothLabels: string[] = body.boothLabels;
    const boothAreas: number[] = body.boothAreas || boothLabels.map(() => 9);
    const boothIds: string[] = body.boothIds || boothLabels.map((_: string, i: number) => `booth-${i}`);

    const contractData = {
      entityName: body.entityName,
      unifiedNumber: body.unifiedNumber,
      address: body.address,
      contactName: body.contactName,
      jobTitle: body.jobTitle,
      mobile: body.mobile,
      phone: body.phone || '',
      email: body.email,
      boothIds,
      boothLabels,
      boothAreas,
      totalPrice: body.totalPrice,
      bookingId: body.bookingId || `BK-${Date.now()}`,
      createdAt: body.createdAt || new Date().toISOString().split('T')[0],
    };

    console.log(`[Contract] Generating PDF for booking ${contractData.bookingId}, entity: ${contractData.entityName}`);

    const pdfBytes = await generateContract(contractData);
    const base64 = Buffer.from(pdfBytes).toString('base64');

    console.log(`[Contract] PDF generated successfully for booking ${contractData.bookingId} (${pdfBytes.length} bytes)`);

    return NextResponse.json({
      success: true,
      pdfBase64: base64,
      mimeType: 'application/pdf',
      filename: `contract-${contractData.bookingId}.pdf`,
    });
  } catch (error) {
    console.error('[Contract] Error generating contract:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to generate contract', details: errorMessage },
      { status: 500 }
    );
  }
}
