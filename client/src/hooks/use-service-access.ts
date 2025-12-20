import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export interface ServiceAccess {
  websites: boolean;
  stargate: boolean;
  pandora: boolean;
  regis: boolean;
  nero: boolean;
  quantum: boolean;
  'titan-ticket': boolean;
  'titan-support': boolean;
  'ai-factory': boolean;
}

export interface ServiceStatus {
  owned: boolean;
  active: boolean;
}

/**
 * Hook to check service access and status
 * TODO: Replace with actual API call to backend to get subscription/payment status
 */
export function useServiceAccess() {
  const { user } = useAuth();
  const [serviceStates, setServiceStates] = useState<Record<string, ServiceStatus>>({
    websites: { owned: true, active: true },
    stargate: { owned: false, active: false }, // Coming Soon
    pandora: { owned: true, active: false }, // Example: owned but payment issue
    regis: { owned: false, active: false },
    nero: { owned: false, active: false },
    quantum: { owned: false, active: false },
    'titan-ticket': { owned: false, active: false },
    'titan-support': { owned: false, active: false },
    'ai-factory': { owned: false, active: false },
  });

  // TODO: Fetch actual service status from backend
  useEffect(() => {
    // This would be an API call:
    // fetch('/api/user/services').then(res => res.json()).then(data => setServiceStates(data));
  }, [user]);

  const isServiceActive = (serviceId: string): boolean => {
    const state = serviceStates[serviceId];
    return state?.owned === true && state?.active === true;
  };

  const getServiceStatus = (serviceId: string): 'active' | 'payment-needed' | 'inactive' => {
    const state = serviceStates[serviceId];
    if (!state) return 'inactive';
    
    if (state.owned && state.active) return 'active';
    if (state.owned && !state.active) return 'payment-needed';
    return 'inactive';
  };

  return {
    serviceStates,
    isServiceActive,
    getServiceStatus,
  };
}

