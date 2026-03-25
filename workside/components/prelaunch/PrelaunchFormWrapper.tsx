'use client';

// @TASK P2-S1-T2 - ReservationForm 페이지 래퍼 (useReservation hook 연결)
// @SPEC specs/screens/prelaunch/landing

import { useRouter } from 'next/navigation';
import { ReservationForm, ReservationFormData } from './ReservationForm';
import { useReservation } from '@/hooks/useReservation';

export function PrelaunchFormWrapper() {
  const router = useRouter();
  const { status, error, reservation, createReservation } = useReservation();

  const handleSubmit = async (data: ReservationFormData) => {
    await createReservation(data);
  };

  // 성공 시 예약 완료 페이지로 이동
  if (status === 'success' && reservation) {
    router.push(
      `/prelaunch/reserved?position=${reservation.queue_position}&ref=${reservation.invite_code}`
    );
  }

  return (
    <ReservationForm
      onSubmit={handleSubmit}
      status={status}
      errorMessage={error ?? undefined}
    />
  );
}
