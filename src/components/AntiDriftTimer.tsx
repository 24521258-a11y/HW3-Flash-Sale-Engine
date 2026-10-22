
import { useEffect, useState } from 'react'

type TimerProps = {
  durationMs: number
  onExpire: () => void
  onRestart: () => void
}

function formatTime(value: number) {
  return String(value).padStart(2, '0')
}

export default function AntiDriftTimer({
  durationMs,
  onExpire,
  onRestart,
}: TimerProps) {
  const [deadline] = useState(() => Date.now() + durationMs)
  const [remaining, setRemaining] = useState(durationMs)

  useEffect(() => {
    let frameId = 0
    let stopped = false

    function tick() {
      if (stopped) return

      const left = Math.max(0, deadline - Date.now())
      setRemaining(left)

      if (left === 0) {
        stopped = true
        onExpire()
        return
      }

      frameId = requestAnimationFrame(tick)
    }

    tick()

    return () => {
      stopped = true
      cancelAnimationFrame(frameId)
    }
  }, [deadline, onExpire])

  const totalSeconds = Math.ceil(remaining / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  const progress =
    durationMs > 0
      ? Math.max(0, Math.min(100, remaining / durationMs * 100))
      : 0

  return (
    <section className="timer-widget" aria-label="Countdown timer">
      <div
        className="countdown"
        role="timer"
        aria-label="Flash Sale countdown"
        aria-live="off"
      >
        <div className="time-box">
          <strong>{formatTime(hours)}</strong>
          <span>HOURS</span>
        </div>

        <span className="separator" aria-hidden="true">:</span>

        <div className="time-box">
          <strong>{formatTime(minutes)}</strong>
          <span>MINUTES</span>
        </div>

        <span className="separator" aria-hidden="true">:</span>

        <div className="time-box">
          <strong>{formatTime(seconds)}</strong>
          <span>SECONDS</span>
        </div>
      </div>

      <div
        className="timer-progress"
        role="progressbar"
        aria-label="Sale time remaining"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(progress)}
      >
        <div
          className="timer-progress-fill"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="timer-precision">
        Precision: {String(Math.ceil(remaining) % 1000).padStart(3, '0')} ms
      </p>

      <button
        className="timer-restart"
        type="button"
        onClick={onRestart}
      >
        ↻ Restart Demo
      </button>

      {remaining === 0 && (
        <p className="timer-expired" role="status">
          Flash Sale has ended!
        </p>
      )}
    </section>
  )
}
