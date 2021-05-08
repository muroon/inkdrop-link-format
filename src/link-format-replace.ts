"use babel";

export async function fetchAndReplaceText(text: string): Promise<string> {
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
        if (value == undefined) {
            return;
        }
        text = replace(text, url, value);
    });

    return text;
}

export function getUrls(words: string[]): string[] {
    const urls = new Array<string>();
    const urlMap = new Map<string, string>();
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

export function fetchAllUrls(urls: string[]): Promise<PromiseSettledResult<{url: string, text:string}>[]> {
    return Promise.allSettled(urls.map(url => {
        return fetch(url).then(res => {
            if (!res.ok) {
                return Promise.reject(`url:${url}, Status Code:${res.status}`)
            }
            return Promise.resolve(res.text());
        }).then(text => {
            const newdom = new DOMParser().parseFromString(text, 'text/html');
            const title = newdom.head.getElementsByTagName('title')[0].text;
            return Promise.resolve({url: url, text:`[${title}](${url})`});
        });
    }));
}

async function getUrlAndTitleMap(urls: string[]): Promise<Map<string, string>> {
    const urlMap = new Map<string, string>();
    await fetchAllUrls(urls).then(results => {
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

export function replace(text: string, target: string, replaceText: string): string {
    const index = text.indexOf(target);
    const nextStart = index + target.length;
    if (index < 0 || nextStart > text.length) {
        return text;
    }

    if (index > 2 && text.substr(index - 2, 2) == "](" && text.length > nextStart && text[nextStart] == ")" ) {
        return text.substr(0, nextStart) + replace(text.substr(nextStart), target, replaceText);
    }

    return text.substr(0, index) + replaceText + replace(text.substr(nextStart), target, replaceText);
}
