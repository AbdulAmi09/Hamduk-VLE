"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Play, Pause, Volume2, Maximize, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface VideoPlayerProps {
  videoUrl: string
  title: string
  duration: number
  onWatchProgress?: (watchedMinutes: number) => void
  isMandatory?: boolean
}

export function VideoPlayer({ videoUrl, title, duration, onWatchProgress, isMandatory }: VideoPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(100)
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && isPlaying) {
        const watched = Math.floor(videoRef.current.currentTime / 60)
        setCurrentTime(videoRef.current.currentTime)
        onWatchProgress?.(watched)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, onWatchProgress])

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause()
      } else {
        videoRef.current.play()
      }
      setIsPlaying(!isPlaying)
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number(e.target.value)
    setVolume(newVolume)
    if (videoRef.current) {
      videoRef.current.volume = newVolume / 100
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const watchPercentage = (currentTime / (duration * 60)) * 100

  return (
    <div className="space-y-4">
      <div className="bg-black rounded-lg overflow-hidden">
        {/* Video Container */}
        <div className="relative bg-gray-900 aspect-video flex items-center justify-center">
          <video
            ref={videoRef}
            className="w-full h-full"
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          >
            <source src={videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>

          {/* Play Button Overlay */}
          {!isPlaying && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/50 transition-colors"
            >
              <Play className="w-16 h-16 text-white fill-white" />
            </button>
          )}

          {/* Controls */}
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 space-y-2">
            {/* Progress Bar */}
            <div className="flex items-center gap-2">
              <div className="flex-1 h-1 bg-gray-600 rounded-full cursor-pointer group">
                <div
                  className="h-full bg-blue-600 rounded-full group-hover:bg-blue-500 transition-colors"
                  style={{ width: `${watchPercentage}%` }}
                />
              </div>
              <span className="text-white text-xs">
                {formatTime(currentTime)} / {formatTime(duration * 60)}
              </span>
            </div>

            {/* Control Buttons */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={togglePlay} className="text-white hover:bg-white/20">
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>

                <div className="flex items-center gap-2">
                  <Volume2 className="w-4 h-4 text-white" />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-20 h-1 bg-gray-600 rounded-full cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Download className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="ghost" className="text-white hover:bg-white/20">
                  <Maximize className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Video Info */}
      <div className="space-y-2">
        <h2 className="text-xl font-bold text-gray-900">{title}</h2>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Duration: {duration} minutes</span>
          {isMandatory && (
            <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded font-medium">Mandatory</span>
          )}
        </div>
      </div>
    </div>
  )
}
