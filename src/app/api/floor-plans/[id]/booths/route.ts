import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// POST: Add a booth to a floor plan
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: floorPlanId } = await params;
    const body = await request.json();
    const { label, area, status, boothType, price, x, y, width, height } = body;

    // Validate required fields
    if (!label || typeof label !== 'string' || label.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Booth label is required' },
        { status: 400 }
      );
    }

    if (area === undefined || area === null || typeof area !== 'number' || area <= 0) {
      return NextResponse.json(
        { success: false, error: 'Valid booth area is required' },
        { status: 400 }
      );
    }

    // Verify floor plan exists
    const floorPlan = await db.floorPlan.findUnique({
      where: { id: floorPlanId },
    });

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' },
        { status: 404 }
      );
    }

    // Check for duplicate label within the same floor plan
    const existingBooth = await db.booth.findFirst({
      where: {
        floorPlanId,
        label: label.trim(),
      },
    });

    if (existingBooth) {
      return NextResponse.json(
        { success: false, error: `A booth with label "${label}" already exists on this floor plan` },
        { status: 409 }
      );
    }

    const validStatuses = ['available', 'pending', 'booked'];
    const boothStatus = status || 'available';
    if (!validStatuses.includes(boothStatus)) {
      return NextResponse.json(
        { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    const validTypes = ['standard', 'vip', 'sponsor', 'premium', 'corner'];
    const type = boothType || 'standard';
    if (!validTypes.includes(type)) {
      return NextResponse.json(
        { success: false, error: `Invalid booth type. Must be one of: ${validTypes.join(', ')}` },
        { status: 400 }
      );
    }

    // Create booth
    const booth = await db.booth.create({
      data: {
        label: label.trim(),
        area,
        status: boothStatus,
        boothType: type,
        price: price ?? null,
        x: x ?? 0,
        y: y ?? 0,
        width: width ?? 100,
        height: height ?? 80,
        floorPlanId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Booth added successfully',
        data: booth,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding booth to floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to add booth' },
      { status: 500 }
    );
  }
}
