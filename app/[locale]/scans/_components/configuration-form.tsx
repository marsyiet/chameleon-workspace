"use client"

import { useState } from "react"
import { Controller, useFieldArray, UseFormReturn } from "react-hook-form"
import { PlusIcon, TrashIcon, CalendarIcon } from "lucide-react"
import { format } from "date-fns"

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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"

import { CreateScanFormValues } from "../_validators/create-scan-schema"
import { useOrganizations } from "@/hooks/organizations/use-organizations"

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

  const { data: organizations, isLoading: organizationsLoading } = useOrganizations()
  const organizationsArray = Array.isArray(organizations) ? organizations : []

  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [pendingDate, setPendingDate] = useState<Date | undefined>(
    undefined
  )
  const [pendingTime, setPendingTime] = useState("09:00")

  const [pendingAction, setPendingAction] = useState<"schedule" | "launch" | null>(null)

  const confirmSchedule = () => {
    if (!pendingDate) return

    const [hours, minutes] = pendingTime.split(":").map(Number)
    const scheduledAt = new Date(pendingDate)
    scheduledAt.setHours(hours, minutes, 0, 0)

    form.setValue("scheduledAt", scheduledAt, {
      shouldValidate: true,
    })

    setScheduleOpen(false)
    setPendingAction("schedule")
    form.handleSubmit(onSubmit)()
  }

  const launchNow = () => {
    form.setValue("scheduledAt", null)
    setPendingAction("launch")
    form.handleSubmit(onSubmit)()
  }

  const isScheduling = isPending && pendingAction === "schedule"
  const isLaunching = isPending && pendingAction === "launch"

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h3>Scan Configuration</h3>
        </CardTitle>
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
              name="targetOrganization"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Structure concernée (optionnel)</FieldLabel>

                  <Select
                    value={field.value ?? ""}
                    onValueChange={(v) => field.onChange(v === "__none__" ? null : v)}
                    disabled={organizationsLoading}
                  >
                    <SelectTrigger>
                      <SelectValue
                        placeholder={
                          organizationsLoading ? "Chargement..." : "Aucune structure sélectionnée"
                        }
                      />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectItem value="__none__">
                        Aucune (cartographie nationale)
                      </SelectItem>

                      {organizationsArray.map((org) => (
                        <SelectItem key={org._id} value={org._id}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

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
              <Popover
                open={scheduleOpen}
                onOpenChange={setScheduleOpen}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant={"secondary"}
                    loading={isScheduling}
                    disabled={isPending}
                    className="w-full"
                  >
                    <CalendarIcon className="size-4" />
                    Schedule Scan
                  </Button>
                </PopoverTrigger>

                <PopoverContent
                  className="w-auto p-3 space-y-3"
                  align="center"
                >
                  <Calendar
                    mode="single"
                    selected={pendingDate}
                    onSelect={setPendingDate}
                    disabled={(date) =>
                      date < new Date(new Date().setHours(0, 0, 0, 0))
                    }
                  />

                  <Input
                    type="time"
                    value={pendingTime}
                    onChange={(e) => setPendingTime(e.target.value)}
                  />

                  <Button
                    type="button"
                    className="w-full"
                    disabled={!pendingDate}
                    onClick={confirmSchedule}
                  >
                    Confirm{" "}
                    {pendingDate
                      ? format(pendingDate, "PPP") +
                        ` à ${pendingTime}`
                      : ""}
                  </Button>
                </PopoverContent>
              </Popover>

              <Button
                type="button"
                loading={isLaunching}
                disabled={isPending}
                className="w-full"
                onClick={launchNow}
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