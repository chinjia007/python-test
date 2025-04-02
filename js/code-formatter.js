/**
 * Python代码格式化工具
 * 用于识别题干和选项中的代码，并应用适当的格式化样式
 */

// 代码片段类型枚举
const CodeType = {
    INLINE: 'inline',   // 内联代码（单行/单个语句）
    BLOCK: 'block'      // 代码块（多行代码）
};

/**
 * 检测一段文本是否包含Python代码
 * @param {string} text - 要检测的文本
 * @returns {boolean} 是否包含代码
 */
function containsCode(text) {
    if (!text || typeof text !== 'string') return false;
    
    // Python关键字和函数模式列表
    const pythonPatterns = [
        // Python内置函数
        /\b(print|input|int|str|float|len|range|open|read|write|append|format)\s*\(/,
        // 循环和条件语句
        /\b(for|while|if|elif|else|try|except|finally)\b\s*:/,
        // 常见海龟图形库函数
        /\b(forward|backward|left|right|penup|pendown|goto|setpos|setheading|pencolor|pensize|fillcolor|begin_fill|end_fill|circle|dot|hideturtle|showturtle|speed)\s*\(/,
        // 变量赋值模式
        /\b[a-zA-Z_][a-zA-Z0-9_]*\s*=/,
        // 函数定义
        /\bdef\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(/,
        // 类定义
        /\bclass\s+[a-zA-Z_][a-zA-Z0-9_]*\s*:/,
        // 导入语句
        /\b(import|from)\s+[a-zA-Z_][a-zA-Z0-9_.]*/,
        // 列表、字典、元组操作
        /\[\s*.*\s*\]|\{\s*.*\s*\}|\(\s*.*\s*\)/,
        // 海龟角度和距离值模式
        /\b(forward|backward|left|right|goto|circle)\s*\(\s*\d+/,
        // 布尔值和None
        /\b(True|False|None)\b/
    ];
    
    // 检查文本是否匹配任一Python模式
    return pythonPatterns.some(pattern => pattern.test(text));
}

/**
 * 确定代码片段的类型
 * @param {string} code - 代码文本
 * @returns {string} 代码类型（内联或块）
 */
function determineCodeType(code) {
    // 如果包含换行符，或超过一定字符数，视为代码块
    if (code.includes('\n') || code.split('\n').length > 1) {
        return CodeType.BLOCK;
    }
    
    // 如果是单个语句且较短，视为内联代码
    // 简化逻辑：即使是单行，如果超过70个字符，也视为代码块以便更好地显示
    if (code.length > 70) {
        return CodeType.BLOCK;
    }
    
    return CodeType.INLINE;
}

/**
 * 识别文本中的代码片段
 * @param {string} text - 要分析的文本
 * @returns {Array} 包含代码片段信息的数组
 */
function identifyCodeFragments(text) {
    if (!text || typeof text !== 'string') return [];
    
    // 定义代码片段识别模式
    const codePatterns = [
        // 函数调用: print("hello"), range(5), len(list)
        {
            pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*\s*\([^)]*\))/g,
            type: 'function_call'
        },
        // 变量赋值: x = 5, counter = 0
        {
            pattern: /\b([a-zA-Z_][a-zA-Z0-9_]*\s*=\s*[^，。？！；\s;:]*)/g,
            type: 'assignment'
        },
        // for循环: for i in range(5):
        {
            pattern: /\b(for\s+[a-zA-Z_][a-zA-Z0-9_]*\s+in\s+[^:：。，；\n]+:?)/g,
            type: 'for_loop'
        },
        // while循环: while condition:
        {
            pattern: /\b(while\s+[^:：。，；\n]+:)/g,
            type: 'while_loop'
        },
        // if/elif/else语句
        {
            pattern: /\b(if\s+[^:：。，；\n]+:)/g,
            type: 'if_statement'
        },
        {
            pattern: /\b(elif\s+[^:：。，；\n]+:)/g,
            type: 'elif_statement'
        },
        {
            pattern: /\b(else\s*:)/g,
            type: 'else_statement'
        },
        // 伪代码形式: for i from 1 to 5
        {
            pattern: /\b(for\s+[a-zA-Z_][a-zA-Z0-9_]*\s+from\s+\d+\s+to\s+\d+)/g,
            type: 'pseudo_for'
        },
        // 单独的布尔值或None
        {
            pattern: /\b(True|False|None)\b/g,
            type: 'keyword'
        }
    ];
    
    // 存储所有找到的代码片段
    let fragments = [];
    
    // 查找所有代码片段
    for (const { pattern, type } of codePatterns) {
        const matches = Array.from(text.matchAll(pattern));
        
        for (const match of matches) {
            fragments.push({
                text: match[1],
                start: match.index,
                end: match.index + match[1].length,
                type: type
            });
        }
    }
    
    // 按照起始位置排序
    fragments.sort((a, b) => a.start - b.start);
    
    // 合并重叠的片段
    for (let i = 0; i < fragments.length - 1; i++) {
        if (fragments[i + 1].start <= fragments[i].end) {
            // 如果存在重叠，合并为一个更大的片段
            fragments[i].end = Math.max(fragments[i].end, fragments[i + 1].end);
            fragments[i].text = text.substring(fragments[i].start, fragments[i].end);
            fragments[i].type = 'merged';
            
            // 移除被合并的片段
            fragments.splice(i + 1, 1);
            i--; // 重新检查当前位置
        }
    }
    
    return fragments;
}

/**
 * 处理文本中的英文、数字和标点符号，将它们包装在span标签中以应用特定字体
 * @param {string} text - 要处理的文本
 * @returns {string} 处理后的文本
 */
function wrapLatinChars(text) {
    if (!text || typeof text !== 'string') return text;
    
    // 如果文本已经包含HTML标签，不直接处理以避免破坏现有结构
    if (text.includes('<') && text.includes('>')) {
        return text;
    }
    
    // 使用正则表达式匹配连续的英文、数字和标点符号
    return text.replace(/([a-zA-Z0-9\s!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+)/g, 
        '<span class="latin-font">$1</span>');
}

/**
 * 格式化问题文本，支持代码块和行内代码
 * @param {string} text - 问题文本
 * @returns {string} 格式化后的文本
 */
function formatQuestionText(text) {
    if (!text || typeof text !== 'string') return '';

    // 增强空格规则：处理题干中的单独数字、字母、单词和代码，使其与周围文字有空格隔开
    let processedText = text;
    
    // 1. 处理被中文包围的单个字母或数字 (确保前后有空格)
    processedText = processedText.replace(/([^\s\da-zA-Z])([a-zA-Z\d])([^\s\da-zA-Z])/g, '$1 $2 $3');
    
    // 2. 处理被中文包围的英文单词或代码片段 (确保前后有空格)
    processedText = processedText.replace(/([^\s\da-zA-Z])([a-zA-Z\d][a-zA-Z\d\._\(\)]*[a-zA-Z\d\)])([^\s\da-zA-Z])/g, '$1 $2 $3');
    
    // 3. 处理段落开头的单个字母、数字或代码 (确保后面有空格)
    processedText = processedText.replace(/^([a-zA-Z\d][a-zA-Z\d\._\(\)]*[a-zA-Z\d\)]*)([^\s\da-zA-Z])/gm, '$1 $2');
    
    // 4. 处理段落结尾的单个字母、数字或代码 (确保前面有空格)
    processedText = processedText.replace(/([^\s\da-zA-Z])([a-zA-Z\d][a-zA-Z\d\._\(\)]*[a-zA-Z\d\)]*)$/gm, '$1 $2');
    
    // 5. 处理明显的代码片段，如函数调用
    processedText = processedText.replace(/([^\s])(\b[a-zA-Z_][a-zA-Z0-9_]*\s*\([^\)]*\))([^\s])/g, '$1 $2 $3');
    
    // 分割文本为行以保留换行
    const lines = processedText.split('\n');
    
    // 处理每一行，保留缩进并添加字体处理
    const processedLines = lines.map(line => {
        // 获取行首缩进
        const indentMatch = line.match(/^(\s+)/);
        if (indentMatch) {
            const indentSpaces = indentMatch[1];
            // 将空格转换为&nbsp;以保留HTML中的缩进
            const preservedIndent = '&nbsp;'.repeat(indentSpaces.length);
            // 替换行首空格，保留其余内容，并包装英文字符
            const content = line.substring(indentSpaces.length);
            return preservedIndent + wrapLatinChars(content);
        }
        // 对于没有缩进的行，应用字体包装
        return wrapLatinChars(line);
    });
    
    // 使用<br>连接各行，保留换行
    return processedLines.join('<br>');
}

