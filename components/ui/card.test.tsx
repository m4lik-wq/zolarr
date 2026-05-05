import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from './card';

describe('Card', () => {
  it("children'i render eder", () => {
    render(<Card>İçerik</Card>);
    expect(screen.getByText('İçerik')).toBeInTheDocument();
  });

  it('default olarak glass class uygular', () => {
    const { container } = render(<Card>Test</Card>);
    expect(container.firstChild).toHaveClass('glass');
  });

  it('variant=elevated ile elevated arka plan kullanır', () => {
    const { container } = render(<Card variant="elevated">Test</Card>);
    expect(container.firstChild).not.toHaveClass('glass');
  });

  it('CardHeader, CardTitle, CardContent, CardFooter alt bileşenler render eder', () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Başlık</CardTitle>
          <CardDescription>Açıklama</CardDescription>
        </CardHeader>
        <CardContent>İçerik</CardContent>
        <CardFooter>Alt</CardFooter>
      </Card>
    );
    expect(screen.getByText('Başlık')).toBeInTheDocument();
    expect(screen.getByText('Açıklama')).toBeInTheDocument();
    expect(screen.getByText('İçerik')).toBeInTheDocument();
    expect(screen.getByText('Alt')).toBeInTheDocument();
  });
});
