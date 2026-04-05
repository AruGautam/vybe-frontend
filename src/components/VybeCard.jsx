'use client';
import { motion } from 'framer-motion';

// Stagger container — wrap a list of VybeCards with this
export function VybeCardGrid({ children, className = '' }) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.07 } },
      }}
    >
      {children}
    </motion.div>
  );
}

// The card itself
export default function VybeCard({
  children,
  className = '',
  onClick,
  glow = false,       // neon indigo glow variant
  glowLime = false,   // neon lime glow variant
  span,               // e.g. "col-span-2" or "row-span-2"
  noPad = false,      // skip default padding for custom layouts
  animate = true,     // set false to skip entry animation
}) {
  const base =
    'bg-[#0f1117]/70 backdrop-blur-3xl border border-white/[0.06] rounded-[32px] shadow-2xl overflow-hidden transition-all duration-300';
  const glowClass = glowLime
    ? 'hover:border-[#bcff00]/40 hover:shadow-[0_0_40px_rgba(188,255,0,0.12)]'
    : glow
    ? 'hover:border-indigo-500/50 hover:shadow-[0_0_40px_rgba(99,102,241,0.15)]'
    : 'hover:border-white/[0.12] hover:shadow-[0_8px_40px_rgba(0,0,0,0.4)]';
  const padClass = noPad ? '' : 'p-6';

  const variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] } },
  };

  return (
    <motion.div
      className={`${base} ${glowClass} ${padClass} ${span || ''} ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      variants={animate ? variants : {}}
      whileHover={{ y: -3 }}
    >
      {children}
    </motion.div>
  );
}

// Convenience: a neon "pill" tag used for labels
export function NeonTag({ children, color = 'indigo' }) {
  const colors = {
    indigo: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
    cyan:   'bg-cyan-500/10   text-cyan-400   border-cyan-500/20',
    lime:   'bg-[#bcff00]/10  text-[#bcff00]  border-[#bcff00]/20',
    orange: 'bg-orange-500/10 text-orange-400 border-orange-500/20',
    purple: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
  };
  return (
    <span className={`font-mono text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-full border ${colors[color] || colors.indigo}`}>
      {children}
    </span>
  );
}

// Live dot indicator
export function LiveDot({ color = 'lime' }) {
  const colors = {
    lime:  'bg-[#bcff00]',
    cyan:  'bg-cyan-400',
    red:   'bg-red-400',
    green: 'bg-green-400',
  };
  return (
    <span className="relative flex h-2 w-2">
      <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[color]}`} />
      <span className={`relative inline-flex rounded-full h-2 w-2 ${colors[color]}`} />
    </span>
  );
}

// Tactile motion button — pill-shaped
export function MotionButton({ children, onClick, className = '', disabled = false, type = 'button' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`rounded-full ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}

// Neon Lime CTA button — the primary action button
export function NeonButton({ children, onClick, className = '', disabled = false, type = 'button' }) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`btn-pill-lime px-5 py-2.5 text-sm font-black tracking-tight ${className}`}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {children}
    </motion.button>
  );
}
