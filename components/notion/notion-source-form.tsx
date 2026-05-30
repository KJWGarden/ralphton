"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { FileSearch, Loader2 } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getDefaultAnalyzeRequest } from "@/lib/analysis/default-source";
import type { AnalyzeRequest } from "@/types/analysis";

const formSchema = z.object({
  sourceType: z.enum(["page", "data_source"]),
  sourceId: z.string().trim().min(8, "Enter a Notion page or data source ID."),
  includePageContent: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

type NotionSourceFormProps = {
  pending: boolean;
  onSubmit: (request: AnalyzeRequest) => void;
};

export function NotionSourceForm({ pending, onSubmit }: NotionSourceFormProps) {
  const defaultRequest = getDefaultAnalyzeRequest();
  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      sourceType: defaultRequest.sourceType,
      sourceId: defaultRequest.sourceType === "page" ? defaultRequest.pageId : defaultRequest.dataSourceId,
      includePageContent: false,
    },
  });

  const sourceType = useWatch({ control, name: "sourceType" });

  function submit(values: FormValues) {
    if (values.sourceType === "page") {
      onSubmit({ sourceType: "page", pageId: values.sourceId });
      return;
    }

    onSubmit({
      sourceType: "data_source",
      dataSourceId: values.sourceId,
      limit: 20,
      includePageContent: values.includePageContent,
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit(submit)}>
      <div className="space-y-2">
        <Label htmlFor="sourceType">Source type</Label>
        <select
          id="sourceType"
          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          {...register("sourceType")}
        >
          <option value="page">Page</option>
          <option value="data_source">Data source</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="sourceId">
          {sourceType === "page" ? "Page ID" : "Data source ID"}
        </Label>
        <Input
          id="sourceId"
          placeholder="Paste a Notion ID"
          aria-invalid={Boolean(errors.sourceId)}
          {...register("sourceId")}
        />
        {errors.sourceId ? (
          <p className="text-sm text-destructive">{errors.sourceId.message}</p>
        ) : null}
      </div>

      {sourceType === "data_source" ? (
        <label className="flex items-center gap-2 text-sm text-muted-foreground">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-input"
            {...register("includePageContent")}
          />
          Include page bodies
        </label>
      ) : null}

      <Button className="w-full gap-2" disabled={pending} type="submit">
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileSearch className="h-4 w-4" />}
        Analyze
      </Button>
    </form>
  );
}
