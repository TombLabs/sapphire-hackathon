import { extendVariants, Button } from "@nextui-org/react";

export const MyButton = extendVariants(Button, {
  variants: {
    variant: {
      shadow:
        "!transition-all !shadow-[0px_0px_24px_rgba(0,113,240,.6)] hover:!shadow-[0px_0px_32px_5px_rgba(0,113,240,.8)] hover:-translate-y-1",
    },
  },
});
