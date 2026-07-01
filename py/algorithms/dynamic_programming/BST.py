class TreeNode:
    """二叉树节点定义"""
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

# 题目：【二叉搜索树的范围和】给定二叉搜索树的根结点 root，返回值位于范围 [low, high] 之间的所有结点的值的和。

# 法1：前序遍历：根 - 左 - 右
def range_sum_bst_dfs1(root, low, high):
    """
    DFS遍历（利用BST性质）
    """
    if not root:
        return 0
    total = 0

    # 前序遍历
    if low <= root.val <= high:
        total += root.val
    
    total += range_sum_bst_dfs1(root.left, low, high)
    total += range_sum_bst_dfs1(root.right, low, high)

    return total


# 法2：中序遍历：左 - 根 - 右
def range_sum_bst_dfs2(root, low, high):
    """
    DFS遍历（利用BST性质）
    """
    if not root:
        return 0
    total = 0

    total += range_sum_bst_dfs2(root.left, low, high)
    if low <= root.val <= high:
        total += root.val
    total += range_sum_bst_dfs2(root.right, low, high)

    return total


# 法2：后序遍历：左 - 右 - 根
def range_sum_bst_dfs3(root, low, high):
    """
    DFS遍历（利用BST性质）
    """
    if not root:
        return 0
    total = 0

    total += range_sum_bst_dfs3(root.left, low, high)
    total += range_sum_bst_dfs3(root.right, low, high)
    if low <= root.val <= high:
        total += root.val

    return total

