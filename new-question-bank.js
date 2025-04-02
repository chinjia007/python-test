// 题库数据
const questionBank = {
    1: [
        {
            question: "以下哪个是Python中的内置数据类型？",
            options: [
                "Array",
                "ArrayList",
                "LinkedList",
                "List"
            ],
            correctAnswer: 3,
            explanation: "在Python中，<strong>List（列表）</strong>是内置数据类型，可以使用方括号[]创建。而Array、ArrayList和LinkedList都是其他编程语言（如Java、C++等）中的数据结构，在Python标准库中并不存在。"
        },
        {
            question: "Python中用于输出内容到控制台的函数是？",
            options: [
                "console.log()",
                "System.out.println()",
                "print()",
                "echo()"
            ],
            correctAnswer: 2,
            explanation: "在Python中，<strong>print()</strong>函数用于将指定的消息输出到屏幕或其他标准输出设备。console.log()是JavaScript中的方法，System.out.println()是Java中的方法，echo()是PHP中的函数。"
        },
        {
            question: "以下哪个不是Python的合法变量名？",
            options: [
                "_variable",
                "variable_name",
                "1variable",
                "VariableName"
            ],
            correctAnswer: 2,
            explanation: "在Python中，变量名不能以数字开头，因此<strong>1variable</strong>是不合法的变量名。Python变量名必须以字母或下划线开头，后续可以包含字母、数字和下划线。"
        },
        {
            question: "Python中注释的正确写法是？",
            options: [
                "// 这是注释",
                "/* 这是注释 */",
                "# 这是注释",
                "<!-- 这是注释 -->"
            ],
            correctAnswer: 2,
            explanation: "在Python中，<strong>#</strong>用于单行注释。// 用于C、C++、Java等语言的单行注释，/* */用于C、C++、Java等语言的多行注释，<!-- -->是HTML/XML的注释格式。"
        },
        {
            question: "在Python中，哪个语句用于导入模块？",
            options: [
                "include",
                "import",
                "require",
                "using"
            ],
            correctAnswer: 1,
            explanation: "在Python中，<strong>import</strong>语句用于导入模块。include是C/C++中的预处理指令，require是PHP/Node.js中的函数，using是C#中的语句。"
        },
        {
            question: "Python中的列表是可变的（mutable）。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python中的列表（list）是<strong>可变的（mutable）</strong>数据类型。这意味着可以在不创建新列表的情况下修改列表的内容，例如添加、删除或修改列表元素。"
        },
        {
            question: "Python中字符串拼接可以使用哪个运算符？",
            options: [
                "+",
                ".",
                "&",
                ","
            ],
            correctAnswer: 0,
            explanation: "在Python中，<strong>加号（+）</strong>运算符用于字符串拼接。例如，'Hello' + 'World'的结果是'HelloWorld'。"
        },
        {
            question: "Python是一种解释型语言。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python是一种<strong>解释型语言</strong>。Python代码在执行时由解释器逐行解释执行，而不需要像编译型语言那样提前编译成机器代码。这使得Python开发更加灵活，但执行速度较慢。"
        },
        {
            question: "Python的缩进是用来做什么的？",
            options: [
                "提高代码可读性",
                "定义代码块",
                "减少错误",
                "节省内存"
            ],
            correctAnswer: 1,
            explanation: "在Python中，缩进用于<strong>定义代码块</strong>。与其他使用大括号{}的语言不同，Python使用缩进来表示条件语句、循环、函数和类定义等代码块的范围。"
        },
        {
            question: "Python中用于获取用户输入的函数是？",
            options: [
                "scanf()",
                "readLine()",
                "input()",
                "get()"
            ],
            correctAnswer: 2,
            explanation: "在Python中，<strong>input()</strong>函数用于从用户获取输入。这个函数会暂停程序执行，等待用户输入，当用户按下回车键后，将输入的内容作为字符串返回。"
        },
        {
            question: "Python中的字典使用什么符号定义？",
            options: [
                "[]",
                "()",
                "{}",
                "<>"
            ],
            correctAnswer: 2,
            explanation: "在Python中，字典（dictionary）使用<strong>大括号{}</strong>定义。字典是无序的键值对集合，每个键值对用冒号分隔，不同键值对之间用逗号分隔。例如：{'name': 'John', 'age': 30}"
        },
        {
            question: "Python支持面向对象编程。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python<strong>支持面向对象编程</strong>。Python中可以创建类和对象，实现封装、继承和多态等面向对象编程的核心概念。"
        },
        {
            question: "在Python中，range(5)会生成哪些数字？",
            options: [
                "[0, 1, 2, 3, 4, 5]",
                "[0, 1, 2, 3, 4]",
                "[1, 2, 3, 4, 5]",
                "[1, 2, 3, 4]"
            ],
            correctAnswer: 1,
            explanation: "在Python中，range(5)会生成<strong>[0, 1, 2, 3, 4]</strong>。range()函数生成的序列从0开始，不包括结束值。如果想生成从1开始的序列，可以使用range(1, 6)。"
        },
        {
            question: "Python中的元组（tuple）是不可变的。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python中的元组（tuple）是<strong>不可变的（immutable）</strong>数据类型。一旦创建了元组，就不能修改其中的元素。元组使用圆括号()定义，例如：(1, 2, 3)"
        },
        {
            question: "Python的标准库中包含哪个模块用于处理正则表达式？",
            options: [
                "regex",
                "regexp",
                "re",
                "regular"
            ],
            correctAnswer: 2,
            explanation: "Python的标准库中包含<strong>re</strong>模块，用于处理正则表达式。通过import re导入后，可以使用re.match()、re.search()等函数进行模式匹配。"
        }
    ],
    2: [
        {
            question: "在Python中，如何获取列表的长度？",
            options: [
                "list.length()",
                "list.size()",
                "len(list)",
                "sizeof(list)"
            ],
            correctAnswer: 2,
            explanation: "在Python中，使用<strong>len(list)</strong>函数获取列表的长度。len()是一个内置函数，可以返回序列（如字符串、列表、元组等）的项目数量。"
        },
        {
            question: "Python中哪个关键字用于定义函数？",
            options: [
                "function",
                "def",
                "func",
                "define"
            ],
            correctAnswer: 1,
            explanation: "在Python中，<strong>def</strong>关键字用于定义函数。例如：def greet(): print('Hello World')"
        },
        {
            question: "在Python中使用什么操作符检查对象是否存在于序列中？",
            options: [
                "has",
                "contains",
                "in",
                "exists"
            ],
            correctAnswer: 2,
            explanation: "在Python中，使用<strong>in</strong>操作符检查对象是否存在于序列中。例如：if 'apple' in fruits: print('Found an apple')"
        },
        {
            question: "Python中的列表可以包含不同类型的元素。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python中的列表<strong>可以包含不同类型的元素</strong>。例如，一个列表可以同时包含整数、字符串、布尔值，甚至其他列表或对象。这是因为Python是动态类型语言。"
        },
        {
            question: "在Python中，哪个方法用于将字符串全部转换为大写？",
            options: [
                "str.upper()",
                "str.toUpper()",
                "str.uppercase()",
                "str.capitalize()"
            ],
            correctAnswer: 0,
            explanation: "在Python中，<strong>str.upper()</strong>方法用于将字符串全部转换为大写。例如：'hello'.upper()将返回'HELLO'。"
        },
        {
            question: "Python中的循环有哪些？",
            options: [
                "for和while循环",
                "for、while和do-while循环",
                "for、foreach和while循环",
                "for、loop和while循环"
            ],
            correctAnswer: 0,
            explanation: "Python中只有<strong>for和while循环</strong>。与其他一些编程语言不同，Python没有do-while循环或foreach循环（尽管for循环在Python中的行为类似于其他语言的foreach）。"
        },
        {
            question: "Python中，哪个函数用于打开文件？",
            options: [
                "file()",
                "open()",
                "read()",
                "fopen()"
            ],
            correctAnswer: 1,
            explanation: "在Python中，<strong>open()</strong>函数用于打开文件。例如：file = open('example.txt', 'r')将以只读模式打开名为example.txt的文件。"
        },
        {
            question: "Python中的字典键必须是不可变类型。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python中字典的键<strong>必须是不可变类型</strong>，如字符串、数字或元组（只包含不可变元素的元组）。列表和字典等可变类型不能作为字典的键。"
        },
        {
            question: "Python中的三引号字符串有什么特点？",
            options: [
                "可以包含单引号和双引号",
                "可以跨多行",
                "执行速度更快",
                "自动进行格式化"
            ],
            correctAnswer: 1,
            explanation: "Python中的三引号字符串（使用'''或\"\"\"）的主要特点是<strong>可以跨多行</strong>。这使得定义多行字符串变得更加方便，特别是对于包含大段文本或多行代码示例的字符串。"
        },
        {
            question: "在Python中，如何删除列表中的元素？",
            options: [
                "使用delete()方法",
                "使用remove()方法或del语句",
                "使用discard()方法",
                "使用erase()方法"
            ],
            correctAnswer: 1,
            explanation: "在Python中，可以<strong>使用remove()方法或del语句</strong>删除列表中的元素。例如，list.remove(item)会删除列表中第一个值为item的元素，而del list[index]会删除指定索引位置的元素。"
        },
        {
            question: "Python中的字符串是不可变的。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python中的字符串是<strong>不可变的（immutable）</strong>。这意味着一旦创建了字符串，就不能修改它的内容。如果需要对字符串进行修改，必须创建一个新的字符串。"
        },
        {
            question: "在Python中，什么是列表推导式？",
            options: [
                "一种创建列表的简洁方式",
                "一种排序算法",
                "一种测试列表的方法",
                "一种列表可视化工具"
            ],
            correctAnswer: 0,
            explanation: "在Python中，列表推导式是<strong>一种创建列表的简洁方式</strong>。它允许在一行代码中通过对可迭代对象应用表达式并（可选地）筛选元素来创建列表。例如：[x*2 for x in range(10) if x%2==0]"
        },
        {
            question: "Python中的None等价于其他语言中的null或nil。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python中的<strong>None</strong>等价于其他编程语言中的null或nil。它表示空值或不存在的值，常用于表示函数没有返回值或变量没有被赋值。"
        },
        {
            question: "在Python中，如何捕获异常？",
            options: [
                "使用try-catch块",
                "使用try-except块",
                "使用if-else语句",
                "使用error-handle块"
            ],
            correctAnswer: 1,
            explanation: "在Python中，使用<strong>try-except块</strong>捕获异常。例如：try: 可能引发异常的代码 except Exception as e: 处理异常的代码"
        },
        {
            question: "Python支持多重继承。",
            type: "true_false",
            correctAnswer: true,
            explanation: "是的，Python<strong>支持多重继承</strong>。一个类可以从多个父类继承属性和方法。这提供了代码重用的灵活性，但也可能导致"钻石问题"等复杂情况，Python使用C3线性化算法解决这些问题。"
        }
    ]
}; 