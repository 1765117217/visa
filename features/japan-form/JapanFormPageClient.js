"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const textFields = [
  ["surnameEn", "input", { left: "27.8%", top: "26.98%", width: "41.5%", height: "1.55%" }],
  ["surnameZh", "input", { left: "76.0%", top: "26.98%", width: "18.5%", height: "1.55%" }],
  ["givenEn", "input", { left: "27.8%", top: "29.05%", width: "41.5%", height: "1.55%" }],
  ["givenZh", "input", { left: "76.0%", top: "29.05%", width: "18.5%", height: "1.55%" }],
  ["otherNameEn", "input", { left: "27.8%", top: "31.12%", width: "41.5%", height: "1.55%" }],
  ["otherNameZh", "input", { left: "76.0%", top: "31.12%", width: "18.5%", height: "1.55%" }],
  ["dob", "input", { left: "23.8%", top: "34.12%", width: "12.5%" }],
  ["birthPlace", "input", { left: "51.8%", top: "34.12%", width: "42.8%" }],
  ["nationality", "input", { left: "25.0%", top: "38.50%", width: "69.5%" }],
  ["previousNationality", "input", { left: "43.0%", top: "40.65%", width: "51.5%" }],
  ["idNumber", "input", { left: "24.0%", top: "42.78%", width: "70.5%" }],
  ["passportNo", "input", { left: "64.5%", top: "45.05%", width: "30.0%" }],
  ["issuePlace", "input", { left: "23.5%", top: "47.50%", width: "44.5%" }],
  ["issueDate", "input", { left: "79.0%", top: "47.18%", width: "14.8%" }],
  ["issueAuthority", "input", { left: "23.5%", top: "49.72%", width: "44.5%" }],
  ["expiryDate", "input", { left: "79.0%", top: "49.40%", width: "14.8%" }],
  ["coeNo", "input", { left: "32.0%", top: "52.22%", width: "18.0%" }],
  ["purpose", "input", { left: "29.5%", top: "54.50%", width: "65.0%" }],
  ["stayFrom", "input", { left: "28.5%", top: "57.15%", width: "14.5%" }],
  ["stayTo", "input", { left: "48.5%", top: "57.15%", width: "16.0%" }],
  ["stayPeriod", "input", { left: "80.5%", top: "57.15%", width: "14.0%" }],
  ["entryPort", "input", { left: "24.0%", top: "59.25%", width: "26.0%" }],
  ["airline", "input", { left: "66.0%", top: "59.25%", width: "28.5%" }],
  ["hotelName", "input", { left: "32.5%", top: "64.10%", width: "37.0%" }],
  ["hotelPhone", "input", { left: "77.0%", top: "64.10%", width: "17.5%" }],
  ["hotelAddress", "textarea", { left: "19.5%", top: "67.08%", width: "75.0%", height: "2.10%" }],
  ["lastVisit", "input", { left: "27.5%", top: "69.65%", width: "67.0%" }],
  ["homeAddress", "textarea", { left: "19.5%", top: "75.05%", width: "75.0%", height: "2.35%" }],
  ["homePhone", "input", { left: "19.5%", top: "78.65%", width: "18.0%" }],
  ["mobile", "input", { left: "46.0%", top: "78.65%", width: "16.0%" }],
  ["email", "input", { left: "19.5%", top: "80.72%", width: "75.0%" }],
  ["employerName", "input", { left: "19.5%", top: "84.90%", width: "50.0%" }],
  ["employerPhone", "input", { left: "76.5%", top: "84.90%", width: "18.0%" }],
  ["employerAddress", "textarea", { left: "19.5%", top: "89.55%", width: "75.0%", height: "2.00%" }],
  ["position", "input", { left: "25.0%", top: "93.30%", width: "69.5%" }],
  ["spouseOccupation", "input", { left: "19.5%", top: "3.90%", width: "74.5%" }, 2],
  ["guarantorNameEn1", "input", { left: "21.0%", top: "10.70%", width: "49.0%" }, 2],
  ["guarantorName", "input", { left: "19.5%", top: "12.65%", width: "50.5%" }, 2],
  ["guarantorPhone", "input", { left: "77.0%", top: "12.65%", width: "17.5%" }, 2],
  ["guarantorNameEn2", "input", { left: "21.0%", top: "15.75%", width: "73.0%" }, 2],
  ["guarantorAddress", "textarea", { left: "19.5%", top: "19.78%", width: "75.0%", height: "2.10%" }, 2],
  ["guarantorDob", "input", { left: "22.6%", top: "23.05%", width: "15.5%" }, 2],
  ["guarantorRelation", "input", { left: "24.0%", top: "25.55%", width: "70.5%" }, 2],
  ["guarantorOccupation", "input", { left: "24.0%", top: "27.77%", width: "70.5%" }, 2],
  ["guarantorNationalityVisa", "input", { left: "34.0%", top: "30.00%", width: "60.5%" }, 2],
  ["inviterName", "input", { left: "21.0%", top: "36.15%", width: "49.5%" }, 2],
  ["inviterPhone", "input", { left: "77.0%", top: "36.15%", width: "17.5%" }, 2],
  ["inviterAddress", "textarea", { left: "19.5%", top: "40.25%", width: "75.0%", height: "2.10%" }, 2],
  ["inviterDob", "input", { left: "22.6%", top: "43.50%", width: "15.5%" }, 2],
  ["inviterRelation", "input", { left: "24.0%", top: "46.02%", width: "70.5%" }, 2],
  ["inviterOccupation", "input", { left: "24.0%", top: "48.28%", width: "70.5%" }, 2],
  ["inviterNationalityVisa", "input", { left: "34.0%", top: "50.55%", width: "60.5%" }, 2],
  ["remarks", "input", { left: "54.0%", top: "52.65%", width: "40.5%" }, 2],
  ["yesExplanation", "textarea", { left: "14.5%", top: "79.05%", width: "77.5%", height: "4.90%" }, 2],
  ["applicationDate", "input", { left: "16.5%", top: "91.78%", width: "21.5%", height: "1.25%" }, 2],
  ["signature", "input", { left: "60.0%", top: "91.78%", width: "28.0%", height: "1.25%" }, 2]
];

