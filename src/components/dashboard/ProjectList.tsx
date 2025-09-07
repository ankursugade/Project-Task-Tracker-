import type { Project } from "@/lib/types";
import { ProjectCard } from "./ProjectCard";

interface ProjectListProps {
  projects: Project[];
}

export function ProjectList({ projects }: ProjectListProps) {
  if (projects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-64 mt-8 border-2 border-dashed rounded-lg">
        <p className="text-muted-foreground">No projects found.</p>
        <p className="text-sm text-muted-foreground">Try adjusting your filters or adding a new project.</p>
      </div>
    );
  }

  return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {projects.map((project) => (
          <ProjectCard key={project.id} project={project} />
        ))}
      </div>
  );
}
