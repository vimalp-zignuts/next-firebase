import { adminFirestore } from '@/config/FirebaseAdminConfig';
import { verifySession } from '@/utils/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Authentication required' }, { status: authResult.status || 401 });
    }

    const cartDoc = await adminFirestore.collection('carts').doc(authResult.user.uid).get();
    const cartData = cartDoc.data();

    if (!cartData?.items?.length) {
      return NextResponse.json({
        success: true,
        cart: { userId: authResult.user.uid, items: [], updatedAt: new Date() }
      });
    }

    // Fetch product details for each cart item
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

    return NextResponse.json({
      success: true,
      cart: {
        ...cartData,
        items: validItems
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch cart' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Authentication required' }, { status: authResult.status || 401 });
    }

    const { productId, quantity } = await request.json();
    const cartRef = adminFirestore.collection('carts').doc(authResult.user.uid);


    const cartDoc = await cartRef.get();
    const cartData = cartDoc.data();

    let items = cartData?.items || [];
    const existingItem = items.find((item: any) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      items.push({ productId, quantity });
    }

    await cartRef.set({
      userId: authResult.user.uid,
      items,
      updatedAt: new Date()
    });



    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Authentication required' }, { status: authResult.status || 401 });
    }

    const { productId, quantity } = await request.json();
    const cartRef = adminFirestore.collection('carts').doc(authResult.user.uid);
    const cartDoc = await cartRef.get();
    const cartData = cartDoc.data();

    let items = cartData?.items || [];
    const existingItem = items.find((item: any) => item.productId === productId);

    if (existingItem) {
      existingItem.quantity = quantity;
    }

    await cartRef.set({
      userId: authResult.user.uid,
      items,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, message: 'Cart updated' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update cart' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (authResult.error || !authResult.user) {
      return NextResponse.json({ error: authResult.error || 'Authentication required' }, { status: authResult.status || 401 });
    }

    const { productId } = await request.json();
    const cartRef = adminFirestore.collection('carts').doc(authResult.user.uid);
    const cartDoc = await cartRef.get();
    const cartData = cartDoc.data();

    let items = cartData?.items || [];
    items = items.filter((item: any) => item.productId !== productId);

    await cartRef.set({
      userId: authResult.user.uid,
      items,
      updatedAt: new Date()
    });

    return NextResponse.json({ success: true, message: 'Item removed from cart' });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to remove from cart' }, { status: 500 });
  }
}