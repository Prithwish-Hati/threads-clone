import * as z from 'zod';

export const ThreadValidation = z.object({
    thread: z.string().nonempty().min(10, { message: "Minimum 10 characters"}),
    accountId: z.string(),
})

export const CommentValidation = z.object({
    thread: z.string().nonempty().min(10, { message: "Minimum 10 characters"}),
})