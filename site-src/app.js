const topics={
  foundation:{name:'产品与架构全景',label:'先搞清保护对象、附着点和流量路径'},
  policies:{name:'安全策略与评估顺序',label:'Backend、Edge、Network Edge 与 Hierarchical'},
  waf:{name:'预配置 WAF 与托管规则',label:'OWASP CRS、灵敏度、调优与请求体检查'},
  custom:{name:'自定义规则语言',label:'IP、地区、ASN、Header、路径、JA3/JA4 与 CEL'},
  rate:{name:'限速与封禁',label:'Throttle、rate-based ban、聚合键与阈值'},
  bot:{name:'Bot 管理与 reCAPTCHA',label:'挑战、无感评分、token 与重定向'},
  adaptive:{name:'Adaptive Protection',label:'异常检测、攻击签名、建议规则与自动部署'},
  threat:{name:'Threat Intelligence 与地址组',label:'Google 情报源、自定义 IP 集合与真实客户端 IP'},
  enterprise:{name:'Standard 与 Enterprise',label:'Paygo、Annual、能力差异与 DDoS 服务'},
  network:{name:'网络 DDoS 与端点覆盖',label:'Application LB、Proxy NLB、Passthrough、VM 与 Hybrid'},
  operations:{name:'日志、监控与排障',label:'Preview、Verbose Logging、SCC 与故障定位'},
  rollout:{name:'实施、配额与成本',label:'上线清单、IaC、配额规划与官方价格'}
};

