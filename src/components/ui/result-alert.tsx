import { AlertTriangle, CheckCircle2, XCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export interface ResultData {
  status: 'success' | 'error' | null;
  message: string;
  error?: string;
  type?: 'default' | 'warning' | 'error';
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

  const getAlertStyle = () => {
    if (result.status === 'error') {
      return {
        variant: 'destructive' as const,
        bgColor: 'bg-red-50',
        borderColor: 'border-red-200',
        textColor: 'text-red-800',
        iconColor: 'text-red-600',
        Icon: XCircle
      };
    }
    
    if (result.type === 'warning') {
      return {
        variant: 'default' as const,
        bgColor: 'bg-yellow-50',
        borderColor: 'border-yellow-200',
        textColor: 'text-yellow-800',
        iconColor: 'text-yellow-600',
        Icon: AlertTriangle
      };
    }

    return {
      variant: 'default' as const,
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      textColor: 'text-green-800',
      iconColor: 'text-green-600',
      Icon: CheckCircle2
    };
  };

  const style = getAlertStyle();

  return (
    <div className={`rounded-lg overflow-hidden ${className}`}>
      <Alert 
        variant={style.variant}
        className={`border ${style.bgColor} ${style.borderColor} ${style.textColor}`}
      >
        <div className="flex items-center gap-2">
          <style.Icon className={`h-5 w-5 ${style.iconColor}`} />
          <AlertTitle className="text-base font-semibold">
            {result.status === 'success' ? successTitle : errorTitle}
          </AlertTitle>
        </div>
        <AlertDescription className="mt-2 ml-7 whitespace-pre-line">
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