/**
 * 保留代码缩进和格式
 * @param {string} code - 代码文本
 * @returns {string} 处理后的代码文本
 */
function preserveIndentation(code) {
    if (!code) return '';
    
    // 严格保留所有缩进和换行
    return code.split('\n').map(line => {
        // 获取行首的所有空格
        const indentMatch = line.match(/^(\s*)/);
        if (indentMatch) {
            const indentSpaces = indentMatch[1];
            // 将每个空格转换为&nbsp;，确保HTML中的缩进被严格保留
            const preservedIndent = '&nbsp;'.repeat(indentSpaces.length);
            // 替换行首空格，但保留其余内容
            return preservedIndent + line.substring(indentSpaces.length);
        }
        return line;
    }).join('<br>'); // 使用<br>标签确保在HTML中正确换行
}

/**
 * 处理行内代码片段 - 现在只保留文本，不添加代码样式
 * @param {string} text - 文本行
 * @returns {string} 处理后的文本
 */
function formatInlineCode(text) {
    if (!text || typeof text !== 'string') return text;
    
    // 如果文本已包含HTML标签，进行清理
    if (text.includes('<code') && text.includes('</code>')) {
        // 移除所有code标签，保留内容
        return text.replace(/<code[^>]*>(.*?)<\/code>/g, '$1');
    }
    
    // 直接返回原始文本，不添加任何代码样式
    return text;
}

