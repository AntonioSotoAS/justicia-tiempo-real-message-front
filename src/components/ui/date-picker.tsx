"use client"

import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react"
import { es } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

interface DatePickerProps {
  value?: Date
  onChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  value,
  onChange,
  placeholder = "Seleccionar fecha",
  disabled = false,
}: DatePickerProps) {
  const [currentMonth, setCurrentMonth] = React.useState(new Date())
  
  const goToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonthIndex = today.getMonth()
    
    // Solo permitir navegación si el mes no es anterior al actual
    if (newMonth.getFullYear() > currentYear || 
        (newMonth.getFullYear() === currentYear && newMonth.getMonth() >= currentMonthIndex)) {
      setCurrentMonth(newMonth)
    }
  }
  
  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    const days = []
    
    // Días del mes anterior para completar la primera semana
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const day = new Date(year, month, -i)
      days.push({ date: day, isCurrentMonth: false })
    }
    
    // Días del mes actual
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day)
      days.push({ date, isCurrentMonth: true })
    }
    
    // Días del mes siguiente para completar la última semana
    const remainingDays = 42 - days.length
    for (let day = 1; day <= remainingDays; day++) {
      const date = new Date(year, month + 1, day)
      days.push({ date, isCurrentMonth: false })
    }
    
    return days
  }

  const days = getDaysInMonth(currentMonth)
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

  const handleDateClick = (date: Date) => {
    onChange?.(date)
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const isSelected = (date: Date) => {
    if (!value) return false
    return date.toDateString() === value.toDateString()
  }

  const isDateDisabled = (date: Date) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0) // Resetear horas para comparar solo fechas
    const compareDate = new Date(date)
    compareDate.setHours(0, 0, 0, 0)
    return compareDate < today
  }

  const canGoToPreviousMonth = () => {
    const newMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1)
    const today = new Date()
    const currentYear = today.getFullYear()
    const currentMonthIndex = today.getMonth()
    
    return newMonth.getFullYear() > currentYear || 
           (newMonth.getFullYear() === currentYear && newMonth.getMonth() >= currentMonthIndex)
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground"
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {value ? format(value, "dd/MM/yyyy", { locale: es }) : placeholder}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-4" align="start">
        <div className="space-y-4">
          {/* Header con mes y año */}
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={goToPreviousMonth}
              disabled={!canGoToPreviousMonth()}
              className={!canGoToPreviousMonth() ? "opacity-50 cursor-not-allowed" : ""}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <h3 className="font-semibold text-lg">
              {format(currentMonth, "MMMM yyyy", { locale: es })}
            </h3>
            <Button variant="ghost" size="sm" onClick={goToNextMonth}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1">
            {weekDays.map((day) => (
              <div key={day} className="text-center text-sm font-medium text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Días del mes */}
          <div className="grid grid-cols-7 gap-1">
            {days.map((day, index) => {
              const isDisabled = isDateDisabled(day.date)
              return (
                <Button
                  key={index}
                  variant="ghost"
                  size="sm"
                  disabled={isDisabled}
                  className={cn(
                    "h-8 w-8 p-0 text-sm",
                    !day.isCurrentMonth && "text-muted-foreground opacity-50",
                    isToday(day.date) && "bg-accent text-accent-foreground font-semibold",
                    isSelected(day.date) && "bg-primary text-primary-foreground",
                    isDisabled && "opacity-50 cursor-not-allowed text-muted-foreground",
                    day.isCurrentMonth && !isDisabled && "hover:bg-accent hover:text-accent-foreground"
                  )}
                  onClick={() => day.isCurrentMonth && !isDisabled && handleDateClick(day.date)}
                >
                  {day.date.getDate()}
                </Button>
              )
            })}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
