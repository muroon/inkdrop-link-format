"use babel";

export async function fetchAndReplaceText(text) {
    const words = text.split(/\s+/);
    if (words.length == 0) {
        return text;
    }

    // get urls
    const urls = getUrls(words);

    // fetch and get titles
    const urlMap = await getUrlAndTitleMap(urls);

    // replace
    urls.map(url => {
        if (!urlMap.has(url)) {
            return;
        }
        const value = urlMap.get(url);
        text = replace(text, url, value);
    });

    return text;
}

export function getUrls(words) {
    const urls = new Array();
    const urlMap = new Map();
    for (let i = 0; i < words.length; i++) {
        const url = words[i];
        // check url
        if (url.substr(0, 8) !== "https://" && url.substr(0, 7) !== "http://") {
            continue;
        }

        if (urlMap.has(url)) {
            continue;
        }

        urlMap.set(url, "");
        urls.push(url);
    }
    urls.sort((a, b) => {
        return b.length - a.length;
    });

    return urls;
}

export async function getUrlAndTitleMap(urls) {
    const urlMap = new Map();
    await Promise.allSettled(urls.map(url => {
        return fetch(url).then(res => res.text()).then(text => {
            const newdom = new DOMParser().parseFromString(text, 'text/html');
            const title = newdom.head.getElementsByTagName('title')[0].text;
            return Promise.resolve({url: url, text:`[${title}](${url})`});
        });
    })).then(results => {
        results.forEach(result => {
            if (result.status == "fulfilled") {
                urlMap.set(result.value.url, result.value.text);
            } else if (result.status == "rejected") {
                console.error('Error:', result.reason);
            }
        });
    });

    return urlMap;
}

export function replace(text, target, replaceText) {
    const index = text.indexOf(target);
    if (index < 0 || index + target.length >= text.length) {
        return text;
    }

    if (index > 0 && text[index - 1] === "(") {
        return text.substr(0, index + target.length) + replace(text.substr(index + target.length), target, replaceText);
    }

    return text.substr(0, index) + replaceText + replace(text.substr(index + target.length), target, replaceText);
}