const problems=[
  {id:'ddos',title:'担心大流量 DDoS 把服务打垮',hint:'既怕应用不可用，也怕攻击带来巨额资源与网络账单',answer:'先区分网络层洪泛与应用层 HTTP Flood。外部代理型负载均衡已有 always-on L3/L4 防护；L7 需要策略、限速与 Adaptive Protection。若关注公开 VM、直通式 NLB、响应团队或账单保护，再评估 Enterprise。',steps:[['确认端点','流量经过 Application LB、Proxy NLB、Passthrough NLB，还是直达 VM？'],['区分层级','L3/L4 看网络端点；L7 看 HTTP 路径、请求速率与后端容量。'],['定义响应','明确告警、封禁、升级支持与业务降级流程。']],tools:['network','adaptive','enterprise']},
  {id:'waf',title:'要防 SQL 注入、XSS 和漏洞利用',hint:'希望快速覆盖 OWASP Top 10，又担心 WAF 误拦正常请求',answer:'预配置 WAF 可以快速覆盖常见攻击类别，但不能“一键全开后不再管理”。官方建议使用最新 CRS 4.22，从 sensitivity 1 + preview 开始，结合命中日志逐项调优，再转强制执行。',steps:[['选规则集','优先采用 CRS 4.22 对应规则集和所需攻击类别。'],['先预览','记录会被拦的请求，不改变真实流量结果。'],['调优上线','按签名、路径和参数排除误报，使用稳定/金丝雀分层。']],tools:['waf','operations','rollout']},
  {id:'abuse',title:'登录、注册、抢购接口被刷',hint:'撞库、爬虫、薅羊毛或单个客户端高频调用',answer:'把“恶意内容”与“高频行为”分开处理：WAF 看请求特征，限速看频率，reCAPTCHA 看人与自动化风险。登录等高价值动作通常需要三者组合，而不是只封 IP。',steps:[['识别动作','把登录、注册、领券、搜索等路径分别建模。'],['设计键值','按 IP、Header、Cookie、token 或复合键聚合。'],['渐进处置','先 throttle，再 challenge；持续滥用时临时 ban。']],tools:['rate','bot','custom']},
  {id:'ip',title:'只允许办公室、合作方或 CDN 来源',hint:'需要 IP 白名单、地区限制，或上游代理后识别真实用户 IP',answer:'可以用 IP/CIDR、自定义地址组、地区、ASN、Threat Intelligence 构建条件。但若有 CDN 或代理，必须先验证直接来源可信，再使用配置的用户 IP Header；否则 Header 可被伪造。',steps:[['确认直接来源','先限制 origin.ip 必须来自可信上游。'],['配置用户 IP','指定可信代理写入的 Header，并验证回退行为。'],['再做业务判定','对 origin.user_ip 应用 allow/deny、情报或地址组规则。']],tools:['custom','threat','policies']},
  {id:'cdn',title:'用了 Cloud CDN，还要不要 Cloud Armor',hint:'缓存命中会不会绕过 WAF？边缘策略和后端策略怎么配？',answer:'要看保护目标。Edge policy 在缓存之前执行，可过滤所有缓存请求；backend policy 仅处理通过 edge policy 且发生 cache miss 的请求。二者可以同时存在，形成缓存前访问控制与回源深度检查。',steps:[['列出缓存风险','是防盗链/来源访问，还是需要完整 WAF？'],['放对策略','Edge 处理缓存前筛选；Backend 处理回源请求。'],['验证顺序','用请求日志确认 enforcedEdgeSecurityPolicy 和 backend 判定。']],tools:['policies','foundation','operations']},
  {id:'serverless',title:'Cloud Run / GKE / 混合云能不能保护',hint:'后端不只有 VM，且可能跨项目、跨云或在本地',answer:'可以，关键是把流量强制经过受支持的负载均衡与 backend service。GKE 可通过默认 Ingress 集成；serverless NEG 需配合负载均衡与 ingress 控制；多云/本地可使用 internet NEG 或 hybrid NEG。',steps:[['统一入口','避免用户绕过负载均衡直接访问 origin。'],['选择 NEG','Serverless、internet 或 hybrid NEG 对应不同后端。'],['验证旁路','检查 DNS、默认域名、公网 IP 和防火墙是否允许绕行。']],tools:['network','foundation','rollout']},
  {id:'governance',title:'多个项目都要统一安全基线',hint:'安全团队要集中管控，应用团队仍需保留局部规则',answer:'使用 hierarchical security policy 在组织、文件夹或项目建立强制基线，再让服务级策略补充应用规则。注意层级策略会先于服务级策略评估，allow/deny 会终止后续评估；需要下放时用 goto_next。',steps:[['定义不可绕过项','恶意来源、法规地域、应急封禁等统一规则。'],['设计委派点','用 goto_next 明确哪些请求交给下层策略。'],['看有效策略','上线前检查目标资源的 effective security policies。']],tools:['policies','threat','rollout']},
  {id:'cost',title:'到底选 Standard、Paygo 还是 Annual',hint:'想知道功能差异、费用结构和什么时候值得升级',answer:'Standard 按策略、规则、请求等计费；Enterprise Paygo 按项目和受保护资源计费；Annual 是 12 个月账单账号级订阅，包含更多资源，并独有满足条件的 DDoS 响应与账单保护。最终应按端点类型、功能需求、资源数与请求量测算。',steps:[['先看能力','是否需要高级网络 DDoS、地址组、完整 Adaptive Protection 等。'],['再算规模','项目数、受保护资源数、全球/区域请求量。'],['评估服务','是否需要 Annual 的 DDoS response 与 bill protection。']],tools:['enterprise','rollout','network']}
];

