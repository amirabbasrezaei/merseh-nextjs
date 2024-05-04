import { z } from "zod";
import axios from "axios";

//// send sms
export const sendSMSSchema = z.object({
  body: z.object({
    bodyId: z.number(),
    to: z.string(),
    args: z.any().array(),
  }),
});

interface SendSMSPayload {
  recId: string;
  status: string;
}
export type SendSMSSchema = z.infer<typeof sendSMSSchema>;
export async function sendSMSCodeController({
  body,
}: SendSMSSchema): Promise<SendSMSPayload> {

  console.log(body)
  const response = await axios.post(
    `https://console.melipayamak.com/api/send/shared/67798f12b16441749c66f2a10ae881af`,
    body
  );
  console.log(response)
  return { recId: response.data.recId, status: response.data.status };
}

////
interface checkSMSRecievedPayload {
  results: string[];
  resultsAsCode: number[];
  status: string[];
  isSuccuss: boolean;
}

export async function checkSMSRecieved({
  SMSIds,
}: {
  SMSIds: number[];
}): Promise<checkSMSRecievedPayload> {
  const body = {
    recIds: SMSIds,
  };

  const response = await axios.post(
    `https://console.melipayamak.com/api/receive/status/67798f12b16441749c66f2a10ae881af`,
    body
  );

  return {
    results: response.data.results,
    resultsAsCode: response.data.resultsAsCode,
    status: response.data.status,
    isSuccuss: response.data.resultsAsCode[0] === 200 ? true : false,
  };
}