/**
 * 修正被误识别为代码的文本
 * @param {string} text - 包含HTML标签的文本
 * @returns {string} 修正后的文本
 */
function correctMisidentifiedCode(text) {
    // 如果文本中没有代码标签，直接返回
    if (!text.includes('<code>') || !text.includes('</code>')) {
        return text;
    }
    
    // 如果文本中不包含中文，可能是正确的代码标记，不需要修正
    if (!/[\u4e00-\u9fa5]/.test(text)) {
        return text;
    }

    // 完全重写的解析逻辑
    // 1. 识别并保留多行代码块的格式
    const preBlockRegex = /<pre(?:\s+class="[^"]*")?><code>([\s\S]*?)<\/code><\/pre>/g;
    let preBlocks = [];
    let preIndex = 0;
    let plainText = text.replace(preBlockRegex, (match, codeContent) => {
        const placeholder = `__PRE_BLOCK_${preIndex}__`;
        preBlocks.push({
            placeholder,
            content: codeContent
        });
        preIndex++;
        return placeholder;
    });
    
    // 2. 移除所有现有的内联代码标签
    plainText = plainText.replace(/<code>(.*?)<\/code>/gs, '$1');
    
    // 3. 使用我们的精确识别重新找出所有代码片段
    const fragments = identifyCodeFragments(plainText);
    
    // 4. 从后向前重新应用代码标记
    let result = plainText;
    for (let i = fragments.length - 1; i >= 0; i--) {
        const fragment = fragments[i];
        const codeText = fragment.text;
        const prefix = result.substring(0, fragment.start);
        const suffix = result.substring(fragment.end);
        
        // 确保片段本身不包含中文（除了单个关键字）
        if (!/[\u4e00-\u9fa5]/.test(codeText) || 
            /^(True|False|None)$/.test(codeText.trim())) {
            result = prefix + `<code>${codeText}</code>` + suffix;
        }
    }
    
    // 5. 恢复预先保存的多行代码块
    for (const block of preBlocks) {
        // 使用preserveIndentation函数保留缩进
        result = result.replace(
            block.placeholder, 
            `<pre class="code-block"><code>${preserveIndentation(block.content)}</code></pre>`
        );
    }
    
    return result;
}

/**
 * 格式化选项文本，只保留原始换行和缩进，移除Markdown标记
 * @param {string} option - 选项文本
 * @returns {string} 格式化后的选项
 */
function formatOptionText(option) {
    // 如果选项为空或不是字符串，直接返回
    if (!option || typeof option !== 'string') return option;
    
    // 特别处理Markdown风格的代码块
    if (option.startsWith('```python')) {
        // 移除```python标记和可能的最后的```标记
        let codeContent = option.substring('```python'.length);
        const endMarkIndex = codeContent.lastIndexOf('```');
        if (endMarkIndex !== -1) {
            codeContent = codeContent.substring(0, endMarkIndex);
        }
        
        // 分割成多行处理，保留缩进
        return codeContent.trim().split('\n').map(line => {
            // 检测缩进
            const indentMatch = line.match(/^(\s+)/);
            if (indentMatch) {
                const indentSpaces = indentMatch[1];
                const preservedIndent = '&nbsp;'.repeat(indentSpaces.length);
                return preservedIndent + line.substring(indentSpaces.length);
            }
            return line;
        }).join('<br>');
    }
    
    // 处理普通包含换行的选项
    if (option.includes('\n')) {
        return option.split('\n').map(line => {
            // 检测缩进
            const indentMatch = line.match(/^(\s+)/);
            if (indentMatch) {
                const indentSpaces = indentMatch[1];
                const preservedIndent = '&nbsp;'.repeat(indentSpaces.length);
                return preservedIndent + line.substring(indentSpaces.length);
            }
            return line;
        }).join('<br>');
    }
    
    // 普通单行选项
    return option;
}

