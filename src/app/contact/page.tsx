import LegalShell from '@/components/LegalShell';

export const metadata = { title: 'تواصل معانا — PLAYM3ANA' };

export default function ContactPage() {
  return (
    <LegalShell title="تواصل معانا" subtitle="حنا هنا على قبلك — تقدر تهضر معانا فأي وقت">
      <p>
        إيلا عندك مشكل فالكونط، شي سؤال على اللعبة، ولا بغيتي تشارك معانا شي فكرة جديدة — حنا كنتصنتو ليك.
      </p>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">الإيميل</h2>
        <a
          href="mailto:support@playm3ana.ma"
          className="mt-2 inline-block font-cairo text-amber-300 underline-offset-2 hover:underline"
        >
          support@playm3ana.ma
        </a>
        <p className="mt-1 text-[12px] text-[#7a6a4d]">
          غالبا كنجاوبو فظرف 24 ساعة. بالنسبة لمشاكل الكونط، عطينا السمية ديالك وشرح لينا المشكل مزيان.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">بلّغ على غش ولا ثغرة</h2>
        <p className="mt-2">
          إيلا شفتي شي لعّاب كيغش ولا شي ثغرة فالنقاط، صيفط لينا التفاصيل. التقارير المزيانة كنعطيو عليها مكافأة
          ملي كنتأكدو منها.
        </p>
      </div>

      <div>
        <h2 className="font-lalezar text-xl text-[#f5eddc]">شراكات وإشهارات</h2>
        <p className="mt-2">
          إيلا كنتي مطور وبغيتي تزيد لعبتك عندنا، ولا بغيتي دير إشهار، صيفط لينا الديمو ديال اللعبة
          والعرض ديالك.
        </p>
      </div>

      <div className="rounded-lg border border-[#6b542e]/40 bg-[#171210] p-4">
        <p className="text-[12px] text-[#a08a63]">
          PLAYM3ANA — بلاصة اللعب بالدارجة، مصاوبة فالمغرب 🇲🇦
        </p>
      </div>
    </LegalShell>
  );
}
