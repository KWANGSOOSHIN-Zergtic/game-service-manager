import { NextRequest, NextResponse } from 'next/server';
import { getUserBaller, getUserBallerItem, createUserBaller, updateUserBaller, deleteUserBaller } from './service';

// GET: 사용자 Baller 정보 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const dbName = searchParams.get('dbName');
  const excelBallerIndex = searchParams.get('excelBallerIndex');

  // 특정 Baller 정보 조회
  if (excelBallerIndex) {
    const result = await getUserBallerItem({ 
      employerUid, 
      dbName, 
      excelBallerIndex: excelBallerIndex ? parseInt(excelBallerIndex) : null 
    });
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  }
  
  // 전체 Baller 정보 조회
  const result = await getUserBaller({ employerUid, dbName });
  const { status, ...responseData } = result;

  return NextResponse.json(responseData, { status: status || 500 });
}

// POST: 사용자 Baller 생성/추가
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      employerUid, 
      dbName, 
      excelBallerIndex, 
      trainingPoint = 0, 
      characterLevel = 1, 
      recruitProcess = 0, 
      characterStatus = 0, 
      talkGroupNo = 1, 
      etc = null, 
      maxUpgradePoint = 0 
    } = body;
    
    const result = await createUserBaller({ 
      employerUid, 
      dbName, 
      excelBallerIndex, 
      trainingPoint, 
      characterLevel, 
      recruitProcess, 
      characterStatus, 
      talkGroupNo, 
      etc, 
      maxUpgradePoint 
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

// PUT: 사용자 Baller 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      employerUid, 
      dbName, 
      excelBallerIndex, 
      trainingPoint = 0, 
      characterLevel = 1, 
      recruitProcess = 0, 
      characterStatus = 0, 
      talkGroupNo = 1, 
      etc = null, 
      maxUpgradePoint = 0 
    } = body;
    
    const result = await updateUserBaller({ 
      employerUid, 
      dbName, 
      excelBallerIndex, 
      trainingPoint, 
      characterLevel, 
      recruitProcess, 
      characterStatus, 
      talkGroupNo, 
      etc, 
      maxUpgradePoint 
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

// DELETE: 사용자 Baller 삭제
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const excelBallerIndexParam = searchParams.get('excelBallerIndex');
  const dbName = searchParams.get('dbName');
  
  if (!employerUid || !excelBallerIndexParam || !dbName) {
    return NextResponse.json({
      success: false,
      message: '필수 파라미터가 누락되었습니다.',
      error: 'employerUid, excelBallerIndex 및 dbName은 필수 파라미터입니다.',
    }, { status: 400 });
  }
  
  // 쉼표로 구분된 excelBallerIndex 처리
  const excelBallerIndices = excelBallerIndexParam.split(',').map(index => parseInt(index.trim()));
  
  if (excelBallerIndices.some(index => isNaN(index))) {
    return NextResponse.json({
      success: false,
      message: '잘못된 파라미터 형식입니다.',
      error: 'excelBallerIndex는 쉼표로 구분된 숫자 목록이어야 합니다.',
    }, { status: 400 });
  }
  
  // 모든 삭제 작업 결과를 저장할 배열
  const results = [];
  let hasError = false;
  
  // 각 항목 삭제 실행
  for (const excelBallerIndex of excelBallerIndices) {
    try {
      const result = await deleteUserBaller({ 
        employerUid, 
        excelBallerIndex, 
        dbName 
      });
      
      results.push({
        excelBallerIndex,
        success: result.success,
        message: result.message,
      });
      
      if (!result.success) {
        hasError = true;
      }
    } catch (error) {
      console.error(`Error deleting baller with excelBallerIndex ${excelBallerIndex}:`, error);
      results.push({
        excelBallerIndex,
        success: false,
        message: error instanceof Error ? error.message : '알 수 없는 오류',
      });
      hasError = true;
    }
  }
  
  return NextResponse.json({
    success: !hasError,
    message: hasError 
      ? '일부 항목 삭제 중 오류가 발생했습니다.' 
      : `${excelBallerIndices.length}개 항목이 성공적으로 삭제되었습니다.`,
    results,
  }, { status: hasError ? 500 : 200 });
} 