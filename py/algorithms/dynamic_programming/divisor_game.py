'''
爱丽丝和鲍勃一起玩游戏，他们轮流行动。爱丽丝先手开局。

最初，黑板上有一个数字 n 。在每个玩家的回合，玩家需要执行以下操作：

选出任一整数 x，满足 0 < x < n 且 n % x == 0 。
用 n - x 替换黑板上的数字 n 。
如果玩家无法执行这些操作，就会输掉游戏。

只有在爱丽丝在游戏中取得胜利时才返回 true 。假设两个玩家都以最佳状态参与游戏。
'''
# # 
# def divisor_game(n):

# 1 false 
# 2 1 true
# 3 2 1 false
# 4 2 1 false X
# 4 3 2 1 true
# 5 4 2 1 true X
# 5 4 3 2 1 false 
# 6 4 2 1 true X
# 6 4 3 2 1 false X
# 6 5 4 2 1 false X
# 6 5 4 3 2 1 true
# 7 6 4 2 1 false X
# 7 6 4 3 2 1 true X
# 7 6 5 4 2 1 true X
# 7 6 5 4 3 2 1 false 
# 8 7 
# 8 6 4 3 2 1 true
# 8 6 5 4 2 1 true
# 8 4 3 2 1

def divisor_game_dp(n):
    """
    除数博弈（动态规划解法）
    """
    if n == 1:
        return False
    
    dp = [False] * (n+1)
    dp[1] = False
    dp[2] = True

    for i in range(3, n+1):
        for x in range(1, i):
            if i%x == 0:
                if not dp[i - x]:
                    dp[i] = True
                    break
    
    return dp[n]