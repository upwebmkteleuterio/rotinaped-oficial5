import { supabase } from '@/integrations/supabase/client';

const BUCKET = 'exams';

// Tempo de validade do link temporário (1 hora).
const SIGNED_URL_LIFETIME_SECONDS = 60 * 60;

// Trechos das URLs públicas geradas antes do bucket se tornar privado.
const PUBLIC_URL_MARKERS = [
  `/storage/v1/object/public/${BUCKET}/`,
  `/object/public/${BUCKET}/`,
];

/**
 * Descobre o caminho do arquivo dentro do bucket.
 * Aceita tanto o caminho puro ({childId}/{arquivo}) quanto as URLs públicas
 * antigas, gravadas antes de o bucket passar a ser privado.
 */
export function getExamFilePath(stored?: string | null): string | null {
  if (!stored) return null;

  for (const marker of PUBLIC_URL_MARKERS) {
    const index = stored.indexOf(marker);
    if (index >= 0) {
      return decodeURIComponent(stored.slice(index + marker.length));
    }
  }

  // Qualquer outra URL externa não pertence ao nosso bucket.
  if (/^https?:\/\//i.test(stored)) return null;

  return stored;
}

/** Gera um link temporário e autenticado para acessar o arquivo do exame. */
export async function getExamSignedUrl(stored?: string | null): Promise<string | null> {
  const path = getExamFilePath(stored);
  if (!path) return null;

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, SIGNED_URL_LIFETIME_SECONDS);

  if (error || !data?.signedUrl) {
    console.error('Falha ao gerar link temporário do exame:', error);
    return null;
  }

  return data.signedUrl;
}

/** Abre o arquivo do exame em uma nova aba, usando um link temporário. */
export async function openExamFile(stored?: string | null): Promise<void> {
  const url = await getExamSignedUrl(stored);

  if (!url) {
    alert('Não foi possível abrir o arquivo do exame. Verifique sua conexão e tente novamente.');
    return;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}
