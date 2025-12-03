/**
 * Declaraciones de tipos para el store
 * Esto permite que TypeScript reconozca los módulos JavaScript
 */

declare module './store' {
  export const AppProvider: unknown;
  export const useAppContext: () => { state: unknown; dispatch: unknown };
  export * from './store/types';
  export * from './store/actions/authActions';
  export * from './store/actions/vehicleActions';
  export * from './store/actions/driverActions';
}

declare module './store/types' {
  export const AUTH_ACTIONS: Record<string, string>;
  export const VEHICLE_ACTIONS: Record<string, string>;
  export const DRIVER_ACTIONS: Record<string, string>;
  export const ALERT_ACTIONS: Record<string, string>;
  export const UI_ACTIONS: Record<string, string>;
}
