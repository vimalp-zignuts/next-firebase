import { adminFirestore } from '@/config/FirebaseAdminConfig';
import { verifySession } from '@/utils/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySession(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const userId = searchParams.get('userId') || false;

    let query: any = adminFirestore.collection('orders');

    // If not admin, only show user's own orders
    if (!authResult.isAdmin || userId) {
      query = query.where('userId', '==', authResult.user.uid);
    }

    // Apply status filter
    if (status) {
      query = query.where('status', '==', status);
    }

    // Apply sorting (skip database sorting for userEmail)
    if (sortBy !== 'userEmail') {
      query = query.orderBy(sortBy, sortOrder as 'asc' | 'desc');
    } else {
      // Default sort for userEmail case
      query = query.orderBy('createdAt', 'desc');
    }

    const snapshot = await query.get();
    let orders = await Promise.all(
      snapshot.docs.map(async (doc: any) => {
        const orderData = doc.data();

        // Get user email (only for admin)
        let userEmail = 'Unknown';
        if (authResult.isAdmin) {
          try {
            const userDoc = await adminFirestore.collection('users').doc(orderData.userId).get();
            userEmail = userDoc.data()?.email || 'Unknown';
          } catch (error) {
            console.error('Error fetching user:', error);
          }
        }

        return {
          id: doc.id,
          ...orderData,
          userEmail: authResult.isAdmin ? userEmail : undefined,
          createdAt: orderData.createdAt?.toDate() || new Date(),
        };
      })
    );

    // Apply search filter (admin only)
    if (search && authResult.isAdmin) {
      orders = orders.filter(order =>
        order.userEmail?.toLowerCase().includes(search.toLowerCase()) ||
        order.id.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Apply client-side sorting for userEmail
    if (sortBy === 'userEmail') {
      orders.sort((a, b) => {
        const emailA = (a.userEmail || '').toLowerCase();
        const emailB = (b.userEmail || '').toLowerCase();
        const comparison = emailA.localeCompare(emailB);
        return sortOrder === 'asc' ? comparison : -comparison;
      });
    }

    const total = orders.length;
    const startIndex = (page - 1) * limit;
    const paginatedOrders = orders.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      orders: paginatedOrders,
      count: total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Fetch orders error:', error);
    return NextResponse.json({ error: 'Failed to fetch orders' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySession(request);
    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    // Get user's cart
    const cartDoc = await adminFirestore.collection('carts').doc(authResult.user.uid).get();
    if (!cartDoc.exists) {
      return NextResponse.json({ error: 'Cart not found' }, { status: 404 });
    }

    const cartData = cartDoc.data();
    if (!cartData?.items || cartData.items.length === 0) {
      return NextResponse.json({ error: 'Cart is empty' }, { status: 400 });
    }

    // Fetch product details for each cart item and calculate total
    const itemsWithProducts = await Promise.all(
      cartData.items.map(async (item: any) => {
        const productDoc = await adminFirestore.collection('products').doc(item.productId).get();
        const productData = productDoc.data();

        return {
          ...item,
          product: productData ? {
            id: productDoc.id,
            title: productData.title,
            price: productData.price,
            imageUrl: productData.imageUrl,
            description: productData.description,
            category: productData.category
          } : null
        };
      })
    );

    // Filter out items where product was not found
    const validItems = itemsWithProducts.filter(item => item.product !== null);

    if (validItems.length === 0) {
      return NextResponse.json({ error: 'No valid products in cart' }, { status: 400 });
    }

    // Calculate total
    const total = validItems.reduce((sum: number, item: any) =>
      sum + (item.product.price * item.quantity), 0
    );

    // Create order
    const orderData = {
      userId: authResult.user.uid,
      items: validItems,
      total,
      status: 'pending',
      createdAt: new Date()
    };

    const orderRef = await adminFirestore.collection('orders').add(orderData);

    // Clear cart
    await adminFirestore.collection('carts').doc(authResult.user.uid).delete();

    return NextResponse.json({
      success: true,
      orderId: orderRef.id
    });
  } catch (error) {
    console.error('Create order error:', error);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}