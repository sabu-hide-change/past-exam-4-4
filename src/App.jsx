// npm install lucide-react recharts firebase
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Check,
  X,
  Home,
  ChevronRight,
  RefreshCw,
  BarChart2,
  BookOpen,
  User,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
} from "recharts";
import { initializeApp } from "firebase/app";
import { getAuth, signInAnonymously } from "firebase/auth";
import { getFirestore, doc, setDoc, onSnapshot } from "firebase/firestore";

// ===================================================================
// Firebase設定（APIキー等は環境変数から読み込み。直書きは絶対に厳禁）
// ===================================================================
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// データ分離用のアプリ識別子（他問題集と混ざらないよう。後から一括書き換え可）
const APP_ID = "QuizApp_4_4_Past_Exams_InternetSecurity_001";
const SOURCE_LABEL = "過去問セレクト演習 4-4 インターネットとセキュリティ";
const APP_TITLE = "4-4 インターネットとセキュリティ";
const SECTION_BADGE = "過去問 4-4";

// Firebase初期化（多重初期化・設定欠如でもクラッシュしないよう防衛的に）
let app = null;
let auth = null;
let db = null;
try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("[Firebase] 設定が未定義のため、LocalStorageフォールバックで動作します。");
  }
} catch (e) {
  console.warn("[Firebase] 初期化に失敗しました。LocalStorageフォールバックで動作します。", e);
}

const CHOICE_LABELS = ["ア", "イ", "ウ", "エ", "オ"];

// ===================================================================
// インラインSVG / テーブル図表コンポーネント群（外部画像URLは一切使用しない）
// ===================================================================

// 共通：白背景カードに図/SVGを描画（ダークテーマ上で見やすく）
const FigCard = ({ children, caption }) => (
  <div className="my-4">
    <div className="rounded-xl bg-white p-3 shadow-lg overflow-x-auto">{children}</div>
    {caption && (
      <p className="mt-1 text-center text-xs text-slate-400">{caption}</p>
    )}
  </div>
);

