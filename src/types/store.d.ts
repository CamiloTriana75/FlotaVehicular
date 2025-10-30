/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Declaraciones de tipos para el store
 * Esto permite que TypeScript reconozca los módulos JavaScript
 */

declare module './store' {
  export const AppProvider: React.FC<{ children: React.ReactNode }>;
  export const useAppContext: () => any;
  export * from './store/types';
  export * from './store/actions/authActions';
  export * from './store/actions/vehicleActions';
  export * from './store/actions/driverActions';
}

declare module './store/types' {
  export const AUTH_ACTIONS: any;
  export const VEHICLE_ACTIONS: any;
  export const DRIVER_ACTIONS: any;
  export const ALERT_ACTIONS: any;
  export const UI_ACTIONS: any;
}
