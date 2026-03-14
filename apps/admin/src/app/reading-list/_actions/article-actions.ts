'use server';

import { db } from '@repo/database';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';

type ActionState = {
  error?: string;
  success?: boolean;
};

export async function deleteArticle(id: number): Promise<ActionState> {
  try {
    await db.delete(db._schema.articles).where(eq(db._schema.articles.id, id));
  } catch {
    return { error: '削除に失敗しました' };
  }

  revalidatePath('/reading-list');
  revalidatePath('/');
  return { success: true };
}
