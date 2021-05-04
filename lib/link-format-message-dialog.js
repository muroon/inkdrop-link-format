'use babel';

import * as React from 'react';
import { CompositeDisposable } from 'event-kit';

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

    const editor = inkdrop.getActiveEditor();
    const {cm} = editor;
    let text = cm.getSelection();
    if (text) {
      console.log("selected text");
      text = fetchAndReplaceText(text);
      cm.replaceSelection(text);
    } else {
      /*
      console.log("all text");
      // all text
      const { editingNote } = inkdrop.store.getState();
      if (!editingNote) {
        return;
      }
      const { body } = editingNote;
      const words = body.split(/\s+/);
      console.log(words);
       */
    }
    //cm.replaceSelection("["+title+"]("+url+")");
  }
}

function fetchAndReplaceText(text) {
  const words = text.split(/\s+/);
  if (words.length == 0) {
    return text;
  }

  let urlMap = new Map();
  let urls = new Array();

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

  urlMap = new Map();
  urls.map((url) => {
    fetch(url).then(res=>res.text()).then(text => {
      var newdom = new DOMParser().parseFromString(text, 'text/html');
      const title = newdom.head.getElementsByTagName('title')[0].text;
      urlMap.set(url, `[${title}](${url})`);

      // paste the URL with title into the Note
      //const editor = inkdrop.getActiveEditor();
      //const {cm} = editor;
      //cm.replaceSelection("["+title+"]("+url+")");
    }).catch((error) => {
      urlMap.set(url, "");
      console.error('Error:', error);
    });
  });

  while(urlMap.size < urls.length) {
  }

  // replace
  urls.map(url => {
    if (!urlMap.has(url) || urlMap[url].length == 0) {
      return;
    }
    const value = urlMap[url];
    text = replace(text, url, value);
  });

  return text;
}

function replace(text, target, replaceText) {
  const index = text.indexOf(target);
  console.log(index);
  if (index === -1) {
    // 除外
    return text;
  }

  //const lastIndex = index + target.length;:w

  if (index > 0 && text[index - 1] === "(") {
    // 除外
    return text.substr(0, index + target.length) + replace(text.substr(index + target.length), target, replaceText);
  }

  text = text.substr(0, index) + replaceText + replace(text.substr(index + target.length), target, replaceText);

  return text;
}


