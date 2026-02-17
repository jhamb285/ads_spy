'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'

function COSLogo() {
  return (
    <a
      href="http://178.156.213.149:3000"
      className="flex items-center"
    >
      <div className="w-10 h-10 rounded-full border-2 border-black flex items-center justify-center font-serif italic font-bold bg-white hover:bg-gray-50 transition-colors text-base">
        COS
      </div>
    </a>
  )
}

const navItems = [
  { name: 'Dashboard', href: '/dashboard' },
  { name: 'Brands', href: '/brands' },
  { name: 'Search', href: '/search' },
  { name: 'Settings', href: '/settings' },
  { name: 'Guide', href: '/docs' },
]

export function Navbar() {
  const pathname = usePathname()

  return (
    <nav className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <COSLogo />
            <span className="text-xl font-semibold text-black">AdSpy Tool</span>
          </div>

          <div className="flex items-center space-x-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  buttonVariants({ variant: 'ghost' }),
                  'text-sm font-medium',
                  pathname === item.href && 'bg-gray-100'
                )}
              >
                {item.name}
              </Link>
            ))}
            <a
              href="http://178.156.213.149:3000/control"
              className={cn(
                buttonVariants({ variant: 'ghost' }),
                'text-sm font-medium'
              )}
            >
              Control
            </a>
          </div>
        </div>
      </div>
    </nav>
  )
}
