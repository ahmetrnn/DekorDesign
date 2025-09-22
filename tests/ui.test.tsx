import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { ProductIngest } from '../src/app/(dekor)/dekor/components/ProductIngest';

const mockProduct = {
  id: 'product_1',
  source: 'url' as const,
  title: 'Test Chair',
  createdAt: new Date().toISOString(),
  images: []
};

describe('ProductIngest component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls ingest API and notifies parent', async () => {
    const onProductIngested = vi.fn();
    vi.spyOn(globalThis, 'fetch').mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true, data: mockProduct })
    } as Response);

    render(<ProductIngest onProductIngested={onProductIngested} />);

    const input = screen.getByPlaceholderText('https://vendor.com/product') as HTMLInputElement;
    fireEvent.change(input, { target: { value: 'https://example.com/product' } });

    const button = screen.getByRole('button', { name: /ingest product/i });
    fireEvent.click(button);

    await waitFor(() => expect(onProductIngested).toHaveBeenCalledWith(mockProduct));
    expect(fetch).toHaveBeenCalledWith('/api/ingest', expect.any(Object));
  });
});
