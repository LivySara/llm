"""
模拟类题目
包含：TLV报文解析、简易内存池、麻将胡牌判断
"""

class SimpleMemoryPool:
    """简易内存池（首次适应算法）"""
    def __init__(self, total_size):
        """
        初始化内存池
        total_size: 总内存大小
        """
        self.total_size = total_size
        # 空闲分区表：[(起始地址, 大小), ...]
        self.free_blocks = [(0, total_size)]
        # 已分配分区表：[(起始地址, 大小, 进程ID), ...]
        self.allocated_blocks = []
        self.pid_counter = 1
    
    def allocate(self, size):
        """
        分配内存（首次适应）
        返回: (成功?, 进程ID, 分配的地址)
        """
        for i, (addr, block_size) in enumerate(self.free_blocks):
            if block_size >= size:
                # 分配内存
                pid = self.pid_counter
                self.pid_counter += 1
                
                # 更新空闲分区表
                if block_size == size:
                    # 正好用完
                    self.free_blocks.pop(i)
                else:
                    # 分割分区
                    self.free_blocks[i] = (addr + size, block_size - size)
                
                # 添加到已分配表
                self.allocated_blocks.append((addr, size, pid))
                
                return True, pid, addr
        
        return False, -1, -1  # 分配失败
    
    def deallocate(self, pid):
        """
        释放内存
        返回: (成功?, 消息)
        """
        for i, (addr, size, block_pid) in enumerate(self.allocated_blocks):
            if block_pid == pid:
                # 从已分配表中移除
                self.allocated_blocks.pop(i)
                # 添加到空闲表
                self.free_blocks.append((addr, size))
                # 合并相邻空闲块
                self._merge_free_blocks()
                return True, f"进程{pid}内存已释放"
        
        return False, f"未找到进程{pid}"
    
    def _merge_free_blocks(self):
        """合并相邻的空闲块"""
        # 按地址排序
        self.free_blocks.sort(key=lambda x: x[0])
        
        merged = []
        for block in self.free_blocks:
            if not merged:
                merged.append(block)
            else:
                last_addr, last_size = merged[-1]
                addr, size = block
                
                if last_addr + last_size == addr:
                    # 相邻，合并
                    merged[-1] = (last_addr, last_size + size)
                else:
                    merged.append(block)
        
        self.free_blocks = merged
    
    def display_status(self):
        """显示内存池状态"""
        print(f"\n内存池状态 (总大小: {self.total_size}):")
        print(f"  空闲分区: {self.free_blocks}")
        print(f"  已分配: {self.allocated_blocks}")
        used = sum(size for _, size, _ in self.allocated_blocks)
        free = sum(size for _, size in self.free_blocks)
        print(f"  已用: {used}, 剩余: {free}")


def parse_tlv(hex_string):
    """
    TLV报文解析
    T: Tag（1字节）
    L: Length（1字节，表示V的长度）
    V: Value（L字节）
    返回: 解析结果列表 [(tag, length, value), ...]
    """
    result = []
    i = 0
    n = len(hex_string)
    
    while i + 4 <= n:  # 至少需要T(2字符) + L(2字符)
        # 解析Tag（1字节 = 2个十六进制字符）
        tag = hex_string[i:i+2]
        i += 2
        
        # 解析Length（1字节）
        length = int(hex_string[i:i+2], 16)
        i += 2
        
        # 解析Value（length字节）
        value_length = length * 2  # 每个字节2个十六进制字符
        if i + value_length > n:
            break  # 数据不完整
        
        value = hex_string[i:i+value_length]
        i += value_length
        
        result.append((tag, length, value))
    
    return result


def can_win_mahjong(tiles):
    """
    麻将胡牌判断（简化版）
    tiles: 13张牌的列表，每个元素是1-9的数字（表示筒、条、万可用不同范围）
    返回: 是否能胡牌
    """
    if len(tiles) != 13:
        return False
    
    # 统计每张牌的数量
    from collections import Counter
    count = Counter(tiles)
    
    # 尝试每张牌作为将牌
    for tile in list(count.keys()):
        if count[tile] >= 2:
            # 去掉将牌
            count[tile] -= 2
            
            # 判断剩余12张是否能组成4组刻子或顺子
            if _can_form_melds(count):
                return True
            
            # 恢复
            count[tile] += 2
    
    return False


def _can_form_melds(count):
    """
    判断是否能组成4组刻子或顺子
    使用递归+回溯
    """
    # 如果所有牌都用完了，说明成功
    if all(v == 0 for v in count.values()):
        return True
    
    # 找到第一张还有剩余的牌
    for tile in sorted(count.keys()):
        if count[tile] > 0:
            # 尝试刻子（3张相同的牌）
            if count[tile] >= 3:
                count[tile] -= 3
                if _can_form_melds(count):
                    return True
                count[tile] += 3
            
            # 尝试顺子（连续的3张牌）
            if (tile + 1 in count and count[tile + 1] > 0 and 
                tile + 2 in count and count[tile + 2] > 0):
                count[tile] -= 1
                count[tile + 1] -= 1
                count[tile + 2] -= 1
                if _can_form_melds(count):
                    return True
                count[tile] += 1
                count[tile + 1] += 1
                count[tile + 2] += 1
            
            # 如果既不能组成刻子也不能组成顺子，失败
            return False
    
    return False


if __name__ == "__main__":
    # 测试TLV报文解析
    print("=== TLV报文解析测试 ===")
    # 示例：Tag=01, Length=2, Value=1234; Tag=02, Length=1, Value=78
    tlv_data = "010212340278"
    print(f"TLV数据: {tlv_data}")
    parsed = parse_tlv(tlv_data)
    for tag, length, value in parsed:
        print(f"  Tag={tag}, Length={length}, Value={value}")
    
    # 测试简易内存池
    print(f"\n=== 简易内存池测试 ===")
    pool = SimpleMemoryPool(100)
    
    # 分配内存
    for size in [20, 30, 10]:
        success, pid, addr = pool.allocate(size)
        print(f"分配{size}单位: {'成功' if success else '失败'}, PID={pid}, 地址={addr}")
    
    pool.display_status()
    
    # 释放内存
    success, msg = pool.deallocate(2)
    print(msg)
    
    pool.display_status()
    
    # 测试麻将胡牌判断
    print(f"\n=== 麻将胡牌判断测试 ===")
    # 测试1：一对1筒 + 234筒 + 567筒 + 888筒 + 999筒
    hand1 = [1, 1, 2, 3, 4, 5, 6, 7, 8, 8, 8, 9, 9, 9]
    print(f"手牌1: {hand1}")
    print(f"是否能胡: {can_win_mahjong(hand1)}")  # True
    
    # 测试2：不能胡的牌
    hand2 = [1, 2, 3, 4, 5, 6, 7, 8, 9, 1, 2, 3, 4]
    print(f"手牌2: {hand2}")
    print(f"是否能胡: {can_win_mahjong(hand2)}")  # False
