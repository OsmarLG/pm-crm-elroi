import { useDroppable } from "@dnd-kit/core"
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable"
import { TaskCard } from "./task-card"

import { Task } from "./index"

type Props = {
    id: string
    title: string
    tasks: Task[]
    onEdit: (task: Task) => void
    onDelete: (taskId: number) => void
}

export function TaskColumn({ id, title, tasks, onEdit, onDelete }: Props) {
    const { setNodeRef } = useDroppable({
        id: id,
    })

    return (
        <div className="flex flex-col w-80 shrink-0">
            <div className="flex items-center justify-between mb-3 px-1">
                <h3 className="font-semibold text-sm text-gray-500">{title}</h3>
                <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs font-medium">
                    {tasks.length}
                </span>
            </div>
            <div
                ref={setNodeRef}
                className="bg-gray-50/50 rounded-lg p-2 min-h-[500px] border-2 border-dashed border-gray-200 flex flex-col gap-3"
            >
                <SortableContext
                    id={id}
                    items={tasks.map((t) => t.id)}
                    strategy={verticalListSortingStrategy}
                >
                    {tasks.map((task) => (
                        <TaskCard
                            key={task.id}
                            task={task}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </SortableContext>
            </div>
        </div>
    )
}
