chrome.webRequest.onCompleted.addListener(
    logURL,
    {urls: ['*://*/api/v2/medias/modes/*']} // https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Match_patterns
);

var videos = {};

// Known UbiCast servers:
// https://ubicast.visio.univ-rennes2.fr/
// https://mediaserver.htwk-leipzig.de
// https://mediaserver.uni-bonn.de/
// https://mediaserver.dhbw-loerrach.de/
// https://mediaserver.univ-nantes.fr/
// https://webtv.univ-rouen.fr/
//
// https://enseignement.medias.polytechnique.fr/ (no public content)
// https://rec.unil.ch/ (no public content)
// https://mediaserver.unilim.fr (no public content)
// https://ubicast.hep-bejune.ch/ (no public content)
// https://qsblc.ucd.ie/ (no public content)
// https://video.uu.nl/ (no public content)
// https://kurssi.tv (no public content, login only)
// https://mediaserver.capture.port.ac.uk/ (no public content, certificate broken)


function logURL(requestDetails) {

    if (requestDetails.tabId != -1 && requestDetails.url.match(/[?&]html5=([_a-z0-9]+)/)) { // only process requests performed by the user to prevent endless loops of our own requests
        
        var newURL = requestDetails.url.replace(/_?m3u8/, '');
        var website = requestDetails.url.match(/https?:\/\/([a-z0-9.-]+)/)[1];

        fetch(newURL) // fetch media URLs
        .then(response => response.json())
        .then(json => {
            var oid = newURL.match(/[?&]oid=([a-z0-9]*)&/)[1];
            var metadataURL = requestDetails.url.substring(0, requestDetails.url.indexOf('modes/')) + 'get/?oid=' + oid;
            
            fetch(metadataURL) // fetch metadata
            .then(response => response.json())
            .then(metadata => {
                // metadata.info.title
                // metadata.info.slug
                // metadata.info.thumb
                // metadata.info.add_date
                // metadata.info.creation
                // metadata.info.speaker
                // metadata.info.license
                // metadata.info.parent_oid
                // metadata.info.parent_title
                // metadata.info.views

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
                        // audio_2522_wWaO87dhvz.mp3
                        // v125cff193a4d47sulfe_0.mp3
                        var filename = json[format].tracks[0].url.match(/\/([a-zA-Z0-9_]+\.mp3)/)[1];

                        videos[oid][format] = {
                            "url": json[format].tracks[0].url,
                            "filename": filename,
                            "bitrate": json[format].tracks[0].bitrate
                        }
                    } else {
                        // media_720_iQHbVjAogN.mp4
                        // v125f4626ff5acspfbub_720.mp4
                        // 01 2014_07_16 Trevor Wooley 2pm-3pm_low.mp4
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
