"use client";

import React from 'react';

// 1. الواجهات البرمجية
export interface Booth {
  id?: string;
  label: string;
  category: string;
  area: number;
  price: number;
}

export interface ContractProps {
  companyName: string;
  crNumber: string;
  address: string;
  contactPerson: string;
  jobTitle: string;
  mobile: string;
  phone?: string;
  email: string;
  booths: Booth[];
  bookingRef?: string;
  exhibits?: string; // المعروضات
  sponsorshipLevel?: string; // مستوى الرعاية
}

/**
 * دالة التصدير الاحترافية (Print PDF)
 */
export const exportToPDF = () => {
  window.print();
};

export const ContractTemplate: React.FC<ContractProps> = (props) => {
  const autoCalculatedArea = props.booths.reduce((acc, booth) => acc + booth.area, 0);
  const autoCalculatedPrice = props.booths.reduce((acc, booth) => acc + booth.price, 0);

  const sponsorshipLevels = [
    { en: 'Platinum', ar: 'بلاتيني' },
    { en: 'Diamond', ar: 'ماسي' },
    { en: 'Golden', ar: 'ذهبي' },
    { en: 'Silver', ar: 'فضي' },
    { en: 'Co-Sponsor', ar: 'مشارك' },
    { en: 'Supportive', ar: 'داعم' },
    { en: 'Strategic', ar: 'استراتيجي' },
    { en: 'Media', ar: 'إعلامي' }
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap');
        
        #contract-print-layer {
          font-family: 'Cairo', sans-serif !important;
          color: #1e293b;
          background: white;
          width: 210mm;
          min-height: 297mm;
          margin: auto;
          box-sizing: border-box;
          padding: 10mm; /* Narrow padding to fit one page */
          position: relative;
        }

        /* التصميم الملون والاحترافي */
        .brand-navy { color: #003366; }
        .brand-orange { color: #f97316; }
        .bg-navy { background-color: #003366 !important; color: white !important; -webkit-print-color-adjust: exact; }
        .bg-orange { background-color: #f97316 !important; color: white !important; -webkit-print-color-adjust: exact; }
        .bg-light-grey { background-color: #f8fafc !important; -webkit-print-color-adjust: exact; }

        @media screen {
          #contract-print-layer {
            display: none !important;
          }
        }

        @media print {
          body * { visibility: hidden; }
          #contract-print-layer, #contract-print-layer * {
            visibility: visible;
          }
          #contract-print-layer {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            margin: 0;
            padding: 8mm; /* Extra compact for single page */
            height: 100%;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }

        .c-table { width: 100%; border-collapse: collapse; margin-top: 3px; margin-bottom: 5px; border: 1px solid #e2e8f0; }
        .c-table td, .c-table th { border: 1px solid #cbd5e1; padding: 5px 10px; font-size: 11px; }
        .c-label { font-weight: bold; background-color: #f1f5f9; width: 22%; color: #475569; }
        .c-data { text-align: center; font-weight: 700; width: 56%; font-size: 11.5px; color: #0f172a; }
        
        .c-checkbox { display: inline-flex; align-items: center; justify-content: center; width: 12px; height: 12px; border: 1.5px solid #003366; margin: 0 4px; vertical-align: middle; font-size: 9px; font-weight: bold; color: #003366; background-color: white;}
        .c-checkbox.checked { background-color: #003366; color: white; }
        .c-checkbox.checked::after { content: "X"; font-size: 10px;}
        
        .section-header { 
           background: linear-gradient(to right, #003366, #1e40af); 
           color: white; 
           padding: 4px 12px; 
           font-weight: 800; 
           display: flex; 
           justify-content: space-between; 
           margin-top: 10px; 
           font-size: 11px; 
           border-radius: 4px;
           -webkit-print-color-adjust: exact;
        }
        
        .signature-box { border: 1px solid #e2e8f0; background: #fcfcfc; padding: 12px; border-radius: 6px; }
        .signature-row { display: flex; justify-content: space-between; margin-bottom: 15px; font-size: 10.5px; align-items: flex-end; }
        .signature-line { border-bottom: 1px dashed #94a3b8; flex-grow: 1; margin: 0 10px; }
        
        .divider { height: 3px; background: linear-gradient(90deg, #f97316 0%, #003366 100%); margin: 10px 0; -webkit-print-color-adjust: exact; }
      `}} />

      <div id="contract-print-layer" dir="ltr">
        {/* Superior Header with Logo and Contacts */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '5px' }}>
          <div style={{ textAlign: 'left', width: '35%' }} dir="ltr">
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#003366' }}>RIYADH CONTRACTORS EXHIBITION 2026</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>✉ contact@gren-pro.com</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>📞 +966 590 401 777</div>
          </div>
          
          <div style={{ textAlign: 'center', width: '30%' }}>
            <img 
              src="/images/exhibition-logo.png" 
              alt="Logo" 
              style={{ height: '55px', objectFit: 'contain' }} 
            />
          </div>

          <div style={{ textAlign: 'right', width: '35%' }} dir="rtl">
            <div style={{ fontWeight: '900', fontSize: '13px', color: '#003366' }}>معرض مقاولين الرياض ٢٠٢٦م</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>البريد: contact@gren-pro.com</div>
            <div style={{ fontSize: '9px', color: '#64748b' }}>هاتف: ٧٧٧ ١٧٧ ٥٩٠ ٩٦٦ +</div>
          </div>
        </div>

        <div className="divider"></div>

        <div style={{ textAlign: 'center', margin: '10px 0' }}>
          <h1 style={{ fontWeight: '900', fontSize: '16px', color: '#003366', margin: '0' }}>
            عقد الرعاية والمشاركة في المعرض
          </h1>
          <h2 style={{ fontWeight: '700', fontSize: '11px', color: '#f97316', margin: '3px 0' }}>
            SPONSORSHIP AND PARTICIPATION CONTRACT
          </h2>
        </div>

        {/* 1. Client Table - Colored Labels */}
        <table className="c-table">
          <tbody>
            {[
              { en: 'Entity Name', val: props.companyName, ar: 'اسم الجهة' },
              { en: 'Unified Number', val: props.crNumber, ar: 'الرقم الموحد' },
              { en: 'Contact Person', val: props.contactPerson, ar: 'المسؤول' },
              { en: 'Email', val: props.email, ar: 'البريد الالكتروني' },
              { en: 'Mobile / Phone', val: `${props.mobile} / ${props.phone || '-'}`, ar: 'الجوال / الهاتف' }
            ].map((row, i) => (
              <tr key={i}>
                <td className="c-label" dir="ltr">{row.en} :</td>
                <td className="c-data bg-light-grey">{row.val || '................................'}</td>
                <td className="c-label" style={{ textAlign: 'right' }} dir="rtl">:{row.ar}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* 2. Sponsorship - Colorful Badge Grid */}
        <div className="section-header">
           <span dir="ltr">SPONSORSHIP LEVELS</span>
           <span dir="rtl">مستويات الرعاية والتميز</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', border: '1px solid #e2e8f0', borderTop: 'none', padding: '8px' }}>
          {sponsorshipLevels.map((level) => {
            const isChecked = props.sponsorshipLevel === level.en;
            return (
              <div key={level.en} style={{ fontSize: '9px', padding: '4px', display: 'flex', flexDirection: 'column', alignItems: 'center', border: '0.5px solid #f1f5f9' }}>
                <span className={`c-checkbox ${isChecked ? 'checked' : ''}`}></span>
                <span style={{ fontWeight: isChecked ? 'bold' : 'normal', marginTop: '2px', color: isChecked ? '#f97316' : '#64748b' }}>{level.ar}</span>
                <span style={{ fontSize: '8px' }}>{level.en}</span>
              </div>
            );
          })}
        </div>

        {/* 3. Participation - Professional Table */}
        <div className="section-header">
           <span dir="ltr">PARTICIPATION DETAILS</span>
           <span dir="rtl">تفاصيل المساحات المحجوزة</span>
        </div>
        <table className="c-table" style={{ textAlign: 'center' }}>
          <thead className="bg-navy">
            <tr>
              <th style={{ fontSize: '10px' }}>Booth ID / رقم البوث</th>
              <th style={{ fontSize: '10px' }}>Category / الفئة</th>
              <th style={{ fontSize: '10px' }}>Area / المساحة</th>
              <th style={{ fontSize: '10px' }}>Amount / المبلغ المالي</th>
            </tr>
          </thead>
          <tbody>
            {props.booths.map((booth, i) => (
              <tr key={i}>
                <td style={{ fontWeight: 'bold' }}>{booth.label}</td>
                <td style={{ fontSize: '10px' }}>
                  {booth.category === 'Shell Stand' ? 'مساحة عرض مجهزة / Shell Stand' : booth.category}
                </td>
                <td style={{ fontWeight: 'bold' }}>{booth.area} m²</td>
                <td style={{ fontWeight: 'bold', color: '#003366', direction: 'ltr' }}>
                   {booth.price.toLocaleString()} SAR
                </td>
              </tr>
            ))}
            <tr className="bg-light-grey">
              <td colSpan={2} style={{ fontWeight: '900', fontSize: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                   <span dir="ltr">GRAND TOTAL</span>
                   <span dir="rtl">الإجمالي الكلي</span>
                </div>
              </td>
              <td style={{ fontWeight: '900', color: '#f97316' }}>{autoCalculatedArea} m²</td>
              <td className="bg-orange" style={{ fontWeight: '900', fontSize: '13px', direction: 'ltr' }}>
                {autoCalculatedPrice.toLocaleString()} SAR
              </td>
            </tr>
          </tbody>
        </table>

        {/* 4. Terms - Compressed but Readable */}
        <div className="section-header" style={{ background: '#f8fafc', color: '#003366', border: '1px solid #e2e8f0' }}>
           <span dir="ltr" style={{ fontWeight: '900' }}>Terms & Conditions</span>
           <span dir="rtl" style={{ fontWeight: '900' }}>الشروط والأحكام العامة</span>
        </div>
        <div style={{ border: '1px solid #e2e8f0', borderTop: 'none', padding: '8px', fontSize: '9px', lineHeight: '1.4', display: 'flex', gap: '20px' }}>
            <div style={{ width: '50%' }} dir="ltr">
              <ol style={{ paddingLeft: '15px', margin: 0 }}>
                <li>Contract is binding once signed and full payment is required to confirm.</li>
                <li>The organizer is not responsible for lost items or damage to exhibits.</li>
                <li>Cancellation follows the policy specified in the general exhibition rules.</li>
              </ol>
            </div>
            <div style={{ width: '50%', color: '#475569' }} dir="rtl">
              <ol style={{ paddingRight: '15px', margin: 0 }}>
                <li>يعتبر العقد ملزماً بعد التوقيع، ويجب سداد الرسوم لتأكيد الحجز.</li>
                <li>المنظم غير مسؤول عن المعروضات أو المفقودات الشخصية للعارضين.</li>
                <li>تطبق شروط الإلغاء الموجودة في الدليل العام للمشاركة في المعرض.</li>
              </ol>
            </div>
        </div>

        {/* 5. Signatures - Premium Look */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginTop: '12px' }}>
          <div className="signature-box">
             <div style={{ borderBottom: '2px solid #f97316', paddingBottom: '3px', marginBottom: '10px', fontWeight: '900', fontSize: '12px' }}>
                <span dir="ltr">EXHIBITOR (العارض)</span>
             </div>
             <div className="signature-row">
               <span style={{ fontWeight: 'bold' }}>Rep:</span>
               <span className="signature-line"></span>
             </div>
             <div className="signature-row" style={{ marginBottom: '8px' }}>
               <span style={{ fontWeight: 'bold' }}>Sign:</span>
               <span className="signature-line"></span>
             </div>
             <div style={{ display: 'flex', alignItems: 'center', height: '50px', border: '1px dashed #cbd5e1', borderRadius: '4px', justifyContent: 'center', color: '#94a3b8', fontSize: '10px' }}>
                STAMP / الختم
             </div>
          </div>

          <div className="signature-box" style={{ background: '#edf2f7' }}>
             <div style={{ borderBottom: '2px solid #003366', paddingBottom: '3px', marginBottom: '10px', fontWeight: '900', fontSize: '12px' }}>
                <span dir="ltr">ORGANIZER (المنظم)</span>
             </div>
             <div style={{ textAlign: 'center', padding: '10px' }}>
                <div style={{ border: '2px double #003366', color: '#003366', fontWeight: '900', display: 'inline-block', padding: '5px 15px', transform: 'rotate(-5deg)', opacity: 0.3, fontSize: '14px' }}>
                   APPROVED - RC EXPO 2026
                </div>
                <div style={{ marginTop: '15px', fontSize: '10px', fontWeight: 'bold', color: '#1e293b' }}>
                   Booking ID: {props.bookingRef || 'RC-5432'}
                </div>
             </div>
          </div>
        </div>

        {/* Simplified Footer */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '8px', color: '#94a3b8', marginTop: '10px', borderTop: '1px solid #f1f5f9', paddingTop: '5px' }}>
          <span dir="ltr">Generated Electronically - Riyadh Contractors Platform.</span>
          <span dir="rtl">نظام العقود الإلكتروني - منصة معرض مقاولين الرياض ٢٠٢٦م.</span>
        </div>
      </div>
    </>
  );
};

const ContractPreviewApp = () => {
  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      <div style={{ backgroundColor: 'white', padding: '40px', borderRadius: '20px', boxShadow: '0 10px 40px rgba(0,0,0,0.1)', display: 'inline-block', maxWidth: '850px', width: '100%' }}>
        <h1 style={{ marginBottom: '10px', color: '#003366', fontWeight: '900' }}>نظام إصدار العقود الفاخرة</h1>
        <p style={{ fontSize: '14px', color: '#64748b', marginBottom: '30px' }}>تصميم ملون بنظام الصفحة الواحدة - جاهز للطباعة والتحويل لـ PDF.</p>
        
        <ContractTemplate 
          companyName="شركة قرين بروجيكتس للتطوير"
          crNumber="7895045262"
          address="الرياض - طريق الملك فهد"
          contactPerson="عبدالمجيد الضاغني"
          jobTitle="المدير العام"
          mobile="0554767928"
          email="majeed.dane@gmail.com"
          booths={[{ label: 'A7', category: 'Shell Stand', area: 36, price: 15300 }]}
          exhibits="أنظمة وحلول بناء ذكية"
          sponsorshipLevel="Diamond"
          bookingRef="RCX-2026-9824"
        />
        
        <button 
          onClick={exportToPDF}
          style={{ 
            background: 'linear-gradient(to right, #003366, #1e40af)', 
            color: 'white', 
            padding: '16px 50px', 
            borderRadius: '12px', 
            fontWeight: 'bold', 
            border: 'none', 
            cursor: 'pointer',
            fontSize: '18px',
            marginTop: '20px',
            boxShadow: '0 6px 20px rgba(0, 51, 102, 0.3)',
            transition: 'transform 0.2s'
          }}
          onMouseDown={(e) => e.currentTarget.style.transform = 'scale(0.98)'}
          onMouseUp={(e) => e.currentTarget.style.transform = 'scale(1)'}
        >
          استخراج العقد الفاخر (Print PDF)
        </button>
      </div>
    </div>
  );
};

export default ContractPreviewApp;
