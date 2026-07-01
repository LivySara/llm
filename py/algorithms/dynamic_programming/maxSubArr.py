'''
给你一个整数数组 nums ，请你找出一个具有最大和的连续子数组（子数组最少包含一个元素），返回其最大和。

子数组 是数组中的一个连续部分。
'''
'''
[-2,1,-3,4,-1,2,1,-5,4]
1
-2
4
3
5
6
1
5
'''
# 法1：Kadane 算法
def maxSubArray(nums):
    """
    时间复杂度：O(n)
    空间复杂度：O(1)
    """
    if not nums:
        return 0
    # 以当前元素结尾的最大子数组和
    current_sum = nums[0]
    # 最大子数组之和
    max_sum = nums[0] 
    
    for i in range(1, len(nums)):
        current_sum = max(nums[i], current_sum + nums[i])
        max_sum = max(max_sum, current_sum)
    
    return max_sum

# 法2：动态规划算法
def maxSubArray_dp(nums):
    """
    时间复杂度：O(n)
    空间复杂度：O(n)
    """
    if not nums:
        return 0
    
    n = len(nums)
    dp = [0] * n
    dp[0] = nums[0]
    max_sum = nums[0]

    for i in range(1, n):
        dp[i] = max(nums[i], dp[i -1] + nums[i])
        max_sum = max(max_sum, dp[i])
    
    return max_sum

# 法3：分治法
'''
-2, 1, -3, 4, -1, 2, 1, -5, 4
-2, 1, -3, 4, -1
-2, 1, -3
-2, 1
-2

'''
def maxSubArray_divide(nums):
    """
    时间复杂度：O(nlogn)
    空间复杂度：O(logn) - 递归栈深度
    """
    def divide_and_conquer(nums, left, right):
        # 基础情况：只有一个元素
        if left == right:
            return nums[left]
        
        # 1. 分：找到中间位置
        mid = (left + right) // 2
        
        # 2. 治：递归求解左右两部分
        left_max = divide_and_conquer(nums, left, mid)
        right_max = divide_and_conquer(nums, mid + 1, right)
        
        # 3. 合：计算跨越中点的最大子数组和
        # 计算左半部分以mid结尾的最大和
        left_sum = nums[mid]
        temp = 0
        for i in range(mid, left - 1, -1):
            temp += nums[i]
            left_sum = max(left_sum, temp)
        
        # 计算右半部分以mid+1开始的最大和
        right_sum = nums[mid + 1]
        temp = 0
        for i in range(mid + 1, right + 1):
            temp += nums[i]
            right_sum = max(right_sum, temp)
        
        # 跨越中点的最大和
        cross_max = left_sum + right_sum
        
        # 返回三者中的最大值
        return max(left_max, right_max, cross_max)
    
    if not nums:
        return 0
    return divide_and_conquer(nums, 0, len(nums) - 1)
