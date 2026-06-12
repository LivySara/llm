'''
给定一个包含非负整数的 m x n 网格 grid ，请找出一条从左上角到右下角的路径，使得路径上的数字总和为最小。

说明：每次只能向下或者向右移动一步。
'''

'''
dp[0][0] = grid[0][0]
dp[0][1] = grid[0][1] + dp[0][0]
'''

def minPathSum(grid):

    m = len(grid)
    n = len(grid[0])

    dp = [[0] * n for _ in range(m)]

    dp[0][0] = grid[0][0]

    # 初始化第一行
    for j in range(1, n):
        dp[0][j] = dp[0][j-1] + grid[0][j]
    # 初始化第一列
    for i in range(1, m):
        dp[i][0] = dp[i-1][0] + grid[i][0]
    
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = min(dp[i][j-1], dp[i-1][j]) + grid[i][j]
    
    return dp[m-1][n-1]
