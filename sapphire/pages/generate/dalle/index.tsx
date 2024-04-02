import GalleryPastGenerations from "@/components/gallery-past-generations";
import { DialogEnhancement } from "@/components/ui-generate/dialog-enhancement";
import {
  OptionCard,
  OptionContent,
  OptionHeader,
  OptionTitle,
  OptionTooltip,
} from "@/components/ui-generate/option";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Toggle } from "@/components/ui/toggle";
import { useUser } from "@/hooks/useUserHooks";
import { selectRandomGif } from "@/lib/helpers/utils";
import { GenerationReturn } from "@/types";
import { useForm, zodResolver } from "@mantine/form";
import axios from "axios";
import { NextSeo } from "next-seo";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import {
  LuArrowDown,
  LuArrowUp,
  LuLoader2,
  LuMic2,
  LuRotateCcw,
  LuSettings2,
  LuSparkles,
  LuWand2,
} from "react-icons/lu";
import SpeechRecognition, {
  useSpeechRecognition,
} from "react-speech-recognition";
import TextareaAutosize from "react-textarea-autosize";
import { Tooltip as ReactTooltip } from "react-tooltip";
import * as z from "zod";

const FormSchema = z.object({
  prompt: z.string(),
  isPublic: z.boolean(),
});
type FormTypes = z.infer<typeof FormSchema>;

