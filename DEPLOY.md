# 网站发布说明

这个项目是纯静态网站，可以部署到 GitHub Pages、Netlify、Vercel 或任意静态网站托管平台。

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
3. Framework Preset 选择 `Other`，构建命令使用 `npm run build`，输出目录使用 `dist`。

## 注意

天气、时间、定位、汇率接口依赖第三方公共 API。公开部署后建议使用 HTTPS，浏览器定位功能在 HTTPS 下体验最好。

本地大模型兜底依赖访问者自己的电脑运行 Ollama 和 `qwen3:4b`。它不会上传模型到网站服务器；没有本地模型时，网站仍会正常使用知识库和实时 API。
