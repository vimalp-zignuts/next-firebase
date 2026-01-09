import { adminFirestore } from '@/config/FirebaseAdminConfig';
import { verifySession } from '@/utils/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const doc = await adminFirestore.collection('products').doc(id).get();

    if (!doc.exists) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: {
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data()?.createdAt?.toDate() || new Date(),
      }
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch product' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifySession(request);
    if (authResult.error || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const { title, price, description, category, imageUrl } = await request.json();

    if (!title || !price || !description || !category) {
      return NextResponse.json(
        { error: 'Title, price, description, and category are required' },
        { status: 400 }
      );
    }

    const productPrice = Number(price);
    if (isNaN(productPrice) || productPrice <= 0) {
      return NextResponse.json(
        { error: 'Price must be a positive number' },
        { status: 400 }
      );
    }

    await adminFirestore.collection('products').doc(id).update({
      title: title.trim(),
      price: productPrice,
      description: description.trim(),
      category: category.trim(),
      imageUrl: imageUrl || '',
      updatedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Product updated successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update product' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const authResult = await verifySession(request);
    if (authResult.error || !authResult.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    await adminFirestore.collection('products').doc(id).delete();

    return NextResponse.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}