export default function DallePage() {
  const { data: user, mutate, isLoading: isLoadingUser } = useUser();
  const { query } = useRouter();
  const [isOptionsOpen, setIsOptionOpen] = useState(false);
  const [isEnhancementOpen, setIsEnhancementOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isPromptUpdating, setIsPromptUpdating] = useState(false);
  const [isPromptEnhance, setIsPromptEnhance] = useState(false);
  const [isPromptAssist, setIsPromptAssist] = useState(false);
  const [promptEnhanceOptions, setPromptEnhanceOptions] = useState<string[]>(
    []
  );
  const [newImageUrl, setNewImageUrl] = useState("");
  const [speech, setSpeech] = useState("");
  const [speechRecognitionStage, setSpeechRecognitionStage] = useState<
    0 | 1 | 2
  >(0);
  const [showPreviousGenerations, setShowPreviousGenerations] = useState(false);
  const {
    transcript,
    resetTranscript,
    listening,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable,
  } = useSpeechRecognition();

  const form = useForm<FormTypes>({
    validate: zodResolver(FormSchema),
    initialValues: {
      prompt: (query.prompt as string) || "",
      isPublic: false,
    },
  });

  const handleOnSubmit = async (form: FormTypes) => {
    setNewImageUrl("");
    if (!form.prompt) {
      toast.error("Please enter a prompt");
      return;
    }

    if (isLoadingUser) {
      toast.error("Your account is loading, please try again once it's loaded");
      return;
    }

    if (!user) {
      toast.error("Could not find your user account");
      return;
    }

    if (user?.sapphires! < 24) {
      toast.error("You don't have enough sapphires");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post("/api/generators/dalle", {
        prompt: form.prompt,
        isPublic: form.isPublic,
      });
      const data = response.data as GenerationReturn;

      if (data.isError) throw new Error(data.error);

      await mutate();
      setNewImageUrl(data.data!);
    } catch (err: any) {
      console.log(err);
      if (err.response?.data?.error === "That prompt was sus...  Try again.") {
        const gifImage = selectRandomGif();
        setNewImageUrl(gifImage);
        toast.error(err.response.data.error);
      } else {
        toast.error(err.message);
      }
    }
    setIsLoading(false);
  };
  useEffect(() => {
    if (!query.prompt) return;
    const newValues: FormTypes = {
      prompt: query.prompt as string,
      isPublic: true,
    };
    form.setValues(newValues);
    form.resetDirty(newValues);
  }, [query]);

  //replace prompt with gpt additions

  async function enhancePrompt() {
    setIsPromptUpdating(true);

    if (!form.values.prompt) return toast.error("Please enter a prompt");

    try {
      const response = await axios.post("/api/prompt/aiEnhance", {
        prompt: form.values.prompt,
        engine: "Dalle-3",
      });
      if (response.status !== 200) throw new Error("Augie Did It");

      const choices = response.data.message.map(
        (choice: any) => choice.message.content
      );
      setPromptEnhanceOptions(choices);
      await mutate();
      setIsPromptUpdating(false);
    } catch (e: any) {
      console.log(e);
      setIsPromptUpdating(false);
      return toast.error("Something went wrong. Please try again later.");
    }
  }

  async function updatePromptToEnhanced(prompt: string) {
    setIsPromptEnhance(false);
    form.setFieldValue("prompt", prompt);
    setIsPromptAssist(true);
    setPromptEnhanceOptions([]);
  }

  useEffect(() => {
    if (listening) {
      setSpeech(transcript);
    }
  }, [transcript, speech]);

  useEffect(() => {
    if (speech) {
      form.setFieldValue("prompt", speech);
    }
  }, [speech]);

  function handleListen() {
    if (!isMicrophoneAvailable) {
      toast.error(
        "Microphone is not available in your browser or you have not allowed access"
      );
    }
    if (!browserSupportsSpeechRecognition) {
      toast.error(
        "Your browser does not support speech recognition software! Try Chrome desktop, maybe?"
      );
    }
    let toastPromise;
    if (listening && speechRecognitionStage !== 1) {
      SpeechRecognition.stopListening();
      toast.dismiss(toastPromise);
    } else if (listening && speechRecognitionStage === 1) {
      setSpeechRecognitionStage(2);
      SpeechRecognition.stopListening();
      toast.dismiss(toastPromise);
    } else if (speechRecognitionStage === 0) {
      SpeechRecognition.startListening({ continuous: true });
      toastPromise = toast.loading("Listening...");
      setSpeechRecognitionStage(1);
    } else if (speechRecognitionStage === 2) {
      resetTranscript();
      setSpeechRecognitionStage(0);
      form.setFieldValue("prompt", "");
    }
  }

  return (
    <>
      <NextSeo title="Dalle 3 Generator" />
      {!!isEnhancementOpen && (
        <DialogEnhancement
          open={isEnhancementOpen}
          onOpenChange={() => setIsEnhancementOpen(false)}
          prompt={form.values.prompt}
          setPrompt={(updatedPrompt) =>
            form.setFieldValue("prompt", updatedPrompt)
          }
        />
      )}
      <form className="relative" onSubmit={form.onSubmit(handleOnSubmit)}>
        <section className="absolute inset-x-0 top-0 bottom-auto h-80 w-full object-cover">
          <Image
            src={"/images/dalle_bg.png"}
            alt=""
            fill
            className="h-full w-full object-cover"
            style={{
              WebkitMaskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 100%)",
              maskImage:
                "linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.1) 75%, rgba(0,0,0,0) 100%)",
            }}
          />
        </section>

        <section className="flex flex-col gap-8 px-6 sm:pt-40 pt-32 pb-16 mx-auto max-w-5xl w-full relative">
          <h1 className="text-center">Dalle 3 Generator</h1>
          {(isLoading || !!newImageUrl) && (
            <div className="relative bg-black max-w-sm w-full mx-auto aspect-square rounded-xl overflow-hidden">
              {isLoading ? (
                // <Skeleton className="w-full h-full" />
                <video
                  src="/video/ai_loader.mp4"
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : (
                <Image
                  fill
                  src={newImageUrl}
                  alt="latest generation"
                  className="h-full w-full object-cover"
                />
              )}
            </div>
          )}

          <div className="flex gap-4 flex-col">
            <div className="relative grow">
              <TextareaAutosize
                name="prompt"
                placeholder="Type prompt here..."
                minRows={1}
                className=" px-4 py-3 pr-28 flex min-h-[46px] w-full rounded-xl border border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                {...form.getInputProps("prompt")}
              />

              <Button
                size={"icon"}
                className={`rounded-full absolute right-20 top-2 h-7 w-7 ${
                  listening && "bg-red-500 animate-pulse hover:bg-red-600"
                }`}
                onClick={handleListen}
                data-tooltip-id="mic"
                type="button"
              >
                {speechRecognitionStage !== 2 ? (
                  <LuMic2 className="w-4 h-4" />
                ) : (
                  <LuRotateCcw className="w-4 h-4" />
                )}
              </Button>
              <ReactTooltip
                id="mic"
                place="top"
                content={
                  listening
                    ? "Stop Listening"
                    : speechRecognitionStage === 2
                    ? "Reset Prompt and Record Again"
                    : "Use Microphone for Speech Recognition"
                }
                className="rounded-lg bg-blue-950 border-[1px] border-white/20"
                style={{
                  backgroundColor: "#020817",
                }}
              />

              <Button
                size={"icon"}
                className={`rounded-full absolute right-11 top-2 h-7 w-7 ${
                  form.values.prompt.length > 0 && !isPromptUpdating
                    ? "animate-pulse"
                    : "cursor-not-allowed bg-neutral-500"
                }`}
                onClick={enhancePrompt}
                type="button"
                data-tooltip-id="gpt"
                disabled={isPromptUpdating || form.values.prompt.length < 1}
              >
                {isPromptUpdating ? (
                  <LuLoader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <LuSparkles className="w-4 h-4" />
                )}
                <span className="sr-only">ai prompt assistance</span>
              </Button>

              <Button
                size={"icon"}
                className="rounded-full absolute right-2 top-2 h-7 w-7"
                onClick={() => setIsEnhancementOpen(true)}
                type="button"
                data-tooltip-id="enhancement"
              >
                <LuWand2 className="w-4 h-4" />
                <span className="sr-only">enhancement</span>
              </Button>
            </div>

            <ReactTooltip
              id="enhancement"
              place="top"
              content="Enchance Your Prompt"
              className="rounded-lg bg-blue-950 border-[1px] border-white/20"
              style={{
                backgroundColor: "#020817",
              }}
            />
            <ReactTooltip
              id="gpt"
              place="top"
              content="AI Prompt Assistance (2 Sapphires)"
              className="rounded-lg bg-blue-950 border-[1px] border-white/20"
              style={{
                backgroundColor: "#020817",
              }}
            />
            <ReactTooltip
              id="options"
              place="top"
              content="Generator Options"
              className="rounded-lg bg-blue-950 border-[1px] border-white/20"
              style={{
                backgroundColor: "#020817",
              }}
            />

            {isPromptEnhance && (
              <div className="w-full flex flex-col justify-center items-center gap-4 rounded-lg border-white-20 border-[1px] bg-[#0F172A] p-6">
                {promptEnhanceOptions.length < 1 ? (
                  <div className="flex flex-col justify-center items-center gap-2">
                    <p className="text-sm">
                      Use AI Prompt Assistance to generate prompts! Select from
                      4 prompts! (+2 Sapphires)
                    </p>
                    <Button
                      isLoading={isPromptUpdating}
                      disabled={isPromptUpdating || isLoading}
                      size={"lg"}
                      type="button"
                      onClick={enhancePrompt}
                    >
                      Get Prompts!
                    </Button>
                  </div>
                ) : (
                  <>
                    {promptEnhanceOptions.map((option, index) => (
                      <div
                        className="flex items-center gap-4 w-full p-2 py-4 border-[1px] border-white/20 rounded-lg bg-[#0F172A]"
                        key={index}
                      >
                        <p className="text-sm w-5/6">{option}</p>
                        <Button
                          size={"lg"}
                          className="rounded-full h-7 w-7"
                          onClick={() => updatePromptToEnhanced(option)}
                          type="button"
                        >
                          Use
                        </Button>
                      </div>
                    ))}
                  </>
                )}
              </div>
            )}
            <div className="flex gap-2">
              <Button
                isLoading={isLoading}
                disabled={isLoading}
                size={"lg"}
                type="submit"
                className="grow"
              >
                Generate (24 Sapphires)
              </Button>
              <Toggle
                variant={"outline"}
                className="w-11 h-11"
                onClick={() => setIsOptionOpen(!isOptionsOpen)}
                pressed={isOptionsOpen}
                type="button"
                data-tooltip-id="options"
              >
                <LuSettings2 className="h-5 w-5" />
                <span className="sr-only">options</span>
              </Toggle>
            </div>
          </div>

          {isOptionsOpen && (
            <OptionCard>
              <OptionContent>
                <OptionHeader
                  toggle={{
                    checked: form.values.isPublic,
                    onCheckedChange: (e) => form.setFieldValue("isPublic", e),
                  }}
                >
                  <OptionTitle>Public</OptionTitle>
                  <OptionTooltip>
                    Public images can be seen by everyone.
                  </OptionTooltip>
                </OptionHeader>
              </OptionContent>
            </OptionCard>
          )}
        </section>
      </form>
      <Separator />
      {!showPreviousGenerations ? (
        <Button
          onClick={() => setShowPreviousGenerations(true)}
          className="w-60 bg-transparent hover:bg-transparent hover:underline"
        >
          Show Previous Generations
          <LuArrowDown className="w-4 h-4" />
        </Button>
      ) : (
        <>
          <Button
            onClick={() => setShowPreviousGenerations(false)}
            className="w-60 bg-transparent hover:bg-transparent hover:underline"
          >
            Hide Previous Generations
            <LuArrowUp className="w-4 h-4 ml-2" />
          </Button>
          <GalleryPastGenerations />
        </>
      )}
    </>
  );
}
