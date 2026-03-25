'use client';

// @TASK P2-S1-T2 - 랜딩 페이지 API 연동 hook
// @SPEC specs/screens/prelaunch/landing
// @TEST __tests__/hooks/useReservation.test.ts

import { useState } from 'react';

export interface ReservationData {
  id: string;
  email: string;
  queue_position: number;
  invite_code: string;
  industry: string;
  experience_years: string;
}

export interface CreateReservationInput {
  email: string;
  industry: string;
  experience_years: string;
  ref?: string;
}

export type ReservationStatus = 'idle' | 'loading' | 'success' | 'error';

export interface UseReservationReturn {
  status: ReservationStatus;
  reservation: ReservationData | null;
  error: string | null;
  createReservation: (data: CreateReservationInput) => Promise<void>;
}

export function useReservation(): UseReservationReturn {
  const [status, setStatus] = useState<ReservationStatus>('idle');
  const [reservation, setReservation] = useState<ReservationData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createReservation = async (data: CreateReservationInput): Promise<void> => {
    setStatus('loading');
    setError(null);

    try {
      const response = await fetch('/api/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        if (response.status === 409) {
          setError('이미 예약하신 이메일입니다');
        } else {
          setError('오류가 발생했습니다. 다시 시도해주세요');
        }
        setStatus('error');
        return;
      }

      const reservationData: ReservationData = await response.json();
      setReservation(reservationData);
      setStatus('success');
    } catch {
      setError('오류가 발생했습니다. 다시 시도해주세요');
      setStatus('error');
    }
  };

  return { status, reservation, error, createReservation };
}