const checkboxFields = [
  ["sexMale", { left: "24.9%", top: "36.38%" }, 1, "sex"],
  ["sexFemale", { left: "33.0%", top: "36.38%" }, 1, "sex"],
  ["single", { left: "55.6%", top: "36.38%" }, 1, "marital"],
  ["married", { left: "66.0%", top: "36.38%" }, 1, "marital"],
  ["divorced", { left: "76.2%", top: "36.38%" }, 1, "marital"],
  ["widowed", { left: "87.0%", top: "36.38%" }, 1, "marital"],
  ["passportDiplomatic", { left: "25.2%", top: "45.13%" }, 1, "passport"],
  ["passportOfficial", { left: "34.2%", top: "45.13%" }, 1, "passport"],
  ["passportOrdinary", { left: "43.2%", top: "45.13%" }, 1, "passport"],
  ["passportOther", { left: "52.2%", top: "45.13%" }, 1, "passport"],
  ["guarantorMale", { left: "55.0%", top: "23.22%" }, 2, "guarantorSex"],
  ["guarantorFemale", { left: "63.6%", top: "23.22%" }, 2, "guarantorSex"],
  ["inviterMale", { left: "55.0%", top: "43.66%" }, 2, "inviterSex"],
  ["inviterFemale", { left: "63.6%", top: "43.66%" }, 2, "inviterSex"],
  ["q1yes", { left: "88.3%", top: "56.12%" }, 2, "q1"],
  ["q1no", { left: "94.2%", top: "56.12%" }, 2, "q1"],
  ["q2yes", { left: "88.3%", top: "58.98%" }, 2, "q2"],
  ["q2no", { left: "94.2%", top: "58.98%" }, 2, "q2"],
  ["q3yes", { left: "88.3%", top: "61.95%" }, 2, "q3"],
  ["q3no", { left: "94.2%", top: "61.95%" }, 2, "q3"],
  ["q4yes", { left: "88.3%", top: "66.82%" }, 2, "q4"],
  ["q4no", { left: "94.2%", top: "66.82%" }, 2, "q4"],
  ["q5yes", { left: "88.3%", top: "71.82%" }, 2, "q5"],
  ["q5no", { left: "94.2%", top: "71.82%" }, 2, "q5"],
  ["q6yes", { left: "88.3%", top: "74.70%" }, 2, "q6"],
  ["q6no", { left: "94.2%", top: "74.70%" }, 2, "q6"]
];

const labels = [
  ["日 / 月 / 年", { left: "24.9%", top: "35.15%" }],
  ["省", { left: "67.2%", top: "35.15%" }],
  ["市", { left: "83.0%", top: "35.15%" }],
  ["日 / 月 / 年", { left: "80.4%", top: "48.20%" }],
  ["日 / 月 / 年", { left: "80.4%", top: "50.43%" }],
  ["日 / 月 / 年", { left: "23.0%", top: "24.18%" }, 2],
  ["男", { left: "49.2%", top: "23.28%" }, 2, "big"],
  ["女", { left: "58.8%", top: "23.28%" }, 2, "big"],
  ["日 / 月 / 年", { left: "23.0%", top: "44.62%" }, 2],
  ["男", { left: "49.2%", top: "43.72%" }, 2, "big"],
  ["女", { left: "58.8%", top: "43.72%" }, 2, "big"]
];

