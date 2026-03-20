// @TASK P1-R1-T1 - Users 테이블 마이그레이션 + 타입 검증
// @SPEC docs/planning/02-trd.md#users-table

import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const ROOT = path.resolve(__dirname, '..', '..');

describe('Users Migration', () => {
  const migrationPath = path.join(ROOT, 'supabase', 'migrations', '001_users.sql');

  it('001_users.sql 마이그레이션 파일이 존재해야 한다', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  it('users 테이블 생성 SQL을 포함해야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toContain('create table public.users');
  });

  it('RLS 활성화를 포함해야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toContain('enable row level security');
  });

  it('RLS 정책을 포함해야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toContain('create policy');
    expect(sql).toContain('Users can view own data');
    expect(sql).toContain('Users can update own data');
    expect(sql).toContain('Admin can view all users');
  });

  it('auth.users 트리거를 포함해야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toContain('handle_new_user');
    expect(sql).toContain('on_auth_user_created');
  });

  it('updated_at 자동 업데이트 트리거를 포함해야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toContain('handle_updated_at');
    expect(sql).toContain('on_users_updated');
  });

  it('role 컬럼에 check 제약조건이 있어야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    expect(sql).toMatch(/check\s*\(\s*role\s+in\s*\(\s*'user'\s*,\s*'admin'\s*\)\s*\)/);
  });

  it('필수 컬럼이 모두 포함되어야 한다', () => {
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    const requiredColumns = ['id', 'email', 'nickname', 'password_hash', 'industry', 'company_size', 'role', 'created_at', 'updated_at'];
    for (const col of requiredColumns) {
      expect(sql).toContain(col);
    }
  });
});

describe('User TypeScript Types', () => {
  const typesPath = path.join(ROOT, 'types', 'database.ts');

  it('types/database.ts 파일이 존재해야 한다', () => {
    expect(fs.existsSync(typesPath)).toBe(true);
  });

  it('UserRole 타입이 정의되어야 한다', async () => {
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('UserRole');
    expect(content).toContain("'user'");
    expect(content).toContain("'admin'");
  });

  it('Industry 타입이 정의되어야 한다', async () => {
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('Industry');
  });

  it('CompanySize 타입이 정의되어야 한다', async () => {
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('CompanySize');
  });

  it('User 인터페이스가 정의되어야 한다', async () => {
    const content = fs.readFileSync(typesPath, 'utf-8');
    expect(content).toContain('User');
    // 필수 필드 확인
    const requiredFields = ['id', 'email', 'nickname', 'industry', 'company_size', 'role', 'created_at', 'updated_at'];
    for (const field of requiredFields) {
      expect(content).toContain(field);
    }
  });
});
