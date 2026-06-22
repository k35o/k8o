// 取得不能な記事（paywall・JS のみで本文が無い・恒久エラー等）を無限に再生成し続けて
// 「生成中…」のまま決着しないのを防ぐための失敗上限。この回数失敗した記事は以降は
// 生成を試みず、元記事の説明文のまま確定表示する。
// 生成側（summarize-article）と読み取り側（reading-list）の双方が同じ値を参照する。
export const MAX_SUMMARY_ATTEMPTS = 3;
