'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Clipboard, Check } from 'lucide-react'
import { toast } from 'sonner'

interface CopyButtonProps {
  text: string
}

export function CopyButton({ text }: CopyButtonProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      toast.success('Copied to clipboard')
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast.error('Failed to copy')
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleCopy}
      className="h-8 w-8 p-0"
    >
      {copied ? (
        <Check className="h-4 w-4 text-green-600" />
      ) : (
        <Clipboard className="h-4 w-4" />
      )}
    </Button>
  )
}
