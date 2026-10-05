'use client';

import { Gamepad2, Users, Zap } from 'lucide-react';

const STEPS = [
  {
    num: '1',
    numClass: '',
    icon: <Gamepad2 className="h-6 w-6" />,
    title: 'اختار اللعبة',
    desc: 'كلشي بالدارجة — ما عندكش باش تسرح. اختار من 5 ألعاب واحدة تحلا مع صحابك.',
    color: 'rgba(0,229,255,0.12)',
    border: 'rgba(0,229,255,0.2)',
  },
  {
    num: '2',
    numClass: 'orange',
    icon: <Users className="h-6 w-6" />,
    title: 'عيّط لصحابك',
    desc: 'تيليفون واحد كافي — قول ليهم "اجيو نلعبو" وخليهم يجلسو حداك. بلا تحميل، بلا تسجيل.',
    color: 'rgba(255,140,0,0.1)',
    border: 'rgba(255,140,0,0.2)',
  },
  {
    num: '3',
    numClass: 'purple',
    icon: <Zap className="h-6 w-6" />,
    title: 'العب وفضح صاحبك',
    desc: 'الشوهة، الضحكة، والفضيحة — كاملين فطبلة واحدة. من لعب مرة رجع مرتين 😅',
    color: 'rgba(155,89,248,0.1)',
    border: 'rgba(155,89,248,0.2)',
  },
];

export default function HowItWorks() {
  return (
    <section className="mt-14">
      <div className="mb-8 flex flex-col items-center gap-2 text-center">
        <div className="section-label">كيفاش كتخدم؟</div>
        <h2 className="font-lalezar text-[clamp(1.7rem,7vw,3rem)] leading-none text-[#f5eddc] text-glow-amber">
          3 خطوات وتكون فالجو
        </h2>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {STEPS.map((step) => (
          <div
            key={step.num}
            className="how-step"
            style={{
              background: `linear-gradient(160deg, ${step.color} 0%, #0c1420 100%)`,
              borderColor: step.border,
            }}
          >
            <div className={`how-step-num ${step.numClass}`}>{step.num}</div>
            <h3 className="font-lalezar text-xl text-[#f5eddc]">{step.title}</h3>
            <p className="font-cairo text-[12.5px] font-semibold leading-relaxed text-neutral-500 max-w-[220px]">
              {step.desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