/**
 * 格式化整个问题对象
 * @param {Object} question - 问题对象
 * @returns {Object} 格式化后的问题对象
 */
function formatQuestion(question) {
    if (!question) return question;
    
    // 复制问题对象
    const formattedQuestion = {...question};
    
    // 格式化题干
    formattedQuestion.question = formatQuestionText(question.question);
    
    // 格式化选项
    if (Array.isArray(question.options)) {
        formattedQuestion.options = question.options.map(option => formatOptionText(option));
        
        // 如果有4个选项，并且至少有一个选项是代码块，添加田字布局标记
        if (formattedQuestion.options.length === 4 && 
            formattedQuestion.options.some(option => option.includes('ide-code-block'))) {
            formattedQuestion.useGridLayout = true;
        }
    }
    
    // 格式化解析
    if (question.explanation) {
        formattedQuestion.explanation = formatQuestionText(question.explanation);
    }
    
    return formattedQuestion;
}

/**
 * 识别多行代码块
 * @param {string} text - 要分析的文本
 * @returns {Array} 包含代码块位置信息的数组
 */
function identifyCodeBlocks(text) {
    if (!text || typeof text !== 'string') return [];
    
    const lines = text.split('\n');
    let codeBlocks = [];
    let currentBlock = null;
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 检测是否为代码行
        const isCodeLine = containsCode(line) && !(/[\u4e00-\u9fa5]/.test(line));
        
        if (isCodeLine) {
            if (!currentBlock) {
                // 开始新的代码块
                currentBlock = {
                    start: i,
                    lines: [line],
                    indentation: getIndentation(line)
                };
            } else {
                // 继续当前代码块
                currentBlock.lines.push(line);
                // 更新缩进信息
                const indent = getIndentation(line);
                if (indent.length > 0) {
                    currentBlock.indentation = currentBlock.indentation || indent;
                }
            }
        } else if (currentBlock) {
            // 结束当前代码块
            currentBlock.end = i - 1;
            currentBlock.content = currentBlock.lines.join('\n');
            codeBlocks.push(currentBlock);
            currentBlock = null;
        }
    }
    
    // 处理最后一个代码块
    if (currentBlock) {
        currentBlock.end = lines.length - 1;
        currentBlock.content = currentBlock.lines.join('\n');
        codeBlocks.push(currentBlock);
    }
    
    return codeBlocks;
}

/**
 * 获取行缩进
 * @param {string} line - 文本行
 * @returns {string} 缩进字符串
 */
function getIndentation(line) {
    const match = line.match(/^(\s+)/);
    return match ? match[1] : '';
}

/**
 * 检查是否是纯代码行
 * @param {string} line - 一行文本
 * @returns {boolean} 是否是纯代码行
 */
function isPureCodeLine(line) {
    return ((/^[\s]*[a-zA-Z0-9_]+\s*\(.*\)[\s]*$/.test(line)) || 
            (/^[\s]*[a-zA-Z0-9_]+\s*=\s*.*[\s]*$/.test(line)) ||
            (/^[\s]*for\s+[a-zA-Z_][a-zA-Z0-9_]*\s+in\s+.*:[\s]*$/.test(line)) ||
            (/^[\s]*for\s+[a-zA-Z_][a-zA-Z0-9_]*\s+from\s+\d+\s+to\s+\d+[\s]*$/.test(line)) ||
            (/^[\s]*for\s+[a-zA-Z_][a-zA-Z0-9_]*\s+(at|==|=).*$/.test(line)) ||
            (/^[\s]*while\s+.*:[\s]*$/.test(line)) ||
            (/^[\s]*if\s+.*:[\s]*$/.test(line)));
}

/**
 * 检查文本是否包含中文字符
 * @param {string} text - 要检查的文本
 * @returns {boolean} 是否包含中文字符
 */
function containsChinese(text) {
    return /[\u4e00-\u9fa5]/.test(text);
}

/**
 * 识别并格式化代码块
 * 代码块的特征:
 * 1. 包含换行符(\n)
 * 2. 有缩进(通常是空格)
 * 3. 可能以```python等标记开始
 * 4. 可能包含典型编程结构(for/if/while等加缩进)
 * 5. 连续出现的turtle命令也视为一个块
 * @param {string} text - 要处理的文本
 * @returns {string} 格式化后的文本
 */
