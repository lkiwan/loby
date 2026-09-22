import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'تواصل معنا — PLAYM3ANA' };

export default function ContactPage() {
  return (
    <LegalShell title="تواصل معنا" subtitle="كنوفرّو ليك — تقدر تهضر معانا بأي وقت">
      <p>
        واخا تكون عندك مشكل فالحساب، سؤال على اللعبة، ولا باغي تشاركنا فكرة جديدة — حنا كنسمعو.
      </p>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">البريد الإلكتروني</h2>
        <a
          href="mailto:support@playm3ana.ma"
          className="mt-2 inline-block font-cairo text-amber-300 underline-offset-2 hover:underline"
        >
          support@playm3ana.ma
        </a>
        <p className="mt-1 text-[12px] text-[#7a6a4d]">
          كنجاوبو عادة فظرف 24 ساعة. فمشاكل الحساب، عطينا اسم المستخدم ووصف دقيق للمشكل.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">الإبلاغ عن غش أو ثغرة</h2>
        <p className="mt-2">
          إذا شفتي لاعب كيغش ولا ثغرة فالنقاط، بعث لنا التفاصيل. التقارير الجيدة كتاخد مكافأة عملات
          لما نأكدوها.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">شراكات وإعلانات</h2>
        <p className="mt-2">
          إذا كنتي مطور لعبة وباغي تضيفها للساحة، ولا معلن باغي يدعم اللعبة، راسلنا بنموذج اللعبة
          وعرضك.
        </p>
      </div>

      <div className="rounded-lg border border-[#6b542e]/40 bg-[#171210] p-4">
        <p className="text-[12px] text-[#a08a63]">
          PLAYM3ANA — ساحة اللعب بالدارجة، مصنوعة فالمغرب 🇲🇦
        </p>
      </div>
    </LegalShell>
  );
}
