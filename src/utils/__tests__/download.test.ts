import { describe, it, expect, vi, beforeEach } from 'vitest';
import { saveBlob, openBlobInNewTab, handleBlobResponse } from '../download';

describe('download utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('saveBlob creates an anchor element and clicks it', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test-uuid');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const clickSpy = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});

    const blob = new Blob(['sample content'], { type: 'text/plain' });
    saveBlob(blob, 'test_export.csv');

    expect(createObjectURLMock).toHaveBeenCalledWith(blob);
    expect(clickSpy).toHaveBeenCalled();

    clickSpy.mockRestore();
  });

  it('openBlobInNewTab opens a new window with the blob URL', () => {
    const createObjectURLMock = vi.fn().mockReturnValue('blob:http://localhost/test-uuid-2');
    const revokeObjectURLMock = vi.fn();
    window.URL.createObjectURL = createObjectURLMock;
    window.URL.revokeObjectURL = revokeObjectURLMock;

    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

    const blob = new Blob(['pdf data'], { type: 'application/pdf' });
    openBlobInNewTab(blob);

    expect(createObjectURLMock).toHaveBeenCalledWith(blob);
    expect(openSpy).toHaveBeenCalledWith('blob:http://localhost/test-uuid-2', '_blank');

    openSpy.mockRestore();
  });

  it('handleBlobResponse returns blob on ok response', async () => {
    const mockBlob = new Blob(['sample data'], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const response = {
      ok: true,
      blob: vi.fn().mockResolvedValue(mockBlob),
    } as unknown as Response;

    const result = await handleBlobResponse(response);
    expect(result).toBe(mockBlob);
  });

  it('handleBlobResponse parses JSON error on non-ok response', async () => {
    const errorJson = JSON.stringify({
      code: 'INVALID_DATE_RANGE',
      message: "Both 'from' and 'to' dates are required in YYYY-MM-DD format.",
    });
    const response = {
      ok: false,
      text: vi.fn().mockResolvedValue(errorJson),
    } as unknown as Response;

    const result = await handleBlobResponse(response);
    expect(result).toEqual({
      code: 'INVALID_DATE_RANGE',
      message: "Both 'from' and 'to' dates are required in YYYY-MM-DD format.",
    });
  });
});
