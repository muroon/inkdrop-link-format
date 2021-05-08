import {getUrls, replace, fetchAllUrls} from "../link-format-replace";
import { enableFetchMocks } from 'jest-fetch-mock'
enableFetchMocks();

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

    const text2 = "https://target.com";
    const answer2 = "target-site";
    expect(replace(text2, target, replaceText)).toEqual(answer2);

    const text3 = "](https://target.com";
    const answer3 = "](target-site";
    expect(replace(text3, target, replaceText)).toEqual(answer3);

    const text4 = "[no-change](https://target.com)";
    const answer4 = text4;
    expect(replace(text4, target, replaceText)).toEqual(answer4);

    const text5 = "https://t.com";
    const answer5 = text5;
    expect(replace(text5, target, replaceText)).toEqual(answer5);
});

test('fetchAllUrls Test', () => {
    const response = `<!DOCTYPE html>
<html lang="en">
  <head>
    <title>my-test-ok</title>
  </head>
  <body>
     contents
  </body>
</html>
`;

    const headers = {"Content-Type": "text/html; charset=UTF-8"};

    beforeEach(() => {
        fetchMock.resetMocks();
    });

    const urls = [
        "https://my-test-ok.com/",  // OK Site
        "https://my-test-ng.com/" // NG Site
    ];

    fetchMock.mockResponses(
        [
            response, {status: 200, headers: headers}
        ],
        [
            "NotFound", {status: 404, headers: headers}
        ]
    );

    const answer = [
        {"status": "fulfilled", "value": {"text": `[my-test-ok](${urls[0]})`, "url": urls[0]}},
        {"status": "rejected", "reason": `url:${urls[1]}, Status Code:404`}
    ];

    expect(fetchAllUrls(urls)).resolves.toEqual(answer);
});
