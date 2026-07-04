grammar Spd

entry Statement:
    CommandStatement | ProcessStatement;

CommandStatement:
    IfStatement | WhileStatement | DoWhileStatement | CallStatement | SwitchStatement | CaseStatement | ElseStatement | TerminalStatement | CommentStatement;

IfStatement: ':if' (arg=Argument)?;
WhileStatement: ':while' (arg=Argument)?;
DoWhileStatement: ':dowhile' (arg=Argument)?;
CallStatement: ':call' (arg=Argument)?;
SwitchStatement: ':switch' (arg=Argument)?;
CaseStatement: ':case' (arg=Argument)?;
ElseStatement: ':else' (arg=Argument)?;
TerminalStatement: ':terminal' (arg=Argument)?;
CommentStatement: ':comment' (arg=Argument)?;

ProcessStatement:
    (content=Content)?;

Argument returns string:
    Content;

terminal Content: /[^:][\s\S]*/;

hidden terminal NEWLINE: /\r?\n/;
