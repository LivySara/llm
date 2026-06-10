'''
给你一个字符串 s，找到 s 中最长的 回文 子串。
'''

'''
abcdefgh
abcdefg
'''

def longestPalindrome(s):
    '''
    中心扩展算法（滑动窗口思想）
    时间复杂度：O(n²)
    空间复杂度：O(1)
    '''

    if not s:
        return ""
    
    # 记录最长回文的起始和结束位置
    start, end = 0, 0

    length = len(s)

    def expand_around_center(l, r):
        """从中心向两边扩展，返回回文长度"""
        while l >=0 and r < length and s[l] == s[r]:
            l -= 1
            s += 1
        
        return l+1, r-1

    for i in range(length):
        # 情况1：中心是一个字符，即奇数长度回文
        l_1, r_1 = expand_around_center(i, i)

        # 情况2：中心是两个字符，即偶数长度回文
        l_2, r_2 = expand_around_center(i, i+1)

        if r_1 - l_1 > end - start:
            start, end = l_1, r_1
        if r_2 - l_2 > end - start:
            start, end = l_2, r_2
        
    return s[start:end+1]


def longest_palindrome_dp(s):
    """
    动态规划解法
    时间复杂度：O(n²)
    空间复杂度：O(n²)
    """
    if not s:
        return ""
    
    n = len(s)
    dp = [[False] * n for _ in range(n)]
    start, max_len = 0, 1  # 记录最长回文的起始位置和长度
    
    # 1. 基础情况：单个字符是回文
    for i in range(n):
        dp[i][i] = True
    
    # 2. 填充 dp 数组（按子串长度从小到大）
    for length in range(2, n + 1):  # 子串长度
        for i in range(n - length + 1):  # 起始位置
            j = i + length - 1  # 结束位置
            
            if s[i] == s[j]:
                # 长度2：直接判断
                if length == 2:
                    dp[i][j] = True
                # 长度>2：看中间是否回文
                else:
                    dp[i][j] = dp[i + 1][j - 1]
            
            # 更新最长回文
            if dp[i][j] and length > max_len:
                start = i
                max_len = length
    
    return s[start:start + max_len]


# 优化空间复杂度（滚动数组）
def longest_palindrome_dp_optimized(s):
    """
    动态规划解法（空间优化）
    时间复杂度：O(n²)
    空间复杂度：O(n)
    """
    if not s:
        return ""
    
    n = len(s)
    dp = [False] * n
    start, max_len = 0, 1
    
    # i是起始位置
    for i in range(n):
        # 判断 s[i:j+1] 是否是回文
        for j in range(i, -1, -1):
            # 状态转移
            if i - j < 3:
                dp[j] = s[i] == s[j]
            else:
                dp[j] = (s[i] == s[j]) and dp[j + 1]
            
            # 更新最长回文
            if dp[j] and i - j + 1 > max_len:
                start = j
                max_len = i - j + 1
    
    return s[start:start + max_len]

