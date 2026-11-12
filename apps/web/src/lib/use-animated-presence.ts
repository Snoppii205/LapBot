import { useEffect, useState } from 'react';

function isReducedMotionPreferred(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false;
  }
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export interface AnimatedPresenceState {
  rendered: boolean;
  closing: boolean;
  stateClass: 'is-open' | 'is-closing';
}

/**
 * Zero-dependency mount/exit lifecycle hook for Neo-Retro OS drawers, modals & backdrops.
 * - Mounts synchronously on the exact render `open` becomes `true` (zero 1-frame delay).
 * - Applies `is-closing` immediately when `open` flips to `false`, then unmounts after `exitDurationMs`.
 * - Short-circuits to instant unmount (`0ms`) when `prefers-reduced-motion: reduce` is active.
 */
export function useAnimatedPresence(open: boolean, exitDurationMs = 170): AnimatedPresenceState {
  const [linger, setLinger] = useState(open);

  useEffect(() => {
    if (open) {
      setLinger(true);
      return;
    }
    if (!linger) return;

    const effectiveMs = isReducedMotionPreferred() ? 0 : Math.max(0, exitDurationMs);
    if (effectiveMs === 0) {
      setLinger(false);
      return;
    }

    const timer = window.setTimeout(() => {
      setLinger(false);
    }, effectiveMs);
    return () => window.clearTimeout(timer);
  }, [open, linger, exitDurationMs]);

  const rendered = open || linger;
  const closing = !open && linger;

  return {
    rendered,
    closing,
    stateClass: closing ? 'is-closing' : 'is-open'
  };
}

export interface PresenceValueState<T> {
  activeValue: T | null;
  closing: boolean;
  stateClass: 'is-open' | 'is-closing';
}

/**
 * Retains the last non-null `value` during the exit animation window (`exitDurationMs`)
 * so toasts, confirmation dialogs, and detail drawers never flash empty content while closing.
 */
export function usePresenceValue<T>(
  value: T | null | undefined,
  exitDurationMs = 170
): PresenceValueState<T> {
  const [retained, setRetained] = useState<T | null>(value ?? null);
  const hasLiveValue = value !== null && value !== undefined;

  useEffect(() => {
    if (value !== null && value !== undefined) {
      setRetained(value);
      return;
    }
    if (retained === null) return;

    const effectiveMs = isReducedMotionPreferred() ? 0 : Math.max(0, exitDurationMs);
    if (effectiveMs === 0) {
      setRetained(null);
      return;
    }

    const timer = window.setTimeout(() => {
      setRetained(null);
    }, effectiveMs);
    return () => window.clearTimeout(timer);
  }, [value, retained, exitDurationMs]);

  const activeValue = hasLiveValue ? (value as T) : retained;
  const closing = !hasLiveValue && retained !== null;

  return {
    activeValue,
    closing,
    stateClass: closing ? 'is-closing' : 'is-open'
  };
}
