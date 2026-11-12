import React from 'react';

export function evaluatePasswordStrength(password: string): {
  score: 0 | 1 | 2 | 3 | 4;
  label: string;
  tone: 'idle' | 'danger' | 'warning' | 'good' | 'strong';
} {
  if (!password) {
    return { score: 0, label: '', tone: 'idle' };
  }
  if (password.length < 8) {
    return {
      score: 1,
      label: `Cần thêm ${8 - password.length} ký tự`,
      tone: 'danger'
    };
  }

  let points = 1;
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) points++;
  if (/\d/.test(password)) points++;
  if (/[^A-Za-z0-9]/.test(password) || password.length >= 12) points++;

  const clamped = Math.min(4, Math.max(2, points)) as 2 | 3 | 4;
  if (clamped === 2) return { score: 2, label: 'Độ mạnh: Khá', tone: 'warning' };
  if (clamped === 3) return { score: 3, label: 'Độ mạnh: Tốt', tone: 'good' };
  return { score: 4, label: 'Độ mạnh: Rất cao', tone: 'strong' };
}

export function PasswordStrengthMeter({ password }: { password: string }) {
  if (!password) return null;
  const { score, label, tone } = evaluatePasswordStrength(password);

  return (
    <div className={`os-pw-meter tone-${tone}`} aria-live="polite">
      <div className="os-pw-track" aria-hidden="true">
        {[1, 2, 3, 4].map(idx => (
          <span key={idx} className={`os-pw-segment ${score >= idx ? 'filled' : ''}`} />
        ))}
      </div>
      <span className="os-pw-label">{label}</span>
    </div>
  );
}
