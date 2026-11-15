import { formFields } from '@k8ordo/form/server';
import * as z from 'zod/mini';

const MAX_MESSAGE_LENGTH = 255;

// api の /public/inquiries が受け取る形と同じ長さの決まり
const contactSchema = z.object({
  message: z
    .string()
    .check(
      z.minLength(1, 'お問い合わせの内容を入力してください'),
      z.maxLength(
        MAX_MESSAGE_LENGTH,
        `${MAX_MESSAGE_LENGTH.toString()}文字を超えています`,
      ),
    ),
});

export const contactFields = formFields(contactSchema);

export type ContactFields = typeof contactFields;
