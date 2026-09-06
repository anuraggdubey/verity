import { NextResponse } from 'next/server';

export function apiError(status: number, code: string, message: string, details?: unknown) {
  return NextResponse.json({ ok: false, error: { code, message, ...(details === undefined ? {} : { details }) } }, { status });
}
