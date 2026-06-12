'''
一个机器人位于一个 m x n 网格的左上角 （起始点在下图中标记为 “Start” ）。

机器人每次只能向下或者向右移动一步。机器人试图达到网格的右下角（在下图中标记为 “Finish” ）。

问总共有多少条不同的路径？
'''
# 注意：向左 + 向右 不行
'''
m = 1, n =1
01
路径：0 dp[0][0] = 1, m >= 1
m = 1, n =2
0 1 d[0][j] = 1, n >= 2
路径：1
m = 2, n = 2
路径：2 dp[1][1] = dp[1][0] + dp[0][1]
m = 2, n = 3
0 x x
x x 1
路径： 3 dp[1][2] = dp[1][1] + dp[0][2]
# 不在边界上格子
 if j - 1 >= 0 and i - 1 >= 0
    dp[i][j] = dp[i][j-1] + dp[i-1][j]
# 在右侧边界
 elif j - 1 >= 0:
    dp[i][j] = dp[i][j - 1]
# 在左侧边界
 elif i - 1 >= 0:
    dp[i][j] = dp[i-1][j]
    
m = 3, n = 2
0 x 
x x
x 1
向下 - 向下 - 向右

'''

# 法1
def uniquePaths(m, n):
    dp = [[0] * n for _ in range(m)]

    # 第一行
    for j in range(n):
        dp[0][j] = 1
    
    # 第一列
    for i in range(m):
        dp[i][0] = 1
    
    for i in range(1, m):
        for j in range(1, n):
            dp[i][j] = dp[i][j - 1] + dp[i - 1][j]
    
    return dp[m-1][n-1]