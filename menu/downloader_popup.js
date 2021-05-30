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
            htmlString += '<b>' + videos[oid].title + '</b><br>';
            htmlString += '<span title="Duration"><span class="material-icons">schedule</span> <span class="mono">' + ('0' + minutes).slice(-2) + ':' + ('0' + seconds).slice(-2) + '</span></span> ';

            if (videos[oid].speaker) {
                htmlString += '<span title="Speaker"><span class="material-icons">record_voice_over</span> ' + videos[oid].speaker + '</span> ';
            }

            var date = new Date(videos[oid].date);
            htmlString += '<span title="Add date"><span class="material-icons">today</span> ' + new Intl.DateTimeFormat(navigator.language, {year: 'numeric', month: '2-digit', day: '2-digit'}).format(date) + '</span><br>';

            htmlString += '<span class="text-secondary" title="UbiCast server"><span class="material-icons">public</span> ' + videos[oid].website + '</span><br>';

            if (videos[oid].license) {
                htmlString += '<span class="text-secondary" title="License"><span class="material-icons">info</span> ' + (videos[oid].license_url ? '<a href="' + videos[oid].license_url + '">' + videos[oid].license + '</a>' : videos[oid].license) + '</span>';
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
                    htmlString += '<span class="material-icons">headphones</span>  Audio<br>';
                    htmlString += '<a target="_blank" href="' + videos[oid][format].url + '">' + videos[oid][format].filename + '</a><br>';
                } else {
                    htmlString += '<span class="material-icons">videocam</span>  Video (' + format + ')<br>';
                    htmlString += '<a target="_blank" href="' + videos[oid][format].url + '">' + videos[oid][format].filename + '</a><br>';
                }
            }

            htmlString += '</div><br>';
        }

        var el = document.getElementById('video-urls');
        const parser = new DOMParser();
        const parsed = parser.parseFromString(htmlString, `text/html`);
        const tags = parsed.getElementsByTagName(`body`);
        
        el.innerHTML = ``
        for (const tag of tags) {
            el.appendChild(tag);
        }
    }
});

