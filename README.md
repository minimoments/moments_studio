# 个人作品集网站 (Personal Portfolio)

一个参考 [XiaoHer Portfolio](https://xiaoher001.github.io/XiaoHer/) 布局制作的个人网站，支持 **明暗主题切换**、**中英双语切换**，所有内容均通过 **JSON 数据文件** 驱动（非写死），可一键部署到 **GitHub Pages** 与 **Gitee Pages**。

---

## ✨ 功能特性

- 🎨 **明暗主题切换**（右上角 🌙/☀️，自动记忆偏好）
- 🌐 **中英语言切换**（右上角 中/EN，自动记忆偏好）
- 📝 **数据文件驱动** —— 所有文字内容都在 `data/` 下的 JSON 文件里，改文件即可，无需碰代码
- 📱 **响应式布局**，手机 / 平板 / 桌面自适应
- ✨ 滚动渐入动画、技能进度条动画、经历时间线 Tab 切换
- 🚀 纯静态站点，零依赖、零构建，可直接部署到任意静态托管

---

## 📁 目录结构

```
my-portfolio/
├── index.html              # 主页面（无需改动）
├── css/
│   └── style.css           # 样式与主题变量
├── js/
│   └── main.js             # 数据加载 / 主题 / 语言 / 交互逻辑（无需改动）
├── data/                   # ⭐ 你只需要改这里
│   ├── profile.json        # 个人信息（姓名、头衔、简介、社交链接）
│   ├── skills.json         # 技能与熟练度
│   ├── experience.json     # 工作经历 / 教育经历 / 成就
│   ├── certificates.json   # 证书与荣誉
│   ├── projects.json       # 精选项目
│   └── ui-strings.json     # 界面文案（导航、按钮、标题等）
├── assets/                 # 头像、项目配图（替换为自己的图片）
│   ├── avatar.svg
│   └── project-1.svg ~ project-6.svg
└── README.md
```

---

## ✏️ 如何填写自己的数据

打开 `data/` 目录下的任意 JSON 文件，**只改双引号里的内容**，保持文件格式（特别是引号、逗号、中括号/大括号）正确。

每个需要翻译的文本字段都是这样的结构，请同时填写中英文：

```json
"name": {
  "zh": "你的中文名字",
  "en": "Your English Name"
}
```

### 各文件说明

| 文件 | 用途 | 关键字段 |
|------|------|----------|
| `profile.json` | 个人信息 + 社交链接 | `name` / `title` / `tagline` / `intro` / `avatar` / `resumeUrl` / `socials` |
| `skills.json` | 技能分类与进度 | `categories[].items[].name` + `level`(0-100) |
| `experience.json` | 经历时间线 | `work` / `education` / `achievements` |
| `certificates.json` | 证书荣誉卡片 | `items[].title` / `subtitle` / `category` |
| `projects.json` | 项目卡片 | `items[].title` / `description` / `tags` / `image` / `link` |
| `ui-strings.json` | 界面文案 | 导航、按钮、区块标题等 |

**社交图标**：`socials[].icon` 支持 `github` / `email` / `blog` / `link` / `website` / `twitter`(x) / `linkedin` / `wechat` / `qq` / `phone` / `zhihu` / `bilibili` 等。

**图片**：把 `assets/avatar.svg` 换成你的头像（可改名为 `avatar.jpg` 并同步修改 `profile.json` 中的 `avatar` 路径）；项目图同理。

> ⚠️ 改完 JSON 后记得保存。若页面没更新，刷新时强制刷新（Ctrl+F5）清缓存。

---

## 💻 本地预览

由于浏览器安全策略，直接双击 `index.html`（`file://` 协议）会因 CORS 无法读取 JSON。
请使用本地服务器预览：

```bash
# 进入项目目录
cd my-portfolio

# 方式一：Python（推荐，已自带）
python -m http.server 8080
# 然后浏览器打开 http://localhost:8080

# 方式二：Node
npx serve .
```

---

## 🚀 部署到 GitHub Pages

1. 在 GitHub 新建仓库（如 `username.github.io` 或任意仓库名）。
2. 把整个 `my-portfolio` 目录内容推送到仓库。
3. 仓库 **Settings → Pages → Source** 选择 `main` 分支（`/root` 目录），保存。
4. 等待 1-2 分钟，访问 `https://username.github.io/仓库名/` 即可。

> 若仓库名不是 `username.github.io`，地址为 `https://username.github.io/仓库名/`。
> 也可通过 Actions 自动部署（仓库含 `index.html` 在根目录时，GitHub Pages 可直接使用根目录）。

---

## 🚀 部署到 Gitee Pages

1. 在 Gitee 新建仓库，把项目推送到仓库。
2. 仓库 **服务 → Gitee Pages**。
3. 选择部署分支（如 `master`），填写部署目录（根目录留空），点击「启动」。
4. 访问生成的 `https://username.gitee.io/仓库名/` 地址。

> Gitee Pages 个人免费版需实名认证；企业版无此限制。

---

## 🔧 自定义外观（可选）

打开 `css/style.css` 顶部 `:root` 可修改变量：

- `--accent` / `--accent-2` —— 主题主色（渐变）
- `--radius` —— 卡片圆角
- `--max-width` —— 内容最大宽度

明暗主题分别在 `[data-theme="dark"]` 与 `[data-theme="light"]` 中定义。

---

## ❓ 常见问题

**Q: 页面提示“数据加载失败”？**
A: 你是用 `file://` 直接打开的。请按上面「本地预览」用本地服务器打开，或部署到 Pages 后访问线上地址。

**Q: 改了 JSON 但页面没变？**
A: 强制刷新（Ctrl+F5）清缓存；检查 JSON 格式是否正确（可用 https://jsonlint.com 校验）。

**Q: 想加更多项目 / 技能？**
A: 在对应 JSON 数组里复制一项、修改内容即可，渲染会自动适配。
