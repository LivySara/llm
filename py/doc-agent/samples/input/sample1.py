"""
示例 Python 文件
包含一些故意的错误，用于测试校验和修正功能
"""

import os
import sys


def hello(name):
    """打印问候语"""
    print(f"Hello, {name}!")


def add(a, b):
    return a + b


# 缺少文档字符串的函数
def subtract(a, b):
    return a - b


class Calculator:
    """简单的计算器类"""
    
    def __init__(self):
        self.result = 0
    
    def add(self, value):
        """加法"""
        self.result += value
        return self.result
    
    # 缺少文档字符串的方法
    def subtract(self, value):
        self.result -= value
        return self.result


# 主程序
if __name__ == "__main__":
    calc = Calculator()
    calc.add(5)
    calc.subtract(3)
    print(f"Result: {calc.result}")
