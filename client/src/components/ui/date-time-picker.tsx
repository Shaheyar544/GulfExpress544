import * as React from "react";
import { format } from "date-fns";
import { Calendar as CalendarIcon, Clock } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

interface DateTimePickerProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export function DateTimePicker({
  value,
  onChange,
  placeholder = "Pick a date and time",
  className,
}: DateTimePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Parse initial date from value
  const parseDate = React.useCallback((val: string | undefined): Date | undefined => {
    if (!val) return undefined;

    const today = new Date();
    const lowerValue = val.toLowerCase();

    if (lowerValue.includes("today")) {
      // Extract time from "Today, 4:30 PM"
      const timeMatch = val.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        const hours = parseInt(timeMatch[1]);
        const minutes = parseInt(timeMatch[2]);
        const ampm = timeMatch[3].toUpperCase();
        let hour24 = hours === 12 ? 0 : hours;
        if (ampm === "PM") hour24 += 12;
        today.setHours(hour24, minutes, 0, 0);
        return today;
      }
      return today;
    }

    // Try parsing as ISO date string
    const parsed = new Date(val);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    return undefined;
  }, []);

  const [date, setDate] = React.useState<Date | undefined>(() => parseDate(value));

  // Parse time parts from value or date
  const parseTimeParts = React.useCallback((val: string | undefined, dateValue: Date | undefined): { hour: number; minute: number; ampm: string } => {
    if (val) {
      const lowerValue = val.toLowerCase();
      if (lowerValue.includes("today") || lowerValue.includes(",")) {
        const timeMatch = val.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
        if (timeMatch) {
          return {
            hour: parseInt(timeMatch[1]),
            minute: parseInt(timeMatch[2]),
            ampm: timeMatch[3].toUpperCase(),
          };
        }
      }
    }
    if (dateValue) {
      const formatted = format(dateValue, "h:mm a");
      const timeMatch = formatted.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (timeMatch) {
        return {
          hour: parseInt(timeMatch[1]),
          minute: parseInt(timeMatch[2]),
          ampm: timeMatch[3].toUpperCase(),
        };
      }
    }
    return { hour: 12, minute: 0, ampm: "PM" };
  }, []);

  const [timeParts, setTimeParts] = React.useState<{ hour: number; minute: number; ampm: string }>(() =>
    parseTimeParts(value, date)
  );

  // Sync timeParts when value changes
  React.useEffect(() => {
    const parsedDate = parseDate(value);
    if (parsedDate) {
      setDate(parsedDate);
      setTimeParts(parseTimeParts(value, parsedDate));
    }
  }, [value, parseDate, parseTimeParts]);

  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) return;

    // Apply the time to the selected date
    let hour24 = timeParts.hour === 12 ? 0 : timeParts.hour;
    if (timeParts.ampm === "PM") hour24 += 12;
    selectedDate.setHours(hour24, timeParts.minute, 0, 0);

    setDate(selectedDate);
  };

  const handleTimeChange = (field: "hour" | "minute" | "ampm", value: string | number) => {
    const newTimeParts = { ...timeParts };
    if (field === "hour") newTimeParts.hour = typeof value === "number" ? value : parseInt(value);
    if (field === "minute") newTimeParts.minute = typeof value === "number" ? value : parseInt(value);
    if (field === "ampm") newTimeParts.ampm = value as string;

    setTimeParts(newTimeParts);

    // Update the date with new time if date is already selected
    if (date) {
      let hour24 = newTimeParts.hour === 12 ? 0 : newTimeParts.hour;
      if (newTimeParts.ampm === "PM") hour24 += 12;

      const updatedDate = new Date(date);
      updatedDate.setHours(hour24, newTimeParts.minute, 0, 0);
      setDate(updatedDate);
    }
  };

  const handleApply = () => {
    if (!date) return;

    // Ensure time is applied to the date
    const finalDate = new Date(date);
    let hour24 = timeParts.hour === 12 ? 0 : timeParts.hour;
    if (timeParts.ampm === "PM") hour24 += 12;
    finalDate.setHours(hour24, timeParts.minute, 0, 0);

    // Format the date and time
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedDateStart = new Date(finalDate);
    selectedDateStart.setHours(0, 0, 0, 0);

    const isToday = selectedDateStart.getTime() === today.getTime();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow = selectedDateStart.getTime() === tomorrow.getTime();

    let formattedValue: string;

    if (isToday) {
      formattedValue = `Today, ${format(finalDate, "h:mm a")}`;
    } else if (isTomorrow) {
      formattedValue = `Tomorrow, ${format(finalDate, "h:mm a")}`;
    } else {
      formattedValue = format(finalDate, "EEE, MMM d, yyyy, h:mm a");
    }

    onChange(formattedValue);
    setOpen(false);
  };

  const displayValue = value || placeholder;

  // Generate minute options (0, 15, 30, 45)
  const minuteOptions = [0, 15, 30, 45];

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-start text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {displayValue}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="p-2 space-y-3">
          <Calendar
            mode="single"
            selected={date}
            onSelect={handleDateSelect}
            initialFocus
            className="p-1"
            classNames={{
              day: "h-7 w-7 p-0 font-normal aria-selected:opacity-100",
              cell: "h-7 w-7 text-center text-xs p-0 relative [&:has([aria-selected])]:bg-accent first:[&:has([aria-selected])]:rounded-l-md last:[&:has([aria-selected])]:rounded-r-md focus-within:relative focus-within:z-20",
              head_cell: "text-muted-foreground rounded-md w-7 font-normal text-[0.8rem]",
              row: "flex w-full mt-1",
            }}
          />
          <div className="space-y-2 border-t pt-3">
            <Label className="text-xs font-semibold">Time</Label>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <Select
                value={timeParts.hour.toString()}
                onValueChange={(value) => handleTimeChange("hour", parseInt(value))}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((h) => (
                    <SelectItem key={h} value={h.toString()} className="text-xs">
                      {h}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-muted-foreground text-xs">:</span>
              <Select
                value={timeParts.minute.toString()}
                onValueChange={(value) => handleTimeChange("minute", parseInt(value))}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {minuteOptions.map((m) => (
                    <SelectItem key={m} value={m.toString()} className="text-xs">
                      {String(m).padStart(2, '0')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={timeParts.ampm}
                onValueChange={(value) => handleTimeChange("ampm", value)}
              >
                <SelectTrigger className="w-16 h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="AM" className="text-xs">AM</SelectItem>
                  <SelectItem value="PM" className="text-xs">PM</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleApply}
              className="flex-1 h-8 text-xs"
              disabled={!date}
            >
              Apply
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setOpen(false)}
              className="flex-1 h-8 text-xs"
            >
              Cancel
            </Button>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}