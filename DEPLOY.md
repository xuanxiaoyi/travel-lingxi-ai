# 网站发布说明

这个项目可以以两种模式部署：

- 静态模式：部署页面、知识库和前端交互，适合 GitHub Pages
- Agent 模式：部署页面加 `/api/travel-agent`、`/api/local-llm`，适合 Vercel

## 本地预览

```bash
npm install
npm run serve
```

打开 `http://127.0.0.1:4173`。

## 生成发布目录

```bash
npm run build
```

生成后的公开网站文件在 `dist/`，只包含页面真正使用的资源，部署体积更小。

## 端到端测试

```bash
npm install
npx playwright install chromium
npm run test:e2e
```

## GitHub Pages

1. 把项目推送到 GitHub 仓库。
2. 仓库默认分支使用 `main`。
3. GitHub Actions 会读取 `.github/workflows/pages.yml` 自动发布。
4. 发布完成后，在仓库的 `Settings -> Pages` 查看公开网址。

## Netlify

1. 登录 Netlify。
2. 选择 `Add new site -> Deploy manually`，上传整个项目目录。
3. 或连接 GitHub 仓库，构建命令使用 `npm run build`，发布目录使用 `dist`。

## Vercel

1. 登录 Vercel。
2. 导入 GitHub 仓库。
3. Framework Preset 选择 `Other`。
4. 不需要填写 `Output Directory`，直接使用仓库根目录部署静态文件和 `api/` 函数。
5. 如果只是想让线上版本稳定可用，不需要额外环境变量，LangChain Agent 会自动退回工具检索模式。
6. 如果希望线上版本真的调用 Ollama / 大模型，需要配置可公网访问的模型地址：

```bash
OLLAMA_BASE_URL=https://your-ollama-endpoint
OLLAMA_MODEL=qwen3:4b
```

7. 如果没有公网模型地址，不要把 `OLLAMA_BASE_URL` 指向 `127.0.0.1` 或 `localhost`，Vercel 云函数无法访问你的本机模型。

## 注意

天气、时间、定位、汇率接口依赖第三方公共 API。公开部署后建议使用 HTTPS，浏览器定位功能在 HTTPS 下体验最好。

GitHub Pages 只能运行静态页面，不能运行 LangChain Agent 的 Node 接口。

Vercel 可以运行 `api/` 下的 Serverless Functions，但默认也访问不到你本机的 Ollama。没有公网模型地址时，线上版本会自动退回知识库检索和规则路线生成，不会报错。
