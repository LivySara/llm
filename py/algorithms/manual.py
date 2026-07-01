
# 三点不在一条直线上
def is_boomerang(points):
    if len(set(tuple(p) for p in points)) < 3:
        return False
    
    (x1, y1), (x2, y2), (x3, y3) = points

    cross_product = (x2 - x1) * (y3 - y1) - (y2 - y1) * (x3 - x1)

    return cross_product != 0

# 替换后能得到的最长全相同字符子串是多长
def character_replacement(s, k):
    """
    包含相同字母的最长子字符串长度
    s: 字符串（大写英文字符）
    k: 最多可替换次数
    返回: 最长子字符串长度
    """
    if not s:
        return 0
    
    # 字符频率统计（只有26个大写字母）；只统计当前窗口内字符频次
    count = [0] * 26
    max_count = 0  # 窗口内最多字符的频次
    left = 0       # 窗口左边界
    result = 0     # 结果
    
    for right in range(len(s)):
        # 1. 扩展右边界，更新字符频次
        idx = ord(s[right]) - ord('A')
        count[idx] += 1
        max_count = max(max_count, count[idx])
        
        # 2. 判断是否需要缩小窗口
        # 窗口长度 - 最多字符频次 = 需要替换的字符数
        window_size = right - left + 1
        if window_size - max_count > k:
            # 需要替换的字符数超过 k，缩小窗口
            left_idx = ord(s[left]) - ord('A')
            count[left_idx] -= 1
            left += 1
        
        # 3. 更新结果
        window_size = right - left + 1
        result = max(result, window_size)
    
    return result

# 判断 s2 是否包含 s1 的排列
# 法1
def check_inclusion_optimized(s1, s2):
    len1, len2 = len(s1), len(s2)
    
    if len1 > len2:
        return False
    
    s1_count = [0] * 26
    window_count = [0] * 26
    
    # 初始化窗口
    for i in range(len1):
        s1_count[ord(s1[i]) - ord('a')] += 1
        window_count[ord(s2[i]) - ord('a')] += 1
    
    # 统计匹配字符数
    matches = sum(1 for i in range(26) if s1_count[i] == window_count[i])
    
    # 滑动窗口
    for right in range(len1, len2):
        if matches == 26:
            return True
        
        # 加入新字符
        new_idx = ord(s2[right]) - ord('a')
        window_count[new_idx] += 1
        
        # 更新匹配数
        if window_count[new_idx] == s1_count[new_idx]:
            matches += 1
        elif window_count[new_idx] == s1_count[new_idx] + 1:
            matches -= 1
        
        # 移除旧字符
        left = right - len1
        old_idx = ord(s2[left]) - ord('a')
        window_count[old_idx] -= 1
        
        # 更新匹配数
        if window_count[old_idx] == s1_count[old_idx]:
            matches += 1
        elif window_count[old_idx] == s1_count[old_idx] - 1:
            matches -= 1
    
    return matches == 26
# 法2
def check_inclusion(s1, s2):
    """
    判断 s2 是否包含 s1 的排列
    s1: 模式串
    s2: 文本串
    返回: True/False
    """
    len1, len2 = len(s1), len(s2)
    
    # 特殊情况
    if len1 > len2:
        return False
    
    # 1. 统计 s1 的字符频率
    s1_count = [0] * 26
    for ch in s1:
        s1_count[ord(ch) - ord('a')] += 1
    
    # 2. 初始化窗口（s2 的前 len1 个字符）
    window_count = [0] * 26
    for i in range(len1):
        window_count[ord(s2[i]) - ord('a')] += 1
    
    # 3. 检查初始窗口
    if window_count == s1_count:
        return True
    
    # 4. 滑动窗口
    for right in range(len1, len2):
        # 加入新字符（右边界）
        new_char_idx = ord(s2[right]) - ord('a')
        window_count[new_char_idx] += 1
        
        # 移除旧字符（左边界）
        left = right - len1
        old_char_idx = ord(s2[left]) - ord('a')
        window_count[old_char_idx] -= 1
        
        # 检查当前窗口
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
        # 越界或已经是海洋/已访问
        if i < 0 or i >= m or j < 0 or j >= n or grid[i][j] != 1:
            return
        
        # 标记当前单元格为已访问（用2表示）
        grid[i][j] = 2
        
        # 四个方向递归
        dfs(i + 1, j)
        dfs(i - 1, j)
        dfs(i, j + 1)
        dfs(i, j - 1)
    
    # 1. 处理上边界和下边界
    for j in range(n):
        if grid[0][j] == 1:
            dfs(0, j)
        if grid[m - 1][j] == 1:
            dfs(m - 1, j)
    
    # 2. 处理左边界和右边界
    for i in range(m):
        if grid[i][0] == 1:
            dfs(i, 0)
        if grid[i][n - 1] == 1:
            dfs(i, n - 1)
    
    # 3. 统计剩余的陆地单元格（值为1的）
    count = 0
    for i in range(m):
        for j in range(n):
            if grid[i][j] == 1:
                count += 1
    
    return count