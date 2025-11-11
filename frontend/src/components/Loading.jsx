import { motion } from 'framer-motion';

export default function Loading({ text = 'Carregando...', fullscreen = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${
        fullscreen ? 'fixed inset-0 bg-white/70 z-50 backdrop-blur-sm' : 'py-6'
      }`}
    >
      {/* Spinner animado */}
      <motion.div
        className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      <p className="mt-4 text-gray-700 font-medium">{text}</p>
    </div>
  );
}
