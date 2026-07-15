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
  // Structure auditée par ce scan (ex: "MINFI") — texte libre, optionnel.
  // Se propage à tous les actifs découverts (voir chapitre 2, §2.1.4).
  targetOrganization: z
    .string()
    .max(100)
    .optional(),
  scheduledAt: z
    .date()
    .nullable()
    .optional()
    .refine(
      (date) => !date || date > new Date(),
      { message: "La date programmée doit être dans le futur" }
    ),
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