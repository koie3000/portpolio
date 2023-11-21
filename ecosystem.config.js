module.exports = {
  /**
   * 앱 설정
   */
  apps: [
    {
      name: 'front-admin',
      script: './server.js', // 앱 실행 스크립트
      instances: 1, // 앱 인스턴스의 수
      exec_mode: 'cluster', // 실행 모드.
      autorestart: true, // 프로세스 실패 시 자동으로 재시작할지 선택
      max_memory_restart: '500M', // PM2 메모리 재시작
      // node_args: '--max_old_space_size=300',  // node 메모리 제한 300mb
      merge_logs: true, // 클러스터 모드 사용 시 각 클러스터에서 생성되는 로그를 한 파일로 합쳐준다.
      log_date_format: 'YYYY-MM-DD HH:mm',
      out_file: `./console/info.log`,
      error_file: `./console/error.log`,
      env: {
        // 환경변수. 모든 배포 환경에서 공통으로 사용한다.
        NODE_ENV: 'production',
      },
      // env_staging: { // staging 배포 환경에서만 사용할 환경 변수
      //   API_ROOT: 'http://api.server.name'
      // }
    },
  ],
};
