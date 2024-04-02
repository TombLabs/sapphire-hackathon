import { Card } from "@/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/helpers/utils";
import { LuInfo } from "react-icons/lu";
import { Switch } from "../ui/switch";

export const OptionCard = ({ children }: { children: React.ReactNode }) => {
  return (
    <Card className="dark:bg-slate-900 bg-slate-200 border-none">
      {children}
    </Card>
  );
};

export const OptionContent = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "p-4 border-b border-border last:border-b-0 flex flex-col gap-2",
        className
      )}
    >
      {children}
    </div>
  );
};

export const OptionHeader = ({
  children,
  toggle,
}: {
  children: React.ReactNode;
  toggle?: {
    checked: boolean;
    onCheckedChange: (e: boolean) => void;
  };
}) => {
  return (
    <div className={"flex gap-2 justify-between"}>
      <div className="flex gap-2 items-center">{children}</div>
      {!!toggle && (
        <Switch
          checked={toggle.checked}
          onCheckedChange={toggle.onCheckedChange}
        />
      )}
    </div>
  );
};

export const OptionTitle = ({ children }: { children: React.ReactNode }) => {
  return <p>{children}</p>;
};

export const OptionTooltip = ({ children }: { children: React.ReactNode }) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger type="button">
          <LuInfo className="text-muted-foreground h-4 w-4" />
        </TooltipTrigger>
        <TooltipContent align="start" className="max-w-xs">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
