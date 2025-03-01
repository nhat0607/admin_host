const currentDate = new Date(); 
const [isCalendarVisible, setIsCalendarVisible] = useState(false);
const [bookDate, setBookDates] = useState([]);
const [selectedDates, setSelectedDates] = useState([]);

const handleCalendarOpen = (availableDates, bookDates) => {
  setSelectedDates(
    availableDates.map(({ startDate, endDate }) => ({
      startDate: new Date(startDate),
      endDate: new Date(endDate),
    }))
  );
  setBookDates(
    bookDates.map(({ startDate, endDate }) => {
      const formattedStartDate = new Date(startDate).toISOString().split("T")[0]; // Lấy ngày
      const tempEndDate = new Date(endDate); // Tạo đối tượng Date từ endDate
      tempEndDate.setDate(tempEndDate.getDate() - 1); // Trừ 1 ngày
      const formattedEndDate = tempEndDate.toISOString().split("T")[0]; // Lấy ngày đã trừ
  
      return {
        startDate: formattedStartDate,
        endDate: formattedEndDate,
      };
    })
  );
  setIsCalendarVisible(true);
};

const handleCalendarClose = () => {
  setIsCalendarVisible(false);
  setSelectedDates([]);
};

const expiredDates = selectedDates.map(({ startDate, endDate }) => {
  if (endDate < currentDate) {
    return { startDate, endDate };
  } else if (startDate <= currentDate && currentDate <= endDate) {
    const adjustedEndDate = new Date(currentDate);
    adjustedEndDate.setDate(adjustedEndDate.getDate() ); 
    return { startDate, endDate: adjustedEndDate };
  } else {
    return { };
  }
});
// console.log(currentDate);
// console.log(expiredDates);
const dateCellRender = (date) => {
  const isAvailable = selectedDates.some(({ startDate, endDate }) => {
    return date >= startDate && date <= endDate;
  });
  console.log("book Date", bookDate);
  const isBooked = bookDate.some(({ startDate, endDate }) => {
    const dates = new Date(date.$d).toISOString().split("T")[0];
    console.log(dates);
    return dates >= startDate && dates <= endDate;
  });
  console.log("test",isBooked);
  const isExpired = expiredDates.some(({ startDate, endDate }) => {
    return date >= startDate && date <= endDate;
  });

  if (isBooked) {
    return <div className="calendar-cell booked"></div>;
  }

  if (isExpired) {
    return <div className="calendar-cell expired"></div>;
  }

  if (isAvailable) {
    return <div className="calendar-cell available"></div>;
  }

  return <div className="calendar-cell"></div>;;
};


<Modal
title="Available Dates"
open={isCalendarVisible}
onCancel={handleCalendarClose}
style={{ height: '400px', top: '20 %' }}
footer={null}
>
<Calendar dateCellRender={dateCellRender}  fullscreen={false} />
</Modal>


