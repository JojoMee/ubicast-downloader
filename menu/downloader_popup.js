var myPort = chrome.runtime.connect();
myPort.postMessage({action: 'request-videos'});

myPort.onMessage.addListener(function(videos) {

    if (Object.entries(videos).length == 0) {
        document.getElementById('video-urls').innerHTML = '<div class="center">No videos found so far</div>';
    } else {
        htmlString = '';

        for (oid in videos) {
            var seconds = Math.floor(videos[oid].duration) % 60;
            var minutes = (Math.floor(videos[oid].duration) - seconds) / 60;

            htmlString += '<div class="video-container">';
            htmlString += '<b>' + videos[oid].title + '</b> (<span class="mono">' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + '</span>)<br>';
            htmlString += '<span class="text-secondary">🌍&nbsp;' + videos[oid].website + '</span> ';

            var date = new Date(videos[oid].date);
            htmlString += '<span class="text-secondary">📅&nbsp;' + date.toLocaleDateString() + '</span><br>';
            
            if (videos[oid].speaker) {
                htmlString += '<span class="text-secondary">✍🏻&nbsp;' + videos[oid].speaker + '</span> ';
            }

            if (videos[oid].license) {
                htmlString += '<span class="text-secondary">📝&nbsp;' + (videos[oid].license_url ? '<a href="' + videos[oid].license_url + '">' + videos[oid].license + '</a>' : videos[oid].license) + '</span>';
            }

            if (videos[oid].speaker || videos[oid].license) {
                htmlString += '<br><br>';
            } else {
                htmlString += '<br>';
            }

            for (index in videos[oid].formats) {
                var format = videos[oid].formats[index];
                var bitrate = Math.round(videos[oid][format].bitrate / 1000);

                if (format == 'audio') {
                    htmlString += '🎧 Audio <span class="text-secondary mono">(' + bitrate + ' kb/s)</span><br>';
                    htmlString += '<a target="_blank" href="' + videos[oid][format].url + '">' + videos[oid][format].filename + '</a><br>';
                } else {
                    htmlString += '🎥 Video <span class="text-secondary mono">(' + format + ', ' + videos[oid][format].width + 'x' + videos[oid][format].height + ', ' + bitrate + ' kb/s)</span><br>';
                    htmlString += '<a target="_blank" href="' + videos[oid][format].url + '">' + videos[oid][format].filename + '</a><br>';
                }
            }

            htmlString += '</div><br>';
        }

        // document.getElementById('video-urls').innerHTML = htmlString;

        var el = document.getElementById('video-urls'); // .innerHTML = htmlString;
        const parser = new DOMParser();
        const parsed = parser.parseFromString(htmlString, `text/html`);
        const tags = parsed.getElementsByTagName(`body`);
        
        el.innerHTML = ``
        for (const tag of tags) {
            el.appendChild(tag);
        }
    }
});

