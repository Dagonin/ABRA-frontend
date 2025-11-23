import { apiFetch } from './client';

export interface VariantDTO {
  variant_id: string;
  name?: string;
  weight?: number;
}

export async function getVariants(): Promise<VariantDTO[]> {
  return apiFetch<VariantDTO[]>('/api/variants');
}

export async function createVariant(payload: { name?: string; weight?: number }): Promise<VariantDTO> {
  return apiFetch<VariantDTO>('/api/variants', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteVariant(id: string): Promise<void> {
  await apiFetch<void>(`/api/variants/${id}`, { method: 'DELETE' });
}

export async function updateVariant(id: string, payload: { name?: string; weight?: number }): Promise<VariantDTO> {
  return apiFetch<VariantDTO>(`/api/variants/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ variant_id: id, ...payload }),
  });
}

export async function updateVariantWeight(id: string, weight: number): Promise<VariantDTO> {
  return apiFetch<VariantDTO>(`/api/variants/${id}/weight`, {
    method: 'PUT',
    body: JSON.stringify({ weight }),
  });
}

export async function updateVariantEnabled(id: string, enabled: boolean): Promise<any> {
  return apiFetch(`/api/variants/${id}/enabled`, {
    method: 'PUT',
    body: JSON.stringify({ enabled }),
  });
}

export async function drainVariant(id: string): Promise<any> {
  return apiFetch(`/api/variants/${id}/drain`, { method: 'POST' });
}
