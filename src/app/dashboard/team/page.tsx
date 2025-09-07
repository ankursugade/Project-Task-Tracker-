import { Header } from "@/components/Header";
import { MemberSection } from "@/components/dashboard/MemberSection";

export default function TeamPage() {
  return (
    <div className="flex min-h-screen w-full flex-col">
      <Header />
      <main className="flex flex-1 flex-col gap-8 p-4 md:p-8 lg:p-10">
        <MemberSection />
      </main>
    </div>
  );
}
