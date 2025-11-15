import { useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import type { RootState } from "@/store/store";
import { resetPathExceptParent } from "@/store/slices/trendPathSlice";
import { Drawer, DrawerContent, DrawerTrigger } from "@/components/ui/drawer";
import CustomScrollbar from "@/shared/ui/CustomScrollbar";
import { useDrawerDimensions } from "../../../hooks/custom/useDrawerDimensions";
import { DrawerToggleButton } from "./DrawerToggleButton";
import { KeywordButton } from "../Drawer/KeywordButton";
import { ImportToMindmapButton } from "./ImportToMindmapButton";

import popo1 from "@/shared/assets/images/popo1.webp";
import popo2 from "@/shared/assets/images/popo2.webp";
import popo3 from "@/shared/assets/images/popo3.webp";
import { MindmapSelectionModal } from "../Modal/MindmapSelectionModal";
import type { Project } from "@/features/trend/types/types";

export interface Keyword {
  readonly id: number;
  readonly keyword: string;
}

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
  const { trendId } = useParams<{ trendId: string }>();
  const [isOpen, setIsOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { drawerHeight, buttonBottom } = useDrawerDimensions(isOpen);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Redux에서 경로 가져오기
  const visitPath = useSelector(
    (state: RootState) => state.trendPath.visitPath
  );

  const handleImportToMindmap = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleCreateNewMindmap = () => {
    console.log("새 마인드맵 생성");
    console.log("생성할 마인드맵 경로:", visitPath.join(" > "));
    // TODO: 새 마인드맵 생성 로직
    setIsModalOpen(false);
  };

  const handleSelectMindmap = (mindmapId: string) => {
    console.log("마인드맵 선택:", mindmapId);
    console.log("선택한 경로:", visitPath.join(" > "));
    // TODO: 선택한 마인드맵에 키워드 추가 로직 (visitPath 포함)
    setIsModalOpen(false);
  };

  // 경로에 있는 키워드 클릭 핸들러
  const handlePathKeywordClick = (keyword: string) => {
    // 해당 키워드로 네비게이트
    navigate(`/trend/${encodeURIComponent(keyword)}`);

    // 드로어 닫기
    setIsOpen(false);
  };

  // 경로 리셋 핸들러 - 현재 부모만 남기기
  const handleResetPath = () => {
    if (trendId) {
      const parentKeyword = decodeURIComponent(trendId);
      dispatch(resetPathExceptParent(parentKeyword));
    }
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
                {/* 가로 스크롤 영역 - visitPath 표시 */}
                <div className="flex-1 overflow-hidden">
                  <CustomScrollbar maxWidth="100%" direction="horizontal">
                    <div className="flex gap-3 sm:gap-4 md:gap-5 pb-3 pr-2 items-center">
                      {visitPath.length > 0 ? (
                        visitPath.map((keyword: string, index: number) => (
                          <div
                            key={`${keyword}-${index}`}
                            onClick={() => handlePathKeywordClick(keyword)}
                            className="cursor-pointer"
                          >
                            <KeywordButton keyword={keyword} index={index} />
                          </div>
                        ))
                      ) : (
                        <p className="text-gray-400 text-sm whitespace-nowrap">
                          노드를 선택하면 경로가 표시됩니다
                        </p>
                      )}
                    </div>
                  </CustomScrollbar>
                </div>

                {/* 리셋 버튼 + 마인드맵 가져오기 버튼 */}
                <div className="flex items-center gap-2 pb-3">
                  {visitPath.length > 1 && (
                    <button
                      onClick={handleResetPath}
                      className="px-3 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 text-sm rounded transition-colors whitespace-nowrap"
                      title="경로를 현재 노드만 남기고 초기화"
                    >
                      리셋
                    </button>
                  )}
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
