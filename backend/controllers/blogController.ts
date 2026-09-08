import { Request, Response } from 'express';
import { dbQuery } from '../config/db';
import { BLOG_POSTS } from '../data/initialData';
import { BlogPost } from '../types';

export async function getBlogPosts(req: Request, res: Response) {
  try {
    const dbRows = await dbQuery('SELECT * FROM blog_posts ORDER BY created_at DESC');
    if (dbRows && dbRows.length > 0) {
      const posts: BlogPost[] = dbRows.map((r: any) => ({
        id: r.id,
        title: r.title,
        slug: r.slug,
        excerpt: r.excerpt,
        content: r.content,
        coverImage: r.cover_image,
        author: r.author_name || 'thebrandsstory. Editorial',
        category: r.category,
        readTime: r.read_time,
        date: r.published_at || 'Feb 2026',
        publishedAt: r.published_at || 'Feb 2026',
        tags: [r.category, 'Marketing', 'Trends'],
      }));
      return res.json({ success: true, posts });
    }
  } catch (err) {
    console.warn('MySQL getBlogPosts notice:', err);
  }

  res.json({ success: true, posts: BLOG_POSTS });
}

export async function getBlogPostBySlug(req: Request, res: Response) {
  const { slug } = req.params;
  const dbRows = await dbQuery('SELECT * FROM blog_posts WHERE slug = ? LIMIT 1', [slug]);

  if (dbRows && dbRows.length > 0) {
    const r = dbRows[0];
    const post: BlogPost = {
      id: r.id,
      title: r.title,
      slug: r.slug,
      excerpt: r.excerpt,
      content: r.content,
      coverImage: r.cover_image,
      author: r.author_name || 'thebrandsstory. Editorial',
      category: r.category,
      readTime: r.read_time,
      date: r.published_at || 'Feb 2026',
      publishedAt: r.published_at || 'Feb 2026',
      tags: [r.category, 'Marketing', 'Trends'],
    };
    return res.json({ success: true, post });
  }

  const post = BLOG_POSTS.find(p => p.slug === slug);
  if (!post) {
    return res.status(404).json({ success: false, error: 'Article not found' });
  }

  res.json({ success: true, post });
}
