'''
给定一个 m x n 的整数数组 grid。一个机器人初始位于 左上角（即 grid[0][0]）。机器人尝试移动到 右下角（即 grid[m - 1][n - 1]）。机器人每次只能向下或者向右移动一步。

网格中的障碍物和空位置分别用 1 和 0 来表示。机器人的移动路径中不能包含 任何 有障碍物的方格。

返回机器人能够到达右下角的不同路径数量。

测试用例保证答案小于等于 2 * 10 ** 9。
'''
'''

'''

def uniquePathsII(grid):

    m = len(grid)
    n = len(grid[0])

    # 如果起点或终点是障碍物，直接返回 0
    if grid[0][0] == 1 or grid[m-1][n-1] == 1:
        return 0
    
    # 创建 dp 数组
    dp = [[0] * n for _ in range(m)]
    
    # 初始化起点
    dp[0][0] = 1

    # 第一行
    for j in range(n):
        if grid[0][j] == 1:
            dp[0][j] = 0
        else:
            dp[0][j] = dp[0][j-1]
    # 第一列
    for i in range(m):
        if grid[i][0] == 1:
            dp[i][0] = 0
        else:
            dp[i][0] = dp[i - 1][0]
    
    for i in range(1, m):
        for j in range(1, n):
            if grid[i][j] == 1:
                dp[i][j] = 0
            else:
                dp[i][j] = dp[i][j - 1] + dp[i - 1][j]
    
    return dp[m-1][n-1]