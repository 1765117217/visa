"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import { passTypeOptions, visaTypeOptions, whatsappNumber } from "@/data/pages/site";
import { InclusionGrid } from "@/components/marketing/HomePageClient";
import {
  fetchCurrentProfile,
  syncBasicDataToProfile
} from "@/lib/profile/client.js";
import { mergeProfileIntoBasicData } from "@/lib/profile/forms.js";

const STORAGE_KEY = "visamate_basic_data";
const PREFILL_FLAG = "visamate_allow_prefill";
const PROFILE_PREFILL_FIELDS = [
  "fullName",
  "nationality",
  "phone",
  "passType",
  "visaType"
];

const emptyForm = {
  fullName: "",
  passportNo: "",
  nationality: "",
  passType: "",
  visaType: "",
  travelDate: "",
  email: "",
  phone: ""
};

const labelMaps = {
  visaType: Object.fromEntries(visaTypeOptions.map((item) => [item.value, item.label])),
  passType: Object.fromEntries(passTypeOptions.map((item) => [item.value, item.label]))
};

export default function VisaChecklistPage({ page }) {
  const router = useRouter();
  const [form, setForm] = useState(emptyForm);
  const [resultVisible, setResultVisible] = useState(false);
  const [openCards, setOpenCards] = useState(() => new Set());
  const [checkedItems, setCheckedItems] = useState(() => new Set());
  const [uploads, setUploads] = useState({});
  const [mergeQueue, setMergeQueue] = useState([]);
  const [itineraryRows, setItineraryRows] = useState([
    { date: "", city: "", hotel: "", activity: "" }
  ]);
  const [itineraryVisible, setItineraryVisible] = useState(false);

  const warnings = useMemo(() => buildWarnings(page.country, form), [page.country, form]);
  const progress = Math.round((checkedItems.size / page.checklist.length) * 100);

  useEffect(() => {
    let isMounted = true;

    async function hydrateProfile() {
      let savedData = null;

      if (sessionStorage.getItem(PREFILL_FLAG) === "1") {
        const raw = localStorage.getItem(STORAGE_KEY);

        if (raw) {
          try {
            savedData = JSON.parse(raw);
          } catch {
            localStorage.removeItem(STORAGE_KEY);
          }
        }
      }

      const profile = await fetchCurrentProfile();
      if (!isMounted) return;

      const nextForm = {
        ...emptyForm,
        ...(savedData
          ? {
              fullName: savedData.fullName || "",
              passportNo: savedData.passportNo || "",
              nationality: savedData.nationality || "",
              passType: savedData.passType || "",
              visaType: savedData.visaType || "",
              travelDate: savedData.travelDate || "",
              email: savedData.email || "",
              phone: savedData.phone || ""
            }
          : {})
      };

      setForm(
        mergeProfileIntoBasicData(nextForm, profile || {}, {
          preferProfileFields: PROFILE_PREFILL_FIELDS
        })
      );

      if (savedData && hasMeaningfulData(savedData)) {
        setResultVisible(true);
      }
    }

    void hydrateProfile();

    return () => {
      isMounted = false;
    };
  }, []);

  function updateField(event) {
    const { id, value } = event.target;
    setForm((current) => ({ ...current, [id]: value }));
  }

  function persistForm() {
    const data = {
      ...form,
      destinationCountry: page.country,
      fullName: form.fullName.trim(),
      passportNo: form.passportNo.trim(),
      nationality: form.nationality.trim(),
      email: form.email.trim(),
      phone: form.phone.trim()
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    sessionStorage.setItem(PREFILL_FLAG, "1");
    return data;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const data = persistForm();
    await syncBasicDataToProfile(data);
    setResultVisible(true);
    window.requestAnimationFrame(() => {
      document.getElementById("resultPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function toggleCard(key) {
    setOpenCards((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function toggleCheck(key) {
    setCheckedItems((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function updateUpload(key, fileList) {
    const files = Array.from(fileList || []).filter((file) => isMergeableFile(file));
    const nextUploads = { ...uploads, [key]: files };
    setUploads(nextUploads);
    setMergeQueue(collectMergeableFiles(page.checklist, nextUploads));
  }

  function removeUpload(key) {
    const nextUploads = { ...uploads, [key]: [] };
    setUploads(nextUploads);
    setMergeQueue(collectMergeableFiles(page.checklist, nextUploads));
  }

  function moveMergeItem(index, direction) {
    const targetIndex = index + direction;
    if (targetIndex < 0 || targetIndex >= mergeQueue.length) return;
    setMergeQueue((current) => {
      const next = [...current];
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }

  function removeMergeItem(index) {
    setMergeQueue((current) => current.filter((_, itemIndex) => itemIndex !== index));
  }

  function updateItinerary(index, field, value) {
    setItineraryRows((current) =>
      current.map((row, rowIndex) => (rowIndex === index ? { ...row, [field]: value } : row))
    );
  }

  async function generateCombinedPDF() {
    if (!mergeQueue.length) {
      alert("请先上传至少一个 JPG、PNG 或 PDF 文件。");
      return;
    }

    const { PDFDocument } = await import("pdf-lib");
    const outputPdf = await PDFDocument.create();

    for (const item of mergeQueue) {
      const bytes = new Uint8Array(await item.file.arrayBuffer());

      if (item.file.type === "application/pdf") {
        const sourcePdf = await PDFDocument.load(bytes);
        const copiedPages = await outputPdf.copyPages(sourcePdf, sourcePdf.getPageIndices());
        copiedPages.forEach((copiedPage) => outputPdf.addPage(copiedPage));
        continue;
      }

      const embeddedImage =
        item.file.type === "image/jpeg"
          ? await outputPdf.embedJpg(bytes)
          : await outputPdf.embedPng(bytes);
      const pdfPage = outputPdf.addPage([595.28, 841.89]);
      const scale = Math.min(
        (pdfPage.getWidth() - 40) / embeddedImage.width,
        (pdfPage.getHeight() - 40) / embeddedImage.height
      );
      const width = embeddedImage.width * scale;
      const height = embeddedImage.height * scale;
      pdfPage.drawImage(embeddedImage, {
        x: (pdfPage.getWidth() - width) / 2,
        y: (pdfPage.getHeight() - height) / 2,
        width,
        height
      });
    }

    const pdfBytes = await outputPdf.save();
    const blob = new Blob([pdfBytes], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = page.pdfName;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function openJapanForm(event) {
    event?.preventDefault();
    const data = persistForm();
    await syncBasicDataToProfile(data);
    sessionStorage.setItem("visamate_open_japan_form", "1");
    router.push("/japan-form");
  }

  const activeItineraryRows = itineraryRows.filter(
    (row) => row.date || row.city || row.hotel || row.activity
  );

  return (
    <>
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">{page.eyebrow}</p>
          <h1>{page.title}</h1>
          <p className="page-intro">{page.intro}</p>
          <div className="toolbar-links">
            <Link className="btn btn-secondary" href="/">
              返回首页
            </Link>
            <a className="btn btn-whatsapp" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              联系我们 WhatsApp
            </a>
          </div>
          <div className="official-box">
            <strong>资料更新时间：{page.updatedAt}</strong>
            <p>{page.officialNote}</p>
            <div className="official-links">
              {page.officialLinks.map(([label, href]) => (
                <a className="btn btn-secondary" href={href} target="_blank" rel="noopener noreferrer" key={href}>
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <main className="page-layout">
        <section className="panel">
          <p className="eyebrow">懒人包</p>
          <h2>懒人包服务说明</h2>
          <InclusionGrid />
        </section>

        <section className="panel">
          <form className="form-layout" onSubmit={handleSubmit}>
            <div className="form-grid">
              <InputField id="fullName" label="姓名" value={form.fullName} onChange={updateField} required />
              <InputField id="passportNo" label="护照号码" value={form.passportNo} onChange={updateField} required />
              <InputField id="nationality" label="国籍" value={form.nationality} onChange={updateField} required />
              <SelectField id="passType" label="马来西亚签证身份" value={form.passType} onChange={updateField} required options={passTypeOptions.map((item) => [item.value, item.label])} />
              <SelectField id="visaType" label="签证类型" value={form.visaType} onChange={updateField} required options={visaTypeOptions.map((item) => [item.value, item.label])} />
              <InputField id="travelDate" label="预计出发日期" type="date" value={form.travelDate} onChange={updateField} required />
              <InputField id="email" label="邮箱" type="email" value={form.email} onChange={updateField} />
              <InputField id="phone" label="电话 / WhatsApp" value={form.phone} onChange={updateField} />
            </div>

            <div className="form-actions">
              <button className="btn btn-primary" type="submit">
                {page.submitLabel}
              </button>
              <button className="btn btn-secondary" type="button" onClick={() => window.print()}>
                打印 / 保存材料清单
              </button>
              <a className="btn btn-whatsapp" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                联系我们 WhatsApp
              </a>
              <Link className="btn btn-secondary" href="/">
                返回首页
              </Link>
            </div>
          </form>
        </section>

        {resultVisible ? (
          <section className="checklist-panel" id="resultPanel">
            <HandoverBox />
            <div className="result-grid">
              <div>
                <h2>申请资料摘要</h2>
                <div className="summary-card">
                  <p><strong>姓名：</strong>{form.fullName || "未填写"}</p>
                  <p><strong>护照号码：</strong>{form.passportNo || "未填写"}</p>
                  <p><strong>国籍：</strong>{form.nationality || "未填写"}</p>
                  <p><strong>马来西亚签证身份：</strong>{labelMaps.passType[form.passType] || "未选择"}</p>
                  <p><strong>签证类型：</strong>{labelMaps.visaType[form.visaType] || "未选择"}</p>
                  <p><strong>预计出发日期：</strong>{form.travelDate || "未填写"}</p>
                  <p><strong>邮箱：</strong>{form.email || "未填写"}</p>
                  <p><strong>电话 / WhatsApp：</strong>{form.phone || "未填写"}</p>
                </div>
              </div>
              <div>
                <h2>提醒 / Warning</h2>
                <div className="warning-stack">
                  {warnings.map((warning) => (
                    <div className="warning-card" key={warning}>{warning}</div>
                  ))}
                </div>
              </div>
            </div>

            <div className="checklist-block">
              <div className="progress-box">
                <div className="progress-meta">
                  <span>材料完成度：{checkedItems.size} / {page.checklist.length}</span>
                  <span>{progress}%</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
              <h2>{page.checklistTitle}</h2>
              <div className="accordion-list">
                {page.checklist.map((item, index) => (
                  <ChecklistCard
                    item={item}
                    index={index}
                    key={item.key}
                    isOpen={openCards.has(item.key)}
                    isChecked={checkedItems.has(item.key)}
                    uploads={uploads[item.key] || []}
                    onToggle={() => toggleCard(item.key)}
                    onCheck={() => toggleCheck(item.key)}
                    onUpload={(files) => updateUpload(item.key, files)}
                    onRemoveUpload={() => removeUpload(item.key)}
                    onOpenJapanForm={openJapanForm}
                    itineraryRows={itineraryRows}
                    onAddItinerary={() => setItineraryRows((current) => [...current, { date: "", city: "", hotel: "", activity: "" }])}
                    onUpdateItinerary={updateItinerary}
                    onShowItinerary={() => setItineraryVisible(true)}
                    itineraryVisible={itineraryVisible}
                    activeItineraryRows={activeItineraryRows}
                  />
                ))}
              </div>
            </div>

            <div className="detail-box merge-box">
              <h2>合并{page.country}签证材料为 PDF</h2>
              <div className="file-meta">支持 JPG、PNG、PDF 文件。所有文件只会在你的浏览器本地处理，不会上传到服务器。请不要在公共电脑处理护照、银行流水等敏感文件。</div>
              <ul className="merge-list">
                {mergeQueue.length ? (
                  mergeQueue.map((item, index) => (
                    <li className="merge-item" key={`${item.key}-${item.file.name}-${index}`}>
                      <div className="merge-item-meta">
                        <div className="merge-item-name">{index + 1}. {item.file.name}</div>
                        <div className="merge-item-note">对应材料：{item.title}</div>
                      </div>
                      <div className="merge-item-actions">
                        <button className="mini-btn" type="button" onClick={() => moveMergeItem(index, -1)}>上移</button>
                        <button className="mini-btn" type="button" onClick={() => moveMergeItem(index, 1)}>下移</button>
                        <button className="mini-btn" type="button" onClick={() => removeMergeItem(index)}>删除</button>
                      </div>
                    </li>
                  ))
                ) : (
                  <li className="merge-item">
                    <div className="merge-item-meta">
                      <div className="merge-item-name">暂未添加可合并文件</div>
                      <div className="merge-item-note">请先在材料清单中上传 JPG、PNG 或 PDF 文件。</div>
                    </div>
                  </li>
                )}
              </ul>
              <div className="accordion-actions">
                <button className="btn btn-primary" type="button" onClick={() => void generateCombinedPDF()}>
                  生成合并 PDF
                </button>
              </div>
            </div>

            <div className="disclaimer-box">{page.disclaimer}</div>
          </section>
        ) : null}
      </main>
    </>
  );
}

function ChecklistCard(props) {
  const {
    item,
    index,
    isOpen,
    isChecked,
    uploads,
    onToggle,
    onCheck,
    onUpload,
    onRemoveUpload,
    onOpenJapanForm,
    itineraryRows,
    onAddItinerary,
    onUpdateItinerary,
    onShowItinerary,
    itineraryVisible,
    activeItineraryRows
  } = props;

  return (
    <article className={`accordion-card ${isOpen ? "open" : ""}`}>
      <div className="accordion-header">
        <input className="accordion-check" type="checkbox" checked={isChecked} onChange={onCheck} />
        <div>
          <div className="accordion-title">{index + 1}. {item.title}</div>
          <div className="accordion-subtitle">{item.subtitle}</div>
          {item.highlight ? <div className="helper-green">{item.highlight}</div> : null}
        </div>
        <button className="accordion-toggle" type="button" onClick={onToggle}>
          展开 / 收起
        </button>
      </div>
      <div className="accordion-detail">
        <div className="detail-box">
          <strong>{item.type === "entry" ? "展开说明" : "材料详细说明"}</strong>
          <div>{item.description}</div>
        </div>
        {item.type === "entry" && item.href ? (
          <div className="accordion-actions">
            <Link className="btn btn-primary" href={item.href} onClick={onOpenJapanForm}>
              {item.linkLabel}
            </Link>
          </div>
        ) : null}
        {item.itinerary ? (
          <ItineraryEditor
            rows={itineraryRows}
            onAdd={onAddItinerary}
            onUpdate={onUpdateItinerary}
            onShow={onShowItinerary}
            visible={itineraryVisible}
            activeRows={activeItineraryRows}
          />
        ) : null}
        {!item.itinerary && item.type !== "entry" && item.type !== "info" ? (
          <UploadBox item={item} uploads={uploads} onUpload={onUpload} onRemoveUpload={onRemoveUpload} />
        ) : null}
      </div>
    </article>
  );
}

function UploadBox({ item, uploads, onUpload, onRemoveUpload }) {
  const [bankTemplateVisible, setBankTemplateVisible] = useState(false);
  const [bankDetailVisible, setBankDetailVisible] = useState(false);

  return (
    <>
      {item.bankInfo ? (
        <div className="bank-extra">
          <div className="info-actions">
            <button className="btn btn-secondary" type="button" onClick={() => setBankTemplateVisible((visible) => !visible)}>查看银行流水模板</button>
            <button className="btn btn-secondary" type="button" onClick={() => setBankDetailVisible((visible) => !visible)}>查看详细说明</button>
          </div>
          {bankTemplateVisible ? (
            <div className="detail-box">
              <strong>银行流水建议包含：</strong>
              <ul className="file-list">
                {["申请人姓名", "银行名称", "账号后四位", "最近 3 至 6 个月交易记录", "当前余额", "银行盖章或电子认证信息，如适用"].map((text) => (
                  <li key={text}>{text}</li>
                ))}
              </ul>
            </div>
          ) : null}
          {bankDetailVisible ? (
            <div className="detail-box">不同国家对银行流水要求可能不同，请以对应大使馆官方要求为准。我们可以提供材料预审，但不能保证签证批准。</div>
          ) : null}
        </div>
      ) : null}
      <div className="detail-box upload-box">
        <strong>文件上传框</strong>
        <input className="upload-input" type="file" accept=".jpg,.jpeg,.png,.pdf,image/jpeg,image/png,application/pdf" multiple onChange={(event) => onUpload(event.target.files)} />
        <div className="file-meta">支持 JPG、PNG、PDF，只显示文件名，不会上传到服务器。</div>
        <div className="privacy-mini">仅用于本地预览，不会上传服务器。请勿在公共电脑上传完整护照、银行流水或敏感资料。</div>
        <ul className="file-list">
          {uploads.length ? uploads.map((file) => <li key={file.name}>{file.name}</li>) : <li>暂未选择文件</li>}
        </ul>
        <div className="upload-row">
          <button className="btn btn-danger" type="button" onClick={onRemoveUpload}>删除文件</button>
        </div>
      </div>
    </>
  );
}

function ItineraryEditor({ rows, onAdd, onUpdate, onShow, visible, activeRows }) {
  return (
    <>
      <div className="detail-box">
        <div className="mini-grid">
          {rows.map((row, index) => (
            <ItineraryRow row={row} index={index} key={index} onUpdate={onUpdate} />
          ))}
        </div>
        <div className="itinerary-actions">
          <button className="btn btn-secondary" type="button" onClick={onAdd}>添加一天</button>
          <button className="btn btn-primary" type="button" onClick={onShow}>生成行程表</button>
        </div>
      </div>
      {visible ? (
        <div className="detail-box">
          <div className="itinerary-table-wrap">
            <table className="itinerary-table">
              <thead>
                <tr><th>日期</th><th>城市</th><th>住宿</th><th>活动安排</th></tr>
              </thead>
              <tbody>
                {activeRows.length ? activeRows.map((row, index) => (
                  <tr key={index}>
                    <td>{row.date || "-"}</td>
                    <td>{row.city || "-"}</td>
                    <td>{row.hotel || "-"}</td>
                    <td>{row.activity || "-"}</td>
                  </tr>
                )) : (
                  <tr><td colSpan="4">请先填写至少一天的行程资料。</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </>
  );
}

function ItineraryRow({ row, index, onUpdate }) {
  return (
    <>
      <InputField id={`date-${index}`} label="日期" type="date" value={row.date} onChange={(event) => onUpdate(index, "date", event.target.value)} />
      <InputField id={`city-${index}`} label="城市" placeholder="例如：东京 / 首尔" value={row.city} onChange={(event) => onUpdate(index, "city", event.target.value)} />
      <InputField id={`hotel-${index}`} label="住宿" placeholder="例如：APA Hotel" value={row.hotel} onChange={(event) => onUpdate(index, "hotel", event.target.value)} />
      <InputField id={`activity-${index}`} label="活动安排" placeholder="例如：抵达、入住、观光" value={row.activity} onChange={(event) => onUpdate(index, "activity", event.target.value)} />
    </>
  );
}

function HandoverBox() {
  return (
    <div className="handover-box">
      <h2>护照与材料交接说明</h2>
      <ul className="feature-list">
        {["收到护照和材料后，我们会提供材料接收单。", "递交前会再次核对材料是否完整。", "递交后会向客户发送递交凭证或状态说明。", "我们不会长期保留客户护照。", "客户领取护照时需要签收确认。", "我们不会擅自将客户资料交给无关第三方。", "所有资料仅用于签证材料准备和递交协助。"].map((text) => (
          <li key={text}>{text}</li>
        ))}
      </ul>
    </div>
  );
}

function InputField({ id, label, type = "text", ...props }) {
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <input id={id} type={type} {...props} />
    </div>
  );
}

function SelectField({ id, label, options, ...props }) {
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

function buildWarnings(country, data) {
  const items = [
    "最终要求可能根据你的签证类型和当前马来西亚停留身份而变化，请在递交前再次核对官方通知。",
    "我们可提供材料整理与代递交协助，但不能保证签证批准。"
  ];

  if (country === "日本") {
    items.push("日本签证照片通常需要准备实体照片，并粘贴到申请表指定区域。");
  }

  if (data.passType === "tourist_pass") {
    items.push(`如果你目前仅持短期旅游签证，请先确认自己是否符合在马来西亚本地申请${country}签证的条件。`);
  }

  if (data.passType === "student_pass") {
    items.push("学生申请人通常还需要准备 Student Pass / ePASS 和在读证明。");
  }

  return items;
}

function hasMeaningfulData(data) {
  return Boolean(
    data?.fullName ||
      data?.passportNo ||
      data?.nationality ||
      data?.passType ||
      data?.visaType ||
      data?.travelDate ||
      data?.email ||
      data?.phone
  );
}

function isMergeableFile(file) {
  return file && ["image/jpeg", "image/png", "application/pdf"].includes(file.type);
}

function collectMergeableFiles(checklist, uploads) {
  return checklist.flatMap((item) =>
    (uploads[item.key] || [])
      .filter(isMergeableFile)
      .map((file) => ({ key: item.key, title: item.title, file }))
  );
}
