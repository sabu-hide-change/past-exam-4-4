// npm install lucide-react

import React, { useState, useEffect } from 'react';
import { ChevronRight, BookOpen, RotateCcw, Check, X, Eye, EyeOff } from 'lucide-react';

const quizData = [
  {
    id: 1,
    number: 1,
    year: '令和元年 第8問',
    title: 'インターネットの仕組み',
    question: '中小企業診断士のあなたは、あるメールを開封したところ、次のような URLに接続するように指示が出てきた。\n\nhttps://News.Fishing.jp/test\n\nこの URL から分かることとして、最も適切なものはどれか。',
    options: [
      'SSL を用いて暗号化されたデータ通信であることが確認できる。',
      '大文字と小文字を入れ替えた偽サイトであることが確認できる。',
      '参照先ホストのサーバが日本国内に設置されていることが確認できる。',
      'ホスト名の WWW が省略されていることが確認できる。'
    ],
    correctAnswer: 0,
    explanation: '本問では、URLの表記とSSLについて問われています。SSLを使ったWebページのURLの先頭（プロトコルを表示する部分）は、「https:」と表記されます。つまり、設問にあるURL「https://News.Fishing.jp/test」は、SSLを使って暗号化されたデータ通信であることが確認できます。よって適切であり、これが正解となります。\n\n選択肢イですが、ドメイン名では、大文字と小文字を区別しないため、大文字と小文字を入れ替えた偽サイトであるということは、確認できません。\n\n選択肢ウですが、「jp」は国別のトップレベルドメインですが、そのドメインを管理する参照先ホストのサーバが日本国内に設置されているかどうかは分かりません。\n\n選択肢エですが、ホスト名のWWWを付与するかどうかは、管理者（登録者）が自由に決めることができるため、当該URLを見ただけで、一概に「省略されている」とは言えません。'
  },
  {
    id: 2,
    number: 2,
    year: '平成23年 第12問',
    title: 'インターネットの機能',
    question: '事務所内で、インターネットの様々な仕組みを業務に利用しなければならない場面が増え、インターネットの管理・運用についての理解が求められている。\n\nインターネットにおいて、以下のａ～ｃの記述内容とそれを提供する機能や機器名称の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\nａ：ドメイン名・ホスト名とIPアドレスを対応付ける機能を持ち、Webクライアントからのアドレス指定の際の問い合わせなどに答える。\n\nｂ：事務所内のLANにPCが接続された時、当該PCが使用するIPアドレスを割り当てる。\n\nｃ：グローバルIPアドレスと事務所内のプライベートIPアドレスの交換を行う。',
    options: [
      'ａ：DHCP　ｂ：NAT ｃ：VPN',
      'ａ：DNS　ｂ：DHCP　ｃ：NAT',
      'ａ：NAT　ｂ：ブロードバンドルータ　ｃ：プロキシサーバ',
      'ａ：VPN　ｂ：プロキシサーバ　ｃ：DNS'
    ],
    correctAnswer: 1,
    explanation: 'ａは、DNSに関する記述です。DNSは、ドメイン名からIPアドレスを変換するシステムです。\n\nｂは、DHCPに関する記述です。DHCP（Dynamic Host Configuration Protocol）とは、インターネットなどのネットワークに接続するコンピュータにIPアドレスなどを自動的に割り当てるプロトコルです。\n\nｃは、NAT に関する記述です。NATとは、社内LANとインターネットなど、異なるネットワークを接続する機能です。NATでは、プライベートIPアドレスとグローバルIPアドレスを、1対1で変換します。'
  },
  {
    id: 3,
    number: 3,
    year: '平成30年 第9問',
    title: 'プロトコル',
    question: '通信ネットワーク上では多様なプロトコルが用いられており、代表的なプロトコルについて理解しておくことは、中小企業の情報ネットワーク化においても重要である。通信プロトコルに関する以下の①～④の記述と、それらに対応する用語の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\n①クライアントからサーバにメールを送信したり、サーバ間でメールを転送したりするために用いられる。\n\n②ネットワークに接続する機器にIPアドレスなどを自動的に割り当てるために用いられる。\n\n③ネットワークに接続されている機器の情報を収集し、監視や制御を行うために用いられる。\n\n④ネットワークに接続されている機器の内部時計を協定世界時に同期するために用いられる。',
    options: [
      '①：IMAP 　②：DHCP 　③：PPP　　④：NTP',
      '①：IMAP 　②：FTP　　③：SNMP 　④：SOAP',
      '①：SMTP 　②：DHCP 　③：SNMP 　④：NTP',
      '①：SMTP 　②：FTP　　③：PPP　　④：SOAP'
    ],
    correctAnswer: 2,
    explanation: '①は、メール送信に関する記述です。SMTPは、電子メールの送信に使われるプロトコルです。\n\n②は、IPアドレスに関する機能です。DHCPとは、インターネットなどのネットワークに接続するコンピュータにIPアドレスなどを自動的に割り当てるプロトコルです。\n\n③は、ネットワークに関する機能です。SNMPは、ネットワークに接続されている機器の情報を収集し、監視や制御を行うために用いられるプロトコルです。\n\n④も、ネットワークに関する機能です。NTPは、ネットワークに接続されている機器の内部時計を、正しい時刻に同期するためのプロトコルです。'
  },
  {
    id: 4,
    number: 4,
    year: '平成24年 第22問',
    title: '情報システムのセキュリティ',
    question: 'インターネット利用が普及して、インターネット上で取引情報やプライバシーにかかわる情報を扱う場面が多くなっている。従って情報セキュリティについて、その基礎事項を把握しておくことは重要である。\n\n情報セキュリティにかかわる記述として最も適切なものはどれか。',
    options: [
      'インターネットを介して、顧客情報を収集してそれをデータベース化した場合、それが漏洩しないようにするにはウイルス対策を行えばよい。',
      'インターネットを介して、顧客に送り先等の他に年齢、家族構成などを入力してもらう場合、その用途については顧客に知らせる必要はない。',
      '取引企業、顧客との情報のやりとりは、暗号化することが好ましいが、その場合に用いる公開鍵暗号方式とは、関係者の間で共通鍵を設定して、情報を暗号化する方式である。',
      'ファイアウォールを自社コンピュータに対する不正アクセスの防止手段として利用する場合、どのような内容のアクセスを拒否するのかをあらかじめ設定する必要がある。'
    ],
    correctAnswer: 3,
    explanation: '選択肢アは、データベースの情報漏洩に関する記述です。データベースなどに格納されたデータは、ウイルス対策だけでは情報漏洩を防ぐことはできません。\n\n選択肢イは、個人情報保護法第18条に違反します。インターネットなどを介して個人情報を取得する場合は、その利用目的を明示する必要があります。\n\n選択肢ウは、暗号化に関する記述です。公開鍵暗号方式は、暗号化の鍵と、復号化の鍵が異なる方式です。共通鍵を使う方式は、秘密鍵暗号方式（共通鍵方式）です。\n\n選択肢エは、ファイアウォールに関する記述です。ファイアウォールの代表的な機能として、パケットフィルタリングがあります。パケットフィルタリングを利用する際は、事前に通してよいパケット、許可しないパケットの情報を登録する必要があります。'
  },
  {
    id: 5,
    number: 5,
    year: '令和3年 第21問',
    title: 'セキュリティポリシー',
    question: '業務システムのクラウド化やテレワークの普及によって、企業組織の内部と外部の境界が曖昧となり、ゼロトラストと呼ばれる情報セキュリティの考え方が浸透してきている。ゼロトラストに関する記述として、最も適切なものはどれか。',
    options: [
      '組織内において情報セキュリティインシデントを引き起こす可能性のある利用者を早期に特定し教育することで、インシデント発生を未然に防ぐ。',
      '通信データを暗号化して外部の侵入を防ぐ VPN 機器を撤廃し、認証の強化と認可の動的管理に集中する。',
      '利用者と機器を信頼せず、認証を強化するとともに組織が管理する機器のみを構成員に利用させる。',
      '利用者も機器もネットワーク環境も信頼せず、情報資産へのアクセス者を厳格に認証し、常に確認する。',
      '利用者を信頼しないという考え方に基づき認証を重視するが、一度許可されたアクセス権は制限しない。'
    ],
    correctAnswer: 3,
    explanation: 'ゼロトラストとは、「何も信頼しない」ということを前提にセキュリティ対策を講じる考え方です。従来のセキュリティ対策は、ネットワーク内部からのアクセスは信頼し、外部からのアクセスを信頼しないという考え方が中心でしたが、ゼロトラストでは、内部・外部を問わず、すべてのアクセスに対して、セキュリティ対策を講じます。\n\nゼロトラストは、利用者も機器もネットワーク環境も信頼しませんので、情報資産へのアクセス者を厳格に認証し、常に確認します。'
  },
  {
    id: 6,
    number: 6,
    year: '平成30年 第23問',
    title: 'ソーシャルエンジニアリング',
    question: '近年、機密情報への攻撃の手法が多様化している。機密情報を不正に入手する手法であるソーシャルエンジニアリングに関する記述として、最も不適切なものはどれか。',
    options: [
      'シュレッダーで処理された紙片をつなぎ合わせて、パスワードを取得する。',
      'パソコンの操作画面を盗み見して、パスワードを取得する。',
      '文字列の組み合わせを機械的かつ総当たり的に試すことで、パスワードを取得する。',
      'ユーザになりすまして管理者に電話し、パスワードを取得する。'
    ],
    correctAnswer: 2,
    explanation: 'ソーシャルエンジニアリングは、人間の不注意や間違いにつけこんだり、盗み聞きなどを利用したりする人的脅威であり、非技術的な方法で情報を不正に入手する手口のことです。\n\n選択肢ウは、文字列の組み合わせを機械的かつ総当たり的に試すことで、パスワードを取得する手法について問われています。この手法は「総当たり攻撃」と呼ばれるもので、コンピュータを使って自動的に、無数の文字列の組み合わせを入力していくものです。よってソーシャルエンジニアリングに関する記述としては不適切です。'
  },
  {
    id: 7,
    number: 7,
    year: '令和3年 第25問',
    title: 'テレワークセキュリティガイドライン',
    question: 'コロナ禍の影響もあり、テレワークが一般化してきた。テレワークを行うには、社内で行っていた作業環境をリモートで実現する必要がある。総務省は「テレワークセキュリティガイドライン第 5 版」を発表し、その中で、テレワークの方式を分類している。この分類に関する記述として、最も適切なものはどれか。',
    options: [
      '「VPN」方式とは、テレワーク端末からVDI上のデスクトップ環境に接続を行い、そのデスクトップ環境を遠隔操作して業務を行う方法である。',
      '「仮想デスクトップ」方式とは、テレワーク端末からオフィスネットワークに対してVPN接続を行い、その VPN を介してオフィスのサーバ等に接続し業務を行う方法である。',
      '「セキュアコンテナ」方式とは、テレワーク端末にファイアウォールで保護された仮想的なWeb環境を設け、その環境内でアプリケーションを動かし業務を行う方法である。',
      '「セキュアブラウザ」方式とは、テレワーク端末から Tor ブラウザと呼ばれる特殊なインターネットブラウザを利用し、オフィスのシステム等にアクセスし業務を行う方法である。',
      '「リモートデスクトップ」方式とは、テレワーク端末からオフィスに設置された端末（PC など）のデスクトップ環境に接続し、そのデスクトップ環境を遠隔操作して業務を行う方法である。'
    ],
    correctAnswer: 4,
    explanation: '選択肢アは、仮想デスクトップ方式に関する記述です。\n\n選択肢イは、VPN方式に関する記述です。\n\n選択肢ウについて、セキュアコンテナ方式では、テレワーク端末にローカル環境とは独立したセキュアコンテナという仮想的な環境を設けます。\n\n選択肢エについて、セキュアブラウザ方式では、テレワーク端末からセキュアブラウザと呼ばれる特殊なインターネットブラウザを利用します。\n\n選択肢オは、リモートデスクトップに関する記述です。テレワーク端末からオフィスに設置された端末（PC等）のデスクトップ環境に接続し、そのデスクトップ環境を遠隔操作して業務を行う方法です。'
  },
  {
    id: 8,
    number: 8,
    year: '平成28年 第19問',
    title: '各種認証技術',
    question: '情報システムの利用においては、フィッシング詐欺や情報事案などの増加に対応するために情報セキュリティをより高めなければならない。その一環としてユーザ認証の強化が叫ばれている。これに関する記述として最も適切なものはどれか。',
    options: [
      'CHAP認証とは、チャレンジ／レスポンスという方式で、Ｗｅｂサイトにアクセスしてきたユーザを認証するものである。',
      '二段階認証とは、同じパスワードを2回入力させてユーザの認証を行う方式のことである。',
      'ハードウェアトークンとは、その機器を認証装置にかざすことで本人を認証する仕組みのことである。',
      'ワンタイムパスワードとは、サイトに登録した際に最初の認証に利用されるパスワードである。'
    ],
    correctAnswer: 0,
    explanation: 'CHAP（Challenge-Handshake Authentication Protocol）とは、ユーザ認証のためのプロトコルです。CHAP認証の特徴は、チャレンジ／レスポンスという方式を用いて認証を行います。毎回乱数を変更することにより、盗聴によるパスワードの詐取、悪用を防ぐことができます。\n\n選択肢イについて、二段階認証とは、ID／パスワードに加えて、セキュリティコードによる認証を行う方式です。\n\n選択肢ウについて、ハードウェアトークンとは、物理的デバイスを使って認証を行う方式です。\n\n選択肢エについて、ワンタイムパスワードとは、一回限り有効なパスワードで認証する方式です。'
  },
  {
    id: 9,
    number: 9,
    year: '平成23年 第21問',
    title: '暗号化',
    question: '情報システムがネットワーク上で稼働するようになっている。その場合、情報システムへの不正侵入を防いだり、ネットワーク上で情報が漏洩したりしないようにするため、暗号化や各種認証方式が採用される。これに関する記述として最も適切なものはどれか。',
    options: [
      '公開鍵暗号方式とは、送受信者だけが知る公開鍵をお互いに持ち、送信者はその鍵で暗号化し、受信者はその鍵で復号化する。',
      'チャレンジレスポンス認証とは、キーホルダー型などの形態の、認証サーバと同期したパスワード発生装置を利用して認証を行う。',
      'デジタル署名とは、自分のサインをデジタルカメラで撮影し、それを送信文に貼り付けることをいう。',
      'ハイブリッド方式とは、公開鍵暗号方式と共通鍵暗号方式を組み合わせたものである。'
    ],
    correctAnswer: 3,
    explanation: '選択肢アは、公開鍵暗号方式に関する記述です。公開鍵暗号方式は、暗号化の鍵と、復号化の鍵が異なる方式です。暗号化と復号化に同じ鍵を使う方式は、秘密鍵暗号方式（共通鍵方式）です。\n\n選択肢イは、チャレンジレスポンス認証に関する記述です。タイムシンクロナス方式という認証方式の説明です。\n\n選択肢ウは、デジタル署名に関する記述です。デジタル署名は、ネットワーク経由で受信したデジタル文書を保証するための技術です。\n\n選択肢エは、ハイブリッド方式に関する記述です。公開鍵暗号方式と共通鍵暗号方式を組み合わせたものです。'
  },
  {
    id: 10,
    number: 10,
    year: '平成26年 第21問',
    title: '暗号化方式',
    question: '大阪のAさんが、東京にいるBさんに顧客名簿を送ってもらうように依頼した。その場合に利用する暗号化方式に関する記述として最も適切なものはどれか。',
    options: [
      'Bさんは、顧客名簿のファイルを、暗号化鍵を管理する社内部署から鍵をひとつもらって暗号化した。Aさんに送付後、その鍵で暗号化したことを鍵管理部署に連絡した。Aさんは、その部署からBさんが使った鍵を聞き、送られたファイルを復号化した。この方式はSSL方式のひとつである。',
      'Bさんは、顧客名簿のファイルをAさんとBさんが共有する秘密鍵で暗号化してAさんに送付した。この方式はシーザー暗号方式のひとつである。',
      'Bさんは、顧客名簿のファイルをAさんの公開鍵で暗号化して送付した。Aさんは、Bさんの秘密鍵で復号化した。この方式は公開鍵方式のひとつである。',
      'Bさんは、顧客名簿のファイルを任意に決めた鍵で暗号化してAさんに送付した。AさんはBさんから電話でその鍵を聞き、復号化した。この方式は共通鍵方式のひとつである。'
    ],
    correctAnswer: 3,
    explanation: '選択肢アでは、記述の内容がSSL方式であるかどうか問われています。選択肢のケースは手動の単純な暗号化の方法についての記述です。\n\n選択肢イでは、シーザー暗号方式は、アルファベットを何文字かずらして暗号化する方法です。選択肢の記述と照らし合わせてみると、不適切です。\n\n選択肢ウは、公開鍵方式では、送信者は、受信者が公開している公開鍵を使ってデータを暗号化します。受信者は、自分で管理している秘密鍵を使って復号化します。このケースではAさん自身の秘密鍵で復号化する必要があります。\n\n選択肢エは、共通鍵方式は、秘密鍵方式とも言われ、暗号化と復号化に同じ鍵を使う方式です。'
  },
  {
    id: 11,
    number: 11,
    year: '令和5年 第23問',
    title: '情報セキュリティリスク',
    question: 'JISQ27000：2019（情報セキュリティマネジメントシステム－用語）におけるリスクに関する以下の記述の空欄Ａ～Ｅに入る用語の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\n・リスク Ａとは、結果とその起こりやすさの組み合わせとして表現されるリスクの大きさのことである。\n\n・リスク Ｂ とは、リスクの特質を理解し、リスクレベルを決定するプロセスのことである。\n\n・リスク Ｃとは、リスクの重大性を評価するための目安とする条件のことである。\n\n・リスク Ｄ とは、リスクの大きさが受容可能かを決定するために、リスク分析の結果をリスク基準と比較するプロセスのことである。\n\n・リスク Ｅ とは、リスクを発見、認識および記述するプロセスのことである。',
    options: [
      'Ａ：基準　　　　Ｂ：特定　　　Ｃ：レベル　　　Ｄ：評価　　　Ｅ：分析',
      'Ａ：基準　　　　Ｂ：分析　　　Ｃ：レベル　　　Ｄ：特定　　　Ｅ：評価',
      'Ａ：レベル　　　Ｂ：特定　　　Ｃ：基準　　　　Ｄ：評価　　　Ｅ：分析',
      'Ａ：レベル　　　Ｂ：分析　　　Ｃ：基準　　　　Ｄ：特定　　　Ｅ：評価',
      'Ａ：レベル　　　Ｂ：分析　　　Ｃ：基準　　　　Ｄ：評価　　　Ｅ：特定'
    ],
    correctAnswer: 4,
    explanation: 'リスクレベル：結果とその起こりやすさの組合せとして表現される、リスクの大きさのことです。\n\nリスク分析：リスクの特質を理解し、リスクレベルを決定するプロセスのことです。\n\nリスク基準：リスクの重大性を評価するための目安とする条件のことです。\n\nリスク評価：リスク及び／又はその大きさが、受容可能か又は許容可能かを決定するために、リスク分析の結果をリスク基準と比較するプロセスです。\n\nリスク特定：リスクを発見、認識および記述するプロセスのことです。'
  },
  {
    id: 12,
    number: 12,
    year: '令和2年 第10問',
    title: 'ネットワークのセキュリティ',
    question: '近年、情報ネットワークが発展・普及し、その重要性はますます高まっている。安全にネットワーク相互間の通信を運用するための記述として、最も適切なものの組み合わせを下記の解答群から選べ。\n\nａ　SSL/TLSは、インターネットを用いた通信においてクライアントとサーバ間で送受信されるデータを暗号化する際に使われる代表的なプロトコルである。\n\nｂ　IDSは、大切な情報を他人には知られないようにするために、データを見てもその内容が分からないように、定められた処理手順でデータを変換する仕組みである。\n\nｃ　VPNは、認証と通信データの暗号化によってインターネット上に構築された仮想的な専用ネットワークである。\n\nｄ　DMZは、LANに接続するコンピュータやデバイスなどに対して、IPアドレス、ホスト名や DNSサーバの情報といった通信に必要な設定情報を自動的に割り当てるプロトコルである。',
    options: [
      'ａとｂ',
      'ａとｃ',
      'ｂとｄ',
      'ｃとｄ'
    ],
    correctAnswer: 1,
    explanation: '選択肢aですが、SSL/TLSの説明です。SSL（Secure Sockets Layer）/TLS（Transport Layer Security）はインターネット上でデータを暗号化して送受信する標準的なプロトコルです。適切です。\n\n選択肢bですが、IDSの説明です。IDS（Intrusion Detection System）とは、不正アクセスを監視する「侵入検知システム」のことであり、データを変換する仕組みではありません。不適切です。\n\n選択肢cですが、VPNの説明です。VPN（Virtual Private Network）は、インターネット上に構築された仮想的な専用ネットワークです。適切です。\n\n選択肢dですが、DMZの説明です。DMZ（DeMilitarized Zone：非武装地帯）とは、企業から見たネットワークの外部と内部の中間的な区域のことです。記述の内容はDHCPプロトコルのものです。不適切です。'
  },
  {
    id: 13,
    number: 13,
    year: '令和4年 第17問',
    title: '情報セキュリティリスク対応',
    question: '情報セキュリティマネジメントにおいては、情報セキュリティリスクアセスメントの結果に基づいて、リスク対応のプロセスを決定する必要がある。リスク対応に関する記述とその用語の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\nａ　リスクを伴う活動の停止やリスク要因の根本的排除により、当該リスクが発生しない状態にする。\n\nｂ　リスク要因の予防や被害拡大防止措置を講じることにより、当該リスクの発生確率や損失を減じる。\n\nｃ　リスクが受容可能な場合や対策費用が損害額を上回るような場合には、あえて何も対策を講じない。\n\nｄ　保険に加入したり、業務をアウトソーシングするなどして、他者との間でリスクを分散する。',
    options: [
      'ａ：リスク移転　　ｂ：リスク低減　　ｃ：リスク回避　　ｄ：リスク保有',
      'ａ：リスク移転　　ｂ：リスク保有　　ｃ：リスク回避　　ｄ：リスク低減',
      'ａ：リスク回避　　ｂ：リスク移転　　ｃ：リスク保有　　ｄ：リスク低減',
      'ａ：リスク回避　　ｂ：リスク低減　　ｃ：リスク保有　　ｄ：リスク移転',
      'ａ：リスク低減　　ｂ：リスク回避　　ｃ：リスク移転　　ｄ：リスク保有'
    ],
    correctAnswer: 3,
    explanation: 'リスク回避：リスク源を除去して、リスクの発現確率をゼロにすること\n\nリスク低減：リスクの発生率または損失をできる限り小さくするように対策すること\n\nリスク移転：リスクを別の組織体と共有することにより、影響を分散させること\n\nリスク保有：発生頻度や損失が小さいリスクを許容範囲内のリスクとして受け入れること。'
  },
  {
    id: 14,
    number: 14,
    year: '平成29年 第22問',
    title: '他人受入率(FAR)と本人拒否率(FRR)',
    question: 'ATMを使った金融取引やPCへのログインの際など、本人確認のための生体認証技術が広く社会に普及している。認証の精度は、他人受入率(FAR：False Acceptance Rate)と本人拒否率(FRR：False Rejection Rate)によって決まる。この2つはトレードオフ関係にあり、一般に片方を低く抑えようとすると、もう片方は高くなる。\n\nFARとFRRに関する以下の文章の空欄Ａ〜Ｄに入る語句の組み合わせとして、最も適切なものを下記の解答群から選べ。\n\nａ　（　Ａ　）が低いと安全性を重視したシステムになり、（　Ｂ　）が低いと利用者の利便性を重視したシステムになる。\n\nｂ　ATMでの生体認証では、（　Ｃ　）が十分低くなるように設定されている。\n\nｃ　なりすましを防止するには、（　Ｄ　）を低く抑えることに重点をおけばよい。',
    options: [
      'Ａ：FAR　　Ｂ：FRR　　Ｃ：FAR　　Ｄ：FAR',
      'Ａ：FAR　　Ｂ：FRR　　Ｃ：FRR　　Ｄ：FRR',
      'Ａ：FRR　　Ｂ：FAR　　Ｃ：FAR　　Ｄ：FAR',
      'Ａ：FRR　　Ｂ：FAR　　Ｃ：FRR　　Ｄ：FRR'
    ],
    correctAnswer: 0,
    explanation: '他人受入率(FAR)：他人が認証したにも関わらず、本人と認証されてしまう確率のことです。\n\n本人拒否率(FRR)：本人であるにも関わらず、他人と判断されて拒否されてしまう確率です。\n\nａ　FARが低いと安全性を重視したシステムになり、FRRが低いと利用者の利便性を重視したシステムになります。\n\nｂ　ATMでは、他人を受け入れてしまうと金銭的な被害が広がってしまうため、FARが十分低いことが求められます。\n\nｃ　なりすましを防止するためには、FARを低く抑えることに重点をおけばよいです。'
  }
];

