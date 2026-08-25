import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// GET: Return single floor plan with its booths
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const floorPlan = await db.floorPlan.findUnique({
      where: { id },
      include: {
        booths: {
          orderBy: [{ y: 'asc' }, { x: 'asc' }],
        },
      },
    });

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: floorPlan,
    });
  } catch (error) {
    console.error('Error fetching floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch floor plan' },
      { status: 500 }
    );
  }
}

// PATCH: Update floor plan name/description
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, description, width, height, isActive } = body;

    const existingPlan = await db.floorPlan.findUnique({
      where: { id },
    });

    if (!existingPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' },
        { status: 404 }
      );
    }

    // Check for duplicate name if name is being updated
    if (name && name.trim() !== existingPlan.name) {
      const duplicate = await db.floorPlan.findFirst({
        where: { name: name.trim() },
      });
      if (duplicate) {
        return NextResponse.json(
          { success: false, error: 'A floor plan with this name already exists' },
          { status: 409 }
        );
      }
    }

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = name.trim();
    if (description !== undefined) updateData.description = description || null;
    if (width !== undefined) updateData.width = Number(width);
    if (height !== undefined) updateData.height = Number(height);
    if (isActive !== undefined) updateData.isActive = isActive;

    const result = await db.$transaction(async (tx) => {
      // 1. Update plan metadata
      await tx.floorPlan.update({
        where: { id },
        data: updateData,
      });

      if (body.booths && Array.isArray(body.booths)) {
        // 2. Delete existing booths on this plan that are NOT booked or pending
        // This avoids deleting booths that already have active reservations
        await tx.booth.deleteMany({
          where: {
            floorPlanId: id,
            status: { notIn: ['booked', 'pending'] },
          },
        });

        // 3. Create new booths
        // We filter out booths that have 'booked' or 'pending' status because those should already exist in DB
        const boothsToCreate = body.booths.filter((b: any) => b.status !== 'booked' && b.status !== 'pending');
        
        if (boothsToCreate.length > 0) {
          await tx.booth.createMany({
            data: boothsToCreate.map((b: any) => ({
              label: b.label,
              area: Number(b.area),
              status: b.status || 'available',
              boothType: b.boothType || 'standard',
              price: b.price ? Number(b.price) : null,
              x: Number(b.x ?? 0),
              y: Number(b.y ?? 0),
              width: Number(b.width ?? 100),
              height: Number(b.height ?? 80),
              floorPlanId: id,
            })),
          });
        }
      }

      return await tx.floorPlan.findUnique({
        where: { id },
        include: { booths: true },
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Floor plan updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error updating floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update floor plan' },
      { status: 500 }
    );
  }
}

// DELETE: Delete floor plan (only if no booked booths)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const floorPlan = await db.floorPlan.findUnique({
      where: { id },
      include: { booths: true },
    });

    if (!floorPlan) {
      return NextResponse.json(
        { success: false, error: 'Floor plan not found' },
        { status: 404 }
      );
    }

    // Check if any booths on this floor plan are booked
    const bookedBooths = floorPlan.booths.filter(
      (booth) => booth.status === 'booked'
    );

    if (bookedBooths.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Cannot delete floor plan: ${bookedBooths.length} booth(s) are booked. Remove or unbook all booths first.`,
        },
        { status: 409 }
      );
    }

    // Delete the floor plan (booths are cascade-deleted via relation)
    await db.floorPlan.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Floor plan deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting floor plan:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete floor plan' },
      { status: 500 }
    );
  }
}
