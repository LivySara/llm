"""
图算法类题目
包含：拓扑排序、并查集（好友连通）、迷宫最短路径
"""

from collections import defaultdict, deque

def topological_sort(n, edges):
    """
    拓扑排序
    n: 节点数（编号1~n）
    edges: 依赖关系列表 [(a, b), ...] 表示a依赖于b（b必须在a之前）
    返回: (是否有环, 拓扑排序结果)
    """
    # 构建邻接表和入度表
    graph = defaultdict(list)
    in_degree = [0] * (n + 1)
    
    for a, b in edges:
        graph[b].append(a)  # b -> a (b在a之前)
        in_degree[a] += 1
    
    # BFS拓扑排序
    queue = deque()
    # 找到所有入度为0的节点
    for i in range(1, n + 1):
        if in_degree[i] == 0:
            queue.append(i)
    
    result = []
    while queue:
        node = queue.popleft()
        result.append(node)
        
        for neighbor in graph[node]:
            in_degree[neighbor] -= 1
            if in_degree[neighbor] == 0:
                queue.append(neighbor)
    
    # 如果结果长度不等于节点数，说明有环
    has_cycle = len(result) != n
    return not has_cycle, result


class UnionFind:
    """并查集数据结构"""
    def __init__(self, n):
        self.parent = list(range(n + 1))  # 1-indexed
        self.rank = [0] * (n + 1)
        self.count = n  # 连通分量数
    
    def find(self, x):
        """查找根节点（路径压缩）"""
        if self.parent[x] != x:
            self.parent[x] = self.find(self.parent[x])
        return self.parent[x]
    
    def union(self, x, y):
        """合并两个集合（按秩合并）"""
        root_x = self.find(x)
        root_y = self.find(y)
        
        if root_x == root_y:
            return
        
        if self.rank[root_x] < self.rank[root_y]:
            self.parent[root_x] = root_y
        elif self.rank[root_x] > self.rank[root_y]:
            self.parent[root_y] = root_x
        else:
            self.parent[root_y] = root_x
            self.rank[root_x] += 1
        
        self.count -= 1
    
    def get_count(self):
        """返回连通分量数"""
        return self.count


def friend_circles(n, relations):
    """
    好友连通问题（朋友圈数量）
    n: 人数
    relations: 好友关系列表 [(a, b), ...]
    返回: 朋友圈数量
    """
    uf = UnionFind(n)
    
    for a, b in relations:
        uf.union(a, b)
    
    return uf.get_count()


def maze_shortest_path(maze):
    """
    迷宫最短路径（BFS）
    maze: 二维数组，0表示可走，1表示障碍物
    返回: 最短路径长度（如果不可达返回-1）
    """
    if not maze or not maze[0]:
        return -1
    
    m, n = len(maze), len(maze[0])
    
    # 起点或终点不可达
    if maze[0][0] == 1 or maze[m-1][n-1] == 1:
        return -1
    
    # 方向数组：下、右、上、左
    directions = [(1, 0), (0, 1), (-1, 0), (0, -1)]
    
    # BFS队列：(行, 列, 距离)
    queue = deque([(0, 0, 0)])
    visited = [[False] * n for _ in range(m)]
    visited[0][0] = True
    
    while queue:
        row, col, dist = queue.popleft()
        
        # 到达终点
        if row == m - 1 and col == n - 1:
            return dist
        
        # 探索四个方向
        for dr, dc in directions:
            new_row, new_col = row + dr, col + dc
            
            # 检查边界、障碍物和访问状态
            if (0 <= new_row < m and 0 <= new_col < n and 
                maze[new_row][new_col] == 0 and not visited[new_row][new_col]):
                visited[new_row][new_col] = True
                queue.append((new_row, new_col, dist + 1))
    
    return -1  # 不可达


if __name__ == "__main__":
    # 测试拓扑排序
    print("=== 拓扑排序测试 ===")
    # 项目依赖：1依赖于2，1依赖于3，2依赖于4
    edges1 = [(1, 2), (1, 3), (2, 4)]
    has_cycle, order = topological_sort(4, edges1)
    print(f"是否有环: {has_cycle}, 拓扑序: {order}")
    
    # 有环的情况：1->2->3->1
    edges2 = [(2, 1), (3, 2), (1, 3)]
    has_cycle, order = topological_sort(3, edges2)
    print(f"是否有环: {has_cycle}, 拓扑序: {order}")
    
    # 测试好友连通
    print(f"\n=== 好友连通测试 ===")
    # 5个人，关系：1-2, 2-3, 4-5
    relations1 = [(1, 2), (2, 3), (4, 5)]
    print(f"朋友圈数量: {friend_circles(5, relations1)}")  # 2
    
    # 5个人，关系：1-2, 2-3, 3-4, 4-5（所有人都连通）
    relations2 = [(1, 2), (2, 3), (3, 4), (4, 5)]
    print(f"朋友圈数量: {friend_circles(5, relations2)}")  # 1
    
    # 测试迷宫最短路径
    print(f"\n=== 迷宫最短路径测试 ===")
    maze1 = [
        [0, 1, 0, 0],
        [0, 1, 0, 1],
        [0, 0, 0, 0],
        [1, 1, 1, 0]
    ]
    print(f"最短路径长度: {maze_shortest_path(maze1)}")  # 6
    
    maze2 = [
        [0, 0, 0],
        [0, 1, 0],
        [0, 0, 0]
    ]
    print(f"最短路径长度: {maze_shortest_path(maze2)}")  # 4
