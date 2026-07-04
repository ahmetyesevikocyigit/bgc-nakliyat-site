type SectionHeadingProps = {
  eyebrow: string;
  title: string;
  text?: string;
  dark?: boolean;
};

export function SectionHeading({ eyebrow, title, text, dark = false }: SectionHeadingProps) {
  return (
    <div className="mx-auto mb-10 max-w-3xl text-center">
      {eyebrow ? (
        <p className={`mb-3 text-sm font-black uppercase tracking-[0.18em] ${dark ? "text-orange-300" : "text-orange-500"}`}>
          {eyebrow}
        </p>
      ) : null}
      <h2 className={`text-3xl font-black tracking-tight sm:text-4xl ${dark ? "text-white" : "text-slate-950"}`}>
        {title}
      </h2>
      {text ? (
        <p className={`mt-4 text-base leading-7 ${dark ? "text-cyan-50/80" : "text-slate-600"}`}>
          {text}
        </p>
      ) : null}
    </div>
  );
}
