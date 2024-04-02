import { UseFormReturnType } from "@mantine/form";
import { motion } from "framer-motion";
import { Check, ChevronDown } from "lucide-react";
import React, { Dispatch, SetStateAction, useState } from "react";
import { z } from "zod";
import models from "../lib/jsons/leonardo-models.json";

const FormSchema = z.object({
  prompt: z.string(),
  negativePrompt: z.string(),
  aiModel: z.string(),
  isPublic: z.boolean(),
  alchemy: z.boolean(),
  modelId: z.string(),
  photoReal: z.boolean(),
  guidanceScale: z.number().min(1).max(20),
  inferenceSteps: z.number().min(30).max(60),
});
type FormTypes = z.infer<typeof FormSchema>;

type CustomSelectProps = {
  aiModel: {
    name: string;
    description: string;
    image: string;
    id: string;
  };
  setAiModel: Dispatch<
    SetStateAction<{
      id: string;
      name: string;
      image: string;
      description: string;
    }>
  >;
  form: UseFormReturnType<FormTypes>;
  isPhotoReal: boolean;
};

const CustomSelect = ({
  aiModel,
  setAiModel,
  form,
  isPhotoReal,
}: CustomSelectProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={`w-full flex flex-col justify-center items-center relative`}
    >
      <div
        className={`w-full p-2 mt-4 flex items-center gap-4 justify-start rounded-xl border-white/10 border-[1px] h-10 bg-background relative`}
        onClick={() => {
          if (!isPhotoReal) {
            setIsExpanded(!isExpanded);
          } else {
            setIsExpanded(false);
          }
        }}
      >
        {isPhotoReal && (
          <div className="absolute w-full h-full inset-0 bg-neutral-800 opacity-90 rounded-xl z-50 ">
            <p className="text-[10px] text-center text-foreground">
              Photo Real Cannot Be Used With Models
            </p>
          </div>
        )}
        <img
          src={aiModel.image}
          alt={aiModel.name}
          className="w-6 h-6 rounded-md"
        />
        <p className="text-xs">{aiModel.name}</p>
        <p className="text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
          {aiModel.description}
        </p>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="absolute right-2 h-7 w-7 rounded-full"
          type="button"
        >
          <ChevronDown className="w-4 h-4" />
        </button>
      </div>
      {isExpanded && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          exit={{ opacity: 0, y: -10 }}
          className="absolute z-50 top-14 mt-1 w-full flex flex-col bg-background border-white/10 border-[1px] overflow-y-auto h-72"
        >
          {models.map((model) => (
            <div
              className="w-full p-4 flex items-center gap-4 justify-start h-12 bg-background hover:bg-muted cursor-pointer"
              key={model.id}
              onClick={() => {
                setAiModel(model);
                form.setFieldValue("aiModel", model.id);
                setIsExpanded(false);
              }}
            >
              {aiModel.id === model.id ? (
                <Check className="h-4 w-4" />
              ) : (
                <div className="h-4 w-4" />
              )}
              <img
                src={model.image}
                alt={model.name}
                className="w-8 h-8 rounded-md"
              />
              <p className="text-xs whitespace-nowrap">{model.name}</p>
              <p className="text-[12px] text-muted-foreground whitespace-nowrap overflow-hidden text-ellipsis">
                {model.description}
              </p>
            </div>
          ))}
        </motion.div>
      )}
    </div>
  );
};

export default CustomSelect;
