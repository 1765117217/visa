import Link from "next/link";

import { simplePages, whatsappNumber, type SimplePage } from "@/data/pages/site";
import FaqAccordion from "@/components/marketing/FaqAccordion";
import ContactForm from "@/components/marketing/ContactForm";

export function PageHero({ page }: { page: SimplePage }) {
  return (
    <section className="page-hero">
      <div className="panel">
        <p className="eyebrow">{page.eyebrow}</p>
        <h1>{page.title}</h1>
        <p className="page-intro">{page.intro}</p>
        {page.title === "联系我们" ? (
          <div className="disclaimer-box">
            本演示版本中的资料只保存在你当前浏览器的 localStorage 中，不会上传到任何服务器。
          </div>
        ) : null}
      </div>
    </section>
  );
}

export function PricingPageContent() {
  const page = simplePages.pricing;

  return (
    <>
      <PageHero page={page} />
      <main className="page-layout">
        <section className="pricing-grid">
          {page.priceCards.map((card) => (
            <article className="price-card" key={card.title}>
              <span className="country-pill">{card.title}</span>
              {card.rows.map(([label, amount]) => (
                <div className="price-row" key={`${card.title}-${label}`}>
                  <span>{label}</span>
                  <span className="price-amount">{amount}</span>
                </div>
              ))}
            </article>
          ))}
        </section>

        <section className="panel">
          <p className="eyebrow">懒人包说明</p>
          <div className="info-note">
            懒人包适合 2–3 人拼单递交。最终价格会根据申请人数、递交地点、材料复杂度，以及是否需要代领取护照而定。
          </div>
        </section>

        <section className="panel">
          <p className="eyebrow">可选附加服务</p>
          {[
            ["真实机票订单协助", "RM10 / 项"],
            ["真实酒店订单协助", "RM10 / 项"],
            ["单人专程递交附加费", "视交通和时间另行报价"],
            ["代领取护照协助", "视地点和时间另行报价"],
            ["材料打印 / 复印", "按实际页数收费"]
          ].map(([label, amount]) => (
            <div className="price-row" key={label}>
              <span>{label}</span>
              <span className="price-amount">{amount}</span>
            </div>
          ))}
        </section>

        <section className="panel">
          <p className="eyebrow">重要备注</p>
          <ul className="price-list">
            {page.notes.map((note) => (
              <li key={note}>{note}</li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
}

export function FaqPageContent() {
  const page = simplePages.faq;

  return (
    <>
      <PageHero page={page} />
      <main className="page-layout">
        <section className="panel">
          <FaqAccordion items={page.items} />
        </section>

        <section className="faq-cta">
          <h2>还有其他问题？</h2>
          <p>如果你想进一步确认材料要求、递交安排或授权文件，可以直接通过 WhatsApp 联系我们。</p>
          <div className="quick-links">
            <a className="btn btn-whatsapp" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
              联系 WhatsApp 咨询
            </a>
            <Link className="btn btn-secondary" href="/documents">
              查看常用文件模板
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}

export function DocumentsPageContent() {
  const page = simplePages.documents;

  return (
    <>
      <PageHero page={page} />
      <main className="page-layout">
        <section className="documents-grid">
          {page.cards.map(([title, text, action]) => (
            <article className="doc-card" key={title}>
              <h3>{title}</h3>
              <p>{text}</p>
              <div className="doc-actions">
                <a className={`btn ${action === "查看模板" ? "btn-secondary" : "btn-primary"}`} href="#">
                  {action}
                </a>
              </div>
            </article>
          ))}
        </section>

        <section className="panel">
          <div className="info-note">以上模板仅为参考，正式使用前建议根据实际业务和当地法律要求修改。</div>
        </section>
      </main>
    </>
  );
}

export function ContactPageContent() {
  const page = simplePages.contact;

  return (
    <>
      <PageHero page={page} />
      <main className="page-layout">
        <div className="contact-grid">
          <section className="contact-panel">
            <div className="wa-box">
              <h2>WhatsApp 联系方式</h2>
              <p>
                当前占位号码：<strong>{whatsappNumber}</strong>
              </p>
              <a className="btn btn-whatsapp" href={`https://wa.me/${whatsappNumber}`} target="_blank" rel="noopener noreferrer">
                打开 WhatsApp
              </a>
            </div>
          </section>

          <section className="contact-panel">
            <h2>联系表单</h2>
            <ContactForm />
          </section>
        </div>
      </main>
    </>
  );
}
