# 文件的读取

## 使用 `open()` 函数打开文本文件

在 Python 中，可以使用内置的 `open()` 函数打开文本文件进行读取。

### 基本语法

```python
open(file, mode='r', encoding=None)
```

### 参数说明

| 参数 | 说明 | 默认值 |
|------|------|--------|
| `file` | 文件名（相对路径或绝对路径） | 必填 |
| `mode` | 文件操作模式 | `'r'`（读取模式） |
| `encoding` | 字符编码 | `None`（使用操作系统默认编码） |

### 常用操作模式

| 模式 | 说明 |
|------|------|
| `'r'` | 读取模式（默认），文件不存在会报错 |
| `'w'` | 写入模式，会覆盖原有内容，文件不存在会创建 |
| `'a'` | 追加模式，在文件末尾追加内容，文件不存在会创建 |
| `'b'` | 二进制模式，如 `'rb'` 表示读取二进制文件 |
| `'+'` | 读写模式，如 `'r+'` 表示读写 |

### 示例代码

```python
# 方式1：使用默认参数（读取模式，操作系统默认编码）
file = open('example.txt')

# 方式2：显式指定读取模式和编码
file = open('example.txt', mode='r', encoding='utf-8')

# 方式3：使用 with 语句（推荐，自动关闭文件）
with open('example.txt', 'r', encoding='utf-8') as file:
    content = file.read()
    print(content)
```

### ⚠️ 注意事项：编码问题

> **重要提醒**：如果不能保证保存文件时使用的编码方式与 `encoding` 参数指定的编码方式一致，那么就可能因无法解码字符而导致读取文件失败。

**常见问题**：
- Windows 系统默认编码可能是 `gbk`，而文件可能是 `utf-8` 编码
- 解决方法：显式指定 `encoding='utf-8'` 参数

```python
# 推荐做法：显式指定编码
with open('example.txt', 'r', encoding='utf-8') as file:
    content = file.read()
```

### 读取文件的其他方法

```python
with open('example.txt', 'r', encoding='utf-8') as file:
    # 读取整个文件
    content = file.read()
    
    # 读取一行
    line = file.readline()
    
    # 读取所有行，返回列表
    lines = file.readlines()
    
    # 遍历文件行（推荐，内存友好）
    for line in file:
        print(line.strip())
```
