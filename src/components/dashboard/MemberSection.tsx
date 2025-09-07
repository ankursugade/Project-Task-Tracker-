import { MemberList } from "./MemberList";

export function MemberSection() {
  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight font-headline">
          Team Overview
        </h2>
        {/* Add Member button can be added here if needed */}
      </div>
      <MemberList />
    </section>
  );
}
