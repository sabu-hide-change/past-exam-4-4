// npm install lucide-react recharts firebase

import React, { useState, useEffect } from 'react';
import { Check, X, Home, ChevronRight, AlertCircle, BarChart, LogOut, RefreshCcw, Bookmark } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { initializeApp } from 'firebase/app';
import { getFirestore, doc, setDoc, getDoc } from 'firebase/firestore';

// ==========================================
// Firebase Configuration (ダミー値。本番環境に合わせて書き換えてください)
// ==========================================
const firebaseConfig = {
  apiKey: "AIzaSyCyo4bAZwqaN2V0g91DehS6mHmjZD5XJTc",
  authDomain: "sabu-hide-web-app.firebaseapp.com",
  projectId: "sabu-hide-web-app",
  storageBucket: "sabu-hide-web-app.firebasestorage.app",
  messagingSenderId: "145944786114",
  appId: "1:145944786114:web:0da0c2d87a9e24ca6cf75b",
  measurementId: "G-XSS72H1ZKV"
};

let app;
let db;
try {
  app = initializeApp(firebaseConfig);
  db = getFirestore(app);
} catch (error) {
  console.error("Firebase initialization error:", error);
}

const APP_ID = "past-exam-4-4"; // アプリ固有のID

// ==========================================
// Quiz Data
// ==========================================
const quizData = [
  {
    id: 1,
    title: "インターネットの仕組み",
    year: "令和元年 第8問",
    question: "中小企業診断士のあなたは、あるメールを開封したところ、次のような URL に接続するように指示が出てきた。\nhttps://News.Fishing.jp/test\nこの URL から分かることとして、最も適切なものはどれか。",
    options: [
      "ア　SSL を用いて暗号化されたデータ通信であることが確認できる。",
      "イ　大文字と小文字を入れ替えた偽サイトであることが確認できる。",
      "ウ　参照先ホストのサーバが日本国内に設置されていることが確認できる。",
      "エ　ホスト名の WWW が省略されていることが確認できる。"
    ],
    answer: 0,
    explanation: [
      "解答：ア",
      "本問では、URLの表記とSSLについて問われています。",
      "【URLとSSL】",
      "・URL (Uniform Resource Locator): インターネット上の情報資源（サーバやファイルなど）がある場所を示すもの。「インターネット上の住所」を表す。",
      "・SSL (Secure Socket Layer): インターネット上で、データを暗号化して送受信するためのプロトコル。Webページのデータを暗号化して送信できる。ネットショップの決済ページなどで良く使用される。",
      "選択肢ア：SSLを使ったWebページのURLの先頭は「https:」と表記される。設問のURLはSSLを使って暗号化されたデータ通信であることが確認できるため適切。",
      "選択肢イ：「News.Fishing.jp」はドメイン名であり、大文字と小文字を区別しないため偽サイトであるとは確認できない。不適切。",
      "選択肢ウ：「jp」は国別のトップレベルドメインだが、参照先ホストのサーバが日本国内に設置されているかは分からない。不適切。",
      "選択肢エ：ホスト名のWWWを付与するかどうかは管理者が自由に決めることができるため、省略されているとは言えない。不適切。"
    ]
  },
  {
    id: 2,
    title: "インターネットの機能",
    year: "平成23年 第12問",
    question: "インターネットにおいて、以下のａ～ｃの記述内容とそれを提供する機能や機器名称の組み合わせとして、最も適切なものを下記の解答群から選べ。\nａ ドメイン名・ホスト名とIPアドレスを対応付ける機能を持ち、Webクライアントからのアドレス指定の際の問い合わせなどに答える。\nｂ 事務所内のLANにPCが接続された時、当該PCが使用するIPアドレスを割り当てる。\nｃ グローバルIPアドレスと事務所内のプライベートIPアドレスの交換を行う。",
    options: [
      "ア　ａ：DHCP　ｂ：NAT　ｃ：VPN",
      "イ　ａ：DNS　ｂ：DHCP　ｃ：NAT",
      "ウ　ａ：NAT　ｂ：ブロードバンドルータ　ｃ：プロキシサーバ",
      "エ　ａ：VPN　ｂ：プロキシサーバ　ｃ：DNS"
    ],
    answer: 1,
    explanation: [
      "解答：イ",
      "ａはDNSに関する記述です。DNSはドメイン名からIPアドレスを変換するシステムです。",
      "ｂはDHCPに関する記述です。DHCPはネットワークに接続するコンピュータにIPアドレスなどを自動的に割り当てるプロトコルです。",
      "ｃはNATに関する記述です。NATはプライベートIPアドレスとグローバルIPアドレスを1対1で変換する機能です。",
      "【補足】",
      "・VPN: 仮想の専用線を構築し安全に通信を行なう技術の総称。",
      "・ブロードバンドルータ: インターネットとLANなどを接続する機器。",
      "・プロキシサーバ: アプリケーションゲートウェイとして、不正なデータの中継を防ぐサーバ。"
    ]
  },
  {
    id: 3,
    title: "プロトコル",
    year: "平成30年 第9問",
    question: "通信プロトコルに関する以下の①～④の記述と、それらに対応する用語の組み合わせとして、最も適切なものを選べ。\n①クライアントからサーバにメールを送信したり、サーバ間でメールを転送したりするために用いられる。\n②ネットワークに接続する機器に IPアドレスなどを自動的に割り当てるために用いられる。\n③ネットワークに接続されている機器の情報を収集し、監視や制御を行うために用いられる。\n④ネットワークに接続されている機器の内部時計を協定世界時に同期するために用いられる。",
    options: [
      "ア　①：IMAP　②：DHCP　③：PPP　④：NTP",
      "イ　①：IMAP　②：FTP　③：SNMP　④：SOAP",
      "ウ　①：SMTP　②：DHCP　③：SNMP　④：NTP",
      "エ　①：SMTP　②：FTP　③：PPP　④：SOAP"
    ],
    answer: 2,
    explanation: [
      "解答：ウ",
      "① SMTPは電子メールの送信に使われるプロトコルです。（IMAPは受信）",
      "② DHCPはIPアドレスなどを自動的に割り当てるプロトコルです。",
      "③ SNMPはネットワーク機器の情報を収集し監視・制御を行うプロトコルです。",
      "④ NTPは機器の内部時計を正しい時刻に同期するためのプロトコルです。"
    ]
  },
  {
    id: 4,
    title: "情報システムのセキュリティ",
    year: "平成24年 第22問",
    question: "情報セキュリティにかかわる記述として最も適切なものはどれか。",
    options: [
      "ア　インターネットを介して、顧客情報を収集してそれをデータベース化した場合、それが漏洩しないようにするにはウイルス対策を行えばよい。",
      "イ　インターネットを介して、顧客に送り先等の他に年齢、家族構成などを入力してもらう場合、その用途については顧客に知らせる必要はない。",
      "ウ　取引企業、顧客との情報のやりとりは、暗号化することが好ましいが、その場合に用いる公開鍵暗号方式とは、関係者の間で共通鍵を設定して、情報を暗号化する方式である。",
      "エ　ファイアウォールを自社コンピュータに対する不正アクセスの防止手段として利用する場合、どのような内容のアクセスを拒否するのかをあらかじめ設定する必要がある。"
    ],
    answer: 3,
    explanation: [
      "解答：エ",
      "ア：データベースの情報漏洩はウイルス対策だけでは防げません。アクセス権限の設定などが必要です。不適切。",
      "イ：個人情報保護法により、個人情報を取得する場合は利用目的を明示する必要があります。不適切。",
      "ウ：公開鍵暗号方式は暗号化と復号化の鍵が異なる方式です。共通鍵を設定するのは共通鍵暗号方式（秘密鍵暗号方式）です。不適切。",
      "エ：ファイアウォールのパケットフィルタリングでは、事前に通してよい・拒否するパケットの情報を設定する必要があります。適切。"
    ]
  },
  {
    id: 5,
    title: "セキュリティポリシー",
    year: "令和3年 第21問",
    question: "ゼロトラストに関する記述として、最も適切なものはどれか。",
    options: [
      "ア　組織内において情報セキュリティインシデントを引き起こす可能性のある利用者を早期に特定し教育することで、インシデント発生を未然に防ぐ。",
      "イ　通信データを暗号化して外部の侵入を防ぐ VPN 機器を撤廃し、認証の強化と認可の動的管理に集中する。",
      "ウ　利用者と機器を信頼せず、認証を強化するとともに組織が管理する機器のみを構成員に利用させる。",
      "エ　利用者も機器もネットワーク環境も信頼せず、情報資産へのアクセス者を厳格に認証し、常に確認する。",
      "オ　利用者を信頼しないという考え方に基づき認証を重視するが、一度許可されたアクセス権は制限しない。"
    ],
    answer: 3,
    explanation: [
      "解答：エ",
      "【ゼロトラスト】「何も信頼しない」前提でセキュリティ対策を講じる考え方。内部・外部を問わずすべてのアクセスに対し対策（暗号化、ユーザ認証強化、ログ監視等）を行う。",
      "ア：利用者を教育して防ぐ考え方ではありません。不適切。",
      "イ：VPN機器の撤廃を進めるものではありません。不適切。",
      "ウ：組織が管理する機器のみを利用させるという制限を設けるものではありません。不適切。",
      "エ：利用者も機器も環境も信頼せず、厳格に認証し常に確認します。適切。",
      "オ：一度認証が許可された後でも継続して認証を行います。不適切。"
    ]
  },
  {
    id: 6,
    title: "ソーシャルエンジニアリング",
    year: "平成30年 第23問",
    question: "機密情報を不正に入手する手法であるソーシャルエンジニアリングに関する記述として、最も不適切なものはどれか。",
    options: [
      "ア　シュレッダーで処理された紙片をつなぎ合わせて、パスワードを取得する。",
      "イ　パソコンの操作画面を盗み見して、パスワードを取得する。",
      "ウ　文字列の組み合わせを機械的かつ総当たり的に試すことで、パスワードを取得する。",
      "エ　ユーザになりすまして管理者に電話し、パスワードを取得する。"
    ],
    answer: 2,
    explanation: [
      "解答：ウ",
      "ソーシャルエンジニアリングは、人間の不注意につけこんだり盗み見を利用したりする、非技術的な情報入手手口です。",
      "ア、イ、エは非技術的な手口であり、ソーシャルエンジニアリングに該当します。",
      "ウの「文字列の組み合わせを機械的かつ総当たり的に試す」のは「総当たり攻撃」と呼ばれるコンピュータを使った技術的手法であり、ソーシャルエンジニアリングではありません。したがってこれが不適切であり正解です。"
    ]
  },
  {
    id: 7,
    title: "テレワークセキュリティガイドライン",
    year: "令和3年 第25問",
    question: "「テレワークセキュリティガイドライン第5版」におけるテレワーク方式の分類に関する記述として、最も適切なものはどれか。",
    options: [
      "ア　「VPN」方式とは、テレワーク端末からVDI上のデスクトップ環境に接続を行い、そのデスクトップ環境を遠隔操作して業務を行う方法である。",
      "イ　「仮想デスクトップ」方式とは、テレワーク端末からオフィスネットワークに対してVPN接続を行い、その VPN を介してオフィスのサーバ等に接続し業務を行う方法である。",
      "ウ　「セキュアコンテナ」方式とは、テレワーク端末にファイアウォールで保護された仮想的なWeb 環境を設け、その環境内でアプリケーションを動かし業務を行う方法である。",
      "エ　「セキュアブラウザ」方式とは、テレワーク端末から Tor ブラウザと呼ばれる特殊なインターネットブラウザを利用し、オフィスのシステム等にアクセスし業務を行う方法である。",
      "オ　「リモートデスクトップ」方式とは、テレワーク端末からオフィスに設置された端末（PC など）のデスクトップ環境に接続し、そのデスクトップ環境を遠隔操作して業務を行う方法である。"
    ],
    answer: 4,
    explanation: [
      "解答：オ",
      "ア：仮想デスクトップ(VDI)方式の記述です。不適切。",
      "イ：VPN方式の記述です。不適切。",
      "ウ：セキュアコンテナ方式は、独立したセキュアコンテナという仮想環境を設けます。Web環境に限定されません。不適切。",
      "エ：セキュアブラウザ方式はTorブラウザに限ったものではありません。不適切。",
      "オ：リモートデスクトップ方式の正しい記述です。適切。"
    ]
  },
  {
    id: 8,
    title: "各種認証技術",
    year: "平成28年 第19問",
    question: "ユーザ認証の強化に関する記述として最も適切なものはどれか。",
    options: [
      "ア　CHAP認証とは、チャレンジ／レスポンスという方式で、Ｗｅｂサイトにアクセスしてきたユーザを認証するものである。",
      "イ　二段階認証とは、同じパスワードを2回入力させてユーザの認証を行う方式のことである。",
      "ウ　ハードウェアトークンとは、その機器を認証装置にかざすことで本人を認証する仕組みのことである。",
      "エ　ワンタイムパスワードとは、サイトに登録した際に最初の認証に利用されるパスワードである。"
    ],
    answer: 0,
    explanation: [
      "解答：ア",
      "ア：CHAP認証はチャレンジ／レスポンス方式を用いて認証を行います。サーバが生成した乱数(チャレンジ)とパスワードを組み合わせてレスポンスを生成するため、毎回乱数が変わり安全です。適切。",
      "イ：二段階認証は同じパスワードを2回入力するものではなく、ID/パスワードに加えて別の認証コード等を用いる方式です。不適切。",
      "ウ：ハードウェアトークンは物理的デバイス（USBやキーパッド等）を使って認証を行うもので、必ずしもかざすわけではありません。不適切。",
      "エ：ワンタイムパスワードは一回限り有効な使い捨てパスワードです。初回登録時専用ではありません。不適切。"
    ]
  },
  {
    id: 9,
    title: "暗号化",
    year: "平成23年 第21問",
    question: "暗号化や各種認証方式に関する記述として最も適切なものはどれか。",
    options: [
      "ア　公開鍵暗号方式とは、送受信者だけが知る公開鍵をお互いに持ち、送信者はその鍵で暗号化し、受信者はその鍵で復号化する。",
      "イ　チャレンジレスポンス認証とは、キーホルダー型などの形態の、認証サーバと同期したパスワード発生装置を利用して認証を行う。",
      "ウ　デジタル署名とは、自分のサインをデジタルカメラで撮影し、それを送信文に貼り付けることをいう。",
      "エ　ハイブリッド方式とは、公開鍵暗号方式と共通鍵暗号方式を組み合わせたものである。"
    ],
    answer: 3,
    explanation: [
      "解答：エ",
      "ア：暗号化と復号化に同じ鍵(お互いに持つ鍵)を使うのは共通鍵暗号方式(秘密鍵暗号方式)です。不適切。",
      "イ：認証サーバと同期したパスワード発生装置を利用するのはタイムシンクロナス方式です。不適切。",
      "ウ：デジタル署名はデジタルカメラで撮影したサインではなく、公開鍵暗号方式を利用してデータと署名を暗号化する技術です。不適切。",
      "エ：ハイブリッド方式は、処理が速い共通鍵暗号方式でデータを暗号化し、その共通鍵を安全性が高い公開鍵暗号方式で暗号化して送る組み合わせ方式です。適切。"
    ]
  },
  {
    id: 10,
    title: "暗号化方式",
    year: "平成26年 第21問",
    question: "大阪のAさんが、東京にいるBさんに顧客名簿を送ってもらう場合の暗号化方式に関する記述として最も適切なものはどれか。",
    options: [
      "ア　Bさんは...社内部署から鍵をもらって暗号化...Aさんはその鍵を聞き復号化した。この方式はSSL方式のひとつである。",
      "イ　Bさんは、顧客名簿のファイルをAさんとBさんが共有する秘密鍵で暗号化してAさんに送付した。この方式はシーザー暗号方式のひとつである。",
      "ウ　Bさんは、顧客名簿のファイルをAさんの公開鍵で暗号化して送付した。Aさんは、Bさんの秘密鍵で復号化した。この方式は公開鍵方式のひとつである。",
      "エ　Bさんは、顧客名簿のファイルを任意に決めた鍵で暗号化してAさんに送付した。AさんはBさんから電話でその鍵を聞き、復号化した。この方式は共通鍵方式のひとつである。"
    ],
    answer: 3,
    explanation: [
      "解答：エ",
      "ア：SSLはTCP/IP上で自動的に暗号化を行うプロトコルであり、手動で鍵を受け渡す方式ではありません。不適切。",
      "イ：シーザー暗号はアルファベットを何文字かずらして暗号化する古典的な手法です。不適切。",
      "ウ：公開鍵方式では、Aさんの公開鍵で暗号化した場合、復号化には「Aさんの秘密鍵」を使用する必要があります(Bさんの秘密鍵ではありません)。不適切。",
      "エ：暗号化と復号化に同じ(共通の)鍵を使用し、それを電話等で共有しているため、共通鍵方式の記述として適切です。"
    ]
  },
  {
    id: 11,
    title: "情報セキュリティリスク",
    year: "令和5年 第23問",
    question: "リスクに関する以下の記述の空欄Ａ～Ｅに入る用語の組み合わせとして、最も適切なものを選べ。\n・リスク Ａ とは、結果とその起こりやすさの組み合わせとして表現されるリスクの大きさのことである。\n・リスク Ｂ とは、リスクの特質を理解し、リスクレベルを決定するプロセスのことである。\n・リスク Ｃ とは、リスクの重大性を評価するための目安とする条件のことである。\n・リスク Ｄ とは、リスクの大きさが受容可能かを決定するために、リスク分析の結果をリスク基準と比較するプロセスのことである。\n・リスク Ｅ とは、リスクを発見、認識および記述するプロセスのことである。",
    options: [
      "ア　Ａ：基準　　Ｂ：特定　　Ｃ：レベル　　Ｄ：評価　　Ｅ：分析",
      "イ　Ａ：基準　　Ｂ：分析　　Ｃ：レベル　　Ｄ：特定　　Ｅ：評価",
      "ウ　Ａ：レベル　Ｂ：特定　　Ｃ：基準　　Ｄ：評価　　Ｅ：分析",
      "エ　Ａ：レベル　Ｂ：分析　　Ｃ：基準　　Ｄ：特定　　Ｅ：評価",
      "オ　Ａ：レベル　Ｂ：分析　　Ｃ：基準　　Ｄ：評価　　Ｅ：特定"
    ],
    answer: 4,
    explanation: [
      "解答：オ",
      "・リスクレベル(A)：結果と起こりやすさの組み合わせによるリスクの大きさ。",
      "・リスク分析(B)：特質を理解しリスクレベルを決定するプロセス。",
      "・リスク基準(C)：重大性を評価するための目安とする条件。",
      "・リスク評価(D)：受容可能か決定するため、分析結果を基準と比較するプロセス。",
      "・リスク特定(E)：リスクを発見、認識および記述するプロセス。",
      "※リスクアセスメントの順序：特定 → 分析 → 評価"
    ]
  },
  {
    id: 12,
    title: "ネットワークのセキュリティ",
    year: "令和2年 第10問",
    question: "安全にネットワーク相互間の通信を運用するための記述として、最も適切なものの組み合わせを選べ。\nａ SSL/TLSは、送受信されるデータを暗号化する際に使われる代表的なプロトコルである。\nｂ IDSは、データを見てもその内容が分からないように、定められた処理手順でデータを変換する仕組みである。\nｃ VPNは、認証と通信データの暗号化によってインターネット上に構築された仮想的な専用ネットワークである。\nｄ DMZは、通信に必要な設定情報を自動的に割り当てるプロトコルである。",
    options: [
      "ア　ａとｂ",
      "イ　ａとｃ",
      "ウ　ｂとｄ",
      "エ　ｃとｄ"
    ],
    answer: 1,
    explanation: [
      "解答：イ",
      "ａ：SSL/TLSはデータ暗号化の標準プロトコル。適切。",
      "ｂ：IDS(侵入検知システム)は不正アクセスを監視する仕組みであり、データ変換(暗号化)の仕組みではありません。不適切。",
      "ｃ：VPNは仮想の専用線を構築し安全に通信を行う技術。適切。",
      "ｄ：DMZは外部と内部の中間的な非武装地帯のことです。IP自動割当はDHCPの記述です。不適切。",
      "よってａとｃが適切です。"
    ]
  },
  {
    id: 13,
    title: "情報セキュリティリスク対応",
    year: "令和4年 第17問",
    question: "リスク対応に関する記述とその用語の組み合わせとして、最も適切なものを選べ。\nａ リスクを伴う活動の停止やリスク要因の根本的排除により、当該リスクが発生しない状態にする。\nｂ リスク要因の予防や被害拡大防止措置を講じることにより、当該リスクの発生確率や損失を減じる。\nｃ リスクが受容可能な場合や対策費用が損害額を上回るような場合には、あえて何も対策を講じない。\nｄ 保険に加入したり、業務をアウトソーシングするなどして、他者との間でリスクを分散する。",
    options: [
      "ア　ａ：リスク移転　　ｂ：リスク低減　　ｃ：リスク回避　　ｄ：リスク保有",
      "イ　ａ：リスク移転　　ｂ：リスク保有　　ｃ：リスク回避　　ｄ：リスク低減",
      "ウ　ａ：リスク回避　　ｂ：リスク移転　　ｃ：リスク保有　　ｄ：リスク低減",
      "エ　ａ：リスク回避　　ｂ：リスク低減　　ｃ：リスク保有　　ｄ：リスク移転",
      "オ　ａ：リスク低減　　ｂ：リスク回避　　ｃ：リスク移転　　ｄ：リスク保有"
    ],
    answer: 3,
    explanation: [
      "解答：エ",
      "ａ：発生しない状態にする（ゼロにする）のは「リスク回避」。",
      "ｂ：発生確率や損失を減じるのは「リスク低減」。",
      "ｃ：あえて何も対策を講じない（受け入れる）のは「リスク保有」。",
      "ｄ：保険等で他者と分散するのは「リスク移転」。"
    ]
  },
  {
    id: 14,
    title: "他人受入率(FAR)と本人拒否率(FRR)",
    year: "平成29年 第22問",
    question: "生体認証におけるFARとFRRに関する以下の文章の空欄Ａ〜Ｄに入る語句の組み合わせとして、最も適切なものを選べ。\nａ （ Ａ ）が低いと安全性を重視したシステムになり、（ Ｂ ）が低いと利用者の利便性を重視したシステムになる。\nｂ ATMでの生体認証では、（ Ｃ ）が十分低くなるように設定されている。\nｃ なりすましを防止するには、（ Ｄ ）を低く抑えることに重点をおけばよい。",
    options: [
      "ア　Ａ：FAR　　Ｂ：FRR　　Ｃ：FAR　　Ｄ：FAR",
      "イ　Ａ：FAR　　Ｂ：FRR　　Ｃ：FRR　　Ｄ：FRR",
      "ウ　Ａ：FRR　　Ｂ：FAR　　Ｃ：FAR　　Ｄ：FAR",
      "エ　Ａ：FRR　　Ｂ：FAR　　Ｃ：FRR　　Ｄ：FRR"
    ],
    answer: 0,
    explanation: [
      "解答：ア",
      "・FAR (他人受入率): 他人を本人と誤認して受け入れてしまう確率。これを低くすると安全性が高まる。",
      "・FRR (本人拒否率): 本人を他人と誤認して拒否してしまう確率。これを低くすると利便性が高まる。",
      "Ａ：安全性を重視するには「FAR」を低くする。",
      "Ｂ：利便性を重視するには「FRR」を低くする。",
      "Ｃ：ATMでは不正引出(金銭被害)を防ぐため安全性が重視され、「FAR」を十分低く設定する。",
      "Ｄ：なりすまし（他人が本人と偽る）を防止するには「FAR」を低く抑える。"
    ]
  }
];

