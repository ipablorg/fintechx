import { createContext, useContext, useMemo, type Dispatch } from 'react'

import { assetUsd } from '@/data/derive'
import {
  ASSETS,
  CONTACTS,
  NOTIFS,
  SEED_TXNS,
  type ActiveLoan,
  type Asset,
  type AssetId,
  type Contact,
  type LoanOffer,
  type Notif,
  type Prefs,
  type Txn,
} from '@/data/mock'

/** Unidades con precisión de 6 decimales: los centavos no alcanzan para BTC. */
const round6 = (n: number) => Math.round(n * 1e6) / 1e6

type State = {
  assets: Asset[]
  txns: Txn[]
  contacts: Contact[]
  notifs: Notif[]
  loans: ActiveLoan[]
  prefs: Prefs
  /** Cuenta creada desde la bienvenida; null mientras se use el usuario de la demo. */
  account: { name: string; email: string } | null
}

type Action =
  | { type: 'send'; contactId: string; assetId: AssetId; amountUsd: number }
  | { type: 'receive'; assetId: AssetId; amountUsd: number; from?: string }
  | { type: 'deposit'; method: 'banco' | 'cripto'; amountUsd: number }
  | { type: 'withdraw'; dest: 'banco' | 'cripto'; amountUsd: number }
  | { type: 'convert'; from: AssetId; to: AssetId; amountUsd: number }
  | { type: 'credit'; offer: LoanOffer; amountUsd: number; collateralUsd: number }
  | { type: 'add-contact'; name: string; handle: string }
  | { type: 'notifs-read' }
  | { type: 'pref'; key: keyof Prefs; value: boolean }
  | { type: 'account'; name: string; email: string }

const STORAGE_KEY = 'fx-wallet-v1'

/** Contacto con el que arranca Enviar: la semilla nunca viene sin contactos. */
export const DEFAULT_CONTACT_ID = CONTACTS[0]!.id

function seed(): State {
  return {
    assets: ASSETS,
    txns: SEED_TXNS,
    contacts: CONTACTS,
    notifs: NOTIFS,
    loans: [],
    prefs: { hideBalances: false, biometrics: false, notifications: true },
    account: null,
  }
}

/** Ajusta el saldo de un activo por un delta en USD, recalculando su valor. */
function shiftAsset(assets: Asset[], id: AssetId, deltaUsd: number): Asset[] {
  return assets.map((a) => {
    if (a.id !== id) return a
    const balance = round6(a.balance + deltaUsd / a.priceUsd)
    return { ...a, balance }
  })
}

