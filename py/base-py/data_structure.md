# Python 常用数据结构

本文档总结了 Python 中四种常用数据结构（列表、元组、字典、集合）的核心操作方法，包括创建、访问、修改、删除等操作。

---

## 一、基础特性概览

| 数据结构 | 核心特性 | 适用场景 |
|----------|----------|----------|
| **列表（List）** | 可变、有序，元素可重复，支持异构 | 存储动态有序序列，如日志、待办列表 |
| **元组（Tuple）** | 不可变、有序，元素可重复，内存占用更低 | 存储常量序列，如函数多返回值、数据库行记录 |
| **字典（Dict）** | 可变、Python3.7+插入有序，键值对映射，键唯一且可哈希 | 存储属性映射、缓存数据，查询速度极快 |
| **集合（Set）** | 可变、无序，元素唯一且可哈希，支持集合运算 | 去重、元素存在性判断、交集/并集等运算 |

---

## 二、列表（List）操作方法

### 1. 创建方法

```python
# 方式1：方括号直接定义
my_list = [1, "字符串", True, [1,2]]  # 支持异构元素
empty_list = []

# 方式2：list() 构造函数（可接收可迭代对象转换）
list_from_str = list("abcd")      # 结果：['a','b','c','d']
list_from_range = list(range(5))  # 结果：[0,1,2,3,4]
```

### 2. 访问方法

```python
my_list = [10, 20, 30, 40]

# 索引访问（正索引从 0 开始，负索引从 -1 倒序）
print(my_list[0])    # 输出：10
print(my_list[-1])   # 输出：40

# 切片访问（左闭右开，返回新列表，不修改原列表）
print(my_list[1:3])   # 输出：[20, 30]，取索引 1、2 的元素
print(my_list[::2])   # 输出：[10, 30]，步长为 2 取元素
print(my_list[::-1])  # 输出：[40, 30, 20, 10]，倒序访问
```

### 3. 修改方法

```python
my_list = [1, 2, 3]

# 方式1：索引直接赋值
my_list[0] = 100
print(my_list)  # 输出：[100, 2, 3]

# 方式2：切片赋值（可替换不同长度的片段）
my_list[1:3] = ['a', 'b', 'c']  # 替换索引 1、2 的元素为 3 个元素
print(my_list)  # 输出：[100, 'a', 'b', 'c']

# 常用修改方法
my_list.append(5)         # 末尾追加元素 → [100, 'a', 'b', 'c', 5]
my_list.insert(1, 'x')    # 索引 1 位置插入元素 → [100, 'x', 'a', 'b', 'c', 5]
my_list.extend([6, 7])    # 合并可迭代对象 → [100, 'x', 'a', 'b', 'c', 5, 6, 7]
my_list.sort()             # 原地排序（元素需支持比较）
my_list.reverse()          # 原地反转序列
```

### 4. 删除方法

```python
my_list = [1, 2, 3, 2, 4]

# 方式1：del 语句（按索引/切片删除）
del my_list[0]           # 删除索引 0 的元素 → [2, 3, 2, 4]
del my_list[1:3]         # 删除索引 1、2 的元素 → [2, 4]

# 方式2：remove()（删除第一个匹配值的元素）
my_list.remove(2)         # 删除第一个 2 → [4]

# 方式3：pop()（删除指定索引元素并返回值，默认删末尾）
popped = my_list.pop(0)  # 删除索引 0 的元素，popped 值为 4 → 列表清空

# 方式4：clear()（清空整个列表）
my_list.clear()           # 结果：[]

# 补充：删除所有匹配元素（列表推导式）
old_list = [1, 2, 3, 2, 4, 2]
new_list = [x for x in old_list if x != 2]  # 结果：[1, 3, 4]
```

---

## 三、元组（Tuple）操作方法

> ⚠️ **注意**：元组本身不可变，无法修改/删除单个元素，仅可整体操作；若元组内包含可变元素（如列表），可修改该可变元素的内容。

### 1. 创建方法

