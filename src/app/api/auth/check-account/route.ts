import { NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { DB_COLLECTION } from '../../db-information/db-collection';

export async function GET() {
  let AppDataSource: DataSource | null = null;
  
  try {
    // football_service DB 설정 가져오기
    const dbConfig = DB_COLLECTION['football_service'];
    if (!dbConfig) {
      return NextResponse.json(
        { error: 'DB 설정을 찾을 수 없습니다.' },
        { status: 500 }
      );
    }

    // DB 연결 설정
    AppDataSource = new DataSource({
      type: 'postgres',
      host: dbConfig.host,
      port: Number(dbConfig.port || '5432'),
      username: dbConfig.config.service_db.user,
      password: dbConfig.config.service_db.password,
      database: dbConfig.data_base,
      synchronize: false,
      logging: true,
    });

    // DB 연결
    await AppDataSource.initialize();
    console.log('DB 연결 성공');

    // 관리자 계정 조회 쿼리
    const query = `
      SELECT id, name, type, description, "createAt", "updateAt"
      FROM public.service_admin_account
    `;
    
    console.log('관리자 계정 목록 조회');
    const admins = await AppDataSource.query(query);
    console.log('조회된 계정 수:', admins.length);
    console.log('계정 목록:', admins);

    return NextResponse.json({
      success: true,
      message: '관리자 계정 목록 조회 성공',
      admins
    });
  } catch (error) {
    console.error('관리자 계정 조회 에러:', error);
    return NextResponse.json(
      { error: '관리자 계정 조회 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  } finally {
    // DB 연결 종료
    if (AppDataSource && AppDataSource.isInitialized) {
      await AppDataSource.destroy();
      console.log('DB 연결 종료');
    }
  }
} 