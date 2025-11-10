import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";
import { useDrawerDimensions } from "../../hooks/custom/useDrawerDimensions";
import { DrawerToggleButton } from "./DrawerToggleButton";
import { KeywordButton } from "./KeywordButton";

export interface Keyword {
  id: number;
  keyword: string;
}

export const EXPAND_KEYWORDS: Keyword[] = [
  { id: 1, keyword: "소영언니" },
  { id: 2, keyword: "짱짱걸" },
  { id: 3, keyword: "키워드3" },
  { id: 4, keyword: "키워드4" },
  { id: 5, keyword: "키워드5" },
  { id: 6, keyword: "키워드6" },
  { id: 7, keyword: "키워드7" },
  { id: 8, keyword: "키워드8" },
  { id: 9, keyword: "소영언니2" },
  { id: 10, keyword: "짱짱걸2" },
  { id: 11, keyword: "키워드11" },
  { id: 12, keyword: "키워드12" },
  { id: 13, keyword: "키워드13" },
  { id: 14, keyword: "키워드14" },
  { id: 15, keyword: "키워드15" },
  { id: 16, keyword: "키워드16" },
];

export function DrawerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const { drawerHeight, buttonBottom } = useDrawerDimensions(isOpen);

  return (
    <div className="relative">
      <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false}>
        <DrawerTrigger asChild>
          <DrawerToggleButton isOpen={isOpen} buttonBottom={buttonBottom} />
        </DrawerTrigger>

        <DrawerContent className={drawerHeight}>
          <div className="w-full max-w-full h-full flex flex-col px-2 sm:px-4 md:px-6">
            {/* 드래그 핸들 */}
            <div className="mx-auto w-8 sm:w-10 md:w-12 h-1 flex-shrink-0 rounded-full bg-gray-300 mb-2 cursor-grab active:cursor-grabbing" />

            {/* 가로 스크롤 영역 */}
            <div className="flex-1 overflow-hidden">
              <CustomScrollbar maxWidth="100%" direction="horizontal">
                <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3 pr-2 items-center">
                  {EXPAND_KEYWORDS.map((item, index) => (
                    <KeywordButton
                      key={item.id}
                      keyword={item.keyword}
                      index={index}
                    />
                  ))}
                </div>
              </CustomScrollbar>
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    </div>
  );
}
