import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'سياسة الخصوصية — PLAYM3ANA' };

export default function PrivacyPage() {
  return (
    <LegalShell title="سياسة الخصوصية" subtitle="آخر ميزاجور: 20 شتنبر 2026">
      <p>
        PLAYM3ANA بلاطفورم د ألعاب جماعية بالدارجة خدامة فالمتصفح. هاد الورقة كتشرح شنو كنجمعو ديال
        المعلومات وعلاش باش نخدمو اللعبة ف أمان.
      </p>

      <div className="legal-card">
        <h2 className="legal-h2">1. المعلومات لي كنجمعو</h2>
        <ul className="legal-list mt-2 space-y-1.5">
          <li>معلومات الكونط: السمية، النمرة د التيليفون (إيلا بغيتي)، والمودپاس مخزن مشفر.</li>
          <li>
            معلومات اللعب: اللعبات لي لعبتي، النقط، الكوينز، والنيڤو ديالك — هادشي ضروري باش يخدم الاقتصاد
            والمهام د كل نهار.
          </li>
          <li>معلومات الجهاز: البصمة د الجهاز و لادريس IP مخزنين مشفرين (Hash) باش نحبسو الكونطات الوهميين.</li>
          <li>سجلات الإشهارات: شحال د الإشهارات شفتي باش نتبعوها مع المعلنين.</li>
        </ul>
      </div>

      <div className="legal-card">
        <h2 className="legal-h2">2. الإشهارات</h2>
        <p className="mt-2">
          كنخدمو بـ Google AdSense باش نبيّنو إشهارات ڤيديو بالمكافآت. الإشهارات كيبانو غير إيلا كليكتي عليها
          لراسك، وماكنديروهاش تبان أوتوماتيك. Google تقدر تستعمل المعرفات ديالها باش تبين ليك إشهارات
          مناسبة ليك؛ تقدر تحكم فهادشي من إعدادات Google ديالك.
        </p>
      </div>

      <div className="legal-card">
        <h2 className="legal-h2">3. فين كنخزنو المعلومات</h2>
        <p className="mt-2">
          المعلومات مخزنة ف سيرفورات آمنة (قواعد بيانات و Redis). ماكنبيعوها لتا شي حد، وما
          كنشاركوها مع تا واحد من غير إيلا فرضها القانون.
        </p>
      </div>

      <div className="legal-card">
        <h2 className="legal-h2">4. الحقوق ديالك</h2>
        <p className="mt-2">
          تقدر تطلب تشوف معلوماتك، تصححها، ولا تمسحها. ف حالة المسح، كنخليو السجل المالي
          (Ledger) للمدة لي كيفرضها القانون، وكنمسحو كاع داكشي لاخور. تواصل معانا ف صفحة
          <a href="/contact" className="font-extrabold text-[var(--lime)] underline-offset-2 hover:underline"> تواصل معانا </a>
          ولا على <a href="mailto:support@playm3ana.ma" className="font-extrabold text-[var(--lime)] underline-offset-2 hover:underline">support@playm3ana.ma</a>.
        </p>
      </div>

      <div className="legal-card">
        <h2 className="legal-h2">5. الدراري الصغار</h2>
        <p className="mt-2">
          الخدمة للكبار والصغار لي معاهم شي حد كبير. ماكنجمعو تا معلومات شخصية د شي حد قل من 13 عام من غير
          إذن ديال والديه.
        </p>
      </div>
    </LegalShell>
  );
}
