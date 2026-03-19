import React from "react";

interface RatioBarProps {
  value: number;
  max: number;
}

const RatioBar: React.FC<RatioBarProps> = ({ value, max }) => {
  return (
    <div className="relative w-full h-2 rounded-full overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-full bg-slate-200"></div>
      <div
        className="absolute top-0 left-0 h-full bg-slate-900"
        style={{ width: `${100 - ((value / max) * 100)}%` }}
      ></div>
    </div>
  );
};

export default RatioBar;