function formatTextWithCodeBlocks(text) {
    if (!text) return '';
    
    // 如果文本已经包含代码块标签，直接返回
    if (text.includes('<pre class="code-block">')) {
        return text;
    }
    
    // 处理显式标记的代码块 (```python 这种风格)
    if (text.includes('```')) {
        return processMarkdownCodeBlocks(text);
    }
    
    // 特殊情况：检测是否连续包含多个turtle命令（如forward, left, right等）
    const turtleCommandRegex = /(forward|backward|left|right|goto|setheading|circle|penup|pendown|speed|dot|color|begin_fill|end_fill|hideturtle|showturtle)\s*\([^)]*\)/gi;
    const matches = [...text.matchAll(turtleCommandRegex)];
    
    // 如果找到至少两个turtle命令，且它们中间没有太多其他文本
    if (matches.length >= 2) {
        // 验证命令是否足够接近 - 获取所有匹配的索引位置
        const positions = matches.map(match => match.index);
        let closeEnough = true;
        
        // 检查是否相邻命令间存在大量非命令文本
        for (let i = 1; i < positions.length; i++) {
            const prevMatchEnd = positions[i-1] + matches[i-1][0].length;
            const currentMatchStart = positions[i];
            const textBetween = text.substring(prevMatchEnd, currentMatchStart).trim();
            
            // 更严格的规则：只要两个代码片段之间有任何非空白字符，都不视为整体代码块
            // 这包括所有汉字、箭头、标点符号等
            if (textBetween.length > 0 && !/^[\s]*$/.test(textBetween)) {
                closeEnough = false;
                break;
            }
        }
        
        // 如果命令足够接近，将它们作为一个代码块处理
        if (closeEnough) {
            // 找到第一个命令的开始和最后一个命令的结束
            const startPos = positions[0];
            const lastMatch = matches[matches.length - 1];
            const endPos = lastMatch.index + lastMatch[0].length;
            
            // 提取代码块内容
            const blockContent = text.substring(startPos, endPos);
            
            // 分割代码行（通过换行符或逗号）
            let codeLines = blockContent.split(/[\n,]+/);
            codeLines = codeLines.map(line => line.trim()).filter(line => line);
            
            // 如果没有换行，手动创建换行的代码块
            const formattedCode = codeLines.join('\n');
            
            // 应用IDE样式
            const styledBlock = createIDEStyledCodeBlock(formattedCode, 'python');
            
            // 替换原始文本中的这部分内容
            const prefix = text.substring(0, startPos);
            const suffix = text.substring(endPos);
            
            // 处理前缀和后缀部分
            const formattedPrefix = prefix ? formatInlineCode(prefix) : '';
            const formattedSuffix = suffix ? formatInlineCode(suffix) : '';
            
            return (formattedPrefix ? formattedPrefix + '<br>' : '') + 
                   styledBlock + 
                   (formattedSuffix ? '<br>' + formattedSuffix : '');
        }
    }
    
    // 如果没有被上面的逻辑处理，继续原有的识别流程
    const lines = text.split('\n');
    const result = [];
    let inCodeBlock = false;
    let codeBlock = [];
    let codeBlockStart = -1;
    
    // 检测隐式代码块 - 基于缩进和结构特征
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trimRight(); // 移除行末空格但保留前导空格
        const trimmedLine = line.trim();
        
        // 检测代码块的开始特征
        const isPotentialCodeStart = 
            (trimmedLine.endsWith(':') && (
                trimmedLine.startsWith('for ') || 
                trimmedLine.startsWith('if ') || 
                trimmedLine.startsWith('while ') || 
                trimmedLine.startsWith('def ') || 
                trimmedLine.startsWith('class ')
            )) || 
            trimmedLine.match(/^import\s+[a-zA-Z_][a-zA-Z0-9_]*/) ||
            (line !== trimmedLine && isPureCodeLine(trimmedLine)) || // 有缩进且是纯代码
            trimmedLine.match(turtleCommandRegex); // 增加匹配turtle命令
        
        // 检测是否是缩进行
        const isIndented = line.startsWith('    ') || line.startsWith('\t');
        
        // 缩进相关的代码块的开始和结束条件
        if (!inCodeBlock && isPotentialCodeStart) {
            inCodeBlock = true;
            codeBlockStart = i;
            codeBlock = [line];
        } else if (inCodeBlock && (isIndented || trimmedLine === '' || isPureCodeLine(trimmedLine) || trimmedLine.match(turtleCommandRegex))) {
            // 继续收集代码块内容
            codeBlock.push(line);
        } else if (inCodeBlock) {
            // 代码块结束
            inCodeBlock = false;
            if (codeBlock.length > 1 || codeBlock[0].includes(':') || codeBlock[0].match(turtleCommandRegex)) { // 至少包含2行或有明确语法标记或是turtle命令
                result.push(createIDEStyledCodeBlock(codeBlock.join('\n'), 'python'));
            } else {
                // 不是真正的代码块，作为普通文本处理
                for (let j = codeBlockStart; j < i; j++) {
                    result.push(formatInlineCode(lines[j]));
                }
            }
            result.push(formatInlineCode(line)); // 处理当前行
            codeBlock = [];
        } else {
            // 非代码块内的普通行
            result.push(formatInlineCode(line));
        }
    }
    
    // 处理最后可能未结束的代码块
    if (inCodeBlock && codeBlock.length > 0) {
        if (codeBlock.length > 1 || codeBlock[0].includes(':') || codeBlock[0].match(turtleCommandRegex)) {
            result.push(createIDEStyledCodeBlock(codeBlock.join('\n'), 'python'));
        } else {
            for (const line of codeBlock) {
                result.push(formatInlineCode(line));
            }
        }
    }
    
    return result.join('<br>');
}

