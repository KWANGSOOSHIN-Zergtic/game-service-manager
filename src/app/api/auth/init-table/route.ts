import { NextResponse } from 'next/server';
import { DataSource } from 'typeorm';
import { DB_COLLECTION } from '../../db-information/db-collection';

export async function POST() {
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

    // 시퀀스 생성 쿼리
    const createSequenceQuery = `
      CREATE SEQUENCE IF NOT EXISTS service_admin_account_id_seq
      INCREMENT 1
      START 1
      MINVALUE 1
      MAXVALUE 9223372036854775807
      CACHE 1;
    `;

    // 테이블 생성 쿼리
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS public.service_admin_account
      (
        "createAt"   timestamp DEFAULT now() NOT NULL,
        "updateAt"   timestamp DEFAULT now() NOT NULL,
        index        bigint DEFAULT nextval('service_admin_account_id_seq'::regclass) NOT NULL PRIMARY KEY,
        name         varchar DEFAULT ''::character varying,
        description  varchar DEFAULT ''::character varying,
        type         varchar DEFAULT ''::character varying,
        ip           varchar DEFAULT ''::character varying,
        mac_addr     varchar DEFAULT ''::character varying,
        id           varchar DEFAULT ''::character varying,
        password     varchar DEFAULT ''::character varying
      );
    `;

    // 테이블 소유자 설정 쿼리
    const alterTableQuery = `
      ALTER TABLE IF EXISTS public.service_admin_account
      OWNER to postadmin;
    `;

    // 초기 관리자 계정 생성 쿼리
    const insertAdminQuery = `
      INSERT INTO public.service_admin_account 
      (id, password, name, type, description)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (id) DO NOTHING
      RETURNING *;
    `;

    // 쿼리 실행
    console.log('시퀀스 생성');
    await AppDataSource.query(createSequenceQuery);
    
    console.log('테이블 생성');
    await AppDataSource.query(createTableQuery);
    
    console.log('테이블 소유자 설정');
    await AppDataSource.query(alterTableQuery);

    console.log('초기 관리자 계정 생성');
    const result = await AppDataSource.query(insertAdminQuery, [
      'sks@woore.co.kr',
      '1234',
      '관리자',
      'admin',
      '초기 관리자 계정'
    ]);

    return NextResponse.json({
      success: true,
      message: '테이블 초기화 및 관리자 계정 생성 완료',
      result: result[0]
    });
  } catch (error) {
    console.error('테이블 초기화 에러:', error);
    return NextResponse.json(
      { error: '테이블 초기화 중 오류가 발생했습니다.' },
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