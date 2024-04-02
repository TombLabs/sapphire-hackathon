import { LuInfo } from "react-icons/lu";
import { Button } from "../ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Label } from "../ui/label";
import { Checkbox } from "../ui/checkbox";
import enchancements from "@/lib/jsons/prompt-enchancements.json";
import { DialogProps } from "@radix-ui/react-dialog";

export const DialogEnhancement = ({
  prompt,
  setPrompt,
  ...props
}: DialogProps & { prompt: string; setPrompt: (updatedPrompt: string) => void }) => {
  function handleOnChange(value: string) {
    let updatedPrompt = prompt;
    if (updatedPrompt.includes(value)) {
      updatedPrompt = updatedPrompt.replace(value, "");
    } else {
      updatedPrompt = updatedPrompt + value;
    }
    setPrompt(updatedPrompt);
  }

  const selectAll = () => {
    let updatedPrompt = prompt;
    for (let i = 0; i < enchancements.length; i++) {
      if (!updatedPrompt.includes(enchancements[i].value)) {
        updatedPrompt = updatedPrompt + enchancements[i].value;
      }
    }
    setPrompt(updatedPrompt);
  };

  function deselectAll() {
    let updatedPrompt = prompt;
    for (let i = 0; i < enchancements.length; i++) {
      if (updatedPrompt.includes(enchancements[i].value)) {
        updatedPrompt = updatedPrompt.replace(enchancements[i].value, "");
      }
    }
    setPrompt(updatedPrompt);
  }

  return (
    <Dialog {...props}>
      <DialogContent className="max-w-3xl gap-6">
        <DialogHeader>
          <DialogTitle>Prompt Enhancements</DialogTitle>
          <DialogDescription>
            Use these pre-written enhancements to spice up your prompt!
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-row justify-start items-center gap-2">
          <Button onClick={selectAll}>Select All</Button>
          <Button variant={"outline"} onClick={deselectAll}>
            Deselect All
          </Button>
        </div>
        <div className="flex gap-6 flex-wrap">
          {enchancements.map((enhancement, index) => (
            <div className="flex flex-row gap-2 shrink-0" key={index}>
              <Checkbox
                id={enhancement.label}
                checked={prompt.includes(enhancement.value)}
                onCheckedChange={() => handleOnChange(enhancement.value)}
              />

              <Label htmlFor={enhancement.label}>{enhancement.label}</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger className="cursor-pointer">
                    <LuInfo className="h-4 w-4" color="white" />
                  </TooltipTrigger>
                  <TooltipContent>{enhancement.description}</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