// 小物：シンプルな鍵アイコン（SVGプリミティブで内製） ---
const KeyGlyph = ({ x, y, fill = "#eab308", scale = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`}>
    <circle cx="6" cy="10" r="6" fill="none" stroke={fill} strokeWidth="3" />
    <line x1="11" y1="10" x2="30" y2="10" stroke={fill} strokeWidth="3" />
    <line x1="24" y1="10" x2="24" y2="17" stroke={fill} strokeWidth="3" />
    <line x1="30" y1="10" x2="30" y2="18" stroke={fill} strokeWidth="3" />
  </g>
);

// 小物：ノートPC / クライアント端末（SVGプリミティブで内製） ---
const LaptopGlyph = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="6" y="2" width="40" height="26" rx="3" fill="#1f2937" />
    <rect x="10" y="6" width="32" height="18" rx="1" fill="#cbd5e1" />
    <path d="M0,30 L52,30 L46,40 L6,40 Z" fill="#1f2937" />
  </g>
);

// 小物：サーバ筐体（SVGプリミティブで内製） ---
const ServerGlyph = ({ x, y }) => (
  <g transform={`translate(${x} ${y})`}>
    <rect x="0" y="0" width="40" height="56" rx="4" fill="#111827" />
    <rect x="6" y="8" width="22" height="3" rx="1" fill="#94a3b8" />
    <rect x="6" y="16" width="22" height="3" rx="1" fill="#94a3b8" />
    <rect x="6" y="24" width="22" height="3" rx="1" fill="#94a3b8" />
    <rect x="6" y="32" width="22" height="3" rx="1" fill="#94a3b8" />
    <circle cx="33" cy="9" r="2.2" fill="#22c55e" />
    <circle cx="33" cy="17" r="2.2" fill="#22c55e" />
  </g>
);

// --- Q8: チャレンジ／レスポンス認証の流れ（解説図。インラインSVGで完全再現） ---
const ChallengeResponseDiagram = () => (
  <FigCard caption="◆ チャレンジ／レスポンス認証の流れ（CHAP認証）">
    <svg viewBox="0 0 680 340" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <marker id="crBlue" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#2563eb" />
        </marker>
        <marker id="crGreen" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#16a34a" />
        </marker>
        <marker id="crGray" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
          <path d="M0,0 L10,5 L0,10 Z" fill="#94a3b8" />
        </marker>
      </defs>

      {/* クライアント */}
      <LaptopGlyph x="120" y="120" />
      <text x="146" y="180" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">クライアント</text>

      {/* サーバ + パスワードファイル */}
      <ServerGlyph x="540" y="110" />
      <text x="560" y="186" textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1f2937">サーバ</text>
      <ellipse cx="600" cy="60" rx="34" ry="12" fill="#3b82f6" />
      <rect x="566" y="60" width="68" height="46" fill="#3b82f6" />
      <ellipse cx="600" cy="106" rx="34" ry="12" fill="#1d4ed8" />
      <ellipse cx="600" cy="60" rx="34" ry="12" fill="#60a5fa" />
      <text x="600" y="40" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#1d4ed8">パスワード</text>
      <text x="600" y="125" textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1d4ed8">ファイル</text>

      {/* ① ユーザID入力 */}
      <line x1="210" y1="90" x2="535" y2="90" stroke="#2563eb" strokeWidth="3" markerEnd="url(#crBlue)" />
      <text x="372" y="82" textAnchor="middle" fontSize="13" fill="#1f2937">①ユーザID入力</text>

      {/* ② チャレンジコード送信（鍵付き・緑・サーバ→クライアント） */}
      <line x1="535" y1="135" x2="210" y2="135" stroke="#16a34a" strokeWidth="3" markerEnd="url(#crGreen)" />
      <KeyGlyph x="235" y="128" scale="0.8" />
      <text x="385" y="128" textAnchor="middle" fontSize="13" fill="#1f2937">②チャレンジコード送信</text>

      {/* ③ レスポンスコード生成（クライアント側の演算） */}
      <KeyGlyph x="20" y="222" scale="0.85" />
      <text x="60" y="222" fontSize="12" fill="#1f2937">③パスワード＋チャレンジコード</text>
      <text x="60" y="240" fontSize="12" fill="#1f2937">　＝レスポンスコード生成</text>

      {/* ④ レスポンスコード送信（クライアント→サーバ） */}
      <line x1="210" y1="270" x2="535" y2="270" stroke="#2563eb" strokeWidth="3" markerEnd="url(#crBlue)" />
      <text x="372" y="262" textAnchor="middle" fontSize="13" fill="#1f2937">④レスポンスコード送信</text>

      {/* ⑤ 一致すればログイン許可（サーバ内で照合） */}
      <line x1="560" y1="200" x2="560" y2="245" stroke="#16a34a" strokeWidth="3" markerEnd="url(#crGreen)" />
      <KeyGlyph x="588" y="206" scale="0.7" />
      <rect x="535" y="248" width="56" height="40" rx="3" fill="#e2e8f0" stroke="#94a3b8" strokeWidth="1.5" />
      <text x="448" y="312" textAnchor="middle" fontSize="12" fontWeight="bold" fill="#16a34a">⑤一致すればログイン許可</text>
      <line x1="525" y1="300" x2="595" y2="262" stroke="#94a3b8" strokeWidth="3" markerEnd="url(#crGray)" />
    </svg>
  </FigCard>
);

// --- Q9・Q10: 暗号化方式（秘密鍵／公開鍵）の比較図（解説図。インラインSVGで完全再現） ---
const EncryptionDiagram = () => {
  const Box = ({ x, y, label, fill, stroke, tcolor }) => {
    const X = Number(x);
    const Y = Number(y);
    return (
      <g>
        <rect x={X} y={Y} width="86" height="40" rx="5" fill={fill} stroke={stroke} strokeWidth="1.6" />
        <text x={X + 43} y={Y + 25} textAnchor="middle" fontSize="14" fontWeight="bold" fill={tcolor}>{label}</text>
      </g>
    );
  };
  const Mail = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect x="0" y="0" width="34" height="22" rx="2" fill="#bfdbfe" stroke="#3b82f6" strokeWidth="1.4" />
      <path d="M0,0 L17,13 L34,0" fill="none" stroke="#3b82f6" strokeWidth="1.4" />
    </g>
  );
  return (
    <FigCard caption="◆ 共通鍵（秘密鍵）暗号方式と公開鍵暗号方式の比較">
      <svg viewBox="0 0 640 470" className="w-full h-auto" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <marker id="encBlack" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#111827" />
          </marker>
          <marker id="encRed" markerWidth="12" markerHeight="12" refX="8" refY="5" orient="auto">
            <path d="M0,0 L10,5 L0,10 Z" fill="#dc2626" />
          </marker>
        </defs>

        <text x="320" y="26" textAnchor="middle" fontSize="20" fontWeight="bold" fill="#1f2937">暗号化</text>

        {/* ===== 上段：秘密鍵（共通鍵）暗号方式 ===== */}
        <rect x="20" y="44" width="600" height="170" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="320" y="70" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#1f2937">秘密鍵（共通鍵）暗号方式</text>

        <text x="80" y="150" textAnchor="middle" fontSize="13" fill="#1f2937">送信者</text>
        <text x="560" y="150" textAnchor="middle" fontSize="13" fill="#1f2937">受信者</text>

        {/* 事前に秘密鍵を共有（赤破線・両端に同じ鍵） */}
        <KeyGlyph x="150" y="92" scale="0.7" />
        <KeyGlyph x="450" y="92" scale="0.7" />
        <line x1="190" y1="100" x2="450" y2="100" stroke="#dc2626" strokeWidth="1.8" strokeDasharray="6 5" />
        <text x="320" y="94" textAnchor="middle" fontSize="12" fill="#dc2626">事前に秘密鍵を共有</text>

        <Box x="140" y="150" label="暗号化" fill="#fde68a" stroke="#f59e0b" tcolor="#92400e" />
        <Mail x="305" y="160" />
        <Box x="410" y="150" label="復号化" fill="#bbf7d0" stroke="#22c55e" tcolor="#166534" />
        <line x1="226" y1="170" x2="408" y2="170" stroke="#111827" strokeWidth="3" markerEnd="url(#encBlack)" />

        {/* ===== 下段：公開鍵暗号方式 ===== */}
        <rect x="20" y="240" width="600" height="210" rx="10" fill="#f8fafc" stroke="#cbd5e1" strokeWidth="1.5" />
        <text x="320" y="266" textAnchor="middle" fontSize="15" fontWeight="bold" fill="#1f2937">公開鍵暗号方式</text>

        {/* 受信者の公開鍵で暗号化（赤） */}
        <KeyGlyph x="470" y="296" scale="0.8" />
        <text x="540" y="312" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#dc2626">公開鍵</text>
        <text x="150" y="300" textAnchor="middle" fontSize="12" fill="#dc2626">受信者の公開鍵で</text>
        <text x="150" y="316" textAnchor="middle" fontSize="12" fill="#dc2626">暗号化</text>
        <path d="M470,310 L183,310 L183,360" fill="none" stroke="#dc2626" strokeWidth="2.4" markerEnd="url(#encRed)" />

        <text x="80" y="400" textAnchor="middle" fontSize="13" fill="#1f2937">送信者</text>
        <text x="560" y="400" textAnchor="middle" fontSize="13" fill="#1f2937">受信者</text>

        <KeyGlyph x="430" y="356" scale="0.8" />
        <text x="500" y="372" textAnchor="middle" fontSize="13" fontWeight="bold" fill="#92400e">秘密鍵</text>

        <Box x="140" y="396" label="暗号化" fill="#fde68a" stroke="#f59e0b" tcolor="#92400e" />
        <Mail x="305" y="406" />
        <Box x="410" y="396" label="復号化" fill="#bbf7d0" stroke="#22c55e" tcolor="#166534" />
        <line x1="226" y1="416" x2="408" y2="416" stroke="#111827" strokeWidth="3" markerEnd="url(#encBlack)" />
      </svg>
    </FigCard>
  );
};

function renderFigures(qid, phase) {
  // phase: "problem" | "explanation"
  // いずれも解説（概念整理）用の図のため、解答後の解説画面でのみ表示する
  switch (qid) {
    case 8:
      return phase === "explanation" ? <ChallengeResponseDiagram /> : null;
    case 9:
      return phase === "explanation" ? <EncryptionDiagram /> : null;
    case 10:
      return phase === "explanation" ? <EncryptionDiagram /> : null;
    default:
      return null;
  }
}

// ===================================================================
// 問題データ（全14問・ノンカット収録。問題文・選択肢・正解・解説をそのまま格納）
// category: "network"（インターネット・ネットワーク） / "security"（セキュリティ）
// answer は 0始まりのインデックス（ア=0, イ=1, ウ=2, エ=3, オ=4）
// ===================================================================
const QUESTIONS = [
  {
    id: 1,
    title: "インターネットの仕組み",
    source: "令和元年　第8問",
    category: "network",
    question: `中小企業診断士のあなたは、あるメールを開封したところ、次のような URL に接続するように指示が出てきた。

https://News.Fishing.jp/test

この URL から分かることとして、最も適切なものはどれか。`,
    choices: [
      "SSL を用いて暗号化されたデータ通信であることが確認できる。",
      "大文字と小文字を入れ替えた偽サイトであることが確認できる。",
      "参照先ホストのサーバが日本国内に設置されていることが確認できる。",
      "ホスト名の WWW が省略されていることが確認できる。",
    ],
    answer: 0,
    explanation: `本問では、URLの表記とSSLについて問われています。
まず、URLとSSLについて、簡単に復習しておきましょう。
では、選択肢についてみていきます。

選択肢アですが、SSLを使ったWebページのURLの先頭（プロトコルを表示する部分）は、「https:」と表記されます。つまり、設問にあるURL「https://News.Fishing.jp/test」は、SSLを使って暗号化されたデータ通信であることが確認できます。よって適切であり、これが正解となります。

選択肢イですが、当該URLのうち、「News.Fishing.jp」の部分はドメイン名と呼ばれ、ネットワーク上に存在するコンピュータを識別する名前です。ドメイン名では、大文字と小文字を区別しないため、大文字と小文字を入れ替えた偽サイトであるということは、確認できません。よって、不適切です。

選択肢ウですが、ドメイン名の最後にある「jp」のような文字列を、トップレベルドメインといいます。「jp」は、トップレベルドメインの中でも国別のものであり、原則として、日本国内に住所のある企業・組織・個人等しか取得できません。ただし、そのドメインを管理する参照先ホストのサーバが日本国内に設置されているかどうかは分かりません。よって、不適切です。

選択肢エですが、ホスト名のWWWを付与するかどうかは、管理者（登録者）が自由に決めることができるため、当該URLを見ただけで、一概に「省略されている」とは言えません。よって不適切です。

以上より、正解は選択肢アとなります。
このように、URLの表記に関しては細かい規定があります。
もしSSLの表記に関する知識がなかった場合は、消去法で不適切なものから順に取り除いていき、疑わしき選択肢を不適切と判断して絞り込んでいくとよいでしょう。`,
  },
  {
    id: 2,
    title: "インターネットの機能",
    source: "平成23年　第12問",
    category: "network",
    question: `事務所内で、インターネットの様々な仕組みを業務に利用しなければならない場面が増え、インターネットの管理・運用についての理解が求められている。
インターネットにおいて、以下のａ～ｃの記述内容とそれを提供する機能や機器名称の組み合わせとして、最も適切なものを下記の解答群から選べ。

ａ ドメイン名・ホスト名とIPアドレスを対応付ける機能を持ち、Webクライアントからのアドレス指定の際の問い合わせなどに答える。
ｂ 事務所内のLANにPCが接続された時、当該PCが使用するIPアドレスを割り当てる。
ｃ グローバルIPアドレスと事務所内のプライベートIPアドレスの交換を行う。

[解答群]`,
    choices: [
      "ａ：DHCP　ｂ：NAT　ｃ：VPN",
      "ａ：DNS　ｂ：DHCP　ｃ：NAT",
      "ａ：NAT　ｂ：ブロードバンドルータ　ｃ：プロキシサーバ",
      "ａ：VPN　ｂ：プロキシサーバ　ｃ：DNS",
    ],
    answer: 1,
    explanation: `経営情報システムから、インターネットの機能に関する出題です。
組み合わせを解答するタイプの問題となっています。インターネットの機能や機器について、基本を覚えていた人は正解できる問題です。

順番に記述を見ていきましょう。
ａは、DNSに関する記述です。
DNSは、ドメイン名からIPアドレスを変換するシステムです。これを行うサーバをDNSサーバと呼びます。DNSサーバには、ドメイン名とIPアドレスの対応関係が登録されています。
この時点で、イが正解であることが分かりますが、参考として、他の選択肢の内容も見ておきましょう。
ｂは、DHCPに関する記述です。
DHCP（Dynamic Host Configuration Protocol）とは、インターネットなどのネットワークに接続するコンピュータにIP アドレスなどを自動的に割り当てるプロトコルです。
ｃは、NAT に関する記述です。
NATとは、社内LANとインターネットなど、異なるネットワークを接続する機能です。NATでは、プライベートIPアドレスとグローバルIPアドレスを、1対1で変換します。NATの機能は、ルータによって提供されます。
以上より、イが正解となります。`,
  },
  {
    id: 3,
    title: "プロトコル",
    source: "平成30年　第9問",
    category: "network",
    question: `通信ネットワーク上では多様なプロトコルが用いられており、代表的なプロトコルについて理解しておくことは、中小企業の情報ネットワーク化においても重要である。通信プロトコルに関する以下の①～④の記述と、それらに対応する用語の組み合わせとして、最も適切なものを下記の解答群から選べ。

①クライアントからサーバにメールを送信したり、サーバ間でメールを転送したりするために用いられる。
②ネットワークに接続する機器に IPアドレスなどを自動的に割り当てるために用いられる。
③ネットワークに接続されている機器の情報を収集し、監視や制御を行うために用いられる。
④ネットワークに接続されている機器の内部時計を協定世界時に同期するために用いられる。

〔解答群〕`,
    choices: [
      "①：IMAP　②：DHCP　③：PPP　④：NTP",
      "①：IMAP　②：FTP　③：SNMP　④：SOAP",
      "①：SMTP　②：DHCP　③：SNMP　④：NTP",
      "①：SMTP　②：FTP　③：PPP　④：SOAP",
    ],
    answer: 2,
    explanation: `経営情報システムから、プロトコルに関する出題です。
組み合わせを解答するタイプの問題となっています。代表的なプロトコルを覚えていた人は、正解できる問題です。

順番に記述を見ていきましょう。
①は、メール送信に関する記述です。
SMTPは、電子メールの送信に使われるプロトコルです。SMTPは、送信者のクライアントのメールソフトからメールサーバへ転送するときと、送信者のメールサーバから受信者のメールサーバへと転送するときに利用されます。
IMAPは、電子メールの受信に使われるプロトコルです。IMAP は、受信したメールをサーバに保存します。もう一つ、電子メール受信のプロトコルにPOP3があります。POP3は、受信したメールをクライアントにダウンロードして保存します。
②は、IPアドレスに関する機能です。
DHCP（Dynamic Host Configuration Protocol）とは、インターネットなどのネットワークに接続するコンピュータにIP アドレスなどを自動的に割り当てるプロトコルです。
FTP（File Transfer Protocol）は、ファイルを転送する際のプロトコルです。
③は、ネットワークに関する機能です。
SNMP（Simple Network Management Protocol）は、ネットワークに接続されている機器の情報を収集し、監視や制御を行うために用いられるプロトコルです。
PPP（Point-to-Point Protocol）とは、2つの拠点間を相互接続するプロトコルです。
④も、ネットワークに関する機能です。
NTP（Network Time Protocol）は、ネットワークに接続されている機器の内部時計を、正しい時刻に同期するためのプロトコルです。
SOAP（Simple Object Access Protocol）とは、異なるコンピュータ上で動作するプログラム同士がネットワークを通じて連携して動作するためのプロトコルです。メッセージの記述にXMLを、データ伝送に主にHTTPを用い、Webサービスの提供や利用に適しています。
よって、①SMTP　②DHCP　③SNMP　④NTPとなり、選択肢ウが正解です。

選択肢の全ての用語を知らなくても、本問では①～④のうち2つが分かれば正解を絞り込めます。分かるところから消去法を用いて、確実に得点しましょう。`,
  },
  {
    id: 4,
    title: "情報システムのセキュリティ",
    source: "平成24年　第22問",
    category: "security",
    question: `インターネット利用が普及して、インターネット上で取引情報やプライバシーにかかわる情報を扱う場面が多くなっている。従って情報セキュリティについて、その基礎事項を把握しておくことは重要である。
情報セキュリティにかかわる記述として最も適切なものはどれか。`,
    choices: [
      "インターネットを介して、顧客情報を収集してそれをデータベース化した場合、それが漏洩しないようにするにはウイルス対策を行えばよい。",
      "インターネットを介して、顧客に送り先等の他に年齢、家族構成などを入力してもらう場合、その用途については顧客に知らせる必要はない。",
      "取引企業、顧客との情報のやりとりは、暗号化することが好ましいが、その場合に用いる公開鍵暗号方式とは、関係者の間で共通鍵を設定して、情報を暗号化する方式である。",
      "ファイアウォールを自社コンピュータに対する不正アクセスの防止手段として利用する場合、どのような内容のアクセスを拒否するのかをあらかじめ設定する必要がある。",
    ],
    answer: 3,
    explanation: `経営情報システムから、情報システムのセキュリティに関する出題です。セキュリティに関する基本的な知識を覚えていた人は正解できる問題です。

順番に記述を見ていきましょう。
選択肢アは、データベースの情報漏洩に関する記述です。
データベースなどに格納されたデータは、ウイルス対策だけでは情報漏洩を防ぐことはできません。よりセキュリティを高めるには、データのアクセス権限の設定や持ち出し時の規定などを定める必要があります。よって、アの記述は不適切です。

選択肢イは、顧客情報の利用用途に関する記述です。
個人情報保護法第18条では、インターネットなどを介して個人情報を取得する場合は、その利用目的を明示する必要がある旨を定義しています。よって、イの記述は不適切です。

選択肢ウは、暗号化に関する記述です。
公開鍵暗号方式は、暗号化の鍵と、復号化の鍵が異なる方式です。公開鍵暗号方式では、ペアの鍵を用意しておきます。そして、暗号に使う鍵を、受信者が公開鍵として公開しておき、受信者が復号に使う鍵を知られないように秘密鍵として自分で管理しておきます。設問文に書かれている、暗号化と復号化に共通鍵を使う方式は、秘密鍵暗号方式（共通鍵方式）です。よって、ウの記述は不適切です。

選択肢エは、ファイアウォールに関する記述です。
ファイアウォールとは、企業の外部からの不正アクセスを防ぐための仕組みです。ファイアウォールの代表的な機能として、パケットフィルタリングがあります。
パケットフィルタリングは、データの単位であるパケットを、取捨選択する機能です。
パケットフィルタリングを利用する際は、事前に通してよいパケット、許可しないパケットの情報を登録する必要があります。よって、エの記述が適切であり、これが正解となります。
情報システムのセキュリティは重要ですので、しっかり復習しておきましょう。`,
  },
  {
    id: 5,
    title: "セキュリティポリシー",
    source: "令和3年　第21問",
    category: "security",
    question: `業務システムのクラウド化やテレワークの普及によって、企業組織の内部と外部の境界が曖昧となり、ゼロトラストと呼ばれる情報セキュリティの考え方が浸透してきている。ゼロトラストに関する記述として、最も適切なものはどれか。`,
    choices: [
      "組織内において情報セキュリティインシデントを引き起こす可能性のある利用者を早期に特定し教育することで、インシデント発生を未然に防ぐ。",
      "通信データを暗号化して外部の侵入を防ぐ VPN 機器を撤廃し、認証の強化と認可の動的管理に集中する。",
      "利用者と機器を信頼せず、認証を強化するとともに組織が管理する機器のみを構成員に利用させる。",
      "利用者も機器もネットワーク環境も信頼せず、情報資産へのアクセス者を厳格に認証し、常に確認する。",
      "利用者を信頼しないという考え方に基づき認証を重視するが、一度許可されたアクセス権は制限しない。",
    ],
    answer: 3,
    explanation: `本問では、ゼロトラストについて問われています。
ゼロトラストについて実践的な知識も求められており、解答が難しい問題です。

それでは、選択肢を見ていきましょう。
選択肢アについて、ゼロトラストでは、どの利用者も信頼せずにセキュリティ対策を講じます。インシデントを引き起こす可能性のある利用者を教育して問題の発生を防ぐという考え方ではありません。よって、不適切です。

選択肢イについて、ゼロトラストでは「認証の強化と認可の動的管理」が重視されます。たとえば、統合的なID管理システムを設けて、リソースへのアクセスのたびに認証や認可を行います。ネットワーク内部・外部の境界を設けずに認証や認可を行おうとするものですが、VPN機器の撤廃を進めるものではありません。よって、不適切です。

選択肢ウについて、「利用者と機器を信頼せず、認証を強化する」という部分は、ゼロトラストの考え方に合っていますが、「組織が管理する機器のみを構成員に利用させる」というものではありません。ゼロトラストでは、構成員が利用する機器を管理しますが、組織が管理する機器のみを利用させるという制限を設けるものではありません。よって、不適切です。

選択肢エについて、ゼロトラストは、利用者も機器もネットワーク環境も信頼しませんので、情報資産へのアクセス者を厳格に認証し、常に確認します。よって、適切であり、これが正解です。

選択肢オについて、「利用者を信頼しないという考え方に基づき認証を重視する」という部分がゼロトラストの考え方に合っていますが、「一度許可されたアクセス権は制限しない」という点は合っていません。むしろ、ゼロトラストでは、一度認証が許可された後でも継続して認証を行います。よって、不適切です。

ゼロトラストについて、基本的な考え方は本問を通して覚えておきましょう。`,
  },
  {
    id: 6,
    title: "ソーシャルエンジニアリング",
    source: "平成30年　第23問",
    category: "security",
    question: `近年、機密情報への攻撃の手法が多様化している。機密情報を不正に入手する手法であるソーシャルエンジニアリングに関する記述として、最も不適切なものはどれか。`,
    choices: [
      "シュレッダーで処理された紙片をつなぎ合わせて、パスワードを取得する。",
      "パソコンの操作画面を盗み見して、パスワードを取得する。",
      "文字列の組み合わせを機械的かつ総当たり的に試すことで、パスワードを取得する。",
      "ユーザになりすまして管理者に電話し、パスワードを取得する。",
    ],
    answer: 2,
    explanation: `経営情報システムから、セキュリティリスクのうち、ソーシャルエンジニアリングについての問題です。ソーシャルエンジニリングについてその特徴を覚えていた人は、正解できる問題です。

まずは、ソーシャルエンジニアリングについて簡単に復習しておきましょう。
ソーシャルエンジニアリングは、人間の不注意や間違いにつけこんだり、盗み聞きなどを利用したりする人的脅威であり、非技術的な方法で情報を不正に入手する手口のことです。
ここまでを押さえた上で、順番に記述を見ていきましょう。

選択肢アは、シュレッダーで処理された紙片をつなぎ合わせ、パスワードを盗み取る手法について問われています。
このような手法は、非技術的な手法であり、ソーシャルエンジニアリングに関する記述としては適切です。

選択肢イは、パソコンの操作画面を覗いて、パスワードを盗み見る手法について問われています。
このような手法は、非技術的な手法であり、ソーシャルエンジニアリングに関する記述としては適切です。

選択肢ウは、文字列の組み合わせを機械的かつ総当たり的に試すことで、パスワードを取得する手法について問われています。この手法は「総当たり攻撃」と呼ばれるもので、コンピュータを使って自動的に、無数の文字列の組み合わせを入力していくものです。よってソーシャルエンジニアリングに関する記述としては不適切であり、これが正解です。

参考として、残りの選択肢も見ておきましょう。
選択肢エは、ユーザになりすまし、管理者からパスワードを取得する手法について問われています。
このような手法は、非技術的な手法であり、ソーシャルエンジニアリングに関する記述としては適切です。
以上より、ウが正解となります。

セキュリティリスクに関する出題は増加傾向にありますので、きちんと押さえておくようにしましょう。`,
  },
  {
    id: 7,
    title: "テレワークセキュリティガイドライン",
    source: "令和3年　第25問",
    category: "security",
    question: `コロナ禍の影響もあり、テレワークが一般化してきた。テレワークを行うには、社内で行っていた作業環境をリモートで実現する必要がある。総務省は「テレワークセキュリティガイドライン第 5 版」を発表し、その中で、テレワークの方式を分類している。この分類に関する記述として、最も適切なものはどれか。`,
    choices: [
      "「VPN」方式とは、テレワーク端末からVDI上のデスクトップ環境に接続を行い、そのデスクトップ環境を遠隔操作して業務を行う方法である。",
      "「仮想デスクトップ」方式とは、テレワーク端末からオフィスネットワークに対してVPN接続を行い、その VPN を介してオフィスのサーバ等に接続し業務を行う方法である。",
      "「セキュアコンテナ」方式とは、テレワーク端末にファイアウォールで保護された仮想的なWeb 環境を設け、その環境内でアプリケーションを動かし業務を行う方法である。",
      "「セキュアブラウザ」方式とは、テレワーク端末から Tor ブラウザと呼ばれる特殊なインターネットブラウザを利用し、オフィスのシステム等にアクセスし業務を行う方法である。",
      "「リモートデスクトップ」方式とは、テレワーク端末からオフィスに設置された端末（PC など）のデスクトップ環境に接続し、そのデスクトップ環境を遠隔操作して業務を行う方法である。",
    ],
    answer: 4,
    explanation: `本問では、総務省が公表している「テレワークセキュリティガイドライン」について出題されています。
テレワークセキュリティガイドラインに記載されているテレワーク方式について問われています。テレワークセキュリティガイドラインを知らなくても、解答にあたって選択肢の絞り込みはできる問題でしょう。
テレワークセキュリティガイドラインでは、基本的なテレワーク方式として次の7種類に整理しています。

それでは、選択肢を見ていきましょう。
選択肢アは、仮想デスクトップ方式に関する記述です。よって、不適切です。
選択肢イは、VPN方式に関する記述です。よって、不適切です。
選択肢ウについて、セキュアコンテナ方式では、テレワーク端末にローカル環境とは独立したセキュアコンテナという仮想的な環境を設けます。ファイアウォールで保護された仮想的なWeb環境を設けるものではありません。よって、不適切です。
選択肢エについて、セキュアブラウザ方式では、テレワーク端末からセキュアブラウザと呼ばれる特殊なインターネットブラウザを利用します。Torブラウザは、接続経路を匿名化するTorを組み込んだオープンソースのブラウザです。Torブラウザはセキュアブラウザの１つに挙げられることがありますが、セキュアブラウザ方式は、Torブラウザを利用することに限ったものではありません。よって、不適切です。
選択肢オは、リモートデスクトップに関する記述です。よって、適切であり、これが正解です。

テレワークセキュリティガイドラインに記載されているテレワーク方式について確認しておきましょう。`,
  },
  {
    id: 8,
    title: "各種認証技術",
    source: "平成28年　第19問",
    category: "security",
    question: `情報システムの利用においては、フィッシング詐欺や情報事案などの増加に対応するために情報セキュリティをより高めなければならない。その一環としてユーザ認証の強化が叫ばれている。これに関する記述として最も適切なものはどれか。`,
    choices: [
      "CHAP認証とは、チャレンジ／レスポンスという方式で、Ｗｅｂサイトにアクセスしてきたユーザを認証するものである。",
      "二段階認証とは、同じパスワードを2回入力させてユーザの認証を行う方式のことである。",
      "ハードウェアトークンとは、その機器を認証装置にかざすことで本人を認証する仕組みのことである。",
      "ワンタイムパスワードとは、サイトに登録した際に最初の認証に利用されるパスワードである。",
    ],
    answer: 0,
    explanation: `経営情報システムから、セキュリティにおける各種認証技術に関する出題です。細かい論点も含まれており、認証方式の幅広い知識について問われている問題です。
順番に記述を見ていきましょう。

選択肢アについて、CHAP（Challenge-Handshake Authentication Protocol）とは、ユーザ認証のためのプロトコルです。CHAP認証の特徴は、チャレンジ／レスポンスという方式を用いて認証を行います。チャレンジ／レスポンス認証の流れは以下のとおりです。
■チャレンジ／レスポンス認証の流れ
①クライアントがユーザIDを入力し、サーバに送信
②サーバは乱数鍵（チャレンジコード）を生成してそれをユーザに送信
③クライアントはその鍵を使ってパスワードを暗号化し、レスポンスコードを生成
④レスポンスコードをサーバに送信
⑤サーバは、送られてきた暗号化されたパスワードをサーバ自身が生成した暗号化されたパスワードと比較して、一致すればユーザのログインを許可
このように、毎回乱数を変更することにより、盗聴によるパスワードの詐取、悪用を防ぐことができます。よって、アの記述は適切で、これが正解となります。

選択肢イについて、二段階認証とは、ID／パスワードに加えて、セキュリティコードによる認証を行う方式です。単純なパスワード認証にさらなる認証方式を加えることで、ID／パスワードの詐取や悪意のある第三者による不正なログインなどを防ぎ、より強固なセキュリティ環境を実現することができます。同じパスワードを2回入力させるものではありませんので、イの記述は不適切です。

選択肢ウについて、ハードウェアトークンとは、物理的デバイスを使って認証を行う方式です。物理的デバイスには、USB端子に挿して使用するUSBメモリタイプのものや暗証番号を入力する小さなキーパッドなど、様々な形態があります。機器を認証装置にかざすことで本人を認証する仕組みを指すわけではありませんので、ウの記述は不適切です。

選択肢エについて、ワンタイムパスワードとは、一回限り有効なパスワードで認証する方式です。いわば使い捨てのパスワードにより、従来のように固定的なパスワードを繰り返し使っている中でパスワードを窃取されるリスクを軽減したり、なりすましなどの不正ログインを防いだりします。サイトに登録した際に最初の認証に利用されるパスワードではありませんので、エの記述は不適切です。`,
  },
  {
    id: 9,
    title: "暗号化",
    source: "平成23年　第21問",
    category: "security",
    question: `情報システムがネットワーク上で稼働するようになっている。その場合、情報システムへの不正侵入を防いだり、ネットワーク上で情報が漏洩したりしないようにするため、暗号化や各種認証方式が採用される。これに関する記述として最も適切なものはどれか。`,
    choices: [
      "公開鍵暗号方式とは、送受信者だけが知る公開鍵をお互いに持ち、送信者はその鍵で暗号化し、受信者はその鍵で復号化する。",
      "チャレンジレスポンス認証とは、キーホルダー型などの形態の、認証サーバと同期したパスワード発生装置を利用して認証を行う。",
      "デジタル署名とは、自分のサインをデジタルカメラで撮影し、それを送信文に貼り付けることをいう。",
      "ハイブリッド方式とは、公開鍵暗号方式と共通鍵暗号方式を組み合わせたものである。",
    ],
    answer: 3,
    explanation: `経営情報システムから、暗号化に関する出題です。聞き慣れない語句も含まれていますが、暗号化の基本的な知識があれば正解できる問題です。
順番に記述を見ていきましょう。
選択肢アは、公開鍵暗号方式に関する記述です。
公開鍵暗号方式は、暗号化の鍵と、復号化の鍵が異なる方式です。公開鍵暗号方式では、ペアの鍵を用意しておきます。そして、受信者が暗号に使う鍵を公開鍵として公開しておき、復号に使う鍵を知られないように秘密鍵として自分で管理しておきます。設問文に書かれている、暗号化と復号化に同じ鍵を使う方式は、秘密鍵暗号方式（共通鍵方式）です。
よって、アの記述は不適切です。

選択肢イは、チャレンジレスポンス認証に関する記述です。
チャレンジレスポンス認証とは、認証サーバが毎回「チャレンジ」というランダムなコードをクライアントに送信します。クライアントは、このチャレンジコードに基づき、一定のアルゴリズムで「レスポンス」というデータを返します。サーバでも、同様のアルゴリズムでレスポンスを算出し、クライアントからのレスポンスと照合することで正当性を確認します。
設問文に書かれている、キーホルダー型などの形態の、認証サーバと同期したパスワード発生装置を利用するのは、タイムシンクロナス方式という認証方式です。よって、イの記述は不適切です。

選択肢ウは、デジタル署名に関する記述です。
デジタル署名は、ネットワーク経由で受信したデジタル文書を保証するための技術です。
デジタル署名は、データを送受信する際に、デジタル署名とデータを、公開鍵暗号方式で暗号化します。設問文に書かれているように、サインをデジタルカメラで撮影するものではないので、ウの記述は不適切です。

選択肢エは、ハイブリッド方式に関する記述です。
ハイブリッド方式とは、公開鍵暗号方式と共通鍵暗号方式を組み合わせたものです。
公開鍵暗号方式には、安全性が高いけれど処理速度が遅いという欠点があります。また、共通鍵暗号方式には、処理は早いが安全性が低いという欠点があります。これらの欠点を補うのが、ハイブリッド方式です。ハイブリッド方式では、共通鍵暗号方式を使ってデータを暗号化します。そして、データの暗号化に使用した共通鍵自体を、公開鍵暗号方式を使用して暗号化し、相手に送ります。よって、エの記述は適切で、これが正解となります。`,
  },
  {
    id: 10,
    title: "暗号化方式",
    source: "平成26年　第21問",
    category: "security",
    question: `インターネットが普及した現在においては、関係者以外に知られてはならないような情報を、インターネットを介してやり取りしなければならない状況も多い。そのような状況下では暗号化の技術が重要になる。
大阪のA さんが、東京にいるBさんに顧客名簿を送ってもらうように依頼した。その場合に利用する暗号化方式に関する記述として最も適切なものはどれか。`,
    choices: [
      "Bさんは、顧客名簿のファイルを、暗号化鍵を管理する社内部署から鍵をひとつもらって暗号化した。Aさんに送付後、その鍵で暗号化したことを鍵管理部署に連絡した。Aさんは、その部署からBさんが使った鍵を聞き、送られたファイルを復号化した。この方式はSSL方式のひとつである。",
      "Bさんは、顧客名簿のファイルをAさんとBさんが共有する秘密鍵で暗号化してAさんに送付した。この方式はシーザー暗号方式のひとつである。",
      "Bさんは、顧客名簿のファイルをAさんの公開鍵で暗号化して送付した。Aさんは、Bさんの秘密鍵で復号化した。この方式は公開鍵方式のひとつである。",
      "Bさんは、顧客名簿のファイルを任意に決めた鍵で暗号化してAさんに送付した。AさんはBさんから電話でその鍵を聞き、復号化した。この方式は共通鍵方式のひとつである。",
    ],
    answer: 3,
    explanation: `経営情報システムから、暗号化方式に関する出題です。簡単なケースを通した問題になっていますが、暗号化方式の基本的な知識を持って段階を踏んで考えていけば正解できる問題です。

順番に記述を見ていきましょう。
選択肢アでは、記述の内容がSSL方式であるかどうか問われています。
SSL（Secure Socket Layer）は、TCP/IPネットワークで、データを暗号化して送受信するためのプロトコルです。SSLを使用することで、Webページのデータを暗号化して送信することができます。SSLを使ったWebページのURLは、「https:」と表記されます。選択肢のケースは手動の単純な暗号化の方法についての記述です。よって、アの記述は不適切です。

選択肢イでは、記述の内容がシーザー暗号方式であるかどうか問われています。
シーザー暗号方式は、アルファベットを何文字かずらして暗号化する方法です。たとえば、2文字シフトさせて「A」を「C」、「B」を「D」と置換して暗号文を作成します。復号化するには、アルファベットをずらした数だけ元に戻します。そのため、シーザー暗号方式は非常に簡易な暗号化方式です。選択肢の記述と照らし合わせてみると、イの記述が不適切であると分かります。

選択肢ウは、記述の内容が公開鍵方式であるかどうか問われています。
公開鍵方式では、送信者は、受信者が公開している公開鍵を使ってデータを暗号化します。次に、暗号化されたデータを受け取った受信者は、自分で管理している秘密鍵を使って復号化します。このケースでは、Bさんは、Aさんの公開鍵で暗号化して送付しています。ここまでは適切なのですが、Aさんは、Bさんの秘密鍵で復号化しています。公開鍵方式では、Aさん自身の秘密鍵で復号化します。よって、ウの記述は不適切です。

選択肢エは、記述の内容が共通鍵方式であるかどうか問われています。共通鍵方式は、秘密鍵方式とも言われます。暗号化と復号化に同じ鍵を使う方式です。選択肢のケースでも、Bさんが暗号化した鍵をAさんが復号化する際にも使用しています。よって、エの記述は適切で、これが正解となります。`,
  },
  {
    id: 11,
    title: "情報セキュリティリスク",
    source: "令和5年　第23問",
    category: "security",
    question: `JISQ27000：2019（情報セキュリティマネジメントシステム－用語）におけるリスクに関する以下の記述の空欄Ａ～Ｅに入る用語の組み合わせとして、最も適切なものを下記の解答群から選べ。

・リスク Ａとは、結果とその起こりやすさの組み合わせとして表現されるリスクの大きさのことである。
・リスク Ｂ とは、リスクの特質を理解し、リスクレベルを決定するプロセスのことである。
・リスク Ｃとは、リスクの重大性を評価するための目安とする条件のことである。
・リスク Ｄ とは、リスクの大きさが受容可能かを決定するために、リスク分析の結果をリスク基準と比較するプロセスのことである。
・リスク Ｅ とは、リスクを発見、認識および記述するプロセスのことである。

〔解答群〕`,
    choices: [
      "Ａ：基準　Ｂ：特定　Ｃ：レベル　Ｄ：評価　Ｅ：分析",
      "Ａ：基準　Ｂ：分析　Ｃ：レベル　Ｄ：特定　Ｅ：評価",
      "Ａ：レベル　Ｂ：特定　Ｃ：基準　Ｄ：評価　Ｅ：分析",
      "Ａ：レベル　Ｂ：分析　Ｃ：基準　Ｄ：特定　Ｅ：評価",
      "Ａ：レベル　Ｂ：分析　Ｃ：基準　Ｄ：評価　Ｅ：特定",
    ],
    answer: 4,
    explanation: `本問は、情報セキュリティリスクに関する問題です。JISQ27000：2019　情報セキュリティマネジメントシステムにおけるそれぞれの言葉の定義を知っておく必要があります。では、言葉の定義を解説していきます。

リスクレベル：結果とその起こりやすさの組合せとして表現される，リスクの大きさのことを言います。
リスク分析：リスクの特質を理解し，リスクレベルを決定するプロセスのことを言います。
リスク基準：リスクの重大性を評価するための目安とする条件のことを言います。
リスク評価：リスク及び／又はその大きさが，受容可能か又は許容可能かを決定するために，リスク分析の結果をリスク基準と比較するプロセス
リスク特定：リスクを発見、認識および記述するプロセスのことを言います。
なお、リスクアセスメント（事業に潜むリスクを特定・分析・評価する一連の流れ）は、リスク特定→リスク分析→リスク評価の順にプロセスを踏みます。

以上を踏まえて、解答群を確認すると、
Ａ：レベル　Ｂ：分析　Ｃ：基準　Ｄ：評価　Ｅ：特定
が最も適切な組み合わせになります。
よって、オが正解となります。`,
  },
  {
    id: 12,
    title: "ネットワークのセキュリティ",
    source: "令和2年　第10問",
    category: "network",
    question: `近年、情報ネットワークが発展・普及し、その重要性はますます高まっている。
安全にネットワーク相互間の通信を運用するための記述として、最も適切なものの組み合わせを下記の解答群から選べ。

ａ　SSL/TLSは、インターネットを用いた通信においてクライアントとサーバ間で送受信されるデータを暗号化する際に使われる代表的なプロトコルである。
ｂ　IDSは、大切な情報を他人には知られないようにするために、データを見てもその内容が分からないように、定められた処理手順でデータを変換する仕組みである。
ｃ　VPNは、認証と通信データの暗号化によってインターネット上に構築された仮想的な専用ネットワークである。
ｄ　DMZは、LANに接続するコンピュータやデバイスなどに対して、IPアドレス、ホスト名や DNSサーバの情報といった通信に必要な設定情報を自動的に割り当てるプロトコルである。

〔解答群〕`,
    choices: [
      "ａとｂ",
      "ａとｃ",
      "ｂとｄ",
      "ｃとｄ",
    ],
    answer: 1,
    explanation: `本問では、ネットワークのセキュリティについて問われています。
ネットワークのセキュリティに関連する基本的な用語をおさえていれば、解答できる問題です。

では、選択肢についてみていきます。
選択肢aですが、SSL/TLSの説明です。SSL（Secure Sockets Layer）/TLS（Transport Layer Security）はインターネット上でデータを暗号化して送受信する標準的なプロトコルです。正確には、SSLの後継がTLSなのですが、SSLの知名度が高いため、SSL/TLSと併記されることがよくあります。よって、選択肢の内容は適切です。

選択肢bですが、IDSの説明です。IDS（Intrusion Detection System）とは、不正アクセスを監視する「侵入検知システム」のことであり、事前に設定した不正アクセス検出ルールに基づく事象を検知します。記述にあるようなデータを変換する仕組みではありません。よって、選択肢の内容は不適切です。

選択肢cですが、VPNの説明です。VPN（Virtual Private Network）は、インターネットのような不特定多数の利用者が存在するネットワーク上で、暗号技術や認証技術などを用いることによって仮想の専用線を構築し、安全に通信を行なう技術の総称です。よって選択肢の内容は適切です。

選択肢dですが、DMZの説明です。DMZ（DeMilitarized Zone：非武装地帯）とは、企業から見たネットワークの外部と内部の中間的な区域のことです。DMZを設けることで、万が一DMZに置かれているサーバに不正アクセスがあっても、企業内部まで被害が及ぶことが無くなります。記述の内容はDHCPプロトコルのものであり、DMZとは関連ありません。よって、選択肢の内容は不適切です。
以上より、選択肢aとcが適切なため、解答はイとなります。
今回出題された用語の他にも、ネットワークのセキュリティに関連する用語は多くあります。頻出の分野ですので、それぞれの特徴を整理して覚えるようにしましょう。`,
  },
  {
    id: 13,
    title: "情報セキュリティリスク対応",
    source: "令和4年　第17問",
    category: "security",
    question: `情報セキュリティマネジメントにおいては、情報セキュリティリスクアセスメントの結果に基づいて、リスク対応のプロセスを決定する必要がある。
リスク対応に関する記述とその用語の組み合わせとして、最も適切なものを下記の解答群から選べ。

ａ　リスクを伴う活動の停止やリスク要因の根本的排除により、当該リスクが発生しない状態にする。
ｂ　リスク要因の予防や被害拡大防止措置を講じることにより、当該リスクの発生確率や損失を減じる。
ｃ　リスクが受容可能な場合や対策費用が損害額を上回るような場合には、あえて何も対策を講じない。
ｄ　保険に加入したり、業務をアウトソーシングするなどして、他者との間でリスクを分散する。

〔解答群〕`,
    choices: [
      "ａ：リスク移転　ｂ：リスク低減　ｃ：リスク回避　ｄ：リスク保有",
      "ａ：リスク移転　ｂ：リスク保有　ｃ：リスク回避　ｄ：リスク低減",
      "ａ：リスク回避　ｂ：リスク移転　ｃ：リスク保有　ｄ：リスク低減",
      "ａ：リスク回避　ｂ：リスク低減　ｃ：リスク保有　ｄ：リスク移転",
      "ａ：リスク低減　ｂ：リスク回避　ｃ：リスク移転　ｄ：リスク保有",
    ],
    answer: 3,
    explanation: `本問は、情報セキュリティリスクアセスメントの結果に基づくリスク対応に関する問題です。
リスクアセスメントとは、守るべき対象である情報資産で発生する可能性のある脅威と、脅威の発生確率や発生した場合の影響度等を評価する方法のことです。評価の結果を踏まえてリスクに対応する方法を検討します。リスクの対応方法には、リスク回避、リスク低減、リスク移転、リスク保有があります。
リスク回避：リスク源を除去して、リスクの発現確率をゼロにすること
リスク低減：リスクの発生率または損失をできる限り小さくするように対策すること
リスク移転：リスクを別の組織体と共有することにより、影響を分散させること
リスク保有：発生頻度や損失が小さいリスクを許容範囲内のリスクとして受け入れること。リスクへの対応策にかかる費用と損失が見合わない場合などに選択する。
それでは、これらを踏まえて各記述を見ていきましょう。
記述ａは、リスク回避です。
記述ｂは、リスク低減です。
記述ｃは、リスク保有です。
記述ｄは、リスク移転です。
以上より、ａ：リスク回避　ｂ：リスク低減　ｃ：リスク保有　ｄ：リスク移転が最も適切な組み合わせであり、エが正解となります。`,
  },
  {
    id: 14,
    title: "他人受入率(FAR)と本人拒否率(FRR)",
    source: "平成29年　第22問",
    category: "security",
    question: `ATMを使った金融取引やPCへのログインの際など、本人確認のための生体認証技術が広く社会に普及している。認証の精度は、他人受入率(FAR：False Acceptance Rate)と本人拒否率(FRR：False Rejection Rate)によって決まる。この2つはトレードオフ関係にあり、一般に片方を低く抑えようとすると、もう片方は高くなる。
FARとFRRに関する以下の文章の空欄Ａ〜Ｄに入る語句の組み合わせとして、最も適切なものを下記の解答群から選べ。

ａ　（　Ａ　）が低いと安全性を重視したシステムになり、（　Ｂ　）が低いと利用者の利便性を重視したシステムになる。
ｂ　ATMでの生体認証では、（　Ｃ　）が十分低くなるように設定されている。
ｃ　なりすましを防止するには、（　Ｄ　）を低く抑えることに重点をおけばよい。

[解答群]`,
    choices: [
      "Ａ：FAR　Ｂ：FRR　Ｃ：FAR　Ｄ：FAR",
      "Ａ：FAR　Ｂ：FRR　Ｃ：FRR　Ｄ：FRR",
      "Ａ：FRR　Ｂ：FAR　Ｃ：FAR　Ｄ：FAR",
      "Ａ：FRR　Ｂ：FAR　Ｃ：FRR　Ｄ：FRR",
    ],
    answer: 0,
    explanation: `経営情報システムから、バイオメトリクス認証（生体認証）の他人受入率(FAR)と本人拒否率(FRR)に関する出題です。組み合わせを解答するタイプの問題となっています。他人受入率と本人拒否率という用語を、初めて聞いた方がほとんどだと思います。しかし、それらの用語を知らなかった方でも、注意深く設問を読むことにより、正解を判断することができる内容になっています。
まずは、他人受入率(FAR)と本人拒否率(FRR)について簡単に復習しておきましょう。
では、順番に記述を見ていきましょう。

空欄Ａは、安全性を重視したシステムとなる条件について問われています。安全性を高めるためには、他人を受け入れてしまう確率を低くする必要があります。そのため、空欄Ａは、他人受入率(FAR)が正解となります。
空欄Ｂは、利便性を重視したシステムとなる条件について問われています。利便性を高めるためには、本人を拒否する確率を低くする必要があります。そのため、空欄Ｂは、本人拒否率(FRR)が正解となります。
空欄Ｃは、ATMの生体認証で重視している要素について問われています。ATMでは、他人を受け入れてしまうと金銭的な被害が広がってしまうため、利便性より安全性が重視されます。つまり、他人受入率(FAR)が十分低いことが求められます。したがって、空欄Ｃは、他人受入率(FAR)が正解となります。
空欄Ｄは、なりすましを防止する対策について問われています。なりすましを防止するためには、他人を受け入れてしまう確率を低くする必要があります。したがって、空欄Ｄは、他人受入率(FAR)が正解となります。
以上より、アが正解となります。
本問は、聞きなれない用語が出題されたものの、文意をよく理解することにより、正解を導き出せる問題でした。このような問題は他にも散見されるため、初めて見る用語が出題された場合においても、落ち着いて取り組むようにしましょう。`,
  },
];

const TOTAL = QUESTIONS.length;

const CAT_LABEL = { network: "ネットワーク", security: "セキュリティ" };

// ===================================================================
// 永続化ヘルパー（Firestore優先・LocalStorageフォールバック）
// ===================================================================
const lsKey = (userId) => `${APP_ID}__${userId}`;

function loadLocal(userId) {
  try {
    const raw = localStorage.getItem(lsKey(userId));
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("[LocalStorage] 読み込み失敗", e);
    return null;
  }
}

function saveLocal(userId, data) {
  try {
    localStorage.setItem(lsKey(userId), JSON.stringify(data));
  } catch (e) {
    console.warn("[LocalStorage] 保存失敗", e);
  }
}

// ===================================================================
// メインコンポーネント
// ===================================================================
export default function App() {
  // 認証・初期化
  const [authReady, setAuthReady] = useState(false);

  // 画面：login / dashboard / quiz / result
  const [screen, setScreen] = useState("login");
  const screenRef = useRef(screen);
  useEffect(() => {
    screenRef.current = screen;
  }, [screen]);

  // ユーザー識別（合言葉）
  const [inputId, setInputId] = useState("");
  const [userId, setUserId] = useState("");

  // 学習データ
  const [history, setHistory] = useState({}); // { [id]: { correct, answeredAt } }
  const [reviews, setReviews] = useState({}); // { [id]: true }
  const [progressIndex, setProgressIndex] = useState(0);
  const [progressMode, setProgressMode] = useState("all");

  // 途中再開モーダル
  const isFirstLoad = useRef(true);
  const [showResumeModal, setShowResumeModal] = useState(false);
  const [pendingProgress, setPendingProgress] = useState(null);

  // クイズ進行
  const [mode, setMode] = useState("all"); // all / wrong / review
  const [quizList, setQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selected, setSelected] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);

  // --- 匿名認証（Firestoreアクセス前に必ず実行） ---
  // 【重要】認証成功は「通信できる状態になっただけ」。これだけではログイン扱いにしない。
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (auth) {
        try {
          await signInAnonymously(auth);
          console.log("[Auth] 匿名サインイン成功（※まだログイン未完了。合言葉入力を待つ）");
        } catch (e) {
          console.warn("[Auth] 匿名サインイン失敗。LocalStorageで動作します。", e);
        }
      }
      if (mounted) {
        setAuthReady(true);
        console.log("[Init] 初期化完了（authReady=true / 画面はloginのまま）");
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // --- userId 変更時に再開判定フラグをリセット ---
  useEffect(() => {
    isFirstLoad.current = true;
  }, [userId]);

  // --- データ購読（Firestore onSnapshot / LocalStorageフォールバック） ---
  useEffect(() => {
    if (!userId) return;

    const applyData = (data, allowResumeTrigger) => {
      const parsed = {
        progressIndex: Number(data?.progressIndex || 0),
        progressMode: data?.progressMode || "all",
        history: data?.history || {},
        reviews: data?.reviews || {},
      };
      setHistory(parsed.history);
      setReviews(parsed.reviews);
      setProgressIndex(parsed.progressIndex);
      setProgressMode(parsed.progressMode);
      console.log("[Sync] データ受信", { progressIndex: parsed.progressIndex, progressMode: parsed.progressMode });

      // 【ガードレール】初回ロード判定 かつ 画面がダッシュボードのときのみ途中再開モーダルをトリガー。
      // これによりクイズ解答中のonSnapshot受信で再開ダイアログが誤って割り込むのを完全に防ぐ。
      if (allowResumeTrigger && isFirstLoad.current && screenRef.current === "dashboard") {
        isFirstLoad.current = false;
        if (parsed.progressIndex > 0) {
          setPendingProgress(parsed);
          setShowResumeModal(true);
          console.log("[Resume] 途中再開モーダルを表示", parsed.progressIndex);
        }
      }
    };

    if (db && auth?.currentUser) {
      const docRef = doc(db, "artifacts", APP_ID, "users", userId);
      const unsubscribe = onSnapshot(
        docRef,
        (snapshot) => {
          try {
            const data = snapshot.exists() ? snapshot.data() : {};
            applyData(data, true);
          } catch (e) {
            console.warn("[Sync] スナップショット処理エラー。フォールバックします。", e);
            applyData(loadLocal(userId) || {}, true);
          }
        },
        (err) => {
          console.warn("[Sync] onSnapshotエラー。LocalStorageで継続します。", err);
          applyData(loadLocal(userId) || {}, true);
        }
      );
      return () => unsubscribe();
    } else {
      // Firestore未使用：LocalStorageから一度だけ読み込み
      applyData(loadLocal(userId) || {}, true);
    }
  }, [userId]);

  // --- 永続化（Firestore + LocalStorage 両方へ） ---
  const persist = useCallback(
    async (next) => {
      if (!userId) return;
      const merged = {
        history: next.history ?? history,
        reviews: next.reviews ?? reviews,
        progressIndex: next.progressIndex ?? progressIndex,
        progressMode: next.progressMode ?? progressMode,
        updatedAt: new Date().toISOString(),
      };
      saveLocal(userId, merged);
      if (db && auth?.currentUser) {
        try {
          const docRef = doc(db, "artifacts", APP_ID, "users", userId);
          await setDoc(docRef, merged, { merge: true });
          console.log("[Save] Firestoreへ保存", { progressIndex: merged.progressIndex, progressMode: merged.progressMode });
        } catch (e) {
          console.warn("[Save] Firestore保存失敗。LocalStorageのみ保持します。", e);
        }
      }
    },
    [userId, history, reviews, progressIndex, progressMode]
  );

  // --- 合言葉ログイン（Firestoreからの復元完了をもってログイン完了とする） ---
  const handleLogin = (e) => {
    e?.preventDefault();
    const id = inputId.trim();
    if (!id) return;
    setUserId(id);
    setScreen("dashboard");
    console.log("[Login] 合言葉でログイン:", id);
  };

  // --- モードに応じた問題リストを構築 ---
  const buildList = useCallback(
    (m, hist, rev) => {
      const h = hist ?? history;
      const r = rev ?? reviews;
      if (m === "wrong") {
        return QUESTIONS.filter((q) => h?.[q.id] && h[q.id].correct === false);
      }
      if (m === "review") {
        return QUESTIONS.filter((q) => r?.[q.id] === true);
      }
      return QUESTIONS;
    },
    [history, reviews]
  );

  // --- クイズ開始 ---
  const startQuiz = (m, startIndex = 0) => {
    const list = buildList(m);
    if (list.length === 0) {
      alert(
        m === "wrong"
          ? "前回不正解の問題はありません。"
          : m === "review"
          ? "要復習に登録された問題はありません。"
          : "問題がありません。"
      );
      return;
    }
    const safeIndex = Math.min(startIndex, list.length - 1);
    setMode(m);
    setQuizList(list);
    setCurrentIndex(safeIndex);
    setSelected(null);
    setIsAnswered(false);
    setScreen("quiz");
    console.log("[Quiz] 出題開始", { mode: m, startIndex: safeIndex, count: list.length });
  };

  // --- 途中再開 ---
  const handleResume = () => {
    const p = pendingProgress;
    setShowResumeModal(false);
    if (!p) return;
    console.log("[Resume] 続きから再開", { mode: p.progressMode, index: p.progressIndex });
    startQuiz(p.progressMode || "all", p.progressIndex || 0);
  };

  const handleRestart = () => {
    setShowResumeModal(false);
    setProgressIndex(0);
    persist({ progressIndex: 0 });
    console.log("[Resume] 進捗をリセットして最初から");
  };

  // --- 解答 ---
  const handleAnswer = (choiceIdx) => {
    if (isAnswered) return;
    const q = quizList[currentIndex];
    if (!q) return;
    const correct = choiceIdx === q.answer;
    setSelected(choiceIdx);
    setIsAnswered(true);

    const newHistory = {
      ...history,
      [q.id]: { correct, answeredAt: new Date().toISOString() },
    };
    setHistory(newHistory);
    // 現在の進捗位置とモードを保存（正解・不正解を問わず）
    persist({ history: newHistory, progressIndex: currentIndex, progressMode: mode });
    console.log("[Answer] 解答保存", { id: q.id, correct, progressIndex: currentIndex });
  };

  // --- 要復習トグル ---
  const toggleReview = () => {
    const q = quizList[currentIndex];
    if (!q) return;
    const cur = reviews?.[q.id] === true;
    const newReviews = { ...reviews, [q.id]: !cur };
    if (!newReviews[q.id]) delete newReviews[q.id];
    setReviews(newReviews);
    persist({ reviews: newReviews });
    console.log("[Review] 要復習トグル", { id: q.id, value: !cur });
  };

  // --- 次の問題へ ---
  const handleNext = () => {
    const nextIdx = currentIndex + 1;
    if (nextIdx >= quizList.length) {
      // 全問完走 → progressIndex を 0 にリセット
      setProgressIndex(0);
      persist({ progressIndex: 0 });
      setScreen("result");
      console.log("[Quiz] 全問完走。progressIndexを0にリセット");
      return;
    }
    setCurrentIndex(nextIdx);
    setSelected(null);
    setIsAnswered(false);
    persist({ progressIndex: nextIdx, progressMode: mode });
    console.log("[Quiz] 次の問題へ", nextIdx);
  };

  // --- ホームに戻る（その時点の進捗を即書き込み） ---
  const goHome = () => {
    if (screen === "quiz") {
      persist({ progressIndex: currentIndex, progressMode: mode });
      console.log("[Nav] ホームへ。進捗を保存", currentIndex);
    }
    setSelected(null);
    setIsAnswered(false);
    setScreen("dashboard");
  };

  // ===== レンダリング =====

  // 初期ローディング（Auth完了まで真っ白を防ぐ）
  if (!authReady) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-300">
        <RefreshCw className="animate-spin text-indigo-400 mb-4" size={40} />
        <p className="text-sm tracking-wide">Loading...</p>
      </div>
    );
  }

  // 【厳格な分離】合言葉ログインが完了するまではダッシュボード等を一切描画しない
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
      <div className="mx-auto max-w-3xl px-4 py-6">
        {screen === "login" && (
          <LoginScreen inputId={inputId} setInputId={setInputId} onSubmit={handleLogin} />
        )}

        {screen === "dashboard" && (
          <Dashboard
            userId={userId}
            history={history}
            reviews={reviews}
            onStart={startQuiz}
            onLogout={() => {
              setUserId("");
              setHistory({});
              setReviews({});
              setProgressIndex(0);
              setScreen("login");
            }}
          />
        )}

        {screen === "quiz" && quizList[currentIndex] && (
          <QuizScreen
            q={quizList[currentIndex]}
            index={currentIndex}
            total={quizList.length}
            selected={selected}
            isAnswered={isAnswered}
            onAnswer={handleAnswer}
            onNext={handleNext}
            onHome={goHome}
            isReview={reviews?.[quizList[currentIndex].id] === true}
            onToggleReview={toggleReview}
          />
        )}

        {screen === "result" && (
          <ResultScreen
            quizList={quizList}
            history={history}
            onHome={goHome}
            onRetry={() => startQuiz(mode, 0)}
          />
        )}
      </div>

      {/* 途中再開モーダル */}
      {showResumeModal && pendingProgress && (
        <ResumeModal
          progress={pendingProgress}
          onResume={handleResume}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}

// ===================================================================
// 画面：ログイン（合言葉）
// ===================================================================
function LoginScreen({ inputId, setInputId, onSubmit }) {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 shadow-2xl backdrop-blur">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg shadow-indigo-900/40">
            <BookOpen className="text-white" size={28} />
          </div>
          <h1 className="text-xl font-bold text-white">{APP_TITLE}</h1>
          <p className="mt-1 text-sm text-indigo-300">{SOURCE_LABEL}</p>
        </div>

        <form onSubmit={onSubmit}>
          <label className="mb-2 flex items-center gap-2 text-sm font-medium text-slate-300">
            <User size={16} /> 合言葉（ユーザーID）
          </label>
          <input
            type="text"
            value={inputId}
            onChange={(e) => setInputId(e.target.value)}
            placeholder="例: my-study-key-2026"
            className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm text-white placeholder-slate-500 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/30"
          />
          <p className="mt-2 text-xs text-slate-500">
            同じ合言葉を入力すれば、PCとスマホで学習履歴・進捗が同期されます。
          </p>
          <button
            type="submit"
            disabled={!inputId.trim()}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:scale-[1.01] hover:shadow-indigo-700/50 disabled:opacity-40 disabled:hover:scale-100"
          >
            学習を始める <ArrowRight size={16} />
          </button>
        </form>
      </div>
    </div>
  );
}

// ===================================================================
// 画面：ダッシュボード
// ===================================================================
function Dashboard({ userId, history, reviews, onStart, onLogout }) {
  const answered = QUESTIONS.filter((q) => history?.[q.id]).length;
  const correct = QUESTIONS.filter((q) => history?.[q.id]?.correct === true).length;
  const wrong = QUESTIONS.filter((q) => history?.[q.id]?.correct === false).length;
  const reviewCount = QUESTIONS.filter((q) => reviews?.[q.id] === true).length;

  const accuracy = answered > 0 ? Math.round((correct / answered) * 100) : 0;
  const progressRate = Math.round((answered / TOTAL) * 100);

  const catProgress = (cat) => {
    const list = QUESTIONS.filter((q) => q.category === cat);
    const done = list.filter((q) => history?.[q.id]).length;
    return list.length ? Math.round((done / list.length) * 100) : 0;
  };
  const catAccuracy = (cat) => {
    const list = QUESTIONS.filter((q) => q.category === cat && history?.[q.id]);
    const ok = list.filter((q) => history[q.id].correct).length;
    return list.length ? Math.round((ok / list.length) * 100) : 0;
  };

  const radarData = [
    { metric: "総合進捗率", value: progressRate },
    { metric: "回答正確性", value: accuracy },
    { metric: "ネット進捗", value: catProgress("network") },
    { metric: "セキュ進捗", value: catProgress("security") },
    { metric: "セキュ正答率", value: catAccuracy("security") },
  ];

  return (
    <div>
      {/* ヘッダー */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-bold text-white">{APP_TITLE}</h1>
          <p className="text-xs text-indigo-300">{SOURCE_LABEL}</p>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600"
        >
          <User size={14} /> {userId}
        </button>
      </div>

      {/* 統計カード */}
      <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard label="進捗" value={`${answered}/${TOTAL}`} accent="indigo" />
        <StatCard label="正答率" value={`${accuracy}%`} accent="sky" />
        <StatCard label="不正解" value={wrong} accent="rose" />
        <StatCard label="要復習" value={reviewCount} accent="amber" />
      </div>

      {/* レーダーチャート */}
      <div className="mb-6 rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-2 flex items-center gap-2 text-sm font-bold text-slate-200">
          <BarChart2 size={16} className="text-sky-400" /> 学習バランス
        </h2>
        <div className="h-56 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData} outerRadius="70%">
              <PolarGrid stroke="#334155" />
              <PolarAngleAxis dataKey="metric" tick={{ fill: "#94a3b8", fontSize: 11 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fill: "#475569", fontSize: 9 }} axisLine={false} />
              <Radar name="達成度" dataKey="value" stroke="#6366f1" fill="#6366f1" fillOpacity={0.45} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* モード選択 */}
      <div className="mb-6 space-y-3">
        <ModeButton
          icon={<BookOpen size={18} />}
          title="すべての問題"
          desc={`全${TOTAL}問を順番に演習`}
          onClick={() => onStart("all", 0)}
        />
        <ModeButton
          icon={<RefreshCw size={18} />}
          title="前回不正解の問題のみ"
          desc={`${wrong}問が対象`}
          onClick={() => onStart("wrong", 0)}
          disabled={wrong === 0}
        />
        <ModeButton
          icon={<HelpCircle size={18} />}
          title="要復習の問題のみ"
          desc={`${reviewCount}問が対象`}
          onClick={() => onStart("review", 0)}
          disabled={reviewCount === 0}
        />
      </div>

      {/* 履歴一覧（グリッド俯瞰） */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
        <h2 className="mb-3 flex items-center gap-2 text-sm font-bold text-slate-200">
          <BarChart2 size={16} className="text-indigo-400" /> 解答状況一覧
        </h2>
        <div className="grid grid-cols-1 gap-2">
          {QUESTIONS.map((q) => {
            const h = history?.[q.id];
            const st = !h ? "未着手" : h.correct ? "正解" : "不正解";
            const stColor = !h
              ? "text-slate-500 border-slate-700"
              : h.correct
              ? "text-emerald-300 border-emerald-700/50 bg-emerald-500/10"
              : "text-rose-300 border-rose-700/50 bg-rose-500/10";
            const dt = h?.answeredAt
              ? new Date(h.answeredAt).toLocaleString("ja-JP", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })
              : "-";
            return (
              <div
                key={q.id}
                className="flex items-center gap-3 rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
              >
                <span className="w-6 shrink-0 text-center text-xs font-bold text-slate-400">{q.id}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-200">{q.title}</p>
                  <p className="truncate text-[10px] text-slate-500">{CAT_LABEL[q.category]}・{q.source}</p>
                </div>
                {reviews?.[q.id] && (
                  <span className="shrink-0 rounded border border-amber-600/50 bg-amber-500/10 px-1.5 py-0.5 text-[10px] text-amber-300">復習</span>
                )}
                <span className={`shrink-0 rounded border px-2 py-0.5 text-[10px] font-bold ${stColor}`}>{st}</span>
                <span className="hidden shrink-0 text-[10px] text-slate-500 sm:block">{dt}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function StatCard({ label, value, accent }) {
  const colors = {
    indigo: "from-indigo-600/20 to-indigo-500/5 border-indigo-700/40 text-indigo-200",
    sky: "from-sky-600/20 to-sky-500/5 border-sky-700/40 text-sky-200",
    rose: "from-rose-600/20 to-rose-500/5 border-rose-700/40 text-rose-200",
    amber: "from-amber-600/20 to-amber-500/5 border-amber-700/40 text-amber-200",
  };
  return (
    <div className={`rounded-xl border bg-gradient-to-br p-3 ${colors[accent]}`}>
      <p className="text-[11px] opacity-80">{label}</p>
      <p className="mt-1 text-xl font-bold text-white">{value}</p>
    </div>
  );
}

function ModeButton({ icon, title, desc, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="group flex w-full items-center gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 px-5 py-4 text-left transition hover:scale-[1.01] hover:border-indigo-600/60 hover:shadow-lg hover:shadow-indigo-900/30 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 disabled:hover:border-slate-800"
    >
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500 text-white shadow-md">
        {icon}
      </div>
      <div className="flex-1">
        <p className="font-bold text-white">{title}</p>
        <p className="text-xs text-slate-400">{desc}</p>
      </div>
      <ChevronRight className="text-slate-600 transition group-hover:translate-x-1 group-hover:text-indigo-400" size={20} />
    </button>
  );
}

// ===================================================================
// 画面：出題・解答・解説
// ===================================================================
function QuizScreen({ q, index, total, selected, isAnswered, onAnswer, onNext, onHome, isReview, onToggleReview }) {
  const correct = isAnswered && selected === q.answer;

  return (
    <div>
      {/* 上部バー */}
      <div className="mb-4 flex items-center justify-between">
        <button
          onClick={onHome}
          className="flex items-center gap-1 rounded-lg border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs text-slate-300 transition hover:border-slate-600"
        >
          <Home size={14} /> ホーム
        </button>
        <span className="text-xs text-slate-400">
          {index + 1} / {total} 問
        </span>
      </div>

      {/* 進捗バー */}
      <div className="mb-5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
        <div
          className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-sky-400 transition-all"
          style={{ width: `${((index + 1) / total) * 100}%` }}
        />
      </div>

      {/* 問題カード */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-lg bg-gradient-to-r from-indigo-600 to-sky-500 px-2.5 py-1 text-[11px] font-bold text-white">
            {SECTION_BADGE}
          </span>
          <span className="rounded-lg border border-sky-600/50 bg-sky-500/10 px-2.5 py-1 text-[11px] font-bold text-sky-200">
            {q.source}
          </span>
          <span className="rounded-lg border border-slate-700 bg-slate-950 px-2.5 py-1 text-[11px] text-slate-300">
            問題 {q.id}：{q.title}
          </span>
        </div>

        <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-100">{q.question}</p>

        {/* 問題画面の図表（解答漏洩しない与条件のみ） */}
        {renderFigures(q.id, "problem")}

        {/* 選択肢 */}
        <div className="mt-4 space-y-2.5">
          {q.choices.map((c, i) => {
            let cls =
              "border-slate-700 bg-slate-950/60 hover:border-indigo-600/60 hover:bg-slate-900";
            if (isAnswered) {
              if (i === q.answer) {
                cls = "border-emerald-500/70 bg-emerald-500/10";
              } else if (i === selected) {
                cls = "border-rose-500/70 bg-rose-500/10";
              } else {
                cls = "border-slate-800 bg-slate-950/40 opacity-60";
              }
            }
            return (
              <button
                key={i}
                onClick={() => onAnswer(i)}
                disabled={isAnswered}
                className={`flex w-full items-start gap-3 rounded-xl border px-4 py-3 text-left text-sm transition ${cls} ${
                  !isAnswered ? "hover:scale-[1.005]" : "cursor-default"
                }`}
              >
                <span
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                    isAnswered && i === q.answer
                      ? "bg-emerald-500 text-white"
                      : isAnswered && i === selected
                      ? "bg-rose-500 text-white"
                      : "bg-slate-800 text-slate-300"
                  }`}
                >
                  {CHOICE_LABELS[i]}
                </span>
                <span className="flex-1 text-slate-100">{c}</span>
                {isAnswered && i === q.answer && <Check size={18} className="mt-0.5 shrink-0 text-emerald-400" />}
                {isAnswered && i === selected && i !== q.answer && <X size={18} className="mt-0.5 shrink-0 text-rose-400" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* 解説エリア */}
      {isAnswered && (
        <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 shadow-xl">
          <div
            className={`mb-3 flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-bold ${
              correct
                ? "bg-emerald-500/15 text-emerald-300"
                : "bg-rose-500/15 text-rose-300"
            }`}
          >
            {correct ? <Check size={18} /> : <X size={18} />}
            {correct ? "正解！" : "不正解"}
            <span className="ml-auto text-slate-300">
              正解：{CHOICE_LABELS[q.answer]}
            </span>
          </div>

          {/* 要復習チェック */}
          <label className="mb-4 flex cursor-pointer select-none items-center gap-2 rounded-xl border border-slate-700 bg-slate-950/50 px-4 py-3 text-sm text-slate-200 transition hover:border-amber-600/50">
            <input
              type="checkbox"
              checked={isReview}
              onChange={onToggleReview}
              className="h-4 w-4 accent-amber-500"
            />
            <HelpCircle size={16} className="text-amber-400" />
            要復習リストに登録する
          </label>

          {/* 解説用の図表（解答後にのみ表示） */}
          {renderFigures(q.id, "explanation")}

          <h3 className="mb-2 flex items-center gap-2 text-sm font-bold text-sky-300">
            <BookOpen size={16} /> 解説
          </h3>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">{q.explanation}</p>

          <button
            onClick={onNext}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-900/40 transition hover:scale-[1.01]"
          >
            {index + 1 >= total ? "結果を見る" : "次の問題へ"} <ArrowRight size={16} />
          </button>
        </div>
      )}
    </div>
  );
}

