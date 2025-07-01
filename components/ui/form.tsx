"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { Controller, FormProvider, useFormContext } from "react-hook-form"

import { cn } from "@/lib/utils"
import { Label } from "@/components/ui/label"

const Form = FormProvider

const FormField = ({ ...props }) => {
  return (
    <Controller
      {...props}
      render={({ field, fieldState: { error }, formState }) => {
        return (
          <FormFieldProvider
            value={{
              ...field,
              invalid: !!error,
              isDirty: formState.dirtyFields[field.name],
              isTouched: formState.touchedFields[field.name],
              error,
            }}
          >
            {props.children}
          </FormFieldProvider>
        )
      }}
    />
  )
}

const FormFieldProvider = ({ value, ...props }) => {
  const context = React.useMemo(() => value, [value])
  return <FormFieldContext.Provider value={context}>{props.children}</FormFieldContext.Provider>
}

const FormFieldContext = React.createContext({})

const useFormField = () => {
  const fieldContext = React.useContext(FormFieldContext)
  const { noValidate } = useFormContext()

  if (!fieldContext) {
    throw new Error("useFormField should be used within <FormField>")
  }

  return { ...fieldContext, noValidate }
}

const FormItemContext = React.createContext({})

const FormItem = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    const id = React.useId()

    return (
      <FormItemContext.Provider value={{ id }}>
        <div ref={ref} className={cn("space-y-2", className)} {...props} />
      </FormItemContext.Provider>
    )
  },
)
FormItem.displayName = "FormItem"

const FormLabel = React.forwardRef<React.ElementRef<typeof Label>, React.ComponentPropsWithoutRef<typeof Label>>(
  ({ className, ...props }, ref) => {
    const { error, id } = useFormField()

    return <Label ref={ref} className={cn(error && "text-destructive", className)} htmlFor={id} {...props} />
  },
)
FormLabel.displayName = "FormLabel"

const FormControl = React.forwardRef<React.ElementRef<typeof Slot>, React.ComponentPropsWithoutRef<typeof Slot>>(
  ({ ...props }, ref) => {
    const { error, id, name, noValidate } = useFormField()

    return (
      <Slot
        ref={ref}
        id={id}
        name={name}
        aria-describedby={error ? `${id}-form-item-message` : undefined}
        aria-invalid={!!error}
        {...props}
      />
    )
  },
)
FormControl.displayName = "FormControl"

const FormDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => {
    const { id } = useFormField()

    return (
      <p
        ref={ref}
        id={`${id}-form-item-description`}
        className={cn("text-[0.8rem] text-muted-foreground", className)}
        {...props}
      />
    )
  },
)
FormDescription.displayName = "FormDescription"

const FormMessage = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, children, ...props }, ref) => {
    const { error, id } = useFormField()
    const body = error ? String(error?.message) : children

    if (!body) {
      return null
    }

    return (
      <p
        ref={ref}
        id={`${id}-form-item-message`}
        className={cn("text-[0.8rem] font-medium text-destructive", className)}
        {...props}
      >
        {body}
      </p>
    )
  },
)
FormMessage.displayName = "FormMessage"

export { useFormField, Form, FormItem, FormLabel, FormControl, FormDescription, FormMessage, FormField }
