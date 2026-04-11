import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { generateContract } from '@/lib/contract-pdf';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json({ error: 'Contract ID is required' }, { status: 400 });
    }

    // Fetch the booking and its associated booths
    const booking = await db.booking.findUnique({
      where: { id },
      include: {
        booths: true,
      },
    });

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 });
    }

    // If the customer has uploaded a signed contract, redirect to that exact file
    const existingContractPath = booking.signedContractPath || booking.contractPath;
    if (existingContractPath) {
      return NextResponse.redirect(new URL(existingContractPath, request.url));
    }

    const boothLabels = booking.booths.map(b => b.label);
    const boothAreas = booking.booths.map(b => b.area);
    const boothIds = booking.booths.map(b => b.id);

    const contractData = {
      entityName: booking.entityName,
      unifiedNumber: booking.unifiedNumber,
      address: booking.address,
      contactName: booking.contactName,
      jobTitle: booking.jobTitle,
      mobile: booking.mobile,
      phone: booking.phone || '',
      email: booking.email,
      boothIds,
      boothLabels,
      boothAreas,
      totalPrice: booking.totalPrice,
      bookingId: booking.id,
      createdAt: booking.createdAt.toISOString().split('T')[0],
    };

    console.log(`[Contract Download] Generating PDF for booking ${id}, entity: ${contractData.entityName}`);

    const pdfBytes = await generateContract(contractData);

    // Ensure filename only uses safe characters, or URL encode it
    const safeEntityName = encodeURIComponent(booking.entityName.replace(/\s+/g, '_'));

    // Return the raw PDF bytes as a readable stream or buffer
    return new NextResponse(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="contract.pdf"; filename*=UTF-8''contract-${safeEntityName}.pdf`,
      },
    });
  } catch (error) {
    console.error('[Contract Download] Error generating contract:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { success: false, error: 'Failed to generate contract', details: errorMessage },
      { status: 500 }
    );
  }
}