// ===================================================================
// 画面：結果
// ===================================================================
function ResultScreen({ quizList, history, onHome, onRetry }) {
  const total = quizList.length;
  const correct = quizList.filter((q) => history?.[q.id]?.correct === true).length;
  const rate = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900/60 p-8 text-center shadow-2xl">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 shadow-lg">
          <Check className="text-white" size={32} />
        </div>
        <h1 className="text-xl font-bold text-white">演習完了！</h1>
        <p className="mt-1 text-sm text-slate-400">お疲れさまでした。</p>

        <div className="my-6 rounded-2xl border border-slate-800 bg-slate-950/60 p-6">
          <p className="text-sm text-slate-400">正答数</p>
          <p className="mt-1 text-4xl font-bold text-white">
            {correct}
            <span className="text-lg text-slate-500"> / {total}</span>
          </p>
          <p className="mt-2 text-2xl font-bold text-sky-300">{rate}%</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={onRetry}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01]"
          >
            <RefreshCw size={16} /> もう一度挑戦する
          </button>
          <button
            onClick={onHome}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600"
          >
            <Home size={16} /> ホームに戻る
          </button>
        </div>
      </div>
    </div>
  );
}

// ===================================================================
// 途中再開モーダル
// ===================================================================
function ResumeModal({ progress, onResume, onRestart }) {
  const modeLabel =
    progress.progressMode === "wrong"
      ? "前回不正解"
      : progress.progressMode === "review"
      ? "要復習"
      : "すべての問題";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-600 to-sky-500">
          <RefreshCw className="text-white" size={24} />
        </div>
        <h2 className="text-center text-lg font-bold text-white">中断した続きがあります</h2>
        <p className="mt-3 text-center text-sm leading-relaxed text-slate-300">
          前回は【問題{(progress.progressIndex || 0) + 1}】まで進んでいます。
          <br />
          中断したモード（<span className="font-bold text-sky-300">{modeLabel}</span>モード）の続きから再開しますか？
        </p>
        <div className="mt-6 space-y-3">
          <button
            onClick={onResume}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-sky-500 px-4 py-3 text-sm font-bold text-white shadow-lg transition hover:scale-[1.01]"
          >
            続きから再開する <ArrowRight size={16} />
          </button>
          <button
            onClick={onRestart}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-600"
          >
            最初から始める
          </button>
        </div>
      </div>
    </div>
  );
}