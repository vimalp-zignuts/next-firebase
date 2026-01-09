import { adminFirestore } from '@/config/FirebaseAdminConfig';
import { verifySession } from '@/utils/serverAuth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const sortBy = searchParams.get('sortBy') || 'createdAt';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query: any = adminFirestore.collection('products');

    // Apply filters
    if (category) {
      query = query.where('category', '==', category);
    }

    // Apply sorting
    query = query.orderBy(sortBy, sortOrder as 'asc' | 'desc');

    const snapshot = await query.get();
    let products = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate() || new Date(),
    }));

    // Apply search filter (client-side for simplicity)
    if (search) {
      products = products.filter((product: any) =>
        product.title.toLowerCase().includes(search.toLowerCase()) ||
        product.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    const total = products.length;
    const startIndex = (page - 1) * limit;
    const paginatedProducts = products.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      success: true,
      data: paginatedProducts,
      count: total,
      page,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Fetch products error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifySession(request);

    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    if (!authResult.isAdmin) {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const requestBody = await request.json();
    const { title, price, description, category, imageUrl } = requestBody;

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

    const productData = {
      title: title.trim(),
      price: productPrice,
      description: description.trim(),
      category: category.trim(),
      imageUrl: imageUrl || '',
      createdAt: new Date(),
    };

    const docRef = await adminFirestore.collection('products').add(productData);

    return NextResponse.json({
      success: true,
      id: docRef.id,
      message: 'Product created successfully'
    });
  } catch (error) {
    console.error('Create product error:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}
