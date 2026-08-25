import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

// PATCH: Update a single booth (edit details, change status)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    // Verify booth exists
    const existingBooth = await db.booth.findUnique({
      where: { id },
    });

    if (!existingBooth) {
      return NextResponse.json(
        { success: false, error: 'Booth not found' },
        { status: 404 }
      );
    }

    // Build update data
    const updateData: Record<string, unknown> = {};

    if (body.label !== undefined) {
      if (!body.label || typeof body.label !== 'string' || body.label.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'Booth label cannot be empty' },
          { status: 400 }
        );
      }
      updateData.label = body.label.trim();
    }

    if (body.area !== undefined) {
      if (typeof body.area !== 'number' || body.area <= 0) {
        return NextResponse.json(
          { success: false, error: 'Valid booth area is required' },
          { status: 400 }
        );
      }
      updateData.area = body.area;
    }

    if (body.status !== undefined) {
      const validStatuses = ['available', 'pending', 'booked'];
      if (!validStatuses.includes(body.status)) {
        return NextResponse.json(
          { success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.status = body.status;
    }

    if (body.boothType !== undefined) {
      const validTypes = ['standard', 'vip', 'sponsor', 'premium', 'corner'];
      if (!validTypes.includes(body.boothType)) {
        return NextResponse.json(
          { success: false, error: `Invalid booth type. Must be one of: ${validTypes.join(', ')}` },
          { status: 400 }
        );
      }
      updateData.boothType = body.boothType;
    }

    if (body.price !== undefined) {
      updateData.price = body.price === null ? null : Number(body.price);
    }

    if (body.x !== undefined) updateData.x = Number(body.x);
    if (body.y !== undefined) updateData.y = Number(body.y);
    if (body.width !== undefined) updateData.width = Number(body.width);
    if (body.height !== undefined) updateData.height = Number(body.height);

    // Check for unique constraint violation if label is changing
    if (updateData.label && updateData.label !== existingBooth.label) {
      const duplicateBooth = await db.booth.findFirst({
        where: {
          floorPlanId: existingBooth.floorPlanId,
          label: updateData.label as string,
          id: { not: id },
        },
      });

      if (duplicateBooth) {
        return NextResponse.json(
          { success: false, error: `A booth with label "${updateData.label}" already exists on this floor plan` },
          { status: 409 }
        );
      }
    }

    const updatedBooth = await db.booth.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: 'Booth updated successfully',
      data: updatedBooth,
    });
  } catch (error) {
    console.error('Error updating booth:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update booth' },
      { status: 500 }
    );
  }
}

// DELETE: Delete a booth (only if not booked)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const booth = await db.booth.findUnique({
      where: { id },
    });

    if (!booth) {
      return NextResponse.json(
        { success: false, error: 'Booth not found' },
        { status: 404 }
      );
    }

    if (booth.status === 'booked') {
      return NextResponse.json(
        { success: false, error: 'Cannot delete a booked booth' },
        { status: 409 }
      );
    }

    await db.booth.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: 'Booth deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting booth:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete booth' },
      { status: 500 }
    );
  }
}
