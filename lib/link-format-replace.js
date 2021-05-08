"use babel";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
export function fetchAndReplaceText(text) {
    return __awaiter(this, void 0, void 0, function () {
        var words, urls, urlMap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    words = text.split(/\s+/);
                    if (words.length == 0) {
                        return [2 /*return*/, text];
                    }
                    urls = getUrls(words);
                    return [4 /*yield*/, getUrlAndTitleMap(urls)];
                case 1:
                    urlMap = _a.sent();
                    // replace
                    urls.map(function (url) {
                        if (!urlMap.has(url)) {
                            return;
                        }
                        var value = urlMap.get(url);
                        if (value == undefined) {
                            return;
                        }
                        text = replace(text, url, value);
                    });
                    return [2 /*return*/, text];
            }
        });
    });
}
export function getUrls(words) {
    var urls = new Array();
    var urlMap = new Map();
    for (var i = 0; i < words.length; i++) {
        var url = words[i];
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
    urls.sort(function (a, b) {
        return b.length - a.length;
    });
    return urls;
}
export function fetchAllUrls(urls) {
    return Promise.allSettled(urls.map(function (url) {
        return fetch(url).then(function (res) {
            if (!res.ok) {
                return Promise.reject("url:" + url + ", Status Code:" + res.status);
            }
            return Promise.resolve(res.text());
        }).then(function (text) {
            var newdom = new DOMParser().parseFromString(text, 'text/html');
            var title = newdom.head.getElementsByTagName('title')[0].text;
            return Promise.resolve({ url: url, text: "[" + title + "](" + url + ")" });
        });
    }));
}
function getUrlAndTitleMap(urls) {
    return __awaiter(this, void 0, void 0, function () {
        var urlMap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    urlMap = new Map();
                    return [4 /*yield*/, fetchAllUrls(urls).then(function (results) {
                            results.forEach(function (result) {
                                if (result.status == "fulfilled") {
                                    urlMap.set(result.value.url, result.value.text);
                                }
                                else if (result.status == "rejected") {
                                    console.error('Error:', result.reason);
                                }
                            });
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/, urlMap];
            }
        });
    });
}
export function replace(text, target, replaceText) {
    var index = text.indexOf(target);
    var nextStart = index + target.length;
    if (index < 0 || nextStart > text.length) {
        return text;
    }
    if (index > 2 && text.substr(index - 2, 2) == "](" && text.length > nextStart && text[nextStart] == ")") {
        return text.substr(0, nextStart) + replace(text.substr(nextStart), target, replaceText);
    }
    return text.substr(0, index) + replaceText + replace(text.substr(nextStart), target, replaceText);
}
