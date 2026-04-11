import React from 'react';

export interface ContractBoothData {
  id: string;
  label: string;
  area: number;
  boothType?: string;
}

export interface ContractBookingData {
  id: string;
  entityName: string;
  contactName: string;
  jobTitle: string;
  mobile: string;
  email: string;
  phone: string;
  unifiedNumber: string;
  address: string;
  boothIds: string; // JSON string or comma separated
  booths?: ContractBoothData[];
  totalPrice: number;
  createdAt: string;
}

interface ContractTemplateProps {
  booking: ContractBookingData;
}

export const ContractTemplate: React.FC<ContractTemplateProps> = ({ booking }) => {
  const contractDate = new Date(booking.createdAt).toLocaleDateString('en-GB', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });

  // Calculate pricing distribution if booths are passed
  const boothsList = booking.booths || [];
  const totalArea = boothsList.reduce((sum, b) => sum + b.area, 0);
  const pricePerSqm = totalArea > 0 ? booking.totalPrice / totalArea : 0;

  const getBoothCategory = (label: string, fallbackType?: string) => {
    if (fallbackType && fallbackType !== 'standard') {
       if (fallbackType === 'vip' || fallbackType.includes('vip')) return { en: 'VIP', ar: 'VIP' };
       if (fallbackType === 'sponsor' || fallbackType.includes('sponsor')) return { en: 'Sponsor', ar: 'راعي' };
    }
    if (label.startsWith('VIP')) return { en: 'VIP', ar: 'VIP' };
    if (label.startsWith('SP')) return { en: 'Sponsor', ar: 'راعي' };
    return { en: 'Standard', ar: 'عادي' };
  };

  return (
    <div
      id={`contract-pdf-${booking.id}`}
      style={{
        width: '794px',
        minHeight: '1123px',
        backgroundColor: '#ffffff',
        padding: '30px 40px',
        color: '#1f2937',
        display: 'none', // Hidden during normal execution
      }}
      className="bg-white"
    >
      {/* Header aligned exactly to standard contract styles */}
      <div className="flex justify-between items-center border-b-[3px] border-[#059669] pb-4 mb-6">
        <div>
          <h1 className="text-xl font-black text-gray-900 tracking-tight">RIYADH CONTRACTORS EXHIBITION 2026</h1>
          <h2 className="text-lg text-[#059669] font-black arabic-support tracking-tight">معرض مقاولي الرياض ٢٠٢٦</h2>
        </div>
        <div className="text-right">
          <p className="font-extrabold text-[#059669] text-xl uppercase tracking-widest">Booking Contract</p>
          <p className="font-extrabold text-[#059669] text-xl arabic-support" dir="rtl">عقد حجز رسمي</p>
          <div className="mt-2 text-xs text-gray-500 font-medium">
            <p>Ref / المرجع: {booking.id.toUpperCase().substring(0, 8)}</p>
            <p>Date / التاريخ: {contractDate}</p>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        
        {/* Section 1: Customer Information Bilingual Table */}
        <div>
          <div className="flex justify-between items-center bg-[#059669]/10 p-2 rounded-t-lg border-b border-[#059669]/20">
            <h3 className="text-sm font-bold text-[#059669]">1. Customer Information</h3>
            <h3 className="text-sm font-bold text-[#059669] arabic-support" dir="rtl">١. معلومات العميل</h3>
          </div>
          <table className="w-full text-sm border-x border-b border-gray-200">
            <tbody>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 w-1/4 border-r border-gray-200">Name of the entity</td>
                <td className="p-2.5 text-center font-bold text-gray-900 w-2/4">{booking.entityName || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right w-1/4 border-l border-gray-200 arabic-support">اسم الجهة</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200">Unified number or national registry</td>
                <td className="p-2.5 text-center text-gray-800">{booking.unifiedNumber || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 arabic-support">الرقم الموحد أو السجل</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200">Address</td>
                <td className="p-2.5 text-center text-gray-800">{booking.address || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 arabic-support">العنوان</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200">Responsible person</td>
                <td className="p-2.5 text-center font-bold text-gray-800">{booking.contactName || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 arabic-support">الشخص المسؤول</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200">Job title</td>
                <td className="p-2.5 text-center text-gray-800">{booking.jobTitle || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 arabic-support">الوظيفة</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200">Mobile</td>
                <td className="p-2.5 text-center font-bold text-gray-800" dir="ltr">{booking.mobile || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 arabic-support">الجوال</td>
              </tr>
              <tr className="border-b border-gray-200">
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200">Telephone</td>
                <td className="p-2.5 text-center text-gray-800" dir="ltr">{booking.phone || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 arabic-support">الهاتف</td>
              </tr>
              <tr>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 border-r border-gray-200 rounded-bl-lg">Email</td>
                <td className="p-2.5 text-center text-gray-800 font-mono text-xs">{booking.email || '---'}</td>
                <td className="p-2.5 font-bold text-gray-600 bg-gray-50 text-right border-l border-gray-200 rounded-br-lg arabic-support">البريد الإلكتروني</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Section 2: Booth & Financial Details */}
        <div>
          <div className="flex justify-between items-center bg-[#059669]/10 p-2 rounded-t-lg border-b border-[#059669]/20">
            <h3 className="text-sm font-bold text-[#059669]">2. Booth & Financial Details</h3>
            <h3 className="text-sm font-bold text-[#059669] arabic-support" dir="rtl">٢. تفاصيل الأجنحة والمالية</h3>
          </div>
          <table className="w-full text-sm border-x border-b border-gray-200 text-center">
            <thead className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <tr>
                <th className="p-2.5 border-r border-gray-200">Booth ID<br/><span className="text-xs arabic-support text-gray-400">رقم الجناح</span></th>
                <th className="p-2.5 border-r border-gray-200">Category<br/><span className="text-xs arabic-support text-gray-400">الفئة</span></th>
                <th className="p-2.5 border-r border-gray-200">Area (m²)<br/><span className="text-xs arabic-support text-gray-400">المساحة</span></th>
                <th className="p-2.5">Price<br/><span className="text-xs arabic-support text-gray-400">السعر</span></th>
              </tr>
            </thead>
            <tbody>
              {boothsList.length > 0 ? boothsList.map((b) => {
                const cat = getBoothCategory(b.label, b.boothType);
                const individualPrice = b.area * pricePerSqm;
                return (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="p-2.5 border-r border-gray-200 font-bold">{b.label}</td>
                    <td className="p-2.5 border-r border-gray-200">
                       <span className="block font-medium text-gray-800">{cat.en}</span>
                       <span className="block text-xs text-gray-500 arabic-support">{cat.ar}</span>
                    </td>
                    <td className="p-2.5 border-r border-gray-200 text-gray-800">{b.area}</td>
                    <td className="p-2.5 font-mono text-gray-800">{individualPrice.toLocaleString()}</td>
                  </tr>
                )
              }) : (
                <tr className="border-b border-gray-100">
                  <td className="p-2.5 border-r border-gray-200 font-bold text-[#059669]">{booking.boothIds}</td>
                  <td className="p-2.5 border-r border-gray-200 text-gray-400 italic">--</td>
                  <td className="p-2.5 border-r border-gray-200 text-gray-400 italic">--</td>
                  <td className="p-2.5 font-mono text-gray-800">{booking.totalPrice.toLocaleString()}</td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr className="bg-green-50">
                <td colSpan={3} className="p-3 text-right font-bold text-gray-700 border-r border-gray-200">
                  <div className="flex justify-between items-center px-4">
                     <span className="uppercase text-[#059669]">Total Amount</span>
                     <span className="arabic-support text-[#059669]">القيمة الإجمالية</span>
                  </div>
                </td>
                <td className="p-3 font-bold text-lg text-[#059669] whitespace-nowrap">
                  {booking.totalPrice.toLocaleString()} SAR
                  <span className="block text-[10px] text-[#059669]/70 arabic-support mt-0.5">ريال سعودي</span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Instructions */}
        <div className="bg-red-50 border border-red-200 text-red-800 p-4 rounded-lg flex items-start gap-4">
           <svg className="w-6 h-6 shrink-0 mt-1" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
           <div className="w-full">
              <p className="font-bold text-sm leading-relaxed text-justify mb-1">
                Please print, sign, stamp, and re-upload this contract along with the bank transfer receipt to the portal.
              </p>
              <p className="font-bold text-sm leading-relaxed arabic-support text-justify text-right" dir="rtl">
                يرجى طباعة العقد وتوقيعه وختمه، ثم إعادة رفعه عبر الموقع مع إرفاق سند التحويل البنكي.
              </p>
           </div>
        </div>

      </div>

      {/* Signature & Stamp Footer */}
      <div className="grid grid-cols-2 gap-12 mt-16 pt-8 border-t-[3px] border-[#059669]/20 text-center">
        <div>
          <p className="font-bold mb-16 text-gray-600">Company Signature & Stamp <br/><span className="arabic-support text-gray-500">توقيع وختم الجهة</span></p>
          <div className="w-56 h-px bg-gray-400 mx-auto mb-2 border-dashed"></div>
          <p className="text-sm font-semibold">{booking.entityName || '________________'}</p>
          <p className="text-xs text-gray-500 mt-1">{booking.contactName || '________________'}</p>
        </div>
        
        <div className="relative">
          <p className="font-bold mb-16 text-[#059669]">Official Organizer <br/><span className="arabic-support text-[#059669]/80">المنظم الرسمي</span></p>
          <div className="w-56 h-px bg-gray-400 mx-auto mb-2"></div>
          <p className="text-sm font-semibold">Riyadh Contractors Exhibition 2026</p>
          
          {/* Stamp Mockup overlaid naturally */}
          <div className="absolute top-10 right-1/2 translate-x-12 opacity-10 rotate-[-15deg] pointer-events-none">
             <div className="w-32 h-32 rounded-full border-[3px] border-[#059669] flex items-center justify-center p-2">
                <div className="w-full h-full rounded-full border-[1.5px] border-[#059669] border-dashed flex flex-col items-center justify-center text-[#059669] font-black arabic-support">
                  <span className="text-xs uppercase tracking-widest">OFFICIAL</span>
                  <span className="text-lg leading-none mt-1">معتمد</span>
                </div>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
};

export default ContractTemplate;
