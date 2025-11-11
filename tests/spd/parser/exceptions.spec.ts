import {
  CaseDuplicateException,
  IllegalIndentException,
  NotRequireArgumentException,
  ParseError,
  RequireArgumentException,
  SPDParser,
  UnexpectedCaseException,
  UnexpectedElseException,
  UnknownCommandException,
} from "../../../src/spd/parser";
import { NodeListNode } from "../../../src/spd/ast";

describe("SPDParser - Exception Handling", () => {
  it("引数なしのcallコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = ":call";
    expect(() => SPDParser.parse(spd)).toThrow(RequireArgumentException);
  });

  it("最初の行がインデントされている場合にIllegalIndentExceptionをスローすること", () => {
    const spd = `\tProcess A`;
    expect(() => SPDParser.parse(spd)).toThrow(IllegalIndentException);
  });

  it("最初の行がコメントで、次の行がインデントされている場合にIllegalIndentExceptionをスローすること", () => {
    const spd = `# Comment
	Process A`;
    expect(() => SPDParser.parse(spd)).toThrow(IllegalIndentException);
  });

  it("コメントの後にインデントが1レベル増加した場合にIllegalIndentExceptionをスローすること", () => {
    const spd = `:comment A\n\tprocess B`;
    expect(() => SPDParser.parse(spd)).toThrow(IllegalIndentException);
  });

  it("複数レベルのインデントに対してIllegalIndentExceptionをスローすること", () => {
    const spd = `Process
		Process B`;
    expect(() => SPDParser.parse(spd)).toThrow(IllegalIndentException);
  });

  it("コメント下の複数レベルのインデントに対してIllegalIndentExceptionをスローすること", () => {
    const spd = `:comment some comment
		Process A`;
    expect(() => SPDParser.parse(spd)).toThrow(IllegalIndentException);
  });

  it("未知のコマンドに対してUnknownCommandExceptionをスローすること", () => {
    const spd = `:unknowncommand`;
    expect(() => SPDParser.parse(spd)).toThrow(UnknownCommandException);
  });

  it("引数なしのterminalコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:terminal`;
    expect(() => SPDParser.parse(spd)).toThrow(RequireArgumentException);
  });

  it("引数なしのcommentコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:comment`;
    expect(() => SPDParser.parse(spd)).toThrow(RequireArgumentException);
  });

  it("予期しない内部エラーをキャッチしてParseErrorとして再スローすること", () => {
    const spd = `A`;
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    
    // handleBody内で予期しないエラーを発生させる
    const handleBodySpy = jest.spyOn(SPDParser as any, "handleBody").mockImplementation(() => {
      throw new Error("予期しないテストエラー");
    });

    // カスタムエラーでラップされていることを確認
    expect(() => SPDParser.parse(spd)).toThrow(ParseError);
    expect(() => SPDParser.parse(spd)).toThrow("予期しないエラー: Error: 予期しないテストエラー");
    
    expect(consoleSpy).toHaveBeenCalled();

    // モックをクリーンアップ
    handleBodySpy.mockRestore();
    consoleSpy.mockRestore();
  });
});
