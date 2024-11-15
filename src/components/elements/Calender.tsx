import React from "react";
import { Form, Input } from "antd";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface CalendarProps {
  selectedDate: Date | [Date, Date] | null;
  onDateChange: (date: Date | [Date, Date] | null) => void;
  label: string;
  isRange?: boolean;
  minDate?: Date;
}

const Calendar: React.FC<CalendarProps> = ({ selectedDate, onDateChange, label, isRange = false, minDate }) => {
  const currentDate = new Date();
  currentDate.setHours(0, 0, 0, 0);

  return (
    <Form.Item label={label} style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ border: '1px solid black', padding: '4px 8px 0px 8px', width: '100%' }}>
        <DatePicker
          selected={Array.isArray(selectedDate) ? selectedDate[0] : selectedDate}
          onChange={(date: Date | [Date, Date] | null) => onDateChange(date)}
          startDate={Array.isArray(selectedDate) ? selectedDate[0] : undefined}
          endDate={Array.isArray(selectedDate) ? selectedDate[1] : undefined}
          {...(isRange && { selectsRange: true })}
          filterDate={(date) => date >= currentDate && (!minDate || date >= minDate)}
          placeholderText={`Select ${label.toLowerCase()}`}
          customInput={<Input />}
        />
      </div>
    </Form.Item>
  );
};

export default Calendar;
