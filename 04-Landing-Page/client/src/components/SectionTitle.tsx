interface SectionTitleProps {
  number: string;
  titleAr: string;
  titleEn: string;
  description?: string;
}

export default function SectionTitle({ number, titleAr, titleEn, description }: SectionTitleProps) {
  return (
    <div className="mb-12 md:mb-16">
      <div className="flex items-baseline gap-4 mb-4">
        <span className="text-[#FF7A00] text-5xl md:text-6xl font-light" style={{ fontFamily: "'Inter', sans-serif" }}>
          {number}
        </span>
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-black leading-tight">
            {titleAr}
          </h2>
          <p className="text-sm md:text-base text-[#545454] mt-1" style={{ fontFamily: "'Inter', sans-serif" }}>
            {titleEn}
          </p>
        </div>
      </div>
      {description && (
        <p className="text-[#545454] text-base md:text-lg leading-relaxed max-w-3xl">
          {description}
        </p>
      )}
      <div className="w-16 h-0.5 bg-[#FF7A00] mt-6" />
    </div>
  );
}