let seq = 0
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${seq++}`

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'send': {
      if (action.amountUsd <= 0) return state
      const contact = state.contacts.find((c) => c.id === action.contactId)
      const asset = state.assets.find((a) => a.id === action.assetId)
      if (!contact || !asset || assetUsd(asset) < action.amountUsd) return state

      const txn: Txn = {
        id: nextId('t'),
        date: new Date(),
        kind: 'gasto',
        amount: -action.amountUsd,
        description: `Enviaste a ${contact.name}`,
        category: 'envio',
        asset: action.assetId,
      }
      return { ...state, assets: shiftAsset(state.assets, action.assetId, -action.amountUsd), txns: [txn, ...state.txns] }
    }

    case 'receive': {
      if (action.amountUsd <= 0) return state
      const txn: Txn = {
        id: nextId('t'),
        date: new Date(),
        kind: 'ingreso',
        amount: action.amountUsd,
        description: action.from ? `${action.from} te envió` : 'Pago recibido',
        category: 'recibido',
        asset: action.assetId,
      }
      return { ...state, assets: shiftAsset(state.assets, action.assetId, action.amountUsd), txns: [txn, ...state.txns] }
    }

    case 'deposit': {
      if (action.amountUsd <= 0) return state
      const txn: Txn = {
        id: nextId('t'),
        date: new Date(),
        kind: 'ingreso',
        amount: action.amountUsd,
        description: action.method === 'banco' ? 'Depósito desde Banco Amazonas' : 'Depósito cripto recibido',
        category: 'deposito',
        asset: 'usdt',
      }
      return { ...state, assets: shiftAsset(state.assets, 'usdt', action.amountUsd), txns: [txn, ...state.txns] }
    }

    case 'withdraw': {
      if (action.amountUsd <= 0) return state
      const usdt = state.assets.find((a) => a.id === 'usdt')
      if (!usdt || assetUsd(usdt) < action.amountUsd) return state

      const txn: Txn = {
        id: nextId('t'),
        date: new Date(),
        kind: 'gasto',
        amount: -action.amountUsd,
        description: action.dest === 'banco' ? 'Retiro a cuenta ••4821' : 'Retiro a dirección Tron',
        category: 'retiro',
        asset: 'usdt',
      }
      return { ...state, assets: shiftAsset(state.assets, 'usdt', -action.amountUsd), txns: [txn, ...state.txns] }
    }

    case 'convert': {
      // Conversión 1:1 solo entre stablecoins.
      if (action.from === action.to || action.amountUsd <= 0) return state
      const from = state.assets.find((a) => a.id === action.from)
      const to = state.assets.find((a) => a.id === action.to)
      if (!from || !to || from.priceUsd !== 1 || to.priceUsd !== 1) return state
      if (assetUsd(from) < action.amountUsd) return state

      const now = new Date()
      const out: Txn = {
        id: nextId('t'),
        date: now,
        kind: 'gasto',
        amount: -action.amountUsd,
        description: `Convertiste a ${to.symbol}`,
        category: 'conversion',
        asset: action.from,
      }
      const into: Txn = {
        id: nextId('t'),
        date: now,
        kind: 'ingreso',
        amount: action.amountUsd,
        description: `Recibiste ${to.symbol} por conversión`,
        category: 'conversion',
        asset: action.to,
      }
      return {
        ...state,
        assets: shiftAsset(shiftAsset(state.assets, action.from, -action.amountUsd), action.to, action.amountUsd),
        txns: [out, into, ...state.txns],
      }
    }

    case 'credit': {
      if (action.amountUsd <= 0) return state
      const loan: ActiveLoan = {
        id: nextId('loan'),
        asset: action.offer.asset,
        collateral: action.offer.collateral,
        amountUsd: action.amountUsd,
        collateralUsd: action.collateralUsd,
        ltv: action.offer.ltv,
        apr: action.offer.apr,
        termMonths: action.offer.termMonths,
        monthlyUsd: action.offer.monthlyUsd,
        date: new Date(),
      }
      const txn: Txn = {
        id: nextId('t'),
        date: new Date(),
        kind: 'ingreso',
        amount: action.amountUsd,
        description: 'Crédito acreditado',
        category: 'credito',
        asset: action.offer.asset,
      }
      return { ...state, loans: [loan, ...state.loans], assets: shiftAsset(state.assets, action.offer.asset, action.amountUsd), txns: [txn, ...state.txns] }
    }

    case 'add-contact': {
      const name = action.name.trim()
      if (!name) return state
      const initials = name
        .split(/\s+/)
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase() ?? '')
        .join('')
      const palette = ['#e5484d', '#2775ca', '#f7931a', '#009393', '#8e8e99']
      const contact: Contact = {
        id: nextId('c'),
        name,
        initials: initials || name.slice(0, 2).toUpperCase(),
        color: palette[state.contacts.length % palette.length]!,
        avatar: '',
        handle: action.handle.trim(),
      }
      return { ...state, contacts: [contact, ...state.contacts] }
    }

    case 'notifs-read':
      return { ...state, notifs: state.notifs.map((n) => (n.read ? n : { ...n, read: true })) }

    case 'pref':
      return { ...state, prefs: { ...state.prefs, [action.key]: action.value } }

    case 'account':
      return { ...state, account: { name: action.name.trim(), email: action.email.trim() } }
  }
}

/** Hidratación desde sessionStorage: las fechas viajan como ISO y vuelven a Date. */
export function initialWalletState(): State {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as State
    if (!Array.isArray(parsed.txns) || !Array.isArray(parsed.assets)) return seed()
    return {
      ...parsed,
      txns: parsed.txns.map((t) => ({ ...t, date: new Date(t.date) })),
      notifs: (parsed.notifs ?? []).map((n) => ({ ...n, date: new Date(n.date) })),
      loans: (parsed.loans ?? []).map((l) => ({ ...l, date: new Date(l.date) })),
    }
  } catch {
    return seed()
  }
}

/** Guarda el estado de la sesión; si el storage falla, la demo vive en memoria. */
export function persist(state: State) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // Almacenamiento no disponible: la demo vive solo en memoria.
  }
}

/** Contexto del wallet: lo consume el provider y los hooks de abajo. */
export const WalletContext = createContext<{ state: State; dispatch: Dispatch<Action> } | null>(null)

/** Acceso al wallet: estado completo más el despachador. */
export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) throw new Error('useWallet fuera de WalletProvider')
  return ctx
}

/** Acciones de alto nivel: la UI nunca despacha acciones crudas. */
export function useWalletActions() {
  const { dispatch } = useWallet()
  return useMemo(
    () => ({
      send: (contactId: string, assetId: AssetId, amountUsd: number) =>
        dispatch({ type: 'send', contactId, assetId, amountUsd }),
      receive: (assetId: AssetId, amountUsd: number, from?: string) =>
        dispatch({ type: 'receive', assetId, amountUsd, from }),
      deposit: (method: 'banco' | 'cripto', amountUsd: number) => dispatch({ type: 'deposit', method, amountUsd }),
      withdraw: (dest: 'banco' | 'cripto', amountUsd: number) => dispatch({ type: 'withdraw', dest, amountUsd }),
      convert: (from: AssetId, to: AssetId, amountUsd: number) => dispatch({ type: 'convert', from, to, amountUsd }),
      requestCredit: (offer: LoanOffer, amountUsd: number, collateralUsd: number) =>
        dispatch({ type: 'credit', offer, amountUsd, collateralUsd }),
      addContact: (name: string, handle: string) => dispatch({ type: 'add-contact', name, handle }),
      markNotificationsRead: () => dispatch({ type: 'notifs-read' }),
      setPref: (key: keyof Prefs, value: boolean) => dispatch({ type: 'pref', key, value }),
      createAccount: (name: string, email: string) => dispatch({ type: 'account', name, email }),
    }),
    [dispatch],
  )
}
