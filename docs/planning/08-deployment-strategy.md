# 08-deployment-strategy.md: 배포 전략 및 인프라 가이드

**프로젝트**: Workside (워크사이드)
**버전**: 1.0
**작성일**: 2026-03-20
**상태**: 배포 준비

---

## 1. 현재 기술 스택

| 영역 | 기술 | 비고 |
|------|------|------|
| 프레임워크 | Next.js 16.1.6 (App Router, RSC) | 프론트+백 통합 풀스택 |
| UI | React 19, TailwindCSS 4 | |
| 인증 | Supabase Auth | 이메일/비밀번호, JWT |
| 데이터베이스 | Supabase (PostgreSQL 17) | RLS 적용, 11개 테이블 |
| 유효성 검증 | Zod | API 요청 검증 |
| 차트 | Recharts | 관리자 대시보드 |

---

## 2. 배포 인프라 비교 분석

### 2.1 검토된 옵션

#### 옵션 A: AWS (팀 개발자 가이드라인)

```
프론트: AWS S3 + CloudFront + Route53
백엔드: AWS Lambda + API Gateway + Neon (Serverless Postgres)
인증서: AWS Certificate Manager
```

**장점**:
- AWS Free Tier 활용 가능
- 장기적으로 AWS 생태계 확장 용이
- Lambda 서버리스로 운영비 절감

**단점 (현재 프로젝트 기준)**:
- 현재 코드와 아키텍처 불일치 (대규모 리팩토링 필요)
  - Next.js SSR/RSC → Vite SPA 전환 필요
  - API Routes 19개 → Lambda 핸들러로 재작성 필요
  - Supabase Auth → 자체 인증 구현 필요
  - Supabase → Neon + TypeORM 전환 필요
- 예상 전환 소요: 2~3주
- Lambda Cold Start 이슈 존재

**적용 불가 사유**:
팀 개발자 가이드는 Vite + 별도 백엔드 구조를 전제로 작성됨.
실제 개발은 Next.js 풀스택으로 완성되어 아키텍처가 근본적으로 다름.
개발자 가이드에서도 "의문이 드시면 다른 방법으로 배포하시고 인수인계 문서를 작성해 주세요"라고 유연성을 열어둠.

#### 옵션 B: Vercel + Supabase Cloud (채택)

```
호스팅: Vercel (Next.js 공식 플랫폼)
데이터베이스: Supabase Cloud (PostgreSQL + Auth + Realtime)
```

**장점**:
- 코드 변경 없이 즉시 배포 가능
- Next.js 제작사가 운영하는 호스팅 (최적 성능)
- Supabase Free Tier: 500MB DB, 50K MAU Auth
- Vercel Free Tier: 월 100GB 대역폭, 서버리스 함수 포함
- git push만으로 자동 배포 (CI/CD 내장)

**단점**:
- Free Tier 초과 시 Vercel Pro $20/월
- AWS 대비 인프라 커스텀 제한
- 대규모 트래픽 시 비용 증가 가능

### 2.2 결정

**Vercel + Supabase Cloud 채택**

결정 이유:
1. 현재 코드와 100% 호환 (배포 소요: 1~2시간)
2. MVP 단계에서 빠른 시장 진입이 최우선
3. Free Tier 범위로 MAU 1만까지 무료 운영 가능
4. Supabase는 동일 PostgreSQL이므로, 향후 AWS 마이그레이션 가능

---

## 3. 배포 절차

### 3.1 Supabase Cloud 설정

1. https://supabase.com 에서 프로젝트 생성
   - Region: ap-northeast-1 (Northeast Asia) 권장
2. 로컬 마이그레이션을 클라우드에 적용
   ```bash
   npx supabase link --project-ref <PROJECT_REF>
   npx supabase db push
   ```
3. Project URL, Anon Key, Service Role Key 확보

### 3.2 Vercel 배포

1. https://vercel.com 에서 GitHub 레포 연동
2. Root Directory: `workside` 설정
3. 환경 변수 설정:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://<PROJECT_REF>.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<ANON_KEY>
   SUPABASE_SERVICE_ROLE_KEY=<SERVICE_ROLE_KEY>
   ```
4. 배포 실행 (git push 시 자동 배포)

### 3.3 도메인 연결 (선택)

1. Vercel 프로젝트 Settings → Domains
2. 커스텀 도메인 추가 (예: workside.day)
3. DNS 레코드 설정 (CNAME → cname.vercel-dns.com)

### 3.4 SSL 인증서

- Vercel: 자동 발급 (Let's Encrypt)
- Supabase: 기본 제공
- 별도 작업 불필요

---

## 4. 프로덕션 관리자 계정

배포 후 관리자 계정 설정:
1. Supabase Auth에서 관리자 계정 생성
2. `users` 테이블에서 해당 사용자의 `role`을 `admin`으로 변경
3. `/admin/login`에서 로그인 확인

---

## 5. 비용 예측

### Free Tier 단계 (MAU 0~1,000)

| 서비스 | 비용 | 포함 내역 |
|--------|------|----------|
| Vercel | $0 | 100GB 대역폭, 서버리스 함수 |
| Supabase | $0 | 500MB DB, 50K Auth, 2GB 스토리지 |
| **합계** | **$0/월** | |

### 성장 단계 (MAU 1,000~10,000)

| 서비스 | 비용 | 포함 내역 |
|--------|------|----------|
| Vercel Pro | $20/월 | 1TB 대역폭, 팀 기능 |
| Supabase Pro | $25/월 | 8GB DB, 100K Auth, 100GB 스토리지 |
| **합계** | **$45/월** | |

### 확장 단계 (MAU 10,000+)

| 서비스 | 비용 | 비고 |
|--------|------|------|
| Vercel Enterprise | 협의 | 또는 AWS 마이그레이션 검토 |
| Supabase Team | $599/월 | 또는 자체 PostgreSQL 운영 |

---

## 6. 향후 AWS 마이그레이션 가이드

서비스 성장 시 AWS 전환이 필요해지면:

1. **DB 마이그레이션**: Supabase → AWS RDS (동일 PostgreSQL, pg_dump로 이전)
2. **호스팅 전환**: Vercel → AWS Amplify 또는 ECS (Next.js 지원)
3. **인증 전환**: Supabase Auth → AWS Cognito 또는 자체 구현
4. **예상 소요**: 1~2주 (현재 AWS 리팩토링 대비 훨씬 간단)

마이그레이션 판단 기준:
- 월 비용이 $500 이상 발생할 때
- 특정 AWS 서비스(SageMaker, Kinesis 등)가 필요할 때
- 기업 고객의 보안 요구사항이 있을 때
