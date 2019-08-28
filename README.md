# Web Video Capture Example

Demos:

* [Basic Demo](https://koron.github.io/web-video-capture/index.html)

    How to try:

    1. Open demo site with latest Chrome
    2. "Start Capture"
    3. "Record Start"
    4. Wait a moment
    5. "Record Stop"
    6. A ".webm" file is written automatically

* [Quality Test](https://koron.github.io/web-video-capture/quality/index.html)


## Convert .webm to .mp4

Requires [ffmpeg 4.2](https://ffmpeg.org) or above.

How to convert:

```console
$ ffmpeg -i 2019-08-14T04_15_29.612Z.webm out.mp4
```

Check those formats:

```
$ ffprobe 2019-08-14T04_15_29.612Z.webm
ffprobe version N-94530-g8cd96e13ee Copyright (c) 2007-2019 the FFmpeg developers
  built with gcc 9.1.1 (GCC) 20190807

(...snip...)

Input #0, h264, from 'tmp/2019-08-14T04_15_29.612Z.webm':
  Duration: N/A, bitrate: N/A
    Stream #0:0: Video: h264 (Constrained Baseline), yuv420p(progressive), 300x192, 25 fps, 25 tbr, 1200k tbn, 50 tbc

$ ffprobe out.mp4
ffprobe version N-94530-g8cd96e13ee Copyright (c) 2007-2019 the FFmpeg developers
  built with gcc 9.1.1 (GCC) 20190807

(...snip...)

Input #0, mov,mp4,m4a,3gp,3g2,mj2, from 'tmp/out.mp4':
  Metadata:
    major_brand     : isom
    minor_version   : 512
    compatible_brands: isomiso2avc1mp41
    encoder         : Lavf58.30.100
  Duration: 00:00:09.56, start: 0.840000, bitrate: 20 kb/s
    Stream #0:0(und): Video: h264 (High) (avc1 / 0x31637661), yuv420p, 300x192, 17 kb/s, 25 fps, 25 tbr, 12800 tbn, 50 tbc (default)
    Metadata:
      handler_name    : VideoHandler

$
```

## How does it work?

Webブラウザによる画面キャプチャーと動画エンコードを実装するための要素は大きくわ
けて3つあります。

1. `navigator.mediaDevices.getDisplayMedia()` (以下 `getDisplayMedia()`)
2. `MediaStream`
3. `MediaRecorder`

`getDisplayMedia()` はキャプチャ対象の `MediaStream` を返します。その
`MediaStream` を `MediaRecorder` のコンストラクタに渡すと動画エンコードが始まり
ます。エンコードされたデータは `Blob` として `MediaRecorder.ondataavailable` を
通じて渡されます。あとはこのデータを単に連結してファイルとして保存すれば、画面
キャプチャーと動画エンコードは完了です。

`getDisplayMedia()` は `Promise` を返します。この `Promise` は `MediaStream` と
共に `resolve()` されます。`getDisplayMedia()` はユーザーにキャプチャする画面を
選択するダイアログが表示し、その選択が確定すると、その画面の `MediaStream` と共
に `Promise.resolve()` されます。これはユーザーが知らないうちに任意の画面をキャ
プチャすることがないようにとの、セキュリティ上の配慮であると考えられます。

`MediaStream` は `getDisplayMedia()` から取得できるほかに、`<video>` 要素や
`<canvas>` 要素等からも取得できます。そのため動画エンコードの対象は多岐に渡りま
す。

`getDisplayMedia()` には以下のようなオプションを指定できます。その定義の詳細は
[MediaStreamConstraints][msc] を参照してください。ただし `getDisplayMedia()` で
は元の画面のサイズに関わらず `video.width` 及び ``video.height` で指定したサイ
ズにフィットした `MediaStream` になります。また `audio` はキャプチャーできませ
ん。

```json
{
  "video": { "width": 640, "height": 480 },
  "audio": false
}
```

`MediaRecorder` のコンストラクタには `MediaStream` を渡します。同時にオプション
を指定する必要がありますが、その定義の詳細は [MediaRecorder][mr] の `options`を
参照してください。特に `mimeType` で動画ファイルの形式=コンテナとコーデックを指
定することが重要です。サポートするファイル形式はブラウザによって異なりますが
Chrome に限定すれば以下の3つのいずれかを選択するのが良いでしょう。

* `video/webm; codecs=h264`
* `video/webm; codecs=vp8`
* `video/webm; codecs=vp9`

コンテナはいずれも WEBM 形式で CODEC は H264, VP8 および VP9 です。CODECによる
エンコード品質の違いはあまり感じられませんが、いずれも高解像で低周波の画像をう
まく扱う傾向があります。裏を返せば低解像で高周波の画像は苦手です。おおざっぱで
すが実例でいうとファミコンなどレトロゲームの画面を低解像・高周波、PlayStation4
など最新の3Dを用いたゲームを高解像・低周波と考えてください。

最後に具体的な手順を書き下します。

1. `getDisplayMedia()` で `MediaStream` を受け取る `Promise` を作成する
2. `Promise.then` もしくは `await` で `MediaStream` を受け取る
3. `MediaStream` から `MediaRecorder` を作成する
4. `MediaRecorder` の `ondataavailable` および `onstop` にイベントハンドラを設定する

    動画データの保存方法に応じて異なる実装になる。

5. `MediaRecorder.start()` で録画とエンコードを開始する
6. `MediaRecorder.ondataavailable` が呼び出され `Blob` を受け取る

    別サーバに保存するか、ファイルに書き出すかはアプリ次第。ただしブラウザでは
    ファイルに書き出せないので、一時的にメモリ上に貯めて `onstop` 時に連結して
    書き出す必要が出てくる。

7. `MediaRecorder.stop()` で録画を停止する
8. `MediaRecorder.onstop` が呼び出されるので、後始末をする。

    ファイルへの保存ならば、ここでメモリ上に貯めた `Blob` を連結し、`<a>` 要素
    の `href` へ `URL.createObjectURL()` を設定してダウンロードさせる。例:

    ```javascript
    let blob = new Blob(chunks, { 'type': 'video/webm' });
    let anchor = document.createElement("a");
    anchor.download = new Date().toISOString() + ".webm";
    anchor.href = URL.createObjectURL(blob);
    anchor.click();
    ```

[msc]:https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamConstraints
[mr]:https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder/MediaRecorder
