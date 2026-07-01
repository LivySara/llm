"""
单调栈类题目
包含：滑动窗口最大值（端口流量）、最大矩形面积
"""

from collections import deque

def sliding_window_maximum(nums, k):
    """
    滑动窗口最大值（端口流量监控）
    nums: 数组
    k: 窗口大小
    返回: 每个窗口的最大值列表
    """
    if not nums or k == 0:
        return []
    
    result = []
    dq = deque()  # 存储索引，保持递减序列
    
    for i in range(len(nums)):
        # 移除窗口外的元素
        if dq and dq[0] < i - k + 1:
            dq.popleft()
        
        # 维护单调递减栈
        while dq and nums[dq[-1]] < nums[i]:
            dq.pop()
        
        dq.append(i)
        
        # 窗口形成后添加结果
        if i >= k - 1:
            result.append(nums[dq[0]])
    
    return result


def largest_rectangle_area(heights):
    """
    柱状图中最大的矩形面积
    heights: 柱状图高度列表
    返回: 最大矩形面积
    """
    if not heights:
        return 0
    
    # 添加哨兵
    heights = [0] + heights + [0]
    n = len(heights)
    
    # 单调递增栈（存储索引）
    stack = []
    max_area = 0
    
    for i in range(n):
        # 当前柱高度小于栈顶柱高度时，计算栈顶柱的面积
        while stack and heights[stack[-1]] > heights[i]:
            h = heights[stack.pop()]
            # 宽度 = 右边界 - 左边界 - 1
            left = stack[-1] if stack else -1
            width = i - left - 1
            max_area = max(max_area, h * width)
        
        stack.append(i)
    
    return max_area


if __name__ == "__main__":
    # 测试滑动窗口最大值
    print("=== 滑动窗口最大值测试 ===")
    nums = [1, 3, -1, -3, 5, 3, 6, 7]
    k = 3
    print(f"数组: {nums}, 窗口大小: {k}")
    print(f"窗口最大值: {sliding_window_maximum(nums, k)}")  # [3, 3, 5, 5, 6, 7]
    
    # 测试最大矩形面积
    print(f"\n=== 最大矩形面积测试 ===")
    heights1 = [2, 1, 5, 6, 2, 3]
    print(f"柱高度: {heights1}")
    print(f"最大矩形面积: {largest_rectangle_area(heights1)}")  # 10
    
    heights2 = [1, 2, 3, 4, 5]
    print(f"柱高度: {heights2}")
    print(f"最大矩形面积: {largest_rectangle_area(heights2)}")  # 9
