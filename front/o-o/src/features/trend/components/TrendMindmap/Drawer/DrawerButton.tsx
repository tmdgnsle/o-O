import { useState } from "react";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";
import { useDrawerDimensions } from "../../../hooks/custom/useDrawerDimensions";
import { DrawerToggleButton } from "./DrawerToggleButton";
import { KeywordButton } from "../Drawer/KeywordButton";
import { ImportToMindmapButton } from "./ImportToMindmapButton";

import popo1 from "@/shared/assets/images/popo1.png";
import popo2 from "@/shared/assets/images/popo2.png";
import popo3 from "@/shared/assets/images/popo3.png";
import { MindmapSelectionModal } from "../Modal/MindmapSelectionModal";
import type { Project } from "@/features/trend/types/types";

export interface Keyword {
  readonly id: number;
  readonly keyword: string;
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

const DUMMY_MINDMAP_PROJECTS: Project[] = [
  {
    id: "1",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: true,
    collaborators: [
      { id: "user1", name: "김철수", image: popo1 },
      { id: "user2", name: "이영희", image: popo2 },
    ],
  },
  {
    id: "2",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
  {
    id: "3",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user3", name: "박민수", image: popo3 }],
  },
  {
    id: "4",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: true,
    collaborators: [{ id: "user1", name: "김철수", image: popo1 }],
  },
  {
    id: "5",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
  {
    id: "5",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
  {
    id: "6",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
  {
    id: "7",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
  {
    id: "8",
    title: "알고리즘 관련 기록",
    date: "2025.10.26",
    isPrivate: false,
    collaborators: [{ id: "user2", name: "이영희", image: popo2 }],
  },
];

export function DrawerButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { drawerHeight, buttonBottom } = useDrawerDimensions(isOpen);

  const handleImportToMindmap = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateNewMindmap = () => {
    console.log("새 마인드맵 생성");
    // TODO: 새 마인드맵 생성 로직
    setIsModalOpen(false);
  };

  const handleSelectMindmap = (mindmapId: string) => {
    console.log("마인드맵 선택:", mindmapId);
    // TODO: 선택한 마인드맵에 키워드 추가 로직
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="relative">
        <Drawer open={isOpen} onOpenChange={setIsOpen} modal={false}>
          <DrawerTrigger asChild>
            <DrawerToggleButton isOpen={isOpen} buttonBottom={buttonBottom} />
          </DrawerTrigger>

          <DrawerContent className={drawerHeight}>
            <div className="w-full max-w-full h-full flex flex-col px-2 sm:px-4 md:px-6">
              {/* 드래그 핸들 */}
              <div className="mx-auto w-8 sm:w-10 md:w-12 h-1 flex-shrink-0 rounded-full bg-gray-300 mb-2 cursor-grab active:cursor-grabbing" />

              {/* 컨텐츠 영역: 스크롤 + 버튼 */}
              <div className="flex-1 flex gap-3 overflow-hidden">
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

                {/* 마인드맵 가져오기 버튼 (스크롤 밖) */}
                <div className="flex items-center pb-3">
                  <ImportToMindmapButton onClick={handleImportToMindmap} />
                </div>
              </div>
            </div>
          </DrawerContent>
        </Drawer>
      </div>

      {/* 마인드맵 선택 모달 */}
      <MindmapSelectionModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onCreateNew={handleCreateNewMindmap}
        onSelectMindmap={handleSelectMindmap}
        projects={DUMMY_MINDMAP_PROJECTS}
      />
    </>
  );
}
