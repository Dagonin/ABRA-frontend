import { apiFetch } from './client';

export interface EndpointDTO {
  url: string;
  description?: string;
  alive?: boolean;
}

export async function getVariantEndpoints(variantId: string): Promise<EndpointDTO[]> {
  return apiFetch<EndpointDTO[]>(`/api/variants/${variantId}/endpoints`);
}

export async function addVariantEndpoint(variantId: string, payload: { url: string; description?: string }): Promise<EndpointDTO> {
  return apiFetch<EndpointDTO>(`/api/variants/${variantId}/endpoints`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function deleteVariantEndpoint(variantId: string, url: string): Promise<void> {
  // Prefer query-parameter variant to avoid path encoding issues with URLs
  await apiFetch<void>(`/api/variants/${variantId}/endpoints?url=${encodeURIComponent(url)}`, {
    method: 'DELETE',
  });
}

export async function updateEndpointDescription(url: string, description: string): Promise<EndpointDTO> {
  // Use query-parameter endpoint to avoid path encoding issues with URLs
  return apiFetch<EndpointDTO>(`/api/endpoints?url=${encodeURIComponent(url)}`, {
    method: 'PATCH',
    body: JSON.stringify({ description })
  });
}
