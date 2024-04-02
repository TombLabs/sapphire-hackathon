import { Skeleton } from "@/components/ui/skeleton";
import CountUp from "react-countup";
import { IconType } from "react-icons/lib";

export const SmallDataBoxNumber = ({
  data,
  title,
  Icon,
  isLoading,
}: {
  data: number;
  title: string;
  Icon: IconType;
  isLoading: boolean;
}) => {
  return (
    <>
      {isLoading ? (
        <Skeleton className="flex flex-col relative justify-center items-center w-40 h-20 border-[1px] border-border rounded-lg shadow-lg shadow-accent  hover:shadow-xl hover:shadow-accent px-4" />
      ) : (
        <div className="flex flex-col relative justify-center items-center min-w-40 h-20 bg-primary-800 border-[1px] border-border rounded-lg shadow-lg shadow-accent hover:bg-border/30 hover:shadow-xl hover:shadow-accent px-4">
          <div className="flex flex-row justify-between items-center w-full gap-8">
            <p className="text-xs font-accent">{title}</p>

            <Icon size={20} />
          </div>
          <CountUp
            start={0}
            end={data}
            duration={1}
            className="text-2xl font-roboto mt-4 mr-auto"
          />
        </div>
      )}
    </>
  );
};
