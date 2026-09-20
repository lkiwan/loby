import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'سياسة الخصوصية — Darja Arcade' };

export default function PrivacyPage() {
  return (
    <LegalShell title="سياسة الخصوصية" subtitle="آخر تحديث: 20 شتنبر 2026">
      <p>
        DARJA ARCADE منصة لعبات جماعية بالدارجة كتخدم على المتصفح. هاد الوثيقة كتفسر شنو كنجمعو من
        المعطيات وعلاش وكفينو بش نخدمو اللعبة بأمان.
      </p>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">1. المعطيات اللي كنجمعو</h2>
        <ul className="mt-2 list-disc space-y-1.5 ps-5">
          <li>معطيات الحساب: اسم المستخدم، رقم الهاتف (اختياري)، وكلمة السر مخزنة مشفرة.</li>
          <li>
            معطيات اللعب: الألعبة اللي لعبتي، النقاط، العملات، ومستوى التقدم — ضرورية لتعمل الاقتصاد
            والمهام ديال كل يوم.
          </li>
          <li>معطيات الجهاز: بصمة الجهاز و عنوان الإنترنت مخزنين بشكل مشفّر (Hash) باش نمنعو الحسابات الوهمية.</li>
          <li>سجلات الإعلانات: عدد الإعلانات اللي شفتي باش نوفرو بيناتك وبين المعلنين.</li>
        </ul>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">2. الإعلانات</h2>
        <p className="mt-2">
          كنستعملو Google AdSense باش نعرض إعلانات فيديو بمكافآت. الإعلانات كتبان بعد ما تضغط عليها
          بوحدك، وما كنخليوهاش تبان أوتوماتيكيا. Google تقدر تستعمل معرفاتها الخاصة باش تقدم إعلانات
          مناسبة؛ تقدر تتحكم فها الشي من إعدادات Google ديالك.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">3. أين كنخزنو المعطيات</h2>
        <p className="mt-2">
          المعطيات مخزنة على سيرفرات آمنة (قواعد بيانات و Redis). ما كنبيعوهاش لأي طرف ثالث، وما
          كنشاركوهاش مع حد من غير ما يفرضه القانون.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">4. حقوقك</h2>
        <p className="mt-2">
          تقدر تطلب شفاف المعطيات ديالك، تصحيحهم، ولا حذفهم. فحالة الحذف، كنبقاو السجل المالي
          (Ledger) لمدة لازمها القانون، ونحيدو كل شي يخصك من اللعب العادي. تواصل معنا عبر صفحة
          <a href="/contact" className="text-amber-300 underline-offset-2 hover:underline"> تواصل </a>
          ولا على <a href="mailto:support@darja-arcade.ma" className="text-amber-300 underline-offset-2 hover:underline">support@darja-arcade.ma</a>.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">5. الأطفال</h2>
        <p className="mt-2">
          الخدمة موجهة للكبار والصغار بمرافقة. ما كنجمعو معطيات شخصية لأي شخص تحت 13 عام من غير
          إذن ولي الأمر.
        </p>
      </div>
    </LegalShell>
  );
}
