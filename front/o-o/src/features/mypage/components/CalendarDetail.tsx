import { Calendar } from "@/components/ui/calendar";
import { useEffect, useState } from "react";

interface CalendarDetailProps {
  onDateClick?: (
    keywords: Array<{ keyword: string; mindmapId: string }>
  ) => void;
}

export function CalendarDetail({ onDateClick }: CalendarDetailProps) {
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const today = new Date();

  // 날짜별 키워드 데이터 (실제로는 API에서 가져올 데이터)
  const dateKeywords: Record<
    string,
    Array<{ keyword: string; mindmapId: string }>
  > = {
    "2025-11-05": [
      { keyword: "운동", mindmapId: "1" },
      { keyword: "독서", mindmapId: "2" },
      { keyword: "공부", mindmapId: "3" },
      { keyword: "밥", mindmapId: "4" },
      { keyword: "삶", mindmapId: "5" },
      { keyword: "코끼리", mindmapId: "6" },
      { keyword: "침팬지", mindmapId: "7" },
      { keyword: "알고리즘", mindmapId: "8" },
      { keyword: "박소영", mindmapId: "1" },
      { keyword: "시니어", mindmapId: "2" },
      { keyword: "개발자", mindmapId: "3" },
      { keyword: "디자이너", mindmapId: "4" },
      { keyword: "엄마", mindmapId: "5" },
      { keyword: "할머니", mindmapId: "6" },
      { keyword: "농사", mindmapId: "7" },
      { keyword: "아.", mindmapId: "8" },
    ],
    "2025-10-10": [
      { keyword: "회의", mindmapId: "1" },
      { keyword: "프로젝트", mindmapId: "2" },
      { keyword: "발표", mindmapId: "3" },
    ],
    "2025-10-15": [
      { keyword: "휴식", mindmapId: "4" },
      { keyword: "영화감상", mindmapId: "5" },
    ],
    "2025-10-20": [
      { keyword: "코딩", mindmapId: "6" },
      { keyword: "리뷰", mindmapId: "7" },
    ],
  };

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
    <div className="scale-[0.7] sm:scale-80 md:scale-90 xl:scale-100 origin-top -mb-14 lg:mb-0">
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
