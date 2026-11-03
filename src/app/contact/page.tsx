import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'تواصل معانا — PLAYM3ANA' };

export default function ContactPage() {
  return (
    <LegalShell title="تواصل معانا" subtitle="حنا هنا على قبلك — تقدر تهضر معانا فأي وقت">
      <p>
        إيلا عندك مشكل فالكونط، شي سؤال على اللعبة، ولا بغيتي تشارك معانا شي فكرة جديدة — حنا كنتصنتو ليك.
      </p>

      <div className="legal-card">
        <h2 className="legal-h2">الإيميل</h2>
        <a
          href="mailto:support@playm3ana.ma"
          className="mt-2 inline-block font-cairo font-extrabold text-[var(--lime)] underline-offset-2 hover:underline" dir="ltr"
        >
          support@playm3ana.ma
        </a>
        <p className="mt-1 text-[12px] text-[#9C9CAE]">
          غالبا كنجاوبو فظرف 24 ساعة. بالنسبة لمشاكل الكونط، عطينا السمية ديالك وشرح لينا المشكل مزيان.
        </p>
      </div>

      <div className="legal-card">
        <h2 className="legal-h2">بلّغ على غش ولا ثغرة</h2>
        <p className="mt-2">
          إيلا شفتي شي لعّاب كيغش ولا شي ثغرة فالنقاط، صيفط لينا التفاصيل. التقارير المزيانة كنعطيو عليها مكافأة
          ملي كنتأكدو منها.
        </p>
      </div>

      <div className="legal-card">
        <h2 className="legal-h2">شراكات وإشهارات</h2>
        <p className="mt-2">
          إيلا كنتي مطور وبغيتي تزيد لعبتك عندنا، ولا بغيتي دير إشهار، صيفط لينا الديمو ديال اللعبة
          والعرض ديالك.
        </p>
      </div>

      <div className="legal-card">
        <p className="text-[12px] text-[#9C9CAE]">
          PLAYM3ANA — بلاصة اللعب بالدارجة، مصاوبة فالمغرب 🇲🇦
        </p>
      </div>
    </LegalShell>
  );
}
