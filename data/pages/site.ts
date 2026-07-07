export interface NavigationItem {
  label: string;
  href: string;
}

export interface OptionItem {
  value: string;
  label: string;
}

export type OfficialLink = [label: string, href: string];

export interface ChecklistItem {
  key: string;
  title: string;
  subtitle: string;
  description: string;
  type?: string;
  href?: string;
  linkLabel?: string;
  highlight?: string;
  bankInfo?: boolean;
  itinerary?: boolean;
}

export interface VisaPage {
  country: string;
  countryCode: string;
  formId: string;
  eyebrow: string;
  title: string;
  intro: string;
  updatedAt: string;
  officialNote: string;
  officialLinks: OfficialLink[];
  submitLabel: string;
  checklistTitle: string;
  disclaimer: string;
  pdfName: string;
  checklist: ChecklistItem[];
}

export interface SimplePage {
  eyebrow: string;
  title: string;
  intro: string;
}

export interface PriceCard {
  title: string;
  rows: [label: string, amount: string][];
}

export interface PricingPage extends SimplePage {
  priceCards: PriceCard[];
  notes: string[];
}

export type FaqItem = [question: string, answer: string];

export interface FaqPage extends SimplePage {
  items: FaqItem[];
}

export type DocumentCard = [title: string, text: string, action: string];

export interface DocumentsPage extends SimplePage {
  cards: DocumentCard[];
}

export type ContactPage = SimplePage;

export type BasicFormField = (typeof basicFormFields)[number];

export const whatsappNumber = "60123456789";

export const footerDisclaimer =
  "本网站不是任何大使馆、领事馆、签证中心、VFS、KVAC、移民局或政府机构的官方网站。我们只提供材料准备、申请表填写、预约提醒和代递交协助。签证批准由相关官方机构决定。我们不保证签证批准，不提供假材料。";

export const navigationItems: NavigationItem[] = [
  { label: "首页", href: "/" },
  { label: "日本签证", href: "/japan" },
  { label: "韩国签证", href: "/korean" },
  { label: "服务价格", href: "/pricing" },
  { label: "常见问题", href: "/faq" },
  { label: "联系我们", href: "/contact" }
];

export const visaTypeOptions: OptionItem[] = [
  { value: "tourist", label: "旅游签证" },
  { value: "visit", label: "探亲 / 访友签证" },
  { value: "business", label: "商务签证" }
];

export const passTypeOptions: OptionItem[] = [
  { value: "student_pass", label: "学生签证 Student Pass" },
  { value: "work_pass", label: "工作签证 Work Pass" },
  { value: "dependent_pass", label: "家属签证 Dependent Pass" },
  { value: "malaysian", label: "马来西亚公民" },
  { value: "tourist_pass", label: "短期旅游签证 / Short Social Visit Pass" }
];

export const basicFormFields = [
  "destinationCountry",
  "visaType",
  "fullName",
  "passportNo",
  "nationality",
  "passType",
  "travelDate",
  "email",
  "phone"
] as const;

export const inclusionItems = {
  included: [
    "材料清单生成",
    "申请表填写辅助",
    "材料预审",
    "预约提醒",
    "日本 / 韩国代递交协助",
    "递交后状态提醒",
    "WhatsApp 人工咨询"
  ],
  excluded: [
    "大使馆签证费",
    "翻译费 / 公证费",
    "保险费用",
    "机票和酒店费用",
    "签证批准保证",
    "虚假材料",
    "加急出签承诺"
  ]
};

export interface HomePage {
  eyebrow: string;
  title: string;
  intro: string;
  stats: { title: string; text: string }[];
  services: string[];
  process: [title: string, text: string][];
  advantages: [title: string, text: string][];
}

