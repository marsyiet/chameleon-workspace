"use client"

import { Controller, useFieldArray, UseFormReturn } from "react-hook-form"
import { PlusIcon, TrashIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import { CreateScanFormValues } from "../_validators/create-scan-schema"

interface ConfigurationFormProps {
  form: UseFormReturn<CreateScanFormValues>
  isPending: boolean
  onSubmit: (
    values: CreateScanFormValues
  ) => Promise<void>
}

export default function ConfigurationForm({
  form,
  onSubmit,
  isPending,
}: ConfigurationFormProps) {
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "targets",
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scan Configuration</CardTitle>
      </CardHeader>

      <CardContent>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Name</FieldLabel>

                  <Input
                    {...field}
                    placeholder="External Attack Surface"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Description</FieldLabel>

                  <Textarea
                    {...field}
                    placeholder="Production infrastructure"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="scanType"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Scan Type</FieldLabel>

                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="network">
                        Network
                      </SelectItem>

                      <SelectItem value="web">
                        Web
                      </SelectItem>

                      <SelectItem value="full">
                        Full
                      </SelectItem>
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium">
                  Targets
                </h3>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    append({
                      target: "",
                      targetType: "cidr",
                    })
                  }
                >
                  <PlusIcon className="size-4" />
                  Add Target
                </Button>
              </div>

              {fields.map((item, index) => (
                <div
                  key={item.id}
                  className="flex gap-2"
                >
                  <Controller
                    name={`targets.${index}.targetType`}
                    control={form.control}
                    render={({ field }) => (
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>

                        <SelectContent>
                          <SelectItem value="ip">
                            IP
                          </SelectItem>

                          <SelectItem value="cidr">
                            CIDR
                          </SelectItem>

                          <SelectItem value="domain">
                            Domain
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                  />

                  <Controller
                    name={`targets.${index}.target`}
                    control={form.control}
                    render={({ field }) => {
                      const targetType = form.watch(
                        `targets.${index}.targetType`
                      )

                      return (
                        <Input
                          {...field}
                          placeholder={
                            targetType === "ip"
                              ? "8.8.8.8"
                              : targetType === "cidr"
                                ? "192.168.1.0/24"
                                : "google.com"
                          }
                        />
                      )
                    }}
                  />

                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    disabled={fields.length === 1}
                    onClick={() => remove(index)}
                  >
                    <TrashIcon className="size-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 mt-4 items-center relative w-full gap-4">
              <Button
                variant={"secondary"}
                loading={isPending}
                className="w-full"
              >
                Schedule Scan
              </Button>
              <Button
                type="submit"
                loading={isPending}
                className="w-full"
              >
                Launch scan
              </Button>
            </div>
          </FieldGroup>
        </form>
      </CardContent>
    </Card>
  )
}