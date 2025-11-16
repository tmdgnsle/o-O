import { apiClient } from '@/lib/axios';

/**
 * 마인드맵 썸네일 업로드 API
 *
 * @param workspaceId 워크스페이스 ID
 * @param thumbnailFile 썸네일 이미지 파일 (PNG)
 * @returns 업로드 성공 여부
 *
 * @example
 * const file = await captureThumbnailAsFile(containerRef.current);
 * await mindmapApi.uploadThumbnail('workspace-123', file);
 */
export const uploadThumbnail = async (
  workspaceId: string,
  thumbnailFile: File
): Promise<void> => {
  // FormData 생성 (multipart/form-data 전송용)
  const formData = new FormData();
  formData.append('file', thumbnailFile); // API 스펙: 'file' 키 사용

  try {
    // POST /workspace/{workspaceId}/thumbnail
    await apiClient.post(`/workspace/${workspaceId}/thumbnail`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    if (import.meta.env.DEV) {
      console.log('✅ [Thumbnail Upload] Successfully uploaded:', {
        workspaceId,
        filename: thumbnailFile.name,
        size: `${(thumbnailFile.size / 1024).toFixed(2)} KB`,
      });
    }
  } catch (error) {
    console.error('❌ [Thumbnail Upload] Failed to upload thumbnail:', error);
    // 에러를 던지지 않고 로그만 남김 (썸네일 업로드 실패가 사용자 경험을 방해하지 않도록)
  }
};

export const mindmapApi = {
  uploadThumbnail,
};
