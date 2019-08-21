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
