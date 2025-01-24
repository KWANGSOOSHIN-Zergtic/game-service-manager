import { Overview } from "@/components/dashboard/overview"
import { WorkingFormat } from "@/components/dashboard/working-format"
import { ProjectEmployment } from "@/components/dashboard/project-employment"
import { TotalApplications } from "@/components/dashboard/total-applications"
import { Birthdays } from "@/components/dashboard/birthdays"
import { Navigation } from "@/components/dashboard/navigation"

export default function DashboardPage() {
  return (
    <div className="p-8 flex flex-col gap-6">
      <Navigation />
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
    </div>
  )
} 