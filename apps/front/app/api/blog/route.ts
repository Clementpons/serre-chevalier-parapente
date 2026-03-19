import { NextRequest, NextResponse } from 'next/server';
import { getBlogs, getLastBlog, getCategories, getAuthors } from '@/sanity/lib/blogs';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const action = searchParams.get('action');

    if (action === 'last') {
      const lastBlog = await getLastBlog();
      return NextResponse.json(lastBlog);
    }

    if (action === 'categories') {
      const categories = await getCategories();
      return NextResponse.json(categories);
    }

    if (action === 'authors') {
      const authors = await getAuthors();
      return NextResponse.json(authors);
    }

    // Default action: get blogs with filters
    const search = searchParams.get('search') || '';
    const categories = searchParams.get('categories')
      ? searchParams.get('categories')!.split(',').filter(c => c)
      : [];
    const authors = searchParams.get('authors')
      ? searchParams.get('authors')!.split(',').filter(a => a)
      : [];
    const page = Number(searchParams.get('page')) || 1;
    const limit = Number(searchParams.get('limit')) || 12;

    const blogs = await getBlogs({
      search,
      categories,
      authors,
      page,
      limit,
    });

    return NextResponse.json(blogs);
  } catch (error) {
    console.error('Error fetching blogs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch blogs' },
      { status: 500 }
    );
  }
}