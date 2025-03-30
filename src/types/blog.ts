export interface BlogPost {
  id: string;
  title: string;
  content: string;
  excerpt?: string;
  image?: string;
  slug: string;
  likes: number;
  comments: any[];
  views?: number;
  created_at: string;
  tags?: string[];
  is_liked?: boolean;
  category?: string;
  readTime?: string;
} 