export const homePage: HomePage = {
  eyebrow: "马来西亚中国留学生专用",
  title: "马来西亚中国留学生日本 / 韩国签证代递交服务",
  intro:
    "专为在马来西亚的中国留学生提供日本、韩国签证资料查询、材料检查、申请表填写、预约提醒和大使馆代递交服务。",
  stats: [
    {
      title: "适用人群",
      text: "持中国护照，当前在马来西亚就读、工作、陪读或合法停留的人群。"
    },
    {
      title: "隐私提醒",
      text: "本演示版本中的资料只保存在你当前浏览器的 localStorage 中，不会上传到任何服务器。"
    }
  ],
  services: [
    "日本签证材料准备与代递交",
    "韩国签证材料准备与代递交",
    "申请表填写辅助",
    "材料清单生成",
    "机票行程单 / 酒店订单协助",
    "WhatsApp 人工咨询"
  ],
  process: [
    ["填写基础资料", "用户选择日本或韩国，填写姓名、护照号、出发日期等基础信息。"],
    ["生成材料清单", "系统根据国家和签证类型生成对应材料清单。"],
    ["WhatsApp 联系人工审核", "用户通过 WhatsApp 联系我们，我们检查材料是否完整。"],
    ["提交护照和材料", "客户将护照原件和材料交给我们，并签署授权书和材料接收单。"],
    ["我们代递交大使馆", "我们按预约时间前往日本 / 韩国相关机构递交资料。"],
    ["通知结果 / 领取护照", "递交后通知客户状态，完成后安排领取或归还护照。"]
  ],
  advantages: [
    ["中文整理官网资料", "解决官网英文资料分散、难理解的问题。"],
    ["适合中国留学生", "主要服务在马来西亚的中国学生、陪读和长期停留人群。"],
    ["材料清单清楚", "按日本 / 韩国不同要求生成对应材料清单。"],
    ["可代递交", "在符合要求和授权的情况下，提供日本 / 韩国签证代递交协助。"],
    ["不提供假材料", "坚持真实资料，不提供假机票、假酒店或虚假证明。"],
    ["WhatsApp 人工跟进", "客户可以通过 WhatsApp 咨询材料问题和递交安排。"]
  ]
};

const sharedChecklist: ChecklistItem[] = [
  {
    key: "passport_original",
    title: "有效护照原件",
    subtitle: "护照有效期与空白页检查",
    description: "请确认护照原件有足够有效期，并保留足够空白签证页。"
  },
  {
    key: "service_entry",
    title: "签证申请资料 / 服务入口",
    subtitle: "填写或确认签证申请资料",
    description: "请根据对应官方机构最新要求准备申请表和支持材料。",
    type: "entry"
  },
  {
    key: "photo",
    title: "近期护照尺寸照片",
    subtitle: "照片规格与实体照片提醒",
    description: "请根据官方最新照片规格准备实体照片。这里可先上传照片预览。"
  },
  {
    key: "passport_copy",
    title: "护照资料页复印件",
    subtitle: "信息必须清晰完整",
    description: "请准备护照个人资料页复印件，信息必须清晰完整。"
  },
  {
    key: "pass_copy",
    title: "有效马来西亚签证 / Pass 复印件",
    subtitle: "Student Pass / ePASS / Visa Pass",
    description: "请提供有效的 Student Pass、ePASS 或其他合法停留证明复印件。"
  },
  {
    key: "flight_plan",
    title: "机票行程或旅行计划",
    subtitle: "可用机票预订单或行程说明",
    description: "可以提供机票预订单、旅行计划或预计出入境日期。不要提供虚假资料。",
    highlight: "本站可协助代购真实机票订单，RM10 / 项。"
  },
  {
    key: "hotel_booking",
    title: "酒店预订或住宿资料",
    subtitle: "酒店订单、住宿地址或邀请人住宿资料",
    description: "可以提供酒店预订单、住宿地址，或邀请人住宿信息。",
    highlight: "本站可协助代购真实酒店订单，RM10 / 项。"
  },
  {
    key: "bank_statement",
    title: "银行流水或资金证明",
    subtitle: "近 3 至 6 个月流水或资金证明",
    description: "建议准备近 3 至 6 个月银行流水或其他资金证明。",
    bankInfo: true
  },
  {
    key: "itinerary",
    title: "旅行行程表",
    subtitle: "填写每日城市、住宿和活动安排",
    description: "请填写每日城市、住宿和活动安排，生成后可直接查看表格。",
    itinerary: true
  }
];

