'''
假设你正在爬楼梯。需要 n 阶你才能到达楼顶。

每次你可以爬 1 或 2 个台阶。你有多少种不同的方法可以爬到楼顶呢？
'''
'''
1 
方法：1
2
方法：2
3
方法：3
4
方法：5

'''

def climbStairs(n):
    # 预先分配数组
    if n == 0:
        return 1

    dp = [0] * (n+1)

    dp[0] = 1
    dp[1] = 1
    
    for i in range(2, n+1):
        dp[i] = dp[i-1] + dp[i-2]

    return dp[n]