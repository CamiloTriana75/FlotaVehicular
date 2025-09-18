import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Card from '../src/components/Card';
import Table from '../src/components/Table';

describe('Card Component', () => {
  it('renders children correctly', () => {
    render(
      <Card>
        <p>Test content</p>
      </Card>
    );
    
    expect(screen.getByText('Test content')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    const { container } = render(
      <Card className="test-class">
        <p>Test</p>
      </Card>
    );
    
    expect(container.firstChild).toHaveClass('test-class');
  });
});

describe('Table Component', () => {
  const mockColumns = [
    { header: 'Nombre', accessor: 'nombre' },
    { header: 'Email', accessor: 'email' }
  ];

  const mockData = [
    { nombre: 'Juan', email: 'juan@test.com' },
    { nombre: 'María', email: 'maria@test.com' }
  ];

  it('renders table with data correctly', () => {
    render(<Table columns={mockColumns} data={mockData} />);
    
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Juan')).toBeInTheDocument();
    expect(screen.getByText('maria@test.com')).toBeInTheDocument();
  });

  it('shows empty message when no data', () => {
    render(<Table columns={mockColumns} data={[]} emptyMessage="No hay datos" />);
    
    expect(screen.getByText('No hay datos')).toBeInTheDocument();
  });
});