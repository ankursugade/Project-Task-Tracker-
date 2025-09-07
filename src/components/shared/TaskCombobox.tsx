"use client"

import * as React from "react"
import { Check, ChevronsUpDown, Link2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import type { Task } from "@/lib/types"

interface TaskComboboxProps {
  tasks: Task[];
  selectedTask: string;
  setSelectedTask: (taskId: string) => void;
  placeholder?: string;
}

export function TaskCombobox({ tasks, selectedTask, setSelectedTask, placeholder="Select task..." }: TaskComboboxProps) {
  const [open, setOpen] = React.useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedTask
            ? tasks.find((task) => task.id === selectedTask)?.name
            : placeholder}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command>
          <CommandInput placeholder="Search task..." />
          <CommandList>
            <CommandEmpty>No task found.</CommandEmpty>
            <CommandGroup>
              {tasks.map((task) => (
                <CommandItem
                  key={task.id}
                  value={task.name}
                  onSelect={() => {
                    setSelectedTask(task.id === selectedTask ? "" : task.id)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      selectedTask === task.id ? "opacity-100" : "opacity-0"
                    )}
                  />
                   <Link2 className="h-4 w-4 mr-2 text-muted-foreground" />
                  {task.name}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
