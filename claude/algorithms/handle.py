
# 变动的窗口：滑动窗口算法
def character_replacement(s, k):
    """
    包含相同字母的最长子字符串长度
    s: 字符串（大写英文字符）
    k: 最多可替换次数
    返回: 最长子字符串长度
    """
    # 统计当前窗口内的字符频次
    count = [0] * 26
    # 窗口内最多字符的频次
    max_count = 0 
    # 窗口左边界
    left = 0
    # 最大长度
    result = 0

    for right in range(len(s)):
        # 1、扩展右边界，更新字符频次
        idx = ord(s[right]) - ord('A')
        count[idx] += 1
        max_count = max(max_count, count[idx])
        # 2、判断是否需要缩小窗口：窗口长度 - 最多字符频次 = 需要替换的字符数 > k
        window_size = right - left + 1
        if window_size - max_count > k:
            left_idx = ord(s[left]) - ord('A')
            count[left_idx] -= 1
            left += 1
        
        # 3、更新结果
        window_size = right - left + 1
        result = max(result, window_size)

    return result
# 固定窗口：滑动窗口
def check_inclusion(s1, s2):
    """
    判断 s2 是否包含 s1 的排列
    s1: 模式串
    s2: 文本串
    返回: True/False
    """
    len1, len2 = len(s1), len(s2)

    if len1 > len2:
        return False
    
    # 统计s1的字符频率
    s1_count = [0] * 26
    for ch in s1:
        s1_count[ord(ch) - ord('a')] += 1
    
    # 初始化窗口 （s2的前 len1 个字符）
    window_count = [0] * 26
    for i in range(len1):
        window_count[ord(s2[i]) - ord('a')] += 1
    
    # 检查初始窗口
    if window_count == s1_count:
        return True
    
    for r in range(len1, len2):
        # 加入新字符
        idx = ord(s2[r]) - ord('a')
        window_count[idx] += 1

        # 移除旧字符
        left = r -len1
        lef_idx = ord(s2[left]) - ord('a')
        window_count[left_idx] -= 1

        if window_count == s1_count:
            return True
    
    return False

def num_enclaves(grid):
    """
    计算无法离开网格边界的陆地单元格数量
    grid: 二进制矩阵
    返回: 无法离开的陆地单元格数量
    """
    if not grid or not grid[0]:
        return 0
    
    m, n = len(grid), len(grid[0])

    # DFS 函数
    def dfs(i, j):
        # 越界或已是海洋/访问
        if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != 1:
            return
        # 标记当前单元格已访问
        grid[i][j] = 2

        # 四个方向递归
        dfs(i+1, j)
        dfs(i-1, j)
        dfs(i, j+1)
        dfs(i, j-1)
    
    # 处理上下边界
    for j in range(n):
        if grid[0][j] == 1:
            dfs(0, j)
        if grid[m-1][j] == 1:
            dfs(m-1, j)
    
    # 处理左右边界
    for i in range(m):
        if grid[i][0] == 1:
            dfs(i, 0)
        if grid[i][n-1] == 1:
            dfs(i, n-1)
    
    # 统计
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:
                count += 1
    
    return count