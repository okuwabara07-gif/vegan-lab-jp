import Link from 'next/link';
import { getAllPosts } from '@/lib/posts';

export default function BlogPage() {
  const posts = getAllPosts();
  return (
    <div style={{maxWidth:'900px',margin:'0 auto',padding:'2rem'}}>
      <h1 style={{fontSize:'1.5rem',fontWeight:700,marginBottom:'1.5rem'}}>記事一覧</h1>
      {posts.length === 0 ? (
        <p style={{color:'#888'}}>まだ記事がありません。</p>
      ) : (
        <div style={{display:'grid',gap:'1rem'}}>
          {posts.map((post: any) => (
            <Link key={post.slug} href={`/blog/${post.slug}`}
              style={{display:'block',padding:'1.25rem',background:'white',borderRadius:'12px',border:'1px solid #e8d4ff',textDecoration:'none'}}>
              {post.thumbnail && (
                <img src={post.thumbnail} alt={post.title}
                  style={{width:'100%',height:'200px',objectFit:'cover',borderRadius:'8px',marginBottom:'12px'}} />
              )}
              <p style={{fontSize:'0.7rem',color:'#9333ea',marginBottom:'4px'}}>{post.genre}</p>
              <h2 style={{fontSize:'1rem',fontWeight:700,color:'#333',marginBottom:'6px'}}>{post.title}</h2>
              <p style={{fontSize:'0.8rem',color:'#666',marginBottom:'6px'}}>{post.excerpt}</p>
              <p style={{fontSize:'0.7rem',color:'#aaa'}}>{post.date}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