/**
 * 处理Markdown风格的代码块 (```python ... ```)
 * @param {string} text - 包含Markdown代码块的文本
 * @returns {string} 处理后的文本
 */
function processMarkdownCodeBlocks(text) {
    const lines = text.split('\n');
    const result = [];
    let inCodeBlock = false;
    let codeBlock = [];
    let language = '';
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        if (trimmedLine.startsWith('```')) {
            if (!inCodeBlock) {
                // 代码块开始
                inCodeBlock = true;
                // 尝试提取语言
                language = trimmedLine.substring(3).trim();
                continue;
            } else {
                // 代码块结束
                inCodeBlock = false;
                result.push(createIDEStyledCodeBlock(codeBlock.join('\n'), language));
                codeBlock = [];
                continue;
            }
        }
        
        if (inCodeBlock) {
            codeBlock.push(line);
        } else {
            result.push(formatInlineCode(line));
        }
    }
    
    // 处理未闭合的代码块
    if (inCodeBlock && codeBlock.length > 0) {
        result.push(createIDEStyledCodeBlock(codeBlock.join('\n'), language));
    }
    
    return result.join('<br>');
}

/**
 * 创建IDE风格的代码块
 * @param {string} code - 代码内容 
 * @param {string} language - 编程语言
 * @returns {string} IDE风格的HTML代码块
 */
function createIDEStyledCodeBlock(code, language = '') {
    const languageClass = language ? ` language-${language}` : '';
    const lines = code.split('\n');
    let lineNumbersHtml = '';
    let codeHtml = '';
    
    // 生成行号
    for (let i = 1; i <= lines.length; i++) {
        lineNumbersHtml += `<span class="line-number">${i}</span>`;
    }
    
    // 处理代码内容，保留缩进
    codeHtml = preserveIndentation(code);
    
    // 创建IDE风格的代码块
    return `
<div class="ide-code-block">
  <div class="ide-header">
    <div class="ide-buttons">
      <span class="ide-button red"></span>
      <span class="ide-button yellow"></span>
      <span class="ide-button green"></span>
    </div>
    <div class="ide-title">${language || 'code'}</div>
  </div>
  <div class="ide-body">
    <div class="line-numbers">${lineNumbersHtml}</div>
    <pre class="code-content${languageClass}"><code>${codeHtml}</code></pre>
  </div>
</div>`;
}

/**
 * 添加IDE风格的CSS
 */
