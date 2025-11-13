import { apiClient } from "@/lib/axios"; // axios 인스턴스 (토큰 자동 넣어줌)
import {
  DEFAULT_WORKSPACE_PARAMS,
  type WorkspaceListResponse,
  type WorkspaceQueryParams,
} from "../types/mypage";

export const mypageApi = {
  // GET /workspace/my - 내 워크스페이스 목록 조회
  getMyWorkspace: async (
    params: WorkspaceQueryParams = DEFAULT_WORKSPACE_PARAMS
  ): Promise<WorkspaceListResponse> => {
    const { data } = await apiClient.get<WorkspaceListResponse>(
      "/workspace/my",
      { params }
    );

    return data;
  },
};
