'''
【二叉树的堂兄弟节点】
在二叉树中，根节点位于深度 0 处，每个深度为 k 的节点的子节点位于深度 k+1 处。
如果二叉树的两个节点深度相同，但 父节点不同 ，则它们是一对堂兄弟节点。

我们给出了具有唯一值的二叉树的根节点 root ，以及树中两个不同节点的值 x 和 y 。

只有与值 x 和 y 对应的节点是堂兄弟节点时，才返回 true 。否则，返回 false。
'''

# 方法1：DFS
def is_cousins(root, x, y):
    '''
     判断两个节点是否是堂兄弟
    '''
    # 字典 - 元组数据类型：保存遍历中节点值、深度以及父节点
    info = {}

    def dfs(node, parent, depth) :
        if not node:
            return
        
        # 记录当前节点的信息
        info[node.val] = (depth, parent)
         
        # 遍历左子树
        dfs(node.left, node, depth+1)
        dfs(node.right, node, depth+1)

    dfs(root, None, 0)

    if x in info and y in info:
        depth_x, parent_x = info[x]
        depth_y, parent_y = info[y]
        
        return depth_x == depth_y and parent_x != parent_y
    
    return False

 # 方法2：BFS（层序遍历）
from collections import deque
def is_cousins_bfs(root, x, y):
    """
    判断两个节点是否是堂兄弟
    """
    if not root:
        return False
    
    queue = deque([(root, None)])  # (节点, 父节点)
    
    while queue:
        level_size = len(queue)
        level_nodes = []  # 记录当前层的节点和父节点
        
        for _ in range(level_size):
            node, parent = queue.popleft()
            
            # 记录当前层的信息
            level_nodes.append((node.val, parent))
            
            # 加入子节点
            if node.left:
                queue.append((node.left, node))
            if node.right:
                queue.append((node.right, node))
        
        # 检查 x 和 y 是否都在当前层
        vals = [val for val, _ in level_nodes]
        if x in vals and y in vals:
            # 找到它们的父节点
            parent_x = None
            parent_y = None
            for val, parent in level_nodes:
                if val == x:
                    parent_x = parent
                if val == y:
                    parent_y = parent
            
            # 父节点不同才是堂兄弟
            return parent_x != parent_y
        
        # 如果只有一个在本层，另一个在别的层，不是堂兄弟
        if (x in vals) != (y in vals):
            return False
    
    return False
