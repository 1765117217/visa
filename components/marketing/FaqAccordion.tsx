"use client";

import { useState } from "react";

import type { FaqItem } from "@/data/pages/site";

export default function FaqAccordion({ items }: { items: FaqItem[] }) {
  const [openItems, setOpenItems] = useState<Set<number>>(() => new Set());

  function toggle(index: number) {
    setOpenItems((current) => {
      const next = new Set(current);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }

  return (
    <div className="accordion-list">
      {items.map(([question, answer], index) => (
        <article className={`accordion-card ${openItems.has(index) ? "open" : ""}`} key={question}>
          <div className="accordion-header">
            <div className="step-badge">{index + 1}</div>
            <div>
              <div className="accordion-title">{question}</div>
            </div>
            <button className="accordion-toggle" type="button" onClick={() => toggle(index)}>
              展开 / 收起
            </button>
          </div>
          <div className="accordion-detail">
            <div className="detail-box">{answer}</div>
          </div>
        </article>
      ))}
    </div>
  );
}
