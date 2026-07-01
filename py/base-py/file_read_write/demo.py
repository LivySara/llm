
# 读取文件
def readFileDemo():
    file = open('./file/致橡树.txt', 'r', encoding='utf-8')
    
    # read方法读取
    # print(file.read())
    
    # for-in循环逐行读取
    # for line in file:
    #     print(line, end='')
    
    # readlines方法按行读取到一个列表容器内
    # lines = file.readlines()
    # for line in lines:
    #     print(line, end='')
    
    file.close()

# 写入文件
def writeFileDemo():
    file = open('./file/致橡树.txt', 'a', encoding='utf-8')

    file.write('\n标题：《致橡树》')
    file.write('\n作者：舒婷')
    file.write('\n时间：1977年3月')

    file.close()

# 异常处理机制
def tryCatchDemo():
    file = None
    try:
        file = open('致橡树.txt', 'r', encoding='utf-8')
        print(file.read())
    except FileNotFoundError:
        print('无法打开指定的文件!')
    except LookupError:
        print('指定了未知的编码!')
    except UnicodeDecodeError:
        print('读取文件时解码错误!')
    finally:
        if file:
            file.close()

tryCatchDemo()