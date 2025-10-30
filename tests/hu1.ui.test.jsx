import React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import VehicleForm from '../src/components/VehicleForm';
import VehiclesList from '../src/pages/VehiclesList';
import { AppProvider } from '../src/store/context/AppContext';

// Helper para envolver con AppProvider
const renderWithProviders = (ui) => {
  return render(<AppProvider>{ui}</AppProvider>);
};

describe('HU1 - UI básica', () => {
  it('VehicleForm renderiza campos clave (placa, modelo, capacidad, características)', () => {
    renderWithProviders(<VehicleForm onSave={vi.fn()} onCancel={vi.fn()} />);

    // Campos clave
    expect(screen.getByLabelText(/Placa/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Modelo/i)).toBeInTheDocument();
    // Capacidad puede ser opcional pero debe existir en UI
    expect(screen.getByLabelText(/Capacidad/i)).toBeInTheDocument();
    // Características: Tipo de Vehículo y Tipo de Combustible
    expect(screen.getByLabelText(/Tipo de Vehículo/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Tipo de Combustible/i)).toBeInTheDocument();
  });

  it('VehicleForm: submit válido dispara onSave (mock)', async () => {
    const onSave = vi.fn();
    renderWithProviders(<VehicleForm onSave={onSave} onCancel={vi.fn()} />);

    // Llenar mínimos requeridos según validación actual
    fireEvent.change(screen.getByLabelText(/Placa/i), {
      target: { value: 'ZZZ-999' },
    });
    fireEvent.change(screen.getByLabelText(/Marca/i), {
      target: { value: 'Toyota' },
    });
    fireEvent.change(screen.getByLabelText(/Modelo/i), {
      target: { value: 'Corolla' },
    });
    // Kilometraje tiene default 0, tipo/combustible/estado tienen defaults

    // Enviar formulario
    fireEvent.click(screen.getByRole('button', { name: /Guardar Vehículo/i }));

    expect(onSave).toHaveBeenCalledTimes(1);
    expect(onSave.mock.calls[0][0]).toMatchObject({ placa: 'ZZZ-999' });
  });

  it('VehiclesList: muestra botón "Nuevo Vehículo" y lista mock', () => {
    render(
      <MemoryRouter>
        <VehiclesList />
      </MemoryRouter>
    );

    expect(
      screen.getByRole('button', { name: /Nuevo Vehículo/i })
    ).toBeInTheDocument();

    // Verifica que un vehículo mock esté en la tabla
    expect(screen.getByText('ABC-123')).toBeInTheDocument();
  });
});
