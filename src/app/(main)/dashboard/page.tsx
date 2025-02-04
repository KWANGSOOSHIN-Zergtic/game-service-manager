import { Overview } from "@/components/dashboard/overview"
import { WorkingFormat } from "@/components/dashboard/working-format"
import { ProjectEmployment } from "@/components/dashboard/project-employment"
import { TotalApplications } from "@/components/dashboard/total-applications"
import { Birthdays } from "@/components/dashboard/birthdays"
import { PageContainer } from "@/components/layout/page-container"

export default function DashboardPage() {
  return (
    <PageContainer path="dashboard">
      <div className="space-y-6">
        <Overview />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <WorkingFormat />
          <ProjectEmployment />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <TotalApplications />
          <Birthdays />
        </div>
      </div>
    </PageContainer>
  )
} 