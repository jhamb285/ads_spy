'use client'

import { useState } from 'react'

interface VideoEmbedProps {
  title: string
  description?: string
  thumbnail?: string
  videoUrl?: string
  duration?: string
  aspectRatio?: '16:9' | '4:3'
}

export function VideoEmbed({
  title,
  description,
  thumbnail,
  videoUrl,
  duration,
  aspectRatio = '16:9',
}: VideoEmbedProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  const aspectRatioClasses = {
    '16:9': 'aspect-video',
    '4:3': 'aspect-[4/3]',
  }

  return (
    <div className="my-8">
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden hover:shadow-xl transition-all duration-300">
        {/* Video Container */}
        <div className={`${aspectRatioClasses[aspectRatio]} relative overflow-hidden bg-slate-900`}>
          {!isPlaying ? (
            <>
              {/* Thumbnail */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600">
                {thumbnail ? (
                  <img
                    src={thumbnail}
                    alt={title}
                    className="w-full h-full object-cover opacity-60"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center text-white">
                      <div className="text-6xl mb-4">🎬</div>
                      <p className="text-xl font-medium">{title}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Play Button */}
              <button
                onClick={() => videoUrl && setIsPlaying(true)}
                className="absolute inset-0 flex items-center justify-center group/play cursor-pointer"
                disabled={!videoUrl}
              >
                <div className="bg-white bg-opacity-90 rounded-full p-6 group-hover/play:bg-opacity-100 group-hover/play:scale-110 transition-all duration-300 shadow-2xl">
                  <svg
                    className="h-12 w-12 text-blue-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                  </svg>
                </div>
              </button>

              {/* Duration Badge */}
              {duration && (
                <div className="absolute bottom-4 right-4 bg-black bg-opacity-75 text-white px-3 py-1 rounded text-sm font-medium">
                  {duration}
                </div>
              )}

              {/* Placeholder Badge */}
              {!videoUrl && (
                <div className="absolute top-4 left-4 bg-yellow-500 text-yellow-900 px-3 py-1 rounded-full text-xs font-semibold">
                  Video Placeholder
                </div>
              )}
            </>
          ) : (
            <iframe
              src={videoUrl}
              title={title}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          {description && <p className="text-slate-600 leading-relaxed">{description}</p>}
        </div>
      </div>
    </div>
  )
}
