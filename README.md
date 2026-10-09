# GCP Cloud Armor 售前全景导览

一份面向客户、销售和售前技术团队的中文 Web Demo。它从业务风险出发，系统讲解 Google Cloud Armor 的产品定位、架构、功能、限制、实施方法、配额和计费。

> 内容仅依据 Google Cloud 官方文档、产品页和定价页整理，最近核验日期：**2026-10-09**。

## 在线体验

- [打开 GCP Cloud Armor 售前全景导览](https://gcp-cloud-armor-field-guide.ai-codex-4608.chatgpt.site)

## 内容范围

Demo 按“业务问题 → 产品全景 → 技术主题 → FAQ”的顺序组织，覆盖：

- DDoS 防护与端点覆盖范围
- Backend、Edge、Network Edge 与 Hierarchical Security Policy
- OWASP CRS 4.22 预配置 WAF 与托管规则
- CEL 自定义规则、真实客户端 IP、JA3/JA4 等条件
- `throttle`、`rate_based_ban` 与限速聚合键
- Bot Management 与 reCAPTCHA 集成
- Adaptive Protection、攻击签名和自动部署
- Google Threat Intelligence 与地址组
- Standard、Enterprise Paygo、Enterprise Annual 对比
- Application Load Balancer、Proxy/Passthrough NLB、VM、GKE、Cloud Run、混合云场景
- Preview、Verbose Logging、Cloud Monitoring、Security Command Center 与排障
- 配额、成本估算、IaC、上线检查和回滚
- 30 条可搜索的客户高频 FAQ

## 本地运行

环境要求：Node.js 18 或更高版本。

```bash
npm run build
python3 -m http.server 4173 --bind 127.0.0.1 --directory dist
```

然后访问：

```text
http://127.0.0.1:4173/
```

停止服务时按 `Ctrl+C`。

## 项目结构

```text
.
├── site-src/
│   ├── index.html       # 业务问题导览与首页结构
│   ├── app.js           # 场景问答、主题索引和 FAQ
│   ├── styles.css       # 首页样式与响应式布局
│   ├── product.html     # 技术主题页容器
│   ├── product.js       # 12 个 Cloud Armor 技术主题
│   └── product.css      # 技术主题页样式
├── build.mjs            # 静态站点构建脚本
├── dist/                # 构建产物
└── package.json
```

`site-src/` 是可编辑源文件。修改后运行 `npm run build`，将最新内容生成到 `dist/`。

## 主要官方资料

- [Cloud Armor overview](https://cloud.google.com/armor/docs/cloud-armor-overview)
- [Security policy overview](https://cloud.google.com/armor/docs/security-policy-overview)
- [Preconfigured WAF rules](https://cloud.google.com/armor/docs/waf-rules)
- [Adaptive Protection overview](https://cloud.google.com/armor/docs/adaptive-protection-overview)
- [Cloud Armor Enterprise overview](https://cloud.google.com/armor/docs/armor-enterprise-overview)
- [Best practices](https://cloud.google.com/armor/docs/best-practices)
- [Quotas and limits](https://cloud.google.com/armor/quotas)
- [Pricing](https://cloud.google.com/armor/pricing)

每个技术主题页还提供了对应的官方文档入口。

## 资料口径

- 仅引用 Google Cloud 官方资料，不引用第三方博客作为产品事实依据。
- 产品能力可能受策略类型、负载均衡类型、全局或区域范围、服务层级和发布阶段影响。
- 配额、区域、功能状态和价格可能随时变化；正式方案与报价必须再次核对官方实时页面。
- 本项目用于产品介绍和售前沟通，不替代针对具体系统的架构评审、安全测试、法律合规判断或正式报价。

## License

本仓库暂未附加开源许可证。未经许可，不代表 Google 或 Google Cloud 的官方立场。