const initialValues = Object.fromEntries(textFields.map(([id]) => [id, ""]));
const initialChecks = Object.fromEntries(checkboxFields.map(([id]) => [id, false]));

export default function JapanFormPageClient() {
  const pdfRef = useRef(null);
  const [values, setValues] = useState(initialValues);
  const [checks, setChecks] = useState(initialChecks);
  const [photoSrc, setPhotoSrc] = useState("");
  const [pdfMode, setPdfMode] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem("visamate_open_japan_form") !== "1") return;
    sessionStorage.removeItem("visamate_open_japan_form");

    const savedData = localStorage.getItem("visamate_basic_data");
    if (!savedData) return;

    try {
      const data = JSON.parse(savedData);
      setValues((current) => prefillFromBasicData(current, data));
      setChecks((current) => ({ ...current, passportOrdinary: true }));
    } catch {
      localStorage.removeItem("visamate_basic_data");
    }
  }, []);

  function setValue(id, value) {
    setValues((current) => ({ ...current, [id]: value }));
  }

  function setChecked(id, group, checked) {
    setChecks((current) => {
      const next = { ...current };
      if (checked) {
        checkboxFields.forEach(([fieldId, , , fieldGroup]) => {
          if (fieldGroup === group) next[fieldId] = false;
        });
      }
      next[id] = checked;
      return next;
    });
  }

  function fillSample() {
    setValues((current) => ({
      ...current,
      surnameEn: "ZHANG",
      surnameZh: "ZHANG",
      givenEn: "SAN",
      givenZh: "SAN",
      dob: "01/01/2000",
      birthPlace: "China",
      nationality: "CHINA",
      passportNo: "E12345678",
      issuePlace: "China",
      issueDate: "01/01/2024",
      expiryDate: "01/01/2034",
      purpose: "Tourism",
      stayFrom: "25/07/2026",
      stayTo: "01/08/2026",
      stayPeriod: "8 days",
      entryPort: "Kansai International Airport",
      airline: "Example Airline",
      hotelName: "Hotel in Osaka",
      hotelPhone: "+81-XX-XXXX-XXXX",
      hotelAddress: "Osaka, Japan",
      homeAddress: "Kuala Lumpur, Malaysia",
      mobile: "+60123456789",
      email: "example@email.com",
      employerName: "Example University",
      employerAddress: "Kuala Lumpur, Malaysia",
      position: "Student",
      applicationDate: new Date().toLocaleDateString("en-GB"),
      signature: "ZHANG SAN"
    }));
    setChecks((current) => ({
      ...current,
      sexMale: true,
      sexFemale: false,
      single: true,
      passportOrdinary: true,
      q1no: true,
      q2no: true,
      q3no: true,
      q4no: true,
      q5no: true,
      q6no: true
    }));
  }

  function clearAllFields() {
    setValues(initialValues);
    setChecks(initialChecks);
    setPhotoSrc("");
    localStorage.removeItem("visamate_basic_data");
  }

  function loadPhoto(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (loadEvent) => setPhotoSrc(String(loadEvent.target?.result || ""));
    reader.readAsDataURL(file);
  }

  function printPDF() {
    setPdfMode(true);
    setTimeout(() => {
      window.print();
      setTimeout(() => setPdfMode(false), 700);
    }, 150);
  }

  async function downloadPDF() {
    if (!pdfRef.current) return;

    const [{ default: html2canvas }, jspdfModule] = await Promise.all([
      import("html2canvas"),
      import("jspdf")
    ]);
    const { jsPDF } = jspdfModule;

    setPdfMode(true);
    await new Promise((resolve) => setTimeout(resolve, 200));

    const pdf = new jsPDF("p", "mm", "a4");
    const pages = pdfRef.current.querySelectorAll(".a4-page");

    for (let index = 0; index < pages.length; index += 1) {
      const canvas = await html2canvas(pages[index], {
        scale: 2.4,
        useCORS: true,
        backgroundColor: "#ffffff"
      });
      const imgData = canvas.toDataURL("image/jpeg", 0.98);
      if (index > 0) pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
    }

    pdf.save("Japan_Visa_Application_Form.pdf");
    setPdfMode(false);
  }

  return (
    <div className={pdfMode ? "pdf-mode" : ""}>
      <section className="page-hero">
        <div className="panel">
          <p className="eyebrow">日本签证申请表</p>
          <h1>日本签证申请表辅助填写</h1>
          <p className="page-intro">此页面保留现有日本签证申请表背景定位和 PDF 生成功能。基础资料会自动从 localStorage 带入本页，减少重复输入。</p>
        </div>
      </section>

      <div className="japan-form-toolbar">
        <Link className="dark" href="/japan">返回日本签证页</Link>
        <button className="primary" type="button" onClick={() => void downloadPDF()}>生成 PDF</button>
        <button className="dark" type="button" onClick={printPDF}>打印 / 保存 PDF</button>
        <button className="light" type="button" onClick={fillSample}>填入示例资料</button>
        <button className="danger" type="button" onClick={clearAllFields}>清空表格</button>
        <label className="fake-upload light" htmlFor="photoUpload">上传照片预览</label>
        <input id="photoUpload" className="hidden-file" type="file" accept="image/*" onChange={loadPhoto} />
        <div className="tip">蓝色可编辑区域仅用于填写辅助，导出 PDF 时会自动隐藏。如果“生成 PDF”按钮没有响应，请改用浏览器打印保存。</div>
      </div>

      <main className="japan-form-workspace" ref={pdfRef}>
        <FormPage pageNumber={1} label="第 1 页：申请人、护照、赴日行程、住宿、家庭地址、工作或学习信息" values={values} checks={checks} setValue={setValue} setChecked={setChecked} photoSrc={photoSrc} />
        <FormPage pageNumber={2} label="第 2 页：配偶职业、担保人、邀请人、声明问题、申请日期和签名" values={values} checks={checks} setValue={setValue} setChecked={setChecked} />
      </main>
    </div>
  );
}

