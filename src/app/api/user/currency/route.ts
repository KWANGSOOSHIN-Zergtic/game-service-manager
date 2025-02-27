import { NextRequest, NextResponse } from 'next/server';
import { getUserCurrency, createUserCurrency, updateUserCurrency, deleteUserCurrency, getUserCurrencyItem } from './service';

// GET: 사용자 재화 정보 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const dbName = searchParams.get('dbName');
  const excelItemIndex = searchParams.get('excelItemIndex');

  // 특정 재화 아이템 조회
  if (excelItemIndex) {
    const result = await getUserCurrencyItem({ 
      employerUid, 
      dbName, 
      excelItemIndex: excelItemIndex ? parseInt(excelItemIndex) : null 
    });
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  }
  
  // 전체 재화 조회
  const result = await getUserCurrency({ employerUid, dbName });
  const { status, ...responseData } = result;

  return NextResponse.json(responseData, { status: status || 500 });
}

// POST: 사용자 재화 생성/추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerUid, excelItemIndex, count, dbName } = body;
    
    const result = await createUserCurrency({ 
      employerUid, 
      excelItemIndex, 
      count, 
      dbName 
    });
    
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '요청 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }, { status: 400 });
  }
}

// PUT: 사용자 재화 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { employerUid, excelItemIndex, count, dbName } = body;
    
    const result = await updateUserCurrency({ 
      employerUid, 
      excelItemIndex, 
      count, 
      dbName 
    });
    
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  } catch (error) {
    return NextResponse.json({
      success: false,
      message: '요청 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }, { status: 400 });
  }
}

// DELETE: 사용자 재화 삭제
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const excelItemIndex = searchParams.get('excelItemIndex');
  const dbName = searchParams.get('dbName');
  
  if (!employerUid || !excelItemIndex) {
    return NextResponse.json({
      success: false,
      message: '필수 파라미터가 누락되었습니다.',
      error: 'employerUid와 excelItemIndex는 필수 파라미터입니다.',
    }, { status: 400 });
  }
  
  const result = await deleteUserCurrency({ 
    employerUid, 
    excelItemIndex: parseInt(excelItemIndex), 
    dbName 
  });
  
  const { status, ...responseData } = result;
  return NextResponse.json(responseData, { status: status || 500 });
} 