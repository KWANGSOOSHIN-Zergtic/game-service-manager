import { NextRequest, NextResponse } from 'next/server';
import { 
  getUserPubSeat, 
  getUserPubSeatItem, 
  createUserPubSeat, 
  updateUserPubSeat, 
  deleteUserPubSeat 
} from './service';

// GET: PUB 좌석 상태 정보 조회
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const id = searchParams.get('id');
  const dbName = searchParams.get('dbName');

  // dbName이 없는 경우 에러 응답
  if (!dbName) {
    return NextResponse.json({
      success: false,
      message: '필수 파라미터가 누락되었습니다.',
      error: 'dbName은 필수 파라미터입니다.',
    }, { status: 400 });
  }

  // 특정 좌석 상태 조회
  if (id) {
    const result = await getUserPubSeatItem({ 
      employerUid, 
      dbName, 
      id: id ? parseInt(id) : null 
    });
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  }
  
  // 전체 또는 특정 사용자의 좌석 상태 조회
  const result = await getUserPubSeat({ employerUid, dbName });
  const { status, ...responseData } = result;

  return NextResponse.json(responseData, { status: status || 500 });
}

// POST: PUB 좌석 상태 생성
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      employer_uid, // 클라이언트에서는 employer_uid로 보내고 있음
      dbName, 
      seat_status, // 클라이언트에서는 seat_status로 보내고 있음
      talk_status, // 클라이언트에서는 talk_status로 보내고 있음
      recruit_status // 클라이언트에서는 recruit_status로 보내고 있음
    } = body;
    
    // dbName이 없는 경우 에러 응답
    if (!dbName) {
      return NextResponse.json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.',
        error: 'dbName은 필수 파라미터입니다.',
      }, { status: 400 });
    }

    // employer_uid가 없는 경우 에러 응답
    if (!employer_uid) {
      return NextResponse.json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.',
        error: 'employer_uid는 필수 파라미터입니다.',
      }, { status: 400 });
    }
    
    const result = await createUserPubSeat({ 
      employerUid: employer_uid, // 파라미터 매핑
      dbName, 
      seatStatus: seat_status, // 파라미터 매핑
      talkStatus: talk_status, // 파라미터 매핑
      recruitStatus: recruit_status // 파라미터 매핑
    });
    
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  } catch (error) {
    console.error('[PUB API] POST 요청 처리 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: '요청 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }, { status: 400 });
  }
}

// PUT: PUB 좌석 상태 업데이트
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      id,
      employer_uid, // 클라이언트에서는 employer_uid로 보내고 있음
      dbName, 
      seat_status, // 클라이언트에서는 seat_status로 보내고 있음
      talk_status, // 클라이언트에서는 talk_status로 보내고 있음
      recruit_status // 클라이언트에서는 recruit_status로 보내고 있음
    } = body;
    
    // 필수 파라미터 검증
    if (!dbName) {
      return NextResponse.json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.',
        error: 'dbName은 필수 파라미터입니다.',
      }, { status: 400 });
    }
    
    if (!id && !employer_uid) {
      return NextResponse.json({
        success: false,
        message: '필수 파라미터가 누락되었습니다.',
        error: 'id 또는 employer_uid 중 하나는 반드시 제공되어야 합니다.',
      }, { status: 400 });
    }
    
    const result = await updateUserPubSeat({ 
      id,
      employerUid: employer_uid, // 파라미터 매핑
      dbName, 
      seatStatus: seat_status, // 파라미터 매핑
      talkStatus: talk_status, // 파라미터 매핑
      recruitStatus: recruit_status // 파라미터 매핑
    });
    
    const { status, ...responseData } = result;
    return NextResponse.json(responseData, { status: status || 500 });
  } catch (error) {
    console.error('[PUB API] PUT 요청 처리 중 오류:', error);
    return NextResponse.json({
      success: false,
      message: '요청 처리 중 오류가 발생했습니다.',
      error: error instanceof Error ? error.message : '알 수 없는 오류',
    }, { status: 400 });
  }
}

// DELETE: PUB 좌석 상태 삭제
export async function DELETE(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const employerUid = searchParams.get('employerUid');
  const id = searchParams.get('id');
  const dbName = searchParams.get('dbName');
  
  if (!dbName) {
    return NextResponse.json({
      success: false,
      message: '필수 파라미터가 누락되었습니다.',
      error: 'dbName은 필수 파라미터입니다.',
    }, { status: 400 });
  }
  
  if (!id && !employerUid) {
    return NextResponse.json({
      success: false,
      message: '필수 파라미터가 누락되었습니다.',
      error: 'id 또는 employerUid 중 하나는 반드시 제공되어야 합니다.',
    }, { status: 400 });
  }
  
  const result = await deleteUserPubSeat({ 
    employerUid, 
    dbName,
    id: id ? parseInt(id) : undefined
  });
  
  const { status, ...responseData } = result;
  return NextResponse.json(responseData, { status: status || 500 });
} 