function FormPage({ pageNumber, label, values, checks, setValue, setChecked, photoSrc }) {
  return (
    <div className="page-wrap">
      <p className="page-label">{label}</p>
      <section className={`a4-page page-${pageNumber}`}>
        {pageNumber === 1 ? (
          <div className="photo-box">{photoSrc ? <img alt="photo" src={photoSrc} /> : <>实体照片位置<br />4.5cm × 3.5cm<br />请粘贴照片</>}</div>
        ) : null}
        {textFields.filter((field) => (field[3] || 1) === pageNumber).map(([id, type, style]) => {
          const Component = type === "textarea" ? "textarea" : "input";
          return <Component className="f" id={id} key={id} style={style} value={values[id]} onChange={(event) => setValue(id, event.target.value)} />;
        })}
        {checkboxFields.filter((field) => field[2] === pageNumber).map(([id, style, , group]) => (
          <input className="ck" id={id} key={id} type="checkbox" style={style} checked={checks[id]} onChange={(event) => setChecked(id, group, event.target.checked)} />
        ))}
        {labels.filter((item) => (item[2] || 1) === pageNumber).map(([text, style, , variant]) => (
          <span className={`fix-label ${variant || ""}`} style={style} key={`${text}-${style.left}-${style.top}`}>{text}</span>
        ))}
        {pageNumber === 2 ? (
          <div className="fix-declare">本人在此声明：本申请表所填写内容真实无误。最终是否准许入境日本以及在日停留期限，由相关官方机构于入境时决定。</div>
        ) : null}
      </section>
    </div>
  );
}

function prefillFromBasicData(current, data) {
  const next = { ...current };
  if (data.fullName) {
    const nameParts = data.fullName.trim().split(/\s+/);
    if (nameParts.length >= 2) {
      next.surnameEn = nameParts[0].toUpperCase();
      next.givenEn = nameParts.slice(1).join(" ").toUpperCase();
    } else {
      next.givenEn = data.fullName.toUpperCase();
    }
    next.signature = data.fullName.toUpperCase();
  }
  if (data.passportNo) next.passportNo = data.passportNo;
  if (data.nationality) next.nationality = data.nationality;
  if (data.email) next.email = data.email;
  if (data.phone) next.mobile = data.phone;
  if (data.travelDate) next.stayFrom = formatDateToDDMMYYYY(data.travelDate);
  if (data.visaType === "tourist") next.purpose = "Tourism";
  if (data.visaType === "business") next.purpose = "Business";
  if (data.visaType === "visit") next.purpose = "Visit family / friends";
  if (data.passType === "student_pass") {
    next.position = "Student";
    next.employerName = "Example University";
  }
  next.applicationDate = new Date().toLocaleDateString("en-GB");
  return next;
}

function formatDateToDDMMYYYY(dateString) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return dateString;
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${day}/${month}/${date.getFullYear()}`;
}
