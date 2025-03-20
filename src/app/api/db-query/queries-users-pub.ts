import { DatabaseQueries } from './queries-data-type';

export const USER_PUB_SEAT_QUERIES: DatabaseQueries = {
    SELECT_USER_PUB_SEAT: {
        name: 'SELECT_USER_PUB_SEAT',
        description: '사용자의 PUB 좌석 상태 조회',
        query: `
            SELECT 
                ups.id,
                ups.employer_uid,
                ups.refresh_at,
                ups.seat_status,
                ups.talk_status,
                ups.recruit_status,
                ups.create_at as created_at,
                ups.update_at as updated_at,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_pub_seat_status ups
            LEFT JOIN 
                employer e ON ups.employer_uid = e.uid
            WHERE 
                ($1::bigint IS NULL OR ups.employer_uid = $1)
            ORDER BY 
                ups.id DESC
        `
    },
    SELECT_USER_PUB_SEAT_BY_ID: {
        name: 'SELECT_USER_PUB_SEAT_BY_ID',
        description: '특정 ID의 PUB 좌석 상태 조회',
        query: `
            SELECT 
                ups.id,
                ups.employer_uid,
                ups.refresh_at,
                ups.seat_status,
                ups.talk_status,
                ups.recruit_status,
                ups.create_at as created_at,
                ups.update_at as updated_at,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_pub_seat_status ups
            LEFT JOIN 
                employer e ON ups.employer_uid = e.uid
            WHERE 
                ups.id = $1
        `
    },
    SELECT_USER_PUB_SEAT_BY_EMPLOYER_UID: {
        name: 'SELECT_USER_PUB_SEAT_BY_EMPLOYER_UID',
        description: '특정 사용자의 PUB 좌석 상태 조회',
        query: `
            SELECT 
                ups.id,
                ups.employer_uid,
                ups.refresh_at,
                ups.seat_status,
                ups.talk_status,
                ups.recruit_status,
                ups.create_at as created_at,
                ups.update_at as updated_at,
                e.nickname as user_nickname,
                e.display_id as user_display_id
            FROM 
                user_pub_seat_status ups
            LEFT JOIN 
                employer e ON ups.employer_uid = e.uid
            WHERE 
                ups.employer_uid = $1
            ORDER BY 
                ups.id DESC
        `
    },
    INSERT_USER_PUB_SEAT: {
        name: 'INSERT_USER_PUB_SEAT',
        description: 'PUB 좌석 상태 추가',
        query: `
            INSERT INTO user_pub_seat_status
                (employer_uid, seat_status, talk_status, recruit_status)
            VALUES
                ($1, $2, $3, $4)
            RETURNING 
                id, employer_uid, refresh_at, seat_status, talk_status, recruit_status,
                create_at as created_at, update_at as updated_at
        `
    },
    UPDATE_USER_PUB_SEAT: {
        name: 'UPDATE_USER_PUB_SEAT',
        description: 'PUB 좌석 상태 업데이트',
        query: `
            UPDATE user_pub_seat_status
            SET 
                seat_status = $2,
                talk_status = $3,
                recruit_status = $4,
                refresh_at = now()
            WHERE 
                id = $1
            RETURNING 
                id, employer_uid, refresh_at, seat_status, talk_status, recruit_status,
                create_at as created_at, update_at as updated_at
        `
    },
    UPDATE_USER_PUB_SEAT_BY_EMPLOYER: {
        name: 'UPDATE_USER_PUB_SEAT_BY_EMPLOYER',
        description: '사용자 UID로 PUB 좌석 상태 업데이트',
        query: `
            UPDATE user_pub_seat_status
            SET 
                seat_status = $2,
                talk_status = $3,
                recruit_status = $4,
                refresh_at = now()
            WHERE 
                employer_uid = $1
            RETURNING 
                id, employer_uid, refresh_at, seat_status, talk_status, recruit_status,
                create_at as created_at, update_at as updated_at
        `
    },
    DELETE_USER_PUB_SEAT: {
        name: 'DELETE_USER_PUB_SEAT',
        description: 'PUB 좌석 상태 삭제',
        query: `
            DELETE FROM user_pub_seat_status
            WHERE 
                id = $1
            RETURNING 
                id, employer_uid, refresh_at, seat_status, talk_status, recruit_status,
                create_at as created_at, update_at as updated_at
        `
    },
    DELETE_USER_PUB_SEAT_BY_EMPLOYER: {
        name: 'DELETE_USER_PUB_SEAT_BY_EMPLOYER',
        description: '사용자 UID로 PUB 좌석 상태 삭제',
        query: `
            DELETE FROM user_pub_seat_status
            WHERE 
                employer_uid = $1
            RETURNING 
                id, employer_uid, refresh_at, seat_status, talk_status, recruit_status,
                create_at as created_at, update_at as updated_at
        `
    }
}; 