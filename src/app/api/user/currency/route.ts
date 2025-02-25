import { NextRequest, NextResponse } from 'next/server';
import { getUserCurrency } from './service';

// Next.js API 라우트 핸들러
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const dbName = searchParams.get('dbName');

  const result = await getUserCurrency({ employerUid, dbName });
  const { status, ...responseData } = result;

  return NextResponse.json(responseData, { status: status || 500 });
} 