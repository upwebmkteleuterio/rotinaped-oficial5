import { supabase } from '@/integrations/supabase/client';

export interface Category {
  id: string;
  name: string;
  icon?: string;
  color?: string;
  created_at: string;
}

export interface Article {
  id: string;
  title: string;
  summary?: string;
  content: string;
  image_url?: string;
  category_id?: string;
  is_featured?: boolean;
  created_at: string;
  category?: Category;
}

export const libraryService = {
  // Categories
  async getCategories() {
    const { data, error } = await supabase
      .from('library_categories')
      .select('*')
      .order('name');
    if (error) throw error;
    return data as Category[];
  },

  async createCategory(category: Partial<Category>) {
    const { data, error } = await supabase
      .from('library_categories')
      .insert(category)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async updateCategory(id: string, category: Partial<Category>) {
    const { data, error } = await supabase
      .from('library_categories')
      .update(category)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Category;
  },

  async deleteCategory(id: string) {
    const { error } = await supabase
      .from('library_categories')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  // Articles
  async getArticles() {
    const { data, error } = await supabase
      .from('library_articles')
      .select('*, category:library_categories(*)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data as Article[];
  },

  async getArticleById(id: string) {
    const { data, error } = await supabase
      .from('library_articles')
      .select('*, category:library_categories(*)')
      .eq('id', id)
      .single();
    if (error) throw error;
    return data as Article;
  },

  async createArticle(article: Partial<Article>) {
    const { data, error } = await supabase
      .from('library_articles')
      .insert(article)
      .select()
      .single();
    if (error) throw error;
    return data as Article;
  },

  async updateArticle(id: string, article: Partial<Article>) {
    const { data, error } = await supabase
      .from('library_articles')
      .update(article)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data as Article;
  },

  async deleteArticle(id: string) {
    const { error } = await supabase
      .from('library_articles')
      .delete()
      .eq('id', id);
    if (error) throw error;
  },

  async duplicateArticle(article: Article) {
    const newArticle = {
      title: `Cópia: ${article.title}`,
      summary: article.summary,
      content: article.content,
      image_url: article.image_url,
      category_id: article.category_id,
      is_featured: article.is_featured,
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('library_articles')
      .insert(newArticle)
      .select()
      .single();
    if (error) throw error;
    return data as Article;
  },

  async uploadImage(file: File) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
    const filePath = `articles/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from('library')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data } = supabase.storage
      .from('library')
      .getPublicUrl(filePath);

    return data.publicUrl;
  }
};
