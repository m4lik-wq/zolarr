import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import HomePage from '@/app/page';

vi.mock('next/image', () => ({
  default: (props: { src: string; alt: string }) => <img src={props.src} alt={props.alt} />,
}));
vi.mock('embla-carousel-react', () => ({
  default: () => [vi.fn(), { scrollPrev: vi.fn(), scrollNext: vi.fn() }],
}));

describe('HomePage', () => {
  it('renders all 12 main section landmarks', () => {
    render(<HomePage />);
    expect(screen.getByRole('heading', { level: 1, name: /Güneşten geleceğe/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Hangi yoldan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Neden Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /4 adımda/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Stoktaki ürünler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Bize söyleyin/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Son projeler/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sayılarla Zolarr/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Müşterilerimiz ne diyor/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Sık sorulan/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Faturanızdan kurtulmak/i })).toBeInTheDocument();
  });
});
