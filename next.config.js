// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 기존 설정 유지

  // 🚨 [필수 추가]: API 경로에서 파일 업로드가 가능하도록 body parser를 비활성화합니다.
  // 이 설정이 없으면 파일 업로드 API가 500 오류 또는 파싱 오류를 발생시킵니다.
  api: {
    bodyParser: false,
  },
};

module.exports = nextConfig;