export const visaPages: { japan: VisaPage; korea: VisaPage } = {
  japan: {
    country: "日本",
    countryCode: "japan",
    formId: "japanForm",
    eyebrow: "日本签证服务",
    title: "日本签证代递交服务",
    intro: "专为在马来西亚的中国留学生提供日本签证材料检查、申请表填写、预约提醒和代递交服务。",
    updatedAt: "2026-07-04",
    officialNote: "最终要求请以日本驻马来西亚大使馆 / 领事馆官方信息为准。",
    officialLinks: [
      ["日本驻马来西亚大使馆官网", "https://www.my.emb-japan.go.jp/"],
      ["日本签证预约 / 签证资料页面", "https://malaysia.rsvsys.jp/"]
    ],
    submitLabel: "生成日本材料清单",
    checklistTitle: "日本签证递交前材料核对",
    disclaimer: "本网站不是日本大使馆或任何官方机构的网站。最终要求请以日本驻马来西亚官方机构最新通知为准。",
    pdfName: "Japan_Visa_Documents.pdf",
    checklist: sharedChecklist.map((item) =>
      item.key === "service_entry"
        ? {
            ...item,
            description: "点击下方按钮进入日本签证申请表填写页面。填写完成后可以生成 PDF。",
            href: "/japan-form",
            linkLabel: "填写日本签证申请表"
          }
        : item.key === "itinerary"
          ? { ...item, title: "日本停留行程表" }
          : item
    )
  },
  korea: {
    country: "韩国",
    countryCode: "korea",
    formId: "koreaForm",
    eyebrow: "韩国签证服务",
    title: "韩国签证代递交服务",
    intro: "专为在马来西亚的中国留学生提供韩国签证材料检查、申请表辅助、预约提醒和吉隆坡代递交服务。",
    updatedAt: "2026-07-04",
    officialNote: "最终要求请以韩国驻马来西亚大使馆官方信息为准。",
    officialLinks: [
      ["韩国驻马来西亚大使馆官网", "https://my.mofa.go.kr/"],
      ["韩国签证公告 / 预约说明页面", "https://www.g4k.go.kr/en/main.do"]
    ],
    submitLabel: "生成韩国材料清单",
    checklistTitle: "韩国签证材料清单",
    disclaimer: "本网站不是韩国大使馆、KVAC 或任何官方签证中心的网站。最终要求请以韩国驻马来西亚官方机构最新通知为准。",
    pdfName: "Korea_Visa_Documents.pdf",
    checklist: sharedChecklist.map((item) =>
      item.key === "service_entry"
        ? {
            ...item,
            type: "info",
            subtitle: "跳转到韩国签证服务页面查看申请资料要求",
            description: "韩国签证申请表和材料要求请根据韩国驻马来西亚大使馆最新要求准备。"
          }
        : item.key === "itinerary"
          ? { ...item, title: "韩国旅行行程表" }
          : item
    )
  }
};

