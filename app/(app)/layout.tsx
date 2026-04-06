'use client'

import AppLayout from '@/components/AppLayout'
import { motion } from 'framer-motion'
import { usePathname } from 'next/navigation'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
      <AppLayout>
        <style>{`
        /* Hide scrollbars for a cleaner 'App' feel */
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        /* Responsive Padding Adjustments */
        .main-content-container {
          min-height: 100vh;
          padding-bottom: 90px; /* Space for Mobile Player/Nav */
          transition: padding 0.3s ease;
        }

        @media (min-width: 1024px) {
          .main-content-container {
            padding-bottom: 0;
            padding-left: 0; /* Sidebar space is usually handled inside AppLayout */
          }
        }
      `}</style>

        <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="main-content-container hide-scrollbar"
            style={{
              width: '100%',
              position: 'relative',
              overflowX: 'hidden'
            }}
        >
          {children}
        </motion.main>
      </AppLayout>
  )
}