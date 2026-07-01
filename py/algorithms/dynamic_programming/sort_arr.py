# 题目：【有序数组的平方】给你一个按 非递减顺序 排序的整数数组 nums，返回 每个数字的平方 组成的新数组，要求也按 非递减顺序 排序。

def sorted_square(nums):
    '''
    有序数组的平方
    双指针解法
    时间复杂度：O(n)
    空间复杂度：O(n)
    '''
    length = len(nums)
    result = []

    l, r = 0, length - 1
    pos = length - 1

    while l <= r:
        l_sq = nums[l] * nums[l]
        r_sq = nums[r] * nums[r]

        if l_sq > r_sq:
            result[pos] = l_sq
            l += 1
        else:
            result[pos] = r_sq
            r += 1

        pos -= 1
    
    return result
