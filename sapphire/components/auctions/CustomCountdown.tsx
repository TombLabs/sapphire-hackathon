import React, { FC } from "react";

type CustomCountdownProps = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  fontSize?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl" | "3xl";
  color?: string;
  pulse?: boolean;
};
const CustomCountdown: FC<CustomCountdownProps> = ({
  days,
  hours,
  minutes,
  seconds,
  fontSize,
  color,
  pulse,
}: CustomCountdownProps) => {
  return (
    <div
      className={`flex flex-row justify-start items-center gap-1 ${
        pulse && days < 1 && hours < 1 && minutes < 1 && "animate-pulse"
      }`}
    >
      {days > 0 && (
        <p className={`text-${fontSize} font-bold text-${color}`}>
          {days} Days
        </p>
      )}
      {hours > 0 && (
        <p className={`text-${fontSize} font-bold text-${color}`}>{hours} H</p>
      )}
      {minutes > 0 && (
        <p className={`text-${fontSize} font-bold text-${color}`}>
          {minutes} Mins
        </p>
      )}
      {seconds > 0 && (
        <p className={`text-${fontSize} font-bold text-${color}`}>
          {seconds} S
        </p>
      )}
    </div>
  );
};

export default CustomCountdown;