function addIDEStyles() {
    // 检查是否已添加样式
    if (document.getElementById('ide-code-styles')) {
        return;
    }
    
    const styleElement = document.createElement('style');
    styleElement.id = 'ide-code-styles';
    styleElement.textContent = `
    .ide-code-block {
        margin: 15px 0;
        border-radius: 8px;
        overflow: hidden;
        background: #1e1e2e;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
    }
    
    .ide-header {
        display: flex;
        align-items: center;
        padding: 8px 12px;
        background: #2b2b40;
        border-bottom: 1px solid #3a3a5a;
    }
    
    .ide-buttons {
        display: flex;
        gap: 6px;
        margin-right: 12px;
    }
    
    .ide-button {
        width: 12px;
        height: 12px;
        border-radius: 50%;
    }
    
    .ide-button.red { background: #ff5f57; }
    .ide-button.yellow { background: #febc2e; }
    .ide-button.green { background: #28c941; }
    
    .ide-title {
        font-size: 12px;
        color: #aaa;
    }
    
    .ide-body {
        display: flex;
        position: relative;
    }
    
    .line-numbers {
        display: flex;
        flex-direction: column;
        padding: 8px 0;
        background: #252538;
        text-align: right;
        user-select: none;
    }
    
    .line-number {
        color: #6a6a8e;
        font-size: 14px;
        line-height: 1.5;
        padding: 0 8px;
    }
    
    .code-content {
        flex: 1;
        margin: 0;
        padding: 8px 0 8px 12px;
        overflow-x: auto;
        white-space: pre;
        background: transparent;
        color: #f8f8f2;
    }
    
    .code-content code {
        white-space: pre;
        word-break: normal;
        word-wrap: normal;
        tab-size: 4;
        display: block;
        font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
        color: #f8f8f2;
        font-size: 14px;
        line-height: 1.5;
    }
    
    /* 语法高亮颜色 */
    .language-python .keyword { color: #ff79c6; }
    .language-python .string { color: #f1fa8c; }
    .language-python .function { color: #50fa7b; }
    .language-python .comment { color: #6272a4; }
    .language-python .number { color: #bd93f9; }
    
    /* 选项田字布局样式 */
    .options-grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-gap: 15px;
        margin: 20px 0;
    }
    
    .options-grid .option-item {
        position: relative;
        padding: 15px 20px 15px 64px;
        cursor: pointer;
        background-color: rgba(50, 50, 55, 0.5) !important;
        backdrop-filter: blur(5px);
        border: 1px solid var(--border-color);
        border-radius: 12px;
        transition: transform 0.2s, box-shadow 0.2s;
        color: white;
        display: flex;
        align-items: center;
    }
    
    .options-grid .option-item:hover {
        background-color: rgba(60, 60, 65, 0.6) !important;
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
    }
    
    .options-grid .option-item.selected {
        background-color: rgba(28, 179, 107, 0.3) !important;
        border-color: #1cb36b;
    }
    
    .options-grid .option-item.correct {
        background-color: rgba(28, 179, 107, 0.3) !important;
        border-color: #1cb36b;
    }
    
    .options-grid .option-item.incorrect {
        background-color: rgba(237, 67, 55, 0.3) !important;
        border-color: #ed4337;
    }
    
    .options-grid .option-label {
        position: absolute;
        top: 50%;
        left: 20px;
        transform: translateY(-50%);
        width: 30px;
        height: 30px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);
        color: white;
        font-weight: bold;
    }
    
    .options-grid .option-content {
        width: 100%;
    }
    
    .options-grid .ide-code-block {
        margin: 0;
    }
    
    /* 确保选中与鼠标悬停状态一致 */
    .options-grid .option-item.selected:before,
    .options-grid .option-item.correct:before {
        content: '✓';
        position: absolute;
        left: 25px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: #1cb36b;
        z-index: 1;
    }
    
    .options-grid .option-item.incorrect:before {
        content: '✗';
        position: absolute;
        left: 25px;
        top: 50%;
        transform: translateY(-50%);
        font-size: 18px;
        color: #ed4337;
        z-index: 1;
    }
    `;
    
    document.head.appendChild(styleElement);
}

/**
 * 初始化代码格式化功能
 */
function initCodeFormatter() {
    addIDEStyles();
}

// 在window加载后初始化
if (typeof window !== 'undefined') {
    if (document.readyState === 'complete') {
        initCodeFormatter();
    } else {
        window.addEventListener('load', initCodeFormatter);
    }
}

// 导出函数供其他模块使用
window.CodeFormatter = {
    formatQuestion,
    formatQuestionText,
    formatOptionText,
    containsCode,
    determineCodeType,
    preserveIndentation
};

/**
 * 逆向识别逻辑：默认所有内容都是代码，除非满足特定条件
 * @param {string} text - 要处理的文本
 * @returns {string} 格式化后的文本
 */
function formatTextWithDefaultCode(text) {
    if (!text || typeof text !== 'string') return '';
    
    // 如果已经是代码块格式，保持不变
    if (text.includes('<pre class="code-block">') || text.includes('<code>')) {
        return text;
    }
    
    // 处理换行符包含的文本
    if (text.includes('\n')) {
        // 先检查是否以\n\n开头
        if (text.startsWith('\n\n')) {
            const codeBlock = text.substring(2).trim();
            return createIDEStyledCodeBlock(codeBlock, 'python');
        }
        
        // 检查是否明显是多行代码块（多行含有相似结构）
        const lines = text.split('\n');
        const hasConsistentCodeStructure = lines.length > 1 && 
            lines.filter(line => isPureCodeLine(line)).length > Math.floor(lines.length / 2);
        
        if (hasConsistentCodeStructure) {
            return createIDEStyledCodeBlock(text, 'python');
        }
        
        // 处理每一行文本
        return lines.map(line => formatLineWithDefaultCode(line)).join('<br>');
    }
    
    // 处理单行文本
    return formatLineWithDefaultCode(text);
}