export default function App() {
  const [userId, setUserId] = useState('');
  const [mode, setMode] = useState('login'); // 'login', 'menu', 'quiz', 'result', 'history'
  const [quizMode, setQuizMode] = useState('all'); // 'all', 'incorrect', 'review'
  const [currentQuizList, setCurrentQuizList] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userHistory, setUserHistory] = useState({});
  const [loading, setLoading] = useState(false);

  // クイズプレイ中の状態
  const [selectedOption, setSelectedOption] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [sessionResults, setSessionResults] = useState([]);

  // ==========================================
  // Firebase Data Fetch / Save
  // ==========================================
  const fetchUserData = async (id) => {
    if (!db) {
      console.log("Firebase is not initialized. Using local empty state.");
      setUserHistory({});
      return;
    }
    setLoading(true);
    try {
      const docRef = doc(db, `${APP_ID}_Users`, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserHistory(data.history || {});
        console.log("Data fetched:", data.history);
      } else {
        console.log("No data found for user. Initializing new history.");
        setUserHistory({});
      }
    } catch (error) {
      console.error("Error fetching document:", error);
      setUserHistory({});
    }
    setLoading(false);
  };

  const saveUserData = async (newHistory) => {
    if (!db) return;
    try {
      const docRef = doc(db, `${APP_ID}_Users`, userId);
      await setDoc(docRef, { history: newHistory }, { merge: true });
      console.log("Data saved successfully.");
    } catch (error) {
      console.error("Error saving document:", error);
    }
  };

  // ==========================================
  // Handlers
  // ==========================================
  const handleLogin = (e) => {
    e.preventDefault();
    const id = e.target.userId.value.trim();
    if (id) {
      setUserId(id);
      fetchUserData(id);
      setMode('menu');
    }
  };

  const startQuiz = (selectedMode) => {
    let targetList = [];
    if (selectedMode === 'all') {
      targetList = quizData.map(q => q.id);
    } else if (selectedMode === 'incorrect') {
      targetList = quizData.filter(q => {
        const h = userHistory[q.id];
        return h && h.lastCorrect === false;
      }).map(q => q.id);
    } else if (selectedMode === 'review') {
      targetList = quizData.filter(q => {
        const h = userHistory[q.id];
        return h && h.isReview === true;
      }).map(q => q.id);
    }

    if (targetList.length === 0) {
      alert("該当する問題がありません！");
      return;
    }

    setQuizMode(selectedMode);
    setCurrentQuizList(targetList);
    setCurrentIndex(0);
    setSessionResults([]);
    setSelectedOption(null);
    setIsAnswered(false);
    setMode('quiz');
  };

  const handleAnswer = (optionIndex) => {
    if (isAnswered) return;
    setSelectedOption(optionIndex);
    setIsAnswered(true);

    const currentQuiz = quizData.find(q => q.id === currentQuizList[currentIndex]);
    const isCorrect = optionIndex === currentQuiz.answer;

    const newSessionResults = [...sessionResults, { id: currentQuiz.id, isCorrect }];
    setSessionResults(newSessionResults);

    // 履歴の更新
    const prevHistory = userHistory[currentQuiz.id] || { attempts: 0, correctCount: 0, isReview: false };
    const newHistory = {
      ...userHistory,
      [currentQuiz.id]: {
        ...prevHistory,
        lastCorrect: isCorrect,
        attempts: prevHistory.attempts + 1,
        correctCount: prevHistory.correctCount + (isCorrect ? 1 : 0),
      }
    };
    setUserHistory(newHistory);
    saveUserData(newHistory);
  };

  const toggleReview = () => {
    const currentQuizId = currentQuizList[currentIndex];
    const prevHistory = userHistory[currentQuizId] || { attempts: 0, correctCount: 0 };
    const newIsReview = !prevHistory.isReview;
    
    const newHistory = {
      ...userHistory,
      [currentQuizId]: {
        ...prevHistory,
        isReview: newIsReview
      }
    };
    setUserHistory(newHistory);
    saveUserData(newHistory);
  };

  const nextQuestion = () => {
    if (currentIndex + 1 < currentQuizList.length) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setMode('result');
    }
  };

  const logout = () => {
    setUserId('');
    setUserHistory({});
    setMode('login');
  };

  // ==========================================
  // Renderers
  // ==========================================
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center">
          <RefreshCcw className="w-10 h-10 text-blue-500 animate-spin mb-4" />
          <p className="text-gray-600 font-medium">データを読み込み中...</p>
        </div>
      </div>
    );
  }

  if (mode === 'login') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-800 mb-2">インターネットとセキュリティ</h1>
            <p className="text-gray-500">過去問セレクト演習 4-4</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">合言葉（ユーザーID）</label>
              <input
                type="text"
                name="userId"
                required
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                placeholder="例: secret-key-123"
              />
              <p className="text-xs text-gray-500 mt-2">※PCとスマホで同じ合言葉を入力すると履歴が同期されます。</p>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              学習を始める
              <ChevronRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === 'menu') {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-2xl mx-auto">
          <header className="flex justify-between items-center mb-8 bg-white p-4 rounded-xl shadow-sm">
            <div>
              <p className="text-sm text-gray-500">ログイン中</p>
              <p className="font-bold text-gray-800">{userId}</p>
            </div>
            <button onClick={logout} className="text-gray-500 hover:text-red-500 transition-colors flex items-center gap-1 text-sm">
              <LogOut className="w-4 h-4" /> ログアウト
            </button>
          </header>

          <div className="grid gap-4 md:grid-cols-1">
            <button
              onClick={() => startQuiz('all')}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left border-l-4 border-blue-500 group"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-600 transition-colors">すべての問題</h3>
              <p className="text-sm text-gray-500">全14問を通しで学習します</p>
            </button>

            <button
              onClick={() => startQuiz('incorrect')}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left border-l-4 border-red-500 group"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-red-600 transition-colors">前回不正解の問題</h3>
              <p className="text-sm text-gray-500">苦手な問題に再挑戦します</p>
            </button>

            <button
              onClick={() => startQuiz('review')}
              className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-shadow text-left border-l-4 border-yellow-500 group"
            >
              <h3 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-yellow-600 transition-colors">要復習の問題</h3>
              <p className="text-sm text-gray-500">チェックを付けた問題を復習します</p>
            </button>
            
            <button
              onClick={() => setMode('history')}
              className="bg-gray-800 text-white p-6 rounded-xl shadow-sm hover:bg-gray-700 transition-colors flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-bold mb-1">学習履歴を見る</h3>
                <p className="text-sm text-gray-300">正答率や過去の成績を確認</p>
              </div>
              <BarChart className="w-8 h-8 text-gray-300" />
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'quiz') {
    const currentQuiz = quizData.find(q => q.id === currentQuizList[currentIndex]);
    const isCorrect = selectedOption === currentQuiz?.answer;
    const isReview = userHistory[currentQuiz?.id]?.isReview || false;

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="max-w-3xl mx-auto p-4">
          <div className="flex justify-between items-center mb-6 text-sm text-gray-500 font-medium">
            <span>問題 {currentIndex + 1} / {currentQuizList.length}</span>
            <button onClick={() => setMode('menu')} className="flex items-center gap-1 hover:text-gray-800">
              <Home className="w-4 h-4" /> 中断
            </button>
          </div>

          {/* Question Card */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-800">{currentQuiz?.title}</h2>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded font-bold whitespace-nowrap ml-4">
                {currentQuiz?.year}
              </span>
            </div>
            <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{currentQuiz?.question}</p>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQuiz?.options.map((option, idx) => {
              let btnClass = "w-full text-left p-4 rounded-xl border-2 transition-all ";
              if (!isAnswered) {
                btnClass += "border-gray-200 hover:border-blue-400 hover:bg-blue-50 bg-white text-gray-700";
              } else {
                if (idx === currentQuiz.answer) {
                  btnClass += "border-green-500 bg-green-50 text-green-800 font-medium"; // 正解の選択肢
                } else if (idx === selectedOption) {
                  btnClass += "border-red-500 bg-red-50 text-red-800"; // 選んだ不正解の選択肢
                } else {
                  btnClass += "border-gray-200 bg-gray-50 text-gray-400 opacity-60"; // 選ばなかった不正解
                }
              }

              return (
                <button
                  key={idx}
                  disabled={isAnswered}
                  onClick={() => handleAnswer(idx)}
                  className={btnClass}
                >
                  <div className="flex items-start gap-3">
                    <span className="mt-0.5">
                      {isAnswered && idx === currentQuiz.answer && <Check className="w-5 h-5 text-green-600" />}
                      {isAnswered && idx === selectedOption && idx !== currentQuiz.answer && <X className="w-5 h-5 text-red-600" />}
                      {!isAnswered && <span className="w-5 h-5 rounded-full border-2 border-gray-300 inline-block"></span>}
                      {isAnswered && idx !== currentQuiz.answer && idx !== selectedOption && <span className="w-5 h-5 inline-block"></span>}
                    </span>
                    <span>{option}</span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {isAnswered && (
            <div className="animate-fade-in-up">
              <div className={`p-6 rounded-xl shadow-sm mb-6 ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-2 mb-4">
                  {isCorrect ? (
                    <span className="text-xl font-bold text-green-700 flex items-center gap-2">
                      <Check className="w-6 h-6" /> 正解！
                    </span>
                  ) : (
                    <span className="text-xl font-bold text-red-700 flex items-center gap-2">
                      <X className="w-6 h-6" /> 不正解...
                    </span>
                  )}
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-opacity-50 border-gray-200 text-sm text-gray-700 space-y-2 leading-relaxed">
                  {currentQuiz?.explanation.map((line, i) => (
                    <p key={i}>{line}</p>
                  ))}
                </div>
              </div>

              <div className="flex justify-between items-center mb-10">
                <button
                  onClick={toggleReview}
                  className={`flex items-center gap-2 px-4 py-3 rounded-lg font-medium transition-colors ${
                    isReview 
                      ? 'bg-yellow-100 text-yellow-800 border-2 border-yellow-400' 
                      : 'bg-white text-gray-600 border-2 border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <Bookmark className={`w-5 h-5 ${isReview ? 'fill-current' : ''}`} />
                  要復習リストに入れる
                </button>

                <button
                  onClick={nextQuestion}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center gap-2 shadow-sm"
                >
                  {currentIndex + 1 < currentQuizList.length ? '次の問題へ' : '結果を見る'}
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (mode === 'result') {
    const correctCount = sessionResults.filter(r => r.isCorrect).length;
    const total = sessionResults.length;
    const score = Math.round((correctCount / total) * 100);

    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">学習完了！</h2>
          
          <div className="mb-8">
            <div className="text-5xl font-bold text-blue-600 mb-2">{score}<span className="text-2xl text-gray-500 ml-1">%</span></div>
            <p className="text-gray-600">{total}問中 {correctCount}問 正解</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => setMode('menu')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
            >
              メニューに戻る
            </button>
            <button
              onClick={() => setMode('history')}
              className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-3 px-4 rounded-lg transition-colors"
            >
              履歴を確認する
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (mode === 'history') {
    let totalAttempts = 0;
    let totalCorrects = 0;
    
    quizData.forEach(q => {
      const h = userHistory[q.id];
      if (h) {
        totalAttempts += h.attempts || 0;
        totalCorrects += h.correctCount || 0;
      }
    });

    const chartData = [
      { name: '正解', value: totalCorrects, color: '#22c55e' },
      { name: '不正解', value: totalAttempts - totalCorrects, color: '#ef4444' }
    ];

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <header className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
              <BarChart className="w-6 h-6" /> 学習履歴
            </h2>
            <button onClick={() => setMode('menu')} className="bg-white px-4 py-2 rounded-lg shadow-sm font-medium text-gray-600 hover:bg-gray-100 flex items-center gap-1">
              <Home className="w-4 h-4" /> メニューへ
            </button>
          </header>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm md:col-span-1 flex flex-col justify-center items-center">
              <h3 className="text-gray-500 font-medium mb-4">全体の正答率</h3>
              {totalAttempts > 0 ? (
                <div className="w-full h-48">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <RechartsTooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="text-center mt-[-100px] pointer-events-none">
                    <span className="text-3xl font-bold text-gray-800">
                      {Math.round((totalCorrects / totalAttempts) * 100)}%
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-gray-400">データがありません</p>
              )}
            </div>

            <div className="bg-white rounded-xl shadow-sm md:col-span-2 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-500">
                  <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                    <tr>
                      <th className="px-4 py-3">No. / 年度</th>
                      <th className="px-4 py-3">テーマ</th>
                      <th className="px-4 py-3 text-center">要復習</th>
                      <th className="px-4 py-3 text-center">前回</th>
                      <th className="px-4 py-3 text-center">正答率</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quizData.map((q, idx) => {
                      const h = userHistory[q.id];
                      const attempts = h?.attempts || 0;
                      const correctCount = h?.correctCount || 0;
                      const rate = attempts > 0 ? Math.round((correctCount / attempts) * 100) : '-';
                      
                      return (
                        <tr key={q.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className="font-medium text-gray-800 block">Q{idx + 1}</span>
                            <span className="text-xs text-gray-400">{q.year}</span>
                          </td>
                          <td className="px-4 py-3 font-medium text-gray-800">{q.title}</td>
                          <td className="px-4 py-3 text-center">
                            {h?.isReview ? <Bookmark className="w-5 h-5 text-yellow-500 fill-current mx-auto" /> : '-'}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {attempts === 0 ? '-' : h?.lastCorrect ? (
                              <span className="text-green-600 font-bold">〇</span>
                            ) : (
                              <span className="text-red-600 font-bold">×</span>
                            )}
                          </td>
                          <td className="px-4 py-3 text-center">
                            {attempts > 0 ? `${rate}%` : '-'}
                            {attempts > 0 && <span className="text-xs text-gray-400 block">({correctCount}/{attempts})</span>}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}