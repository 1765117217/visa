"use client";

import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type ReactNode,
  type SelectHTMLAttributes
} from "react";

import { homePage, passTypeOptions, visaTypeOptions } from "@/data/pages/site";
import {
  fetchCurrentProfile,
  syncBasicDataToProfile
} from "@/lib/profile/client";
import { mergeProfileIntoBasicData, type BasicVisaData } from "@/lib/profile/forms";

const STORAGE_KEY = "visamate_basic_data";
const PREFILL_FLAG = "visamate_allow_prefill";
const PROFILE_PREFILL_FIELDS = [
  "email",
  "fullName",
  "nationality",
  "phone",
  "passType",
  "visaType"
];

const initialForm: BasicVisaData = {
  destinationCountry: "",
  visaType: "",
  fullName: "",
  passportNo: "",
  nationality: "",
  passType: "",
  travelDate: "",
  email: "",
  phone: "",
  notes: ""
};

export default function HomePageClient() {
  const formSectionRef = useRef<HTMLElement | null>(null);
  const [form, setForm] = useState<BasicVisaData>(initialForm);

  useEffect(() => {
    let isMounted = true;

    async function hydrateProfile() {
      let savedData = null;
      const raw = localStorage.getItem(STORAGE_KEY);

      if (raw) {
        try {
          savedData = JSON.parse(raw);
        } catch {
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      const profile = await fetchCurrentProfile();
      if (!isMounted) return;

      const nextForm = {
        ...initialForm,
        ...(savedData || {})
      };

      setForm(
        mergeProfileIntoBasicData(nextForm, profile || {}, {
          preferProfileFields: PROFILE_PREFILL_FIELDS
        })
      );
    }

    void hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { id, value } = event.target;
    setForm((current) => ({ ...current, [id]: value }));
  }

  function selectDestination(country: string) {
    setForm((current) => ({ ...current, destinationCountry: country }));
    formSectionRef.current?.scrollIntoView({ behavior: "smooth" });
  }

  function clearForm() {
    setForm(initialForm);
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(PREFILL_FLAG);
    sessionStorage.removeItem("visamate_open_japan_form");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = {
      ...form,
      fullName: (form.fullName || "").trim(),
      passportNo: (form.passportNo || "").trim(),
      nationality: (form.nationality || "").trim(),
      email: (form.email || "").trim(),
      phone: (form.phone || "").trim(),
      notes: (form.notes || "").trim()
    };

    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(PREFILL_FLAG, "1");
    await syncBasicDataToProfile(data);
    window.location.href = data.destinationCountry === "日本" ? "/japan" : "/korean";
  }

  return (
    <main>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">{homePage.eyebrow}</p>
          <h1>{homePage.title}</h1>
          <p className="hero-text">{homePage.intro}</p>
          <div className="hero-actions">
            <button className="btn btn-primary" type="button" onClick={() => selectDestination("日本")}>
              开始日本签证
            </button>
            <button className="btn btn-secondary" type="button" onClick={() => selectDestination("韩国")}>
              开始韩国签证
            </button>
          </div>
          <div className="hero-notice">
            本网站不是任何大使馆、领事馆、签证中心、VFS、KVAC、移民局或政府机构的官方网站。我们只提供材料准备、申请表填写、预约提醒和代递交协助。签证批准由相关官方机构决定。我们不保证签证批准，不提供假材料。
          </div>
        </div>

        <div className="hero-side">
          {homePage.stats.map((stat) => (
            <div className="hero-stat" key={stat.title}>
              <strong>{stat.title}</strong>
              <span>{stat.text}</span>
            </div>
          ))}
        </div>
      </section>

      <Section eyebrow="办理入口" title="服务说明">
        <div className="panel">
          <FeatureList items={homePage.services} />
        </div>
      </Section>

      <Section eyebrow="服务流程" title="代递交服务流程">
        <CardGrid items={homePage.process} className="steps-grid" />
      </Section>

      <Section eyebrow="懒人包" title="懒人包服务说明">
        <InclusionGrid />
      </Section>

      <Section eyebrow="服务优势" title="为什么选择我们？">
        <CardGrid items={homePage.advantages} className="why-grid" />
      </Section>

      <section className="section-shell" id="basicForm" ref={formSectionRef}>
        <div className="section-heading">
          <p className="eyebrow">基础资料</p>
          <h2>生成你的签证材料清单</h2>
        </div>

        <div className="panel">
          <form className="form-layout" onSubmit={handleSubmit}>
            <div className="form-grid">
              <SelectField id="destinationCountry" label="目的国家" value={form.destinationCountry} onChange={updateField} required options={[
                ["日本", "日本"],
                ["韩国", "韩国"]
              ]} />
              <SelectField id="visaType" label="签证类型" value={form.visaType} onChange={updateField} required options={visaTypeOptions.map((item) => [item.value, item.label])} />
              <InputField id="fullName" label="姓名" placeholder="请输入姓名" value={form.fullName} onChange={updateField} required />
              <InputField id="passportNo" label="护照号码" placeholder="例如：E12345678" value={form.passportNo} onChange={updateField} required />
              <InputField id="nationality" label="国籍" placeholder="例如：中国" value={form.nationality} onChange={updateField} required />
              <SelectField id="passType" label="马来西亚签证身份" value={form.passType} onChange={updateField} required options={passTypeOptions.map((item) => [item.value, item.label])} />
              <InputField id="travelDate" label="预计出发日期" type="date" value={form.travelDate} onChange={updateField} required />
              <InputField id="email" label="邮箱" type="email" placeholder="example@email.com" value={form.email} onChange={updateField} />
              <InputField id="phone" label="电话 / WhatsApp" placeholder="+60123456789" value={form.phone} onChange={updateField} />
            </div>

            <div className="field">
              <label htmlFor="notes">备注</label>
              <textarea id="notes" rows={4} placeholder="例如：预计几天行程、是否已有机票酒店、是否需要我们代递交等。" value={form.notes} onChange={updateField} />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                生成材料清单
              </button>
              <button className="btn btn-secondary" type="button" onClick={clearForm}>
                清空表单
              </button>
            </div>
          </form>

          <p className="privacy-note">本演示版本中的资料只保存在你当前浏览器的 localStorage 中，不会上传到任何服务器。</p>
        </div>
      </section>
    </main>
  );
}

function Section({
  eyebrow,
  title,
  children
}: {
  eyebrow: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="section-shell">
      <div className="section-heading">
        <p className="eyebrow">{eyebrow}</p>
        <h2>{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function FeatureList({ items }: { items: string[] }) {
  return (
    <ul className="feature-list">
      {items.map((item) => (
        <li key={item}>{item}</li>
      ))}
    </ul>
  );
}

export function InclusionGrid() {
  return (
    <>
      <div className="inclusion-grid">
        <article className="inclusion-card is-included">
          <h3>包含内容</h3>
          <FeatureList items={["材料清单生成", "申请表填写辅助", "材料预审", "预约提醒", "日本 / 韩国代递交协助", "递交后状态提醒", "WhatsApp 人工咨询"]} />
        </article>
        <article className="inclusion-card is-excluded">
          <h3>不包含内容</h3>
          <FeatureList items={["大使馆签证费", "翻译费 / 公证费", "保险费用", "机票和酒店费用", "签证批准保证", "虚假材料", "加急出签承诺"]} />
        </article>
      </div>
      <div className="inclusion-note">懒人包适合 2–3 人拼单递交。最终价格会根据申请人数、材料复杂度、递交地点和是否需要代领取护照而定。</div>
    </>
  );
}

function CardGrid({ items, className }: { items: [string, string][]; className: string }) {
  return (
    <div className={className}>
      {items.map(([title, text], index) => (
        <article className="step-card" key={title}>
          <span className="step-badge">{index + 1}</span>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
}

function InputField({ id, label, type = "text", ...props }: InputFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} {...props} />
    </div>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  id: string;
  label: string;
  options: [string, string][];
}

function SelectField({ id, label, options, ...props }: SelectFieldProps) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <select id={id} {...props}>
        <option value="">请选择</option>
        {options.map(([value, optionLabel]) => (
          <option value={value} key={value}>
            {optionLabel}
          </option>
        ))}
      </select>
    </div>
  );
}
