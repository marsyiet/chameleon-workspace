"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"

import ConfigurationForm from "../_components/configuration-form"
import Preview from "../_components/preview"

import {
  createScanSchema,
  CreateScanFormValues,
} from "../_validators/create-scan-schema"

import { useRouter } from "next/navigation"

import { useCreateScan } from "@/hooks/scans/use-create-scan"
import { toast } from "sonner"

export default function NewScan() {

  const router = useRouter()

  const createScanMutation = useCreateScan()

  const form = useForm<CreateScanFormValues>({
    resolver: zodResolver(createScanSchema),
    defaultValues: {
      name: "",
      description: "",
      scanType: "full",
      targets: [
        {
          target: "",
          targetType: "cidr",
        },
      ],
    },
  })

  const onSubmit = async (
    values: CreateScanFormValues
  ) => {
    try {
      const res = await createScanMutation.mutateAsync(
        values
      )

      toast.success(
        "SCAN_CREATION_SUCCESS"
      )
      console.log("RES", res)
      router.push(
        `/scans/${res.data.id}`
      )
    } catch (error: any) {
      toast.error(
        error.message || "SCAN_CREATION_FAILED"
      )
    }
  }

  return (
    <div className="space-y-4">
      <h3>New scan</h3>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ConfigurationForm
            form={form}
            onSubmit={onSubmit}
            isPending={createScanMutation.isPending}
          />
        </div>

        <div className="lg:col-span-2">
          <Preview form={form} />
        </div>
      </div>
    </div>
  )
}