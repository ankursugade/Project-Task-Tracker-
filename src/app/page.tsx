import { Header } from "@/components/Header";
import { ProjectSection } from "@/components/dashboard/ProjectSection";
import { MemberSection } from "@/components/dashboard/MemberSection";
import { Separator } from "@/components/ui/separator";

export default function DashboardPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 lg:p-10">
        <ProjectSection />
        <Separator className="my-4" />
        <MemberSection />
      </main>
    </div>
  );
}