```python
# 方式1：圆括号定义（可省略圆括号）
my_tuple = (1, "hello", [1, 2])
same_tuple = 1, "hello", [1, 2]  # 等价上面的定义

# 方式2：单元素元组必须加逗号，否则会被识别为普通类型
single_tuple = (5,)   # 正确，类型为 tuple
wrong_single = (5)    # 错误，类型为 int

# 方式3：tuple() 构造函数
tuple_from_str = tuple("abc")  # 结果：('a', 'b', 'c')
```

### 2. 访问方法

和列表完全一致，支持索引、负索引、切片：

```python
my_tuple = ('a', 'b', 'c', 'd')
print(my_tuple[1])     # 输出：'b'
print(my_tuple[-2:])   # 输出：('c', 'd')
print(my_tuple[::2])   # 输出：('a', 'c')
```

### 3. 修改方法

```python
# 方式1：整体重新赋值（生成新元组，原元组不变）
my_tuple = ('a', 'b')
my_tuple = my_tuple + ('c', 'd')  # 新元组：('a', 'b', 'c', 'd')

# 方式2：修改元组内的可变元素
t = (1, [2, 3])
t[1].append(4)  # 合法，修改元组内的列表，t 变为 (1, [2, 3, 4])
```

### 4. 删除方法

无法删除元组内的单个元素，仅可删除整个元组变量：

```python
my_tuple = (1, 2, 3)
del my_tuple  # 删除后 my_tuple 变量不存在，访问会报 NameError
```

---

## 四、字典（Dictionary）操作方法

> ⚠️ **注意**：Python3.7+ 字典为插入有序；键必须为可哈希类型（int、str、tuple 等不可变类型，列表/字典不可作为键），且键唯一。

### 1. 创建方法

```python
# 方式1：花括号键值对定义
my_dict = {'name': '张三', 'age': 25, 'hobbies': ['看书', '编程']}
empty_dict = {}

# 方式2：dict() 构造函数
dict1 = dict(name='李四', age=30)  # 关键字参数方式 → {'name': '李四', 'age': 30}
dict2 = dict([('name', '王五'), ('age', 28)])  # 可迭代键值对方式
dict3 = dict.fromkeys(['a', 'b'], 0)  # 批量生成键，值为默认值 → {'a': 0, 'b': 0}

# 方式3：字典推导式
dict4 = {x: x**2 for x in range(3)}  # 结果：{0: 0, 1: 1, 2: 4}
```

### 2. 访问方法

```python
my_dict = {'name': '张三', 'age': 25}

# 方式1：键直接访问（键不存在会报 KeyError）
print(my_dict['name'])  # 输出：张三

# 方式2：get() 方法（键不存在返回 None，可指定默认值）
print(my_dict.get('gender'))           # 输出：None
print(my_dict.get('gender', '未知'))  # 输出：未知

# 批量获取键/值/键值对
print(my_dict.keys())    # 所有键：dict_keys(['name', 'age'])
print(my_dict.values())  # 所有值：dict_values(['张三', 25])
print(my_dict.items())   # 所有键值对：dict_items([('name', '张三'), ('age', 25)])

# 遍历示例
for key, value in my_dict.items():
    print(f"键：{key}，值：{value}")
```

### 3. 修改方法

```python
my_dict = {'name': '张三', 'age': 25}

# 方式1：键直接赋值（键存在则修改值，不存在则新增键值对）
my_dict['age'] = 26      # 修改已有键的值
my_dict['gender'] = '男'  # 新增键值对

# 方式2：update()（合并另一个字典，相同键会覆盖）
my_dict.update({'age': 27, 'city': '北京'})

# 方式3：setdefault()（键存在则返回对应值，不存在则插入键和默认值）
my_dict.setdefault('age', 30)      # age 已存在，返回 27，不修改
my_dict.setdefault('phone', '138xxxx')  # phone 不存在，插入该键值对
```

### 4. 删除方法

