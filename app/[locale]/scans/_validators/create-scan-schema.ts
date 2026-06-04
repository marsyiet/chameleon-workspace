import { z } from "zod"

export const createScanSchema = z.object({
  name: z
    .string()
    .min(3)
    .max(100),

  description: z
    .string()
    .max(500)
    .optional(),

  scanType: z.enum([
    "network",
    "web",
    "full",
  ]),

  targets: z
    .array(
      z.object({
        target: z.string().min(1),
        targetType: z.enum([
          "ip",
          "cidr",
          "domain",
        ]),
      })
    )
    .min(1),
})

export type CreateScanFormValues =
  z.infer<
    typeof createScanSchema
  >