/**
 * 处理单行文本，默认视为代码，除非符合排除条件
 * @param {string} line - 要处理的行
 * @returns {string} 格式化后的行
 */
function formatLineWithDefaultCode(line) {
    if (!line.trim()) return line; // 空行直接返回
    
    // 检查是否为明确的中文内容（两个或更多中文字符连续出现）
    if (/[\u4e00-\u9fa5]{2,}/.test(line)) {
        // 对于中文内容，处理其中可能的代码片段
        return formatChineseTextWithCodeFragments(line);
    }
    
    // 检查是否为独立英文单词、数字、运算符等
    const exclusionRegex = /^[\s]*([a-zA-Z]+|[0-9]+|[\+\-\*\/\=\<\>\!]+)[\s]*$/;
    if (exclusionRegex.test(line)) {
        return line; // 单独的英文单词、数字或运算符不视为代码
    }
    
    // 排除特定标点符号和短语的组合
    if (/^[\s]*[,.;:!?，。；：！？、]+[\s]*$/.test(line)) {
        return line; // 单独的标点符号不视为代码
    }
    
    // 检查是否为合法的Python代码行（更严格的检查）
    if (isPotentialPythonCode(line)) {
        return `<code style="white-space:pre;">${line}</code>`;
    }
    
    // 默认行为：
    // 1. 如果行既包含代码特征又包含明显的非代码内容，进行分段处理
    if (containsCode(line) && /[\u4e00-\u9fa5]/.test(line)) {
        return formatChineseTextWithCodeFragments(line);
    }
    
    // 2. 否则，将整行视为代码
    return `<code style="white-space:pre;">${line}</code>`;
}

/**
 * 检查文本是否可能是合法的Python代码
 * @param {string} text - 要检查的文本
 * @returns {boolean} 是否可能是Python代码
 */
function isPotentialPythonCode(text) {
    // Python代码特征的正则表达式
    const pythonPatterns = [
        /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\)[\s]*$/,  // 函数调用
        /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*=\s*.+$/,       // 变量赋值
        /^[\s]*for\s+.+:/,                             // for循环
        /^[\s]*while\s+.+:/,                           // while循环
        /^[\s]*if\s+.+:/,                              // if语句
        /^[\s]*elif\s+.+:/,                            // elif语句
        /^[\s]*else\s*:/,                              // else语句
        /^[\s]*def\s+[a-zA-Z_][a-zA-Z0-9_]*\s*\(.*\):/,// 函数定义
        /^[\s]*class\s+[a-zA-Z_][a-zA-Z0-9_]*.*:/,     // 类定义
        /^[\s]*import\s+.+$/,                          // import语句
        /^[\s]*from\s+.+\s+import\s+.+$/,              // from import语句
        /^[\s]*#.+$/,                                  // 注释
        /^[\s]*""".*"""[\s]*$/,                        // 文档字符串
        /^[\s]*print\s*\(.+\)[\s]*$/,                  // print语句
        /^[\s]*return\s+.+$/,                          // return语句
        /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*\+=/,          // 复合赋值
        /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*\-=/,
        /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*\*=/,
        /^[\s]*[a-zA-Z_][a-zA-Z0-9_]*\s*\/=/,
        /^[\s]*try\s*:/,                               // try语句
        /^[\s]*except.*:/,                             // except语句
        /^[\s]*finally\s*:/,                           // finally语句
        /^[\s]*with\s+.+\s+as\s+.+:/                   // with语句
    ];
    
    return pythonPatterns.some(pattern => pattern.test(text));
}

/**
 * 处理包含中文和代码片段的混合文本
 * @param {string} text - 包含中文和代码的文本
 * @returns {string} 处理后的文本
 */
function formatChineseTextWithCodeFragments(text) {
    // 识别所有可能的代码片段
    const fragments = identifyCodeFragments(text);
    
    if (fragments.length === 0) {
        return text; // 如果没有识别出代码片段，返回原文本
    }
    
    // 从后向前替换，避免位置偏移
    let result = text;
    for (let i = fragments.length - 1; i >= 0; i--) {
        const fragment = fragments[i];
        const codeText = fragment.text;
        const prefix = result.substring(0, fragment.start);
        const suffix = result.substring(fragment.end);
        
        // 确保片段本身不包含中文（除了单个关键字如True/False/None）
        if (!/[\u4e00-\u9fa5]/.test(codeText) || 
            /^(True|False|None)$/.test(codeText.trim())) {
            result = prefix + `<code style="white-space:pre;">${codeText}</code>` + suffix;
        }
    }
    
    return result;
}
