'use client'

import { useState } from 'react'

interface ScreenshotCardProps {
  title: string
  description: string
  imageUrl?: string
  aspectRatio?: '16:9' | '4:3' | '1:1' | '9:16'
  caption?: string
}

export function ScreenshotCard({
  title,
  description,
  imageUrl,
  aspectRatio = '16:9',
  caption,
}: ScreenshotCardProps) {
  const [isLoaded, setIsLoaded] = useState(false)

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
    '1:1': 'aspect-square',
    '9:16': 'aspect-[9/16]',
  }

  // Placeholder gradient background
  const placeholderBg = `bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100`

  return (
    <div className="my-8 group">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Image Container */}
        <div
          className={`${aspectRatioClasses[aspectRatio]} relative overflow-hidden ${
            !imageUrl ? placeholderBg : ''
          }`}
        >
          {imageUrl ? (
            <>
              {!isLoaded && (
                <div
                  className={`absolute inset-0 ${placeholderBg} animate-pulse flex items-center justify-center`}
                >
                  <div className="text-slate-400 text-sm">Loading...</div>
                </div>
              )}
              <img
                src={imageUrl}
                alt={title}
                className={`w-full h-full object-cover transition-opacity duration-300 ${
                  isLoaded ? 'opacity-100' : 'opacity-0'
                }`}
                onLoad={() => setIsLoaded(true)}
              />
            </>
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-8 text-center">
              <div>
                <div className="text-6xl mb-4 opacity-50">📸</div>
                <p className="text-slate-600 font-medium text-lg">{title}</p>
                <p className="text-slate-500 text-sm mt-2">(Screenshot Placeholder)</p>
              </div>
            </div>
          )}

          {/* Overlay on Hover */}
          {imageUrl && (
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-300" />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-600 leading-relaxed">{description}</p>
          {caption && (
            <p className="text-sm text-slate-500 italic mt-3 border-l-2 border-blue-300 pl-3">
              {caption}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