export const simplePages: {
  pricing: PricingPage;
  faq: FaqPage;
  documents: DocumentsPage;
  contact: ContactPage;
} = {
  pricing: {
    eyebrow: "服务收费",
    title: "签证准备收费",
    intro:
      "以下价格为服务费，不包括任何大使馆签证费、翻译费、公证费、保险、机票或酒店费用。",
    priceCards: [
      {
        title: "日本签证服务",
        rows: [
          ["文件清单", "RM49"],
          ["申请表填写", "RM79"],
          ["材料预审", "RM99"],
          ["代递交协助", "RM250-350"],
          ["懒人包", "RM350-499 / 人"]
        ]
      },
      {
        title: "韩国签证服务",
        rows: [
          ["文件清单", "RM49"],
          ["申请表填写", "RM79"],
          ["材料预审", "RM99"],
          ["代递交协助", "RM250-350"],
          ["懒人包", "RM300-499 / 人"]
        ]
      }
    ],
    notes: [
      "以上价格为服务费，不包括大使馆签证费、翻译、公证、保险、银行文件费、机票或酒店预订单费用。",
      "我们不是任何大使馆、领事馆、签证中心、移民局或政府机构。",
      "签证结果由相关官方机构决定。",
      "我们不保证签证批准。",
      "不要写假机票，不要写假酒店，不要提供虚假材料。",
      "如客户要求单人专程递交，可能产生额外交通服务费。"
    ]
  },
  faq: {
    eyebrow: "FAQ",
    title: "常见问题 FAQ",
    intro:
      "以下内容用于帮助你快速了解日本 / 韩国签证代递交服务的常见问题，最终要求仍以官方机构为准。",
    items: [
      ["中国留学生可以在马来西亚申请日本或韩国签证吗？", "通常需要持有有效的马来西亚长期停留身份，例如 Student Pass / ePASS。最终是否可申请以对应大使馆要求为准。"],
      ["日本签证可以代递交吗？", "可以提供材料准备和代递交协助，但通常需要申请人提供授权书原件，并以日本官方要求为准。"],
      ["韩国签证可以代递交吗？", "可以提供韩国签证材料准备和吉隆坡代递交协助，具体递交要求以韩国驻马来西亚大使馆最新公告为准。"],
      ["我是否需要交护照原件？", "多数签证申请需要护照原件用于递交或核验。我们收到护照后会提供材料接收单。"],
      ["签证多久出结果？", "不同国家和申请类型处理时间不同。我们可以提供流程提醒，但不能控制大使馆处理速度。"],
      ["被拒签会退款吗？", "签证结果由官方机构决定。我们的服务费主要用于材料准备、审核、预约和代递交服务，是否退款以服务协议为准。"],
      ["Student Pass 快过期还能申请吗？", "需要根据签证国家要求判断。一般建议 Student Pass 保持足够有效期后再申请。"],
      ["银行流水需要多少？", "不同国家和个案要求不同。一般建议准备近 3 至 6 个月流水和足够余额，最终以官方要求为准。"],
      ["机票和酒店订单需要真实吗？", "必须提供真实资料。我们不提供假机票、假酒店或虚假材料。"],
      ["你们是不是官方机构？", "不是。我们不是任何大使馆、领事馆、签证中心、VFS、KVAC、移民局或政府机构。我们只提供材料准备、申请表填写、预约提醒和代递交协助。"]
    ]
  },
  documents: {
    eyebrow: "文件模板",
    title: "常用文件模板",
    intro:
      "以下模板页面用于整理代递交服务常用文件，按钮暂时保留占位链接，后续你可以自行替换成正式下载地址。",
    cards: [
      ["授权书 Authorization Letter", "用于客户授权我们代为递交或领取材料。", "下载模板"],
      ["护照与材料接收单", "用于记录客户交给我们的护照、照片、银行流水、申请表等材料。", "下载模板"],
      ["服务协议", "说明服务内容、服务费、退款规则和免责声明。", "下载模板"],
      ["护照领取签收单", "客户领取护照时签字确认。", "下载模板"],
      ["隐私政策", "说明客户资料如何收集、使用、保存和删除。", "查看模板"]
    ]
  },
  contact: {
    eyebrow: "咨询入口",
    title: "联系我们",
    intro:
      "如果你需要日本或韩国签证材料检查、申请表填写或代递交服务，可以通过 WhatsApp 联系我们。"
  }
};
