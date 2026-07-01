'''
列表(list)
'''

list1 = [1,2,3,4,5]
list2 = [6,7,8,9,10]

# list 函数将其他序列变成列表
print(list(range(1, 10)))
print(list('abcdef'))

# + 运算符：两个列表拼接
print(list1 + list2)

# * 运算符：列表重复
print(list1 * 3)

# in | not in 运算符：判断某个元素是否在列表中
print(6 in list1)
print('d' not in list1)

# 索引获取元素
print(list1[1])

# 切片获取元素
print(list1[0:2])
print(list1[:3:1])
print(list1[::2])
print(list1[:-3:-1])
print(list1[-1::-1])

