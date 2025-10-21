"use client"

import * as React from "react"
import { Clock } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface TimePickerProps {
  value?: string
  onChange?: (time: string) => void
  placeholder?: string
  disabled?: boolean
}

export function TimePicker({
  value,
  onChange,
  placeholder = "Seleccionar hora",
  disabled = false,
}: TimePickerProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [hours, setHours] = React.useState("")
  const [minutes, setMinutes] = React.useState("")

  React.useEffect(() => {
    if (value) {
      const [h, m] = value.split(":")
      setHours(h || "")
      setMinutes(m || "")
    }
  }, [value])

  const handleTimeChange = (h: string, m: string) => {
    const formattedTime = `${h.padStart(2, "0")}:${m.padStart(2, "0")}`
    onChange?.(formattedTime)
  }

  const handleHoursChange = (h: string) => {
    const validHours = Math.min(23, Math.max(0, parseInt(h) || 0)).toString()
    setHours(validHours)
    handleTimeChange(validHours, minutes)
  }

  const handleMinutesChange = (m: string) => {
    const validMinutes = Math.min(59, Math.max(0, parseInt(m) || 0)).toString()
    setMinutes(validMinutes)
    handleTimeChange(hours, validMinutes)
  }

  return (
    <div className="relative">
      <Button
        type="button"
        variant="outline"
        className={cn(
          "w-full justify-start text-left font-normal",
          !value && "text-muted-foreground"
        )}
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
      >
        <Clock className="mr-2 h-4 w-4" />
        {value || placeholder}
      </Button>
      
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover p-3 shadow-md">
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="flex-1">
                <Label htmlFor="hours" className="text-xs text-muted-foreground">
                  Horas
                </Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  max="23"
                  value={hours}
                  onChange={(e) => handleHoursChange(e.target.value)}
                  placeholder="00"
                  className="text-center"
                />
              </div>
              <div className="text-lg font-bold">:</div>
              <div className="flex-1">
                <Label htmlFor="minutes" className="text-xs text-muted-foreground">
                  Minutos
                </Label>
                <Input
                  id="minutes"
                  type="number"
                  min="0"
                  max="59"
                  value={minutes}
                  onChange={(e) => handleMinutesChange(e.target.value)}
                  placeholder="00"
                  className="text-center"
                />
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="button"
                size="sm"
                onClick={() => setIsOpen(false)}
              >
                Aceptar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
