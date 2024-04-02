import { useEffect, useState } from "react";

const useCountdown = (endTime: number) => {
  const [countdown, setCountdown] = useState<number>(
    endTime - new Date().getTime()
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(endTime - new Date().getTime());
    }, 1000);

    return () => clearInterval(interval);
  }, [endTime]);

  return getReturnValues(countdown);
};

const getReturnValues = (countdown: number) => {
  // calculate time left
  const days = Math.floor(countdown / (1000 * 60 * 60 * 24));
  const hours = Math.floor(
    (countdown % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  const minutes = Math.floor((countdown % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((countdown % (1000 * 60)) / 1000);

  return [days, hours, minutes, seconds];
};

export { useCountdown };
