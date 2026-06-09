'''
学校打算为全体学生拍一张年度纪念照。根据要求，学生需要按照 非递减 的高度顺序排成一行。

排序后的高度情况用整数数组 expected 表示，其中 expected[i] 是预计排在这一行中第 i 位的学生的高度（下标从 0 开始）。

给你一个整数数组 heights ，表示 当前学生站位 的高度情况。heights[i] 是这一行中第 i 位学生的高度（下标从 0 开始）。

返回满足 heights[i] != expected[i] 的 下标数量 。
'''

def height_checker(heights):
    """
    高度检查器
    heights: 当前学生身高数组
    返回: 需要移动的学生数量
    """
    # 1. 排序得到 expected
    expected = sorted(heights)
    
    # 2. 统计不同位置的个数
    count = 0
    for h, e in zip(heights, expected):
        if h != e:
            count += 1
    
    return count