```python
my_dict = {'name': '张三', 'age': 27, 'city': '北京'}

# 方式1：del 语句（删除指定键值对）
del my_dict['city']

# 方式2：pop()（删除指定键并返回对应值，键不存在可指定默认值避免报错）
age = my_dict.pop('age')                # age 值为 27，删除后字典无 age 键
gender = my_dict.pop('gender', '默认值')  # 若 gender 不存在，返回 '默认值'，不报错

# 方式3：popitem()（Python3.7+ 删除最后插入的键值对并返回，旧版本随机删除）
last_item = my_dict.popitem()

# 方式4：clear()（清空整个字典）
my_dict.clear()
```

---

## 五、集合（Set）操作方法

> ⚠️ **注意**：集合无序，不支持索引访问；元素唯一且可哈希；空集合必须用 `set()` 创建，`{}` 默认是空字典；不可变集合为 `frozenset`，可作为字典的键。

### 1. 创建方法

```python
# 方式1：花括号定义（自动去重）
my_set = {1, 2, 3, 3, 4}  # 自动去重，实际为 {1, 2, 3, 4}

# 方式2：空集合必须用 set()，不能用 {}
empty_set = set()  # 正确，空集合
wrong_empty = {}    # 错误，类型为 dict（空字典）

# 方式3：set() 构造函数（可接收可迭代对象去重）
set_from_list = set([1, 2, 2, 3])  # 结果：{1, 2, 3}

# 方式4：集合推导式
set1 = {x for x in range(5) if x % 2 == 0}  # 结果：{0, 2, 4}
```

### 2. 访问方法

集合无序，不支持索引/切片访问，仅可遍历或判断元素是否存在：

```python
my_set = {1, 2, 3, 4}
print(2 in my_set)  # 输出：True，判断元素是否存在

# 遍历集合
for ele in my_set:
    print(ele)
```

### 3. 修改方法

```python
my_set = {1, 2, 3}

# 方式1：add()（添加单个元素）
my_set.add(5)  # 结果：{1, 2, 3, 4, 5}

# 方式2：update()（添加多个元素，接收可迭代对象）
my_set.update([6, 7], (8, 9))  # 结果：{1, 2, 3, 4, 5, 6, 7, 8, 9}
```

### 4. 删除方法

```python
my_set = {1, 2, 3, 4, 5}

# 方式1：remove()（删除指定元素，元素不存在会报 KeyError）
my_set.remove(1)  # 删除 1，不存在则报错

# 方式2：discard()（删除指定元素，元素不存在不会报错）
my_set.discard(10)  # 10 不存在，无操作，不报错

# 方式3：pop()（删除并返回任意一个元素，因无序无法确定删除目标）
popped_ele = my_set.pop()

# 方式4：clear()（清空整个集合）
my_set.clear()
```

### 补充：集合运算（支持运算符或方法调用）

```python
s1 = {1, 2, 3}
s2 = {2, 3, 4}
print(s1 & s2)    # 交集：{2, 3}，等价于 s1.intersection(s2)
print(s1 | s2)    # 并集：{1, 2, 3, 4}，等价于 s1.union(s2)
print(s1 - s2)    # 差集（s1 有 s2 没有）：{1}，等价于 s1.difference(s2)
print(s1 ^ s2)    # 对称差（仅在一个集合中的元素）：{1, 4}，等价于 s1.symmetric_difference(s2)
```

---

## 六、总结对比

| 操作 | 列表（List） | 元组（Tuple） | 字典（Dict） | 集合（Set） |
|------|-------------|--------------|-------------|-------------|
| **创建** | `[]` 或 `list()` | `()` 或 `tuple()` | `{}` 或 `dict()` | `set()` 或 `{}` |
| **访问** | 索引、切片 | 索引、切片 | 键访问 | 不支持索引 |
| **修改** | 支持 | 不支持（整体替换） | 支持 | 支持 |
| **删除** | `del`、`remove()`、`pop()` | 只能删除整个元组 | `del`、`pop()`、`clear()` | `remove()`、`discard()`、`pop()` |
| **有序性** | 有序 | 有序 | Python3.7+ 有序 | 无序 |
| **元素唯一性** | 可重复 | 可重复 | 键唯一 | 元素唯一 |
| **可变性** | 可变 | 不可变 | 可变 | 可变 |
