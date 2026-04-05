import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Return all floor plans
export async function GET() {
  try {
    const floorPlans = await db.floorPlan.findMany({
      include: {
        booths: {
          orderBy: [{ y: 'asc' }, { x: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      success: true,
      data: floorPlans,
    });
  } catch (error) {
    console.error('Error fetching floor plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch floor plans' },
      { status: 500 }
    );
  }
}

// POST: Create new floor plan with booths array in body
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, width, height, booths } = body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Floor plan name is required' },
        { status: 400 }
      );
    }

    // Check for duplicate name
    const existingPlan = await db.floorPlan.findFirst({
      where: { name: name.trim() },
    });

    if (existingPlan) {
      return NextResponse.json(
        { success: false, error: 'A floor plan with this name already exists' },
        { status: 409 }
      );
    }

    // Create floor plan with booths
    const floorPlan = await db.floorPlan.create({
      data: {
        name: name.trim(),
        description: description || null,
        width: width || 1200,
        height: height || 800,
        isActive: true,
        booths: booths
          ? {
              create: booths.map((booth: {
                label: string;
                area: number;
                status?: string;
                boothType?: string;
                price?: number;
                x?: number;
                y?: number;
                width?: number;
                height?: number;
              }) => ({
                label: booth.label,
                area: booth.area,
                status: booth.status || 'available',
                boothType: booth.boothType || 'standard',
                price: booth.price ?? null,
                x: booth.x ?? 0,
                y: booth.y ?? 0,
                width: booth.width ?? 100,
                height: booth.height ?? 80,
              })),
            }
          : undefined,
      },
      include: { booths: true },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Floor plan created successfully',
        data: floorPlan,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create floor plan' },
      { status: 500 }
    );
  }
}
