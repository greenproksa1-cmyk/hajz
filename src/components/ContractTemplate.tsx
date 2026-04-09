import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

// يتم استدعاء الخط العربي الأصلي مباشرة من محرك Next.js لحل مشاكل الـ CORS للمتصفح.
import { Cairo } from 'next/font/google';

const cairoFont = Cairo({ 
  subsets: ['arabic', 'latin'], 
  weight: ['400', '600', '700', '900'],
  display: 'swap',
});

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

export const exportToPDF = async (companyName: string) => {
  const element = document.getElementById('official-contract-document');
  if (!element) return;

  try {
    // 1- يجب التوقف هنا للتأكد تماماً من تحميل كافة الخطوط في المتصفح قبل تشغيل أداة الرسم
    if (document.fonts) {
      await document.fonts.ready;
    }
    
    // 2- تأخير ضئيل جداً لضمان قيام المتصفح بإنهاء تنسيق الأحرف العربية (ترابط الحروف)
    await new Promise(resolve => setTimeout(resolve, 800));

    const canvas = await html2canvas(element, {
      scale: 3, 
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
      windowWidth: element.scrollWidth,
      windowHeight: element.scrollHeight
    });

    const imgData = canvas.toDataURL('image/png', 1.0);
    const pdf = new jsPDF({
      orientation: 'p',
      unit: 'mm',
      format: 'a4'
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save(`Riyadh_Contract_${companyName.replace(/\s+/g, '_')}.pdf`);
  } catch (error) {
    console.error("خطأ في تصدير العقد:", error);
  }
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
    <div style={{ position: 'absolute', left: '-9999px', top: 0, zIndex: -1 }}>
      {/* دمج تنسيق cairoFont داخل العنصر الرئيسي */}
      <div 
        id="official-contract-document" 
        className={cairoFont.className}
        style={{ 
          width: '210mm', 
          minHeight: '297mm', 
          padding: '25px',
          backgroundColor: 'white',
          color: 'black',
          boxSizing: 'border-box',
          fontSize: '12px',
          direction: 'ltr' // لضمان ثبات الرسم
        }}
      >
        <style dangerouslySetInnerHTML={{ __html: `
          .c-table { width: 100%; border-collapse: collapse; margin-top: 5px; margin-bottom: 10px; }
          .c-table td { border: 1.5px solid #000; padding: 6px 10px; }
          .c-label { font-weight: bold; background-color: #f0f0f0; width: 25%; }
          .c-data { text-align: center; font-weight: 700; width: 50%; color: #000; font-size: 13px; }
          .c-checkbox { display: inline-flex; align-items: center; justify-content: center; width: 14px; height: 14px; border: 1.5px solid #000; margin: 0 5px; vertical-align: middle; font-size: 10px; font-weight: bold; color: white;}
          .c-checkbox.checked { background-color: #000; }
          .c-checkbox.checked::after { content: "X"; }
          .section-title { background-color: #e2e2e2; border: 1.5px solid #000; padding: 4px 10px; font-weight: 900; display: flex; justify-content: space-between; margin-top: 15px; }
          .signature-row { display: flex; justify-content: space-between; margin-bottom: 30px; font-size: 12px; align-items: flex-end; }
          .signature-line { border-bottom: 1px dashed #000; flex-grow: 1; margin: 0 10px; }
        `}} />

        <div>
          {/* Header */}
          <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '3px solid #000', paddingBottom: '10px' }}>
            <div style={{ textAlign: 'left' }} dir="ltr">
              <div style={{ fontWeight: '900', fontSize: '16px' }}>RIYADH CONTRACTORS EXHIBITION 2026</div>
              <div style={{ fontSize: '10px' }}>Exhibition & Conference Organization</div>
            </div>
            <div style={{ textAlign: 'right' }} dir="rtl">
              <div style={{ fontWeight: '900', fontSize: '16px' }}>معرض مقاولين الرياض ٢٠٢٦م</div>
              <div style={{ fontSize: '10px' }}>لتنظيم المعارض والمؤتمرات</div>
            </div>
          </div>

          <div style={{ textAlign: 'center', margin: '15px 0' }}>
            <div style={{ fontWeight: '900', fontSize: '18px', textDecoration: 'underline' }}>
              عقد الرعاية والمشاركة في معرض مقاولين الرياض 2026
            </div>
            <div style={{ fontWeight: '900', fontSize: '15px', textDecoration: 'underline', marginTop: '4px' }}>
              Sponsorship and Participation Contract in Riyadh Contractors Exhibition 2026
            </div>
          </div>

          {/* Exhibitor Info */}
          <table className="c-table">
            <tbody>
              {[
                { en: 'Name of the entity', val: props.companyName, ar: 'اسم الجهة' },
                { en: 'Unified number', val: props.crNumber, ar: 'الرقم الموحد' },
                { en: 'Address', val: props.address, ar: 'العنوان' },
                { en: 'Responsible person', val: props.contactPerson, ar: 'الشخص المسؤول' },
                { en: 'Job title', val: props.jobTitle, ar: 'الوظيفة' },
                { en: 'Mobile / Telephone', val: `${props.mobile} ${props.phone ? '/ ' + props.phone : ''}`, ar: 'الجوال / الهاتف' },
                { en: 'Email', val: props.email, ar: 'البريد الالكتروني' }
              ].map((row, i) => (
                <tr key={i}>
                  <td className="c-label" style={{ textAlign: 'left', fontSize: '11px' }} dir="ltr">{row.en} :</td>
                  <td className="c-data">{row.val || '......................................'}</td>
                  <td className="c-label" style={{ textAlign: 'right', fontSize: '13px' }} dir="rtl">:{row.ar}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Sponsorship Levels */}
          <div className="section-title">
            <span dir="ltr">Sponsorship Levels</span>
            <span dir="rtl">مستويات الرعاية</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', padding: '15px 10px', border: '1.5px solid #000', borderTop: 'none' }}>
            {sponsorshipLevels.map((level) => {
              const isChecked = props.sponsorshipLevel === level.en;
              return (
                <div key={level.en} style={{ fontSize: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', width: '50%' }} dir="ltr">
                    <span className={`c-checkbox ${isChecked ? 'checked' : ''}`}></span>
                    <b>{level.en}</b>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', width: '50%', justifyContent: 'flex-end' }} dir="rtl">
                    <b>{level.ar}</b>
                    <span className={`c-checkbox ${isChecked ? 'checked' : ''}`}></span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Participation Details */}
          <div className="section-title">
            <span dir="ltr">Participation Details</span>
            <span dir="rtl">تفاصيل المشاركة</span>
          </div>
          <table className="c-table" style={{ textAlign: 'center' }}>
            <thead>
              <tr style={{ backgroundColor: '#f0f0f0' }}>
                <th style={{ border: '1.5px solid #000', padding: '8px' }}>
                  <div dir="ltr" style={{fontSize: '11px'}}>Booth ID</div>
                  <div dir="rtl" style={{fontSize: '12px', fontWeight: 'bold'}}>رقم المساحة</div>
                </th>
                <th style={{ border: '1.5px solid #000', padding: '8px' }}>
                  <div dir="ltr" style={{fontSize: '11px'}}>Category</div>
                  <div dir="rtl" style={{fontSize: '12px', fontWeight: 'bold'}}>الفئة</div>
                </th>
                <th style={{ border: '1.5px solid #000', padding: '8px' }}>
                  <div dir="ltr" style={{fontSize: '11px'}}>Area</div>
                  <div dir="rtl" style={{fontSize: '12px', fontWeight: 'bold'}}>المساحة</div>
                </th>
                <th style={{ border: '1.5px solid #000', padding: '8px', minWidth: '150px' }}>
                  <div dir="ltr" style={{fontSize: '11px'}}>Cost</div>
                  <div dir="rtl" style={{fontSize: '12px', fontWeight: 'bold'}}>القيمة</div>
                </th>
              </tr>
            </thead>
            <tbody>
              {props.booths.map((booth, i) => (
                <tr key={i}>
                  <td style={{ border: '1.5px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{booth.label}</td>
                  <td style={{ border: '1.5px solid #000', fontSize: '12px', fontWeight: 'bold' }}>
                    {booth.category === 'Shell Stand' ? 'مساحة عرض شاملة التجهيزات / Shell Stand' : booth.category}
                  </td>
                  <td style={{ border: '1.5px solid #000', fontWeight: 'bold', fontSize: '13px' }}>{booth.area} m²</td>
                  <td style={{ border: '1.5px solid #000', fontSize: '13px', direction: 'ltr' }}>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                      <b>SAR</b>
                      <b>{booth.price.toLocaleString()}</b>
                      <b dir="rtl">ريال سعودي</b>
                    </div>
                  </td>
                </tr>
              ))}
              <tr style={{ backgroundColor: '#f9f9f9' }}>
                <td colSpan={2} style={{ border: '1.5px solid #000', fontWeight: '900', fontSize: '14px', textAlign: 'center' }}>
                  <span dir="ltr" style={{marginRight: '20px'}}>Total Amount</span>
                  <span dir="rtl">الإجمالي</span>
                </td>
                <td style={{ border: '1.5px solid #000', fontWeight: 'bold', fontSize: '14px' }}>{autoCalculatedArea} m²</td>
                <td style={{ border: '1.5px solid #000', fontSize: '14px', direction: 'ltr' }}>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '5px' }}>
                    <b>SAR</b>
                    <b style={{ color: '#003366' }}>{autoCalculatedPrice.toLocaleString()}</b>
                    <b dir="rtl">ريال سعودي</b>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Terms */}
          <div className="section-title">
            <span dir="ltr">Terms & Conditions</span>
            <span dir="rtl">الشروط والأحكام</span>
          </div>
          <div style={{ border: '1.5px solid #000', borderTop: 'none', padding: '15px 10px', fontSize: '11px', lineHeight: '1.8' }}>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div style={{ width: '50%' }} dir="ltr">
                <ol style={{ paddingLeft: '15px', margin: 0, fontWeight: '600' }}>
                  <li>By signing this application, you agree to the obligations and conditions of participation.</li>
                  <li>The entity is obliged to pay the full amount upon signing this contract.</li>
                  <li>The organizer is not responsible for the contents of the exhibits or any lost items.</li>
                </ol>
              </div>
              <div style={{ width: '50%', textAlign: 'justify' }} dir="rtl">
                <ol style={{ paddingRight: '15px', margin: 0, fontWeight: '700' }}>
                  <li>بتوقيع هذا الطلب، توافق وتلتزم بكافة شروط الاشتراك والقواعد العامة للمعرض.</li>
                  <li>تعتبر الجهة المشاركة ملزمة بدفع كامل المبلغ الموضح أعلاه فور توقيع العقد.</li>
                  <li>إدارة المعرض غير مسؤولة عن محتويات الأجنحة أو المعروضات أو أي مفقودات تخص العارض.</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Signature Block - Full Mirror & Expanded Padding */}
          <div style={{ marginTop: '20px' }}>
            <table className="c-table">
              <tbody>
                <tr>
                  <td style={{ width: '50%', verticalAlign: 'top', padding: '20px 25px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '30px', fontWeight: '900', fontSize: '14px', backgroundColor: '#f0f0f0', padding: '8px 10px', border: '1px solid #ccc' }}>
                      <span dir="ltr">Exhibitor</span>
                      <span dir="rtl">العارض</span>
                    </div>
                    
                    <div className="signature-row">
                      <span dir="ltr" style={{ fontWeight: 'bold' }}>Responsible:</span>
                      <span className="signature-line"></span>
                      <span dir="rtl" style={{ fontWeight: 'bold' }}>:المسؤول</span>
                    </div>
                    
                    <div className="signature-row">
                      <span dir="ltr" style={{ fontWeight: 'bold' }}>Position:</span>
                      <span className="signature-line"></span>
                      <span dir="rtl" style={{ fontWeight: 'bold' }}>:الوظيفة</span>
                    </div>

                    <div className="signature-row">
                      <span dir="ltr" style={{ fontWeight: 'bold' }}>Signature:</span>
                      <span className="signature-line"></span>
                      <span dir="rtl" style={{ fontWeight: 'bold' }}>:التوقيع</span>
                    </div>

                    <div className="signature-row">
                      <span dir="ltr" style={{ fontWeight: 'bold' }}>Date:</span>
                      <span className="signature-line"></span>
                      <span dir="rtl" style={{ fontWeight: 'bold' }}>:التاريخ</span>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '30px', height: '100px', alignItems: 'center' }}>
                      <span dir="ltr" style={{ fontWeight: 'bold' }}>Company Stamp:</span>
                      <div style={{ flexGrow: 1, height: '100%', border: '1px dashed #999', margin: '0 15px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#ccc', fontSize: '15px', fontWeight: 'bold' }}>STAMP HERE</div>
                      <span dir="rtl" style={{ fontWeight: 'bold' }}>:ختم المنشأة</span>
                    </div>
                  </td>
                  <td style={{ width: '50%', verticalAlign: 'top', padding: '20px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', fontWeight: '900', fontSize: '14px', backgroundColor: '#f0f0f0', padding: '8px 10px', border: '1px solid #ccc' }}>
                      <span dir="ltr">Organizer</span>
                      <span dir="rtl">المنظم</span>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '200px' }}>
                      <div style={{ color: '#003366', fontWeight: '900', fontSize: '20px', opacity: 0.25, textAlign: 'center', border: '4px solid #003366', padding: '15px 25px', borderRadius: '10px', transform: 'rotate(-10deg)' }}>
                        <div>RIYADH CONTRACTORS</div>
                        <div>EXHIBITION 2026</div>
                        <div style={{ fontSize: '16px', marginTop: '5px' }}>OFFICIAL APPROVAL</div>
                      </div>
                      <div style={{ marginTop: '30px', fontSize: '13px', fontWeight: 'bold' }}>
                        Ref No: {props.bookingRef || 'BK-XXXXX'}
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#666', marginTop: '15px', borderTop: '1px solid #ccc', paddingTop: '8px' }}>
            <span dir="ltr">This is an official participation contract generated by the electronic system.</span>
            <span dir="rtl">تم إصدار هذا العقد آلياً من خلال النظام الإلكتروني لمنصة المعرض.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const ContractPreviewApp = () => {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    await exportToPDF("Green_Projects_Contract");
    setLoading(false);
  };

  return (
    <div style={{ padding: '40px', textAlign: 'center', backgroundColor: '#f5f5f5', minHeight: '100vh', fontFamily: 'sans-serif' }}>
      <div style={{ backgroundColor: 'white', padding: '30px', borderRadius: '15px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)', display: 'inline-block', maxWidth: '850px', width: '100%' }}>
        <h2 style={{ marginBottom: '10px', color: '#333' }}>نظام إصدار عقود المعرض الاحترافي</h2>
        <p style={{ fontSize: '14px', color: '#666', marginBottom: '30px' }}>معاينة حية للتنسيق المرآتي الثنائي اللغة (Mirror Layout).</p>
        
        <ContractTemplate 
          companyName="شركة قرين بروجيكتس"
          crNumber="7895045262"
          address="الرياض - حي الملز"
          contactPerson="عبدالمجيد الضاغني"
          jobTitle="المدير التنفيذي"
          mobile="0554767928"
          email="majeed.dane@gmail.com"
          booths={[{ label: 'A7', category: 'Shell Stand', area: 36, price: 15300 }]}
          exhibits="أنظمة وحلول بناء ذكية"
          sponsorshipLevel="Diamond"
          bookingRef="RCX-2026-9824"
        />
        
        <button 
          onClick={handleDownload}
          disabled={loading}
          style={{ 
            backgroundColor: loading ? '#666' : '#1a1a1a', 
            color: 'white', 
            padding: '14px 40px', 
            borderRadius: '5px', 
            fontWeight: 'bold', 
            border: 'none', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            marginTop: '20px',
            transition: 'background 0.3s'
          }}
        >
          {loading ? 'جاري تصدير العقد...' : 'تحميل العقد الرسمي (PDF)'}
        </button>
      </div>
    </div>
  );
};

export default ContractPreviewApp;
