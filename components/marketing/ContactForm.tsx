"use client";

import Link from "next/link";
import {
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
  type InputHTMLAttributes,
  type SelectHTMLAttributes
} from "react";

import { visaTypeOptions, whatsappNumber } from "@/data/pages/site";

const STORAGE_KEY = "visamate_basic_data";
const PREFILL_FLAG = "visamate_allow_prefill";

const serviceOptions = [
  "材料检查",
  "申请表填写",
  "代递交协助",
  "懒人包服务",
  "机票订单协助",
  "酒店订单协助",
  "其他咨询"
];

interface ContactFormValues {
  name: string;
  nationality: string;
  countryApplying: string;
  visaType: string;
  phone: string;
  serviceType: string[];
  message: string;
}

const emptyForm: ContactFormValues = {
  name: "",
  nationality: "",
  countryApplying: "",
  visaType: "",
  phone: "",
  serviceType: [],
  message: ""
};

export default function ContactForm() {
  const [form, setForm] = useState<ContactFormValues>(emptyForm);

  useEffect(() => {
    if (sessionStorage.getItem(PREFILL_FLAG) !== "1") return;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;

    try {
      const data = JSON.parse(raw);
      const visaMap: Record<string, string> = {
        tourist: "旅游签证",
        visit: "探亲 / 访友签证",
        business: "商务签证"
      };
      setForm((current) => ({
        ...current,
        name: data.fullName || "",
        nationality: data.nationality || "",
        countryApplying: data.destinationCountry || "",
        phone: data.phone || "",
        visaType: visaMap[data.visaType] || ""
      }));
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  function updateField(event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) {
    const { id, value } = event.target;
    setForm((current) => ({ ...current, [id]: value }));
  }

  function updateService(event: ChangeEvent<HTMLInputElement>) {
    const { checked, value } = event.target;
    setForm((current) => ({
      ...current,
      serviceType: checked
        ? [...current.serviceType, value]
        : current.serviceType.filter((item) => item !== value)
    }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const selectedServices = form.serviceType.length
      ? form.serviceType.map((item) => `- ${item}`).join("\n")
      : "- 未选择";

    const message = [
      "你好，我想咨询签证材料准备服务。",
      `姓名：${form.name.trim()}`,
      `国籍：${form.nationality.trim()}`,
      `申请国家：${form.countryApplying}`,
      `签证类型：${form.visaType}`,
      `电话 / WhatsApp：${form.phone.trim()}`,
      "我想咨询的服务：",
      selectedServices,
      `留言：${form.message.trim()}`
    ].join("\n");

    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank");
  }

  return (
    <form className="form-layout" onSubmit={handleSubmit}>
      <div className="form-grid">
        <InputField id="name" label="姓名" value={form.name} onChange={updateField} required />
        <InputField id="nationality" label="国籍" value={form.nationality} onChange={updateField} required />
        <SelectField id="countryApplying" label="申请国家" value={form.countryApplying} onChange={updateField} required options={[
          ["日本", "日本"],
          ["韩国", "韩国"]
        ]} />
        <SelectField id="visaType" label="签证类型" value={form.visaType} onChange={updateField} required options={visaTypeOptions.map((item) => [item.label, item.label])} />
        <InputField id="phone" label="电话 / WhatsApp" value={form.phone} onChange={updateField} required />
      </div>

      <div className="field">
        <label>服务类型</label>
        <div className="services-checklist">
          {serviceOptions.map((option) => (
            <label className="service-option" key={option}>
              <input
                type="checkbox"
                name="serviceType"
                value={option}
                checked={form.serviceType.includes(option)}
                onChange={updateService}
              />
              {option}
            </label>
          ))}
        </div>
      </div>

      <div className="field">
        <label htmlFor="message">留言</label>
        <textarea id="message" rows={5} value={form.message} onChange={updateField} required />
      </div>

      <div className="form-actions">
        <button className="btn btn-primary" type="submit">
          通过 WhatsApp 咨询
        </button>
        <Link className="btn btn-secondary" href="/faq">
          查看常见问题
        </Link>
        <Link className="btn btn-secondary" href="/documents">
          查看常用文件模板
        </Link>
      </div>
    </form>
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
