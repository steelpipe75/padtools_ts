import {
  IllegalIndentException,
  parse,
  RequireArgumentException,
  UnknownCommandException,
} from "../../../src/spd/parser";

describe("SPDParser - Exception Handling", () => {
  it("引数なしのcallコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = ":call";
    expect(() => parse(spd)).toThrow(RequireArgumentException);
  });

  it("最初の行がインデントされている場合にIllegalIndentExceptionをスローすること", () => {
    const spd = `\tProcess A`;
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });

  it("最初の行がコメントで、次の行がインデントされている場合にIllegalIndentExceptionをスローすること", () => {
    const spd = `# Comment
	Process A`;
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });

  it("コメントの後にインデントが1レベル増加した場合にIllegalIndentExceptionをスローすること", () => {
    const spd = `:comment A\n\tprocess B`;
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });

  it("複数レベルのインデントに対してIllegalIndentExceptionをスローすること", () => {
    const spd = `Process
		Process B`;
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });

  it("コメント下の複数レベルのインデントに対してIllegalIndentExceptionをスローすること", () => {
    const spd = `:comment some comment
		Process A`;
    expect(() => parse(spd)).toThrow(IllegalIndentException);
  });

  it("未知のコマンドに対してUnknownCommandExceptionをスローすること", () => {
    const spd = `:unknowncommand`;
    expect(() => parse(spd)).toThrow(UnknownCommandException);
  });

  it("引数なしのterminalコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:terminal`;
    expect(() => parse(spd)).toThrow(RequireArgumentException);
  });

  it("引数なしのcommentコマンドに対してRequireArgumentExceptionをスローすること", () => {
    const spd = `:comment`;
    expect(() => parse(spd)).toThrow(RequireArgumentException);
  });

  // it("予期しない内部エラーをキャッチしてParseErrorとして再スローすること", () => {
  // 	const spd = `A`;
  // 	const consoleSpy = jest
  // 		.spyOn(console, "error")
  // 		.mockImplementation(() => {});
  //
  // 	// handleBody内で予期しないエラーを発生させる
  // 	const handleBodySpy = jest
  // 		.spyOn(SPDParser as any, "handleBody")
  // 		.mockImplementation(() => {
  // 			throw new Error("予期しないテストエラー");
  // 		});
  //
  // 	// カスタムエラーでラップされていることを確認
  // 	expect(() => parse(spd)).toThrow(ParseError);
  // 	expect(() => parse(spd)).toThrow(
  // 		"予期しないエラー: Error: 予期しないテストエラー",
  // 	);
  //
  // 	expect(consoleSpy).toHaveBeenCalled();
  //
  // 	// モックをクリーンアップ
  // 	handleBodySpy.mockRestore();
  // 	consoleSpy.mockRestore();
  // });
  //
  // it("should handle and re-throw non-Error, non-ParseError exceptions", () => {
  // 	const spd = "some input";
  // 	const errorObject = "just a string error";
  //
  // 	// Mock handleBody to throw a string
  // 	const handleBodySpy = jest
  // 		.spyOn(SPDParser as any, "handleBody")
  // 		.mockImplementation(() => {
  // 			throw errorObject;
  // 		});
  //
  // 	// Expect SPDParser.parse to throw a ParseError wrapping the string
  // 	expect(() => parse(spd)).toThrow(ParseError);
  // 	expect(() => parse(spd)).toThrow(
  // 		`予期しないエラー: ${errorObject}`,
  // 	);
  //
  // 	// Restore mock
  // 	handleBodySpy.mockRestore();
  // });
});