const faqs=[
 ['Cloud Armor 是部署在 VM 里的代理吗？','不是。策略在 Google 网络边缘、与受支持的负载均衡或网络端点结合执行，不需要在后端实例安装 WAF agent。'],
 ['没有负载均衡器能直接保护 Web 应用吗？','应用层 WAF 通常需要受支持的 Application Load Balancer / backend service 路径。公开 VM 等网络端点可使用 Enterprise 的高级网络 DDoS 与 network edge policy，但这不等同于 L7 WAF。'],
 ['Cloud CDN 缓存命中时 backend policy 会执行吗？','不会。若同时配置 edge 与 backend policy，edge policy 在缓存之前执行；backend policy 只处理通过 edge policy 后的 cache miss 请求。'],
 ['Cloud Run 能用吗？','可以通过受支持的负载均衡和 serverless NEG 接入，并使用 ingress 控制减少绕过入口的风险。Cloud Run 默认域名等旁路需要单独治理。'],
 ['GKE 能用吗？','可以。Cloud Armor 可与 GKE 默认 Ingress 控制器配合；实施时还要核对 BackendConfig、Ingress、负载均衡类型与策略关联。'],
 ['多云或本地后端能保护吗？','可以在 external Application Load Balancer 后使用 internet NEG 或 hybrid NEG，让请求先经过 Cloud Armor，再回源到其他云或本地。'],
 ['能否只允许特定国家或地区？','可以基于 origin.region_code 编写规则；但地理识别不是用户身份认证，也可能受 VPN、代理和地址归属变化影响。'],
 ['如何识别 CDN 后的真实客户端 IP？','配置 userIpRequestHeaders，并只信任受控上游写入的 Header。先验证 origin.ip 属于可信代理，再对 origin.user_ip 应用规则。Header 缺失或无效时会回退到 origin.ip。'],
 ['预配置 WAF 是否覆盖 OWASP Top 10？','它提供基于 OWASP ModSecurity CRS 4.22 的多类攻击规则，帮助缓解 OWASP 风险，但不能替代安全编码、身份鉴别、授权、补丁和应用测试。'],
 ['WAF 默认灵敏度越高越好吗？','不一定。更高 sensitivity 覆盖更多签名，也更容易误报。官方建议从 sensitivity 1 和 preview mode 开始，以真实日志调优。'],
 ['请求体能检查多大？','预配置 WAF 的请求体检查上限可配置，最高 64 kB。超出检查范围的剩余部分可能仍被后端接收，因此应用和负载均衡层还需设置合适的大小限制。'],
 ['支持 JSON、XML、文件上传吗？','可解析 URL encoded 与 application/json；其他类型通常按原始字节检查。官方明确指出预配置 WAF 不支持 XML body parsing。文件上传等场景需结合实际编码、大小和后端验证评估。'],
 ['WebSocket 和 gRPC 怎么处理？','Cloud Armor 可在初始 HTTP(S) 建连请求阶段进行判断；WebSocket 建立后的消息不再逐条检查。gRPC 基于 HTTP/2，日志中的 200 不一定表示未拦截，应结合 gRPC 状态和策略日志判断。'],
 ['Throttle 和 rate-based ban 有什么区别？','Throttle 对超出阈值的请求执行超限动作；rate-based ban 会在达到封禁阈值后对匹配客户端临时封禁，更适合持续滥用者。'],
 ['限速计数是全球精确强一致的吗？','不要把它当作计费或强一致业务配额。它是安全控制，应根据业务流量留出余量，并在 preview 中验证阈值与聚合键。'],
 ['Bot 管理是不是自动封所有机器人？','不是。Cloud Armor 与 reCAPTCHA 提供挑战、token 评分与规则条件，您仍需定义哪些路径、分数和频率触发 allow、deny、rate limit 或 redirect。'],
 ['移动 App 能用 reCAPTCHA challenge 吗？','移动应用支持 action-token；手动 challenge 页面和 session-token 仅适用于网站场景。'],
 ['Adaptive Protection 会自动拦截吗？','默认主要提供异常告警与建议。可用 evaluateAdaptiveProtectionAutoDeploy() 配置自动部署动作，但应结合置信度、基线影响阈值、preview 和业务路径约束谨慎上线。'],
 ['Adaptive Protection 多久建立基线？','官方说明启用后至少需要一小时形成可靠基线。创建新策略会重新训练并丢弃旧基线，因此攻击期间不建议新建策略替换。'],
 ['Threat Intelligence 有哪些类别？','包括已知恶意 IP、Tor 出口、匿名代理、低信誉 VPN、公共云 IP、加密挖矿站点和搜索引擎等；需要 Enterprise。官方已将旧 named IP lists 标记为 deprecated，推荐情报 feeds。'],
 ['规则按什么顺序执行？','同一策略内按数值优先级从小到大，首个匹配规则决定动作。层级上按组织→父文件夹到子文件夹→项目→服务级顺序评估。'],
 ['可以在一条规则里写很多条件吗？','可以用 CEL 组合条件，但存在表达式复杂度和策略配额。为了可读、可审计和易排障，建议按控制目的拆分并预留优先级区间。'],
 ['如何避免误拦？','启用负载均衡日志，规则先 preview，必要时开启 verbose logging，观察 previewSecurityPolicy、匹配签名和业务结果，再逐步强制。'],
 ['Cloud Armor 和 IAP 谁先执行？','取决于负载均衡类型。官方说明 global external Application Load Balancer 上 Cloud Armor 先于 IAP；classic Application Load Balancer 上 IAP 先于 backend policy。Edge policy 在 IAP 前执行。'],
 ['一个策略可以保护多个后端吗？','可以，一个策略可关联多个 backend service；同一 backend service 不能同时关联两个同类型 backend policy 或两个 edge policy。'],
 ['Standard 是否也有 DDoS 防护？','有。Standard 包含外部 Application LB / proxy NLB 的 always-on L3/L4 网络与协议型 DDoS 防护；高级网络端点能力及更完整服务在 Enterprise。'],
 ['Annual 的 DDoS 账单保护会自动免单吗？','不会。它受资格、攻击验证、覆盖 SKU 和申请流程约束，符合条件时通常提供未来使用额度，并非自动冲销所有当前费用。'],
 ['价格怎么估？','先统计策略数、规则数、global/regional 请求量；再与 Enterprise 的项目数、受保护资源数和订阅条件对比。价格会变化，应使用官方价格页做最终核算。'],
 ['配额不够怎么办？','可调整 quota 通常能申请提升；system limits 固定不能变。重大活动或迁移前应提前从 Cloud Quotas 检查并申请。'],
 ['Terraform 能管理吗？','可以把策略、规则和关联纳入 IaC。建议通过评审、preview、分阶段强制和回滚流程控制变更，避免控制台与代码双向漂移。']
];

