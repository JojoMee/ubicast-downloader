# UbiCast Downloader
[UbiCast](https://ubicast.eu) is a commercial mediaserver/videostreaming software that "creates a unique learning experiences for students" and is especially popular in universities in France and Germany. This addons displays direct URLs to video and audio files you are watching via a UbiCast server.
There are several servers with publicly available content:
* [mediaserver.univ-nantes.fr](https://mediaserver.univ-nantes.fr/)
* [webtv.univ-rouen.fr](https://webtv.univ-rouen.fr/)
* [ubicast.visio.univ-rennes2.fr](https://ubicast.visio.univ-rennes2.fr/)
* [mediaserver.htwk-leipzig.de](https://mediaserver.htwk-leipzig.de)
* [mediaserver.uni-bonn.de](https://mediaserver.uni-bonn.de/)
* [mediaserver.dhbw-loerrach.de](https://mediaserver.dhbw-loerrach.de/)

**⚠ Important: Please note that the videos may be subject to a copyright of the respective institution or speaker!**

## Installation
Download this repository as zip archive and extract it. The installation process then depends on your browser:
* **Mozilla Firefox**: Open `about:debugging`, switch to "This Firefox" and click on "Load Temporary Add-on". Select the file `manifest.json` from the folder you've just extracted.
* **Google Chrome**: Open `chrome://extensions` and enable the switch "Developer mode" in the upper right corner. Now you can click on "Load unpacked" and select the folder you've just extracted.
* **Microsoft Edge**: Open `edge://extensions` and enable the switch "Developer mode" in the lower left corner. Now you can click on "Load unpacked" and select the folder you've just extracted.
* **Internet Explorer**: Ain't gonna happen lol :D

## How does it work?
If you click on a video on a UbiCast server, your browser loads the URL to the correspondig [HLS playlist](https://en.wikipedia.org/wiki/HTTP_Live_Streaming) by querying the following API endpoint:
`https://ubicast-server.tld/api/v2/medias/modes/?oid=<oid>&html5=<format-list>`.

This addon listens to requests to this API endpoint by matching URLs against this regex: `*://*/api/v2/medias/modes/*`. The parameter `html5` specifies a list of formats, sepereated by underscores, in which you want to receive the video e.g.: `html5=webm_ogg_ogv_oga_mp4_m4a_mp3_m3u8`. Normally this list contains the format `m3u8` (HLS playlist) to stream the video with the webplayer. If you want a direct link to the video or audio file, you can just remove the media type `m3u8` from the query. That's what this addon does.

Every video has a unique ID which is called `oid`. With this `oid` you are also able to query meta information from the api endpoint `https://ubicast-server.tld/api/v2/medias/get/?oid=<oid>`.
These meta information are queried to display the correct video title and, if available, the speakers name and licensing information.

## About this project
This addon is my first open source project and also the first WebExtension I've developed. So please be patient with me 😄 I've mainly developed for Firefox but principally it should run in any browser with support for WebExtensions.

My goals were to keep the addon as lightweight and simple as possible. That's why I avoided using large javascript libraries like React or CSS frameworks like Bootstrap. I'm also using Emoji instead of icons (that could actually be a dumb idea). Also I thought it would be nice to support an [automatic darkmode with CSS media queries](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-color-scheme).

The logo/icon is made from [this arrow](https://svgsilh.com/image/24846.html) ([CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)) in UbiCast's [blue background color](https://www.ubicast.eu) [`#274BB1`](https://www.color-hex.com/color/274bb1) and the font [Public Sans UltraBold](https://github.com/uswds/public-sans) ([SIL Open Font License](https://github.com/uswds/public-sans/blob/develop/LICENSE.md)).

## ToDos
* more testing 😅
* design improvements, especially for Chromium based browsers
* add button to remove a single video or all videos from the list
* add option to only show video from the current tab
* buttons to copy command lines for `wget`, `curl` and `ffmpeg`
* display number of found videos next to the icon
* process playlists/channels
* internationalization