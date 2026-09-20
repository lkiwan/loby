import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'شروط الاستخدام — Darja Arcade' };

export default function TermsPage() {
  return (
    <LegalShell title="شروط الاستخدام" subtitle="آخر تحديث: 20 شتنبر 2026">
      <p>
        باستخدامك لـ DARJA ARCADE، كتوافق على هاد الشروط. من فش، اللعبة مجانية وتقدر تلعب بعملات
        داخلية (🪙) تكسبها بالإعلانات والمهام اليومية.
      </p>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">1. العملات والاقتصاد</h2>
        <ul className="mt-2 list-disc space-y-1.5 ps-5">
          <li>العملات ما عندهاش قيمة مالية حقيقية وما تقدرش تتبدل بالفلوس.</li>
          <li>كل عملية دخل/خرج مسجلة فسجل مالي (Ledger) واضح وقابل للمراجعة.</li>
          <li>العرض المجاني ديال كل يوم والإعلانات لهم سقف يومي عادل لكل لاعب.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">2. السلوك الممنوع</h2>
        <ul className="mt-2 list-disc space-y-1.5 ps-5">
          <li>إنشاء حسابات وهمية متعددة باش تكسب عملات بلا حق.</li>
          <li>الغش فالنقاط، استغلال ثغرات اللعبة، ولا استخدام سكريبتات أوتوماتيكية.</li>
          <li>النشر البريد المزعج، التحرش، ولا أي محتوى غير قانوني فالمحادثات.</li>
          <li>الضغط على إعلاناتك بشكل غير طبيعي — هاد الشي كيعرض الحساب للحظر.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">3. العقوبات</h2>
        <p className="mt-2">
          فحالة المخالفة، نقدر نجمدو الحساب (الحالة: FROZEN) ولا نمنعوه (BANNED). السجل المالي كيبقا
          محفوظ. تقدر تستأنف القرار عبر <a href="/contact" className="text-amber-300 underline-offset-2 hover:underline">صفحة التواصل</a>.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">4. اللعبة الخارجية</h2>
        <p className="mt-2">
          بعض الألعاب كتخدم على نطاقات شريكة فإطارات (iframes) آمنة. DARJA ARCADE مسؤولة على لوبي
          والاقتصاد؛ كل لعبة عندها شروطها الخاصة داخل اللعبة.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">5. التغييرات</h2>
        <p className="mt-2">
          نقدر نحدّث هاد الشروط فأي وقت. الاستمرار فاللعب بعد التحديث كيعني الموافقة على النسخة
          الجديدة.
        </p>
      </div>
    </LegalShell>
  );
}
