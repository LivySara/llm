"""
动态规划（DP）类题目
包含：猴子爬山、完全背包、编辑距离、合唱队LIS
"""

def monkey_climb_stairs(n):
    """
    猴子爬山/爬楼梯问题
    一次可以爬1级、2级或3级，求爬n级楼梯的方法数
    """
    if n <= 0:
        return 0
    if n == 1:
        return 1
    if n == 2:
        return 2
    if n == 3:
        return 4
    
    # dp[i] 表示爬到第i级楼梯的方法数
    dp = [0] * (n + 1)
    dp[1], dp[2], dp[3] = 1, 2, 4
    
    for i in range(4, n + 1):
        dp[i] = dp[i-1] + dp[i-2] + dp[i-3]
    
    return dp[n]


def complete_knapsack(V, N, weights, values):
    """
    完全背包问题
    V: 背包容量
    N: 物品数量
    weights: 物品重量列表
    values: 物品价值列表
    返回: 最大价值
    """
    # dp[j] 表示容量为j的背包能装的最大价值
    dp = [0] * (V + 1)
    
    for i in range(N):
        # 完全背包：正序遍历（每种物品可以选多次）
        for j in range(weights[i], V + 1):
            dp[j] = max(dp[j], dp[j - weights[i]] + values[i])
    
    return dp[V]


def min_distance(word1, word2):
    """
    编辑距离（Levenshtein距离）
    计算将两个字符串转换为相同所需的最少操作数
    操作：插入、删除、替换
    """
    m, n = len(word1), len(word2)
    
    # dp[i][j] 表示word1前i个字符转换为word2前j个字符的最小操作数
    dp = [[0] * (n + 1) for _ in range(m + 1)]
    
    # 初始化
    for i in range(m + 1):
        dp[i][0] = i  # word1前i个字符删除i次
    for j in range(n + 1):
        dp[0][j] = j  # word2前j个字符插入j次
    
    # 状态转移
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            if word1[i-1] == word2[j-1]:
                dp[i][j] = dp[i-1][j-1]  # 字符相同，无需操作
            else:
                dp[i][j] = min(
                    dp[i-1][j] + 1,    # 删除
                    dp[i][j-1] + 1,    # 插入
                    dp[i-1][j-1] + 1   # 替换
                )
    
    return dp[m][n]


def chorus_formation(heights):
    """
    合唱队问题
    找到最长的先递增后递减的子序列
    返回需要出列的最少人数
    """
    n = len(heights)
    if n <= 2:
        return 0
    
    # left[i]: 以i结尾的最长递增子序列长度
    left = [1] * n
    for i in range(n):
        for j in range(i):
            if heights[j] < heights[i]:
                left[i] = max(left[i], left[j] + 1)
    
    # right[i]: 以i开始的最长递减子序列长度
    right = [1] * n
    for i in range(n-1, -1, -1):
        for j in range(i+1, n):
            if heights[j] < heights[i]:
                right[i] = max(right[i], right[j] + 1)
    
    # 找到最大的合唱队形长度
    max_chorus = 0
    for i in range(n):
        max_chorus = max(max_chorus, left[i] + right[i] - 1)
    
    # 需要出列的人数
    return n - max_chorus


if __name__ == "__main__":
    # 测试猴子爬山
    print("=== 猴子爬山测试 ===")
    print(f"n=1: {monkey_climb_stairs(1)}")  # 1
    print(f"n=2: {monkey_climb_stairs(2)}")  # 2
    print(f"n=3: {monkey_climb_stairs(3)}")  # 4
    print(f"n=4: {monkey_climb_stairs(4)}")  # 7
    print(f"n=5: {monkey_climb_stairs(5)}")  # 13
    
    # 测试完全背包
    print(f"\n=== 完全背包测试 ===")
    V = 10  # 背包容量
    N = 3   # 物品数量
    weights = [2, 3, 5]  # 物品重量
    values = [4, 5, 7]   # 物品价值
    print(f"背包容量={V}, 最大价值: {complete_knapsack(V, N, weights, values)}")
    
    # 测试编辑距离
    print(f"\n=== 编辑距离测试 ===")
    print(f"'horse' -> 'ros': {min_distance('horse', 'ros')}")  # 3
    print(f"'intention' -> 'execution': {min_distance('intention', 'execution')}")  # 5
    print(f"'abc' -> 'abc': {min_distance('abc', 'abc')}")  # 0
    
    # 测试合唱队
    print(f"\n=== 合唱队测试 ===")
    heights1 = [186, 186, 150, 200, 160, 130, 197, 200]
    print(f"身高: {heights1}")
    print(f"需要出列: {chorus_formation(heights1)}人")  # 4
    
    heights2 = [100, 90, 80, 70, 60]
    print(f"身高: {heights2}")
    print(f"需要出列: {chorus_formation(heights2)}人")  # 0
