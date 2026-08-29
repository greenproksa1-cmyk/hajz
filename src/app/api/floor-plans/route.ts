import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

// GET: Return all floor plans (summary list - no heavy booth data)
export async function GET() {
  try {
    // For the list view, we only need summary info + booth count
    // Full booth details are fetched on demand via [id] endpoint
    const floorPlans = await db.floorPlan.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        width: true,
        height: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
        booths: {
          select: {
            id: true,
            label: true,
            area: true,
            status: true,
            boothType: true,
            price: true,
            x: true,
            y: true,
            width: true,
            height: true,
          },
          orderBy: [{ y: 'asc' }, { x: 'asc' }],
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(
      { success: true, data: floorPlans },
      {
        headers: {
          'Cache-Control': 'private, max-age=15, stale-while-revalidate=30',
        },
      }
    );
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
  } catch (error: any) {
    console.error('Error creating floor plan:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create floor plan' },
      { status: 500 }
    );
  }
}
