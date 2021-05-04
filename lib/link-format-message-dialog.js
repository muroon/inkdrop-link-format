'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';
import { actions } from "inkdrop"

export default class LinkFormatMessageDialog extends React.Component {

  componentWillMount () {
    // Events subscribed to in Inkdrop's system can be easily cleaned up with a CompositeDisposable
    this.subscriptions = new CompositeDisposable();

    // Register command that toggles this dialog
    this.subscriptions.add(inkdrop.commands.add(document.body, {
      'link-format:toggle': () => this.toggle()
    }));

    //this.setState({ words: 0 });
  }

  componentWillUnmount () {
    this.subscriptions.dispose();
  }

  render() {
    const { MessageDialog } = inkdrop.components.classes;
    return (
      <MessageDialog ref='dialog' title='LinkFormat'>
        LinkFormat was toggled!
      </MessageDialog>
    );
  }

  toggle() {
    /*
    console.log('WordCount was toggled!');
    const { dialog } = this.refs;
    if (!dialog.isShown) {
      const { editingNote } = inkdrop.store.getState();
      if(editingNote) {
        const { body } = editingNote;
        const words = body.split(/\s+/).length;
        this.setState({ words });
        dialog.showDialog();
      }
    } else {
      dialog.dismissDialog();
    }
     */

    (async function() {
      const editor = inkdrop.getActiveEditor();
      const {cm} = editor;
      let text = cm.getSelection();
      if (text) {
        console.log("selected text");
        text = await fetchAndReplaceText(text);
        console.log(text);
        cm.replaceSelection(text);
      } else {
        console.log("all text");
        // all text
        const {editingNote} = inkdrop.store.getState();
        if (!editingNote) {
          return;
        }
        const {body} = editingNote;
        text = await fetchAndReplaceText(body.toString());
        console.log(text);
        inkdrop.store.dispatch(actions.editingNote.update({ body: text }));
        //inkdrop.store.dispatch(actions.editor.change(true));
      }
      //cm.replaceSelection("["+title+"]("+url+")");
    })();
  }
}

async function fetchAndReplaceText(text) {
  const words = text.split(/\s+/);
  if (words.length == 0) {
    return text;
  }

  // get urls
  let urls = new Array();
  let urlMap = new Map();
  for (let i = 0; i < words.length; i++) {
    const url = words[i];
    // https://, http://
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

  // fetch and get titles
  urlMap = new Map();
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
  })

  // replace
  urls.map(url => {
    console.log(`url:${url}`);
    if (!urlMap.has(url)) {
      console.log(`skip. url:${url}`);
      return;
    }
    const value = urlMap.get(url);
    console.log(`before replace. value:${value}`);
    text = replace(text, url, value);
  });

  return text;
}

function replace(text, target, replaceText) {
  const index = text.indexOf(target);
  console.log(index);
  if (index < 0 || index + target.length >= text.length) {
    // 除外
    return text;
  }

  if (index > 0 && text[index - 1] === "(") {
    // 除外
    return text.substr(0, index + target.length) + replace(text.substr(index + target.length), target, replaceText);
  }

  text = text.substr(0, index) + replaceText + replace(text.substr(index + target.length), target, replaceText);

  return text;
}


