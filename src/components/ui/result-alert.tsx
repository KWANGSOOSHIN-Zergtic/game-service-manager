import { CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export interface ResultData {
  status: 'success' | 'error' | null;
  message: string;
  error?: string;
}

interface ResultAlertProps {
  result: ResultData;
  className?: string;
  successTitle?: string;
  errorTitle?: string;
}

export function ResultAlert({ 
  result, 
  className = "", 
  successTitle = "성공", 
  errorTitle = "실패" 
}: ResultAlertProps) {
  if (!result.status) return null;

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Alert 
        variant={result.status === 'success' ? 'default' : 'destructive'}
        className={`border ${
          result.status === 'success' 
            ? 'bg-green-50 border-green-200 text-green-800' 
            : 'bg-red-50 border-red-200 text-red-800'
        }`}
      >
        <div className="flex items-center gap-2">
          {result.status === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-green-600" />
          ) : (
            <XCircle className="h-5 w-5 text-red-600" />
          )}
          <AlertTitle className="text-base font-semibold">
            {result.status === 'success' ? successTitle : errorTitle}
          </AlertTitle>
        </div>
        <AlertDescription className="mt-2 ml-7">
          <div className="font-medium">{result.message}</div>
          {result.error && (
            <div className="mt-2 text-sm opacity-90">
              에러 코드: {result.error}
            </div>
          )}
        </AlertDescription>
      </Alert>
    </div>
  );
} 