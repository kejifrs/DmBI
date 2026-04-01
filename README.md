# DmBI - 数据分析看板系统

基于 Next.js 14+ 构建的私域和公域业务数据分析看板系统。

## 功能特性

- 📊 **私域数据管理**：男厅CP、女厅CP、男厅盲盒的接单和转化数据
- 📈 **公域数据管理**：女厅首充和注册数据
- 🎯 **多维度分析**：主持、主播、厅号维度的数据分析
- 📉 **可视化图表**：折线图、饼图趋势分析（ECharts）
- 📥 **文件导入**：支持 Excel (.xlsx) 和 CSV 格式数据导入
- 🗄️ **数据持久化**：PostgreSQL 数据库存储

## 技术栈

- **前端框架**：Next.js 14+ (App Router)
- **UI 库**：React 18 + TailwindCSS
- **图表库**：ECharts + echarts-for-react
- **数据库 ORM**：Prisma 5 + PostgreSQL
- **文件解析**：xlsx
- **语言**：TypeScript

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置数据库连接：

```env
DATABASE_URL="postgresql://用户名:密码@localhost:5432/数据库名"
```

### 3. 初始化数据库

```bash
npx prisma migrate dev --name init
```

### 4. 启动开发服务器

```bash
npm run dev
```

访问 http://localhost:3000

## Docker 部署

### 使用 Docker Compose

```bash
# 启动所有服务
docker-compose up -d

# 初始化数据库
docker-compose exec app npx prisma migrate deploy

# 停止服务
docker-compose down
```

### 环境变量说明

| 变量名 | 说明 | 默认值 |
|--------|------|--------|
| `DATABASE_URL` | PostgreSQL 连接字符串 | - |
| `NODE_ENV` | 运行环境 | `development` |

## 数据导入格式

### 私域接单数据字段

| 字段名 | 必填 | 说明 |
|--------|------|------|
| 派单日期 | ✅ | 格式：YYYY-MM-DD |
| 工作室 | | |
| 主持 | | |
| 接单厅 | | |
| 主播 | | |
| 排档ID | | |
| 运营 | | |
| 派单群 | | |

### 私域转化数据字段

| 字段名 | 必填 | 说明 |
|--------|------|------|
| 拍走日期 | ✅ | 格式：YYYY-MM-DD |
| 渠道 | | |
| 主持 | | |
| 厅号 | | |
| 主播 | | |
| 排档ID | | |
| 靓号 | | |
| 金额 | | 数字 |
| 接单群 | | |

### 公域首充数据字段

| 字段名 | 必填 | 说明 |
|--------|------|------|
| 日期 | ✅ | 格式：YYYY-MM-DD |
| 厅号 | | |
| 首充数量 | | 整数 |
| 首充金额 | | 数字 |

### 公域注册数据字段

| 字段名 | 必填 | 说明 |
|--------|------|------|
| 日期 | ✅ | 格式：YYYY-MM-DD |
| 厅号 | | |
| 注册数量 | | 整数 |

## 项目结构

```
DmBI/
├── prisma/
│   └── schema.prisma          # 数据库模型
├── src/
│   ├── app/
│   │   ├── api/               # API 路由
│   │   │   ├── analytics/     # 数据分析接口
│   │   │   └── import/        # 数据导入接口
│   │   ├── dashboard/         # 看板页面
│   │   ├── import/            # 导入页面
│   │   └── page.tsx           # 首页
│   ├── components/
│   │   ├── charts/            # 图表组件
│   │   ├── dashboard/         # 看板组件
│   │   ├── layout/            # 布局组件
│   │   └── upload/            # 上传组件
│   ├── lib/                   # 工具库
│   └── types/                 # TypeScript 类型
├── Dockerfile
├── docker-compose.yml
└── nginx.conf
```

## License

MIT
