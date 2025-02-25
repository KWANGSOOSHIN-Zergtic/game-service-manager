import { DatabaseQueries } from './queries-data-type';
import { SERVICE_QUERIES } from './queries-service';
import { USER_QUERIES} from './queries-users';
import { USER_CURRENCY_QUERIES } from './queries-users-currency';

//규모가 커지면 별도로 분리하자 (Service, User, Admin, etc...)
export const DB_QUERIES: DatabaseQueries = {
    ...SERVICE_QUERIES,
    ...USER_QUERIES,
    ...USER_CURRENCY_QUERIES
}; 