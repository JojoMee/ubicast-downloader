chrome.webRequest.onCompleted.addListener(
    logURL,
    {urls: ['*://*/api/v2/medias/modes/*']} // see: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
);

var videos = {};

function logURL(requestDetails) {

    if (requestDetails.tabId != -1 && requestDetails.url.match(/[?&]html5=([_a-z0-9]+)/)) { // only process requests performed by the user (are bound to a tab id) to prevent endless loops of our own requests
        
        // remove 'm3u8' from format list in parameter 'html5'. Example URL: https://ubicast-server.tld/api/v2/medias/modes/?oid=<oid>&html5=webm_ogg_ogv_oga_mp4_m4a_mp3_m3u8
        var newURL = requestDetails.url.replace(/_?m3u8/, '');

        var website = requestDetails.url.match(/https?:\/\/([a-z0-9.-]+)/)[1];

        fetch(newURL) // fetch media URLs
        .then(response => response.json())
        .then(json => {
            var oid = newURL.match(/[?&]oid=([a-z0-9]*)&/)[1];

            // create URL to fetch metadata for oid. Example URL: https://ubicast-server.tld/api/v2/medias/get/?oid=<oid>
            var metadataURL = requestDetails.url.substring(0, requestDetails.url.indexOf('modes/')) + 'get/?oid=' + oid;
            
            fetch(metadataURL) // fetch metadata
            .then(response => response.json())
            .then(metadata => {
                /* available metadata:
                    - metadata.info.title
                    - metadata.info.slug
                    - metadata.info.thumb
                    - metadata.info.add_date
                    - metadata.info.creation
                    - metadata.info.speaker
                    - metadata.info.license
                    - metadata.info.parent_oid
                    - metadata.info.parent_title
                    - metadata.info.views
                */

                videos[oid] = {
                    "title": metadata.info.title,
                    "duration": json.duration,
                    "date": metadata.info.add_date,
                    "formats": json.names,
                    "speaker": metadata.info.speaker,
                    "license": metadata.info.license,
                    "license_url": metadata.info.license_url,
                    "website": website
                };

                for (index in json.names) {
                    var format = json.names[index];

                    if (format == 'audio') { // TODO handle multiple tracks
                        /* examples for audio file names:
                            - audio_2522_wWaO87dhvz.mp3
                            - v125cff193a4d47sulfe_0.mp3
                        */
                        var filename = json[format].tracks[0].url.match(/\/([a-zA-Z0-9_]+\.mp3)/)[1];

                        videos[oid][format] = {
                            "url": json[format].tracks[0].url,
                            "filename": filename,
                            "bitrate": json[format].tracks[0].bitrate
                        }
                    } else {
                        /* examples for video file names:
                            - media_720_iQHbVjAogN.mp4
                            - v125f4626ff5acspfbub_720.mp4
                            - 01 2014_07_16 Trevor Wooley 2pm-3pm_low.mp4
                        */
                        var filename = json[format].resource.url.match(/\/([\s-_a-zA-Z0-9]+\.mp4)/)[1];

                        videos[oid][format] = {
                            "url": json[format].resource.url,
                            "filename": filename,
                            "bitrate": json[format].resource.bitrate,
                            "width": json[format].resource.width,
                            "height": json[format].resource.height
                        }
                    }
                }
            })
            .catch(err => console.log('Request for metadata failed', err));
        })
        .catch(err => console.log('Request for media URLs failed', err));
    }
}

var port;

function connected(newPort) {
    port = newPort;

    port.onMessage.addListener(function(m) {
        if (m.action == 'request-videos') {
            port.postMessage(videos);
        }
  });
}

chrome.runtime.onConnect.addListener(connected);
