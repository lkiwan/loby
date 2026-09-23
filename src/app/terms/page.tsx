import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'شروط الاستخدام — PLAYM3ANA' };

export default function TermsPage() {
  return (
    <LegalShell title="شروط الاستخدام" subtitle="آخر ميزاجور: 20 شتنبر 2026">
      <p>
        ملي كتخدم بـ PLAYM3ANA، راك قابل بهاد الشروط. اللعبة فابور وتقدر تلعب
        بالكوينز (🪙) لي كتربحهم من الإشهارات والمهام د كل نهار.
      </p>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">1. الكوينز والاقتصاد</h2>
        <ul className="mt-2 list-disc space-y-1.5 ps-5">
          <li>الكوينز ماعندهم تا قيمة مالية حقيقية ومايمكنش تبدلهم بالفلوس.</li>
          <li>كل عملية د الدخول ولا الخروج مقيدة ف سجل مالي (Ledger) باين وممكن يتراجع.</li>
          <li>الكادو فابور د كل نهار والإشهارات عندهم حد يومي معقول لكل لعّاب.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">2. داكشي لي ممنوع</h2>
        <ul className="mt-2 list-disc space-y-1.5 ps-5">
          <li>تصاوب بزاف د الكونطات وهميين باش تربح الكوينز بلا حق.</li>
          <li>تغش فالنقط، تستغل شي ثغرة فاللعبة، ولا تخدم سكريپتات أوتوماتيك.</li>
          <li>السپام، التبرزيط، ولا أي حاجة ممنوعة ف الشاط.</li>
          <li>تكليكي على الإشهارات لراسك بزاف (self-click) — هادشي كيبلوكي الكونط.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">3. العقوبات</h2>
        <p className="mt-2">
          إيلا خالفتي الشروط، نقدرو نوقفو الكونط (FROZEN) ولا نبلوكيوك (BANNED). السجل المالي كيبقى
          محفوظ. تقدر تستأنف القرار عبر <a href="/contact" className="text-amber-300 underline-offset-2 hover:underline">صفحة التواصل</a>.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">4. الألعاب الخارجية</h2>
        <p className="mt-2">
          شي لعبات خدامين ف سيتات شريكة ف إطارات (iframes) آمنة. PLAYM3ANA مسؤولة غير على اللوبي
          والاقتصاد؛ كل لعبة عندها شروطها الخاصة لداخل.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">5. التغييرات</h2>
        <p className="mt-2">
          نقدرو نبدلو هاد الشروط ف أي وقت. إيلا كملتي اللعب من بعد الميزاجور، كيعني أنك قابل بالنسخة
          الجديدة.
        </p>
      </div>
    </LegalShell>
  );
}
