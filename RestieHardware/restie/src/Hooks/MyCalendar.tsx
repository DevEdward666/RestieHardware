import React, { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../pages/Orders/Orderlist/OrderListPage.css";
import "./MyCalendar.css";
interface IDateRange {
  onDateRangeSelected: (startDate: Date, endDate: Date) => void;
}
const MyCalendar: React.FC<IDateRange> = ({ onDateRangeSelected }) => {
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);

  const handleDateChange = (date: any) => {
    const sortedDates = date.sort(
      (a: Date, b: Date) => a.getTime() - b.getTime()
    );
    if (Array.isArray(date)) {
      // Sort the dates in ascending order
      setSelectedDates(sortedDates);
    } else if (date instanceof Date) {
      // If no dates selected or only one date selected, treat as beginning date
      if (selectedDates.length === 0 || selectedDates.length === 1) {
        setSelectedDates([date]);
      } else {
        // If two dates already selected, treat as a new beginning date
        setSelectedDates(sortedDates);
      }
    }
  };

  useEffect(() => {
    if (selectedDates.length === 2) {
      onDateRangeSelected(selectedDates[0], selectedDates[1]);
    }
  }, [selectedDates]);

  return (
    <div>
      <Calendar onChange={handleDateChange} selectRange={true} />
    </div>
  );
};

export default MyCalendar;
