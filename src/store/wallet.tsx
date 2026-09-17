import { useEffect, useReducer, type ReactNode } from 'react'

import { WalletContext, initialWalletState, persist, reducer } from '@/store/use-wallet'

/**
 * Provider del wallet: monta el reducer con el estado semilla (o el hidratado
 * de la sesión) y persiste en cada cambio. La lógica vive en use-wallet.ts.
 */
export function WalletProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, undefined, initialWalletState)

  useEffect(() => persist(state), [state])

  return <WalletContext.Provider value={{ state, dispatch }}>{children}</WalletContext.Provider>
}
