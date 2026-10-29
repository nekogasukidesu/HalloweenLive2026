// そらるの星詠みタロット — カードデータ
// 大アルカナ22枚。up = 正位置, rev = 逆位置。
// yn: "YES" | "NO" | "MAYBE"（はっきり言いにくいカード → 画面では「?」） 
// 文言はここを書き換えるだけで差し替えできます。

window.TAROT_CARDS = [
  {
    id: 0, num: "0", en: "THE FOOL", ja: "愚者",
    up:  { key: "はじまり",   yn: "YES",  msg: "深く考えなくても、なんとかなる日。軽い気持ちで踏み出すほど、運は味方する。" },
    rev: { key: "無鉄砲",     yn: "NO",   msg: "勢いだけで動くと転びやすい日。足元を確かめて進めば、運はちゃんと味方する。" }
  },
  {
    id: 1, num: "I", en: "THE MAGICIAN", ja: "魔術師",
    up:  { key: "創造",       yn: "YES",  msg: "今日はいける日。やりたかったことが、ちゃんと形になる流れがきてる。" },
    rev: { key: "空回り",     yn: "NO",   msg: "うまく見せようとすると空回りしやすい日。そのままで十分伝わる。" }
  },
  {
    id: 2, num: "II", en: "THE HIGH PRIESTESS", ja: "女教皇",
    up:  { key: "直感",       yn: "MAYBE", msg: "答えはもう自分の中にある日。ちゃんと気づける。" },
    rev: { key: "迷い",       yn: "NO",   msg: "考えすぎになりやすい日。いったん休むと、答えのほうから近づいてくる。" }
  },
  {
    id: 3, num: "III", en: "THE EMPRESS", ja: "女帝",
    up:  { key: "豊かさ",     yn: "YES",  msg: "今日は自分を甘やかしていい日。おいしいものを食べるほど、運気が上がる。" },
    rev: { key: "余裕のなさ", yn: "MAYBE", msg: "自分のことが後回しになりやすい日。休むのも大事な用事。" }
  },
  {
    id: 4, num: "IV", en: "THE EMPEROR", ja: "皇帝",
    up:  { key: "安定",       yn: "YES",  msg: "腰を据えて取り組むと、ちゃんと結果が出る日。" },
    rev: { key: "頑固",       yn: "NO",   msg: "意地を張りやすい日。譲れるところを譲ると、道が一気にラクになる。" }
  },
  {
    id: 5, num: "V", en: "THE HIEROPHANT", ja: "教皇",
    up:  { key: "信頼",       yn: "YES",  msg: "迷ったら基本に戻るといい日。詳しい人に聞くと、答えが早く見つかる。" },
    rev: { key: "型破り",     yn: "MAYBE", msg: "「こうしなきゃ」に縛られやすい日。自分のやり方で大丈夫。" }
  },
  {
    id: 6, num: "VI", en: "THE LOVERS", ja: "恋人",
    up:  { key: "ときめき",   yn: "YES",  msg: "ワクワクするほうが正解の日。気の合う人と過ごすと、いい縁がつながる。" },
    rev: { key: "優柔不断",   yn: "NO",   msg: "決めきれないことが出てきそうな日。ひとつ選んだ瞬間から、流れは動き出す。" }
  },
  {
    id: 7, num: "VII", en: "THE CHARIOT", ja: "戦車",
    up:  { key: "前進",       yn: "YES",  msg: "今日は勢いがある日。思いきって動くと、追い風が吹く。" },
    rev: { key: "暴走",       yn: "NO",   msg: "急ぎすぎやすい日。少しペースを落とすくらいが、ちょうどいい。" }
  },
  {
    id: 8, num: "VIII", en: "STRENGTH", ja: "力",
    up:  { key: "勇気",       yn: "YES",  msg: "力技じゃなくて大丈夫。落ち着いていれば、ちゃんと乗り越えられる日。" },
    rev: { key: "弱気",       yn: "MAYBE", msg: "不安が先に立ちやすい日。弱音を吐いても、投げ出さなければちゃんと報われる。" }
  },
  {
    id: 9, num: "IX", en: "THE HERMIT", ja: "隠者",
    up:  { key: "内省",       yn: "MAYBE", msg: "今日はひとりの時間が合う日。ぼーっとしていると、大事なことが見えてくる。" },
    rev: { key: "孤立",       yn: "NO",   msg: "こもりがちになりやすい日。外の空気を吸うと、運気が入れ替わる。" }
  },
  {
    id: 10, num: "X", en: "WHEEL OF FORTUNE", ja: "運命の輪",
    up:  { key: "転機",       yn: "YES",  msg: "流れが変わるタイミング。来たチャンスには、迷わず乗っていい日。" },
    rev: { key: "すれ違い",   yn: "NO",   msg: "歯車が噛み合いにくい日。無理に動かず、流れが変わるのを待てば大丈夫。" }
  },
  {
    id: 11, num: "XI", en: "JUSTICE", ja: "正義",
    up:  { key: "公正",       yn: "YES",  msg: "やってきたことが、ちゃんと返ってくる日。まっすぐでいて大丈夫。" },
    rev: { key: "不均衡",     yn: "NO",   msg: "モヤっとする判断になりやすい日。一晩おいてから決めると、ちゃんと納得できる。" }
  },
  {
    id: 12, num: "XII", en: "THE HANGED MAN", ja: "吊るされた男",
    up:  { key: "忍耐",       yn: "MAYBE", msg: "今は動かないのが正解の日。この足踏みには、ちゃんと意味がある。" },
    rev: { key: "徒労",       yn: "NO",   msg: "我慢だけでは流れが変わりにくい日。頑張る向きを少し変えると、ちゃんと報われる。" }
  },
  {
    id: 13, num: "XIII", en: "DEATH", ja: "死神",
    up:  { key: "再生",       yn: "NO",   msg: "終わりは次のはじまり。手放したぶんだけ、新しいものが入ってくる日。" },
    rev: { key: "停滞",       yn: "MAYBE", msg: "終わったことに気持ちが残りやすい日。区切りをつけた分だけ、新しい流れが入ってくる。" }
  },
  {
    id: 14, num: "XIV", en: "TEMPERANCE", ja: "節制",
    up:  { key: "調和",       yn: "YES",  msg: "ちょうどいいバランスの日。淡々と続けることが、いちばんの強さになる。" },
    rev: { key: "過剰",       yn: "NO",   msg: "極端になりやすい日。食べすぎ考えすぎ、ほどほどにすると運が整う。" }
  },
  {
    id: 15, num: "XV", en: "THE DEVIL", ja: "悪魔",
    up:  { key: "誘惑",       yn: "NO",   msg: "分かってるけどやめられないものに注意の日。ほどほどが運を守る。" },
    rev: { key: "解放",       yn: "YES",  msg: "沼から抜けられるタイミング。ダラダラしていたことを、卒業できる日。" }
  },
  {
    id: 16, num: "XVI", en: "THE TOWER", ja: "塔",
    up:  { key: "激変",       yn: "NO",   msg: "急な変化が来やすい日。壊れるのはガタがきてたものだけ。そのあとは、運が開ける。" },
    rev: { key: "予兆",       yn: "MAYBE", msg: "ギリギリで持ちこたえやすい日。崩れる前に手直ししておくと、ちゃんと守れる。" }
  },
  {
    id: 17, num: "XVII", en: "THE STAR", ja: "星",
    up:  { key: "希望",       yn: "YES",  msg: "ちゃんと良い方向に向かってる日。焦らなくて大丈夫。" },
    rev: { key: "理想倒れ",   yn: "MAYBE", msg: "理想が高くなりやすい日。目標を少し手前に置くと、一気にラクになる。" }
  },
  {
    id: 18, num: "XVIII", en: "THE MOON", ja: "月",
    up:  { key: "不安",       yn: "NO",   msg: "なんとなく不安になりやすい日。はっきりしないことは今決めなくて大丈夫。霧はそのうち晴れる。" },
    rev: { key: "霧が晴れる", yn: "YES",  msg: "モヤモヤが晴れてくる日。そろそろ正体が見えてくる。" }
  },
  {
    id: 19, num: "XIX", en: "THE SUN", ja: "太陽",
    up:  { key: "成功",       yn: "YES",  msg: "文句なしのいい日。素直に楽しむほど、運は広がる。" },
    rev: { key: "曇り空",     yn: "MAYBE", msg: "悪くないけど、少し曇り気味の日。元気なフリはしなくて大丈夫。" }
  },
  {
    id: 20, num: "XX", en: "JUDGEMENT", ja: "審判",
    up:  { key: "復活",       yn: "YES",  msg: "もう一回チャレンジしていい日。前にあきらめたことも、今ならいける。" },
    rev: { key: "後悔",       yn: "NO",   msg: "過去に気持ちが引っぱられやすい日。許してあげると、前に進む運気が戻ってくる。" }
  },
  {
    id: 21, num: "XXI", en: "THE WORLD", ja: "世界",
    up:  { key: "完成",       yn: "YES",  msg: "ひと区切りの日。ここまでよく来た。達成感をしっかり味わっていい。" },
    rev: { key: "あと一歩",   yn: "MAYBE", msg: "あと一歩が足りない日。詰めを見直せば、ちゃんとできる。" }
  }
];

window.TAROT_MODES = {
  one:   { label: "今日の一枚",   en: "ONE CARD",   count: 1, desc: "今日のあなたへ、一枚のメッセージ。" },
  yn:    { label: "YES・NO",     en: "YES or NO",  count: 1, desc: "心の中で質問を思い浮かべて、一枚引いてみて。" },
  three: { label: "3枚引き",     en: "THREE CARDS", count: 3, desc: "過去・現在・未来。流れを3枚で読みます。", positions: ["過去", "現在", "未来"], positionsEn: ["PAST", "PRESENT", "FUTURE"] }
};

window.TAROT_YN = {
  YES:  { en: "YES",  ja: "はい" },
  NO:   { en: "NO",   ja: "いいえ" },
  MAYBE:{ en: "?",    ja: "どちらとも言えない" }
};
