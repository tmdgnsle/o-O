import { Calendar } from "@/components/ui/calendar";
import { useState } from "react";

export function CalendarDetail() {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const today = new Date();

  // 아이디어를 기록한 날짜들
  const datesWithIdeas = [
    new Date(2025, 10, 5), // 11월 5일
    new Date(2025, 9, 10),
    new Date(2025, 9, 15),
    new Date(2025, 9, 20),
  ];

  // 다음 달로 넘어가는 것 막기
  const handleMonthChange = (newMonth: Date) => {
    const todayMonth = today.getMonth();
    const todayYear = today.getFullYear();
    const newMonthValue = newMonth.getMonth();
    const newYear = newMonth.getFullYear();

    // 현재 월보다 미래면 막기
    if (
      newYear > todayYear ||
      (newYear === todayYear && newMonthValue > todayMonth)
    ) {
      return;
    }

    setMonth(newMonth);
  };

  // 다음 달 버튼이 비활성화되어야 하는지 확인
  const isNextDisabled =
    month.getFullYear() > today.getFullYear() ||
    (month.getFullYear() === today.getFullYear() &&
      month.getMonth() >= today.getMonth());

  return (
    <div>
      <Calendar
        mode="single"
        selected={date}
        onSelect={setDate}
        month={month}
        onMonthChange={handleMonthChange}
        modifiers={{
          withIdeas: datesWithIdeas, // 아이디어가 있는 날짜
        }}
        showOutsideDays={true} // 외부 날짜 안 보이게
        disabled={(date) => date > today}
        classNames={{
          button_next: isNextDisabled
            ? "!opacity-30 !cursor-not-allowed hover:!bg-transparent pointer-events-none"
            : "",
        }}
      />
    </div>
  );
}
