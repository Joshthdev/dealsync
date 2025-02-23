import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function removeTrailingSlash(path: string) {
  return path.replace(/\/$/, "")
}

export function createURL(
  href: string,
  oldParams: Record<string, string>,
  newParams: Record<string, string | undefined>
) {
  const params = new URLSearchParams()

  // Ensure oldParams are strings
  Object.entries(oldParams).forEach(([key, value]) => {
    if (typeof key === "symbol" || typeof value === "symbol") {
      console.error("Invalid key or value in oldParams:", key, value)
      return // Skip Symbols
    }
    params.set(String(key), String(value))
  })

  // Update with newParams
  Object.entries(newParams).forEach(([key, value]) => {
    if (typeof key === "symbol") {
      console.error("Invalid key in newParams:", key)
      return
    }

    if (value === undefined) {
      params.delete(String(key))
    } else if (typeof value === "symbol") {
      console.error("Invalid value in newParams:", key, value)
      return
    } else {
      params.set(String(key), String(value))
    }
  })

  return `${href}?${params.toString()}`
}