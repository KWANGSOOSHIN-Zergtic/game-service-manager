export interface QueryInfo {
    name: string;
    description: string;
    query: string;
}

export interface DatabaseQueries {
    [key: string]: QueryInfo;
} 