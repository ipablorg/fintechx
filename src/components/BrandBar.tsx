import { motion } from 'motion/react'

import baLogo from '@/assets/ba-logo-white.png'
import { item } from '@/lib/motion'

/**
 * Fila de marca de cada tab: el logo blanco de Banco Amazonas arriba, alineado
 * a la izquierda, por encima del header funcional. Los variants se heredan del
 * contenedor de la vista, así que comparte stagger y muelle con el resto. El
 * safe-area superior ya lo aporta la columna de App; aquí no se duplica.
 */
export function BrandBar() {
  return (
    <motion.div variants={item} className="mb-4">
      <img src={baLogo} alt="Banco Amazonas" className="h-7 w-auto" />
    </motion.div>
  )
}
