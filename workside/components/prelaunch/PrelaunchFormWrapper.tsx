'use client';

// @TASK P2-S1-T1 - ReservationForm 페이지 래퍼 (onSubmit 핸들러 연결)
// @SPEC specs/screens/prelaunch/landing

import { ReservationForm, ReservationFormData, ReservationFormStatus } from './ReservationForm';
import { useState } from 'react';

export function PrelaunchFormWrapper() {
  const [status, setStatus] = useState<ReservationFormStatus>('idle');
  const [errorMessage, setErrorMessage] = useState<string | undefined>();

  const handleSubmit = (data: ReservationFormData) => {
    // P2-S1-T2에서 API 연동 구현 예정
    console.log('예약 요청:', data);
    setStatus('idle');
    setErrorMessage(undefined);
  };

  return (
    <ReservationForm
      onSubmit={handleSubmit}
      status={status}
      errorMessage={errorMessage}
    />
  );
}
