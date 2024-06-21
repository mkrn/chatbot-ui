export interface OpenAIModel {
  id: string;
  name: string;
  maxLength: number; // maximum length of a message
  tokenLimit: number;
}

export enum OpenAIModelID {
  GPT_3_5 = 'gpt-3.5-turbo',
  // GPT_4 = 'gpt-4',
  // GPT_4_TURBO = 'gpt-4-turbo',
  META_LLAMA_3_70B_INSTRUCT = 'meta-llama-3-70b-instruct',
}

// in case the `DEFAULT_MODEL` environment variable is not set or set to an unsupported model
export const fallbackModelID = OpenAIModelID.GPT_3_5;

export const OpenAIModels: Record<OpenAIModelID, OpenAIModel> = {
  [OpenAIModelID.META_LLAMA_3_70B_INSTRUCT]: {
    id: OpenAIModelID.META_LLAMA_3_70B_INSTRUCT,
    name: 'Meta Llama 3 70B Instruct',
    maxLength: 12000,
    tokenLimit: 4000,
  },
  [OpenAIModelID.GPT_3_5]: {
    id: OpenAIModelID.GPT_3_5,
    name: 'GPT-3.5 Turbo',
    maxLength: 24000,
    tokenLimit: 8000,
  },
};
