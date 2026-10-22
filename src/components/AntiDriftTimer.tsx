
import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'

type AntiDriftTimerProps = {
  durationMs: number
  onExpire?: () => void
}

type TimeParts = {
  hours: number
  minutes: number
  seconds: number
  milliseconds: number
}

function splitTime(milliseconds: number): TimeParts {
  const total = Math.max(0, Math.ceil(milliseconds))

  return {
    hours: Math.floor(total / 3600000),
    minutes: Math.floor((total % 3600000) / 60000),
    seconds: Math.floor((total % 60000) / 1000),
    milliseconds: total % 1000,
  }
}

function formatNumber(value: number) {
  return String(value).padStart(2, '0')
}

export default function AntiDriftTimer({
  durationMs,
  onExpire,
}: AntiDriftTimerProps) {
  const [generation, setGeneration] = useState(0)
  const [remaining, setRemaining] = useState(durationMs)

  useEffect(() => {
    const targetTime = Date.now() + durationMs
    let frameId = 0
    let expired = false

    function tick() {
      const timeLeft = Math.max(0, targetTime - Date.now())

      setRemaining(previous =>
        Math.ceil(previous / 50) === Math.ceil(timeLeft / 50)
          ? previous
          : timeLeft
      )

      if (timeLeft <= 0) {
        if (!expired) {
          expired = true
          onExpire?.()
        }
        return
      }

      frameId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      expired = true
      cancelAnimationFrame(frameId)
    }
  }, [durationMs, generation, onExpire])

  const time = splitTime(remaining)
  const progress =
    durationMs > 0
      ? Math.max(0, Math.min(100, (remaining / durationMs) * 100))
      : 0

  return (
    <div className="timer-widget">
      <div
        className="countdown"
        role="timer"
        aria-label="Flash sale time remaining"
        aria-live="off"
      >
        <div className="time-box">
          <strong>{formatNumber(time.hours)}</strong>
          <span>HOURS</span>
        </div>

        <span className="separator" aria-hidden="true">:</span>

        <div className="time-box">
          <strong>{formatNumber(time.minutes)}</strong>
          <span>MINUTES</span>
        </div>

        <span className="separator" aria-hidden="true">:</span>

        <div className="time-box">
          <strong>{formatNumber(time.seconds)}</strong>
          <span>SECONDS</span>
        </div>
      </div>

      <div
        className="timer-progress"
        role="progressbar"
        aria-label="Time remaining percentage"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="timer-progress-fill"
          style={{ width: `${progress}%` } as CSSProperties}
        />
      </div>

      <p className="timer-precision">
        Precision: {String(time.milliseconds).padStart(3, '0')} ms
      </p>

      <button
        type="button"
        className="timer-restart"
        onClick={() => {
          setRemaining(durationMs)
          setGeneration(previous => previous + 1)
        }}
      >
        ↻ Restart Demo
      </button>

      {remaining === 0 && (
        <p className="timer-expired" role="status">
          Flash Sale has ended!
        </p>
      )}
    </div>
  )
}
