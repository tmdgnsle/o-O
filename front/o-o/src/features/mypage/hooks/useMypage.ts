import { useCallback } from "react";
import { useAppDispatch, useAppSelector } from "@/store/hooks"; // Redux 타입 훅
import {
  fetchWorkspaces,
  loadMoreWorkspaces,
} from "@/store/slices/mypageSlice";
import type { WorkspaceQueryParams } from "@/features/mypage/types/mypage";
import { DEFAULT_WORKSPACE_PARAMS } from "@/features/mypage/types/mypage";

interface UseMypageReturn {
  workspaces: any[];
  hasNext: boolean;
  nextCursor: number;
  isLoading: boolean;
  error: string | null;
  fetchWorkspacesList: (params?: WorkspaceQueryParams) => void;
  loadMore: () => void;
}

export const useMypage = (): UseMypageReturn => {
  const dispatch = useAppDispatch();

  // Redux store에서 상태 가져오기
  const { workspaces, hasNext, nextCursor, isLoading, error } = useAppSelector(
    (state) => state.mypage
  );

  // 워크스페이스 목록 조회
  const fetchWorkspacesList = useCallback(
    (params: WorkspaceQueryParams = DEFAULT_WORKSPACE_PARAMS) => {
      dispatch(fetchWorkspaces(params));
    },
    [dispatch]
  );

  // 페이지네이션 - 더보기
  const loadMore = useCallback(() => {
    if (!hasNext || isLoading) return;

    const nextParams: WorkspaceQueryParams = {
      category: DEFAULT_WORKSPACE_PARAMS.category,
      cursor: nextCursor,
    };

    dispatch(loadMoreWorkspaces(nextParams));
  }, [dispatch, hasNext, isLoading, nextCursor]);

  return {
    workspaces,
    hasNext,
    nextCursor,
    isLoading,
    error,
    fetchWorkspacesList,
    loadMore,
  };
};
