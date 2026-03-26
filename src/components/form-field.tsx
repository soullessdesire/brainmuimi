// src/components/FormField.tsx
import React from 'react'
import { Label } from './ui/label'
import { cn } from '../lib/utils'

interface FormFieldProps {
  label:     string
  htmlFor?:  string
  className?: string
  children:  React.ReactNode
}

export function FormField({ label, htmlFor, className, children }: FormFieldProps) {
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  )
}