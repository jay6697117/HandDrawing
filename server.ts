import { serveDir, serveFile } from "https://deno.land/std@0.224.0/http/file_server.ts";

Deno.serve(async (req: Request) => {
  // 先尝试返回静态文件
  const response = await serveDir(req, {
    fsRoot: "./dist",
    showIndex: true,
    quiet: true,
  });

  // 如果返回 404，且不是静态资源请求，则回退到 index.html（SPA 路由处理）
  if (response.status === 404) {
    const url = new URL(req.url);
    const ext = url.pathname.split('.').pop();
    // 有文件扩展名的请求（如 .js、.css、.png）直接返回 404
    if (ext && ext !== url.pathname.substring(1) && ext.length <= 5) {
      return response;
    }
    // 无扩展名的路径视为 SPA 路由，返回 index.html
    return serveFile(req, "./dist/index.html");
  }

  return response;
});
