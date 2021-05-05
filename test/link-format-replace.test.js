import {getUrls, replace} from "../lib/link-format-replace";

test('getUrls Test', () => {
    const words = ["http://github.com/", "https://github.com/", "https://github.com/muroon", "word"];
    const answer = ["https://github.com/muroon", "https://github.com/", "http://github.com/"];
    expect(getUrls(words)).toEqual(answer);
});

test('replace Test', () => {
    const text = "https://target.com [no-change](https://target.com) https://other.com";
    const target = "https://target.com";
    const replaceText = "target-site";
    const answer = "target-site [no-change](https://target.com) https://other.com";
    expect(replace(text, target, replaceText)).toEqual(answer);
});

