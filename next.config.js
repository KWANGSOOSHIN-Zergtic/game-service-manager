/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['typeorm', 'pg'],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      // 클라이언트 사이드에서는 TypeORM 관련 모듈을 빈 객체로 대체
      config.resolve.alias = {
        ...config.resolve.alias,
        typeorm: false,
        pg: false,
        'pg-native': false,
        'pg-query-stream': false,
        '@sap/hana-client': false,
        'better-sqlite3': false,
        'sqlite3': false,
        'mysql': false,
        'mysql2': false,
        'oracledb': false,
        'mongodb': false
      };

      // Node.js 모듈을 클라이언트 사이드에서 사용하지 않도록 설정
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
        'pg-native': false,
        'mongodb-client-encryption': false,
        'bson-ext': false,
        snappy: false,
        'kerberos': false,
        'aws4': false,
        'supports-color': false,
        'bson': false,
        path: false,
        util: false,
        crypto: false,
        process: false,
        buffer: false,
        stream: false,
        '@sap/hana-client': false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        os: false
      };
    }

    // 불필요한 드라이버 로딩 방지
    config.externals = [
      ...(config.externals || []),
      function({ context, request }, callback) {
        // TypeORM 브라우저 버전 처리
        if (/typeorm\/browser/.test(request)) {
          return callback(null, 'commonjs ' + request);
        }

        // 데이터베이스 드라이버 및 관련 모듈 제외
        const excludeModules = [
          /^@sap\/hana-client/,
          /^pg-native/,
          /^pg-query-stream/,
          /^mongodb/,
          /^mysql/,
          /^sqlite3/,
          /^better-sqlite3/,
          /^oracledb/,
          /^mssql/,
          /^sql\.js/,
          /^react-native-sqlite-storage/,
          /^bson/,
          /^typeorm\/browser/
        ];

        if (excludeModules.some(pattern => pattern.test(request))) {
          return callback(null, 'commonjs ' + request);
        }

        callback();
      }
    ];

    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb'
    }
  }
};

module.exports = nextConfig; 