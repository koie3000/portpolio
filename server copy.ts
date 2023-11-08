import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import { createServer as createViteServer } from "vite";

const __dirname: string = path.dirname(fileURLToPath(import.meta.url));

async function createServer(
  _root = process.cwd(),
  isProd = process.env.NODE_ENV === 'production',
  _hmrPort?: any
) {
  const app: express.Application = express();

  const resolve = (p: string) => path.resolve(__dirname, p)

  const manifest = isProd
    ? JSON.parse(
        fs.readFileSync(resolve('dist/client/ssr-manifest.json'), 'utf-8'),
      )
    : {}


  // 미들웨어 모드로 Vite 서버를 생성하고 애플리케이션의 타입을 'custom'으로 설정합니다.
  // 이는 Vite의 자체 HTML 제공 로직을 비활성화하고, 상위 서버에서 이를 제어할 수 있도록 합니다.
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: "custom",
  });

  // Vite를 미들웨어로 사용합니다.
  // 만약 Express 라우터(express.Router())를 사용하는 경우, router.use를 사용해야 합니다.
  app.use(vite.middlewares as express.RequestHandler);

  app.use(
    "*",
    async (
      req: express.Request,
      res: express.Response,
      next: express.NextFunction,
    ) => {
      const url: string = req.originalUrl;

      try {
        // 1. index.html 파일을 읽어들입니다.
        let template = fs.readFileSync(
          resolve("index.html"),
          "utf-8",
        );

        // 2. Vite의 HTML 변환 작업을 통해 Vite HMR 클라이언트를 주입하고,
        //    Vite 플러그인의 HTML 변환도 적용합니다.
        //    (예시: @vitejs/plugin-react의 Global Preambles)
        template = await vite.transformIndexHtml(url, template);

        // 3. 서버의 진입점(Entry)을 로드합니다.
        //    vite.ssrLoadModule은 Node.js에서 사용할 수 있도록 ESM 소스 코드를 자동으로 변환합니다.
        //    추가적인 번들링이 필요하지 않으며, HMR과 유사한 동작을 수행합니다.
        const { render } = await vite.ssrLoadModule("/src/entry-server.ts");

        // 4. 앱의 HTML을 렌더링합니다.
        //    이는 entry-server.js에서 내보낸(Export) `render` 함수가
        //    ReactDOMServer.renderToString()과 같은 적절한 프레임워크의 SSR API를 호출한다고 가정합니다.
        const appHtml = await render(url, manifest);

        // 5. 렌더링된 HTML을 템플릿에 주입합니다.
        const html = template.replace(`<!--ssr-outlet-->`, appHtml);

        // 6. 렌더링된 HTML을 응답으로 전송합니다.
        res.status(200).set({ "Content-Type": "text/html" }).end(html);
      } catch (e: any) {
        // 만약 오류가 발생된다면, Vite는 스택트레이스(Stacktrace)를 수정하여
        // 오류가 실제 코드에 매핑되도록 재구성합니다.
        vite.ssrFixStacktrace(e);
        next(e);
      }
    },
  );

  app.listen(5173, () => {
    console.log("http://localhost:5173");
  });
}

createServer();