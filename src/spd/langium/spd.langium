grammar Spd

entry Model:
    (statements+=Statement)*;

Statement:
    CommandStatement | ProcessStatement;

CommandStatement:
    IfStatement | WhileStatement | DoWhileStatement | CallStatement | SwitchStatement | CaseStatement | ElseStatement | TerminalStatement | CommentStatement;

Block:
    INDENT (statements+=Statement)+ DEDENT;

IfStatement: ':if' (arg=Argument)? (block=Block)?;
WhileStatement: ':while' (arg=Argument)? (block=Block)?;
DoWhileStatement: ':dowhile' (arg=Argument)? (block=Block)?;
CallStatement: ':call' (arg=Argument)? (block=Block)?;
SwitchStatement: ':switch' (arg=Argument)? (block=Block)?;
CaseStatement: ':case' (arg=Argument)? (block=Block)?;
ElseStatement: ':else' (block=Block)?;
TerminalStatement: ':terminal' (arg=Argument)? (block=Block)?;
CommentStatement: ':comment' (arg=Argument)? (block=Block)?;

ProcessStatement:
    (content=Content) (block=Block)?;

Argument returns string:
    Content;

terminal INDENT: 'synthetic:indent';
terminal DEDENT: 'synthetic:dedent';

hidden terminal LINE_COMMENT: /#[^\n\r]*/;
terminal Content: /[^\t:\n\r](?:[^\n\r]*(?<!\\)@[ \t]*\r?\n[ \t]*|#[^\n\r]*\r?\n[ \t]*)*[^\n\r]*/;

hidden terminal WS: /[ \t]+/;
hidden terminal NEWLINE: /\r?\n/;
