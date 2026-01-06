import AppLogoIcon from "./app-logo-icon"
import { usePage } from "@inertiajs/react"

type AppLogoProps = {
  getName?: boolean
  className?: string
}

export default function AppLogo({
  getName = true,
  className,
}: AppLogoProps) {
  const { name } = usePage().props as { name?: string }

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex aspect-square size-8 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground ${className ?? ""}`}
      >
        <AppLogoIcon className="size-5 fill-current text-white dark:text-black" />
      </div>

      {getName && (
        <div className="grid text-left text-sm">
          <span className="truncate leading-tight font-semibold">
            {name ?? "Project Hub"}
          </span>
        </div>
      )}
    </div>
  )
}
