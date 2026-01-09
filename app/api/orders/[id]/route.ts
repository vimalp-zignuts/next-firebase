import { adminFirestore } from '@/config/FirebaseAdminConfig';
import { verifySession } from '@/utils/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifySession(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const doc = await adminFirestore.collection('orders').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = doc.data();

    // Check if user can access this order
    if (!authResult.isAdmin && orderData?.userId !== authResult.user.uid) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get user email (only for admin)
    let userEmail = 'Unknown';
    if (authResult.isAdmin && orderData?.userId) {
      try {
        const userDoc = await adminFirestore.collection('users').doc(orderData.userId).get();
        userEmail = userDoc.data()?.email || 'Unknown';
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...orderData,
        userEmail: authResult.isAdmin ? userEmail : undefined,
        createdAt: orderData?.createdAt?.toDate() || new Date(),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch order' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifySession(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { status } = await request.json();

    if (!status) {
      return NextResponse.json({ error: 'Status is required' }, { status: 400 });
    }

    const doc = await adminFirestore.collection('orders').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const orderData = doc.data();

    // Authorization rules
    if (authResult.isAdmin) {
      // Admin can change any status
      if (!['pending', 'completed', 'cancelled'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }
    } else {
      // Regular users can only cancel their own orders
      if (orderData?.userId !== authResult.user.uid) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }

      if (status !== 'cancelled') {
        return NextResponse.json({ error: 'Users can only cancel orders' }, { status: 403 });
      }

      if (orderData?.status === 'completed') {
        return NextResponse.json({ error: 'Cannot cancel completed orders' }, { status: 400 });
      }
    }

    await adminFirestore.collection('orders').doc(id).update({
      status,
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Order status updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update order' }, { status: 500 });
  }
}