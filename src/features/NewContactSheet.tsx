import { AnimatePresence } from 'motion/react'
import { useState } from 'react'

import { BottomSheet } from '@/components/BottomSheet'
import { SuccessCheck } from '@/components/SuccessCheck'
import { useWalletActions } from '@/store/use-wallet'

/**
 * Contacto nuevo: nombre y alias o dirección, validación mínima y alta en el
 * store. Aparece en la fila de acciones rápidas y en el selector de Enviar.
 */
export function NewContactSheet({ onClose }: { onClose: () => void }) {
  const { addContact } = useWalletActions()
  const [name, setName] = useState('')
  const [handle, setHandle] = useState('')
  const [touched, setTouched] = useState(false)
  const [done, setDone] = useState(false)

  const invalid = name.trim().length < 2

  const submit = () => {
    setTouched(true)
    if (invalid) return
    addContact(name, handle || name.toLowerCase().replace(/\s+/g, '.'))
    setDone(true)
  }

  const finish = () => {
    setDone(false)
    onClose()
  }

  return (
    <>
      <BottomSheet label="Nuevo contacto" onClose={onClose}>
        <h2 className="title-section">Nuevo contacto</h2>
        <p className="mt-1 text-sm text-ink-2">Guárdalo para enviarle en un toque</p>

        <div className="mt-4 grid gap-3">
          <label className="glass block rounded-2xl px-4 py-3">
            <span className="block text-xs text-ink-3">Nombre</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => setTouched(true)}
              placeholder="Nombre y apellido"
              aria-label="Nombre del contacto"
              data-testid="input-contacto-nombre"
              className="mt-0.5 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
          </label>

          <label className="glass block rounded-2xl px-4 py-3">
            <span className="block text-xs text-ink-3">Alias o dirección</span>
            <input
              type="text"
              value={handle}
              onChange={(e) => setHandle(e.target.value)}
              placeholder="@alias o dirección Tron"
              aria-label="Alias o dirección del contacto"
              data-testid="input-contacto-alias"
              className="mt-0.5 w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-3"
            />
          </label>
        </div>

        {touched && invalid && (
          <p className="mt-2 text-sm font-medium text-red-bright" aria-live="polite">
            Escribe el nombre del contacto
          </p>
        )}

        <button
          type="button"
          onClick={submit}
          disabled={touched && invalid}
          data-testid="guardar-contacto"
          className="btn btn-primary mt-4 w-full text-sm"
        >
          Guardar contacto
        </button>
      </BottomSheet>

      <AnimatePresence>
        {done && <SuccessCheck title="Contacto guardado" sub={`${name.trim()} ya está en tu lista`} onDone={finish} />}
      </AnimatePresence>
    </>
  )
}
