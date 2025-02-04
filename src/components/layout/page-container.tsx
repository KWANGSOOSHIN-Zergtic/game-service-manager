import { Navigation } from "@/components/dashboard/navigation"
import { PageTitle } from "@/components/ui/page-title"

interface PageContainerProps {
  path: string;
  children?: React.ReactNode;
}

export function PageContainer({ path, children }: PageContainerProps) {
  return (
    <div className="p-8 flex flex-col gap-6">
      <Navigation />
      <PageTitle path={path} />
      {children}
    </div>
  );
} 