export default function App() {
  console.log('App initialized');
  
  const [screen, setScreen] = useState('start');
  const [selectedMode, setSelectedMode] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [quizHistory, setQuizHistory] = useState([]);
  const [reviewMarked, setReviewMarked] = useState({});

  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('quizHistory');
      const savedReview = localStorage.getItem('reviewMarked');
      if (savedHistory) {
        const parsed = JSON.parse(savedHistory);
        console.log('Loaded history:', parsed);
        setQuizHistory(parsed || []);
      }
      if (savedReview) {
        const parsed = JSON.parse(savedReview);
        console.log('Loaded review:', parsed);
        setReviewMarked(parsed || {});
      }
    } catch (e) {
      console.error('Error loading from localStorage:', e);
      setQuizHistory([]);
      setReviewMarked({});
    }
  }, []);

  const saveHistory = (newHistory) => {
    try {
      localStorage.setItem('quizHistory', JSON.stringify(newHistory));
      console.log('Saved history:', newHistory);
    } catch (e) {
      console.error('Error saving to localStorage:', e);
    }
  };

  const saveReview = (newReview) => {
    try {
      localStorage.setItem('reviewMarked', JSON.stringify(newReview));
      console.log('Saved review:', newReview);
    } catch (e) {
      console.error('Error saving review:', e);
    }
  };

  const getFilteredQuestions = () => {
    if (selectedMode === 'all') return quizData;
    if (selectedMode === 'wrong') {
      return quizData.filter(q => {
        const history = quizHistory.find(h => h.questionId === q.id);
        return history && !history.correct;
      });
    }
    if (selectedMode === 'review') {
      return quizData.filter(q => reviewMarked[q.id]);
    }
    return quizData;
  };

  const handleStartQuiz = (mode) => {
    setSelectedMode(mode);
    setCurrentQuestionIndex(0);
    setAnswered(false);
    setSelectedAnswer(null);
    setScreen('quiz');
    console.log('Started quiz with mode:', mode);
  };

  const handleAnswerSelect = (index) => {
    if (answered) return;
    setSelectedAnswer(index);
    setAnswered(true);

    const filteredQ = getFilteredQuestions();
    const currentQ = filteredQ[currentQuestionIndex];
    const isCorrect = index === currentQ.correctAnswer;

    const newHistory = [...quizHistory];
    const existingIndex = newHistory.findIndex(h => h.questionId === currentQ.id);
    const historyEntry = {
      questionId: currentQ.id,
      correct: isCorrect,
      selectedAnswer: index,
      timestamp: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      newHistory[existingIndex] = historyEntry;
    } else {
      newHistory.push(historyEntry);
    }
    setQuizHistory(newHistory);
    saveHistory(newHistory);
    console.log('Answer submitted:', historyEntry);
  };

  const handleToggleReview = (questionId) => {
    const newReview = { ...reviewMarked };
    if (newReview[questionId]) {
      delete newReview[questionId];
    } else {
      newReview[questionId] = true;
    }
    setReviewMarked(newReview);
    saveReview(newReview);
    console.log('Review toggled for question:', questionId);
  };

  const handleNextQuestion = () => {
    const filteredQ = getFilteredQuestions();
    if (currentQuestionIndex < filteredQ.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setAnswered(false);
      setSelectedAnswer(null);
    } else {
      setScreen('complete');
    }
  };

  const handleReset = () => {
    setScreen('start');
    setSelectedMode(null);
    setCurrentQuestionIndex(0);
    setAnswered(false);
    setSelectedAnswer(null);
    console.log('Quiz reset');
  };

  if (screen === 'start') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full space-y-12">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center gap-3 mb-6">
              <BookOpen size={40} className="text-cyan-400" />
              <h1 className="text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                過去問セレクト演習
              </h1>
            </div>
            <p className="text-gray-300 text-xl">4-4 インターネットとセキュリティ</p>
            <p className="text-gray-400 text-sm mt-4">全14問の問題で知識を確認しよう</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={() => handleStartQuiz('all')}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-between group"
            >
              <span className="text-lg">すべての問題を解く</span>
              <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>

            <button
              onClick={() => handleStartQuiz('wrong')}
              className="w-full bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-between group"
              disabled={quizHistory.filter(h => !h.correct).length === 0}
            >
              <span className="text-lg">前回不正解の問題のみ ({quizHistory.filter(h => !h.correct).length})</span>
              <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>

            <button
              onClick={() => handleStartQuiz('review')}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105 flex items-center justify-between group"
              disabled={Object.keys(reviewMarked).length === 0}
            >
              <span className="text-lg">要復習の問題のみ ({Object.keys(reviewMarked).length})</span>
              <ChevronRight size={24} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>

          <button
            onClick={() => setScreen('history')}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
          >
            履歴を確認
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'history') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-3 mb-8">
            <button onClick={handleReset} className="hover:bg-slate-700 p-2 rounded-lg transition">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <h1 className="text-3xl font-bold">履歴管理</h1>
          </div>

          <div className="grid gap-4">
            {quizData.map(q => {
              const history = quizHistory.find(h => h.questionId === q.id);
              const isReview = reviewMarked[q.id];
              return (
                <div key={q.id} className="bg-slate-700 rounded-lg p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {history && (
                        history.correct ? (
                          <Check size={20} className="text-green-400" />
                        ) : (
                          <X size={20} className="text-red-400" />
                        )
                      )}
                      <div>
                        <h3 className="font-bold text-lg">問題 {q.number}: {q.title}</h3>
                        <p className="text-gray-300 text-sm">{q.year}</p>
                      </div>
                    </div>
                    {isReview && <span className="bg-amber-500 px-3 py-1 rounded-full text-sm font-bold">要復習</span>}
                  </div>
                  {history && (
                    <p className="text-sm text-gray-300">
                      {history.correct ? '✓ 正解' : '✗ 不正解'} - {new Date(history.timestamp).toLocaleString('ja-JP')}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <button
            onClick={handleReset}
            className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all mt-8"
          >
            メニューに戻る
          </button>
        </div>
      </div>
    );
  }

  if (screen === 'quiz') {
    const filteredQuestions = getFilteredQuestions();
    if (filteredQuestions.length === 0) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
          <div className="text-center space-y-6">
            <h2 className="text-2xl font-bold">対象の問題がありません</h2>
            <button onClick={handleReset} className="bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-3 px-6 rounded-xl">
              メニューに戻る
            </button>
          </div>
        </div>
      );
    }

    const currentQuestion = filteredQuestions[currentQuestionIndex];
    const history = quizHistory.find(h => h.questionId === currentQuestion.id);
    const isReview = reviewMarked[currentQuestion.id];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <button onClick={handleReset} className="hover:bg-slate-700 p-2 rounded-lg transition">
              <ChevronRight size={24} className="rotate-180" />
            </button>
            <div className="text-center">
              <p className="text-gray-400">問題 {currentQuestionIndex + 1} / {filteredQuestions.length}</p>
              <h2 className="text-2xl font-bold mt-2">{currentQuestion.year}</h2>
            </div>
            <div className="text-sm bg-slate-700 px-4 py-2 rounded-lg">
              {Math.round((currentQuestionIndex + 1) / filteredQuestions.length * 100)}%
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl p-8 space-y-6">
            <div>
              <h3 className="text-xl font-bold text-cyan-400 mb-3">{currentQuestion.title}</h3>
              <p className="text-white whitespace-pre-line leading-relaxed text-lg">{currentQuestion.question}</p>
            </div>

            <div className="space-y-3">
              {currentQuestion.options.map((option, index) => (
                <button
                  key={index}
                  onClick={() => !answered && handleAnswerSelect(index)}
                  className={`w-full p-4 rounded-lg font-semibold text-left transition-all transform hover:scale-102 ${
                    selectedAnswer === index
                      ? index === currentQuestion.correctAnswer
                        ? 'bg-green-500 text-white shadow-lg scale-102'
                        : 'bg-red-500 text-white shadow-lg scale-102'
                      : answered && index === currentQuestion.correctAnswer
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-600 hover:bg-slate-500'
                  } ${answered && selectedAnswer !== index && index !== currentQuestion.correctAnswer ? 'opacity-75' : ''}`}
                  disabled={answered}
                >
                  <div className="flex items-start gap-3">
                    <span className="font-bold text-lg min-w-6">{String.fromCharCode(65 + index)}</span>
                    <span>{option}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {answered && (
            <div className={`rounded-xl p-6 space-y-4 ${selectedAnswer === currentQuestion.correctAnswer ? 'bg-green-900 border-2 border-green-400' : 'bg-red-900 border-2 border-red-400'}`}>
              <div className="flex items-center gap-3">
                {selectedAnswer === currentQuestion.correctAnswer ? (
                  <>
                    <Check size={28} className="text-green-400" />
                    <span className="text-xl font-bold text-green-400">正解です！</span>
                  </>
                ) : (
                  <>
                    <X size={28} className="text-red-400" />
                    <span className="text-xl font-bold text-red-400">不正解です</span>
                  </>
                )}
              </div>

              <div className="bg-black bg-opacity-30 rounded-lg p-4 space-y-2 max-h-64 overflow-y-auto">
                <h4 className="font-bold text-cyan-300">解説</h4>
                <p className="text-gray-100 whitespace-pre-line leading-relaxed text-sm">{currentQuestion.explanation}</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id={`review-${currentQuestion.id}`}
                  checked={isReview}
                  onChange={() => handleToggleReview(currentQuestion.id)}
                  className="w-5 h-5"
                />
                <label htmlFor={`review-${currentQuestion.id}`} className="font-semibold cursor-pointer">
                  要復習に追加
                </label>
              </div>

              <button
                onClick={handleNextQuestion}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-3 px-6 rounded-xl transition-all"
              >
                {currentQuestionIndex === filteredQuestions.length - 1 ? '完了する' : '次の問題へ'}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  if (screen === 'complete') {
    const filteredQuestions = getFilteredQuestions();
    const correctCount = filteredQuestions.filter(q => {
      const history = quizHistory.find(h => h.questionId === q.id);
      return history?.correct;
    }).length;
    const percentage = Math.round((correctCount / filteredQuestions.length) * 100);

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white p-6 flex items-center justify-center">
        <div className="max-w-2xl w-full text-center space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">お疲れ様でした！</h1>
            <div className="bg-gradient-to-r from-cyan-500 to-blue-600 rounded-xl p-8 space-y-4">
              <p className="text-6xl font-bold">{percentage}%</p>
              <p className="text-2xl">{correctCount} / {filteredQuestions.length} 正解</p>
            </div>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleReset}
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 text-white font-bold py-4 px-6 rounded-xl transition-all transform hover:scale-105"
            >
              メニューに戻る
            </button>
            <button
              onClick={() => {
                setCurrentQuestionIndex(0);
                setAnswered(false);
                setSelectedAnswer(null);
                setScreen('quiz');
              }}
              className="w-full bg-slate-700 hover:bg-slate-600 text-white font-bold py-3 px-6 rounded-xl transition-all"
            >
              もう一度解く
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}