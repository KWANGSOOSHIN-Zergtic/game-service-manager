import { Overview } from "@/components/dashboard/overview"
import { WorkingFormat } from "@/components/dashboard/working-format"
import { ProjectEmployment } from "@/components/dashboard/project-employment"
import { TotalApplications } from "@/components/dashboard/total-applications"
import { Birthdays } from "@/components/dashboard/birthdays"

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 p-8">
      <h1 className="text-2xl font-bold">Overview</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Overview />
        <Birthdays />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <WorkingFormat />
        <ProjectEmployment />
        <TotalApplications />
      </div>
    </div>
  )
} 