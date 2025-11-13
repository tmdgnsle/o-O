import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";
import type { NodeListResponseArray } from "../../types/mypage";

interface CalendarDetailProps {
  readonly onDateClick?: (
    keywords: Array<{ keyword: string; mindmapId: string }>
  ) => void;
  readonly isFullscreen: boolean;
  readonly calendarNodes: NodeListResponseArray;
}

export function CalendarDetail({
  onDateClick,
  isFullscreen,
  calendarNodes,
}: CalendarDetailProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const today = new Date();

  // calendarNodes에서 날짜별 키워드 객체 생성
  const dateKeywords: Record<
    string,
    Array<{ keyword: string; mindmapId: string }>
  > = {};

  // 컴포넌트 마운트 시 오늘 날짜의 키워드 자동 로드
  useEffect(() => {
    if (onDateClick) {
      const todayStr = formatDate(today);
      const keywords = dateKeywords[todayStr] || [];
      if (keywords.length > 0) {
        onDateClick(keywords);
      }
    }
  }, []);

  // 키워드가 있는 날짜들 추출
  const datesWithIdeas = Object.keys(dateKeywords).map((dateStr) => {
    const [year, month, day] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
  });

  // 날짜를 "YYYY-MM-DD" 형식으로 변환
  const formatDate = (date: Date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // 날짜 선택 핸들러
  const handleDateSelect = (selectedDate: Date | undefined) => {
    if (!selectedDate) {
      return;
    }

    setDate(selectedDate);

    if (selectedDate && onDateClick) {
      const dateStr = formatDate(selectedDate);
      const keywords = dateKeywords[dateStr] || [];
      onDateClick(keywords);
    }
  };

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
    <div
      className={`
        ${
          isFullscreen
            ? "scale-110 pl-8 w-[40vh]"
            : "scale-[0.7] md:scale-[0.8] xl:scale-[0.9] -mt-2 md:-mt-0 w-[30vh] sm:w-[35vh] md:w-[40vh] lg:w-[45vh] h-[40vh]"
        } 
            origin-top-left pl-3
        `}
    >
      <Calendar
        mode="single"
        selected={date}
        onSelect={handleDateSelect}
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
