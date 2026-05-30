import { AlertCircle, CheckCircle2, Clock3 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import type { AnalysisStatus } from "@/types/analysis";

type StatusPanelProps = {
  analysisId: string | null;
  pending: boolean;
  status?: AnalysisStatus;
  error?: Error | null;
};

export function StatusPanel({ analysisId, pending, status, error }: StatusPanelProps) {
  const currentStatus = status ?? (pending ? "processing" : null);

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">Analysis status</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0 text-sm text-muted-foreground">
            {analysisId ? (
              <span className="block truncate">{analysisId}</span>
            ) : (
              <span>No analysis yet</span>
            )}
          </div>
          {currentStatus ? <Badge variant="secondary">{currentStatus}</Badge> : null}
        </div>

        {pending ? <Progress value={72} /> : null}

        {status === "completed" ? (
          <div className="flex items-center gap-2 text-sm text-emerald-700">
            <CheckCircle2 className="h-4 w-4" />
            Completed
          </div>
        ) : null}

        {pending ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Clock3 className="h-4 w-4" />
            Processing
          </div>
        ) : null}

        {error ? (
          <Alert className="border-destructive/40">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Request error</AlertTitle>
            <AlertDescription>{error.message}</AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}
