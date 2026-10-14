import React from "react";

export interface BrandLogoProps {
  className?: string;
}

export function LGLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-1.5 ${className}`}>
      <svg viewBox="0 0 100 100" className="h-7 w-7 text-[#A50034] shrink-0 fill-current">
        <circle cx="50" cy="50" r="48" fill="none" stroke="#A50034" strokeWidth="8" />
        <circle cx="36" cy="38" r="5" fill="#A50034" />
        <path d="M50 24 v36 h22" fill="none" stroke="#A50034" strokeWidth="8" strokeLinecap="round" />
        <path d="M72 48 v18 A26 26 0 1 1 50 24" fill="none" stroke="#A50034" strokeWidth="8" strokeLinecap="round" />
      </svg>
      <span className="font-bold text-lg tracking-tight text-[#4a4a4a]">LG</span>
    </div>
  );
}

export function XiaomiLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-[#FF6900] text-white rounded-lg px-2.5 py-1 flex items-center justify-center font-black text-base tracking-tighter">
        <span>mi</span>
      </div>
    </div>
  );
}

export function HPLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="w-8 h-8 rounded-full bg-[#0096D6] flex items-center justify-center text-white italic font-bold text-lg select-none">
        <span className="-skew-x-12 tracking-tighter">hp</span>
      </div>
    </div>
  );
}

export function JBLLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="bg-[#FF5500] text-white px-2.5 py-1 rounded-sm font-black tracking-tight text-sm flex items-center gap-0.5">
        <span>JBL</span>
        <span className="text-[10px] font-bold">!</span>
      </div>
    </div>
  );
}

export function AppleLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <svg viewBox="0 0 170 170" className={`fill-current text-zinc-900 ${className}`}>
      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.04-7.58-7.7-11.64-13.98-5.87-9.05-10.4-19.14-13.59-30.28-3.19-11.14-4.78-21.78-4.78-31.91 0-14.54 3.73-26.68 11.19-36.43 7.46-9.75 16.94-14.72 28.44-14.91 4.58 0 9.77 1.25 15.58 3.76 5.8 2.5 9.74 3.84 11.81 4.01 2.45-.37 6.64-1.84 12.58-4.42 5.94-2.57 10.84-3.79 14.7-3.65 13.72.67 24.38 5.65 31.98 14.94-11.97 7.23-17.84 17.15-17.62 29.74.22 9.87 4.05 18.06 11.49 24.58 7.44 6.52 16.14 10.23 26.11 11.14-2.29 6.84-5.06 13.75-8.31 20.73zM119.22 33.15c0-7.07 2.61-13.67 7.82-19.8 5.22-6.13 11.69-10.29 19.41-12.49.22 1.34.33 2.57.33 3.69 0 6.94-2.73 13.7-8.2 20.29-5.46 6.58-12.08 10.59-19.85 12.01.07-1.12.49-2.35.49-3.7z" />
    </svg>
  );
}

export function AbansLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-extrabold text-xl tracking-tight text-[#611160] ${className}`}>
      <span className="font-display italic font-black">Abans</span>
    </div>
  );
}

export function HaierLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center text-[#005BAC] font-black tracking-tight text-xl ${className}`}>
      <span>Haier</span>
    </div>
  );
}

export function SamsungLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-black text-base tracking-widest text-[#034EA2] ${className}`}>
      <span>SAMSUNG</span>
    </div>
  );
}

export function SonyLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-serif font-black text-lg tracking-wider text-black ${className}`}>
      <span>SONY</span>
    </div>
  );
}

export function PhilipsLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-bold text-base tracking-widest text-[#0b5ed7] ${className}`}>
      <span>PHILIPS</span>
    </div>
  );
}

export function TCLLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-black text-xl italic tracking-tighter text-[#E11D48] ${className}`}>
      <span>TCL</span>
    </div>
  );
}

export function ToshibaLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex flex-col items-center justify-center leading-none ${className}`}>
      <span className="font-extrabold text-sm tracking-tight text-[#E11D48]">TOSHIBA</span>
      <span className="text-[7px] text-zinc-600 font-semibold tracking-tighter">Leading Innovation &gt;&gt;</span>
    </div>
  );
}

export function AnkerLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-black text-base tracking-wider text-[#00A0DF] ${className}`}>
      <span>ANKER</span>
    </div>
  );
}

export function HakkoLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-black text-base tracking-wider text-[#0066B2] ${className}`}>
      <span>HAKKO</span>
    </div>
  );
}

export function NichiconLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-black text-base tracking-tight text-zinc-900 ${className}`}>
      <span className="text-[#E11D48]">nichi</span>
      <span>con</span>
    </div>
  );
}

export function TexasInstrumentsLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-1 text-[#C41230] font-black text-xs ${className}`}>
      <div className="w-5 h-5 rounded-full border-2 border-[#C41230] flex items-center justify-center font-serif text-[11px] font-bold">
        ti
      </div>
      <span className="tracking-tighter">INSTRUMENTS</span>
    </div>
  );
}

export function KesterLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-extrabold text-sm tracking-tight text-[#008080] ${className}`}>
      <span>Kester</span>
    </div>
  );
}

export function OrangeElectricLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center gap-1 font-bold text-xs text-[#FF6600] ${className}`}>
      <span className="w-3 h-3 rounded-full bg-[#FF6600] inline-block" />
      <span>ORANGE</span>
    </div>
  );
}

export function KeyestudioLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center bg-black text-yellow-400 px-2 py-0.5 rounded font-black text-[11px] tracking-tight ${className}`}>
      <span>KEYESTUDIO</span>
    </div>
  );
}

export function EdifierLogo({ className = "h-7 w-auto" }: BrandLogoProps) {
  return (
    <div className={`flex items-center justify-center font-black text-base tracking-widest text-zinc-800 ${className}`}>
      <span>EDIFIER</span>
    </div>
  );
}

export const TOP_BRANDS = [
  { name: "LG", component: LGLogo },
  { name: "Xiaomi", component: XiaomiLogo },
  { name: "HP", component: HPLogo },
  { name: "JBL", component: JBLLogo },
  { name: "Apple", component: AppleLogo },
  { name: "Abans", component: AbansLogo },
  { name: "Haier", component: HaierLogo },
  { name: "Samsung", component: SamsungLogo },
  { name: "Sony", component: SonyLogo },
  { name: "Philips", component: PhilipsLogo },
  { name: "TCL", component: TCLLogo },
  { name: "Toshiba", component: ToshibaLogo },
  { name: "Anker", component: AnkerLogo },
  { name: "Hakko", component: HakkoLogo },
  { name: "Nichicon", component: NichiconLogo },
  { name: "Texas Instruments", component: TexasInstrumentsLogo },
  { name: "Kester", component: KesterLogo },
  { name: "Orange Electric", component: OrangeElectricLogo },
  { name: "Keyestudio", component: KeyestudioLogo },
  { name: "Edifier", component: EdifierLogo },
];
