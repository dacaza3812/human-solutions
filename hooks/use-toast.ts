import type { Toast } from "@/components/ui/toast"

const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastsMap = Map<string, Toast>

type ActionType =
  | {
      type: "ADD_TOAST"
      toast: Toast
    }
  | {
      type: "UPDATE_TOAST"
      toast: Partial<Toast>
    }
  | {
      type: "DISMISS_TOAST"
      toastId?: Toast["id"]
    }
  | {
      type: "REMOVE_TOAST"
      toastId?: Toast["id"]
    }

interface State {
  toasts: Toast[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId\