const grid=document.querySelector('#problem-grid');
grid.innerHTML=problems.map(p=>`<button class="problem" data-id="${p.id}"><strong>${p.title}</strong><span>${p.hint}</span></button>`).join('');
function renderAnswer(id){
  const p=problems.find(x=>x.id===id);
  document.querySelectorAll('.problem').forEach(x=>x.classList.toggle('selected',x.dataset.id===id));
  const box=document.querySelector('#answer'); box.className='answer show';
  box.innerHTML=`<div class="answer-head"><span class="answer-mark">✓</span><h3>建议这样回答客户</h3></div><p>${p.answer}</p><div class="next-steps">${p.steps.map((x,i)=>`<div class="next-step"><b>第 ${i+1} 步</b><strong>${x[0]}</strong><span>${x[1]}</span></div>`).join('')}</div><p class="solution-tools"><strong>继续下钻：</strong>${p.tools.map(id=>`<a href="product.html?service=${id}">${topics[id].name}</a>`).join('')}</p>`;
}
grid.addEventListener('click',e=>{const b=e.target.closest('[data-id]');if(b)renderAnswer(b.dataset.id)}); renderAnswer('ddos');

document.querySelector('#expert-list').innerHTML=Object.entries(topics).map(([id,x],i)=>`<a class="expert-card" href="product.html?service=${id}"><span>${String(i+1).padStart(2,'0')}</span><div><strong>${x.name}</strong><small>${x.label}</small></div><em>查看手册</em></a>`).join('');

const faqList=document.querySelector('#faq-list'); const faqCount=document.querySelector('#faq-count');
function renderFaq(q=''){
  const needle=q.trim().toLowerCase(); const filtered=faqs.filter(x=>(x[0]+x[1]).toLowerCase().includes(needle));
  faqList.innerHTML=filtered.map((x,i)=>`<details><summary><span>${String(i+1).padStart(2,'0')}</span>${x[0]}</summary><p>${x[1]}</p></details>`).join('') || '<p class="empty">没有匹配的问题，请换一个关键词。</p>';
  faqCount.textContent=`${filtered.length} / ${faqs.length} 条`;
}
document.querySelector('#faq-search').addEventListener('input',e=>renderFaq(e.target.value)); renderFaq();
